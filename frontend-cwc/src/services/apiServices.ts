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

const googleclientid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const getGoogleClientId = () => {
  return googleclientid;
};
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

export interface Post {
  content: string;
  image: string;
  userId: string;
}

export const createPost = async (postContent: string, image: string) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Access token חסר");
    }
    const userId = getUserIdFromToken(accessToken);
    if (!userId) {
      throw new Error("לא ניתן לחלץ את מזהה המשתמש מה-token");
    }

    const post: Post = {
      content: postContent,
      image: image, 
      userId,
    };

    console.log("Post object:", post);

    const response = await api.post("/api/post/createPost", post, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Failed to create post:", error);
    return null;
  }
};

export const uploadImage = async (image: File , postContent: string) => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("postContent", postContent);

    const response = await api.post("/upload/post", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data.imageUrl;
  }
  catch (error) {
    console.error("Failed to upload image:", error);
    return null;
  }
};

export const getUserIdFromToken = (token: string) => {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded._id; 
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};


export const generateContent = async (prompt: string) => {
  try {
    const response = await api.post("/api/auth/generateContent", { message: prompt });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export function getAllUsers() {
  return api.get("/api/user/getUsers");
}

export const getPosts = async () => {
  try {
    const response = await api.get("/api/post/getPosts");
    return response.data.posts;
  } catch (error) {
    throw error;
  }
}

export const urlImage = (image: string) => {
  return `${baseURL}/uploads/posts/${image}`;
}

export const getUsernameById = async (userId: string) => {
  try {
    const response = await api.get(`/api/auth/getUserNameById/${userId}`);
    return response.data.username;
  } catch (error) {
    console.error("Error fetching username:", error);
    throw error;
  }
};

export const googleLoginUser = async (
  token: string,
  setUser: (user: User | null) => void
) => {
  try {
    const response = await api.post("/api/auth/google", { token });

    localStorage.setItem("accessToken", response.data.accessToken);

    const userData = await fetchUser();
    if (userData) {
      setUser(userData);
    }

    return response.data;
  } catch (error) {
    console.error("Error during Google login:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await api.post("/api/auth/logout");
    return true;
  } catch (error) {
    console.error("Logout failed", error);
    return false;
  }
};

export const getUserNameDatails = async (userId: string) => {
  try {
    const response = await api.get(`/api/user/getUserById/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching username:", error);
    throw error;
  }
}

export const likePost = async (postId: string) => {
  try {
    const response = await api.post("/api/like/createLike", { postId }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        _id: getUserIdFromToken(localStorage.getItem("accessToken") || ""),
      },
    });

    await api.post(`/api/post/likePost/${postId}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
}

export const removeLike = async (likeId: string , postId: string) => {
  try {
    const response = await api.delete(`/api/like/deleteLike/${likeId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    await api.delete(`/api/post/removeLike/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error removing like:", error);
    throw error;
  }
}

export const checkIfUserAlreadyLiked = async (postId: string) => {
  try{
    const response = await api.get(`/api/like/getLikesByPostId/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching likes:", error);
    throw error;
  }
}




 








