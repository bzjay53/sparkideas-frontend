'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import './LinearCarousel.styles.css';

export interface CarouselItem {
  id: string;
  content: ReactNode;
  title?: string;
  description?: string;
  image?: string;
}

export interface LinearCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  infinite?: boolean;
  itemsPerView?: number;
  spaceBetween?: number;
  className?: string;
}

export const LinearCarousel: React.FC<LinearCarouselProps> = ({
  items,
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  infinite = true,
  itemsPerView = 1,
  spaceBetween = 16,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  // Auto play functionality
  useEffect(() => {
    if (autoPlay && totalItems > itemsPerView) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, currentIndex, totalItems, itemsPerView]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (infinite) {
      setCurrentIndex(maxIndex);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    } else if (infinite) {
      setCurrentIndex(0);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(Math.min(index, maxIndex));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      handlePrevious();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    }
  };

  const translateX = -(currentIndex * (100 / itemsPerView));

  return (
    <div 
      className={`linear-carousel ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="이미지 캐러셀"
    >
      <div className="carousel-container">
        <div 
          ref={carouselRef}
          className="carousel-track"
          style={{
            transform: `translateX(${translateX}%)`,
            gap: `${spaceBetween}px`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="carousel-item"
              style={{ 
                minWidth: `calc(${100 / itemsPerView}% - ${spaceBetween * (itemsPerView - 1) / itemsPerView}px)` 
              }}
              aria-hidden={index < currentIndex || index >= currentIndex + itemsPerView}
            >
              {item.image && (
                <div className="carousel-item-image">
                  <img src={item.image} alt={item.title || `슬라이드 ${index + 1}`} />
                </div>
              )}
              <div className="carousel-item-content">
                {item.title && (
                  <h3 className="carousel-item-title">{item.title}</h3>
                )}
                {item.description && (
                  <p className="carousel-item-description">{item.description}</p>
                )}
                {item.content}
              </div>
            </div>
          ))}
        </div>

        {showArrows && totalItems > itemsPerView && (
          <>
            <button
              className={`carousel-arrow carousel-arrow-prev ${currentIndex === 0 && !infinite ? 'disabled' : ''}`}
              onClick={handlePrevious}
              disabled={currentIndex === 0 && !infinite}
              aria-label="이전 슬라이드"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className={`carousel-arrow carousel-arrow-next ${currentIndex === maxIndex && !infinite ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={currentIndex === maxIndex && !infinite}
              aria-label="다음 슬라이드"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {showDots && totalItems > itemsPerView && (
        <div className="carousel-dots" role="tablist">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`슬라이드 ${index + 1}로 이동`}
              role="tab"
              aria-selected={index === currentIndex}
            />
          ))}
        </div>
      )}

      {/* Progress indicator for auto-play */}
      {autoPlay && (
        <div className="carousel-progress">
          <div 
            className="carousel-progress-bar"
            style={{ 
              animationDuration: `${autoPlayInterval}ms`,
              animationPlayState: isTransitioning ? 'paused' : 'running'
            }}
          />
        </div>
      )}
    </div>
  );
};