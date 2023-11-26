import React, { createContext, useMemo, memo } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  Theme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useLocalStorage from "../hooks/useLocalStorage";

type DarkMode = "dark" | "light";

interface ThemeContextProps {
  theme: Theme;
  darkMode: DarkMode;
  setDarkMode: React.Dispatch<React.SetStateAction<DarkMode>>;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: {} as Theme,
  darkMode: "dark" as DarkMode,
  setDarkMode: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useLocalStorage<DarkMode>("dark", "dark");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode === "dark" ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const providerValue = useMemo((): ThemeContextProps => {
    return {
      theme,
      darkMode,
      setDarkMode,
    };
  }, [theme, darkMode, setDarkMode]);

  return (
    <ThemeContext.Provider value={providerValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default memo(ThemeProvider);
