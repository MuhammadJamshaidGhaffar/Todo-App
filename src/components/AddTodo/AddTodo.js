//------- libraries & plugins -----------------
import * as React from "react";
import { useState } from "react";
import dayjs from "dayjs";
import faunadb from "faunadb";
// import netlifyIdentity from

//--------css -------------------
import * as styles from "./style.module.css";

//----------- MUI -----------------------
import { Button, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CloseIcon from "@mui/icons-material/Close";

const AddTodo = ({ style, userData, setUserData, setNewTodoClicked }) => {
  //--------------- Sates ---------------------
  const [date_time, setDateTime] = React.useState(dayjs());
  const [todo, setTodo] = useState("");
  const [place, setPlace] = useState("");
  //------------------------------------------------------------------------------------------------
  //------------------------------------- HANDLES --------------------------------------------------
  //------------------------------------------------------------------------------------------------
  const handleDateTimeChange = (newValue) => {
    // console.log();
    setDateTime(newValue);
  };
  const handleAddTodo = async () => {
    // --- init fauna db client ------------
    const q = faunadb.query;
    const secret = "fnAEyU1PfmACSxLVY8zSGQhoujqQ4u-MHvHJFVo5";
    const client = new faunadb.Client({
      secret: secret,
    });
    try {
      //----------------- first getting latest copy of todos ---------------
      let response = await client.query(
        q.Get(q.Match(q.Index("netlify_id"), userData.data.netlify_id))
      );
      setUserData(response);
      console.log("Latest copy of users are : ", response);
      //----------------- pushing new todo is previous todos ------------
      const todoData = {
        todo,
        place,
        date_time: date_time.unix(),
      };
      //   console.log(todoData);
      const todos = response.data.todos;
      todos.push(todoData);
      console.log("All todos are : ", todos);
      //---- -------------now sending update request ----------------------

      response = await client.query(
        q.Update(q.Ref(q.Collection("Users"), userData.ref.value.id), {
          data: {
            todos: todos,
          },
        })
      );
      console.log("data updated");
      console.log(response);
      setUserData(response);
      setNewTodoClicked(false);
    } catch (err) {
      console.log(err);
    }
  };

  //-------------------------------------------------------------------------------
  //----------------------------- RENDERING ---------------------------------------
  //-------------------------------------------------------------------------------

  return (
    <div>
      <div className={styles.addTodoDiv} style={style}>
        <Button
          style={{
            position: "absolute",
            top: "0",
            right: "0",
          }}
          variant="contained"
          color="secondary"
          onClick={() => {
            setNewTodoClicked(false);
          }}
        >
          <CloseIcon />
        </Button>
        <TextField
          placeholder="Todo"
          variant="outlined"
          className={styles.child}
          size="4rem"
          multiline
          fullWidth
          onChange={(e) => {
            console.log("called");
            console.log(todo);
            setTodo(e.target.value);
          }}
        />
        <TextField
          placeholder="Place"
          variant="outlined"
          className={styles.child}
          size="medium"
          fullWidth
          onChange={(e) => {
            setPlace(e.target.value);
          }}
        />
        <br />
        <br />
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          className={styles.child}
        >
          <DateTimePicker
            label="Date&Time picker"
            value={date_time}
            onChange={handleDateTimeChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <br />
        <Button
          variant="contained"
          className={styles.child}
          onClick={handleAddTodo}
        >
          Add Todo
        </Button>
      </div>
    </div>
  );
};

export default AddTodo;
