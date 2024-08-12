document.addEventListener("DOMContentLoaded", () => {
  const voteList = document.getElementById("votes");
  const voteForm = document.getElementById("vote-form");
  const voteTitleInput = document.getElementById("vote-title");

  // Array to store votes and their counts
  const votes = [];
  const voteCounts = {};

  // Function to render votes and vote buttons
  function renderVotes() {
    voteList.innerHTML = "";
    votes.forEach((vote, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
                ${vote} 
                <span class="vote-count">${voteCounts[vote] || 0} votes</span>
                <button class="vote-button" data-vote="${vote}">Vote</button>
            `;
      voteList.appendChild(li);
    });
  }

  // Event listener for form submission
  voteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newVoteTitle = voteTitleInput.value.trim();
    if (newVoteTitle && !votes.includes(newVoteTitle)) {
      votes.push(newVoteTitle);
      voteCounts[newVoteTitle] = 0; // Initialize vote count
      voteTitleInput.value = "";
      renderVotes();
    }
  });

  // Event listener for vote buttons
  voteList.addEventListener("click", (event) => {
    if (event.target.classList.contains("vote-button")) {
      const voteTitle = event.target.getAttribute("data-vote");
      if (voteCounts[voteTitle] !== undefined) {
        voteCounts[voteTitle]++;
        renderVotes();
      }
    }
  });

  // Initial render
  renderVotes();
});
