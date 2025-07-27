import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { tooltipTips, TooltipTip } from "./tooltipTips";

interface TooltipOverlayProps {
  tipId: string;
  className?: string;
}

export function TooltipOverlay({ tipId, className = "" }: TooltipOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, right: 'auto', bottom: 'auto' });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tip = tooltipTips[tipId];

  useLayoutEffect(() => {
    if (isVisible && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 768;
      const margin = isMobile ? 16 : 20;
      
      let newPosition = {
        top: 'auto' as any,
        left: 'auto' as any,
        right: 'auto' as any,
        bottom: 'auto' as any
      };

      // For mobile, center the tooltip horizontally and use full available width
      if (isMobile) {
        const availableWidth = viewportWidth - (margin * 2);
        const tooltipWidth = Math.min(tooltipRect.width, availableWidth);
        const centeredLeft = (viewportWidth - tooltipWidth) / 2;
        
        newPosition.left = `${Math.max(margin, centeredLeft)}px`;
        
        // Vertical positioning for mobile
        if (buttonRect.bottom + tooltipRect.height + margin <= viewportHeight) {
          newPosition.top = `${buttonRect.bottom + 8}px`;
        } else {
          newPosition.bottom = `${viewportHeight - buttonRect.top + 8}px`;
        }
      } else {
        // Desktop positioning logic - simplified and more robust
        const tooltipWidth = 320; // Fixed width (w-80)

        // Vertical positioning
        if (buttonRect.bottom + tooltipRect.height + 8 <= viewportHeight - margin) {
          newPosition.top = `${buttonRect.bottom + 8}px`;
        } else {
          newPosition.bottom = `${viewportHeight - buttonRect.top + 8}px`;
        }

        // Horizontal positioning - always use right margin to prevent overflow
        const spaceOnRight = viewportWidth - buttonRect.right;
        const spaceOnLeft = buttonRect.left;
        
        if (spaceOnRight >= tooltipWidth + margin) {
          // Plenty of space on the right, position normally
          newPosition.left = `${buttonRect.left}px`;
        } else if (spaceOnLeft >= tooltipWidth + margin) {
          // Not enough space on right, but enough on left - align right edge
          newPosition.left = `${buttonRect.right - tooltipWidth}px`;
        } else {
          // Not enough space on either side, use right margin positioning
          newPosition.right = `${margin}px`;
        }
      }

      setPosition(newPosition);
    }
  }, [isVisible]);

  if (!tip) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsVisible(!isVisible)}
        className="w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
        style={{ fontSize: '10px' }}
      >
        ?
      </button>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop to close tooltip when clicking outside */}
          <div 
            className="fixed inset-0 bg-transparent cursor-default"
            style={{ zIndex: 999998 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
          />
          
          {/* Tooltip content */}
          <div 
            ref={tooltipRef}
            className="fixed w-80 max-w-[calc(100vw-2rem)] bg-black bg-opacity-95 text-white p-4 rounded-lg shadow-lg border border-gray-600 backdrop-blur-md"
            style={{ ...position, zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-sm text-blue-300">{tip.title}</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white ml-2 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{tip.content}</p>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}