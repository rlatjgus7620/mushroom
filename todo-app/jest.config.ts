import type { Config } from "jest";
import nextJest from "next/jest.js";

// Next.js 설정(tsconfig 경로 별칭, 환경 변수 등)을 Jest에 불러온다
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  // 브라우저처럼 동작하는 테스트 환경
  testEnvironment: "jsdom",
  // 모든 테스트 전에 실행할 파일
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // 테스트 파일은 __tests__ 폴더에만 둔다
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
};

export default createJestConfig(config);
