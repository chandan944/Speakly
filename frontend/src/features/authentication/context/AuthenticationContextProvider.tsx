import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { request } from "../../../utils/api";
import { LoadingSpinner } from "../../../components/loader/LoadingSpinner";

interface AuthenticationResponse {
  token: string;
  messgage: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  profileComplete: boolean;
  profilePicture?: string;
}

interface AuthenticationContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  ouathLogin: (code: string, page: "login" | "signup") => Promise<void>;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(
  null
);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthentication() {
  return useContext(AuthenticationContext)!;
}

export function AuthenticationContextProvider() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOnAuthPage =
    location.pathname === "/authentication/login" ||
    location.pathname === "/authentication/signup" ||
    location.pathname === "/authentication/request-password-reset";

  const login = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      request<AuthenticationResponse>({
        endpoint: "/api/v1/authentication/login",
        method: "POST",
        body: JSON.stringify({ email, password }),
        onSuccess: ({ token }) => {
          localStorage.setItem("token", token);
          resolve();
        },
        onFailure: (error) => {
          reject(new Error(error));
        },
      });
    });
  };

  const ouathLogin = async (code: string, page: "login" | "signup") => {
    await request<AuthenticationResponse>({
      endpoint: "/api/v1/authentication/oauth/google/login",
      method: "POST",
      body: JSON.stringify({ code, page }),
      onSuccess: ({ token }) => {
        localStorage.setItem("token", token);
      },
      onFailure: (error) => {
        throw new Error(error);
      },
    });
  };
  const signup = async (email: string, password: string) => {
    await request<AuthenticationResponse>({
      endpoint: "/api/v1/authentication/register",
      method: "POST",
      body: JSON.stringify({ email, password }),
      onSuccess: ({ token }) => {
        localStorage.setItem("token", token); // 💾 Save token
      },
      onFailure: (error) => {
        throw new Error(error); // ❌ Handle error
      },
    });
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
 if (user) {
      return;
    }
  const token = localStorage.getItem("token");
  if (!token) {
    setIsLoading(false); // 🚫 No token = no need to fetch user
    return;
  }

  setIsLoading(true);

    const fetchUser = async () => {
      await request<User>({
        endpoint: "/api/v1/authentication/users/me",
        onSuccess: (data) => setUser(data),
        onFailure: (error) => {
          console.log(error);
        },
      });
      setIsLoading(false);
    };
    fetchUser();
    
  }, [location.pathname, user]);
  console.log("user profile complte : "+user?.profileComplete);
  console.log("user : "+user);
      
  if (isLoading) return <LoadingSpinner />;

  if (!isLoading && !user && !isOnAuthPage) {
    return (
      <Navigate
        to="/authentication/login"
        state={{ from: location.pathname }}
      />
    );
  }

  if (
    user &&
    !user.emailVerified &&
    location.pathname !== "/authentication/verify-email"
  ) {
    return <Navigate to="/authentication/verify-email" />;
  }

    if (
    user &&
    user.emailVerified &&
    !user.profileComplete &&
    !location.pathname.includes("/authentication/profile")
  ) {
    return <Navigate to={`/authentication/profile/${user.id}`} />;
  }

  if (
    user &&
    user.emailVerified &&
    location.pathname == "/authentication/verify-email"
  ) {
    return <Navigate to="/" />;
  }



  if (
    user &&
    user.emailVerified &&
    user.profileComplete &&
    location.pathname.includes("/authentication/profile")
  ) {
    return <Navigate to="/" />;
  }

  if (user && isOnAuthPage) {
    return <Navigate to={location.state?.from || "/"} />;
  }
  return (
    <AuthenticationContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        setUser,
        ouathLogin,
      }}
    >
      <Outlet />
    </AuthenticationContext.Provider>
  );
}
