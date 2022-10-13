import fetch from "node-fetch";
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event, context) => {
  const { identity, user } = context.clientContext;
  const userID = user.sub;
  const userUrl = `${identity.url}/admin/users/${userID}`;
  const adminAuthHeader = "Bearer " + identity.token;

  const { new_password } = JSON.parse(event.body);
  console.log("Data from body is : ", JSON.parse(event.body));

  try {
    return fetch(userUrl, {
      method: "PUT",
      headers: { Authorization: adminAuthHeader },
      body: JSON.stringify({
        password: new_password,
        user_metadata: {
          password_token: uuidv4(),
        },
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("Updated a user! 200!");
        console.log(JSON.stringify({ data }));
        return { statusCode: 200, body: JSON.stringify(data) };
      })
      .catch((e) => {
        return { statusCode: 500, body: "Failed to update password" };
      });
  } catch (e) {
    return e;
  }
};
