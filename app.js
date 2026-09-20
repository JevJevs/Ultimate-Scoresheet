let players = [];
let allPlayers = [];
let awayScore = 0;
let currentSortColumn = 'totalGoals'; // Default sort column
let sortAscending = false;            // Default descending (highest stats first)
let isInitialLoad = true; // Track initial page setup
let previousHomeScore = null;

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

    // Strictly update text without any animation triggers
    homeScoreEl.textContent = getHomeScore();
    awayScoreBtn.textContent = awayScore;
}

// Away score click handler
document.getElementById("awayScoreBtn").onclick = () => {
    awayScore++;
    renderScoreboardBar();
    triggerOpponentRedFlash(); // Triggers the red-to-white background transition
};

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

    // Trigger green pulse ONLY when a goal button is clicked
    if (stat === "goals" && amount > 0) {
        triggerScorePop("homeScore");
    }
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
        awayScore = 0;
        document.getElementById("opponentInput").value = "";
        
        previousHomeScore = null; // Reset tracker so clearing doesn't pulse
        renderPlayers();
        renderscoreboard();
        savePlayers();
        renderScoreboardBar();
    }
}

const scoreboardDiv = document.getElementById("scoreboard");

function renderscoreboard() {
    scoreboardDiv.innerHTML = "";

    if (allPlayers.length === 0) return;

    // 1. Sort the allPlayers array dynamically based on current selected column
    allPlayers.sort((a, b) => {
        const valA = a[currentSortColumn] || 0;
        const valB = b[currentSortColumn] || 0;
        return sortAscending ? valA - valB : valB - valA;
    });

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // Helper arrow indicator to show active sort direction
    const getArrow = (col) => {
        if (currentSortColumn !== col) return "";
        return sortAscending ? " ▲" : " ▼";
    };

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="text-align: left; border-bottom: 2px solid #000141; cursor: pointer;">
            <th style="padding: 8px; text-align: left;" id="sort-name">Name${getArrow('name')}</th>
            <th style="padding: 8px; text-align: center;" id="sort-goals">Goals${getArrow('totalGoals')}</th>
            <th style="padding: 8px; text-align: center;" id="sort-assists">Assists${getArrow('totalAssists')}</th>
            <th style="padding: 8px; text-align: center;" id="sort-blocks">Blocks${getArrow('totalBlocks')}</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Render sorted rows
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
        goalsTd.textContent = player.totalGoals || 0;

        const assistsTd = document.createElement("td");
        assistsTd.style.padding = "8px";
        assistsTd.style.textAlign = "center";
        assistsTd.textContent = player.totalAssists || 0;

        const blocksTd = document.createElement("td");
        blocksTd.style.padding = "8px";
        blocksTd.style.textAlign = "center";
        blocksTd.textContent = player.totalBlocks || 0;

        tr.appendChild(nameTd);
        tr.appendChild(goalsTd);
        tr.appendChild(assistsTd);
        tr.appendChild(blocksTd);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    scoreboardDiv.appendChild(table);

    // 2. Attach click events to headers AFTER adding table to DOM
    document.getElementById("sort-name").onclick = () => sortBy('name');
    document.getElementById("sort-goals").onclick = () => sortBy('totalGoals');
    document.getElementById("sort-assists").onclick = () => sortBy('totalAssists');
    document.getElementById("sort-blocks").onclick = () => sortBy('totalBlocks');
}

// Handler function to toggle sort direction or change column
function sortBy(columnKey) {
    if (currentSortColumn === columnKey) {
        // Toggle direction if clicking the same column
        sortAscending = !sortAscending;
    } else {
        // Switch column and default to descending (highest first) for numbers, ascending for names
        currentSortColumn = columnKey;
        sortAscending = (columnKey === 'name');
    }
    renderscoreboard();
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
        
        previousHomeScore = null; // Reset tracker so clearing doesn't pulse
        renderPlayers();
        savePlayers();
        renderScoreboardBar();
    }
}

document.addEventListener("DOMContentLoaded", loadPlayers);

document.getElementById("awayScoreBtn").onclick = function() {
    awayScore++;
    
    // First update the text score
    renderScoreboardBar(); 
    
    // Then trigger the pulse on top of the new text
    triggerAwayRedPulse(); 
};

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("addbutton").click();
    }
});

function triggerScorePop(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.classList.remove("pop-animation");
    void el.offsetWidth; // Force DOM repaint
    requestAnimationFrame(() => {
        el.classList.add("pop-animation");
    });
}

function triggerAwayRedPulse() {
    const btn = document.getElementById("awayScoreBtn");
    if (!btn) return;

    // 1. Remove class first
    btn.classList.remove("flash-red");

    // 2. Force browser repaint so it registers the reset
    void btn.offsetWidth;

    // 3. Add class in the next frame AFTER text update completes
    requestAnimationFrame(() => {
        btn.classList.add("flash-red");
    });
}