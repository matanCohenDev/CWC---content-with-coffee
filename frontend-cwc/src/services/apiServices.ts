import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  favorite_coffee?: string;
  location?: string;
}
const baseURL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const generateContent = async (prompt: string) => {
  try {
    const response = await api.post("/api/auth/generateContent", { message: prompt });
    return response.data;
  } catch (error) {
    throw error;
  }
}


export const loginUser = async (email: string, password: string, setUser: (user: User | null) => void) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });

    localStorage.setItem("accessToken", response.data.accessToken);

    const userData = await fetchUser();
    if (userData) {
      setUser(userData); 
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};


export const registerUser = async (userData: {
  name?: string;
  email: string;
  password: string;
  bio?: string;
  favorite_coffee?: string;
  location?: string;
}) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const refreshAccessToken = async () => {
  try {
    const response = await api.post("/api/auth/refresh"); 
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    console.error("Failed to refresh token", error);
    return null;
  }
};
export const fetchUser = async () => {
  try {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.warn("No access token found, trying to refresh...");
      accessToken = await refreshAccessToken();  
    }

    if (!accessToken) {
      console.warn("Failed to refresh token. User is not logged in.");
      return null;
    }

    const response = await api.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};

