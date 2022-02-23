const jwt = require("jsonwebtoken");
require("dotenv").config();
const { AuthenticationError } = require("apollo-server");

//middle ware check user authorization token
const auth = (context) => {
  const authHeader = context.req.headers.authorization;

  //check token exist or right format like 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Error", {
      token: { token: "token not exist" },
    });
  }
  //get rid of Bearer
  const token = authHeader.split(" ")[1];
  // console.log(token);
  //jwt verify token
  try {
    const user = jwt.verify(token, process.env.SECRET);
    return user;
  } catch (error) {
    throw new AuthenticationError("Error", {
      token: { token: "token not right" },
    });
  }
};

module.exports = auth;
