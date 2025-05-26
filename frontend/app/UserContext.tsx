import { User } from "@/lib/User";
import { createContext } from "react";

interface UserContextType {
  user: User | null;
  loading: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});
