/**
 * Javascript code generation for SugarLisp html
 */

var sl = require('sugarlisp-core/types'),
    src = require('sugarlisp-core/source'),
    reader = require('sugarlisp-core/reader'),
    utils = require('sugarlisp-core/utils'),
    debug = require('debug')('sugarlisp:html:keywords:info'),
    trace = require('debug')('sugarlisp:html:keywords:trace');

// we generate plain html in "static" mode
// we generate javascript code that creates html strings in "dynamic" mode

// sugarlisp calls this function when a new html dialect is used
exports["__html_init"] = function(source, dialect) {
   // the default mode differs based on the file extension
   dialect.html_keyword_mode = getDefaultHtmlKeywordMode(source);
},

// an xhtml tag
exports["tag"] = function(forms) {

  // a tag must at the very least have a tag name:
  if (forms.length < 2) {
    forms.error("missing tag name");
  }

  var transpiled;

  // just popoff "tag" from the front of the expression
  var tagForm = forms.shift();

  // and see if that works as an expression
  // i.e. if the tag name is a function or macro we can call
  // (passthru false means *dont* pass things like e.g.
  //  e.g. "console.log" through to the output code)
  forms[0].value = sl.stripQuotes(sl.valueOf(forms[0]));
  var transpiled = this.transpileExpression(forms, {passthru: false});
  if(!transpiled) {
    trace((forms[0] && sl.valueOf(forms[0]) ? sl.valueOf(forms[0]) : "form") +
            " was not a macro or function")
    // add the quotes back
    forms[0].value = sl.addQuotes(sl.valueOf(forms[0]));
    // put "tag" back on the front
    forms.unshift(tagForm);
    transpiled = renderTag.call(this,forms); // render it to static or dynamic html
  }
  return transpiled;
}

function renderTag(forms) {
  var transpiled = sl.transpiled()

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
  transpiled.push(dyn ? ' (\n"\\n' : '\n');
  // delete? transpiled.push(dyn ? ' (\n"' : '\n');
  transpiled.push(" ".repeat(this.indent) + "<" + tagName);
  if(tagAttributes) {
    transpiled.push(tagAttributes);
  }
  if(tagBody) {
    var endTag = '</' + tagName + '>';
    if(dyn) {
      transpiled.push('>" +');
      transpiled.push(((typeof tagBody === 'string') ? "\n" + " ".repeat(this.indent+this.indentSize) : ""));
      transpiled.push(tagBody + ' +\n"\\n');
      transpiled.push(" ".repeat(this.indent) + endTag + '")');
    }
    else {
      transpiled.push('>');
      transpiled.push(((typeof tagBody === 'string') ?
                "\n" + " ".repeat(this.indent+this.indentSize) : ""));
      transpiled.push((typeof tagBody === 'string' ?
                tagBody.replace(/^[\'\"]|[\'\"]$/g, '') : tagBody) + '\n');
      transpiled.push(" ".repeat(this.indent) + endTag);
    }
  }
  else {
    if(tagName === "script") {
        // browsers are stupid about <script/>!!
        transpiled.push("></script>" + (dyn ? '")' : ""));
    }
    else {
      transpiled.push('/>' + (dyn ? '")' : ""));
    }
  }

  this.indent -= this.indentSize;

  if(!dyn) {
    this.noSemiColon = true;
  }

  return transpiled;
}

// the attributes of an xhtml tag
exports["attr"] = function(forms) {
    var transpiled = sl.transpiled();

    if (forms.length == 1) {
        // no attributes
        return transpiled;
    }

    this.transpileSubExpressions(forms)

    // if dynamic we have to escape the quotes around strings
    // since this winds up inside a quoted string of html
    var dyn = (getHtmlKeywordMode(forms) === 'dynamic');
    var q = (dyn ? '\\"' : '"');

    for (var i = 1; i < forms.length; i = i + 2) {
      if(sl.typeOf(forms[i+1]) === 'string') {
        transpiled.push([' ', sl.valueOf(forms[i]), '=' + q, sl.stripQuotes(sl.valueOf(forms[i+1])), q]);
      }
      else {
        transpiled.push([' ', sl.valueOf(forms[i]), '=' + q + '\" + ', forms[i+1].toString(), ' + \"' + q]);
      }
    }

    return transpiled;
}

// "tagjoiner" is smart about only emitting "+" in dynamic mode
// (originally we got by using simply "+" before there was static mode)
exports["tagjoiner"] = function(forms) {
    if (forms.length < 3)  {
      forms.error("binary operator requires two or more arguments");
    }

    var transpiled;
    var dyn = (getHtmlKeywordMode(forms) === 'dynamic');
    this.transpileSubExpressions(forms);

    // get rid of "tagjoiner" so it doesn't pass thru
    forms.shift();

    if(dyn) {
      // '+' joins the html strings in dynamic mode
      var op = sl.transpiled();
      op.push([" ", "+", " "]);
      transpiled = sl.transpiledFromArray(forms);
      transpiled.join(op); // inserts "+" between the forms
    }
    else {
      // in static mode we put out the text alone (no "+" and no quotes)
      transpiled = sl.transpiled();
      forms.forEach(function(form, i) {
        if(sl.typeOf(form) === 'string') {
          transpiled.push(sl.valueOf(form).replace(/^\"|\"$/g, ''));
        }
        else {
          transpiled.push(form);
        }
        if(i < forms.length-1) {
          transpiled.push(" ");
        }
      })
    }
    return transpiled;
}

function getHtmlKeywordMode(forms) {
  var dialect = reader.get_current_dialect(sl.sourceOf(forms), forms, "html");
  if(!dialect || dialect.__dialectname !== "html") {
    console.log("warning: failed to find an html dialect used in this file");
    return getDefaultHtmlKeywordMode(forms);
  }
  return dialect.html_keyword_mode;
}

function getDefaultHtmlKeywordMode(formsOrSource) {
  //return "dynamic"; // uncomment for testing
  var source;
  if(formsOrSource instanceof src.Source) {
    source = formsOrSource;
  }
  else {
    source = sl.sourceOf(formsOrSource);
    if(!source) {
      console.log("warning:  no source found on forms in html keyword handler.");
    }
  }
  return (source.filename.indexOf(".lsml") !== -1 ?
                           "static" : "dynamic");
}
