import * as React from "react";
import { useEffect } from "react";
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
  useEffect(() => {
    console.log("inisde useffect of wrap root element");
    netlifyIdentity.init({});

    console.log("User is  : ", netlifyIdentity.currentUser());
  });
  netlifyIdentity.on("init", async () => {
    console.log("inside netlify identity init");
    if (netlifyIdentity.currentUser() !== null) {
      const response = await fetch("/.netlify/functions/authorize_user", {
        headers: {
          Authorization: `Bearer ${
            netlifyIdentity.currentUser().token.access_token
          }`,
        },
      });
      if (response.status !== 204) {
        console.log("Token failed to validate");
        netlifyIdentity.logout();
        window.location.replace("/login");
      } else console.log("User authorized");
    } else {
      if (window.location.pathname !== "/login/")
        window.location.replace("/login");
    }
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
