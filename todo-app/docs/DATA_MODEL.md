# DATA_MODEL - Todo App (초안)

> 근거 문서: docs/PRD.md, docs/TRD.md
> 상태: 초안 (검토 필요)

## 1. 개요

- MVP 기능(F-01 ~ F-05)에 필요한 테이블은 **`todos` 하나**뿐이다.
- 로그인이 없으므로(PRD 범위 밖) 사용자 테이블은 만들지 않는다.
- DB 컬럼과 파이썬 필드 이름은 `snake_case`, API JSON과 TypeScript 필드 이름은 `camelCase`로 쓴다. (예: `created_at` ↔ `createdAt`)

## 2. 테이블: `todos`

할 일 하나가 한 행이다.

- DB: PostgreSQL 16 (13 이상이면 `gen_random_uuid()`를 별도 설치 없이 쓸 수 있다)
- 문자 인코딩: `UTF8` (PostgreSQL 기본값. 한글과 이모지를 모두 저장할 수 있다)

| 필드 | 타입 (PostgreSQL) | 제약조건 | 설명 | 관련 기능 |
|------|------|------|------|------|
| `id` | `uuid` | PK, NOT NULL, 기본값 `gen_random_uuid()` | 할 일을 구분하는 고유 번호 | F-03, F-04 |
| `title` | `varchar(100)` | NOT NULL, `CHECK (char_length(title) BETWEEN 1 AND 100)` | 할 일 제목 (1~100자) | F-01 |
| `completed` | `boolean` | NOT NULL, 기본값 `false` | 완료 여부 (`true` = 완료) | F-03 |
| `created_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 만든 시각. 최신순 정렬 기준 | F-02 |

### 2.1 설계 메모

- **`id`를 `uuid`로 정한 이유**: v0.1(브라우저 `crypto.randomUUID()`)과 v0.2(파이썬 `uuid.uuid4()`)에서도 같은 형식의 id를 만들 수 있어, v0.3에서 DB로 옮겨도 형식이 바뀌지 않는다.
- **id를 DB가 만드는 이유**: PostgreSQL은 `INSERT ... RETURNING`으로 저장한 행을 바로 돌려준다. 그래서 id와 생성 시각을 DB 기본값에 맡기고, 저장 결과를 그대로 응답에 쓸 수 있다. (TRD 4장 7~8단계)
- **제목 앞뒤 공백**: 저장하기 전에 화면(Zod)과 서버(Pydantic) 검증에서 잘라낸다(trim). 그래서 DB에는 앞뒤 공백이 없는 제목만 들어간다.
- **제목 길이 검사를 DB에도 두는 이유**: 화면과 서버 검사가 1·2차 관문이고, DB의 `CHECK`는 잘못된 값이 저장되지 않게 막는 마지막 안전장치다. `varchar(100)`은 바이트가 아니라 글자 수 기준으로 100자다.
- **`timestamptz`를 쓰는 이유**: 시간대 정보까지 저장해서 서버 위치(배포 지역)가 바뀌어도 시각이 어긋나지 않는다. 마이크로초까지 저장하므로 같은 초에 만든 할 일도 순서가 구분된다.
- **정렬**: 목록 조회는 `ORDER BY created_at DESC`로 한다. (F-02)
- **수정 시각(`updated_at`)은 두지 않는다**: MVP에는 수정 기능이 없다. v0.4에서 필요하면 추가한다.
- **테이블 만들기**: 직접 SQL을 실행하지 않고 Alembic 마이그레이션으로 만든다. (TRD 2.2)

## 3. TypeScript 타입 예시 (화면)

`src/types/`에 두고 화면 컴포넌트와 API 호출 함수가 같이 쓴다.

```ts
// 할 일 하나
export type Todo = {
  id: string;          // UUID 문자열
  title: string;       // 1~100자
  completed: boolean;  // 완료 여부
  createdAt: string;   // ISO 8601 형식 시각 (예: "2026-10-23T09:00:00.000Z")
};

// 할 일 추가 요청 (F-01): 사용자는 제목만 보낸다
export type CreateTodoInput = {
  title: string;
};

// 완료 상태 변경 요청 (F-03)
export type UpdateTodoInput = {
  completed: boolean;
};

// API 오류 응답 (모든 API가 같은 모양으로 돌려준다)
export type ApiErrorResponse = {
  error: {
    code: "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";
    message: string; // 사용자에게 보여줄 한국어 메시지
  };
};
```

- `createdAt`은 DB에서는 날짜 값이지만, API로 주고받을 때 JSON에는 날짜 타입이 없어서 문자열로 바뀐다. 그래서 화면 타입은 `string`으로 둔다.
- `id`, `completed`, `createdAt`은 서버(DB)가 정하므로 `CreateTodoInput`에는 넣지 않는다.

## 4. Pydantic 스키마 예시 (서버)

`backend/app/`에 두고 FastAPI 라우터가 요청 검사와 응답 변환에 쓴다. 필드는 위 TypeScript 타입과 1:1로 맞춘다.

| Pydantic 스키마 | 맞춰야 하는 TypeScript 타입 | 용도 |
|------|------|------|
| `TodoCreate` | `CreateTodoInput` | 추가 요청 검사: `title` (앞뒤 공백 제거 후 1~100자) |
| `TodoUpdate` | `UpdateTodoInput` | 완료 전환 요청 검사: `completed` (boolean) |
| `TodoRead` | `Todo` | 응답: `id`, `title`, `completed`, `created_at` → JSON에서는 `createdAt` |

```python
class TodoCreate(BaseModel):
    title: str  # 앞뒤 공백을 잘라낸 뒤 1~100자

class TodoUpdate(BaseModel):
    completed: bool  # "true" 같은 문자열은 거절한다 (strict)

class TodoRead(BaseModel):
    id: UUID
    title: str
    completed: bool
    created_at: datetime  # JSON으로 나갈 때 이름은 createdAt
```

- 정의되지 않은 필드는 무시한다. (API_SPEC.md 1장)
- `completed`는 strict 모드로 받아, `"true"`(문자열)나 `1`(숫자)을 `true`로 바꿔 주지 않고 오류로 처리한다. (API_SPEC.md 5장)
- `created_at` ↔ `createdAt` 이름 바꾸기는 Pydantic의 별칭(alias) 설정으로 한다.

## 5. 데이터 예시

| id | title | completed | created_at |
|------|------|------|------|
| `3f2b...a1` | 우유 사기 | `false` | 2026-10-23 09:10:00+00 |
| `9c4d...7e` | 보고서 제출 | `true` | 2026-10-23 08:30:00+00 |
