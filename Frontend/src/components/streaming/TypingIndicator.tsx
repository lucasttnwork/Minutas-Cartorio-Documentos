import React from 'react';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  isVisible?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

/**
 * TypingIndicator Component
 * Shows animated dots to indicate the AI is processing/typing
 *
 * Usage:
 * <TypingIndicator isVisible={isLoading} size="medium" />
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible = true,
  size = 'medium',
  label,
}) => {
  if (!isVisible) return null;

  return (
    <div className={`typing-indicator typing-indicator-${size}`}>
      <span className="dot dot-1" aria-hidden="true" />
      <span className="dot dot-2" aria-hidden="true" />
      <span className="dot dot-3" aria-hidden="true" />
      {label && <span className="typing-label">{label}</span>}
      <span className="sr-only">Carregando...</span>
    </div>
  );
};

export default TypingIndicator;
