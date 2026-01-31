import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StreamingText.css';

interface StreamingTextProps {
  text: string;
  speed?: number;
  isComplete?: boolean;
  onComplete?: () => void;
  showCursor?: boolean;
  batchSize?: number;
}

/**
 * StreamingText Component
 * Simulates real-time typing animation similar to ChatGPT/Gemini
 *
 * Usage:
 * <StreamingText
 *   text="Hello world..."
 *   speed={20}
 *   showCursor={true}
 *   onComplete={() => console.log('Done')}
 * />
 */
export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 20,
  isComplete = false,
  onComplete,
  showCursor = true,
  batchSize = 1,
}) => {
  const [displayedLength, setDisplayedLength] = useState(isComplete ? text.length : 0);
  const onCompleteRef = useRef(onComplete);
  const prevTextRef = useRef(text);

  // Keep callback ref updated in effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset on text change (new content)
  useEffect(() => {
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      if (!isComplete) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset animation on new text
        setDisplayedLength(0);
      }
    }
  }, [text, isComplete]);

  // Handle completion callback
  const handleComplete = useCallback(() => {
    onCompleteRef.current?.();
  }, []);

  // Typing animation effect
  useEffect(() => {
    // If already complete, show all text immediately
    if (isComplete) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync state when complete flag changes
      setDisplayedLength(text.length);
      handleComplete();
      return;
    }

    // If text fully displayed, trigger completion
    if (displayedLength >= text.length) {
      handleComplete();
      return;
    }

    // Schedule next character batch
    const timer = setTimeout(() => {
      setDisplayedLength((prev) => Math.min(prev + batchSize, text.length));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedLength, text.length, speed, isComplete, batchSize, handleComplete]);

  const isTyping = !isComplete && displayedLength < text.length;
  const displayedText = text.slice(0, displayedLength);

  return (
    <div className="streaming-text">
      <span className="streaming-text-content">{displayedText}</span>
      {isTyping && showCursor && <span className="cursor" />}
    </div>
  );
};

export default StreamingText;
