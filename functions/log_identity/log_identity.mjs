import fetch from "node-fetch";

exports.handler = async (event, context) => {
  let dataFromCustomFetch = "";
  try {
    const { identity, user } = context.clientContext;
    // const users = await (
    //   await fetch(`${identity.url}/admin/users`, {
    //     headers: {
    //       Authorization: `Bearer ${identity.token}`,
    //     },
    //   })
    // ).json();
    try {
      console.log(
        "testing custom fetch to https://jamshaid-todo-app.netlify.app/.netlify/identity/admin/users/"
      );
      dataFromCustomFetch = await (
        await fetch(
          `https://jamshaid-todo-app.netlify.app/.netlify/identity/admin/users/`,
          {
            headers: {
              Authorization: `Bearer ${identity.access_token}`,
            },
          }
        )
      ).json();
      console.log("dataFromCustomFetch : ", dataFromCustomFetch);
    } catch (error) {
      console.log("Error in custom fetch : ", error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        identity,
        user,
        // users,
        dataFromCustomFetch,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.toString(),
    };
  }
};
