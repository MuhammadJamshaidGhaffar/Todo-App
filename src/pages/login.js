import * as React from "react";
import { useEffect } from "react";

import netlifyIdentity from "netlify-identity-widget";
import { navigate } from "gatsby";
import { WrapRootElement } from "../pagesWrapper/wrap-root-element";

const Login = () => {
  useEffect(() => {
    //-------- If already logged in redirct it to index ------------
    netlifyIdentity.init({});
    if (netlifyIdentity.currentUser() !== null) window.location.replace("/");
    netlifyIdentity.open();
  });

  //---- When logged in redirect it to index page
  netlifyIdentity.on("login", () => {
    console.log("redirecting to index page");
    setTimeout(() => {
      window.location.replace("/");
    }, 1000);
  });
  return (
    <WrapRootElement>
      <div>
        <h1>Login to Todo App</h1>
        <button
          onClick={() => {
            netlifyIdentity.open();
          }}
        >
          Login
        </button>
      </div>
    </WrapRootElement>
  );
};

export default Login;

export const Head = () => <title>Login</title>;
