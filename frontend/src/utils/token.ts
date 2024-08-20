export const getAuthToken: () => string | null = () => {
  return localStorage.getItem("token");
};

export const setAuthToken = (token: string) => {
  return localStorage.setItem("token", token);
};

export const removeAuthToken = () => {
  return localStorage.removeItem("token");
};
