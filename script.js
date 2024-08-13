document.addEventListener("DOMContentLoaded", () => {
  const voteList = document.getElementById("votes");
  const voteForm = document.getElementById("vote-form");
  const voteTitleInput = document.getElementById("vote-title");
  const voteExpirationInput = document.getElementById("vote-expiration");
  const managePollsSection = document.getElementById("manage-polls");
  const loginSection = document.getElementById("login-section");
  const loginForm = document.getElementById("login-form");
  const voteSection = document.getElementById("vote-section");
  const resultsSection = document.getElementById("results");
  const historySection = document.getElementById("history-section");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const deleteVoteButton = document.getElementById("delete-vote");
  const editVoteButton = document.getElementById("edit-vote");
  const resultsChart = document
    .getElementById("results-chart")
    .getContext("2d");
  const backToVoteButton = document.getElementById("back-to-vote");
  const backToVoteListButton = document.getElementById("back-to-vote-list");
  const showResultsButton = document.getElementById("show-results");
  const showHistoryButton = document.getElementById("show-history");
  const voteHistoryList = document.getElementById("vote-history");
  const searchInput = document.getElementById("search-polls");
  const filterSelect = document.getElementById("filter-polls");

  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let votingHistory = JSON.parse(localStorage.getItem("votingHistory")) || {};
  let users = JSON.parse(localStorage.getItem("users")) || {
    admin: "admin123",
    user: "user",
  };
  let selectedPoll = null;
  let isAdmin = false;
  let currentUser = "";

  function savePolls() {
    localStorage.setItem("polls", JSON.stringify(polls));
  }

  function saveVotingHistory() {
    localStorage.setItem("votingHistory", JSON.stringify(votingHistory));
  }

  function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function renderPolls() {
    voteList.innerHTML = "";
    const now = new Date().getTime();
    const searchQuery = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    let filteredPolls = polls.filter((poll) =>
      poll.title.toLowerCase().includes(searchQuery)
    );

    if (filterValue === "active") {
      filteredPolls = filteredPolls.filter(
        (poll) => new Date(poll.expiration).getTime() > now
      );
    } else if (filterValue === "expired") {
      filteredPolls = filteredPolls.filter(
        (poll) => new Date(poll.expiration).getTime() <= now
      );
    }

    filteredPolls.forEach((poll, index) => {
      const expiration = new Date(poll.expiration).getTime();
      const isExpired = now > expiration;
      const expirationMessage = isExpired ? " (Expired)" : "";
      const li = document.createElement("li");
      li.innerHTML = `
              ${poll.title} 
              <span class="vote-count">${poll.votes} votes</span>
              ${expirationMessage}
              ${
                !isAdmin && !isExpired
                  ? `<button class="vote-button" data-index="${index}">Vote</button>`
                  : ""
              }
              ${
                isAdmin
                  ? `<input type="radio" name="select-poll" value="${index}" ${
                      selectedPoll === index ? "checked" : ""
                    }>`
                  : ""
              }
          `;
      voteList.appendChild(li);
    });

    managePollsSection.style.display = isAdmin ? "block" : "none";
  }

  function renderVotingHistory() {
    voteHistoryList.innerHTML = "";
    if (votingHistory[currentUser]) {
      votingHistory[currentUser].forEach((historyItem) => {
        const li = document.createElement("li");
        li.innerHTML = `Poll: ${historyItem.poll} - Voted: ${historyItem.choice}`;
        voteHistoryList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No voting history available.";
      voteHistoryList.appendChild(li);
    }
  }

  voteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const newPollTitle = voteTitleInput.value.trim();
    const expiration = voteExpirationInput.value;

    if (
      newPollTitle &&
      expiration &&
      !polls.some((poll) => poll.title === newPollTitle)
    ) {
      polls.push({ title: newPollTitle, expiration: expiration, votes: 0 });
      voteTitleInput.value = "";
      voteExpirationInput.value = "";
      savePolls();
      renderPolls();
    } else if (polls.some((poll) => poll.title === newPollTitle)) {
      alert(
        "Poll with this title already exists. Please choose a different title."
      );
    } else {
      alert("Poll title or expiration cannot be empty.");
    }
  });

  voteList.addEventListener("click", (event) => {
    if (event.target.classList.contains("vote-button") && !isAdmin) {
      const pollIndex = event.target.getAttribute("data-index");
      const poll = polls[pollIndex];
      const now = new Date().getTime();
      const expiration = new Date(poll.expiration).getTime();

      if (now <= expiration) {
        poll.votes++;
        savePolls();
        renderPolls();

        if (!votingHistory[currentUser]) {
          votingHistory[currentUser] = [];
        }
        votingHistory[currentUser].push({ poll: poll.title, choice: "Yes" });
        saveVotingHistory();
        renderVotingHistory();

        alert("Your vote has been recorded!");
      } else {
        alert("This poll has expired and you cannot vote on it anymore.");
      }
    }
  });

  voteList.addEventListener("change", (event) => {
    if (isAdmin && event.target.name === "select-poll") {
      selectedPoll = parseInt(event.target.value, 10);
    }
  });

  editVoteButton.addEventListener("click", () => {
    if (isAdmin && selectedPoll !== null) {
      const newTitle = prompt(
        "Enter new title for the selected poll:",
        polls[selectedPoll].title
      );
      const newExpiration = prompt(
        "Enter new expiration date for the selected poll:",
        polls[selectedPoll].expiration
      );

      if (newTitle && newExpiration) {
        polls[selectedPoll].title = newTitle;
        polls[selectedPoll].expiration = newExpiration;
        savePolls();
        renderPolls();
      }
    } else {
      alert("Please select a poll to edit.");
    }
  });

  deleteVoteButton.addEventListener("click", () => {
    if (isAdmin && selectedPoll !== null) {
      if (confirm("Are you sure you want to delete the selected poll?")) {
        polls.splice(selectedPoll, 1);
        selectedPoll = null;
        savePolls();
        renderPolls();
      }
    } else {
      alert("Please select a poll to delete.");
    }
  });

  showResultsButton.addEventListener("click", () => {
    const data = {
      labels: polls.map((poll) => poll.title),
      datasets: [
        {
          label: "Poll Results",
          data: polls.map((poll) => poll.votes),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    new Chart(resultsChart, {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    resultsSection.style.display = "block";
    voteSection.style.display = "none";
    historySection.style.display = "none";
  });

  showHistoryButton.addEventListener("click", () => {
    renderVotingHistory();
    historySection.style.display = "block";
    voteSection.style.display = "none";
    resultsSection.style.display = "none";
  });

  backToVoteButton.addEventListener("click", () => {
    resultsSection.style.display = "none";
    voteSection.style.display = "block";
    historySection.style.display = "none";
  });

  backToVoteListButton.addEventListener("click", () => {
    historySection.style.display = "none";
    voteSection.style.display = "block";
    resultsSection.style.display = "none";
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username in users && users[username] === password) {
      currentUser = username;
      isAdmin = username === "admin";
      loginSection.style.display = "none";
      voteSection.style.display = "block";
      renderPolls();
    } else {
      alert("Invalid username or password.");
    }
  });

  searchInput.addEventListener("input", () => {
    renderPolls();
  });

  filterSelect.addEventListener("change", () => {
    renderPolls();
  });
});
