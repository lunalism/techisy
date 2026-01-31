# Techisy

한국판 Techmeme - 글로벌과 한국 테크 뉴스를 한눈에

## 소개

Techisy는 전 세계 테크 뉴스와 한국 테크 매체의 뉴스를 한 곳에서 볼 수 있는 뉴스 애그리게이터입니다.
같은 주제의 기사들을 클러스터링하여 Techmeme 스타일로 보여줍니다.

## 주요 기능

- 글로벌 + 한국 테크 뉴스 통합
- 실시간 RSS 피드 수집
- 관련 기사 클러스터링
- 미니멀하고 깔끔한 UI
- 모바일 반응형

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- shadcn/ui + Tailwind CSS
- Supabase (PostgreSQL)
- Prisma
- TanStack Query
- Vercel

## 시작하기

### 필수 조건
- Node.js 18+
- pnpm

### 설치
pnpm install

### 환경 변수
.env.example을 .env로 복사하고 Supabase URL을 입력하세요.

### 개발 서버 실행
pnpm dev

### DB 마이그레이션
npx prisma migrate dev --name init

## 라이센스

MIT
