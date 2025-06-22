"use client";
import React from 'react';

const EMOJIS = ['💰', '🎓', '📅', '✨', '🚀', '🏆', '📈', '🎯', '💡', '📚'];

const FloatingEmojis = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      {EMOJIS.concat(EMOJIS).map((emoji, i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 15}s`,
            bottom: '-50px',
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default FloatingEmojis;
