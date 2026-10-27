// 할 일 하나 (DATA_MODEL.md 3장)
export type Todo = {
  id: string; // UUID 문자열
  title: string; // 1~100자
  completed: boolean; // 완료 여부
  // JSON에는 날짜 타입이 없어 API 응답이 문자열로 오므로 ISO 8601 문자열로 둔다
  createdAt: string; // 예: "2026-10-23T09:00:00.000Z"
};
