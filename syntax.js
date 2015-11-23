var sl = require('sugarlisp-core/types'),
    reader = require('sugarlisp-core/reader'),
    rfuncs = require('./readfuncs');

// inner html shorthand <<>>
// might wrap a simple var i.e. <<elem>>, or a dom selector i.e. <<$#elem>>
exports['__html_innerhtml'] = {
  match: /<<[\$a-zA-Z\-\_]+[\#a-zA-Z0-9\-\_]*>>/g,
  priority: 210, // check before normal tags, "<", "<=", etc.
  read:
    function(source) {
      // skip the "<<" brackets
      // note our regex is very specific so no concern over "<<" operator here
      var openingBracketsToken = source.skip_token("<<");

      // we generate:
      //   (.innerHTML expr)
      // where expr means what was inside ie. <<expr>>
      var list = sl.list(".innerHTML");
      list.setOpening(openingBracketsToken);

      // read what's inside normally
      // note ">>" operator is defined in core it still stop this read at ">>"
      list.push(reader.read(source));

      // skip the ending brackets
      var closingBrackets = source.skip_text(">>");

      return list;
    }
};

// start of html tag
exports['__html_starttag'] = {
  match: /<[a-zA-Z\-\_]+[a-zA-Z0-9\-\_]*/g,
  priority: 200, // check before "<", "<=", etc.
  read:
    function(source) {
      return rfuncs.read_html_element(source);
    }
};

// $#element is a convention for referring to DOM elements
// ($# meant to be reminiscent of jquery's $("#element")
exports['$#'] = function(source) {
  source.skip_text('$#');
  var nextForm = reader.read(source);
  var list = sl.list("document.getElementById", sl.str(sl.valueOf(nextForm)));
  list.setOpening(nextForm);
  return list;
}
