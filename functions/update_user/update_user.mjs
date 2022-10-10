import fetch from "node-fetch";

exports.handler = async (event, context) => {
  const { identity, user } = context.clientContext;

  console.log("Inside update_user");
  if (user) {
    try {
      const response = await (
        await fetch(`${identity.url}/admin/users/${user.sub}`, {
          method: "put",
          body: JSON.stringify({
            user_metadata: {
              full_name: "KLOPer",
            },
          }),
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjUzMTE4NDgsInN1YiI6ImE1ZjA4MmU5LTNkNjAtNDA3Mi05YWU2LTBkYThjN2U1YjM4NyIsImVtYWlsIjoiamFtQGphbS5qYW0iLCJhcHBfbWV0YWRhdGEiOnsicm9sZXMiOlsidXNlciJdfSwidXNlcl9tZXRhZGF0YSI6eyJmdWxsX25hbWUiOiJqYW0ifX0.01q7OMLGB8aC-yR8bCxXv3o8vOz6i8sWMdeOX7V8MAU`,
          },
        })
      ).json();

      console.log(response);
      return {
        statusCode: 200,
        body: JSON.stringify({
          ...response,
        }),
      };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  }
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: "User no defined",
      user,
      identity,
    }),
  };
};
