const express = require("express");
const morgan = require("morgan");
// client used for connect to postgresql db
const { client } = require("./db");

// connect to server and db
const server = express();
const PORT = "3000";
client.connect();

// middleware for logging + formatting incoming requests
server.use(morgan("dev"));
server.use(express.json());

// route all requests to the api router
server.use("/", require("./api"));

// start running server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
