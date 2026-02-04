import { useEffect, useRef, useState } from 'react';

const MouseGradient = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const pendingPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      pendingPosition.current = { x: e.clientX, y: e.clientY };

      // Throttle updates using requestAnimationFrame (60fps cap)
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setMousePosition(pendingPosition.current);
          rafRef.current = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 40%, transparent 100%)`
      }}
    />
  );
};

export default MouseGradient;


