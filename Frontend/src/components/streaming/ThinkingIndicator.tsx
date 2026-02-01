import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ThinkingIndicator.css';

interface ThinkingIndicatorProps {
  content?: string;
  isVisible?: boolean;
  duration?: number;
  isStreaming?: boolean;
  onComplete?: () => void;
  autoCollapse?: boolean;
}

/**
 * ThinkingIndicator Component
 * Displays AI reasoning/thinking process similar to Claude 3.7
 *
 * Features:
 * - Expandable/collapsible panel
 * - Shimmer effect during thinking
 * - Shows thinking duration
 * - Auto-collapses when complete
 *
 * Usage:
 * <ThinkingIndicator
 *   content="Planning approach..."
 *   isStreaming={true}
 *   duration={2.5}
 * />
 */
export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  content = '',
  isVisible = true,
  isStreaming = false,
  duration = 0,
  onComplete,
  autoCollapse = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!autoCollapse);
  const [elapsedTime, setElapsedTime] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const wasStreamingRef = useRef(isStreaming);

  // Keep callback ref updated in effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Derive isThinking directly from prop
  const isThinking = isStreaming;

  // Calculate display duration: use elapsed time while streaming, final duration when complete
  const displayDuration = useMemo(() => {
    if (isStreaming) {
      return elapsedTime;
    }
    return duration > 0 ? duration : elapsedTime;
  }, [isStreaming, duration, elapsedTime]);

  // Handle streaming state changes
  useEffect(() => {
    // When streaming stops
    if (wasStreamingRef.current && !isStreaming) {
      if (autoCollapse) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: auto-collapse on streaming end
        setIsExpanded(false);
      }
      onCompleteRef.current?.();
    }
    wasStreamingRef.current = isStreaming;
  }, [isStreaming, autoCollapse]);

  // Timer for elapsed time during streaming
  useEffect(() => {
    if (!isStreaming) {
      return;
    }

    // Reset elapsed time when streaming starts
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset timer on streaming start
    setElapsedTime(0);

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(timer);
  }, [isStreaming]);

  if (!isVisible || !content) return null;

  return (
    <div
      className={`thinking-indicator ${isExpanded ? 'expanded' : 'collapsed'}`}
      role="region"
      aria-label="AI thinking process"
    >
      <button
        className="thinking-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="thinking-content"
      >
        <span className="thinking-icon">
          {isThinking ? <Shimmer /> : <CheckIcon />}
        </span>

        <span className="thinking-label">
          {isThinking ? (
            <>
              <span className="thinking-text">Pensando</span>
              <span className="thinking-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </>
          ) : (
            <>
              <span className="thinking-text">Pensou por</span>
              <span className="thinking-duration">
                {displayDuration.toFixed(1)}s
              </span>
            </>
          )}
        </span>

        <span className="thinking-toggle" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div
          className="thinking-content"
          id="thinking-content"
          role="article"
        >
          {content}
        </div>
      )}
    </div>
  );
};

/**
 * Shimmer Component
 * Loading indicator that animates during thinking
 */
const Shimmer: React.FC = () => (
  <div className="shimmer" aria-hidden="true">
    <div className="shimmer-bar" />
  </div>
);

/**
 * CheckIcon Component
 * Indicates thinking is complete
 */
const CheckIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className="check-icon"
  >
    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
  </svg>
);

export default ThinkingIndicator;
