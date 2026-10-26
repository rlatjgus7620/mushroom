# API_SPEC - Todo App (초안)

> 근거 문서: docs/DATA_MODEL.md, docs/TRD.md (7장 API 규칙), docs/PRD.md
> 상태: 초안 (검토 필요)

## 1. 공통 규칙

- **적용 버전**: v0.2부터 사용한다. (v0.1은 API 없이 화면에서만 동작)
- **기본 경로**: `/api/todos`
- **데이터 형식**: 요청과 응답 본문은 JSON이다. 본문이 있는 요청은 `Content-Type: application/json` 헤더를 붙인다.
- **인증**: 없음 (로그인은 PRD 범위 밖)
- **성공 응답**: 데이터를 감싸지 않고 그대로 돌려준다. (`Todo` 또는 `Todo[]`)
- **시각 형식**: `createdAt`은 UTC 기준 ISO 8601 문자열이다. (예: `"2026-10-23T09:10:00.000Z"`)
- **요청에 정의되지 않은 필드**: 무시한다. (예: 추가 요청에 `id`, `completed`를 보내도 쓰지 않는다)

### 1.1 `Todo` 응답 모양

DATA_MODEL.md의 `Todo` 타입과 같다.

```json
{
  "id": "3f2b8c1e-5d4a-4b6e-9f10-2a7c3d8e91a1",
  "title": "우유 사기",
  "completed": false,
  "createdAt": "2026-10-23T09:10:00.000Z"
}
```

### 1.2 오류 응답 모양

모든 API가 오류를 아래 모양으로 돌려준다. (DATA_MODEL.md의 `ApiErrorResponse`)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목은 1~100자로 입력해주세요."
  }
}
```

| code | 상태 코드 | 의미 |
|------|------|------|
| `VALIDATION_ERROR` | `400` | 요청 값이 규칙에 맞지 않음 |
| `NOT_FOUND` | `404` | 해당 id의 할 일이 없음 |
| `INTERNAL_ERROR` | `500` | 서버 내부 오류 (DB 연결 실패 등) |

### 1.3 오류 메시지 목록

`message`는 화면에 그대로 보여줄 수 있는 한국어 문장이다.

| 상황 | code | message |
|------|------|------|
| 본문이 올바른 JSON이 아님 | `VALIDATION_ERROR` | 요청 형식이 올바르지 않습니다. |
| `title`이 없거나 문자열이 아님 | `VALIDATION_ERROR` | 제목을 입력해주세요. |
| `title`이 공백을 잘라낸 뒤 비어 있음 | `VALIDATION_ERROR` | 제목을 입력해주세요. |
| `title`이 공백을 잘라낸 뒤 100자 초과 | `VALIDATION_ERROR` | 제목은 1~100자로 입력해주세요. |
| `completed`가 없거나 boolean이 아님 | `VALIDATION_ERROR` | 완료 여부 값이 올바르지 않습니다. |
| 해당 id의 할 일이 없음 | `NOT_FOUND` | 할 일을 찾을 수 없습니다. |
| 서버 내부 오류 | `INTERNAL_ERROR` | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. |

> 서버 내부 오류의 자세한 원인(DB 오류 내용 등)은 응답에 담지 않는다.

## 2. 엔드포인트 요약

| 기능 | 메서드와 경로 | 성공 | 가능한 오류 |
|------|------|------|------|
| 목록 조회 (F-02) | `GET /api/todos` | `200` | `500` |
| 추가 (F-01) | `POST /api/todos` | `201` | `400`, `500` |
| 완료 전환 (F-03) | `PATCH /api/todos/:id` | `200` | `400`, `404`, `500` |
| 삭제 (F-04) | `DELETE /api/todos/:id` | `204` | `404`, `500` |

---

## 3. 목록 조회 - `GET /api/todos` (F-02)

모든 할 일을 최신순(`createdAt` 내림차순)으로 돌려준다.

### 요청

본문 없음.

```http
GET /api/todos
```

### 응답 `200 OK`

```json
[
  {
    "id": "3f2b8c1e-5d4a-4b6e-9f10-2a7c3d8e91a1",
    "title": "우유 사기",
    "completed": false,
    "createdAt": "2026-10-23T09:10:00.000Z"
  },
  {
    "id": "9c4d2e7f-1b3a-4c5d-8e6f-7a8b9c0d1e7e",
    "title": "보고서 제출",
    "completed": true,
    "createdAt": "2026-10-23T08:30:00.000Z"
  }
]
```

할 일이 하나도 없으면 빈 배열을 돌려준다. (오류가 아님)

```json
[]
```

### 오류

| 상황 | 상태 코드 | code |
|------|------|------|
| DB 연결 실패 등 서버 오류 | `500` | `INTERNAL_ERROR` |

---

## 4. 추가 - `POST /api/todos` (F-01)

새 할 일을 만든다. `id`, `completed`(`false`), `createdAt`은 서버가 정한다.

### 요청

```http
POST /api/todos
Content-Type: application/json
```

```json
{
  "title": "  우유 사기  "
}
```

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| `title` | string | O | 앞뒤 공백을 잘라낸 뒤 1~100자 |

### 응답 `201 Created`

앞뒤 공백이 잘린 제목으로 저장된다.

```json
{
  "id": "3f2b8c1e-5d4a-4b6e-9f10-2a7c3d8e91a1",
  "title": "우유 사기",
  "completed": false,
  "createdAt": "2026-10-23T09:10:00.000Z"
}
```

### 오류

| 상황 | 요청 예시 | 상태 코드 | code |
|------|------|------|------|
| 본문이 올바른 JSON이 아님 | `{ title: ` | `400` | `VALIDATION_ERROR` |
| `title` 없음 | `{}` | `400` | `VALIDATION_ERROR` |
| `title`이 문자열이 아님 | `{ "title": 123 }` | `400` | `VALIDATION_ERROR` |
| 빈 제목 | `{ "title": "" }` | `400` | `VALIDATION_ERROR` |
| 공백만 있는 제목 | `{ "title": "   " }` | `400` | `VALIDATION_ERROR` |
| 100자 초과 | `{ "title": "가가가...(101자)" }` | `400` | `VALIDATION_ERROR` |
| 서버 오류 | - | `500` | `INTERNAL_ERROR` |

오류 응답 예시 (빈 제목):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목을 입력해주세요."
  }
}
```

---

## 5. 완료 전환 - `PATCH /api/todos/:id` (F-03)

할 일의 완료 여부를 보낸 값으로 바꾼다. 같은 값을 다시 보내도 오류가 아니며 결과도 같다.

### 요청

```http
PATCH /api/todos/3f2b8c1e-5d4a-4b6e-9f10-2a7c3d8e91a1
Content-Type: application/json
```

```json
{
  "completed": true
}
```

| 위치 | 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| 경로 | `id` | string | O | 바꿀 할 일의 id |
| 본문 | `completed` | boolean | O | 바꿀 완료 여부 |

### 응답 `200 OK`

바뀐 할 일 전체를 돌려준다.

```json
{
  "id": "3f2b8c1e-5d4a-4b6e-9f10-2a7c3d8e91a1",
  "title": "우유 사기",
  "completed": true,
  "createdAt": "2026-10-23T09:10:00.000Z"
}
```

### 오류

본문 검사를 먼저 하고, 그다음 할 일이 있는지 확인한다.

| 상황 | 요청 예시 | 상태 코드 | code |
|------|------|------|------|
| 본문이 올바른 JSON이 아님 | `{ completed: ` | `400` | `VALIDATION_ERROR` |
| `completed` 없음 | `{}` | `400` | `VALIDATION_ERROR` |
| `completed`가 boolean이 아님 | `{ "completed": "true" }` | `400` | `VALIDATION_ERROR` |
| 해당 id의 할 일이 없음 (이미 삭제됨, 잘못된 id 형식 포함) | - | `404` | `NOT_FOUND` |
| 서버 오류 | - | `500` | `INTERNAL_ERROR` |

오류 응답 예시 (없는 id):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "할 일을 찾을 수 없습니다."
  }
}
```

---

## 6. 삭제 - `DELETE /api/todos/:id` (F-04)

할 일을 삭제한다.

### 요청

본문 없음.

```http
DELETE /api/todos/3f2b8c1e-5d4a-4b6e-9f10-2a7c3d8e91a1
```

| 위치 | 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| 경로 | `id` | string | O | 삭제할 할 일의 id |

### 응답 `204 No Content`

본문 없음.

### 오류

| 상황 | 상태 코드 | code |
|------|------|------|
| 해당 id의 할 일이 없음 (이미 삭제됨, 잘못된 id 형식 포함) | `404` | `NOT_FOUND` |
| 서버 오류 | `500` | `INTERNAL_ERROR` |

오류 응답 예시 (이미 삭제된 할 일):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "할 일을 찾을 수 없습니다."
  }
}
```
