# ElevenLabs AI 음성 상담 위젯

웹페이지에 간편하게 삽입할 수 있는 AI 음성 상담 위젯입니다. ElevenLabs Conversational AI를 기반으로 실시간 음성 대화가 가능합니다.

## 주요 기능

- 🎙️ **실시간 음성 대화**: ElevenLabs AI 에이전트와 자연스러운 음성 대화
- 💬 **대화 내역 표시**: 실시간으로 대화 내용을 텍스트로 확인
- 🔗 **n8n 연동**: 대화 내용을 n8n 웹훅으로 전송하여 Notion, Perplexity 등과 연동 가능
- 📱 **반응형 디자인**: 데스크톱과 모바일 모두 지원
- 🎨 **커스터마이징 가능**: 쉽게 디자인과 동작을 수정 가능

## 설치 및 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. ElevenLabs Agent ID 설정

[widget.js](widget.js) 파일을 열고 다음 설정을 변경하세요:

```javascript
const CONFIG = {
    // ElevenLabs 에이전트 ID (필수)
    ELEVENLABS_AGENT_ID: 'YOUR_AGENT_ID_HERE',  // 여기에 실제 Agent ID 입력

    // n8n 웹훅 URL (선택사항)
    N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/...'
};
```

### 3. 로컬 서버 실행

```bash
npm run dev
```

브라우저가 자동으로 열리며 `http://localhost:8080`에서 테스트할 수 있습니다.

## ElevenLabs Agent ID 받는 방법

1. [ElevenLabs](https://elevenlabs.io) 웹사이트에 로그인
2. **Conversational AI** 섹션으로 이동
3. 새 에이전트 생성 또는 기존 에이전트 선택
4. Agent ID를 복사하여 [widget.js](widget.js)의 `ELEVENLABS_AGENT_ID`에 입력

## 웹사이트에 삽입하기

### 방법 1: 직접 삽입

HTML 파일의 `</body>` 태그 직전에 다음 코드를 추가:

```html
<link rel="stylesheet" href="https://your-domain.com/widget.css">
<script type="module" src="https://your-domain.com/widget.js"></script>
```

### 방법 2: iframe 삽입

```html
<iframe src="https://your-domain.com/index.html"
        width="100%"
        height="600"
        frameborder="0">
</iframe>
```

## n8n 연동 설정

### n8n 워크플로우 예시

1. **Webhook 노드 추가**
   - URL: 자동 생성된 웹훅 URL 복사
   - Method: POST

2. **받은 데이터 처리**
   ```json
   {
     "sessionId": 1234567890,
     "timestamp": "2026-01-28T...",
     "conversation": [
       {
         "timestamp": "2026-01-28T...",
         "speaker": "user",
         "content": "안녕하세요"
       },
       {
         "timestamp": "2026-01-28T...",
         "speaker": "ai",
         "content": "안녕하세요! 무엇을 도와드릴까요?"
       }
     ],
     "metadata": {
       "userAgent": "...",
       "url": "https://..."
     }
   }
   ```

3. **Notion 연동 예시**
   - Notion 노드 추가
   - Database에 대화 내용 저장
   - 태그: 세션 ID, 타임스탬프 등

4. **Perplexity 연동 예시**
   - HTTP Request 노드 추가
   - Perplexity API로 대화 요약 또는 분석 요청
   - 결과를 Notion이나 다른 시스템에 저장

## 파일 구조

```
voice_inquiry/
├── index.html          # 테스트용 웹페이지
├── widget.js           # 위젯 메인 JavaScript 파일
├── widget.css          # 위젯 스타일시트
├── package.json        # 프로젝트 설정
└── README.md           # 이 파일
```

## 커스터마이징

### 색상 변경

[widget.css](widget.css)에서 그라디언트 색상을 변경:

```css
/* 기본 상태 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 활성 상태 */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### 위치 변경

현재는 화면 중앙 고정형입니다. 플로팅 버튼으로 변경하려면:

```css
#elevenlabs-voice-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    /* top, left, transform 제거 */
}
```

### 크기 조정

[widget.css](widget.css)에서:

```css
.voice-widget-container {
    width: 400px;  /* 원하는 크기로 변경 */
}
```

## 브라우저 호환성

- Chrome/Edge: 완벽 지원
- Firefox: 완벽 지원
- Safari: 완벽 지원
- 모바일 브라우저: 완벽 지원

## 문제 해결

### "ElevenLabs Agent ID를 설정해주세요" 오류
- [widget.js](widget.js)의 `ELEVENLABS_AGENT_ID`를 올바르게 설정했는지 확인

### 마이크 권한 오류
- HTTPS 환경에서 실행 중인지 확인 (localhost는 HTTP 가능)
- 브라우저의 마이크 권한을 확인

### n8n 웹훅이 작동하지 않음
- n8n 웹훅 URL이 올바른지 확인
- n8n 워크플로우가 활성화되어 있는지 확인
- 브라우저 콘솔에서 네트워크 오류 확인

## 라이선스

MIT License

## 참고 자료

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai)
- [n8n Documentation](https://docs.n8n.io)
