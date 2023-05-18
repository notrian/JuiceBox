require("dotenv").config();
const jwt = require("jsonwebtoken");

const express = require("express");
const apiRouter = express.Router();

const { getUserByUsername } = require("../db");
const { JWT_SECRET } = process.env;

// middleware to set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    try {
      // seperates the Bearer "token"
      const token = auth.slice(prefix.length);
      const { username } = jwt.verify(token, JWT_SECRET);

      if (username) {
        // checks to make sure that user exists
        req.user = await getUserByUsername(username);
        next();
      }
    } catch ({ name, message }) {
      // the jwt is invalid, errors
      next({ name, message });
    }
  } else {
    // the Authorization header doesnt start with Bearer
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

// route all incoming requests
const usersRouter = require("./users");
const postsRouter = require("./posts");
const tagsRouter = require("./tags");

apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);
apiRouter.use("/", usersRouter);

// catch any requests that doesnt exists
apiRouter.all("*", (req, res, next) => {
  next({
    name: "404",
    message: "Page not found",
  });
});

apiRouter.use((error, req, res, next) => {
  res.status(error.error_status || 500);
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
