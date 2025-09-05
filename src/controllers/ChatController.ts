import { ChatModel } from '../models/ChatModel';
import { GeminiService } from '../services/GeminiService';
import { FileData, Message } from '../models/types';

export class ChatController {
  private static instance: ChatController;
  private model: ChatModel;
  private geminiService: GeminiService;
  private abortController: AbortController = new AbortController();

  private constructor() {
    this.model = ChatModel.getInstance();
    this.geminiService = new GeminiService();
  }

  public static getInstance(): ChatController {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController();
    }
    return ChatController.instance;
  }
  getMessages() {
    return this.model.getMessages();
  }

  subscribe(listener: () => void) {
    return this.model.subscribe(listener);
  }

  async readFileContent(file: File): Promise<string> {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } else {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsText(file);
      });
    }
  }

  async sendMessage(
    message: string,
    timestamp: string,
    fileData?: FileData,
    buttonType?: 'file' | 'image' | 'audio' | null
  ) {
    // 매 요청마다 새로운 AbortController 생성
    this.abortController = new AbortController();
    // 사용자 메시지 추가
    this.model.addMessage({
      role: 'user',
      content: message,
      timestamp,
      file: fileData
        ? {
            name: fileData.file.name,
            content: fileData.content,
          }
        : undefined,
    });

    try {
      const assistantMessageId = this.model.addMessage({
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      });

      const updatedMessages = this.model.getMessages();

      // 버튼 타입에 따른 처리 결정
      let type: string;
      if (buttonType === 'image') {
        type = 'image';
      } else if (buttonType === 'audio') {
        type = 'audio';
      } else {
        type = 'text';
      }

      this.printPrompt(message, type);

      switch (type) {
        case 'image':
          await this.handleImage(assistantMessageId, updatedMessages, fileData);
          return;
        case 'audio':
          await this.handleAudio(assistantMessageId, updatedMessages);
          return;
        case 'text':
        default:
          await this.handleText(
            message,
            assistantMessageId,
            updatedMessages,
            fileData
          );
          return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      this.model.addMessage({
        role: 'assistant',
        content: '오류가 발생했습니다. 다시 시도해 주세요.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private printPrompt = (message: string, type: string) => {
    // 개발환경(localhost)에서만 프롬프트와 요청 타입을 콘솔에 출력
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    ) {
      console.log('[ChatController] 프롬프트:', message, '| 요청 타입:', type);
    }
  };

  private async handleImage(
    assistantMessageId: string,
    updatedMessages: Message[],
    fileData?: FileData
  ) {
    const isImageFile =
      fileData && fileData.file && /(\.jpe?g|\.png)$/i.test(fileData.file.name);

    if (isImageFile) {
      this.model.updateMessage(
        assistantMessageId,
        '이미지 변환 기능은 지원하지 않습니다.'
      );
      return;
    }
    this.model.updateMessage(
      assistantMessageId,
      '🖼️ 이미지를 생성 중입니다... 잠시만 기다려주세요!'
    );
    const imageUrl = await this.geminiService.generateImage(updatedMessages);
    this.model.updateMessage(
      assistantMessageId,
      `![이미지 생성 결과](${imageUrl})`
    );
  }

  private async handleAudio(
    assistantMessageId: string,
    updatedMessages: Message[]
  ) {
    try {
      // 1. 오디오 생성 인디케이터
      this.model.updateMessage(
        assistantMessageId,
        '🔊 오디오를 생성 중입니다... 잠시만 기다려주세요!'
      );

      // 2. 오디오 생성
      const { text, audioBase64, format } =
        await this.geminiService.generateAudioResponse(updatedMessages);

      // 3. 메시지 업데이트: 스크립트 텍스트 + 오디오 파일 정보
      const audioFileName = `audio_${Date.now()}.${format}`;
      const audioMime = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
      const audioDataUrl = `data:${audioMime};base64,${audioBase64}`;

      // 스크립트와 오디오를 함께 표시
      const displayText = `**생성된 스크립트:**\n\n${text}\n\n**🎵 오디오 파일이 생성되었습니다!**`;

      this.model.updateMessage(assistantMessageId, displayText, {
        name: audioFileName,
        content: audioDataUrl,
        mime: audioMime,
      });
    } catch (error) {
      this.model.updateMessage(
        assistantMessageId,
        '오디오 생성 중 오류가 발생했습니다. 다시 시도해 주세요.'
      );
      if (error instanceof Error) {
        console.error('오디오 생성 오류:', error);
      }
    }
  }

  private async handleText(
    message: string,
    assistantMessageId: string,
    updatedMessages: Message[],
    fileData?: FileData
  ) {
    // 이미지 파일이 첨부된 경우 vision 처리
    if (
      fileData &&
      fileData.file &&
      /(\.jpe?g|\.png)$/i.test(fileData.file.name)
    ) {
      let base64 = fileData.content;
      let mimeType = 'image/png';
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(
        fileData.content
      );
      if (match) {
        mimeType = match[1];
        base64 = match[2];
      }
      const stream = this.geminiService.visionChat(message, base64, mimeType);
      await this.updateAssistantMessageStream(stream, assistantMessageId);
      return;
    }

    // 일반 텍스트 처리
    const stream = this.geminiService.processMessageStream(updatedMessages);
    await this.updateAssistantMessageStream(stream, assistantMessageId);
  }

  private async updateAssistantMessageStream(
    stream: AsyncGenerator<string, void, unknown>,
    assistantMessageId: string
  ) {
    let fullContent = '';
    for await (const chunk of stream) {
      fullContent += chunk;
      this.model.updateMessage(assistantMessageId, fullContent);
    }
  }

  stopGeneration() {
    this.abortController.abort();
  }

  resetMessages() {
    this.model.clear();
  }
}
