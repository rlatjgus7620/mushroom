# CLAUDE.md - Todo App

## 프로젝트 개요
혼자 쓰는 간단한 할 일 목록 웹 앱 (초보자 학습용)

## MVP 범위
- 할 일 추가 (제목 필수, 1~100자)
- 할 일 목록 보기 (최신순)
- 완료/미완료 전환 (체크박스)
- 할 일 삭제
- 새로고침해도 데이터 유지

## 지금은 만들지 않는 것
- 로그인, 공유, 알림, 마감일, 카테고리

## 버전 로드맵
- v0.1 화면만 (브라우저 메모리)
- v0.2 API 연결 (서버 메모리)
- v0.3 DB 저장
- v0.4 필터와 수정
- v1.0 배포

## 기술 스택
- 화면: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS, Zod
- 서버: Python 3.12, FastAPI, Uvicorn, Pydantic v2
- DB: PostgreSQL 16 + SQLAlchemy 2.0 + Alembic (드라이버: psycopg 3)
- 테스트: 화면은 Jest + React Testing Library, API는 pytest + FastAPI TestClient
- 개발 중 `/api/*` 요청은 Next.js가 FastAPI(localhost:8000)로 넘긴다 (TRD 3장)

## 폴더 구조
- app/ : 페이지 (API 라우트는 두지 않는다)
- src/components/ : 화면 컴포넌트
- src/lib/ : 화면용 함수 (API 호출, Zod 검증 규칙)
- src/types/ : 화면 타입
- __tests__/components/ : 화면 테스트 (파일 이름은 `*.test.ts(x)`)
- backend/app/ : FastAPI 앱 (라우터, Pydantic 스키마, DB 모델, DB 연결)
- backend/tests/ : API 테스트 (파일 이름은 `test_*.py`)
- docs/ : 명세 문서

## import 규칙
- `@/components/*`, `@/lib/*`, `@/types/*` 별칭을 쓴다 (예: `import { Todo } from "@/types/todo"`)
- 같은 폴더 안의 파일만 상대 경로(`./`)로 불러온다

## 반드시 참고할 문서
- docs/PRD.md, docs/TRD.md, docs/DATA_MODEL.md
- docs/API_SPEC.md, docs/COMPONENT_SPEC.md, docs/TEST_CASES.md

## 규칙
- 명세에 없는 기능을 임의로 추가하지 말 것
- any 타입 금지 (TypeScript), 함수에는 타입 힌트를 붙일 것 (Python)
- 한 번에 한 가지 기능만 작업하고, 끝나면 무엇을 바꿨는지 요약할 것
- 테스트를 삭제하거나 skip하지 말 것
- console.log와 print는 디버깅 후 제거할 것
- 초보자가 이해할 수 있게 주석은 한국어로 짧게

## 자주 쓰는 명령
- 화면 개발서버: npm run dev
- 화면 테스트: npm test
- API 개발서버 (backend/ 에서): uvicorn app.main:app --reload --port 8000
- API 테스트 (backend/ 에서): pytest
