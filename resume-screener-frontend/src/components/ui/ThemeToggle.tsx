// src/components/ThemeToggle.tsx
import { useTheme } from "@/lib/ThemeContext";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted transition"
        >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};
