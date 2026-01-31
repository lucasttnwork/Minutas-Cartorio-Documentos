import React, { useEffect, useRef } from 'react';
import StreamingText from './StreamingText';
import { ThinkingIndicator } from './ThinkingIndicator';
import { TypingIndicator } from './TypingIndicator';
import './StreamingChatMessage.css';

interface StreamingChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  isStreaming?: boolean;
  isComplete?: boolean;
  thinkingDuration?: number;
  onComplete?: () => void;
}

/**
 * StreamingChatMessage Component
 * Complete message component with thinking, streaming text, and animations
 *
 * Usage:
 * <StreamingChatMessage
 *   id="msg-1"
 *   role="assistant"
 *   content="Hello there..."
 *   thinking="Planning response..."
 *   isStreaming={true}
 * />
 */
export const StreamingChatMessage: React.FC<StreamingChatMessageProps> = ({
  id,
  role,
  content,
  thinking,
  isStreaming = false,
  isComplete = false,
  thinkingDuration,
  onComplete,
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to message when streaming
  useEffect(() => {
    if (isStreaming && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isStreaming]);

  // Auto-scroll to bottom of content
  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      contentRef.current.scrollTop = scrollHeight;
    }
  }, [content, isStreaming]);

  return (
    <article
      ref={messageRef}
      className={`chat-message chat-message-${role}`}
      data-message-id={id}
      role="article"
      aria-label={`Mensagem do ${role === 'user' ? 'usuário' : 'assistente'}`}
    >
      {/* Thinking Block */}
      {thinking && (
        <div className="message-thinking">
          <ThinkingIndicator
            content={thinking}
            isVisible={isStreaming || isComplete}
            isStreaming={isStreaming}
            duration={thinkingDuration}
            onComplete={onComplete}
            autoCollapse={true}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="message-body">
        <div
          ref={contentRef}
          className="message-content"
          role="textbox"
          aria-readonly={!isStreaming}
        >
          {role === 'user' ? (
            <p className="message-text">{content}</p>
          ) : (
            <>
              {isStreaming ? (
                <StreamingText
                  text={content}
                  speed={15}
                  showCursor={true}
                  batchSize={2}
                />
              ) : (
                <div className="message-text">
                  {content.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Indicator */}
        {isStreaming && role === 'assistant' && (
          <div className="message-status" role="status" aria-live="polite">
            <TypingIndicator isVisible={true} size="small" label="Digitando" />
          </div>
        )}

        {isComplete && role === 'assistant' && (
          <div className="message-complete" role="status">
            <span className="complete-indicator">✓</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default StreamingChatMessage;
