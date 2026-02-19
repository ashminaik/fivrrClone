'use client';

import { useState, useRef, useEffect } from 'react';

export default function PriceSlider({ min = 0, max = 10000, value, onChange, label = 'Price Range' }) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const updateValue = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    onChange(newValue);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    updateValue(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</label>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}>₹{value.toLocaleString()}</span>
      </div>
      <div
        ref={sliderRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '8px',
          background: 'var(--color-surface-hover)',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${percentage}%`,
            height: '100%',
            background: 'var(--color-primary)',
            borderRadius: '4px',
            transition: isDragging ? 'none' : 'width 0.2s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 12px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            background: 'white',
            border: '2px solid var(--color-primary)',
            borderRadius: '50%',
            cursor: isDragging ? 'grabbing' : 'grab',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: isDragging ? 'none' : 'left 0.2s ease',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDragging(true);
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>₹{min.toLocaleString()}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>₹{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
