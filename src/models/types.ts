export interface FileData {
  file: File;
  name: string;
  content: string;
  mime: string;
  path: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  file?: FileData;
}

export type MessageInput = Omit<Message, 'id'>;

export interface RoleConfig {
  model: string;
  systemMessage: string;
}
