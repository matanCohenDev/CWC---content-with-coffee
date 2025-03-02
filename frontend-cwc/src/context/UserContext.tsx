import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { fetchUser } from "../services/apiServices";

type User = {
  id: string;
  email: string;
  name?: string;
  favorite_coffee?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        console.log("User loaded:", userData);
      }
    };
    if (localStorage.getItem("accessToken")) {
      loadUser();
    }
  }, [localStorage.getItem("accessToken")]); 
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
