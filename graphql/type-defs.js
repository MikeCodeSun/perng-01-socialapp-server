const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    image: String!
    created_at: String!
    token: String!
  }
  type Post {
    id: ID!
    body: String!
    creator_id: Int!
    creator: String!
    created_at: String!
    comments: [Comment]!
    likes: [Like]!
    commentsCount: Int!
    likesCount: Int!
    cl: Int
    ll: Int
  }
  type Comment {
    id: ID!
    body: String!
    creator_id: Int!
    creator: String!
    post_id: Int!
    created_at: String!
  }

  type Like {
    id: ID!
    creator_id: Int!
    post_id: Int!
    created_at: String!
  }

  type Query {
    hello: String
    users: [User]!
    user(id: ID!): User!
    posts: [Post]!
    post(id: ID!): Post!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    image: String = "https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
  }

  input loginInput {
    email: String!
    password: String!
  }

  type Mutation {
    registerUser(input: UserInput!): User!
    loginUser(input: loginInput): User!
    createPost(body: String!): Post!
    deletePost(id: ID!): Post!
    updatePost(id: ID!, body: String!): Post!
    createComment(postId: ID!, body: String!): Comment!
    deleteComment(postId: ID!, commentId: ID!): Comment!
    likeToggle(id: ID!): Like!
  }
`;

module.exports = typeDefs;
