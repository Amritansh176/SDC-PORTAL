import React, { useState, useEffect, useRef } from 'react';

export const Card = ({ children, style, className }) => {
  return (
    <div 
      className={`glass-panel ${className || ''}`}
      style={{ 
        padding: '2rem', 
        borderRadius: '16px', 
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        width: '100%',
        maxWidth: '400px',
        ...style 
      }}
    >
      {children}
    </div>
  );
};

const CardSwap = ({ 
  children, 
  cardDistance = 60, 
  verticalDistance = 70, 
  delay = 5000, 
  pauseOnHover = false 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cards = React.Children.toArray(children);
  const totalCards = cards.length;

  useEffect(() => {
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
    }, delay);

    return () => clearInterval(timer);
  }, [activeIndex, totalCards, delay, pauseOnHover, isHovered]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        perspective: '1000px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNext}
    >
      {cards.map((card, index) => {
        // Calculate relative index
        let diff = index - activeIndex;
        if (diff < 0) diff += totalCards; // wrap around

        // The active card has diff 0, background cards have diff 1, 2...
        // For simplicity, we'll only show up to 3 cards visibly, rest are hidden
        const isVisible = diff < 3;
        
        const zIndex = totalCards - diff;
        const translateY = diff * verticalDistance;
        const scale = 1 - (diff * (cardDistance / 1000));
        const opacity = diff === 0 ? 1 : diff === 1 ? 0.7 : diff === 2 ? 0.4 : 0;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: `translateY(${translateY}px) scale(${scale})`,
              zIndex,
              opacity,
              pointerEvents: diff === 0 ? 'auto' : 'none',
              cursor: diff === 0 ? 'pointer' : 'default',
            }}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
};

export default CardSwap;
