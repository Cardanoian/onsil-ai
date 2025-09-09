import { ChatModel } from '../models/ChatModel';
import { GeminiService } from '../services/GeminiService';
import { FileData, Message } from '../models/types';
import { devLog, devError } from '../utils/logger';

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
      file: fileData,
    });

    try {
      const assistantMessageId = this.model.addMessage({
        role: 'model',
        content: '',
        timestamp: new Date().toISOString(),
      });

      const updatedMessages = this.model.getMessages();

      this.printPrompt(message, buttonType?.toString() ?? '');

      switch (buttonType) {
        case 'image':
          await this.handleImage(assistantMessageId, updatedMessages);
          return;
        case 'audio':
          await this.handleAudio(assistantMessageId, updatedMessages);
          return;
        default:
          await this.handleText(assistantMessageId, updatedMessages);
          return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      this.model.addMessage({
        role: 'model',
        content: `오류가 발생했습니다. 다시 시도해 주세요.\n\n${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private printPrompt = (message: string, type: string) => {
    devLog('[ChatController] 프롬프트:', message, '| 요청 타입:', type);
  };

  private async handleImage(
    assistantMessageId: string,
    updatedMessages: Message[]
  ) {
    this.model.updateMessage(
      assistantMessageId,
      '🖼️ 이미지를 생성 중입니다... 잠시만 기다려주세요!'
    );
    const { text, imageUrl } = await this.geminiService.generateImage(
      updatedMessages
    );

    // Blob URL로 메시지 업데이트 (오디오와 동일한 방식)
    this.model.updateMessage(assistantMessageId, text, undefined, imageUrl);
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
      const { text, audioUrl } = await this.geminiService.generateAudioResponse(
        updatedMessages
      );

      // 3. 메시지 업데이트: 스크립트 텍스트와 오디오 URL
      const displayText = `**생성된 스크립트:**\n\n${text}\n\n**🎵 오디오 파일이 생성되었습니다!**`;

      // 오디오 URL로 메시지 업데이트
      this.model.updateMessage(
        assistantMessageId,
        displayText,
        undefined,
        audioUrl
      );
    } catch (error) {
      this.model.updateMessage(
        assistantMessageId,
        '오디오 생성 중 오류가 발생했습니다. 다시 시도해 주세요.'
      );
      if (error instanceof Error) {
        devError('오디오 생성 오류:', error);
      }
    }
  }

  private async handleText(
    assistantMessageId: string,
    updatedMessages: Message[]
  ) {
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
