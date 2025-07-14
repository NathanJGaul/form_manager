import React, { useState, useEffect, useRef, CSSProperties } from 'react';

interface TooltipProps {
  children: React.ReactElement;
  content: string;
  delay?: number;
}

interface TooltipPosition {
  top: number;
  left: number;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, delay = 500 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Calculate position based on mouse coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Position tooltip near the mouse cursor
    setPosition({
      top: y + 10,
      left: x + 10
    });

    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Update tooltip position to follow mouse
    if (showTooltip) {
      setPosition({
        top: e.clientY + 10,
        left: e.clientX + 10
      });
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tooltipStyle: CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    transition: 'opacity 0.2s',
    opacity: showTooltip ? 1 : 0,
    visibility: showTooltip ? 'visible' : 'hidden'
  };

  return (
    <>
      {React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseMove: handleMouseMove,
        ref: elementRef
      })}
      <div style={tooltipStyle}>
        {content}
      </div>
    </>
  );
};

export default Tooltip;