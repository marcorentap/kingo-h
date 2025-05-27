"use client";

import { User } from "@/lib/User";
import { createContext, Dispatch, SetStateAction } from "react";

interface UserContextType {
  setUser: Dispatch<SetStateAction<User | null>>;
  user: User | null;
  loading: boolean;
}

export const UserContext = createContext<UserContextType>({
  setUser: () => {},
  user: null,
  loading: true,
});
