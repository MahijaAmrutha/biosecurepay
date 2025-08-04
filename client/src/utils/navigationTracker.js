let navigationLog = [];
let loginStartTime = null;

export const recordNavigation = (page) => {
  navigationLog.push({ page, time: new Date().toISOString() });

  if (page === 'Login') {
    loginStartTime = Date.now();
  }
};

export const getNavigationData = () => navigationLog;

export const endLoginTimer = () => {
  if (!loginStartTime) return null;
  const duration = Date.now() - loginStartTime;
  return duration; // duration in ms
};
