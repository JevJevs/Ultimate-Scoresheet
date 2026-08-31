let players = [];
let allPlayers = [];

const playersDiv = document.getElementById("players");
const input = document.getElementById("playerInput");
const storageKey = "myPlayers";
const allStorageKey = "myAllPlayers";

function renderPlayers() {
    playersDiv.innerHTML = "";

    if (players.length === 0) return;

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

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
        goalBtn.style.width = "70px";
        goalBtn.onclick = () => updateStat(idx, "goals", 1);
        goalsTd.appendChild(goalBtn);

        // Assists Cell
        const assistsTd = document.createElement("td");
        assistsTd.style.padding = "8px";
        assistsTd.style.textAlign = "center";
        const assistBtn = document.createElement("button");
        assistBtn.textContent = player.assists;
        assistBtn.style.backgroundColor = "#4b0cc2";
        assistBtn.style.width = "70px";
        assistBtn.onclick = () => updateStat(idx, "assists", 1);
        assistsTd.appendChild(assistBtn);

        // Delete Cell (Removes only from current match)
        const deleteTd = document.createElement("td");
        deleteTd.style.padding = "8px";
        deleteTd.style.textAlign = "center";
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "x";
        removeBtn.style.backgroundColor = "#830000";
        removeBtn.style.width = "70px";
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
    const player = players[idx];
    player[stat] += amount;

    // Sync lifetime totals in allPlayers
    const targetInAll = allPlayers.find(p => p.name === player.name);
    if (targetInAll) {
        if (stat === "goals") targetInAll.totalGoals += amount;
        if (stat === "assists") targetInAll.totalAssists += amount;
    }

    renderPlayers();
    renderscoreboard();
    savePlayers();
}

function loadPlayers() {
    const savedPlayers = localStorage.getItem(storageKey);
    const savedAllPlayers = localStorage.getItem(allStorageKey);

    if (savedPlayers) players = JSON.parse(savedPlayers);
    if (savedAllPlayers) allPlayers = JSON.parse(savedAllPlayers);

    renderPlayers();
    renderscoreboard();
}

function savePlayers() {
    localStorage.setItem(storageKey, JSON.stringify(players));
    localStorage.setItem(allStorageKey, JSON.stringify(allPlayers));
}

function addPlayer() {
    const name = input.value.trim();
    if (name === "") {
        alert("Please enter a valid player name");
        return;
    }

    // Add to current match
    players.push({ name, goals: 0, assists: 0 });

    // Add to lifetime stats only if player doesn't exist yet
    let existingInAll = allPlayers.find(p => p.name === name);
    if (!existingInAll) {
        allPlayers.push({ name, totalGoals: 0, totalAssists: 0 });
    }

    renderPlayers();
    renderscoreboard();
    input.value = "";
    savePlayers();
}

function removePlayer(idx) {
    // Deletes from match roster ONLY (leaves allPlayers intact)
    players.splice(idx, 1);
    renderPlayers();
    savePlayers();
}

function clearPlayers() {
    if (confirm("Are you sure you want to clear all players and lifetime stats?")) {
        players = [];
        allPlayers = [];
        renderPlayers();
        renderscoreboard();
        savePlayers();
    }
}

const scoreboardDiv = document.getElementById("scoreboard");

function renderscoreboard() {
    scoreboardDiv.innerHTML = "";

    if (allPlayers.length === 0) return;

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="text-align: left; border-bottom: 2px solid #000141;">
            <th style="padding: 8px; text-align: left;">Name</th>
            <th style="padding: 8px; text-align: center;">Total Goals</th>
            <th style="padding: 8px; text-align: center;">Total Assists</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Render from allPlayers array
    allPlayers.forEach(player => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #0001414b";

        const nameTd = document.createElement("td");
        nameTd.style.padding = "8px";
        nameTd.style.width = "40%";
        nameTd.style.textAlign = "left";
        nameTd.textContent = player.name;

        const goalsTd = document.createElement("td");
        goalsTd.style.padding = "8px";
        goalsTd.style.textAlign = "center";
        goalsTd.textContent = player.totalGoals;

        const assistsTd = document.createElement("td");
        assistsTd.style.padding = "8px";
        assistsTd.style.textAlign = "center";
        assistsTd.textContent = player.totalAssists;

        tr.appendChild(nameTd);
        tr.appendChild(goalsTd);
        tr.appendChild(assistsTd);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    scoreboardDiv.appendChild(table);
}

function clearMatch() {
    if (confirm("Are you sure you want to clear match data?")) {
        players.forEach(player => {
            player.goals = 0;
            player.assists = 0;
        });
        renderPlayers();
        savePlayers();
    }
}

document.addEventListener("DOMContentLoaded", loadPlayers);

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addbutton").click();
    }
});