
document.addEventListener("DOMContentLoaded", function () {
    // DOM elements
    const categoryHeading = document.getElementById("category-heading");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const nextButton = document.getElementById("next-button");
    const resultContainer = document.getElementById("result-container");
    const resultText = document.getElementById("result-text");
    const homeButton = document.getElementById("home-button");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const counterText = document.getElementById("counter-text");
    const errorMessage = document.getElementById("error-message");
    const playAgainButton = document.getElementById("play-again-button");
    const answeredQuestionsList = document.getElementById("answered-questions-list");

    // Variables
    let questions = [];
    let questionIndices = [];
    let currentQuestionIndex = 0;
    let score = 0;
    const maxQuestions = 10;
    let answeredQuestions = [];
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    // Fetch questions from JSON file
    function fetchQuestions() {
        fetch("questions.json")
            .then(response => response.json())
            .then(data => {
                questions = data[category];
                if (!questions) {
                    console.error(`Category "${category}" not found in the questions database.`);
                    return;
                }
                categoryHeading.textContent = `Category - ${category}`;
                document.title = `Science Fiction Quiz - ${category}`;
                document.getElementById("page-heading").innerHTML = `<a class="logo" href="./index.html" aria-label="logo home page link">Science Fiction Quiz:<br>${category}</a>`;
                generateQuestionIndices();
                showQuestion();
            })
            .catch(error => console.error("Error fetching questions:", error));
    }

    // Generate random indices for the questions
    function generateQuestionIndices() {
        questionIndices = Array.from({ length: questions.length }, (_, index) => index);
        shuffleArray(questionIndices);
    }

    // Shuffle array randomly
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Display the current question
    function showQuestion() {
        if (currentQuestionIndex >= Math.min(maxQuestions, questionIndices.length)) {
            showResult();
            return;
        }

        const currentQuestion = questions[questionIndices[currentQuestionIndex]];
        questionText.textContent = currentQuestion.question;
        optionsContainer.innerHTML = "";

        currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement("button");
            optionElement.classList.add("option");
            optionElement.textContent = option;
            optionElement.addEventListener("click", () => checkAnswer(index, optionElement));
            optionsContainer.appendChild(optionElement);
        });

        updateProgressText();
    }

    // Check the selected answer
    function checkAnswer(selectedIndex, optionElement) {
        const currentQuestion = questions[questionIndices[currentQuestionIndex]];
        const correctIndex = currentQuestion.correctIndex;

        if (selectedIndex === correctIndex) {
            optionElement.classList.add("correct");
            score++;
            resultText.textContent = "Correct!";
            resultText.style.color = "green";
            answeredQuestions.push({ question: currentQuestion.question, answer: currentQuestion.options[selectedIndex], isCorrect: true });
        } else {
            optionElement.classList.add("wrong");
            resultText.textContent = "Wrong!";
            resultText.style.color = "red";
            highlightCorrectAnswer(correctIndex);
            answeredQuestions.push({ question: currentQuestion.question, answer: currentQuestion.options[selectedIndex], correctAnswer: currentQuestion.options[correctIndex], isCorrect: false });
        }

        disableOptions();
        showNextButton();
    }

    // Highlight the correct answer
    function highlightCorrectAnswer(correctIndex) {
        const options = optionsContainer.children;
        for (let i = 0; i < options.length; i++) {
            if (i === correctIndex) {
                options[i].classList.add("correct");
            }
        }
    }

    // Disable all answer options
    function disableOptions() {
        const options = optionsContainer.children;
        for (let i = 0; i < options.length; i++) {
            options[i].disabled = true;
        }
    }

    // Show the next button
    function showNextButton() {
        nextButton.style.display = "block";
    }

    // Proceed to the next question
    nextButton.addEventListener("click", () => {
        if (!isAnswered()) {
            errorMessage.textContent = "Please provide an answer before continuing.";
            return;
        }

        currentQuestionIndex++;
        resultText.textContent = "";
        errorMessage.textContent = "";

        if (currentQuestionIndex < Math.min(maxQuestions, questionIndices.length)) {
            showQuestion();
        } else {
            showResult();
        }

        updateProgressText();
    });

    // Check if the current question is answered
    function isAnswered() {
        const options = optionsContainer.children;
        for (let i = 0; i < options.length; i++) {
            if (options[i].classList.contains("correct") || options[i].classList.contains("wrong")) {
                return true;
            }
        }
        return false;
    }

    // Show the final result
    function showResult() {
        questionText.style.display = "none";
        optionsContainer.style.display = "none";
        nextButton.style.display = "none";

        resultText.textContent = `Your score: ${score}/${Math.min(maxQuestions, questionIndices.length)}`;
        resultText.style.color = "black";

        answeredQuestionsList.innerHTML = "";
        answeredQuestions.forEach(answeredQuestion => {
            const questionItem = document.createElement("li");
            questionItem.classList.add(answeredQuestion.isCorrect ? "correct" : "wrong");

            const questionTextElement = document.createElement("p");
            questionTextElement.textContent = answeredQuestion.question;
            questionItem.appendChild(questionTextElement);

            const answerItem = document.createElement("p");
            answerItem.textContent = `Your answer: ${answeredQuestion.answer}`;
            questionItem.appendChild(answerItem);

            if (!answeredQuestion.isCorrect) {
                const correctAnswerItem = document.createElement("p");
                correctAnswerItem.textContent = `Correct answer: ${answeredQuestion.correctAnswer}`;
                correctAnswerItem.classList.add("correct-answer");
                questionItem.appendChild(correctAnswerItem);
            }

            answeredQuestionsList.appendChild(questionItem);
        });

        resultContainer.appendChild(answeredQuestionsList);
        showElement(playAgainButton);
    }

    // Restart the quiz
    playAgainButton.addEventListener("click", () => {
        const levelsURL = `level.html?category=${encodeURIComponent(category)}`;
        window.location.href = levelsURL;
    });
    hideElement(playAgainButton);

    // Update progress bar and text
    function updateProgressText() {
        const totalQuestions = Math.min(maxQuestions, questionIndices.length);
        const currentQuestionNumber = currentQuestionIndex + 1;
        const progressPercentage = (currentQuestionNumber / totalQuestions) * 100;

        progressBar.value = progressPercentage;
        progressText.textContent = `${Math.round(progressPercentage)}%`;
        counterText.textContent = `Question: ${currentQuestionNumber} / ${totalQuestions}`;
    }

    // Utility functions
    function showElement(element) {
        element.style.display = "block";
    }

    function hideElement(element) {
        element.style.display = "none";
    }

    function goBackToHome() {
        window.location.href = "index.html";
    }

    // Event listeners
    homeButton.addEventListener("click", goBackToHome);

    // Start quiz by fetching questions
    fetchQuestions();
});
