const auth = require("../../middleWare/auth");
const { UserInputError, AuthenticationError } = require("apollo-server");
const pool = require("../../db/connectDB");

const commentResolver = {
  Mutation: {
    createComment: async (parent, args, context) => {
      const user = auth(context);
      const { postId, body } = args;
      const { id: userId, name: userName } = user;
      // check frontend input
      if (body.trim() === "") {
        throw new UserInputError("Error", {
          error: { comment: "Comment must not be empty!" },
        });
      }
      //check post with postid  exists
      const postResult = await pool.query(
        "SELECT * FROM posts LEFT JOIN (SELECT post_id, COUNT(post_id) AS commentslength FROM comments GROUP BY post_id) comments ON posts.id=comments.post_id LEFT JOIN (SELECT post_id, COUNT(post_id) AS likeslength FROM likes GROUP BY post_id) likes ON posts.id=likes.post_id WHERE id=$1",
        [postId]
      );

      if (postResult.rows.length === 0) {
        throw new UserInputError("Error", {
          error: { post: "Post not exist" },
        });
      }
      //create comment
      const commentResult = await pool.query(
        "INSERT INTO comments(body, creator_id, creator, post_id) VALUES($1, $2, $3, $4) RETURNING *",
        [body, userId, userName, postId]
      );
      //new post
      const newCommentResult = await pool.query(
        "SELECT * FROM comments WHERE post_id=$1",
        [postId]
      );
      return {
        ...postResult.rows[0],
        comments: newCommentResult.rows,
        commentslength: newCommentResult.rows.length,
      };
    },
    // delete comment
    deleteComment: async (_, args, context) => {
      const user = auth(context);
      const { postId, commentId } = args;
      const { id: userId } = user;
      // console.log(user, postId);
      //check post exist?
      const postResult = await pool.query(
        "SELECT * FROM posts LEFT JOIN (SELECT post_id, COUNT(post_id) AS commentslength FROM comments GROUP BY post_id) comments ON posts.id=comments.post_id LEFT JOIN (SELECT post_id, COUNT(post_id) AS likeslength FROM likes GROUP BY post_id) likes ON posts.id=likes.post_id WHERE id=$1",
        [postId]
      );
      if (postResult.rows.length === 0) {
        throw new UserInputError("Error", {
          error: { post: "post not exist" },
        });
      }
      //check comment exist?
      const commentResult = await pool.query(
        "SELECT * FROM comments WHERE id=$1",
        [commentId]
      );
      if (commentResult.rows.length === 0) {
        throw new UserInputError("Error", {
          error: { comment: "comment not exist" },
        });
      }
      // console.log(commentResult.rows[0].post_id);
      //check comment inside post ?
      if (commentResult.rows[0].post_id !== Number(postId)) {
        // console.log(postId, commentResult.rows[0].post_id);
        throw new AuthenticationError("Error", {
          error: { comment: "post not have comment " },
        });
      }
      // check user have authorizationg to delete
      if (commentResult.rows[0].creator_id !== userId) {
        throw new AuthenticationError("Error", {
          error: { comment: "not have authorization to delete" },
        });
      }

      //delete comment
      const deleteComment = await pool.query(
        "DELETE FROM comments WHERE id=$1 RETURNING *",
        [commentId]
      );

      const newCommentResult = await pool.query(
        "SELECT * FROM comments WHERE post_id=$1",
        [postId]
      );

      return {
        ...postResult.rows[0],
        comments: newCommentResult.rows,
        commentslength: newCommentResult.rows.length,
      };
    },
    // like toggle
    likeToggle: async (_, args, context) => {
      const user = auth(context);
      const { id: postId } = args;
      const { id: userId } = user;
      //check post exist?
      const postResult = await pool.query(
        "SELECT * FROM posts LEFT JOIN (SELECT post_id, COUNT(post_id) AS commentslength FROM comments GROUP BY post_id) comments ON posts.id=comments.post_id LEFT JOIN (SELECT post_id, COUNT(post_id) AS likeslength FROM likes GROUP BY post_id) likes ON posts.id=likes.post_id WHERE id=$1",
        [postId]
      );
      if (postResult.rows.length === 0) {
        throw new UserInputError("Error", {
          error: { post: "post not exist" },
        });
      }

      // check like
      const likeResult = await pool.query(
        "SELECT * FROM likes WHERE post_id=$1 AND creator_id=$2 ",
        [postId, userId]
      );

      // console.log(likeResult.rows);
      //toggle like,  no like add like, have like remove like
      let like;
      if (likeResult.rows.length === 0) {
        console.log("like");
        like = await pool.query(
          "INSERT INTO likes(creator_id, post_id) VALUES($1, $2) RETURNING *",
          [userId, postId]
        );
      } else {
        console.log("disliek");
        like = await pool.query(
          "DELETE FROM likes WHERE post_id=$1 AND creator_id=$2 RETURNING *",
          [postId, userId]
        );
      }

      const newLikes = await pool.query(
        "SELECT * FROM likes WHERE post_id=$1",
        [postId]
      );

      console.log(newLikes.rows);

      return {
        ...postResult.rows[0],
        likes: newLikes.rows,
        likesLength: newLikes.rows.length,
      };
    },
  },
};

module.exports = commentResolver;
