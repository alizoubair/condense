import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { ChatMessage, Document } from '../../types';
import { ChatWebSocket } from '../../services/api';

interface ChatInterfaceProps {
  selectedDocument?: Document;
  onDocumentSelect?: () => void;
}

export default function ChatInterface({ selectedDocument, onDocumentSelect }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);

  useEffect(() => {
    if (selectedDocument) {
      initializeWebSocket();
      addSystemMessage(`Connected to document: ${selectedDocument.filename}`);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [selectedDocument]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }

    wsRef.current = new ChatWebSocket(
      handleWebSocketMessage,
      handleWebSocketError,
      () => setIsConnected(true),
      () => setIsConnected(false)
    );

    wsRef.current.connect();
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'message_received':
        setIsTyping(true);
        break;
      case 'response':
        setIsTyping(false);
        addAssistantMessage(message.message, message.sources);
        break;
      case 'error':
        setIsTyping(false);
        addSystemMessage(`Error: ${message.message}`, 'error');
        break;
    }
  };

  const handleWebSocketError = (error: any) => {
    console.error('WebSocket error:', error);
    addSystemMessage('Connection error. Trying to reconnect...', 'error');
  };

  const addSystemMessage = (content: string, type: 'info' | 'error' = 'info') => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toISOString(),
      document_id: selectedDocument?.document_id,
    };
    setMessages(prev => [...prev, message]);
  };

  const addAssistantMessage = (content: string, sources?: any[]) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      document_id: selectedDocument?.document_id,
      sources,
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedDocument || !isConnected) return;

    const message = inputMessage.trim();
    addUserMessage(message);

    if (wsRef.current) {
      wsRef.current.sendMessage({
        action: 'sendMessage',
        message,
        document_id: selectedDocument.document_id,
      });
    }

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select a document to start chatting
        </h3>
        <p className="text-gray-500 mb-4">
          Choose a completed document to ask questions about its content.
        </p>
        <button
          onClick={onDocumentSelect}
          className="btn-primary"
        >
          Browse Documents
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {selectedDocument.filename}
              </h2>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          <button
            onClick={onDocumentSelect}
            className="btn-secondary text-sm"
          >
            Change Document
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              'flex',
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={clsx(
                'flex max-w-xs lg:max-w-md',
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div
                className={clsx(
                  'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                  message.type === 'user'
                    ? 'bg-primary-600 ml-2'
                    : message.type === 'assistant'
                    ? 'bg-gray-600 mr-2'
                    : 'bg-yellow-500 mr-2'
                )}
              >
                {message.type === 'user' ? (
                  <UserIcon className="h-4 w-4 text-white" />
                ) : message.type === 'assistant' ? (
                  <ComputerDesktopIcon className="h-4 w-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-white">!</span>
                )}
              </div>

              {/* Message bubble */}
              <div
                className={clsx(
                  'px-4 py-2 rounded-lg',
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.type === 'assistant'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-yellow-100 text-yellow-800'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Sources:</p>
                    {message.sources.map((source, index) => (
                      <div key={index} className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">Chunk {source.chunk_index}:</span>{' '}
                        {source.content_preview}
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                <ComputerDesktopIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the document..."
              className="input-field resize-none"
              rows={1}
              disabled={!isConnected}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}