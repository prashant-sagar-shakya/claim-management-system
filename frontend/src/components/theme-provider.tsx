import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/context/auth-context";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setAppTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setAppTheme: () => {},
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "insurance-theme",
  ...props
}: ThemeProviderProps) {
  const { user, updateProfile, isLoading: isAuthLoading } = useAuth();

  const [theme, setThemeState] = useState<Theme>(() => {
    if (
      !isAuthLoading &&
      user?.themePreference &&
      ["light", "dark", "system"].includes(user.themePreference)
    ) {
      return user.themePreference as Theme;
    }
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
      return storedTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    let effectiveTheme = theme;
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      effectiveTheme = systemPrefersDark ? "dark" : "light";
    }
    root.classList.add(effectiveTheme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  useEffect(() => {
    if (!isAuthLoading && user?.themePreference) {
      const backendTheme = user.themePreference as Theme;
      if (
        ["light", "dark", "system"].includes(backendTheme) &&
        backendTheme !== theme
      ) {
        setThemeState(backendTheme);
      }
    }
  }, [user?.themePreference, isAuthLoading]);

  const syncThemeWithBackend = useCallback(
    async (newTheme: Theme) => {
      if (user && user.id && !isAuthLoading) {
        if (user.themePreference !== newTheme) {
          try {
            await updateProfile({ themePreference: newTheme }, false);
          } catch (error) {
            console.error("Failed to silently sync theme with backend:", error);
          }
        }
      }
    },
    [user, updateProfile, isAuthLoading]
  );

  const handleSetAppTheme = useCallback(
    (newTheme: Theme) => {
      if (theme !== newTheme) {
        setThemeState(newTheme);
        syncThemeWithBackend(newTheme);
      }
    },
    [theme, syncThemeWithBackend, setThemeState]
  );

  const value = {
    theme,
    setAppTheme: handleSetAppTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  if (typeof context.setAppTheme !== "function") {
    return {
      ...context,
      setAppTheme: () => {
        console.error(
          "Attempted to call setAppTheme when it was not a function in the context, returning dummy."
        );
      },
    };
  }
  return context;
};
