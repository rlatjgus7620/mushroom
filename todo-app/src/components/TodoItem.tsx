import type { Todo } from "@/types/todo";

// 할 일 한 줄 (F-03, F-04)
type TodoItemProps = {
  todo: Todo;
  isPending: boolean; // 이 항목의 요청이 진행 중이면 true
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo }: TodoItemProps) {
  return <span>{todo.title}</span>;
}
