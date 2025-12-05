document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const dice = document.getElementById('dice');
    const rollDiceButton = document.getElementById('roll-dice');
    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question-text');
    const questionTitle = document.getElementById('question-title');
    const options = document.querySelectorAll('.option');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name');
    const player1Position = document.getElementById('player1-position');
    const player2Position = document.getElementById('player2-position');

    let currentPlayer = 1;
    let playerPositions = { 1: 1, 2: 1 };
    let snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
    let ladders = { 2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 80: 100 };
    let cybersecurityQuestions = [
        {
            question: "What is the primary purpose of a firewall?",
            options: ["To prevent physical access to a building", "To monitor and control incoming and outgoing network traffic", "To store sensitive data", "To encrypt data"],
            answer: 1
        },
        {
            question: "Which of the following is a common symptom of a phishing attack?",
            options: ["Unusually high network traffic", "Unexpected pop-ups asking for personal information", "Slow computer performance", "All of the above"],
            answer: 1
        },
        {
            question: "What does the term 'two-factor authentication' mean?",
            options: ["Using two different passwords to log in", "Using a password and a security token or biometric factor to log in", "Using two different devices to log in", "Using a password and a username to log in"],
            answer: 1
        },
        {
            question: "Which of the following is NOT a type of malware?",
            options: ["Virus", "Worm", "Trojan", "Firewall"],
            answer: 3
        },
        {
            question: "What is the main purpose of encryption?",
            options: ["To speed up data transfer", "To protect data by converting it into a code", "To store data in the cloud", "To delete data securely"],
            answer: 1
        },
        {
            question: "Which of the following is a best practice for creating a strong password?",
            options: ["Using a common word or phrase", "Using a combination of letters, numbers, and special characters", "Using a short and simple password", "Using the same password for multiple accounts"],
            answer: 1
        },
        {
            question: "What is a VPN used for?",
            options: ["To increase internet speed", "To create a secure connection over a less secure network", "To store large amounts of data", "To block all incoming network traffic"],
            answer: 1
        },
        {
            question: "Which of the following is an example of a social engineering attack?",
            options: ["DDoS attack", "SQL injection", "Phishing", "Cross-site scripting"],
            answer: 2
        },
        {
            question: "What is the purpose of a security patch?",
            options: ["To add new features to software", "To fix vulnerabilities in software", "To change the software's user interface", "To remove unnecessary features from software"],
            answer: 1
        },
        {
            question: "Which of the following is a common method used to protect against SQL injection attacks?",
            options: ["Using strong passwords", "Input validation and parameterized queries", "Regularly updating software", "Using a firewall"],
            answer: 1
        }
    ];

    // Draw the game board
    function drawBoard() {
        const cellSize = canvas.width / 10;
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const x = col * cellSize;
                const y = row * cellSize;
                ctx.strokeStyle = '#333';
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Draw numbers
                const number = row * 10 + col + 1;
                if (row % 2 === 0) {
                    ctx.fillText(number, x + cellSize / 2, y + cellSize / 2);
                } else {
                    ctx.fillText(number, x + cellSize / 2, y + cellSize / 2);
                }
            }
        }

        // Draw snakes and ladders
        for (const [start, end] of Object.entries(snakes)) {
            const startPos = getPosition(parseInt(start));
            const endPos = getPosition(parseInt(end));
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startPos.x + cellSize / 2, startPos.y + cellSize / 2);
            ctx.lineTo(endPos.x + cellSize / 2, endPos.y + cellSize / 2);
            ctx.stroke();
        }

        for (const [start, end] of Object.entries(ladders)) {
            const startPos = getPosition(parseInt(start));
            const endPos = getPosition(parseInt(end));
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startPos.x + cellSize / 2, startPos.y + cellSize / 2);
            ctx.lineTo(endPos.x + cellSize / 2, endPos.y + cellSize / 2);
            ctx.stroke();
        }
    }

    // Get position on the canvas based on the cell number
    function getPosition(cellNumber) {
        const cellSize = canvas.width / 10;
        const row = Math.floor((cellNumber - 1) / 10);
        const col = (cellNumber - 1) % 10;
        const x = col * cellSize;
        const y = (9 - row) * cellSize;
        return { x, y };
    }

    // Draw players on the board
    function drawPlayers() {
        const cellSize = canvas.width / 10;
        for (const [player, position] of Object.entries(playerPositions)) {
            const pos = getPosition(position);
            const img = new Image();
            img.src = `assets/player${player}.png`;
            img.onload = () => {
                ctx.drawImage(img, pos.x + cellSize / 4, pos.y + cellSize / 4, cellSize / 2, cellSize / 2);
            };
        }
    }

    // Roll the dice
    function rollDice() {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        dice.src = `assets/dice/dice${diceRoll}.png`;
        return diceRoll;
    }

    // Animate the dice roll
    function animateDiceRoll() {
        let rolls = 0;
        const interval = setInterval(() => {
            rollDice();
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                const diceRoll = rollDice();
                setTimeout(() => {
                    movePlayer(diceRoll);
                }, 500);
            }
        }, 100);
    }

    // Move the player
    function movePlayer(steps) {
        const newPosition = playerPositions[currentPlayer] + steps;
        if (newPosition > 100) {
            alert(`Player ${currentPlayer} needs exactly ${100 - playerPositions[currentPlayer]} to win!`);
            switchPlayer();
            return;
        }

        playerPositions[currentPlayer] = newPosition;
        updatePlayerPosition();

        // Check for snakes or ladders
        if (snakes[newPosition]) {
            showQuestion('snake');
        } else if (ladders[newPosition]) {
            showQuestion('ladder');
        } else {
            checkWinCondition();
            switchPlayer();
        }
    }

    // Show a question
    function showQuestion(type) {
        const usedQuestions = [];
        let questionIndex;
        do {
            questionIndex = Math.floor(Math.random() * cybersecurityQuestions.length);
        } while (usedQuestions.includes(questionIndex));

        usedQuestions.push(questionIndex);
        const question = cybersecurityQuestions[questionIndex];

        questionTitle.textContent = type === 'snake' ? 'Snake Question' : 'Ladder Question';
        questionText.textContent = question.question;
        options.forEach((option, index) => {
            option.textContent = question.options[index];
            option.dataset.correct = index === question.answer - 1;
        });

        questionContainer.style.display = 'block';
    }

    // Check the answer
    function checkAnswer(event) {
        const isCorrect = event.target.dataset.correct === 'true';
        const currentPosition = playerPositions[currentPlayer];

        if (isCorrect) {
            if (ladders[currentPosition]) {
                playerPositions[currentPlayer] = ladders[currentPosition];
                updatePlayerPosition();
                alert(`Correct! Player ${currentPlayer} climbs the ladder to ${ladders[currentPosition]}`);
            } else {
                alert('Correct! You stay in your position.');
            }
        } else {
            if (snakes[currentPosition]) {
                playerPositions[currentPlayer] = snakes[currentPosition];
                updatePlayerPosition();
                alert(`Incorrect! Player ${currentPlayer} is bitten by the snake and goes down to ${snakes[currentPosition]}`);
            } else {
                alert('Incorrect! You stay in your position.');
            }
        }

        questionContainer.style.display = 'none';
        checkWinCondition();
        switchPlayer();
    }

    // Update player position on the UI
    function updatePlayerPosition() {
        player1Position.textContent = playerPositions[1];
        player2Position.textContent = playerPositions[2];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard();
        drawPlayers();
    }

    // Switch player
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    // Check win condition
    function checkWinCondition() {
        if (playerPositions[currentPlayer] === 100) {
            const playerName = currentPlayer === 1 ? player1NameInput.value || 'Player 1' : player2NameInput.value || 'Player 2';
            alert(`${playerName} wins!`);
            resetGame();
        }
    }

    // Reset the game
    function resetGame() {
        playerPositions = { 1: 1, 2: 1 };
        updatePlayerPosition();
        currentPlayer = 1;
    }

    // Event listeners
    rollDiceButton.addEventListener('click', animateDiceRoll);
    options.forEach(option => {
        option.addEventListener('click', checkAnswer);
    });

    // Initialize the game
    drawBoard();
    drawPlayers();
});