const path = require("path");
const express = require("express");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.REACT_APP_PUSHERKEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

const database = {};

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../build")));

app.get("/api/:channel", (req, res) => {
  if (!database[req.params.channel]) {
    database[req.params.channel] = [];
  }
  res.send(database[req.params.channel]);
});

app.post("/api/update", (req, res) => {
  if (req.body.event === "add") {
    const array = database[req.body.channel] ? database[req.body.channel] : [];
    const id = array.length;
    const speaker = { name: req.body.name, id };
    database[req.body.channel] = [...array, speaker];
    res.send(speaker);
  }
  if (req.body.event === "remove") {
    database[req.body.channel] = database[req.body.channel].filter(
      (item) => item.id !== req.body.id
    );
    res.send({ id: req.body.id });
  }
  pusher.trigger(req.body.channel, "update", database[req.body.channel]);
});

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../build", "index.html"));
});
