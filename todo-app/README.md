# Todo App

혼자 쓰는 간단한 할 일 목록 웹 앱입니다. (초보자 학습용)

> 현재 상태: **명세 문서 작성 완료, 개발 시작 전**

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

- Next.js 15 (App Router), React 19, TypeScript (strict)
- Tailwind CSS
- MySQL 8 + Drizzle ORM
- Zod (입력값 검증)
- Jest + React Testing Library (테스트)

## 문서

| 문서 | 내용 |
|------|------|
| [IDEA.md](docs/IDEA.md) | 처음 아이디어 |
| [PRD.md](docs/PRD.md) | 목표, 기능 목록, 사용자 스토리, 성공 기준 |
| [TRD.md](docs/TRD.md) | 기술 선택 이유, 구조, 데이터 흐름, API 규칙 |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | `todos` 테이블과 TypeScript 타입 |
| [API_SPEC.md](docs/API_SPEC.md) | API별 요청/응답 예시와 오류 |
| [COMPONENT_SPEC.md](docs/COMPONENT_SPEC.md) | 컴포넌트 구조, Props, 화면 문구 |
| [TEST_CASES.md](docs/TEST_CASES.md) | API·컴포넌트 테스트 케이스 |
| [CLAUDE.md](docs/CLAUDE.md) | AI 코딩 도우미용 작업 규칙 |

## 폴더 구조

```
app/              페이지와 API 라우트
src/components/   화면 컴포넌트
src/lib/          서버 로직, DB
src/types/        공유 타입
docs/             명세 문서
```

## 실행 방법

개발을 시작하면 아래 명령을 사용합니다. (아직 코드가 없어 지금은 동작하지 않습니다)

```bash
npm install   # 패키지 설치
npm run dev   # 개발 서버 실행
npm test      # 테스트 실행
```
