const express = require("express");
const morgan = require("morgan");
// const seed = require("./db/seed");
const { client, getAllPosts } = require("./db");

const app = express();
client.connect();

const PORT = "6969";

app.use(morgan("dev"));
app.use(express.json());

app.get("/", async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();
    res.status(200);
    res.send(allPosts);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(`Request failed (500) - ${err}`);
  res.status(500).send("Something went wrong");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
