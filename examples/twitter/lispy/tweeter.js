// Generated by SugarLisp v0.5
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
console.log("Listening on port 3000");
app.listen(3000);

function base(title, header, body) {
  return (
    "\n    <html>" + (
      "\n      <head>" + (
        "\n        <title>" +
        title +
        "\n        </title>") +
      "\n      </head>") + (
      "\n      <body>" + (
        "\n        <h1>" +
        header +
        "\n        </h1>") + body + "\n    " +
      "\n      </body>") +
    "\n    </html>");
}
var tweets = [];

function index() {
  return (
    "\n    <div>" + (
      "\n      <h2>" +
      "Enter Tweet" +
      "\n      </h2>") + (
      "\n      <form action=\"/send\" method=\"POST\">" + (
        "\n        <input type=\"text\" length=\"140\" name=\"tweet\"/>") + (
        "\n        <input type=\"submit\" value=\"Tweet\"/>") +
      "\n      </form>") + (
      "\n      <h2>" +
      "All Tweets" +
      "\n      </h2>") + Array.prototype.map.call(tweets, function(elem) {
      return (
        "\n        <div>" +
        elem +
        "\n        </div>");
    }).join("") + "\n  " +
    "\n    </div>");
}

app.get("/", function(req, res) {
  return res.send(base("Tweeter", "Tweeter", index()));
});

app.post("/send", bodyParser(), function(req, res) {
  if ((req.body && req.body.tweet)) {
    (function() {
      tweets.push(req.body.tweet);
      return res.redirect("/");
    })()
  } else {
    res.send({
      status: "nok",
      message: "No tweet Received"
    })
  };
});

app.get("/tweets", function(req, res) {
  return res.send(tweets);
});