// src/lib/ThemeContext.ts
import { createContext, useContext } from "react";

type ThemeContextType = {
    theme: "light" | "dark";
    toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);
