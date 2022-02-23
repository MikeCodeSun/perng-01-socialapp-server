const pool = require("../../db/connectDB");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  registerValidator,
  loginValidator,
} = require("../../util/userValidator");
const { UserInputError } = require("apollo-server");
require("dotenv").config();

// generate JsonWebToken
const genJwt = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.SECRET,
    { expiresIn: "1d" }
  );
};

const userResolver = {
  Query: {
    users: async () => {
      try {
        const result = await pool.query("SELECT * FROM users");
        return result.rows;
      } catch (error) {
        console.log(error);
      }
    },
    user: async (_, args) => {
      const { id } = args;
      try {
        const result = await pool.query("SELECT * FROM users WHERE id=$1", [
          id,
        ]);
        if (result.rows.length === 0) {
          console.log(`no user id : ${id}`);
        }
        return result.rows[0];
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    // register user
    registerUser: async (_, args) => {
      const { name, email, password, image } = args.input;
      const { valid, error } = registerValidator(name, email, password);
      // console.log(valid, error);
      // check frontend input value make sure not = empty/''
      if (!valid) {
        throw new UserInputError("Error", { error });
      }
      //check user in database or not, if already have ,throw error ,error msg will pass to frontend
      const userResult = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );
      // console.log(userResult.rows);
      if (userResult.rows.length === 1) {
        console.log("no");
        throw new UserInputError("Error", {
          error: { user: "user already exist!" },
        });
      }
      // npm packpage to hash password make user info safety
      const hashPassword = await bcryptjs.hash(password, 10);
      // generate jwt token ,use to authorization
      // insert into db new user!(image default avatar)
      const newUser = await pool.query(
        "INSERT INTO users(name, email, password, image) VALUES($1, $2, $3, $4) RETURNING *",
        [name, email, hashPassword, image]
      );

      const token = genJwt(newUser.rows[0]);

      return {
        ...newUser.rows[0],
        token,
      };
    },
    // login user
    loginUser: async (_, args) => {
      const { email, password } = args.input;
      const { valid, error } = loginValidator(email, password);
      //check frontend input make sure value not empty or space
      if (!valid) {
        throw new UserInputError("Error", { error });
      }
      //check user exist or not
      const userResult = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );
      if (userResult.rows.length === 0) {
        throw new UserInputError("Error", {
          error: { user: "user not exist!" },
        });
      }
      //check password isValid
      const isValid = await bcryptjs.compare(
        password,
        userResult.rows[0].password
      );
      // password not match , throw new error ,pass to frontend error-msg
      if (!isValid) {
        throw new UserInputError("Error", {
          error: { password: "password not right!" },
        });
      }
      // password match generate Token
      const token = genJwt(userResult.rows[0]);

      return {
        token,
        ...userResult.rows[0],
      };
    },
  },
};

module.exports = userResolver;
