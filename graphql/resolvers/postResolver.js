const auth = require("../../middleWare/auth");
const { UserInputError } = require("apollo-server");
const pool = require("../../db/connectDB");
const postResolver = {
  Query: {
    // get all posts
    posts: async () => {
      try {
        // 3 query to get posts
        // get all posts
        // const result = await pool.query("SELECT * FROM posts");
        //get all comments
        // const commentsResult = await pool.query("SELECT * FROM comments");
        //get all like
        // const likesResult = await pool.query("SELECT * FROM likes");
        // add comment like to post post.id = x.post_id
        // const posts = result.rows.map((post) => {
        //   const comments = commentsResult.rows.filter(
        //     (comment) => comment.post_id === post.id
        //   );
        //   const likes = likesResult.rows.filter(
        //     (like) => like.post_id === post.id
        //   );
        //   // console.log(likes, comments);

        //   return { ...post, likes, comments };
        // });

        // use one query get all post and inside post comment length && like length
        const postResult = await pool.query(
          "SELECT * FROM posts LEFT JOIN (SELECT post_id, COUNT(post_id) AS cl FROM comments GROUP BY post_id) comments ON posts.id=comments.post_id LEFT JOIN (SELECT post_id, COUNT(post_id) AS ll FROM likes GROUP BY post_id) likes ON posts.id=likes.post_id;"
        );

        return postResult.rows;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    //get one post by id
    post: async (_, args) => {
      const { id } = args;
      try {
        const result = await pool.query("SELECT * FROM posts WHERE id=$1", [
          id,
        ]);
        return result.rows[0];
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
  },

  Mutation: {
    //create post
    createPost: async (_, args, context) => {
      // middleware auth check user authorization token
      const user = auth(context);
      const { id: userId, name: userName } = user;
      const { body } = args;
      if (args.body.trim() === "") {
        throw new UserInputError("Error", {
          error: { post: "post must not be empty" },
        });
      }

      const result = await pool.query(
        "INSERT INTO posts(body, creator_id, creator) VALUES($1, $2, $3) RETURNING *",
        [body, userId, userName]
      );

      return result.rows[0];
    },
    //delete post
    deletePost: async (_, args, context) => {
      const user = auth(context);
      const { id } = args;
      const { id: userId } = user;
      // find the post to update by id
      const result = await pool.query("SELECT * FROM posts WHERE id=$1", [id]);
      //check post exist
      if (result.rows.length === 0) {
        throw new UserInputError("Error", {
          error: { post: "post not exist" },
        });
      }
      //check post is created by this user
      if (result.rows[0].creator_id !== userId) {
        throw new UserInputError("Error", {
          error: { post: "action not allowed" },
        });
      }
      //delete post query
      const deleteResult = await pool.query(
        "DELETE FROM posts WHERE id=$1 RETURNING *",
        [id]
      );

      return deleteResult.rows[0];
    },
    // update post
    updatePost: async (_, args, context) => {
      const user = auth(context);
      const { id, body } = args;
      const { id: userId } = user;
      // find the post to update by id
      const result = await pool.query("SELECT * FROM posts WHERE id=$1", [id]);
      //check post exist
      if (result.rows.length === 0) {
        throw new UserInputError("Error", {
          error: { post: "post not exist" },
        });
      }
      //check post is by this user
      if (result.rows[0].creator_id !== userId) {
        throw new UserInputError("Error", {
          error: { post: "action not allowed" },
        });
      }
      //update post query
      const updateResult = await pool.query(
        "UPDATE posts SET body=$1 WHERE id=$2 RETURNING *",
        [body, id]
      );

      return updateResult.rows[0];
    },
  },
};

module.exports = postResolver;
