const { ApolloClient, InMemoryCache, gql } = require("@apollo/client");
const faunadb = require("faunadb");

exports.handler = async (event, context, callback) => {
  const { user } = JSON.parse(event.body);
  console.log("Creating new User : ", user);
  //---------- creating user on Fauna DB ------------------
  const q = faunadb.query;
  const secret = "fnAEyU1PfmACSxLVY8zSGQhoujqQ4u-MHvHJFVo5";
  const client = new faunadb.Client({
    secret: secret,
  });
  //---- sending fetch request ----
  let response = "";
  try {
    response = await client.query(
      q.Create(q.Collection("Users"), {
        data: { netlify_id: user.id, todos: [] },
      })
    );
    console.log("Response from fauna db is : ", response);
  } catch (err) {
    console.log("[Error] failed to add user on fauna db", err);
  }

  //--------------setting new created account's role to user----------------

  const responseBody = {
    app_metadata: {
      roles: ["user"],
    },
    user_metadata: {
      ...user.user_metadata,
      ref: response.ref.value.id,
    },
  };
  console.log("Just before the callback- reaching the end of function");
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  });
};
