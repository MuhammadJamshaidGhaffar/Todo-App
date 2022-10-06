import * as React from "react";
import netlifyIndetity from "netlify-identity-widget";

export default function () {
  netlifyIndetity.init({ APIUrl });
  netlifyIndetity.open();
  return <div>Hello World</div>;
}
