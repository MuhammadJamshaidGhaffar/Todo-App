import { Button } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import netlifyIdentity from "netlify-identity-widget";

const DeleteUserBtn = ({ style }) => {
  const [isClicked, setClicked] = useState(false);

  async function deleteUser() {
    setClicked(true);
    try {
      const response = await fetch("/.netlify/functions/delete_user", {
        headers: {
          Authorization: `Bearer ${
            netlifyIdentity.currentUser().token.access_token
          }`,
        },
      });
      console.log("Response is : ", response);
      if (response.status === 204) {
        console.log("[Inside UpdateUserData()] User Deleted ");
        netlifyIdentity.logout();
        window.location.replace("/login");
      } else {
        const data = await response.json();
        console.log("Failed to delete user : ", data.error);
      }
    } catch (err) {
      console.log("[Inside UpdateUserData()]  Error ! : ", err);
    }
    setClicked(false);
  }

  return (
    <Button
      style={style}
      variant="contained"
      disabled={isClicked ? true : false}
      onClick={() => {
        deleteUser();
      }}
    >
      Delete Account
    </Button>
  );
};

export default DeleteUserBtn;
