# TEST_CASES - Todo App (초안)

> 근거 문서: docs/PRD.md, docs/TRD.md, docs/DATA_MODEL.md, docs/API_SPEC.md, docs/COMPONENT_SPEC.md
> 상태: 초안 (검토 필요)

## 1. 공통 사항

- **도구**: API는 pytest + FastAPI TestClient, 컴포넌트는 Jest + React Testing Library (CLAUDE.md)
- **위치**: API 테스트는 `backend/tests/test_*.py`, 컴포넌트 테스트는 `__tests__/components/*.test.tsx`
- **ID 규칙**: API 테스트는 `API-xx`, 컴포넌트 테스트는 `CMP-xx`
- **API 테스트**: FastAPI 서버를 띄우지 않고 TestClient로 요청을 보내 응답을 확인한다. 테스트마다 데이터를 비운 상태에서 시작한다.
  - v0.3부터는 개발용과 분리된 테스트용 PostgreSQL DB를 쓴다.
  - "서버 오류" 상황은 FastAPI의 의존성 바꿔치기(dependency override)로 DB 함수가 실패하게 만든다.
- **컴포넌트 테스트**: `fetch`를 흉내 내서(mock) 서버 응답을 정한다. 요소는 화면에 보이는 문구와 접근성 이름(예: "우유 사기 완료")으로 찾는다.
- **적용 버전**: API 테스트와 `TodoApp`의 로딩·오류 테스트는 v0.2부터 쓴다. `TodoForm`, `TodoList`, `TodoItem` 테스트는 v0.1부터 쓴다.
- 테스트를 삭제하거나 skip하지 않는다.

### 1.1 테스트용 데이터

| 이름 | 값 |
|------|------|
| 할 일 A | `title: "우유 사기"`, `completed: false`, 나중에 만듦 |
| 할 일 B | `title: "보고서 제출"`, `completed: true`, 먼저 만듦 |
| 없는 id | 형식은 맞지만 DB에 없는 UUID (예: `00000000-0000-4000-8000-000000000000`) |
| 잘못된 id | UUID 형식이 아닌 문자열 (예: `abc`) |
| 100자 제목 | `"가"` 100개 |
| 101자 제목 | `"가"` 101개 |

---

## 2. API 테스트

### 2.1 공통

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-01 | 모든 API 오류 응답 | 아무 API에서 오류(400/404/500)가 남 | 본문이 `{ "error": { "code": string, "message": string } }` 모양이다 |
| API-02 | 모든 API 500 응답 | DB 함수가 오류를 던짐 | `message`는 "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."이고, DB 오류 내용은 응답에 없다 |
| API-03 | `Todo` 응답 | 할 일을 돌려주는 모든 API | `id`, `title`, `completed`, `createdAt` 네 필드만 있고, `createdAt`은 `Z`로 끝나는 ISO 8601 문자열이다 |

### 2.2 목록 조회 `GET /api/todos` (F-02)

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-10 | GET /api/todos | 할 일 B, A 순서로 만든 뒤 조회 | `200`, `[A, B]` 순서(최신순)로 돌려준다 |
| API-11 | GET /api/todos | 할 일이 하나도 없음 | `200`, 빈 배열 `[]` |
| API-12 | GET /api/todos (에러) | DB 함수가 실패함 | `500`, `code: "INTERNAL_ERROR"` |

### 2.3 추가 `POST /api/todos` (F-01)

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-20 | POST /api/todos | `{ "title": "우유 사기" }` | `201`, `title: "우유 사기"`, `completed: false`, `id`와 `createdAt`이 채워진 `Todo` |
| API-21 | POST /api/todos | `{ "title": "  우유 사기  " }` (앞뒤 공백) | `201`, 저장된 `title`은 `"우유 사기"` |
| API-22 | POST /api/todos | 1자 제목 `{ "title": "a" }` | `201` |
| API-23 | POST /api/todos | 100자 제목 | `201`, 100자 그대로 저장 |
| API-24 | POST /api/todos | 앞뒤 공백 포함 102자, 잘라내면 100자 | `201` (길이는 잘라낸 뒤 기준) |
| API-25 | POST /api/todos | 한글·이모지 제목 `{ "title": "운동하기 💪" }` | `201`, 제목이 깨지지 않고 그대로 저장 |
| API-26 | POST /api/todos | `{ "title": "우유 사기", "completed": true, "id": "x" }` | `201`, `completed: false`이고 `id`는 서버가 만든 UUID (보낸 값 무시) |
| API-27 | POST → GET | 추가한 뒤 목록 조회 | 새 할 일이 목록 맨 앞에 있다 |

**에러**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-30 | POST /api/todos | 본문이 올바른 JSON이 아님 (`{ title: `) | `400`, `VALIDATION_ERROR`, "요청 형식이 올바르지 않습니다." |
| API-31 | POST /api/todos | `{}` (`title` 없음) | `400`, `VALIDATION_ERROR`, "제목을 입력해주세요." |
| API-32 | POST /api/todos | `{ "title": 123 }` | `400`, `VALIDATION_ERROR`, "제목을 입력해주세요." |
| API-33 | POST /api/todos | `{ "title": "" }` | `400`, `VALIDATION_ERROR`, "제목을 입력해주세요." |
| API-34 | POST /api/todos | `{ "title": "   " }` (공백만) | `400`, `VALIDATION_ERROR`, "제목을 입력해주세요." |
| API-35 | POST /api/todos | 101자 제목 | `400`, `VALIDATION_ERROR`, "제목은 1~100자로 입력해주세요." |
| API-36 | POST → GET | API-30 ~ API-35 요청 뒤 목록 조회 | 아무것도 저장되지 않았다 |
| API-37 | POST /api/todos | DB 함수가 실패함 | `500`, `INTERNAL_ERROR` |

### 2.4 완료 전환 `PATCH /api/todos/{id}` (F-03)

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-40 | PATCH /api/todos/{id} | 할 일 A에 `{ "completed": true }` | `200`, `completed: true`인 A. `id`, `title`, `createdAt`은 그대로 |
| API-41 | PATCH /api/todos/{id} | 할 일 B에 `{ "completed": false }` | `200`, `completed: false`인 B |
| API-42 | PATCH /api/todos/{id} | 할 일 B(이미 완료)에 `{ "completed": true }` | `200`, `completed: true` (같은 값이어도 오류 아님) |
| API-43 | PATCH → GET | 전환한 뒤 목록 조회 | 바뀐 값이 유지되고, 목록 순서는 바뀌지 않는다 |
| API-44 | PATCH /api/todos/{id} | `{ "completed": true, "title": "바꿈" }` | `200`, `title`은 바뀌지 않는다 (보낸 값 무시) |

**에러**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-50 | PATCH /api/todos/{id} | 본문이 올바른 JSON이 아님 | `400`, `VALIDATION_ERROR`, "요청 형식이 올바르지 않습니다." |
| API-51 | PATCH /api/todos/{id} | `{}` (`completed` 없음) | `400`, `VALIDATION_ERROR`, "완료 여부 값이 올바르지 않습니다." |
| API-52 | PATCH /api/todos/{id} | `{ "completed": "true" }` (문자열) | `400`, `VALIDATION_ERROR`, "완료 여부 값이 올바르지 않습니다." |
| API-53 | PATCH /api/todos/{id} | 없는 id에 `{ "completed": true }` | `404`, `NOT_FOUND`, "할 일을 찾을 수 없습니다." |
| API-54 | PATCH /api/todos/{id} | 잘못된 id(`abc`)에 `{ "completed": true }` | `404`, `NOT_FOUND` |
| API-55 | PATCH /api/todos/{id} | 없는 id에 `{}` (본문도 잘못됨) | `400`, `VALIDATION_ERROR` (본문 검사가 먼저) |
| API-56 | PATCH /api/todos/{id} | DB 함수가 실패함 | `500`, `INTERNAL_ERROR` |

### 2.5 삭제 `DELETE /api/todos/{id}` (F-04)

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-60 | DELETE /api/todos/{id} | 할 일 A 삭제 | `204`, 응답 본문 없음 |
| API-61 | DELETE → GET | A 삭제 뒤 목록 조회 | 목록에 A가 없고 B는 남아 있다 |

**에러**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| API-70 | DELETE /api/todos/{id} | 같은 할 일을 두 번 삭제 | 두 번째 요청은 `404`, `NOT_FOUND` |
| API-71 | DELETE /api/todos/{id} | 없는 id | `404`, `NOT_FOUND`, "할 일을 찾을 수 없습니다." |
| API-72 | DELETE /api/todos/{id} | 잘못된 id(`abc`) | `404`, `NOT_FOUND` |
| API-73 | DELETE /api/todos/{id} | DB 함수가 실패함 | `500`, `INTERNAL_ERROR` |

### 2.6 데이터 유지 (F-05)

| ID | 대상 | 상황 | 기대 결과 | 버전 |
|------|------|------|------|------|
| API-80 | 서버 메모리 저장 | 할 일 추가 뒤 다시 조회 (새로고침과 같음) | 추가한 할 일이 남아 있다 | v0.2 |
| API-81 | DB 저장 | 할 일 추가 → DB 연결을 끊고 다시 연결(서버 재시작과 같음) → 조회 | 추가한 할 일이 남아 있다 | v0.3 |

---

## 3. 컴포넌트 테스트

### 3.1 TodoForm (F-01)

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-01 | TodoForm | 처음 화면 | placeholder "할 일을 입력하세요"인 입력창과 "추가" 버튼이 보인다 |
| CMP-02 | TodoForm | "우유 사기" 입력 후 "추가" 클릭 | `onAdd("우유 사기")`가 한 번 호출된다 |
| CMP-03 | TodoForm | "우유 사기" 입력 후 Enter | `onAdd("우유 사기")`가 한 번 호출된다 |
| CMP-04 | TodoForm | "  우유 사기  " 입력 후 추가 | `onAdd("우유 사기")` (앞뒤 공백 제거된 값) |
| CMP-05 | TodoForm | 100자 입력 후 추가 | `onAdd`가 호출되고 오류 문구는 없다 |
| CMP-06 | TodoForm | `onAdd`가 `true`를 돌려줌 | 입력창이 비워지고 입력창에 포커스가 있다 |
| CMP-07 | TodoForm | `isSubmitting: true` | 버튼 문구가 "추가 중..."이고 입력창과 버튼이 비활성화된다 |

**에러**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-10 | TodoForm | 빈 입력창에서 "추가" 클릭 | `onAdd`가 호출되지 않고 "제목을 입력해주세요."가 `role="alert"`로 보인다 |
| CMP-11 | TodoForm | 공백만 입력 후 추가 | `onAdd`가 호출되지 않고 "제목을 입력해주세요."가 보인다 |
| CMP-12 | TodoForm | 101자 입력 후 추가 | `onAdd`가 호출되지 않고 "제목은 1~100자로 입력해주세요."가 보인다 |
| CMP-13 | TodoForm | 입력 오류 문구가 보이는 상태에서 다시 입력 | 오류 문구가 사라진다 |
| CMP-14 | TodoForm | `onAdd`가 `false`를 돌려줌 | 입력한 제목이 입력창에 그대로 남아 있다 |
| CMP-15 | TodoForm | `isSubmitting: true`에서 Enter | `onAdd`가 호출되지 않는다 |

### 3.2 TodoList (F-02)

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-20 | TodoList | `todos: [A, B]` | A, B 순서로 2개 항목이 보인다 |
| CMP-21 | TodoList | `todos: [B, A]` (일부러 오래된 순서) | B, A 순서 그대로 보인다 (직접 정렬하지 않음) |
| CMP-22 | TodoList | `pendingIds: [A의 id]` | A 항목만 비활성화되고 B는 사용할 수 있다 |

### 3.3 TodoItem (F-03, F-04)

**정상**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-30 | TodoItem | 미완료 할 일 A | 체크박스("우유 사기 완료")가 체크되지 않았고 제목에 취소선이 없다 |
| CMP-31 | TodoItem | 완료된 할 일 B | 체크박스("보고서 제출 완료")가 체크되어 있고 제목에 취소선이 있다 |
| CMP-32 | TodoItem | A의 체크박스 클릭 | `onToggle(A의 id, true)` 호출 |
| CMP-33 | TodoItem | B의 체크박스 클릭 | `onToggle(B의 id, false)` 호출 |
| CMP-34 | TodoItem | "우유 사기 삭제" 버튼 클릭 | 확인 창 없이 `onDelete(A의 id)` 호출 |

**에러·제한**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-40 | TodoItem | `isPending: true` | 체크박스와 삭제 버튼이 비활성화된다 |
| CMP-41 | TodoItem | `isPending: true`에서 체크박스·삭제 버튼 클릭 | `onToggle`, `onDelete`가 호출되지 않는다 |

### 3.4 TodoApp (F-01 ~ F-05)

**목록 불러오기**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-50 | TodoApp | 처음 화면, `GET` 응답 전 | "할 일을 불러오는 중..."이 `role="status"`로 보이고 입력창이 비활성화된다 |
| CMP-51 | TodoApp | `GET`이 `200`, `[A, B]` | 로딩 문구가 사라지고 A, B가 보이며 입력창이 활성화된다 |
| CMP-52 | TodoApp | `GET`이 `200`, `[]` | "아직 할 일이 없어요. 첫 할 일을 추가해 보세요."가 보인다 |
| CMP-53 | TodoApp (에러) | `GET`이 `500` | "할 일을 불러오지 못했습니다."와 "다시 시도" 버튼이 보이고 입력창이 비활성화된다 |
| CMP-54 | TodoApp (에러) | `GET`이 네트워크 오류 | CMP-53과 같다 |
| CMP-55 | TodoApp | 불러오기 실패 후 "다시 시도" 클릭, 이번엔 `200` | `GET`이 다시 호출되고 목록이 보인다 |

**추가 (F-01)**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-60 | TodoApp | 목록 `[B]`에서 "우유 사기" 추가, `POST`가 `201` | `POST /api/todos`에 `{ "title": "우유 사기" }`를 보내고, A가 목록 맨 위에 보인다 |
| CMP-61 | TodoApp | 빈 목록에서 첫 할 일 추가 성공 | 빈 상태 문구가 사라지고 새 할 일이 보인다 |
| CMP-62 | TodoApp (에러) | `POST`가 `400`, `message: "제목은 1~100자로 입력해주세요."` | 오류 배너에 그 문구가 `role="alert"`로 보이고, 목록은 그대로, 입력값도 그대로 |
| CMP-63 | TodoApp (에러) | `POST`가 `500` | 오류 배너에 "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."가 보이고 목록은 그대로 |
| CMP-64 | TodoApp (에러) | `POST`가 네트워크 오류 | 오류 배너에 "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."가 보인다 |

**완료 전환 (F-03)**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-70 | TodoApp | A 체크박스 클릭, `PATCH`가 `200` | `PATCH /api/todos/{A의 id}`에 `{ "completed": true }`를 보내고, A가 체크되며 취소선이 생긴다 |
| CMP-71 | TodoApp | `PATCH` 응답 전 | A의 체크박스와 삭제 버튼이 비활성화된다 |
| CMP-72 | TodoApp (에러) | `PATCH`가 `404` | 오류 배너에 "할 일을 찾을 수 없습니다."가 보이고 A의 체크 상태는 바뀌지 않는다 |
| CMP-73 | TodoApp (에러) | `PATCH`가 네트워크 오류 | 오류 배너에 네트워크 오류 문구가 보이고 체크 상태는 바뀌지 않는다 |

**삭제 (F-04)**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-80 | TodoApp | "우유 사기 삭제" 클릭, `DELETE`가 `204` | `DELETE /api/todos/{A의 id}`를 보내고 A가 목록에서 사라진다 |
| CMP-81 | TodoApp | 마지막 남은 할 일 삭제 성공 | 빈 상태 문구가 보인다 |
| CMP-82 | TodoApp (에러) | `DELETE`가 `404` | 오류 배너에 "할 일을 찾을 수 없습니다."가 보이고 A는 목록에 남아 있다 |
| CMP-83 | TodoApp (에러) | `DELETE`가 `500` | 오류 배너에 500 문구가 보이고 A는 목록에 남아 있다 |

**오류 배너**

| ID | 대상 | 상황 | 기대 결과 |
|------|------|------|------|
| CMP-90 | TodoApp | 오류 배너가 보이는 상태에서 새 요청(추가/전환/삭제) 시작 | 오류 배너가 사라진다 |

---

## 4. 기능별 테스트 연결

| 기능 | API 테스트 | 컴포넌트 테스트 |
|------|------|------|
| F-01 할 일 추가 | API-20 ~ API-37 | CMP-01 ~ CMP-15, CMP-60 ~ CMP-64 |
| F-02 목록 보기 | API-10 ~ API-12 | CMP-20 ~ CMP-22, CMP-50 ~ CMP-55 |
| F-03 완료 전환 | API-40 ~ API-56 | CMP-30 ~ CMP-33, CMP-40 ~ CMP-41, CMP-70 ~ CMP-73 |
| F-04 삭제 | API-60 ~ API-73 | CMP-34, CMP-80 ~ CMP-83 |
| F-05 데이터 유지 | API-80 ~ API-81 | CMP-51 (다시 열었을 때 목록 표시) |
| 공통 | API-01 ~ API-03 | CMP-90 |
