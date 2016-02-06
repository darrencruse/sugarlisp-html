/**
 * Javascript code generation for SugarLisp html
 */

var sl = require('sugarlisp-core/sl-types'),
    lex = require('sugarlisp-core/lexer'),
    reader = require('sugarlisp-core/reader'),
    utils = require('sugarlisp-core/utils'),
    debug = require('debug')('sugarlisp:html:keywords:debug'),
    trace = require('debug')('sugarlisp:html:keywords:trace');

// we generate plain html in "static" mode
// we generate javascript code that creates html strings in "dynamic" mode

// sugarlisp calls this function when a new html dialect is used
exports["__init"] = function(source, dialect) {
   // the default mode differs based on the file extension
   dialect.html_keyword_mode = getDefaultHtmlKeywordMode(source);
},

// an xhtml tag
exports["tag"] = function(forms) {

  // a tag must at the very least have a tag name:
  if (forms.length < 2) {
    forms.error("missing tag name");
  }

  var generated;

  // just popoff "tag" from the front of the expression
  var tagForm = forms.shift();

  // and see if that works as an expression
  // i.e. if the tag name is a function or macro we can call
  // (passthru false means *dont* pass things like e.g.
  //  e.g. "console.log" through to the output code)
  forms[0].value = sl.stripQuotes(sl.valueOf(forms[0]));
  var generated = this.transpileExpression(forms, {passthru: false});
  if(!generated) {
    trace((forms[0] && sl.valueOf(forms[0]) ? sl.valueOf(forms[0]) : "form") +
            " was not a macro or function")
    // add the quotes back
    forms[0].value = sl.addQuotes(sl.valueOf(forms[0]));
    // put "tag" back on the front
    forms.unshift(tagForm);
    generated = renderTag.call(this,forms); // render it to static or dynamic html
  }
  return generated;
}

function renderTag(forms) {
  var generated = sl.generated()

  this.indent += this.indentSize

  var tagName = sl.stripQuotes(sl.valueOf(forms[1]));
  var tagAttributes;
  var tagBody;
  if(forms.length > 2) {
    var formPos = 2;
    if(sl.isList(forms[formPos]) &&
        forms[formPos].length > 0 &&
        sl.valueOf(forms[formPos][0]) === 'attr') {
          tagAttributes = this.transpileExpression(forms[formPos]);
        formPos++;
    }
    if(formPos < forms.length) {
        if(Array.isArray(forms[formPos])) {
          tagBody = this.transpileExpression(forms[formPos]);
        }
        else {
          tagBody = forms[formPos].toString();
        }
    }
  }

  var dyn = (getHtmlKeywordMode(forms) === 'dynamic');
  generated.push(dyn ? ' (\n"\\n' : '\n');
  // delete? generated.push(dyn ? ' (\n"' : '\n');
  generated.push(" ".repeat(this.indent) + "<" + tagName);
  if(tagAttributes) {
    generated.push(tagAttributes);
  }
  if(tagBody) {
    var endTag = '</' + tagName + '>';
    if(dyn) {
      generated.push('>" +');
      generated.push(((typeof tagBody === 'string') ? "\n" + " ".repeat(this.indent+this.indentSize) : ""));
      generated.push(tagBody + ' +\n"\\n');
      generated.push(" ".repeat(this.indent) + endTag + '")');
    }
    else {
      generated.push('>');
      generated.push(((typeof tagBody === 'string') ?
                "\n" + " ".repeat(this.indent+this.indentSize) : ""));
      generated.push((typeof tagBody === 'string' ?
                tagBody.replace(/^[\'\"]|[\'\"]$/g, '') : tagBody) + '\n');
      generated.push(" ".repeat(this.indent) + endTag);
    }
  }
  else {
    if(tagName === "script") {
        // browsers are stupid about <script/>!!
        generated.push("></script>" + (dyn ? '")' : ""));
    }
    else {
      generated.push('/>' + (dyn ? '")' : ""));
    }
  }

  this.indent -= this.indentSize;

  if(!dyn) {
    this.noSemiColon = true;
  }

  return generated;
}

// the attributes of an xhtml tag
exports["attr"] = function(forms) {
    var generated = sl.generated();

    if (forms.length == 1) {
        // no attributes
        return generated;
    }

    this.transpileSubExpressions(forms)

    // if dynamic we have to escape the quotes around strings
    // since this winds up inside a quoted string of html
    var dyn = (getHtmlKeywordMode(forms) === 'dynamic');
    var q = (dyn ? '\\"' : '"');

    for (var i = 1; i < forms.length; i = i + 2) {
      if(sl.typeOf(forms[i+1]) === 'string') {
        generated.push([' ', sl.valueOf(forms[i]), '=' + q, sl.stripQuotes(sl.valueOf(forms[i+1])), q]);
      }
      else {
        generated.push([' ', sl.valueOf(forms[i]), '=' + q + '\" + ', forms[i+1].toString(), ' + \"' + q]);
      }
    }

    return generated;
}

// "tagjoiner" is smart about only emitting "+" in dynamic mode
// (originally we got by using simply "+" before there was static mode)
exports["tagjoiner"] = function(forms) {
    if (forms.length < 3)  {
      forms.error("binary operator requires two or more arguments");
    }

    var generated;
    var dyn = (getHtmlKeywordMode(forms) === 'dynamic');
    this.transpileSubExpressions(forms);

    // get rid of "tagjoiner" so it doesn't pass thru
    forms.shift();

    if(dyn) {
      // '+' joins the html strings in dynamic mode
      var op = sl.generated();
      op.push([" ", "+", " "]);
      generated = sl.generatedFromArray(forms);
      generated.join(op); // inserts "+" between the forms
    }
    else {
      // in static mode we put out the text alone (no "+" and no quotes)
      generated = sl.generated();
      forms.forEach(function(form, i) {
        if(sl.typeOf(form) === 'string') {
          generated.push(sl.valueOf(form).replace(/^\"|\"$/g, ''));
        }
        else {
          generated.push(form);
        }
        if(i < forms.length-1) {
          generated.push(" ");
        }
      })
    }
    return generated;
}

function getHtmlKeywordMode(forms) {
  var dialect = sl.lexerOf(forms).dialects.find(function(dialect) {
	           return dialect.name === "html";
                });
  if(!dialect || dialect.name !== "html") {
    console.log("warning: failed to find an html dialect used in this file");
    return getDefaultHtmlKeywordMode(forms);
  }
  return dialect.html_keyword_mode;
}

function getDefaultHtmlKeywordMode(formsOrLexer) {
  //return "dynamic"; // uncomment for testing
  var lexer;
  if(formsOrLexer instanceof lex.Lexer) {
    lexer = formsOrLexer;
  }
  else {
    lexer = sl.lexerOf(formsOrLexer);
    if(!lexer) {
      console.log("warning:  no lexer found on forms in html keyword handler.");
    }
  }
  return (lexer.filename.indexOf(".lsml") !== -1 ?
                           "static" : "dynamic");
}
