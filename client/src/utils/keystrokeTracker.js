let keystrokes = [];
let downEvents = {};

export const startKeystrokeCapture = (element) => {
  if (!element) return;

  keystrokes = [];
  downEvents = {};

  const onKeyDown = (e) => {
    const now = Date.now();
    downEvents[e.key] = now; // store key down time
  };

  const onKeyUp = (e) => {
    const now = Date.now();
    const downTime = downEvents[e.key];

    if (downTime) {
      keystrokes.push({
        key: e.key,
        downTime,
        upTime: now
      });
      delete downEvents[e.key];
    }
  };

  element.addEventListener('keydown', onKeyDown);
  element.addEventListener('keyup', onKeyUp);

  return () => {
    element.removeEventListener('keydown', onKeyDown);
    element.removeEventListener('keyup', onKeyUp);
  };
};

export const getKeystrokeData = () => keystrokes;
