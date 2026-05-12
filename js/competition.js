let competitionPitbullInterval = null;
let pitbullAtlasData = null;
let pitbullFrames = [];
let pitbullAnimationInterval = null;

async function loadPitbullAtlas() {
  try {
    const response = await fetch("competition/pitbull.json");
    const text = await response.text();

    pitbullAtlasData = JSON.parse(text);
    pitbullFrames = Object.values(pitbullAtlasData.frames);

    console.log("Pitbull atlas loaded");
  } catch (e) {
    console.log("Pitbull atlas error:", e);
  }
}

function startPitbullAnimation() {
  const pitbull = document.getElementById("competition-pitbull");
  if (!pitbull || !pitbullAtlasData) return;

  const frames = Object.values(pitbullAtlasData.frames);
  if (!frames.length) return;

  if (pitbullAnimationInterval) {
    clearInterval(pitbullAnimationInterval);
  }

  let frameIndex = 0;

  function drawFrame() {
    const frame = frames[frameIndex].frame;

    pitbull.style.backgroundImage = "url('competition/pitbulls.png')";
    pitbull.style.backgroundPosition = `-${frame.x}px -${frame.y}px`;
    pitbull.style.backgroundSize = `${pitbullAtlasData.meta.size.w}px ${pitbullAtlasData.meta.size.h}px`;

    pitbull.style.width = `${frame.w}px`;
    pitbull.style.height = `${frame.h}px`;

    frameIndex = (frameIndex + 1) % frames.length;
  }

  drawFrame();
  pitbullAnimationInterval = setInterval(drawFrame, 375);

  console.log("pitbull frame", frameIndex);
}

function getCompetitionPlayerScore() {
  const raw = sClick + sFriend + sFooty;
  return Math.max(0, raw - (sCompetitionDrain || 0));
}

function isPitbullCompetitionMatch() {
  return (
    currentMode === "competition" && data.competition.selected === "netherlands"
  );
}

function updatePitbullVisibility() {
  const pitbull = document.getElementById("competition-pitbull");
  if (!pitbull) return;

  const isNetherlands =
    currentMode === "competition" &&
    data.competition.selected === "netherlands";

  if (!isNetherlands) {
    pitbull.style.display = "none";

    if (pitbullAnimationInterval) {
      clearInterval(pitbullAnimationInterval);
      pitbullAnimationInterval = null;
    }

    return;
  }

  pitbull.style.display = "block";

  if (!pitbullAtlasData) {
    setTimeout(updatePitbullVisibility, 100);
    return;
  }

  startPitbullAnimation();
}

const competitionOpponents = [
  {
    id: "england",
    name: "England",
    bg: "competition/England.png",
    opponentImage: "competition/opponent_eng.png",

    stats: {
      speed: 0.2,
      power: 50,
      critChance: 0.1,
      critMult: 5,
    },

    ability: {
      id: "energyRush",
      name: "Energy Rush",
      chance: 0.03,
      speedMultiplier: 2,
      duration: 1000,
    },

    mechanics: {
      specialBalls: ["fire"],
    },
  },
  {
    id: "netherlands",
    name: "Netherlands",
    bg: "competition/Netherlands.png",
    opponentImage: "competition/opponent_ned.png",
    stats: {
      speed: 1.0,
      power: 2,
      critChance: 0.08,
      critMult: 2,
    },
    mechanics: {
      specialBalls: ["gold"],
    },
  },
  {
    id: "brazil",
    name: "Brazil",
    bg: "competition/Brazil.png",
    opponentImage: "competition/opponent_bra.png",
    stats: {
      speed: 1.2,
      power: 2,
      critChance: 0.12,
      critMult: 3,
    },
    mechanics: {
      specialBalls: ["fire", "gold", "crystal"],
    },
  },
];

function getSelectedCompetitionOpponent() {
  return (
    competitionOpponents.find(
      (o) => o.id === competitionState.selectedOpponentId,
    ) || competitionOpponents[0]
  );
}

function openCompetitionMenu() {
  const overlay = document.getElementById("competition-menu-overlay");
  if (!overlay) return;

  const selected = data.competition.selected || "england";

  overlay.innerHTML = `
    <div class="competition-menu-screen">
      <div class="competition-menu-title">
        ⚔️ COMPETITION MODE ⚔️
      </div>

      <div class="competition-menu-subtitle">
        Выбери соперника
      </div>

      <div class="competition-opponents-list">
        <div
          class="competition-opponent-preview ${selected === "england" ? "selected" : ""}"
          onclick="selectCompetitionOpponent('england', event)"
        >
          <img src="competition/England.png" />
          <div class="competition-opponent-name">
  <img class="competition-menu-flag" src="flags/eng.png" alt="England" />
  ENGLAND
</div>
          <div class="competition-opponent-desc">Jimmy • 84 OVR</div>
        </div>

        <div
          class="competition-opponent-preview ${data.competition.unlocked.netherlands ? "" : "locked"} ${selected === "netherlands" ? "selected" : ""}"
          onclick="selectCompetitionOpponent('netherlands', event)"
        >
          <img src="competition/Netherlands.png" />
          <div class="competition-opponent-name">
  <img class="competition-menu-flag" src="flags/nl.png" alt="Netherlands" />
  NETHERLANDS
</div>
          <div class="competition-opponent-desc">
          ${data.competition.unlocked.netherlands ? "Pitbull • 86 OVR" : "LOCKED"}
          </div>
        </div>

        <div
          class="competition-opponent-preview ${data.competition.unlocked.brazil ? "" : "locked"} ${selected === "brazil" ? "selected" : ""}"
          onclick="selectCompetitionOpponent('brazil', event)"
        >
          <img src="competition/Brazil.png" />
          <div class="competition-opponent-name">
  <img class="competition-menu-flag" src="flags/br.png" alt="Brazil" />
  BRAZIL
</div>
          <div class="competition-opponent-desc">
            ${data.competition.unlocked.brazil ? "Ronny • 95 OVR" : "LOCKED"}
          </div>
        </div>
      </div>

      <button type="button" class="menu-btn" onclick="startSelectedCompetition(event)">
        НАЧАТЬ
      </button>

      <button type="button" class="menu-btn" onclick="closeCompetitionMenu(event)">
        НАЗАД
      </button>
    </div>
  `;

  overlay.style.display = "flex";
}

function selectCompetitionOpponent(key, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!data.competition.unlocked[key]) return;

  data.competition.selected = key;

  document.querySelectorAll(".competition-opponent-preview").forEach((card) => {
    card.classList.remove("selected");
  });

  if (event?.currentTarget) {
    event.currentTarget.classList.add("selected");
  }
}

function closeCompetitionMenu(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const overlay = document.getElementById("competition-menu-overlay");
  if (!overlay) return;

  overlay.style.display = "none";
}

function startSelectedCompetition(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const selectedKey = data.competition.selected || "england";

  if (!data.competition.unlocked[selectedKey]) return;

  const levelIndex = competitionLevels.findIndex(
    (lvl) => lvl.key === selectedKey,
  );

  data.competition.currentLevel = levelIndex >= 0 ? levelIndex : 0;

  if (typeof competitionState !== "undefined") {
    competitionState.selectedOpponentId = selectedKey;
  }

  closeCompetitionMenu();
  startGame("competition");
}

function startCompetitionEnemy() {
  stopCompetitionEnemy();

  if (currentMode !== "competition") return;

  const enemy =
    competitionLevels.find((lvl) => lvl.key === data.competition.selected) ||
    competitionLevels[0];

  if (!enemy) return;

  competitionState.enemyScore = 0;
  competitionState.enemyRushActive = false;

  function enemyHit() {
    let gain = enemy.stats.power;
    const isCrit = Math.random() < enemy.stats.critChance;

    if (isCrit) {
      gain *= enemy.stats.critMult;
    }

    competitionState.enemyScore += gain;

    const opponentEl = document.getElementById("competition-opponent");
    if (opponentEl) {
      const rect = opponentEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + 20;

      spawnFloatingText("+" + Math.floor(gain), x, y, isCrit ? "crit" : "xp");
    }

    tryTriggerEnemyAbility(enemy);

    updateCompetitionHud();
  }

  competitionState.enemyInterval = setInterval(
    enemyHit,
    enemy.stats.speed * 1000,
  );
  if (enemy.special?.name === "Pitbull Bite") {
    startPitbullAttack(enemy);
  }
}

function startPitbullAttack(enemy) {
  if (competitionPitbullInterval) {
    clearInterval(competitionPitbullInterval);
  }

  competitionPitbullInterval = setInterval(() => {
    if (currentMode !== "competition") return;

    let damage = enemy.special.bitePower;
    const isCrit = Math.random() < enemy.special.biteCritChance;

    if (isCrit) {
      damage *= enemy.special.biteCritMult;
    }

    sCompetitionDrain += damage;

    const pitbullEl = document.getElementById("competition-pitbull");

    if (pitbullEl) {
      const rect = pitbullEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + 10;

      spawnFloatingText(
        isCrit ? "PITBULL -" + damage : "-" + damage,
        x,
        y,
        "drain",
      );
    }

    updateCompetitionHud();
  }, enemy.special.biteSpeed * 1000);
}

function stopPitbullAttack() {
  if (competitionPitbullInterval) {
    clearInterval(competitionPitbullInterval);
    competitionPitbullInterval = null;
  }
}

function tryTriggerEnemyAbility(enemy) {
  const ability = enemy.ability;
  if (!ability) return;

  if (ability.id !== "energyRush") return;
  if (competitionState.enemyRushActive) return;

  if (Math.random() >= ability.chance) return;

  competitionState.enemyRushActive = true;

  const opponentEl = document.getElementById("competition-opponent");

  if (opponentEl) {
    const rect = opponentEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;

    spawnFloatingText(ability.name + "!", x, y, "ultraSmall");
  }

  clearInterval(competitionState.enemyInterval);

  const rushSpeed = enemy.stats.speed / ability.speedMultiplier;

  competitionState.enemyInterval = setInterval(() => {
    let gain = enemy.stats.power;
    const isCrit = Math.random() < enemy.stats.critChance;

    if (isCrit) {
      gain *= enemy.stats.critMult;
    }

    competitionState.enemyScore += gain;

    const opponentEl = document.getElementById("competition-opponent");
    if (opponentEl) {
      const rect = opponentEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + 20;

      spawnFloatingText("+" + Math.floor(gain), x, y, isCrit ? "crit" : "xp");
    }

    updateCompetitionHud();
  }, rushSpeed * 1000);

  setTimeout(() => {
    if (currentMode !== "competition") return;

    competitionState.enemyRushActive = false;

    clearInterval(competitionState.enemyInterval);

    competitionState.enemyInterval = setInterval(() => {
      let gain = enemy.stats.power;
      const isCrit = Math.random() < enemy.stats.critChance;

      if (isCrit) {
        gain *= enemy.stats.critMult;
      }

      competitionState.enemyScore += gain;

      const opponentEl = document.getElementById("competition-opponent");
      if (opponentEl) {
        const rect = opponentEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + 20;

        spawnFloatingText("+" + Math.floor(gain), x, y, isCrit ? "crit" : "xp");
      }

      updateCompetitionHud();
    }, enemy.stats.speed * 1000);
  }, ability.duration);
}

function stopCompetitionEnemy() {
  if (competitionState.enemyInterval) {
    clearInterval(competitionState.enemyInterval);
    competitionState.enemyInterval = null;
  }
  stopPitbullAttack();
}
document.addEventListener("DOMContentLoaded", () => {
  loadPitbullAtlas();
});
