document.addEventListener("DOMContentLoaded", () => {
  const voteList = document.getElementById("votes");
  const voteForm = document.getElementById("vote-form");
  const voteTitleInput = document.getElementById("vote-title");
  const resultsSection = document.getElementById("results");
  const managePollsSection = document.getElementById("manage-polls");
  const backToVoteButton = document.getElementById("back-to-vote");
  const deleteVoteButton = document.getElementById("delete-vote");
  const editVoteButton = document.getElementById("edit-vote");
  const resultsChart = document
    .getElementById("results-chart")
    .getContext("2d");

  const votes = [];
  const voteCounts = {};
  let selectedVote = null;

  function renderVotes() {
    voteList.innerHTML = "";
    votes.forEach((vote) => {
      const li = document.createElement("li");
      li.innerHTML = `
                ${vote} 
                <span class="vote-count">${voteCounts[vote] || 0} votes</span>
                <button class="vote-button" data-vote="${vote}">Vote</button>
                <input type="radio" name="select-vote" value="${vote}" ${
        selectedVote === vote ? "checked" : ""
      }>
            `;
      voteList.appendChild(li);
    });
    resultsSection.style.display = "none"; // Hide results section
    managePollsSection.style.display = "block"; // Show manage polls section
  }

  function renderResults() {
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
    resultsSection.style.display = "block"; // Show results section
    managePollsSection.style.display = "none"; // Hide manage polls section
  }

  voteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newVoteTitle = voteTitleInput.value.trim();
    if (newVoteTitle && !votes.includes(newVoteTitle)) {
      votes.push(newVoteTitle);
      voteCounts[newVoteTitle] = 0;
      voteTitleInput.value = "";
      renderVotes();
    }
  });

  voteList.addEventListener("click", (event) => {
    if (event.target.classList.contains("vote-button")) {
      const voteTitle = event.target.getAttribute("data-vote");
      if (voteCounts[voteTitle] !== undefined) {
        voteCounts[voteTitle]++;
        renderVotes();
      }
    }
  });

  voteList.addEventListener("change", (event) => {
    if (event.target.name === "select-vote") {
      selectedVote = event.target.value;
    }
  });

  deleteVoteButton.addEventListener("click", () => {
    if (selectedVote) {
      const index = votes.indexOf(selectedVote);
      if (index > -1) {
        votes.splice(index, 1);
        delete voteCounts[selectedVote];
        selectedVote = null;
        renderVotes();
      }
    }
  });

  editVoteButton.addEventListener("click", () => {
    if (selectedVote) {
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
    }
  });

  backToVoteButton.addEventListener("click", () => {
    resultsSection.style.display = "none";
    voteList.style.display = "block";
    managePollsSection.style.display = "block"; // Show manage polls section
  });

  // Handle results view toggle
  document.getElementById("view-results").addEventListener("click", () => {
    renderResults();
  });

  // Initial render
  renderVotes();
});
