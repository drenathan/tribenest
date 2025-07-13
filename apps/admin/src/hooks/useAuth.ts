import { AuthContext } from "@/contexts/AuthContext";
import { isNil } from "lodash";
import { useContext } from "react";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (isNil(context)) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
