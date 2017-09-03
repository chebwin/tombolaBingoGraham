// FROM https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();
// END from stack overflow

// Setup global variables
var modal = document.getElementsByClassName("modal");
var overlay = document.getElementsByClassName("overlay");
var closeButtons = document.querySelectorAll(".modal button, .overlay");
var modalTitle = document.querySelectorAll(".modal h2");
var numbers = {};
var gameTimer;
var speed = document.getElementById('speed').value; // One second initially - set in HTML
var pauseButton = document.getElementById('pause');
var resumeButton = document.getElementById('resume');
var oneStepButton = document.getElementById('oneStep')  ;


// Part of game game setup; creating an individual line from a set of 5 numbers
function createLine(line) {
    var returnLine = '';
    // Need this to increment which array item we're looking at when a array item has been used
    var rowLocation = 0;

    // Unique logic for the first column
    if (line[0] < 10) {
        returnLine += '<td data-value="' + line[0] + '" data-stamped="false" aria-label="' + line[0] + ' not stamped">' + line[0] + '</td>';
        rowLocation = 1; // Increment next number to check as this one exists in this column
    } else {
        returnLine += '<td data-value="false" data-stamped="true" aria-label="Empty"></td>';
    }

    // Middle columns all have the same logic
    for (var x = 1; x < 8; x += 1) {
        if (line[rowLocation] >= (x * 10) && line[rowLocation] < ((x + 1) * 10)) {
            returnLine += '<td data-value="' + line[rowLocation] + '" data-stamped="false" aria-label="' + line[rowLocation] + ' not stamped">' + line[rowLocation] + '</td>';
            rowLocation += 1;
        } else {
            returnLine += '<td data-value="false" data-stamped="true" aria-label="Empty"></td>';
        }
    }
    
    // Unique logic for the last column
    if (line[rowLocation] >= 80) {
        returnLine += '<td data-value="' + line[rowLocation] + '" data-stamped="false" aria-label="' + line[rowLocation] + ' not stamped">' + line[rowLocation] + '</td>';
    } else {
        returnLine += '<td data-value="false" data-stamped="true" aria-label="Empty"></td>';
    }

    return returnLine;
}

function createBoard(stripCode, board) {
    // Take long string code and make into array of 15 numbers
    var stripNumbers = stripCode.match(/.{1,2}/g);

    var table = '<table id="board' + (board + 1) + '" data-winner="false"><tr>'

    table += createLine([stripNumbers[0], stripNumbers[1], stripNumbers[2], stripNumbers[3], stripNumbers[4]]);
    table += '</tr><tr>';

    table += createLine([stripNumbers[5], stripNumbers[6], stripNumbers[7], stripNumbers[8], stripNumbers[9]]);
    table += '</tr><tr>';

    table += createLine([stripNumbers[10], stripNumbers[11], stripNumbers[12], stripNumbers[13], stripNumbers[14]]);

    table += '</tr></table><div><span id="board' + (board + 1) + 'togo">15</span> to go</div>';

    return table;
}

// Stop the game from running; added as an accessibility consideration - WCAG 2.2.2 Pause, Stop, Hide
function pauseGame() {
    clearInterval(gameTimer);
    pauseButton.setAttribute('disabled', 'disabled');
    resumeButton.removeAttribute('disabled');
    oneStepButton.removeAttribute('disabled');

    return false;
}

// Resume/start game at start and when user hits the button
function resumeGame() {
    speed = document.getElementById('speed').value
    gameTimer = setInterval(function(){ newNumber() }, speed);
    pauseButton.removeAttribute('disabled');
    resumeButton.setAttribute('disabled', 'disabled');
    oneStepButton.setAttribute('disabled', 'disabled');

    return false;
}

// setup new game; either from URL query string or default value
function gameSetup() {
    // Allows game to have a default if no string is provided
    if (urlParams.game === undefined || !urlParams.game.length) {
        urlParams.game = '011722475204365360702637497481233455758302154058881928446789061241507324334876840738576186051132437816395663800818206590104559628214294664710935667287132130687703253151692742547985';
    }

    pauseGame();

    // Each board should be 30 characters long
    var board = urlParams.game.match(/.{1,30}/g);
    var boardCount = board.length;
    var bingo = '';

    // First 9 numbers with added 0's
    // numbers is used by the newNumber() function and is the list of numbers not yet crossed off
    numbers = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];

    for (var x = 10; x <= 90; x += 1) {
        numbers.push('' + x);
    }

    for (var x = 0; x < boardCount; x += 1) {
        bingo += createBoard(board[x], x);
    }

    document.getElementById("bingo").innerHTML = bingo;

    resumeGame()

    return false;
}

// Closes the game end modal and restarts the game
function closeModal() {
    // Hide modal divs, hide modal from screen-readers and resset main content to scroll
    modal[0].setAttribute('hidden', 'hidden');
    modal[0].setAttribute('aria-hidden', 'true');
    overlay[0].setAttribute('hidden', 'hidden');
    document.body.style.overflow = '';

    // Remove event listeners for when modal is open
    closeButtons[0].removeEventListener('click', closeModal);
    closeButtons[1].removeEventListener('click', closeModal);
    document.body.removeEventListener('keydown', checkKeyPress);
    gameSetup(urlParams.game);
}

// Checks for tab key press to trap keyboard interation and escape key to close the modal
function checkKeyPress(e) {
    if (document.activeElement.className === 'button' && e.key === 'Tab') {
        // If tab pressed and element is last button
        e.preventDefault();
    } else if (e.key === 'Escape') {
        // If escape is pressed close the modal
        closeModal();
    }
}

// Opens the game end modal
function openModal(board) {
    modalTitle[0].innerHTML = 'A win for board ' + board;
    closeButtons[1].focus();

    // Show modal divs, unhide modal from screen-readers and set main content to not scroll
    modal[0].removeAttribute('hidden');
    modal[0].setAttribute('aria-hidden', 'false');
    overlay[0].removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Event listers for clicking on close, the overlay and keypress on last item (so we trap keyboard users within the modal)
    closeButtons[0].addEventListener('click', closeModal);
    closeButtons[1].addEventListener('click', closeModal);
    document.body.addEventListener('keydown', checkKeyPress);

    // Ensures the modal is in view
    window.scrollTo(0, 0);
}

// Updates the chosen number on the board with an 'x'
function updateNumbers(newNumber) {
    var crossNumber = document.querySelectorAll('[data-value="' + newNumber + '"]');
    if (crossNumber.length) {
        crossNumber[0].setAttribute('data-stamped', 'true');
        crossNumber[0].setAttribute('aria-label', newNumber + ' is stamped');
    }
}

// Updates the count of numbers for each board
function updateToGo(newNumber) {
    var board;
    var togoCount;

    for (board = 1; board <= 6; board += 1) {
        togoCount = document.querySelectorAll('table#board' + board + ' [data-stamped="false"]');
        togoCount = togoCount.length;
        
        document.getElementById('board' + board + 'togo').innerHTML = togoCount;

        // If a board is complete pause the game and show win modal
        if (togoCount === 0) {
            pauseGame();
            openModal(board);
        }
    }
}

// Legs 11; the function that returns a new game number - controlled but the setInterval, pauseGame and resumeGame.
// Also called when 'Complete one game step' button is clicked so users can control the game speed themselves
function newNumber() {
    var numbersLength = numbers.length;
    var newNumber = Math.floor(Math.random() * (numbersLength + 1));
    newNumber = numbers[newNumber];

    var index = numbers.indexOf('' + newNumber);

    // Remove chosen number from remaining numbers
    if (index > -1) {
        numbers.splice(index, 1);
    }

    updateNumbers(newNumber);
    updateToGo(newNumber)

    return false;
}

// Starts the game initially onLoad
gameSetup();
