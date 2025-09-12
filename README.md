# 🤖 Onsil-AI

**Onsil-AI**는 Google Gemini AI를 기반으로 한 고급 멀티모달 AI 채팅 애플리케이션입니다. 텍스트, 이미지, 오디오 생성을 지원하며, 현대적인 웹 기술로 구축된 반응형 AI 인터페이스를 제공합니다.

## ✨ 주요 기능

### 🎯 멀티모달 AI 채팅

- **텍스트 채팅**: 실시간 스트리밍 응답으로 자연스러운 대화
- **이미지 생성**: Gemini 2.5 Flash를 사용한 고품질 이미지 생성
- **오디오 생성**: TTS(Text-to-Speech) 기능으로 다중 화자 음성 생성
- **수학 수식 렌더링**: KaTeX를 사용한 LaTeX 수식 표시

### 📁 파일 처리

- **이미지 파일**: JPG, PNG, GIF 등 이미지 분석 및 처리
- **문서 파일**: PDF 문서 읽기 및 분석
- **스프레드시트**: Excel 파일 처리 및 데이터 분석
- **오디오 파일**: 음성 파일 업로드 및 처리

### 🔊 고급 오디오 기능

- **오디오 변환**: WAV를 MP3로 변환하는 고성능 오디오 처리
- **다중 화자 지원**: 여러 화자의 음성으로 대화 생성
- **음성 스크립트 생성**: 자동 스크립트 작성 및 음성 합성
- **실시간 오디오 재생**: 브라우저 내 오디오 플레이어

### 🎨 사용자 경험

- **다크/라이트 테마**: 사용자 선호에 따른 테마 전환
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **실시간 스트리밍**: 응답을 실시간으로 받아보는 부드러운 UX
- **미디어 캐싱**: 효율적인 미디어 파일 관리

## 🛠 기술 스택

### Frontend

- **React 19** - 현대적인 UI 라이브러리
- **TypeScript** - 타입 안전성을 위한 정적 타이핑
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크

### AI & API

- **Google Gemini AI** - 멀티모달 AI 모델
  - Gemini 2.5 Flash (텍스트 채팅)
  - Gemini 2.5 Flash Image Preview (이미지 생성)
  - Gemini 2.5 Flash Preview TTS (음성 생성)

### 주요 라이브러리

- **@google/genai** - Google Gemini AI SDK
- **react-markdown** - 마크다운 렌더링
- **katex** - 수학 수식 렌더링
- **lamejs** - MP3 오디오 인코딩
- **pdfjs-dist** - PDF 파일 처리
- **xlsx** - Excel 파일 처리
- **lucide-react** - 아이콘 라이브러리

## 🚀 설치 및 실행

### 요구 사항

- **Node.js** 18.0 이상
- **npm** 또는 **yarn**
- **Google Gemini API 키**

### 1. 프로젝트 클론

```bash
git clone https://github.com/Cardanoian/onsil-ai.git
cd onsil-ai
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.sample` 파일을 `.env`로 복사하고 API 키를 설정합니다:

```bash
cp .env.sample .env
```

`.env` 파일을 편집하여 Gemini API 키를 입력합니다:

```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

### 5. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 🔑 API 키 설정

### Google Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/)에 접속
2. 계정 로그인 후 API 키 생성
3. 생성된 API 키를 `.env` 파일에 설정

### API 권한 확인

- **텍스트 생성**: 기본 권한
- **이미지 생성**: 지역별 제한 있음
- **오디오 생성**: Preview 기능 권한 필요

## 📖 사용 방법

### 기본 채팅

1. 메인 화면에서 텍스트 입력창에 질문 입력
2. Enter 키 또는 전송 버튼 클릭
3. AI의 실시간 스트리밍 응답 확인

### 이미지 생성

1. 채팅 입력창 옆의 이미지 버튼(🖼️) 클릭
2. 이미지 생성 프롬프트 입력
3. 생성된 이미지 확인 및 다운로드

### 오디오 생성

1. 채팅 입력창 옆의 오디오 버튼(🔊) 클릭
2. 음성 생성 요청 입력 (예: "두 사람이 영어로 커피에 대해 대화")
3. 생성된 스크립트와 오디오 파일 확인

### 파일 업로드

1. 채팅 입력창 옆의 파일 버튼(📎) 클릭
2. 이미지, PDF, Excel 파일 선택
3. 파일 내용에 대한 질문 입력

### 테마 변경

- 우상단의 테마 토글 버튼으로 다크/라이트 모드 전환

## 🏗 프로젝트 구조

```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
├── contexts/            # React Context (테마, 페이지 상태)
├── controllers/         # 비즈니스 로직 컨트롤러
│   └── ChatController.ts    # 채팅 기능 관리
├── hooks/              # 커스텀 React 훅
├── models/             # 데이터 모델 및 타입 정의
│   ├── ChatModel.ts        # 채팅 데이터 모델
│   └── types.ts           # TypeScript 타입 정의
├── providers/          # Context Provider 컴포넌트
├── services/           # 외부 API 서비스
│   └── GeminiService.ts   # Google Gemini AI 서비스
├── utils/              # 유틸리티 함수
│   ├── audioConverter.ts  # 오디오 변환 유틸리티
│   ├── logger.ts         # 로깅 유틸리티
│   ├── mediaCache.ts     # 미디어 캐싱
│   └── mediaLoader.ts    # 미디어 로딩
├── views/              # 페이지 컴포넌트
│   ├── ChatView.tsx      # 메인 채팅 화면
│   └── components/       # 뷰 전용 컴포넌트
└── types/              # 타입 정의 파일
```

## 🔧 개발 정보

### 개발 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 실행
```

### 주요 설정 파일

- `vite.config.ts` - Vite 빌드 설정
- `tailwind.config.js` - Tailwind CSS 설정
- `tsconfig.json` - TypeScript 설정
- `eslint.config.js` - ESLint 설정

### 아키텍처 패턴

- **MVC 패턴**: Model-View-Controller 구조
- **Singleton 패턴**: ChatController, ChatModel
- **Observer 패턴**: 상태 변경 알림
- **Strategy 패턴**: 다양한 미디어 타입 처리

## 🎯 주요 특징

### 성능 최적화

- **코드 분할**: 동적 import를 통한 번들 크기 최적화
- **미디어 캐싱**: 효율적인 파일 관리
- **스트리밍 응답**: 실시간 응답으로 사용자 경험 향상

### 보안

- **환경 변수**: API 키 보안 관리
- **타입 안전성**: TypeScript를 통한 런타임 오류 방지
- **입력 검증**: 파일 업로드 및 사용자 입력 검증

### 접근성

- **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- **키보드 네비게이션**: 키보드만으로 모든 기능 사용 가능
- **다크 모드**: 눈의 피로를 줄이는 다크 테마

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인

- TypeScript 타입 정의 필수
- ESLint 규칙 준수
- 컴포넌트 단위 테스트 작성 권장
- 커밋 메시지는 [Conventional Commits](https://conventionalcommits.org/) 형식 사용

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🔗 관련 링크

- [Google Gemini AI](https://ai.google.dev/)
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 지원 및 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**Onsil-AI**로 차세대 AI 경험을 시작해보세요! 🚀
