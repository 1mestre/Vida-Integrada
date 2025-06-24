"use client";
import React, { useEffect, useState } from 'react';

const EMOJIS = ['💰', '🎓', '📅', '✨', '🚀', '🏆', '📈', '🎯', '💡', '📚'];

interface EmojiStyle {
  left: string;
  animation: string;
  animationDelay: string;
  bottom: string;
}

const FloatingEmojis = () => {
  const [styles, setStyles] = useState<EmojiStyle[]>([]);

  useEffect(() => {
    // This code runs only on the client, after the initial render.
    const generatedStyles = EMOJIS.concat(EMOJIS).map(() => ({
      left: `${Math.random() * 100}%`,
      animation: `float ${Math.random() * 10 + 10}s linear infinite`,
      animationDelay: `${Math.random() * 15}s`,
      bottom: '-50px',
    }));
    setStyles(generatedStyles);
  }, []); // Empty dependency array ensures this runs only once on mount

  if (styles.length === 0) {
    return null; // Don't render anything on the server or during initial client render.
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-5 pointer-events-none">
      {EMOJIS.concat(EMOJIS).map((emoji, i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={styles[i]}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default FloatingEmojis;
