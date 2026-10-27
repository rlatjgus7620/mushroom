import type { Todo } from "@/types/todo";
import { TodoItem } from "./TodoItem";

// 할 일 목록 (F-02)
type TodoListProps = {
  todos: Todo[]; // 이미 최신순으로 정렬된 목록
  pendingIds: string[]; // 요청 진행 중인 항목 id
  onToggle: (id: string, completed: boolean) => void; // 완료 여부 변경 요청
  onDelete: (id: string) => void; // 삭제 요청
};

export function TodoList({ todos, pendingIds, onToggle, onDelete }: TodoListProps) {
  // 받은 순서 그대로 그린다 (정렬은 서버가 한다)
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem
            todo={todo}
            isPending={pendingIds.includes(todo.id)}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
