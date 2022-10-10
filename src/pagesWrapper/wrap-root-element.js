import * as React from "react";
import netlifyIdentity from "netlify-identity-widget";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./style.css";

export const themeOptions = {
  palette: {
    type: "light",
    primary: {
      main: "#64dd17",
      light: "rgb(131, 227, 69)",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff0000",
    },
    success: {
      main: "#76ff03",
    },
    error: {
      main: "#ff0606",
    },
  },
};

const theme = createTheme(themeOptions);

export const WrapRootElement = ({ children }) => {
  //----- Initializing Identity ------------------

  // netlifyIdentity.init({});
  // console.log("User is  : ", netlifyIdentity.currentUser());

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
