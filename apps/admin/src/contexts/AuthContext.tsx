import { createContext, type ReactNode, useReducer, useState } from "react";
import {
  type ActionMap,
  type AuthContextType,
  type AuthState,
  type AuthUser,
  type ProfileAuthorization,
  type UpdateLocalUserPayload,
} from "@/types/auth";
import httpClient, { setHttpClientToken } from "@/services/httpClient";
import { type ApiError } from "@tribe-nest/frontend-shared";
import {
  type CreateAccountInput,
  type LoginInput,
} from "@/routes/_auth/-components/schema";

enum Types {
  Initial = "INITIALIZE",
  Login = "LOGIN",
  Logout = "LOGOUT",
  Register = "REGISTER",
  Loading = "LOADING",
  UpdateUser = "UPDATE_USER",
  UpdateErrorMessage = "UPDATE_ERROR_MESSAGE",
}
const ACCESS_TOKEN_KEY = "accessToken";

type AuthPayload = {
  [Types.Initial]: { isAuthenticated: boolean; user: AuthUser | null };
  [Types.Login]: { user: AuthUser | null };
  [Types.Logout]: undefined;
  [Types.Register]: { user: AuthUser | null };
  [Types.Loading]: { isLoading: boolean };
  [Types.UpdateUser]: { data: UpdateLocalUserPayload };
  [Types.UpdateErrorMessage]: { errorMessage: string | null };
};

export type AuthActions = ActionMap<AuthPayload>[keyof ActionMap<AuthPayload>];

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  isLoading: false,
  errorMessage: null,
  currentProfileAuthorization: null,
  setCurrentProfileAuthorization: () => {},
  initialize: () => Promise.resolve(false),
};

const AuthReducer = (state: AuthState, action: AuthActions): AuthState => {
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

const AuthContext = createContext<AuthContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(AuthReducer, initialState);
  const [currentProfileAuthorization, setCurrentProfileAuthorization] =
    useState<ProfileAuthorization | null>(null);

  const initialize = async () => {
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
  };

  // useEffect(() => {
  //   const initialize = async () => {
  //     try {
  //       const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  //       if (accessToken) {
  //         setHttpClientToken(accessToken);
  //         const response = await httpClient.get("/accounts/me");

  //         dispatch({
  //           type: Types.Initial,
  //           payload: { isAuthenticated: true, user: response.data },
  //         });
  //       } else {
  //         dispatch({
  //           type: Types.Initial,
  //           payload: { isAuthenticated: false, user: null },
  //         });
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       dispatch({
  //         type: Types.Initial,
  //         payload: { isAuthenticated: false, user: null },
  //       });
  //     }
  //   };

  //   initialize();
  // }, []);

  const login = async (data: LoginInput) => {
    dispatch({ type: Types.Loading, payload: { isLoading: true } });

    try {
      const response = await httpClient.post("sessions", data);
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

  const register = async (data: CreateAccountInput) => {
    dispatch({ type: Types.Loading, payload: { isLoading: true } });

    try {
      const response = await httpClient.post("/accounts", {
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
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        updateLocalUser,
        clearErrorMessage,
        refetchUser,
        setCurrentProfileAuthorization,
        currentProfileAuthorization,
        initialize,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
