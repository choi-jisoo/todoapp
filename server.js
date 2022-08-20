const express = require("express");
const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

let db;
MongoClient.connect(
  "mongodb+srv://coby:123@cluster0.zsjl1tv.mongodb.net/?retryWrites=true&w=majority",
  function (error, client) {
    if (error) return console.log(error);

    db = client.db("todoapp");

    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  }
);

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.post("/", function (req, res) {
  db.collection("counter").findOne(
    { name: "number-of-posts" },
    function (error, result) {
      console.log(result.totalPosts);
      let total = result.totalPosts;

      db.collection("post").insertOne(
        { _id: total + 1, title: req.body.title, date: req.body.date },
        function (error, result) {
          console.log("saved!");

          db.collection("counter").updateOne(
            { name: "number-of-posts" },
            { $inc: { totalPosts: 1 } },
            function (error, result) {
              if (error) return console.log(error);
              res.render("index.ejs");
            }
          );
        }
      );
    }
  );
});

app.get("/list", function (req, res) {
  db.collection("post")
    .find()
    .toArray(function (error, result) {
      console.log(result);
      res.render("list.ejs", {
        posts: result,
      });
    });
});

app.delete("/delete", function (req, res) {
  req.body._id = parseInt(req.body._id);
  console.log(req.body);
  //req.bodyに含まれているidのtodoをdbから削除
  db.collection("post").deleteOne(req.body, function (error, result) {
    console.log("deleted!");
    res.status(200).send({ message: "deleted!" });
  });
});
