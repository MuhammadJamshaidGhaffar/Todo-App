import fetch from "node-fetch";
const faunadb = require("faunadb");

exports.handler = async (event, context) => {
  const { identity, user } = context.clientContext;
  const userID = user.sub;
  const userUrl = `${identity.url}/admin/users/{${userID}}`;
  const adminAuthHeader = `Bearer ${identity.token}`;

  try {
    return fetch(userUrl, {
      method: "GET",
      headers: { Authorization: adminAuthHeader },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", JSON.stringify(data));
        //checking for password token
        if (
          data.user_metadata.password_token == user.user_metadata.password_token
        )
          return { statusCode: 204 };
        else return { statusCode: 500, body: "Password Token Invalid!" };
      })
      .catch((error) => {
        console.log("Failed to get user! 500! Internal.");
        return {
          statusCode: 500,
          body: `Internal Server Error: ${error}`,
        };
      });
  } catch (error) {
    console.log("GOT HERE! 500! outer");
    return { statusCode: 500, body: `Internal Server Error: ${error}` };
  }
};
