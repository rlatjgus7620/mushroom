import { render, screen } from "@testing-library/react";
import { TodoList } from "@/components/TodoList";
import type { Todo } from "@/types/todo";

// 테스트용 할 일을 만든다. 바꾸고 싶은 필드만 넘기면 된다.
function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    title: "우유 사기",
    completed: false,
    createdAt: "2026-10-23T09:10:00.000Z",
    ...overrides,
  };
}

// TEST_CASES.md 1.1의 할 일 A(나중에 만듦), B(먼저 만듦)
const todoA = makeTodo();
const todoB = makeTodo({
  id: "00000000-0000-4000-8000-000000000002",
  title: "보고서 제출",
  completed: true,
  createdAt: "2026-10-23T08:30:00.000Z",
});

describe("TodoList", () => {
  test("CMP-20 받은 목록 [A, B]를 A, B 순서로 2개 보여준다", () => {
    const onToggle = jest.fn<void, [string, boolean]>();
    const onDelete = jest.fn<void, [string]>();

    render(
      <TodoList todos={[todoA, todoB]} pendingIds={[]} onToggle={onToggle} onDelete={onDelete} />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("우유 사기");
    expect(items[1]).toHaveTextContent("보고서 제출");
  });
});
