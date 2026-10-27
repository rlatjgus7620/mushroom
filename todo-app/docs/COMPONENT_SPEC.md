# COMPONENT_SPEC - Todo App (초안)

> 근거 문서: docs/PRD.md, docs/API_SPEC.md, docs/DATA_MODEL.md
> 상태: 초안 (검토 필요)

## 1. 공통 원칙

- 화면은 한 페이지(`/`)뿐이다.
- 데이터(할 일 목록)와 API 호출은 **`TodoApp` 한 곳에서만** 관리한다. 나머지 컴포넌트는 Props로 받은 값을 보여주고, 사용자 동작을 함수 Props로 위에 알린다.
- 서버 응답을 받은 뒤에 화면을 바꾼다. 요청이 실패하면 목록은 그대로 두고 오류 문구를 보여준다.
- 요청이 진행 중인 버튼과 체크박스는 비활성화해서 두 번 눌리지 않게 한다.
- `Todo` 타입은 `src/types/`의 것을 쓴다. (DATA_MODEL.md)

## 2. 컴포넌트 트리

```
app/page.tsx (HomePage)            ← 페이지 껍데기
└─ TodoApp                         ← 상태 관리 + API 호출 ('use client')
   ├─ <h1> 할 일 목록
   ├─ TodoForm                     ← 입력창 + 추가 버튼 (F-01)
   ├─ 오류 배너                     ← 추가/전환/삭제 실패 시 (TodoApp 안에서 직접 그림)
   └─ 목록 영역                     ← 로딩 / 불러오기 실패 / 빈 목록 / TodoList 중 하나
      └─ TodoList                  ← 목록 (F-02)
         └─ TodoItem × n           ← 할 일 한 줄: 체크박스 + 제목 + 삭제 버튼 (F-03, F-04)
```

| 컴포넌트 | 파일 | 역할 |
|------|------|------|
| HomePage | `app/page.tsx` | `TodoApp`을 화면에 놓기만 한다. |
| TodoApp | `src/components/TodoApp.tsx` | 목록 상태를 갖고 API를 호출한다. 로딩·오류·빈 목록 상태를 결정한다. |
| TodoForm | `src/components/TodoForm.tsx` | 제목을 입력받고 화면에서 1차 검증을 한다. |
| TodoList | `src/components/TodoList.tsx` | 받은 목록을 순서대로 `TodoItem`으로 그린다. |
| TodoItem | `src/components/TodoItem.tsx` | 할 일 한 개를 보여주고 체크/삭제 동작을 알린다. |

## 3. 컴포넌트별 명세

### 3.1 HomePage

- Props: 없음
- `TodoApp`만 렌더링한다. 데이터를 직접 조회하지 않는다. (TRD 7.1)

### 3.2 TodoApp

- Props: 없음
- 내부 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `todos` | `Todo[]` | 화면에 보여줄 할 일 목록 (최신순) |
| `loadState` | `"loading" \| "error" \| "ready"` | 목록 불러오기 상태 |
| `actionError` | `string \| null` | 추가/전환/삭제 실패 시 보여줄 문구 |
| `isAdding` | `boolean` | 추가 요청 진행 중 여부 |
| `pendingIds` | `string[]` | 전환/삭제 요청이 진행 중인 할 일의 id |

- 동작

| 언제 | 하는 일 | 결과 |
|------|------|------|
| 화면이 처음 열릴 때 | `GET /api/todos` 호출 | 성공: `todos` 채우고 `ready` / 실패: `error` |
| "다시 시도" 클릭 | `GET /api/todos` 다시 호출 | 위와 같음 |
| `TodoForm`이 추가 요청 | `POST /api/todos` 호출 | 성공(`201`): 받은 할 일을 목록 맨 위에 넣고 `true` 반환 / 실패: `actionError` 설정, `false` 반환 |
| `TodoItem`이 전환 요청 | `PATCH /api/todos/{id}` 호출 | 성공(`200`): 해당 항목을 받은 값으로 바꿈 / 실패: `actionError` 설정 |
| `TodoItem`이 삭제 요청 | `DELETE /api/todos/{id}` 호출 | 성공(`204`): 목록에서 뺌 / 실패: `actionError` 설정 |
| 새 요청을 시작할 때 | `actionError`를 비움 | 이전 오류 배너가 사라짐 |

- 실패 시 `actionError`에 넣는 문구
  - 서버가 오류 응답을 준 경우: 응답의 `error.message`를 그대로 쓴다. (API_SPEC.md 1.3)
  - 서버에 닿지 못한 경우(네트워크 오류): "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."

> v0.1에서는 API 없이 `todos` 상태만 직접 바꾼다. 로딩·오류 상태는 v0.2부터 쓴다.

### 3.3 TodoForm (F-01)

```ts
type TodoFormProps = {
  // 추가할 제목을 위로 전달한다. 성공하면 true, 실패하면 false를 돌려받는다.
  onAdd: (title: string) => Promise<boolean>;
  // 추가 요청이 진행 중이면 true
  isSubmitting: boolean;
};
```

- 구성: 입력창(placeholder "할 일을 입력하세요"), "추가" 버튼, 입력 오류 문구 자리

| 사용자 동작 | 결과 |
|------|------|
| 제목 입력 후 "추가" 클릭 또는 Enter | Zod 규칙(앞뒤 공백 제거 후 1~100자)으로 검사한다. 통과하면 `onAdd` 호출 |
| 빈 제목 / 공백만 입력 후 추가 | `onAdd`를 부르지 않고 입력창 아래에 "제목을 입력해주세요." 표시 |
| 100자 초과 입력 후 추가 | `onAdd`를 부르지 않고 입력창 아래에 "제목은 1~100자로 입력해주세요." 표시 |
| 추가 요청 진행 중 | 버튼 문구 "추가 중...", 입력창과 버튼 비활성화 |
| `onAdd`가 `true` 반환 | 입력창을 비우고 입력창에 포커스를 둔다 |
| `onAdd`가 `false` 반환 | 입력한 제목을 그대로 둔다 (다시 시도할 수 있게) |
| 입력 오류 문구가 보이는 상태에서 다시 입력 | 입력 오류 문구를 지운다 |

### 3.4 TodoList (F-02)

```ts
type TodoListProps = {
  todos: Todo[];                                       // 이미 최신순으로 정렬된 목록
  pendingIds: string[];                                // 요청 진행 중인 항목 id
  onToggle: (id: string, completed: boolean) => void;  // 완료 여부 변경 요청
  onDelete: (id: string) => void;                      // 삭제 요청
};
```

- `todos`를 받은 순서 그대로 `TodoItem`으로 그린다. 직접 정렬하지 않는다. (정렬은 서버가 한다)
- 각 항목의 `key`는 `todo.id`를 쓴다.
- 빈 목록일 때는 `TodoApp`이 `TodoList` 대신 빈 상태 문구를 그린다. 그래서 `TodoList`는 항상 1개 이상의 항목을 받는다.

### 3.5 TodoItem (F-03, F-04)

```ts
type TodoItemProps = {
  todo: Todo;
  isPending: boolean;                                  // 이 항목의 요청이 진행 중이면 true
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};
```

- 구성: 체크박스, 제목, "삭제" 버튼

| 사용자 동작 | 결과 |
|------|------|
| 체크박스 클릭 | `onToggle(todo.id, !todo.completed)` 호출 |
| "삭제" 버튼 클릭 | `onDelete(todo.id)` 호출 (확인 창 없음, 7장 참고) |
| 요청 진행 중 (`isPending`) | 체크박스와 삭제 버튼 비활성화 |

- 표시 규칙
  - `completed`가 `true`면 체크박스가 체크되고, 제목에 취소선과 회색 글자를 적용한다.
  - 접근성 이름(테스트에서도 이 이름으로 찾는다)
    - 체크박스: `"{제목} 완료"` (예: "우유 사기 완료")
    - 삭제 버튼: `"{제목} 삭제"` (예: "우유 사기 삭제")

## 4. 화면 상태별 문구

목록 영역은 아래 상태 중 하나만 보여준다.

| 상태 | 조건 | 보여줄 내용 |
|------|------|------|
| 로딩 | `loadState === "loading"` | "할 일을 불러오는 중..." |
| 불러오기 실패 | `loadState === "error"` | "할 일을 불러오지 못했습니다." + "다시 시도" 버튼 |
| 빈 목록 | `ready`이고 `todos`가 비어 있음 | "아직 할 일이 없어요. 첫 할 일을 추가해 보세요." |
| 목록 | `ready`이고 `todos`가 1개 이상 | `TodoList` |

- 로딩 중과 불러오기 실패 상태에서도 `TodoForm`은 보이지만 비활성화한다. 목록을 모르는 상태에서 추가하면 순서가 꼬일 수 있기 때문이다.

## 5. 오류 문구 정리

| 어디에 | 상황 | 문구 |
|------|------|------|
| 입력창 아래 | 빈 제목 / 공백만 입력 | 제목을 입력해주세요. |
| 입력창 아래 | 100자 초과 | 제목은 1~100자로 입력해주세요. |
| 목록 영역 | 목록 불러오기 실패 | 할 일을 불러오지 못했습니다. |
| 오류 배너 | 추가/전환/삭제 실패 (서버 응답 있음) | 서버의 `error.message` (예: 할 일을 찾을 수 없습니다.) |
| 오류 배너 | 추가/전환/삭제 실패 (네트워크 오류) | 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요. |

- 입력 오류 문구와 오류 배너에는 `role="alert"`를 붙여 화면 낭독기가 읽게 한다.
- 로딩 문구에는 `role="status"`를 붙인다.

## 6. 버튼·입력창 문구

| 요소 | 문구 |
|------|------|
| 페이지 제목 | 할 일 목록 |
| 입력창 placeholder | 할 일을 입력하세요 |
| 추가 버튼 | 추가 (진행 중: 추가 중...) |
| 삭제 버튼 | 삭제 |
| 다시 시도 버튼 | 다시 시도 |

## 7. 열린 질문

- 삭제 전에 확인 창을 띄울 것인가? (PRD 열린 질문과 같음) 이 문서는 우선 **확인 창 없이 바로 삭제**하는 것으로 적었다.
