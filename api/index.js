// api/index.js
const express = require("express");
const apiRouter = express.Router();

const usersRouter = require("./users");
const tagsRouter = require("./tags");
const postsRouter = require("./posts");

apiRouter.use("/users", usersRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);

module.exports = apiRouter;
