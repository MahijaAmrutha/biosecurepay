let touches = [];

export const startTouchTracking = (element = document) => {
  const handleStart = (e) => {
    const t = e.touches[0];
    touches.push({ type: 'start', x: t.clientX, y: t.clientY, time: Date.now() });
  };

  const handleEnd = (e) => {
    touches.push({ type: 'end', time: Date.now() });
  };

  element.addEventListener('touchstart', handleStart);
  element.addEventListener('touchend', handleEnd);

  return () => {
    element.removeEventListener('touchstart', handleStart);
    element.removeEventListener('touchend', handleEnd);
  };
};

export const getTouchData = () => touches;
