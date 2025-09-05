export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  file?: {
    name: string;
    content: string;
    path?: string;
    mime?: string;
  };
}

export interface FileData {
  file: File;
  content: string;
  mime?: string;
}

export type MessageInput = Omit<Message, 'id'>;

export interface RoleConfig {
  model: string;
  systemMessage: string;
}
