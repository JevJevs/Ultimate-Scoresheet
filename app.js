let players = [];

const playersDiv = document.getElementById("players");
const input = document.getElementById("playerInput");
const storageKey = "myPlayers";


function renderPlayers() {
    playersDiv.innerHTML = "";

    if (players.length === 0) return;

    // Create Table Structure
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // Create Table Header
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="text-align: left; border-bottom: 2px solid #000141;">
            <th style="padding: 8px; text-align: left;">Name</th>
            <th style="padding: 8px; text-align: center;">Goals</th>
            <th style="padding: 8px; text-align: center;">Assists</th>
            <th style="padding: 8px; text-align: center;">Delete</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create Table Body
    const tbody = document.createElement("tbody");

    players.forEach((player, idx) => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #0001414b";

        // Name Cell
        const nameTd = document.createElement("td");
        nameTd.style.padding = "8px";
        nameTd.style.width = "40%";
        nameTd.style.textAlign = "left";
        nameTd.textContent = player.name;

        // Goals Cell
        const goalsTd = document.createElement("td");
        goalsTd.style.padding = "8px";
        goalsTd.style.textAlign = "center";
        const goalBtn = document.createElement("button");
        goalBtn.textContent = player.goals;
        goalBtn.style.backgroundColor = "#1f5326";
        goalBtn.style.textAlign = "center";
        goalBtn.onclick = () => updateStat(idx, "goals", 1);
        goalsTd.appendChild(goalBtn);

        // Assists Cell
        const assistsTd = document.createElement("td");
        assistsTd.style.padding = "8px";
        assistsTd.style.textAlign = "center";
        const assistBtn = document.createElement("button");
        assistBtn.textContent = player.assists;
        assistBtn.style.backgroundColor = "#4b0cc2";
        assistBtn.onclick = () => updateStat(idx, "assists", 1);
        assistsTd.appendChild(assistBtn);

        // Delete Cell
        const deleteTd = document.createElement("td");
        deleteTd.style.padding = "8px";
        deleteTd.style.textAlign = "center";
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "x";
        removeBtn.style.backgroundColor = "#830000";
        removeBtn.onclick = () => removePlayer(idx);
        deleteTd.appendChild(removeBtn);

        // Assemble Row
        tr.appendChild(nameTd);
        tr.appendChild(goalsTd);
        tr.appendChild(assistsTd);
        tr.appendChild(deleteTd);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    playersDiv.appendChild(table);
    
}

function updateStat(idx, stat, amount) {
    players[idx][stat] += amount;
    renderPlayers();
    savePlayers();
}

function loadPlayers() {
    const savedPlayers = localStorage.getItem(storageKey);
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        renderPlayers();
    }
}

function savePlayers() {
    localStorage.setItem(storageKey, JSON.stringify(players));
}

function addPlayer() {
    if (input.value.trim() === "") {
        alert("Please enter a valid player name");
        return;
    }

    players.push({
        name: input.value.trim(),
        goals: 0,
        assists: 0
    });

    renderPlayers();
    input.value = "";
    savePlayers();
}

function removePlayer(idx) {
    players.splice(idx, 1);
    renderPlayers();
    savePlayers();
}

function clearPlayers() {
    if (confirm("Are you sure you want to clear all players?")) {
        players = [];
        renderPlayers();
        savePlayers();
    }
}

document.addEventListener("DOMContentLoaded", loadPlayers);

input.addEventListener("keypress", function(event) {

  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("mybutton").click();
  }
}); 

