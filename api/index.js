require("dotenv").config();
const jwt = require("jsonwebtoken");

const express = require("express");
const apiRouter = express.Router();

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImYiLCJpYXQiOjE2ODQzMzcyNjgsImV4cCI6MTY4NDk0MjA2OH0.FTq40eIOCJ9vN3nJe7uqbi9rp_nh0Ncz_BUdzrSiiPY

const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

const usersRouter = require("./users");
const tagsRouter = require("./tags");
const postsRouter = require("./posts");

apiRouter.use("/users", usersRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
