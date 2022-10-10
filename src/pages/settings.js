import * as React from "react";
import { useEffect, useState, useRef, useReducer } from "react";
import netlifyIdentity from "netlify-identity-widget";
import GoTrue from "gotrue-js";

//------- custom components ---------------
import { WrapRootElement } from "../pagesWrapper/wrap-root-element";

//------- custom css ----------------------
import * as styles from "../css/settings.module.css";
//-------- MUI -------------------------
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteUserBtn from "../components/DeleteUserBtn/DeleteUserBtn";
import NavBar from "../components/NavBar/NavBar";

const Settings = () => {
  //--------- states---------------
  const [editingSettingNo, setEdittingSettingNo] = useState(-1);
  const [isUpdating, setUpdating] = useState(false);
  const [GeneralSettings, setGeneralSettings] = useState(null);
  //------------ Ref ------------------
  const editingFieldRef = useRef(null);
  //---- force Update --------------
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  //------------ settings ---------------
  //------------- use Effect ------------------ don't manipulate dom before it is loaded ----------
  useEffect(() => {
    //----- if user not logged in go to login page --------------------
    netlifyIdentity.on("");
    netlifyIdentity.init({});
    if (netlifyIdentity.currentUser() === null)
      window.location.replace("login");
    else {
      //-------- updating the general settings array -------------
      updateGeneralSettings(netlifyIdentity.currentUser());
    }

    const auth = new GoTrue({
      APIUrl: netlifyIdentity.currentUser().api.apiURL,
    });
    const user = auth.currentUser();
    console.log("[Inside useEffect()] Go true =>  ", user);

    (async () => {
      console.log(netlifyIdentity.currentUser());
      try {
        const response = await (
          await fetch("/.netlify/functions/log_identity", {
            headers: {
              Authorization: `Bearer ${
                netlifyIdentity.currentUser().token.access_token
              }`,
            },
          })
        ).json();
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  //------------------- Utlity Functions --------------------------

  //--------------------- SETTINGS ------------------------------
  function updateGeneralSettings(user) {
    // this array will be displayed and it has name and onEdit func which gets called when we update that field

    setGeneralSettings([
      {
        name: "name",
        value: user.user_metadata.full_name,
        onEdit: async (full_name) => {
          try {
            const user = await UpdateUserData({ full_name: full_name });
            return user;
          } catch (err) {
            return new Error("Failed To Update Name");
          }
        },
      },
      {
        name: "Password",
        value: ".........",
        onEdit: async (new_password) => {
          try {
            const user = await UpdateUserPassword(new_password);
            return user;
          } catch (err) {
            return new Error("Failed To Update Password");
          }
        },
      },
    ]);
    console.log("Settings are Updated : ", GeneralSettings);
  }

  /////////////////////////////////////////////////////////////////////////////////
  //////////////////////////     RENDERING    /////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  if (netlifyIdentity.currentUser() === null) {
    return (
      <div style={{ textAlign: "center", margin: "8rem" }}>
        <CircularProgress size="5rem" />
      </div>
    );
  }
  return (
    <WrapRootElement>
      <div>
        <NavBar />
        <h1>Settings</h1>
        <div className={styles.div}>
          <div className={styles.leftDiv}>
            <div>General</div>
          </div>
          <div className={styles.rightDiv}>
            <h2 className={styles.sectionTitle}>General Settings</h2>
            <p className={styles.sectionTitleDesc}>
              General information about you
            </p>
            <div className={styles.settingsDiv}>
              {GeneralSettings.map((setting, index) => {
                return (
                  <Grid container rowSpacing={2} key={index}>
                    <Grid item xs={3}>
                      <p>{setting.name}</p>
                    </Grid>
                    {/* If this field is in editing mode show editor text field else just show the data */}
                    {index === editingSettingNo ? (
                      <>
                        <Grid item xs={9}>
                          <TextField
                            variant="outlined"
                            size="small"
                            inputRef={editingFieldRef}
                            label={setting.value}
                          />
                        </Grid>
                        <Grid container justifyContent="space-around">
                          <Grid item>
                            <Button
                              variant="contained"
                              disabled={isUpdating ? true : false}
                              onClick={async (e) => {
                                //----- diabling the button
                                setUpdating(true);
                                try {
                                  //------ sending request to server --------------
                                  const user = await setting.onEdit(
                                    editingFieldRef.current.value
                                  );
                                  updateGeneralSettings(user);
                                  setEdittingSettingNo(-1);
                                } catch (err) {
                                  console.log(err);
                                }
                                setUpdating(false);
                              }}
                            >
                              Update
                            </Button>
                          </Grid>
                          <Grid item>
                            <IconButton
                              color="secondary"
                              aria-label="Cancel"
                              onClick={() => {
                                setEdittingSettingNo(-1);
                              }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={7}>
                          <p>{setting.value}</p>
                        </Grid>

                        <Grid item xs={2}>
                          <IconButton
                            color="primary"
                            aria-label="Edit"
                            onClick={() => {
                              setEdittingSettingNo(index);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Grid>
                      </>
                    )}
                  </Grid>
                );
              })}
            </div>
            <DeleteUserBtn style={{ marginTop: "3rem" }} />
          </div>
        </div>
      </div>
    </WrapRootElement>
  );
};

export default Settings;

export const Head = () => <title>Settings</title>;

//--------------- Utility Functions --------------------------
async function UpdateUserData(attribute) {
  const auth = new GoTrue({
    APIUrl: netlifyIdentity.currentUser().api.apiURL,
  });
  try {
    const user = auth.currentUser();
    console.log("[Inside UpdateUserData()] Go true =>  ", user);
    console.log("updating user ");
    const response = await user.update({
      email: user.email,
      //   password: "12345q",
      data: {
        ...attribute,
      },
    });
    console.log("[Inside UpdateUserData()] User Data Updated : ", response);
    return user;
  } catch (err) {
    console.log("[Inside UpdateUserData()]  Error ! : ", err);
  }
}
async function UpdateUserPassword(new_password) {
  const auth = new GoTrue({
    APIUrl: netlifyIdentity.currentUser().api.apiURL,
  });
  try {
    const user = auth.currentUser();
    console.log("[Inside UpdatPassword()] Go true =>  ", user);
    console.log("updating user ");
    const response = await user.update({
      email: user.email,
      password: new_password,
    });
    console.log("[Inside UpdatePassword()] User Password Updated : ", response);
    return user;
  } catch (err) {
    console.log("[Inside UpdatePassword()]  Error ! : ", err);
  }
}
