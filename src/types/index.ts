// src/types/index.ts

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  file?: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface FileUploadResponse {
  success: boolean;
  error?: string;
}
