// Generated by SugarLisp v0.5
var express = require("express");
var app = express();
app.listen(3000);
app.use(express.static((__dirname + "/public")));
console.log("Listening on port 3000");

function basePage(pageTitle, navBarLinks, bodyContent) {
  return (
    "\n    <html lang=\"en\">" + (
      "\n      <head>" + (
        "\n        <title>" +
        pageTitle +
        "\n        </title>") + (
        "\n        <link href=\"bootstrap/css/bootstrap.css\" rel=\"stylesheet\"/>") + (
        "\n        <style type=\"text/css\">" +
        "body {\n           padding-top: 60px;\n        }\n      " +
        "\n        </style>") + (
        "\n        <link href=\"bootstrap/css/bootstrap-responsive.css\" rel=\"stylesheet\"/>") + "<!--[if lt IE 9]>" + "\n         " + (
        "\n        <script src=\"http://html5shim.googlecode.com/svn/trunk/html5.js\"></script>") + "<![endif]-->" + "\n    " +
      "\n      </head>") + (
      "\n      <body>" + (
        "\n        <div class=\"navbar navbar-fixed-top\">" + (
          "\n          <div class=\"navbar-inner\">" + (
            "\n            <div class=\"container\">" + (
              "\n              <a class=\"btn btn-navbar\" data-toggle=\"collapse\" data-target=\".nav-collapse\">" + (
                "\n                <span class=\"icon-bar\"/>") + (
                "\n                <span class=\"icon-bar\"/>") + (
                "\n                <span class=\"icon-bar\"/>") +
              "\n              </a>") + (
              "\n              <a class=\"brand\" href=\"#\">" +
              "SugarLisp!" +
              "\n              </a>") + (
              "\n              <div class=\"nav-collapse\">" + navBarLinks + "\n            " +
              "\n              </div>") +
            "\n            </div>") +
          "\n          </div>") +
        "\n        </div>") + bodyContent + "\n      " + (
        "\n        <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js\" type=\"text/javascript\"></script>") + (
        "\n        <script type=\"text/javascript\" src=\"bootstrap/js/bootstrap.js\"></script>") +
      "\n      </body>") +
    "\n    </html>");
}

function navBarLinks() {
  return (
    "\n    <ul class=\"nav\">" + (
      "\n      <li class=\"active\">" + (
        "\n        <a href=\"#\">" +
        "Home" +
        "\n        </a>") +
      "\n      </li>") + (
      "\n      <li>" + (
        "\n        <a href=\"/tryit\">" +
        "Try It" +
        "\n        </a>") +
      "\n      </li>") + (
      "\n      <li>" + (
        "\n        <a href=\"/docs\">" +
        "Docs" +
        "\n        </a>") +
      "\n      </li>") +
    "\n    </ul>");
}

function bodyContent() {
  return (
    "\n    <div class=\"container\">" + (
      "\n      <div class=\"page-header\">" + (
        "\n        <h1>" +
        "SugarLisp" +
        "\n        </h1>") + (
        "\n        <p>" +
        "A javascript With Lispy Syntax And Macros!" +
        "\n        </p>") +
      "\n      </div>") + (
      "\n      <div class=\"row\">" + (
        "\n        <div class=\"span6\">" + (
          "\n          <h2>" +
          "Overview" +
          "\n          </h2>") + (
          "\n          <p>" +
          "An inherent problem with Javascript is that it has no macro support, like other Lisp like languages. That's because macros manipulate the syntax tree while compiling. And this is next to impossible in a language like Javascript." +
          "\n          </p>") +
        "\n        </div>") + (
        "\n        <div class=\"span6\">" + (
          "\n          <h2>" +
          "Installing" +
          "\n          </h2>") + (
          "\n          <h4>" +
          "Install Using npm" +
          "\n          </h4>") + (
          "\n          <pre>" +
          "$ npm install -g sugarlisp" +
          "\n          </pre>") +
        "\n        </div>") +
      "\n      </div>") +
    "\n    </div>");
}
app.get("/", function(req, res) {
  return res.send(basePage("SugarScript", navBarLinks(), bodyContent()));
});