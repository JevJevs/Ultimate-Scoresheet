let players = [];
let allPlayers = [];
let awayScore = 0;

const playersDiv = document.getElementById("players");
const input = document.getElementById("playerInput");
const storageKey = "myPlayers";
const allStorageKey = "myAllPlayers";

function getHomeScore() {
    return players.reduce((sum, p) => sum + p.goals, 0);
}

function renderScoreboardBar() {
    const homeScoreEl = document.getElementById("homeScore");
    const awayScoreBtn = document.getElementById("awayScoreBtn");

    homeScoreEl.textContent = getHomeScore();
    awayScoreBtn.textContent = awayScore;
}

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
            <th style="padding: 8px; text-align: center;">G</th>
            <th style="padding: 8px; text-align: center;">A</th>
            <th style="padding: 8px; text-align: center;">B</th>
            <th style="padding: 8px; text-align: center;"> </th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    players.forEach((player, idx) => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #0001414b";

       // Name Cell
        const nameTd = document.createElement("td");
        nameTd.classList.add("name-cell");
        nameTd.textContent = player.name;

        // Goals Cell
        const goalsTd = document.createElement("td");
        goalsTd.classList.add("stat-cell");
        const goalBtn = document.createElement("button");
        goalBtn.textContent = player.goals;
        goalBtn.classList.add("stat-button", "goal-button");
        goalBtn.onclick = () => updateStat(idx, "goals", 1);
        goalsTd.appendChild(goalBtn);

        // Assists Cell
        const assistsTd = document.createElement("td");
        assistsTd.classList.add("stat-cell");
        const assistBtn = document.createElement("button");
        assistBtn.textContent = player.assists;
        assistBtn.classList.add("stat-button", "assist-button");
        assistBtn.onclick = () => updateStat(idx, "assists", 1);
        assistsTd.appendChild(assistBtn);

        // Blocks Cell
        const blocksTd = document.createElement("td");
        blocksTd.classList.add("stat-cell");
        const blocksBtn = document.createElement("button");
        blocksBtn.textContent = player.blocks;
        blocksBtn.classList.add("stat-button", "block-button");
        blocksBtn.onclick = () => updateStat(idx, "blocks", 1);
        blocksTd.appendChild(blocksBtn);

        // Delete Cell
        const deleteTd = document.createElement("td");
        deleteTd.classList.add("stat-cell");
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "x";
        removeBtn.classList.add("delete-button");
        removeBtn.onclick = () => removePlayer(idx);
        deleteTd.appendChild(removeBtn);


        // Assemble Row
        tr.appendChild(nameTd);
        tr.appendChild(goalsTd);
        tr.appendChild(assistsTd);
        tr.appendChild(blocksTd);
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
        if (stat === "blocks") targetInAll.totalBlocks = (targetInAll.totalBlocks || 0) + amount;
    }

    renderPlayers();
    renderscoreboard();
    renderScoreboardBar();
    savePlayers();
}

function loadPlayers() {
    const savedPlayers = localStorage.getItem(storageKey);
    const savedAllPlayers = localStorage.getItem(allStorageKey);

    if (savedPlayers) players = JSON.parse(savedPlayers);
    if (savedAllPlayers) allPlayers = JSON.parse(savedAllPlayers);

    renderPlayers();
    renderscoreboard();
    renderScoreboardBar();
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
    players.push({ name, goals: 0, assists: 0, blocks: 0 });

    // Add to lifetime stats only if player doesn't exist yet
    let existingInAll = allPlayers.find(p => p.name === name);
    if (!existingInAll) {
        allPlayers.push({ name, totalGoals: 0, totalAssists: 0, totalBlocks: 0 });
    }

    renderPlayers();
    renderscoreboard();
    renderScoreboardBar();
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
            <th style="padding: 8px; text-align: center;">Total Blocks</th>
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

        const blocksTd = document.createElement("td");
        blocksTd.style.padding = "8px";
        blocksTd.style.textAlign = "center";
        blocksTd.textContent = player.totalBlocks;

        tr.appendChild(nameTd);
        tr.appendChild(goalsTd);
        tr.appendChild(assistsTd);
        tr.appendChild(blocksTd);
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
            player.blocks = 0;
        });
        awayScore = 0;
        document.getElementById("opponentInput").value = "";
        renderPlayers();
        savePlayers();
        renderScoreboardBar();
    }
}

document.addEventListener("DOMContentLoaded", loadPlayers);

document.getElementById("awayScoreBtn").onclick = () => {
    awayScore++;
    renderScoreboardBar();
};

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addbutton").click();
    }
});