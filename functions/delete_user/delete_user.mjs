import fetch from "node-fetch";
const faunadb = require("faunadb");

exports.handler = async (event, context) => {
  const { identity, user } = context.clientContext;
  const userID = user.sub;
  const userUrl = `${identity.url}/admin/users/{${userID}}`;
  const adminAuthHeader = `Bearer ${identity.token}`;

  try {
    // ------ deleting user from netlify identity
    let response = await (
      await fetch(userUrl, {
        method: "DELETE",
        headers: { Authorization: adminAuthHeader },
      })
    ).json();

    if (response.code >= 400 && response.code < 500) {
      console.log(response);
      return {
        statusCode: 200,
        body: JSON.stringify({ error: response.msg }),
      };
    }
    console.log("Deleted a user!");
    console.log({ response });
    //------ deleting from fauan db client --------
    const ref = user.user_metadata.ref;
    console.log("delteing user from fauna db");
    console.log("ref is : ", ref);
    //---------- instatiating  Fauna DB  Client ------------------
    const q = faunadb.query;
    const secret = "fnAEyU1PfmACSxLVY8zSGQhoujqQ4u-MHvHJFVo5";
    const client = new faunadb.Client({
      secret: secret,
    });
    //---- sending fetch request ----
    try {
      response = await client.query(
        q.Delete(q.Ref(q.Collection("Users"), ref))
      );

      console.log("Response from fauna db is : ", response);
      console.log("Deleted from fauna Db now exiting the function");
    } catch (err) {
      console.log("[Error] failed to delete user from  fauna db", err);
    }

    return { statusCode: 204 };
  } catch (error) {
    console.log("Error in whole function  : ", error.message);
    return error;
  }
};
