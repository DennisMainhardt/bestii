export interface MessageType {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}
