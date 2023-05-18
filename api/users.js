require("dotenv").config();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const express = require("express");
const usersRouter = express.Router();

const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require("../db");
const { requireUser } = require("./utils");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

usersRouter.patch("/:userId", requireUser, async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (userId === req.user.id) {
      const user = await updateUser(userId, { active: true });
      res.send({ user });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a user that is not you",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/auth", async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  // request must have both
  if (!auth) {
    next({
      name: "MissingAuthorizationHeader",
      message: "Please supply a valid authorization header",
    });
  } else {
    try {
      const token = auth.slice(prefix.length);
      const { username, iat } = jwt.verify(token, JWT_SECRET);
      res.send({
        status: "200",
        status_message: "Successfully authenticated!",
        data: {
          username,
          iat,
        },
      });
    } catch (error) {
      next(error);
    }
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      // create token & return to user
      const token = jwt.sign(
        {
          id: user.id,
          username,
          password,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );

      res.send({ message: "Successfully logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
        password,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "Successfully registered!",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.delete("/:userId", requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);

    if (user && user.id === req.user.id) {
      const deletedUser = await updateUser(user.id, { active: false });

      res.send({ user: deletedUser });
    } else {
      // if there was a user, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(
        user
          ? {
              name: "UnauthorizedUserError",
              message: "You can only deactivate your account",
            }
          : {
              name: "UserNotFoundError",
              message: "That user does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
