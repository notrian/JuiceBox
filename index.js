const express = require("express");
const morgan = require("morgan");
const { client, getAllPosts } = require("./db");

const apiRouter = require("./api");

const server = express();
client.connect();

const PORT = "3000";

server.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");

  next();
});

server.use(morgan("dev"));
server.use(express.json());

server.use("/api", apiRouter);

// server.use((err, req, res, next) => {
//   console.error(`Request failed (500) - ${err}`);
//   res.status(500).send("Something went wrong");
// });

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
