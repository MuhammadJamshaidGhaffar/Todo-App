import faunadb from "faunadb";

exports.handler = async (event, context) => {
  const index = event.queryStringParameters.index;
  if (index == undefined)
    return { statusCode: 500, body: "Index is undefined" };
  //--- init fauna db client ------------
  const q = faunadb.query;
  const secret = "fnAEyU1PfmACSxLVY8zSGQhoujqQ4u-MHvHJFVo5";
  const client = new faunadb.Client({
    secret: secret,
  });
  const { user } = context.clientContext;
  console.log(user);
  // return { statusCode: 200, body: JSON.stringify({ user }) };
  console.log("Reached 1st step");
  //---- sending get request ----
  try {
    let response = await client.query(
      q.Get(q.Ref(q.Collection("Users"), user.user_metadata.ref))
    );
    console.log("User data is : ");
    console.log(response);
    const todos = response.data.todos.filter((todo, i) => {
      return index != i;
    });
    console.log("todos are : ", todos);
    response = await client.query(
      q.Update(q.Ref(q.Collection("Users"), user.user_metadata.ref), {
        data: {
          todos,
        },
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.log(err);
  }
};
