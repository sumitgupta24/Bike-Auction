import React, { useState, useEffect, useRef } from 'react';

const Countdown = ({ targetDate, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const initialDistanceRef = useRef(null);

  useEffect(() => {
    const end = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = end - now;

      if (initialDistanceRef.current === null) {
        initialDistanceRef.current = distance;
      }

      if (distance < 0) {
        setTimeLeft('Ended');
        if (!isEnded) {
          setIsEnded(true);
          if (initialDistanceRef.current > 0 && onEnd) {
            onEnd();
          }
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate, isEnded]);

  return <span className="font-mono text-sm tracking-widest text-slate-300">{timeLeft}</span>;
};

export default Countdown;
