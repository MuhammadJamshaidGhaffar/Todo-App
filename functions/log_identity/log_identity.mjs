import fetch from "node-fetch";

exports.handler = async (event, context) => {
  let dataFromCustomFetch = "";
  try {
    const { identity, user } = context.clientContext;
    const usersUrl = `${identity.url}/admin/users`;
    const adminAuthHeader = `Bearer ${identity.token}`;

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
        await fetch(usersUrl, {
          method: "GET",
          headers: {
            Authorization: adminAuthHeader,
          },
        })
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
