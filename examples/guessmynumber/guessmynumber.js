// Generated by SugarLisp v0.6.5

var guess_cell;
var guesses_cell = 1;

var guessesbadgeelem = undefined;
var submitguess = undefined;

function guessinggame_comp(player) {
  return (
    "\n    <div class=\"guessing-game-play-area\">" + (
      "\n      <h2 id=\"prompt\">" + "What number am I thinking of" + ((player ?
        (player + " ") :
        "")) + "? " + (
        "\n        <br/>") + "(between 1 and 100)" +
      "\n      </h2>") + (
      "\n      <br/>") + (
      "\n      <button id=\"playagain\" class=\"hidden\" onclick=\"location.reload();\">" +
      "Play Again?" +
      "\n      </button>") + (
      "\n      <div class=\"guessing-game-outer\">" + (
        "\n        <div class=\"aligner\">" + (
          "\n          <div class=\"aligner-item aligner-item--fixed\">" + (
            "\n            <div class=\"guess-box-inner\">" + (
              "\n              <form id=\"guessnumber\">" + (
                "\n                <input type=\"text\" name=\"guess\" class=\"number-input\"/>") + (
                "\n                <button id=\"submitguess\" type=\"submit\" class=\"number-btn btn btn-primary\">" + "Guess&nbsp;&nbsp;" + (
                  "\n                  <span id=\"guessesbadge\"/>") +
                "\n                </button>") +
              "\n              </form>") + (
              "\n              <h3 class=\"alert-info\" id=\"feedback\"/>") +
            "\n            </div>") +
          "\n          </div>") +
        "\n        </div>") +
      "\n      </div>") +
    "\n    </div>");
}

var number = undefined;

function ingameprompt(guesses) {
  return ((guesses < 2) ?
    "Nope. Guess again." :
    ((guesses < 4) ?
      "Keep trying." :
      ((guesses < 6) ?
        "I know you can do it." :
        ((guesses < 8) ?
          "Really?  How many guesses can it take?" :
          ((guesses < 10) ?
            "All right this is getting ridiculous." :
            (true ?
              "Why don't you let somebody else play." : undefined))))));
}


function feedbackmsg(guess) {
  return ((guess > number) ?
    'Your guess was too high.' :
    ((guess < number) ?
      'Your guess was too low.' :
      ((number == guess) ?
        'That was it!!' :
        (isNan(guess) ?
          'That\'s not a number!' :
          ((guess > 100) ?
            'Hey keep it 100 or below would ya.' :
            ((guess < 0) ?
              'Don\'t be so negative!!' : undefined))))));
}




function verify() {
  guess_cell = Number(this.elements.guess.value);
  (document.getElementById("feedback")).innerHTML = feedbackmsg(guess_cell)
  if ((guess_cell === number)) {
    var playagain = document.getElementById("playagain");
    playagain.className = "btn btn-primary";
    submitguess.disabled = true;
    var rating = ((guesses_cell < 5) ?
      "excellent" :
      ((guesses_cell < 10) ?
        "mediocre" :
        (true ?
          "amateur" : undefined)));
    (document.getElementById("prompt")).innerHTML = (
      "\n      <span>" + "Congratulations!!" + (
        "\n        <br/>") + "You got it in " + guesses_cell + " guesses!!" + (
        "\n        <br/>") + "Your official number guesser rating is " + (
        "\n        <i>" +
        rating +
        "\n        </i>") +
      "\n      </span>");
  } else {
    var feedbackElem = document.getElementById("feedback");
    feedbackElem.className = "alert alert-info";

    ++guesses_cell;
    (document.getElementById("prompt")).innerHTML = ingameprompt(guesses_cell)
    guessesbadgeElem.innerHTML = (function(guesses_cell) {
      return guesses_cell;
    })(guesses_cell)
    guessesbadgeElem.className = (function(guesses_cell) {
      return ((guesses_cell > 1) ?
        "badge" :
        "");
    })(guesses_cell)
  };
  return false;
}

function initguessmynumber() {
  (document.getElementById("guessinggame")).innerHTML = guessinggame_comp();
  var guessnumber = document.getElementById("guessnumber");
  guessnumber.onsubmit = verify;
  submitguess = document.getElementById("submitguess");
  submitguess.disabled = false;
  guessesbadgeElem = document.getElementById("guessesbadge");
  number = Math.ceil((Math.random() * 100));
  return;
}