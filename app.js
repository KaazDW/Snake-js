document.addEventListener('DOMContentLoaded', () => {

    const firebaseConfig = {
        apiKey: "...",
        authDomain: "...",
        databaseURL: "...",
        projectId: "...",
        storageBucket: "...",
        messagingSenderId: "...",
        appId: "...",
        measurementId: "..."
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const gridElement = document.querySelector('.grid');
    const scoreDisplay = document.querySelector('.score');
    const tryDisplay = document.getElementById('try');
    const bestDisplay = document.getElementById('best');
    const startStopBtn = document.querySelector('.start-stop');
    const scoreForm = document.getElementById('scoreForm');
    const scoresList = document.getElementById('scoresList');

    const width = 30;
    const divquantity = 900;
    let currentIndex = 0;
    let appleIndex = 0;
    let currentSnake = [1, 0];
    let direction = 1;
    let score = 2;
    let intervalTime = 100;
    let interval = 0;
    let tryNumber = 1;
    let bestScore = 0;
    let keyPressed = false;
    let gameRunning = false;

    for (let i = 0; i < divquantity; i++) {
        const div = document.createElement('div');
        gridElement.appendChild(div);
    }

    const squares = document.querySelectorAll('.grid div');

    function stopGame() {
        clearInterval(interval);
        gameRunning = false;
        startStopBtn.innerHTML = 'Start the game';
    }

    function startGame() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        currentSnake.forEach(index => squares[index].classList.remove('snake', 'head', 'body'));
        squares[appleIndex].classList.remove('apple');
        clearInterval(interval);
        score = 2;
        randomApple();
        direction = 1;
        scoreDisplay.innerText = score;
        tryDisplay.innerText = tryNumber;
        intervalTime = 100;
        currentSnake = [1, 0];
        currentIndex = 0;
        keyPressed = false;
        currentSnake.forEach(index => squares[index].classList.add('snake', 'body'));
        squares[currentSnake[0]].classList.add('head');
        interval = setInterval(moveOutcomes, intervalTime);
        gameRunning = true;
        startStopBtn.innerHTML = 'Stop the game';
    }

    function moveOutcomes() {
        if (
            (currentSnake[0] + width >= squares.length && direction === width) ||
            (currentSnake[0] % width === width - 1 && direction === 1) ||
            (currentSnake[0] % width === 0 && direction === -1) ||
            (currentSnake[0] - width < 0 && direction === -width) ||
            squares[currentSnake[0] + direction].classList.contains('snake')
        ) {
            tryNumber++;
            if (score > bestScore) {
                bestScore = score;
                bestDisplay.innerText = bestScore;
            }
            return startGame();
        }

        const tail = currentSnake.pop();
        squares[tail].classList.remove('snake', 'body');
        currentSnake.unshift(currentSnake[0] + direction);

        if (squares[currentSnake[0]].classList.contains('apple')) {
            squares[currentSnake[0]].classList.remove('apple');
            squares[tail].classList.add('snake', 'body');
            currentSnake.push(tail);
            randomApple();
            score++;
            scoreDisplay.textContent = score;
            clearInterval(interval);
            interval = setInterval(moveOutcomes, intervalTime);
        }

        if (squares[currentSnake[0]].classList.contains('snake')) {
            tryNumber++;
            if (score > bestScore) {
                bestScore = score;
                bestDisplay.innerText = bestScore;
            }
            return startGame();
        }

        squares[currentSnake[0]].classList.add('snake', 'head');
        squares[currentSnake[1]].classList.add('snake', 'body');
        keyPressed = false;
    }

    function randomApple() {
        do {
            appleIndex = Math.floor(Math.random() * squares.length);
        } while (squares[appleIndex].classList.contains('snake'));
        squares[appleIndex].classList.add('apple');
    }

    function control(e) {
        if (keyPressed) return;
        keyPressed = true;

        squares[currentIndex].classList.remove('snake', 'head', 'body');

        if (e.key === 'ArrowRight' && direction !== -1) {
            direction = 1;
        } else if (e.key === 'ArrowUp' && direction !== width) {
            direction = -width;
        } else if (e.key === 'ArrowLeft' && direction !== 1) {
            direction = -1;
        } else if (e.key === 'ArrowDown' && direction !== -width) {
            direction = width;
        }

        e.preventDefault();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { // Utiliser ' ' pour la barre d'espace
            e.preventDefault();
            if (gameRunning) {
                stopGame();
            } else {
                startGame();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (gameRunning) {
                stopGame();
            }
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });

    scoreForm.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            stopGame();
            e.target.focus();
        }
    });

    scoreForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pseudo = document.getElementById('pseudo').value;
        const mdp = document.getElementById('mdp').value;
        const newScore = bestScore;
        const date = new Date().toLocaleDateString();

        if (pseudo === "" || mdp === "") {
            showToastError('Error', 'To save your score, please enter a username and a password.');
            return;
        }

        if (newScore < 2) {
            showToastError('Error', 'Achieve a score to save it.');
            return;
        }

        db.collection('scores').where('pseudo', '==', pseudo).where('mdp', '==', mdp).get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const docId = querySnapshot.docs[0].id;
                    db.collection('scores').doc(docId).delete()
                        .then(() => {
                            db.collection('scores').add({
                                pseudo: pseudo,
                                mdp: mdp,
                                score: newScore,
                                date: date
                            })
                            .then(() => {
                                showToastSuccess('Success', 'Previous score deleted, new score added successfully!');
                                scoreForm.reset();
                                displayScores();
                                startGame();
                            })
                            .catch((error) => {
                                console.error("Error occurred while adding the new score: ", error);
                                showToastError('Error', 'Error encountered while adding the new score.');
                            });
                        })
                        .catch((error) => {
                            console.error("Error encountered while deleting the old score.", error);
                            showToastError('Error', 'Error encountered while deleting the old score.');
                        });
                } else {
                    db.collection('scores').add({
                        pseudo: pseudo,
                        mdp: mdp,
                        score: newScore,
                        date: date
                    })
                    .then(() => {
                        showToastSuccess('Success', 'New score added successfully!');
                        scoreForm.reset();
                        displayScores();
                    })
                    .catch((error) => {
                        console.error("Error adding new score : ", error);
                        showToastError('Error', 'Error adding the new score.');
                    });
                }
            })
            .catch((error) => {
                console.error("Error while searching for existing documents in the DB.", error);
                showToastError('Error', 'Error while searching for existing documents in the DB.');
            });
    });

    function showToastSuccess(title, message) {
        iziToast.success({
            title,
            message,
            position: 'bottomRight',
            timeout: 5000,
            width: '300px'
        });
    }

    function showToastError(title, message) {
        iziToast.error({
            title,
            message,
            position: 'bottomRight',
            timeout: 5000,
            width: '300px'
        });
    }

    function displayScores() {
        scoresList.innerHTML = '';
        let rankingNumber = 1;

        db.collection('scores').orderBy('score', 'desc').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const scoreData = doc.data();
                    const listItem = document.createElement('li');

                    const rankingSpan = document.createElement('span');
                    rankingSpan.textContent = rankingNumber;
                    rankingSpan.className = 'ranking-number';

                    const pseudoSpan = document.createElement('span');
                    pseudoSpan.textContent = scoreData.pseudo;
                    pseudoSpan.className = 'pseudo';

                    const scoreSpan = document.createElement('span');
                    scoreSpan.textContent = scoreData.score;
                    scoreSpan.className = 'score';

                    listItem.appendChild(rankingSpan);
                    listItem.appendChild(pseudoSpan);
                    listItem.appendChild(scoreSpan);

                    scoresList.appendChild(listItem);
                    rankingNumber++;
                });

                const totalItemsElement = document.getElementById('list-total');
                totalItemsElement.textContent = querySnapshot.size;
            })
            .catch((error) => {
                console.error("Error getting scores: ", error);
                showToastError('Error', 'Error retrieving scores.');
            });
    }

    displayScores();

    startStopBtn.addEventListener('click', () => {
        if (gameRunning) {
            stopGame();
        } else {
            startGame();
        }
    });

    document.addEventListener('keydown', control);

});
