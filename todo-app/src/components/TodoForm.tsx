// 할 일 입력 폼 (F-01)
type TodoFormProps = {
  // 추가할 제목을 위로 전달한다. 성공하면 true, 실패하면 false를 돌려받는다.
  onAdd: (title: string) => Promise<boolean>;
  // 추가 요청이 진행 중이면 true
  isSubmitting: boolean;
};

export function TodoForm(props: TodoFormProps) {
  return (
    <div>
      <input type="text" placeholder="할 일을 입력하세요" />
      <button type="button">추가</button>
    </div>
  );
}
