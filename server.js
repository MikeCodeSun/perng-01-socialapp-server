const { ApolloServer } = require("apollo-server");
require("dotenv").config();
const typeDefs = require("./graphql/type-defs");
const resolvers = require("./graphql/resolvers");
const pool = require("./db/connectDB");

const port = process.env.PORT || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return { req };
  },
});

const start = async () => {
  try {
    await pool.connect();
    server
      .listen({ port })
      .then(({ url }) => console.log(`server is runing  on Port : ${url}`));
  } catch (error) {
    console.log(error);
  }
};

start();
