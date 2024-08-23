export const getAuthToken: () => string | null = () => {
  return localStorage.getItem("token");
};

export const setAuthToken = (token: string) => {
  return localStorage.setItem("token", token);
};

export const removeAuthToken = () => {
  return localStorage.removeItem("token");
};

export const getUserRole: () => string | null = () => {
  return localStorage.getItem("userRole");
};

export const setUserRole = (userType: string) => {
  return localStorage.setItem("userRole", userType);
};

export const removeUserRole = () => {
  return localStorage.removeItem("userRole");
};

export const ADMIN = "admin";
export const USER = "user";