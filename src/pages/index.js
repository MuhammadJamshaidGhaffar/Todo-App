//------- libraries & plugins -----------------
import * as React from "react";
import { useState, useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";
import dayjs from "dayjs";
import faunadb from "faunadb";

// ------ custom components -----------
import NavBar from "../components/NavBar/NavBar";
import AddTodo from "../components/AddTodo/AddTodo";
import { WrapRootElement } from "../pagesWrapper/wrap-root-element";

//----------- MUI -----------------------
import { Button, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
//-------- theme ----------
import { themeOptions } from "../pagesWrapper/wrap-root-element";
import { navigate } from "gatsby";

const Index = () => {
  //--------------- States ---------------------
  const [userData, setUserData] = useState(null);
  const [isNewTodoClicked, setNewTodoClicked] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(-1);
  const [editingTodo, setEditingTodo] = useState("");
  const [editingPlace, setEditingPlace] = useState("");
  const [editingDateTime, setEditingDateTime] = useState(0);

  // //----------- fetching data if it's empty ----------------
  useEffect(() => {
    //------redirect if not logged in ------------
    netlifyIdentity.init({});
    if (netlifyIdentity.currentUser() === null)
      window.location.replace("/login");

    console.log("Netlify Identity : ", netlifyIdentity.currentUser());
    //--------- Getting data from fauna db ------------------
    async function getUserData() {
      //--- init fauna db client ------------
      const q = faunadb.query;
      const secret = "fnAEyU1PfmACSxLVY8zSGQhoujqQ4u-MHvHJFVo5";
      const client = new faunadb.Client({
        secret: secret,
      });
      //---- sending get request ----
      try {
        const response = await client.query(
          q.Get(
            q.Match(q.Index("netlify_id"), netlifyIdentity.currentUser().id)
          )
        );
        console.log("User data is : ");
        console.log(response);
        setUserData(response);
      } catch (err) {
        console.log(err);
      }
    }
    if (userData === null) {
      getUserData();
    }
  });
  //------------ identity triggered functions -------------------------------
  netlifyIdentity.on("logout", () => {
    window.location.replace("login");
  });
  // //----------------------- utility Functions --------------------------------------
  function resetEditingVars() {
    setEditingTodoId(-1);
    setEditingTodo("");
    setEditingPlace("");
    setEditingDateTime(0);
  }
  async function deleteTodo(index) {
    try {
      const response = await fetch(
        `/.netlify/functions/delete_todo?index=${index}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              netlifyIdentity.currentUser().token.access_token
            }`,
          },
        }
      );
      if (response.status == 200) {
        const user_data = await response.json();
        console.log(user_data);
        setUserData(user_data);
      } else {
        throw new Error("Failed to delete user : ", await response.text());
      }
    } catch (err) {
      console.log(err);
    }
  }
  //-------------------------------------------------------------------------------
  //----------------------------- RENDERING ---------------------------------------
  //-------------------------------------------------------------------------------

  return (
    <WrapRootElement>
      <div>
        <NavBar />

        {/* --------------- Displaying New Todo ---------- */}
        {isNewTodoClicked ? (
          <AddTodo
            style={{
              margin: "4rem auto 0",
            }}
            userData={userData}
            setUserData={setUserData}
            setNewTodoClicked={setNewTodoClicked}
          />
        ) : (
          <div style={{ textAlign: "center" }}>
            Add Todo
            <Button
              style={{ margin: "2rem auto" }}
              onClick={() => {
                setNewTodoClicked(true);
              }}
            >
              <AddCircleIcon fontSize="large" />
            </Button>
          </div>
        )}

        {/* ------------- Displaying Current Todos ----------------  */}
        {userData === null ? (
          <div style={{ display: "block", textAlign: "center" }}>
            {" "}
            <CircularProgress size="4rem" />
            <br />
            Loading...
          </div>
        ) : (
          <div style={{ maxWidth: "24rem", margin: "0.4rem auto" }}>
            {userData.data.todos.map((elm, index) => {
              //---- if editing id is equal to index then show editor ----
              if (editingTodoId === index) {
                return (
                  <div
                    style={{ textAlign: "center", margin: "1rem 0" }}
                    key={index}
                  >
                    <div style={{ textAlign: "end" }}>
                      {" "}
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          // revert all the changes and clean temporary editing states
                          resetEditingVars();
                        }}
                      >
                        <CloseIcon />
                      </Button>
                    </div>
                    <TextField
                      placeholder="Todo"
                      variant="outlined"
                      size="4rem"
                      multiline
                      fullWidth
                      value={editingTodo}
                      onChange={(e) => {
                        setEditingTodo(e.target.value);
                      }}
                    />
                    <TextField
                      placeholder="Place"
                      variant="outlined"
                      size="medium"
                      fullWidth
                      value={editingPlace}
                      onChange={(e) => {
                        setEditingPlace(e.target.value);
                      }}
                    />
                    <br />
                    <br />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Date&Time picker"
                        value={editingDateTime}
                        renderInput={(params) => <TextField {...params} />}
                        onChange={(newValue) => {
                          setEditingDateTime(dayjs(newValue));
                        }}
                      />
                    </LocalizationProvider>
                    <br />
                    <Button
                      variant="contained"
                      style={{ marginTop: "0.5rem" }}
                      onClick={async () => {
                        //----- when it is clicked data is pushed to fauna db --------
                        // --- init fauna db client ------------
                        const q = faunadb.query;
                        const secret =
                          "fnAEyU1PfmACSxLVY8zSGQhoujqQ4u-MHvHJFVo5";
                        const client = new faunadb.Client({
                          secret: secret,
                        });
                        try {
                          //----------------- updating todo in previous todos ------------
                          const todoData = {
                            todo: editingTodo,
                            place: editingPlace,
                            date_time: editingDateTime.unix(),
                          };
                          const todos = userData.data.todos;
                          todos[editingTodoId] = todoData;
                          console.log("All todos are : ", todos);
                          //---- -------------now sending update request ----------------------

                          const response = await client.query(
                            q.Update(
                              q.Ref(
                                q.Collection("Users"),
                                userData.ref.value.id
                              ),
                              {
                                data: {
                                  todos: todos,
                                },
                              }
                            )
                          );
                          console.log("data updated");
                          console.log(response);
                          setUserData(response);
                          resetEditingVars();
                        } catch (err) {
                          console.log(err);
                        }
                      }}
                    >
                      Update
                    </Button>
                  </div>
                );
              }
              // editing id is not equal to current index so show todos as read only
              return (
                <Accordion
                  style={{
                    color: themeOptions.palette.primary.contrastText,
                  }}
                  key={index}
                >
                  <AccordionSummary
                    style={{
                      backgroundColor: themeOptions.palette.primary.main,
                    }}
                    expandIcon={
                      <ExpandMoreIcon
                        style={{
                          color: themeOptions.palette.primary.contrastText,
                        }}
                      />
                    }
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <b>{elm.todo}</b>
                  </AccordionSummary>
                  <AccordionDetails
                    style={{
                      backgroundColor: themeOptions.palette.primary.light,
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <EditIcon
                        style={{ position: "absolute", top: "0", right: "0" }}
                        onClick={() => {
                          //--- when it is clicked set editing id to index and fill editing states which holds data temporariliy
                          setEditingTodoId(index);
                          setEditingTodo(elm.todo);
                          setEditingPlace(elm.place);
                          setEditingDateTime(dayjs.unix(elm.date_time));
                        }}
                      />
                      <b>Location : </b>
                      {elm.place}
                    </div>
                    <div>
                      <b>Time : </b>
                      {"  "}
                      {dayjs
                        .unix(elm.date_time)
                        .format("D-MMM-YYYY  dddd hh:mm:s A")}
                    </div>
                    {/* Button to delete this todo */}
                    <button
                      onClick={() => {
                        deleteTodo(index);
                      }}
                    >
                      Delete
                    </button>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>
        )}
      </div>
    </WrapRootElement>
  );
};

// const todos = [
//   {
//     todo: "Buy Pencil",
//     place: "Statinary Shop sdffffffffffffffdfsdfsfsdfsdfsfssf",
//     date_time: 1665228705,
//   },
//   {
//     todo: "Go to park",
//     place: "Store",
//     date_time: 1665228705,
//   },
// ];

// import * as React from "react";

// const Index = () => {
//   return <div>Hello</div>;
// };

export default Index;
export const Head = () => <title>Todo App</title>;
