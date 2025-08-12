export interface Document {
  document_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  summary?: string;
  created_at: string;
  updated_at: string;
  processing_step?: string;
  error_message?: string;
  embeddings_count?: number;
}

export interface DocumentStatus {
  document_id: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  processing_step?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  has_summary: boolean;
  embeddings_count: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  document_id?: string;
  sources?: ChatSource[];
}

export interface ChatSource {
  chunk_index: number;
  content_preview: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  company?: string;
  role?: string;
  location?: string;
  avatar_url?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      document_processing?: boolean;
      weekly_digest?: boolean;
      security_alerts?: boolean;
      marketing_emails?: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  documents_uploaded: number;
  documents_completed: number;
  documents_processing: number;
  documents_failed: number;
  chat_sessions: number;
  total_messages: number;
  hours_saved: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'chat' | 'processing_complete' | 'processing_failed';
  description: string;
  timestamp: string;
  document_id?: string;
  session_id?: string;
}