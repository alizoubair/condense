import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Document, DocumentStatus } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return config;
});

export const documentApi = {
  // Upload document
  uploadDocument: async (file: File): Promise<Document> => {
    const base64 = await fileToBase64(file);
    const response = await apiClient.post('/documents', {
      filename: file.name,
      content: base64.split(',')[1], // Remove data:mime;base64, prefix
      contentType: file.type,
    });
    return response.data.document;
  },

  // List documents
  listDocuments: async (limit = 20, lastKey?: string): Promise<{ documents: Document[]; lastEvaluatedKey?: string }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (lastKey) params.append('lastKey', lastKey);
    
    const response = await apiClient.get(`/documents?${params}`);
    return {
      documents: response.data.documents,
      lastEvaluatedKey: response.data.lastEvaluatedKey,
    };
  },

  // Get document details
  getDocument: async (documentId: string, includeContent = false): Promise<Document> => {
    const params = includeContent ? '?includeContent=true' : '';
    const response = await apiClient.get(`/documents/${documentId}${params}`);
    return response.data.document;
  },

  // Delete document
  deleteDocument: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },

  // Get document status
  getDocumentStatus: async (documentId: string): Promise<DocumentStatus> => {
    const response = await apiClient.get(`/documents/${documentId}/status`);
    return response.data;
  },
};

// WebSocket for chat
export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private onMessage: (message: any) => void,
    private onError: (error: any) => void,
    private onConnect: () => void,
    private onDisconnect: () => void
  ) {}

  async connect(): Promise<void> {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || '';
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.onConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.onMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.onDisconnect();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError(error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.onError(error);
    }
  }

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
}

// Helper function
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}