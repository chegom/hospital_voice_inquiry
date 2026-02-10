/**
 * Voice Consultation Widget
 * 웹페이지 중앙에 고정되는 AI 음성 상담 위젯
 */

// ========== 설정 ==========
const CONFIG = {
    // AI 에이전트 ID (필수)
    AGENT_ID: 'agent_6501kftgxk6ne81sr01rj0f7q5mc',

    // 웹훅 URL (선택사항 - 대화 내용 전송)
    WEBHOOK_URL: 'https://kittai.app.n8n.cloud/webhook/4a12f1f0-eee6-4e41-8045-5abf04196ee6',

    // 무료 체험 제한 (0: 제한 없음, 1: 제한 있음)
    ENABLE_USAGE_LIMIT: 1
};

class VoiceWidget {
    constructor(config) {
        this.config = config;
        this.conversation = null;
        this.isActive = false;
        this.conversationHistory = [];
        this.timer = null;
        this.startTime = null;
        this.maxDuration = 180; // 3분 (초 단위)
        this.maxUsageCount = 3; // 최대 사용 횟수
        this.usageCount = this.getUsageCount();
        this.hasIncrementedUsage = false; // 사용 횟수 증가 플래그

        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.updateUsageDisplay();
    }

    getUsageCount() {
        const count = localStorage.getItem('voiceWidgetUsageCount');
        return count ? parseInt(count, 10) : 0;
    }

    setUsageCount(count) {
        localStorage.setItem('voiceWidgetUsageCount', count.toString());
        this.usageCount = count;
    }

    updateUsageDisplay() {
        const usageInfoElement = document.querySelector('.usage-info');

        // 사용 제한이 비활성화된 경우 표시 숨김
        if (!this.config.ENABLE_USAGE_LIMIT) {
            if (usageInfoElement) {
                usageInfoElement.style.display = 'none';
            }
            return;
        }

        // 사용 제한이 활성화된 경우 표시
        if (usageInfoElement) {
            usageInfoElement.style.display = 'flex';
        }

        const usageCountElement = document.getElementById('usage-count');
        if (usageCountElement) {
            usageCountElement.textContent = `${this.usageCount}/${this.maxUsageCount}`;

            // 사용 횟수에 따라 색상 변경
            if (this.usageCount >= this.maxUsageCount) {
                usageCountElement.classList.add('limit-reached');
            } else {
                usageCountElement.classList.remove('limit-reached');
            }
        }
    }

    canStartConversation() {
        // 사용 제한이 비활성화된 경우 항상 true 반환
        if (!this.config.ENABLE_USAGE_LIMIT) {
            return true;
        }
        return this.usageCount < this.maxUsageCount;
    }

    createWidget() {
        // 위젯 컨테이너 생성
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'ai-voice-widget';
        widgetContainer.innerHTML = `
            <div class="voice-widget-container">
                <div class="voice-widget-header">
                    <h2>🏥 든든한 서울 내과</h2>
                    <p class="subtitle">AI 상담 간호사 '건강이'</p>
                    <p class="description">진료 예약, 병원 이용, 건강 관련 질문을 도와드립니다</p>
                </div>

                <div class="voice-widget-content">
                    <button id="voice-widget-button" class="voice-widget-btn" aria-label="음성 상담 시작/종료">
                        <svg class="microphone-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="currentColor"/>
                            <path d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V23H13V18.92C16.39 18.43 19 15.53 19 12H17Z" fill="currentColor"/>
                        </svg>
                        <svg class="stop-icon" style="display: none;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                        </svg>
                    </button>

                    <div class="status-container">
                        <div id="voice-widget-status" class="voice-widget-status">
                            <div class="status-indicator"></div>
                            <span class="status-text">대기 중</span>
                        </div>
                        <div id="timer-display" class="timer-display" style="display: none;">
                            <svg class="timer-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="13" r="9" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 8V13L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M9 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span id="timer-text" class="timer-text">3:00</span>
                        </div>
                    </div>

                    <div id="conversation-log" class="conversation-log" style="display: none;">
                        <div class="log-header">대화 내역</div>
                        <div id="conversation-messages" class="conversation-messages"></div>
                    </div>
                </div>

                <div class="voice-widget-footer">
                    <div class="usage-info">
                        <small>무료 체험</small>
                        <span id="usage-count" class="usage-count">0/3</span>
                    </div>
                    <a href="https://tally.so/r/0QeNx9" target="_blank" rel="noopener noreferrer" class="contact-link">
                        도입 문의
                    </a>
                    <small class="powered-by">AI Voice Assistant</small>
                </div>
            </div>
        `;

        document.body.appendChild(widgetContainer);
    }

    attachEventListeners() {
        const button = document.getElementById('voice-widget-button');
        button.addEventListener('click', () => this.toggleConversation());
    }

    async toggleConversation() {
        if (this.isActive) {
            await this.stopConversation();
        } else {
            // 이미 종료된 상태가 아닐 때만 시작
            if (!this.conversation) {
                await this.startConversation();
            }
        }
    }

    async startConversation() {
        try {
            // 사용 횟수 체크
            if (!this.canStartConversation()) {
                alert('⚠️ 무료 체험 횟수를 모두 사용하셨습니다. (3/3)\n\n정식 서비스 이용을 원하시면 하단의 상담 링크를 클릭하세요.');
                return;
            }

            // Agent ID 확인
            if (!this.config.AGENT_ID || this.config.AGENT_ID === 'YOUR_AGENT_ID_HERE') {
                alert('⚠️ 에이전트 ID를 설정해주세요.\n\nwidget.js 파일에서 AGENT_ID를 입력하세요.');
                return;
            }

            this.updateUI('connecting');

            // AI SDK 로드
            const { Conversation } = await import('https://cdn.jsdelivr.net/npm/@11labs/client/+esm');

            this.conversation = await Conversation.startSession({
                agentId: this.config.AGENT_ID,

                // 대화 이벤트 핸들러
                onConnect: () => {
                    console.log('AI 상담 연결 성공');
                    this.updateUI('connected');
                    this.showConversationLog();
                    this.hasIncrementedUsage = false; // 연결 시 플래그 초기화
                },

                onDisconnect: () => {
                    console.log('AI 상담 연결 종료');
                    this.handleDisconnect();
                },

                onMessage: (message) => {
                    console.log('메시지:', message);
                    this.handleMessage(message);
                },

                onError: (error) => {
                    console.error('오류:', error);
                    this.updateUI('error');
                    alert('연결 중 오류가 발생했습니다: ' + error.message);
                }
            });

            this.isActive = true;
            this.startTimer();

        } catch (error) {
            console.error('대화 시작 오류:', error);
            this.updateUI('error');
            alert('음성 상담을 시작할 수 없습니다.\n\n' + error.message);
        }
    }

    async stopConversation() {
        try {
            this.stopTimer();

            // 연결이 활성 상태일 때만 종료 시도
            if (this.conversation && this.isActive) {
                try {
                    await this.conversation.endSession();
                } catch (error) {
                    // WebSocket이 이미 닫혀있는 경우 무시
                    console.log('연결이 이미 종료됨:', error.message);
                }
                this.conversation = null;
            }

            this.isActive = false;
            this.updateUI('disconnected');
            this.incrementUsageCount();

        } catch (error) {
            console.error('대화 종료 오류:', error);
        }
    }

    handleDisconnect() {
        // AI가 자동으로 연결을 종료했을 때
        // 먼저 상태를 비활성화하여 추가 메시지 전송 방지
        this.isActive = false;
        this.conversation = null;

        this.stopTimer();
        this.updateUI('disconnected');
        this.incrementUsageCount();
    }

    incrementUsageCount() {
        // 사용 제한이 비활성화된 경우 횟수 증가하지 않음
        if (!this.config.ENABLE_USAGE_LIMIT) {
            // 웹훅으로 대화 내용 전송만 수행
            if (this.config.WEBHOOK_URL && this.conversationHistory.length > 0) {
                this.sendToWebhook();
            }
            return;
        }

        // 중복 차감 방지
        if (this.hasIncrementedUsage) {
            return;
        }

        this.hasIncrementedUsage = true;

        // 사용 횟수 증가
        this.setUsageCount(this.usageCount + 1);
        this.updateUsageDisplay();

        // 사용 횟수 도달 시 알림
        if (this.usageCount >= this.maxUsageCount) {
            setTimeout(() => {
                alert('무료 체험 횟수를 모두 사용하셨습니다.\n\n정식 서비스 이용을 원하시면 하단의 상담 링크를 클릭하세요.');
            }, 500);
        }

        // 웹훅으로 대화 내용 전송
        if (this.config.WEBHOOK_URL && this.conversationHistory.length > 0) {
            this.sendToWebhook();
        }
    }

    startTimer() {
        this.startTime = Date.now();
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.style.display = 'flex';

        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const remaining = this.maxDuration - elapsed;

            if (remaining <= 0) {
                this.addSystemMessage('⏰ 상담 시간이 종료되었습니다 (3분)');
                this.stopConversation();
            } else {
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.startTime = null;
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.style.display = 'none';
    }

    updateTimerDisplay() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const remaining = this.maxDuration - elapsed;

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        const timerText = document.getElementById('timer-text');
        timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // 30초 미만일 때 경고 색상
        const timerDisplay = document.getElementById('timer-display');
        if (remaining < 30) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }
    }

    handleMessage(message) {
        // 대화 내용 저장
        const messageData = {
            timestamp: new Date().toISOString(),
            type: message.type,
            content: message.message || message.text || '',
            speaker: message.source || 'unknown'
        };

        this.conversationHistory.push(messageData);

        // 대화 로그에 표시
        this.addMessageToLog(messageData);

        // 콘솔에 메시지 출력
        console.log(`[${message.source}]:`, message.message || message.text);
    }

    showConversationLog() {
        const conversationLog = document.getElementById('conversation-log');
        conversationLog.style.display = 'block';
    }

    addMessageToLog(messageData) {
        const messagesContainer = document.getElementById('conversation-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${messageData.speaker}`;

        const time = new Date(messageData.timestamp).toLocaleTimeString('ko-KR');
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="speaker">${messageData.speaker === 'user' ? '사용자' : 'AI'}</span>
                <span class="time">${time}</span>
            </div>
            <div class="message-content">${messageData.content || '(음성 입력)'}</div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendToWebhook() {
        try {
            const response = await fetch(this.config.WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: Date.now(),
                    timestamp: new Date().toISOString(),
                    conversation: this.conversationHistory,
                    metadata: {
                        userAgent: navigator.userAgent,
                        url: window.location.href
                    }
                })
            });

            if (response.ok) {
                console.log('대화 내용이 전송되었습니다.');
                this.addSystemMessage('대화 내용이 저장되었습니다.');
            }
        } catch (error) {
            console.error('웹훅 전송 오류:', error);
        }
    }

    addSystemMessage(text) {
        const messagesContainer = document.getElementById('conversation-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.innerHTML = `<div class="message-content">${text}</div>`;
        messagesContainer.appendChild(messageElement);
    }

    updateUI(state) {
        const button = document.getElementById('voice-widget-button');
        const status = document.getElementById('voice-widget-status');
        const micIcon = button.querySelector('.microphone-icon');
        const stopIcon = button.querySelector('.stop-icon');
        const statusText = status.querySelector('.status-text');
        const statusIndicator = status.querySelector('.status-indicator');

        switch(state) {
            case 'connecting':
                button.classList.add('active');
                statusText.textContent = '연결 중...';
                statusIndicator.className = 'status-indicator connecting';
                micIcon.style.display = 'none';
                stopIcon.style.display = 'block';
                break;

            case 'connected':
                button.classList.add('active', 'pulsing');
                statusText.textContent = '음성 상담 중';
                statusIndicator.className = 'status-indicator connected';
                break;

            case 'disconnected':
                button.classList.remove('active', 'pulsing');
                statusText.textContent = '대기 중';
                statusIndicator.className = 'status-indicator';
                micIcon.style.display = 'block';
                stopIcon.style.display = 'none';
                document.getElementById('timer-display').style.display = 'none';
                document.getElementById('conversation-log').style.display = 'none';
                document.getElementById('conversation-messages').innerHTML = '';
                this.conversationHistory = [];
                break;

            case 'error':
                button.classList.remove('active', 'pulsing');
                statusText.textContent = '오류 발생';
                statusIndicator.className = 'status-indicator error';
                setTimeout(() => {
                    statusText.textContent = '대기 중';
                    statusIndicator.className = 'status-indicator';
                    micIcon.style.display = 'block';
                    stopIcon.style.display = 'none';
                }, 3000);
                break;
        }
    }
}

// 페이지 로드 시 위젯 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VoiceWidget(CONFIG);
    });
} else {
    new VoiceWidget(CONFIG);
}

// 전역 export
window.VoiceWidget = VoiceWidget;
