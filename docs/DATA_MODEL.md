# DATA_MODEL - Todo App (초안)

> 근거 문서: docs/PRD.md, docs/TRD.md
> 상태: 초안 (검토 필요)

## 1. 개요

- MVP 기능(F-01 ~ F-05)에 필요한 테이블은 **`todos` 하나**뿐이다.
- 로그인이 없으므로(PRD 범위 밖) 사용자 테이블은 만들지 않는다.
- DB 컬럼 이름은 `snake_case`, TypeScript 필드 이름은 `camelCase`로 쓴다. (예: `created_at` ↔ `createdAt`)

## 2. 테이블: `todos`

할 일 하나가 한 행이다.

- DB: MySQL 8.0.16 이상 (`CHECK` 제약조건이 이 버전부터 실제로 동작한다)
- 문자 인코딩: `utf8mb4` (한글과 이모지를 모두 저장할 수 있다)

| 필드 | 타입 (MySQL) | 제약조건 | 설명 | 관련 기능 |
|------|------|------|------|------|
| `id` | `char(36)` | PK, NOT NULL, 값은 서버 코드에서 `crypto.randomUUID()`로 생성 | 할 일을 구분하는 고유 번호 (UUID 문자열) | F-03, F-04 |
| `title` | `varchar(100)` | NOT NULL, `CHECK (CHAR_LENGTH(title) BETWEEN 1 AND 100)` | 할 일 제목 (1~100자) | F-01 |
| `completed` | `boolean` | NOT NULL, 기본값 `false` | 완료 여부 (`true` = 완료) | F-03 |
| `created_at` | `datetime(3)` | NOT NULL, 기본값 `CURRENT_TIMESTAMP(3)` | 만든 시각 (UTC 기준, 밀리초까지). 최신순 정렬 기준 | F-02 |

### 2.1 설계 메모

- **`id`를 UUID 문자열(`char(36)`)로 정한 이유**: MySQL에는 Postgres 같은 전용 `uuid` 타입이 없어서 36자 문자열로 저장한다. v0.1(브라우저)과 v0.2(서버 메모리)에서도 `crypto.randomUUID()`로 같은 형식의 id를 만들 수 있어, v0.3에서 DB로 옮겨도 형식이 바뀌지 않는다.
- **id를 DB가 아니라 코드에서 만드는 이유**: MySQL은 새로 넣은 행을 바로 돌려주지 않는다. 그래서 id를 미리 만들어 두면 저장한 뒤 그 id로 바로 다시 조회할 수 있다. (TRD 4장 7~8단계)
- **제목 앞뒤 공백**: 저장하기 전에 Zod 규칙에서 잘라낸다(trim). 그래서 DB에는 앞뒤 공백이 없는 제목만 들어간다.
- **제목 길이 검사를 DB에도 두는 이유**: 화면과 서버의 Zod 검사가 1·2차 관문이고, DB의 `CHECK`는 잘못된 값이 저장되지 않게 막는 마지막 안전장치다. `utf8mb4`에서 `varchar(100)`은 바이트가 아니라 글자 수 기준으로 100자다.
- **`boolean`에 대해**: MySQL의 `boolean`은 실제로는 `tinyint(1)`(0 또는 1)로 저장된다. Drizzle이 코드에서 `true`/`false`로 바꿔준다.
- **`created_at`을 `datetime(3)`로 정한 이유**: MySQL에는 시간대 정보를 같이 저장하는 타입이 없다. 그래서 항상 UTC로 저장하기로 약속하고, `(3)`으로 밀리초까지 저장해 같은 초에 만든 할 일도 순서가 구분되게 한다. (`timestamp` 타입은 2038년까지만 저장할 수 있어 쓰지 않는다.)
- **UTC로 맞추는 방법**: DB 연결 설정에서 시간대를 UTC로 지정한다.
- **정렬**: 목록 조회는 `ORDER BY created_at DESC`로 한다. (F-02)
- **수정 시각(`updated_at`)은 두지 않는다**: MVP에는 수정 기능이 없다. v0.4에서 필요하면 추가한다.

## 3. TypeScript 타입 예시

`src/types/`에 두고 화면과 서버가 같이 쓴다.

```ts
// 할 일 하나
export type Todo = {
  id: string;          // UUID 문자열 (36자)
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

- `createdAt`은 DB에서는 날짜 값이지만, API로 주고받을 때 JSON에는 날짜 타입이 없어서 문자열로 바뀐다. 그래서 화면과 서버가 공유하는 타입은 `string`으로 둔다.
- `id`, `completed`, `createdAt`은 서버(DB)가 정하므로 `CreateTodoInput`에는 넣지 않는다.

## 4. 데이터 예시

| id | title | completed | created_at |
|------|------|------|------|
| `3f2b...a1` | 우유 사기 | `0` (false) | 2026-10-23 09:10:00.000 |
| `9c4d...7e` | 보고서 제출 | `1` (true) | 2026-10-23 08:30:00.000 |
