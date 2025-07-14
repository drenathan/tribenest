"use client";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useReducer } from "react";
import {
  type ApiError,
  type PublicAuthUser,
  type UpdateLocalUserPayload,
  type ActionMap,
  type PublicAuthState,
  type PublicAuthContextType,
} from "../types";
import { type AxiosInstance } from "axios";
import type { CreateAccountInput, LoginInput, PublicCreateAccountInput } from "../schema/auth";

enum Types {
  Initial = "INITIALIZE",
  Login = "LOGIN",
  Logout = "LOGOUT",
  Register = "REGISTER",
  Loading = "LOADING",
  UpdateUser = "UPDATE_USER",
  UpdateErrorMessage = "UPDATE_ERROR_MESSAGE",
}
const ACCESS_TOKEN_KEY = "public-access-token";

type AuthPayload = {
  [Types.Initial]: { isAuthenticated: boolean; user: PublicAuthUser | null };
  [Types.Login]: { user: PublicAuthUser | null };
  [Types.Logout]: undefined;
  [Types.Register]: { user: PublicAuthUser | null };
  [Types.Loading]: { isLoading: boolean };
  [Types.UpdateUser]: { data: UpdateLocalUserPayload };
  [Types.UpdateErrorMessage]: { errorMessage: string | null };
};

export type AuthActions = ActionMap<AuthPayload>[keyof ActionMap<AuthPayload>];

const initialState: PublicAuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  isLoading: false,
  errorMessage: null,
  initialize: () => Promise.resolve(false),
};

const AuthReducer = (state: PublicAuthState, action: AuthActions): PublicAuthState => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
        isLoading: false,
      };
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoading: false,
        errorMessage: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        errorMessage: null,
      };
    case "REGISTER":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoading: false,
        errorMessage: null,
      };
    case Types.Loading:
      return {
        ...state,
        isLoading: action.payload.isLoading,
        errorMessage: action.payload.isLoading ? null : state.errorMessage,
      };
    case Types.UpdateUser:
      return { ...state, user: { ...state.user!, ...action.payload.data } };
    case Types.UpdateErrorMessage:
      return { ...state, errorMessage: action.payload.errorMessage };
    default:
      return state;
  }
};

const PublicAuthContext = createContext<PublicAuthContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
  httpClient: AxiosInstance;
  setHttpClientToken: (token: string) => void;
};

function PublicAuthProvider({ children, httpClient, setHttpClientToken }: AuthProviderProps) {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (accessToken) {
        setHttpClientToken(accessToken);
        const response = await httpClient.get("/accounts/me");

        dispatch({
          type: Types.Initial,
          payload: { isAuthenticated: true, user: response.data },
        });
        return true;
      } else {
        dispatch({
          type: Types.Initial,
          payload: { isAuthenticated: false, user: null },
        });
        return false;
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.Initial,
        payload: { isAuthenticated: false, user: null },
      });
      return false;
    }
  }, [httpClient, setHttpClientToken]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = async (data: LoginInput) => {
    dispatch({ type: Types.Loading, payload: { isLoading: true } });

    try {
      const response = await httpClient.post("/sessions", data);
      const { token, account } = response.data;
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      setHttpClientToken(token);
      dispatch({ type: Types.Login, payload: { user: account } });
    } catch (err: unknown) {
      const error = err as ApiError;
      dispatch({ type: Types.Loading, payload: { isLoading: false } });
      throw error;
    }
  };

  const refetchUser = async () => {
    try {
      const response = await httpClient.get("/accounts/me");
      dispatch({
        type: Types.Initial,
        payload: { isAuthenticated: true, user: response.data },
      });
    } catch (error: unknown) {
      console.error(error);
      dispatch({
        type: Types.Initial,
        payload: { isAuthenticated: false, user: null },
      });
    }
  };

  const register = async (data: PublicCreateAccountInput) => {
    dispatch({ type: Types.Loading, payload: { isLoading: true } });

    try {
      const response = await httpClient.post("/public/accounts", {
        ...data,
      });
      const { token, account } = response.data;
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      setHttpClientToken(token);

      dispatch({ type: Types.Register, payload: { user: account } });
    } catch (err: unknown) {
      const error = err as ApiError;
      dispatch({ type: Types.Loading, payload: { isLoading: false } });
      throw error;
    }
  };

  const logout = async (persist = true) => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      dispatch({ type: Types.Logout });
      if (persist) await httpClient.delete("/sessions");
    } catch (error) {
      console.error(error);
    }
  };

  const updateLocalUser = (data: UpdateLocalUserPayload) => {
    dispatch({ type: Types.UpdateUser, payload: { data } });
  };

  const clearErrorMessage = () => {
    dispatch({
      type: Types.UpdateErrorMessage,
      payload: { errorMessage: null },
    });
  };

  return (
    <PublicAuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        updateLocalUser,
        clearErrorMessage,
        refetchUser,
        initialize,
      }}
    >
      {children}
    </PublicAuthContext.Provider>
  );
}

export const usePublicAuth = () => {
  const context = useContext(PublicAuthContext);
  if (!context) {
    throw new Error("usePublicAuth must be used within a PublicAuthProvider");
  }
  return context;
};

export { PublicAuthContext, PublicAuthProvider };
