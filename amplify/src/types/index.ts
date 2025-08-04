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