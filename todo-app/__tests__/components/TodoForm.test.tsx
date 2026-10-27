import { render, screen } from "@testing-library/react";
import { TodoForm } from "@/components/TodoForm";

describe("TodoForm", () => {
  test("CMP-01 처음 화면에 입력창과 추가 버튼이 보인다", () => {
    // onAdd는 이 테스트에서 호출되지 않으므로 항상 성공(true)을 돌려주는 가짜 함수
    const onAdd = jest.fn<Promise<boolean>, [string]>().mockResolvedValue(true);

    render(<TodoForm onAdd={onAdd} isSubmitting={false} />);

    expect(screen.getByPlaceholderText("할 일을 입력하세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
  });
});
