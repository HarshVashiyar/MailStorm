import { useEffect, useRef } from 'react';

const MouseGradient = () => {
  const lastUpdateRef = useRef(0);
  const pendingPosition = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const updateGradient = () => {
      positionRef.current = { ...pendingPosition.current };
      const gradient = document.getElementById('mouse-gradient');
      if (gradient) {
        gradient.style.background = `radial-gradient(600px circle at ${positionRef.current.x}px ${positionRef.current.y}px, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 40%, transparent 100%)`;
      }
    };

    const handleMouseMove = (e) => {
      pendingPosition.current = { x: e.clientX, y: e.clientY };
      
      const now = Date.now();
      if (now - lastUpdateRef.current >= 100) {
        lastUpdateRef.current = now;
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            updateGradient();
            rafRef.current = null;
          });
        }
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
      id="mouse-gradient"
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        background: `radial-gradient(600px circle at 0px 0px, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 40%, transparent 100%)`
      }}
    />
  );
};

export default MouseGradient;
