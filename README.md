# YIU-AISL-papi

최신 AI 논문 및 기술 문서를 효율적으로 읽고 분석할 수 있도록 지원하는 웹 기반 논문 분석 서비스 **PAPI**의 웹 프론트엔드입니다.

사용자는 논문을 등록하고 Library에서 관리할 수 있으며, Reader에서 PDF 원문과 함께 AI 기반 질의응답, 요약, 근거 확인 등의 기능을 이용할 수 있습니다.

## Tech Stack

* React
* TypeScript
* Vite
* React Router
* ESLint

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build

```bash
npm run build
```

### 4. Lint

```bash
npm run lint
```

## Folder Structure

```text
src/
  app/
    router.tsx

  assets/

  components/

  features/

  pages/
    auth/
      LoginPage.tsx
      SignupPage.tsx
      PasswordResetPage.tsx

    onboarding/
      OnboardingPage.tsx

    library/
      LibraryPage.tsx

    reader/
      ReaderPage.tsx

    settings/
      SettingsPage.tsx

  App.tsx
  App.css
  index.css
  main.tsx
```

## Folder Rule

### `app`

애플리케이션 전체 설정과 라우팅 관련 코드를 관리합니다.

* React Router 설정
* 앱 전역 설정

### `pages`

URL과 직접 연결되는 페이지 단위 컴포넌트를 관리합니다.

예시:

* `/login` → `pages/auth/LoginPage.tsx`
* `/library` → `pages/library/LibraryPage.tsx`
* `/reader/:paperId` → `pages/reader/ReaderPage.tsx`

### `components`

여러 페이지에서 공통으로 사용하는 UI 컴포넌트를 관리합니다.

예시:

* Button
* Input
* Modal
* Header

### `features`

특정 기능과 관련된 컴포넌트, hook, API, util 등의 코드를 기능 단위로 관리합니다.

기능 구현이 시작되면 필요한 도메인별 폴더를 추가합니다.

### `assets`

이미지, 아이콘 등 정적 리소스를 관리합니다.

## Routing

| Path               | Page              | Description |
| ------------------ | ----------------- | ----------- |
| `/`                | LibraryPage       | 기본 진입 화면    |
| `/login`           | LoginPage         | 로그인         |
| `/signup`          | SignupPage        | 회원가입        |
| `/password-reset`  | PasswordResetPage | 비밀번호 재설정    |
| `/onboarding`      | OnboardingPage    | 사용자 온보딩     |
| `/library`         | LibraryPage       | 논문 라이브러리    |
| `/reader/:paperId` | ReaderPage        | 논문 Reader   |
| `/settings`        | SettingsPage      | 설정          |

## Main Features

### Auth

* 로그인
* 회원가입
* 이메일 인증
* 비밀번호 재설정

### Onboarding

* 사용자 성향 설정
* 관심 분야 설정
* 논문 이용 목적 설정

### Library

* PDF 및 arXiv URL을 통한 논문 등록
* 등록된 논문 관리
* 논문 처리 상태 확인
* 검색 및 필터

### Reader

* PDF 원문 열람
* AI 기반 논문 질의응답
* 추천 질문
* 답변 근거 확인 및 PDF 위치 이동
* 논문 요약
* 재현 가능성 체크리스트
* 논문 비교

### Settings

* 회원정보 관리
* 관심 분야 설정
* AI 개인화 설정

## Development Rule

* URL과 연결되는 페이지 컴포넌트는 `pages`에 작성합니다.
* 기능별 구현 코드는 `features`에서 관리합니다.
* 여러 페이지에서 재사용하는 UI 컴포넌트는 `components`에 작성합니다.
* React 컴포넌트 파일명은 PascalCase를 사용합니다.

  * 예: `LoginPage.tsx`, `LibraryPage.tsx`
* 폴더명은 소문자를 사용합니다.

  * 예: `auth`, `library`, `reader`
* 새로운 라이브러리를 추가할 경우 팀원들과 공유합니다.
* API Key 등 민감한 정보는 GitHub에 업로드하지 않습니다.

## Current Status

현재 프론트엔드 초기 구조 세팅 단계입니다.

구현된 항목:

* Vite + React + TypeScript 프로젝트 생성
* ESLint 설정
* React Router 설치
* 기본 페이지 폴더 구조 설정
* 기본 페이지 컴포넌트 생성
* 기본 라우팅 설정

다음 구현 예정:

* Figma 기반 공통 UI 구현
* 로그인 및 회원가입 화면 구현
* Library 화면 구현
* Reader 화면 구현
* Settings 화면 구현