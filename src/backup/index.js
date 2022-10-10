import * as React from "react";
import netlifyIdentity from "netlify-identity-widget";

const Index = () => {
  React.useEffect(() => {
    netlifyIdentity.init({});
  });
  return <div>Hello</div>;
};

export default Index;
