# Todo App

혼자 쓰는 간단한 할 일 목록 웹 앱입니다. (초보자 학습용)

> 현재 상태: **화면(Next.js) 초기 설정 완료, 서버(FastAPI) 설정과 기능 개발 전**

## 주요 기능 (MVP)

- 할 일 추가 (제목 필수, 앞뒤 공백 제거 후 1~100자)
- 할 일 목록 보기 (최신순)
- 완료/미완료 전환 (체크박스)
- 할 일 삭제
- 새로고침해도 데이터 유지

로그인, 공유, 알림, 마감일, 카테고리는 지금 범위에 포함하지 않습니다.

## 버전 로드맵

| 버전 | 내용 |
|------|------|
| v0.1 | 화면만 (브라우저 메모리) |
| v0.2 | API 연결 (서버 메모리) |
| v0.3 | DB 저장 |
| v0.4 | 필터와 수정 |
| v1.0 | 배포 |

## 기술 스택

| 구분 | 기술 |
|------|------|
| 화면 | Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS, Zod |
| 서버 | Python 3.12, FastAPI, Uvicorn, Pydantic v2 |
| DB | PostgreSQL 16, SQLAlchemy 2.0, Alembic |
| 테스트 | Jest + React Testing Library (화면), pytest (API) |

## 문서

| 문서 | 내용 |
|------|------|
| [IDEA.md](docs/IDEA.md) | 처음 아이디어 |
| [PRD.md](docs/PRD.md) | 목표, 기능 목록, 사용자 스토리, 성공 기준 |
| [TRD.md](docs/TRD.md) | 기술 선택 이유, 구조, 데이터 흐름, API 규칙 |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | `todos` 테이블, TypeScript 타입, Pydantic 스키마 |
| [API_SPEC.md](docs/API_SPEC.md) | API별 요청/응답 예시와 오류 |
| [COMPONENT_SPEC.md](docs/COMPONENT_SPEC.md) | 컴포넌트 구조, Props, 화면 문구 |
| [TEST_CASES.md](docs/TEST_CASES.md) | API·컴포넌트 테스트 케이스 |
| [CLAUDE.md](docs/CLAUDE.md) | AI 코딩 도우미용 작업 규칙 |

## 폴더 구조

```
app/                    페이지
src/components/         화면 컴포넌트
src/lib/                화면용 함수 (API 호출, 검증)
src/types/              화면 타입
__tests__/components/   화면 테스트
backend/app/            FastAPI 앱 (예정)
backend/tests/          API 테스트 (예정)
docs/                   명세 문서
```

## 실행 방법

**화면 (Next.js)**

```bash
npm install   # 패키지 설치
npm run dev   # 개발 서버 실행 (http://localhost:3000)
npm test      # 화면 테스트 실행
```

**서버 (FastAPI)** - 아직 설정 전입니다. 설정 후 `backend/` 폴더에서 실행합니다.

```bash
uvicorn app.main:app --reload --port 8000   # API 서버 실행 (http://localhost:8000/docs)
pytest                                      # API 테스트 실행
```
