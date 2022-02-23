const userResolver = require("./userResolver");
const postResolver = require("./postResolver");
const commentResolver = require("./commentResolver");

const resolvers = {
  Post: {
    commentsCount: (parent) => parent.comments.length,
    likesCount: (parent) => parent.likes.length,
  },
  Query: {
    hello() {
      return "hello";
    },
    ...userResolver.Query,
    ...postResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...postResolver.Mutation,
    ...commentResolver.Mutation,
  },
};

module.exports = resolvers;
