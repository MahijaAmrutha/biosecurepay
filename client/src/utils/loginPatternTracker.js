let loginStart = null;

export const startLoginTimer = () => {
  loginStart = Date.now();
};

export const endLoginTimer = () => {
  return loginStart ? Date.now() - loginStart : 0;
};
