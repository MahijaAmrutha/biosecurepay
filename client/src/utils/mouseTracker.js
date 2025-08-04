let mouseMovements = [];

export const startMouseTracking = () => {
  mouseMovements = [];

  const onMouseMove = (e) => {
    mouseMovements.push({
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    });
  };

  window.addEventListener('mousemove', onMouseMove);

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
  };
};

export const getMouseData = () => mouseMovements;
