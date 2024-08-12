document.addEventListener("DOMContentLoaded", () => {
  const voteList = document.getElementById("votes");
  const voteForm = document.getElementById("vote-form");
  const voteTitleInput = document.getElementById("vote-title");
  const managePollsSection = document.getElementById("manage-polls");
  const loginSection = document.getElementById("login-section");
  const loginForm = document.getElementById("login-form");
  const voteSection = document.getElementById("vote-section");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const deleteVoteButton = document.getElementById("delete-vote");
  const editVoteButton = document.getElementById("edit-vote");
  const resultsChart = document
    .getElementById("results-chart")
    .getContext("2d");
  const backToVoteButton = document.getElementById("back-to-vote");
  const showResultsButton = document.getElementById("show-results");
  const resultsSection = document.getElementById("results");

  const votes = [];
  const voteCounts = {};
  let selectedVote = null;
  let isAdmin = false;

  function renderVotes() {
    voteList.innerHTML = "";
    votes.forEach((vote) => {
      const li = document.createElement("li");
      li.innerHTML = `
              ${vote} 
              <span class="vote-count">${voteCounts[vote] || 0} votes</span>
              ${
                !isAdmin
                  ? `<button class="vote-button" data-vote="${vote}">Vote</button>`
                  : ""
              }
              ${
                isAdmin
                  ? `<input type="radio" name="select-vote" value="${vote}" ${
                      selectedVote === vote ? "checked" : ""
                    }>`
                  : ""
              }
          `;
      voteList.appendChild(li);
    });

    managePollsSection.style.display = isAdmin ? "block" : "none";
  }

  voteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const newVoteTitle = voteTitleInput.value.trim();
    if (newVoteTitle && !votes.includes(newVoteTitle)) {
      votes.push(newVoteTitle);
      voteCounts[newVoteTitle] = 0;
      voteTitleInput.value = "";
      renderVotes();
    } else if (votes.includes(newVoteTitle)) {
      alert(
        "Poll with this title already exists. Please choose a different title."
      );
    } else {
      alert("Poll title cannot be empty.");
    }
  });

  voteList.addEventListener("click", (event) => {
    if (event.target.classList.contains("vote-button") && !isAdmin) {
      const voteTitle = event.target.getAttribute("data-vote");
      if (voteCounts[voteTitle] !== undefined) {
        voteCounts[voteTitle]++;
        renderVotes();
      }
    }
  });

  voteList.addEventListener("change", (event) => {
    if (isAdmin && event.target.name === "select-vote") {
      selectedVote = event.target.value;
    }
  });

  deleteVoteButton.addEventListener("click", () => {
    if (!isAdmin || !selectedVote) return; // Only allow admin to delete

    const index = votes.indexOf(selectedVote);
    if (index > -1) {
      votes.splice(index, 1);
      delete voteCounts[selectedVote];
      selectedVote = null;
      renderVotes();
    }
  });

  editVoteButton.addEventListener("click", () => {
    if (!isAdmin || !selectedVote) return; // Only allow admin to edit

    const newVoteTitle = prompt(
      "Enter the new title for the selected vote:",
      selectedVote
    );
    if (newVoteTitle && !votes.includes(newVoteTitle)) {
      const index = votes.indexOf(selectedVote);
      if (index > -1) {
        votes[index] = newVoteTitle;
        voteCounts[newVoteTitle] = voteCounts[selectedVote];
        delete voteCounts[selectedVote];
        selectedVote = newVoteTitle;
        renderVotes();
      }
    }
  });

  backToVoteButton.addEventListener("click", () => {
    resultsSection.style.display = "none";
    voteSection.style.display = "block";
    renderVotes();
  });

  showResultsButton.addEventListener("click", () => {
    const labels = votes;
    const data = votes.map((vote) => voteCounts[vote] || 0);

    new Chart(resultsChart, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Vote Counts",
            data: data,
            backgroundColor: "#007bff",
            borderColor: "#0056b3",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    resultsSection.style.display = "block";
    voteSection.style.display = "none";
  });

  // Handle login
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === "admin" && password === "admin123") {
      isAdmin = true;
    } else {
      isAdmin = false;
    }

    loginSection.style.display = "none";
    voteSection.style.display = "block";
    renderVotes();
  });

  renderVotes();
});
