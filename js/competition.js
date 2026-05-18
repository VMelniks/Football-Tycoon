let enemyAbilityTimeout = null;
let germanyBerserkTimeout = null;
let germanyBerserkCooldownTimeout = null;
let icePrisonActive = false;
let icePrisonClicks = 0;
let icePrisonClicksNeeded = 10;
let icePrisonInterval = null;
let icePrisonTimeout = null;
let competitionPitbullInterval = null;
let pitbullAtlasData = null;
let pitbullFrames = [];
let pitbullAnimationInterval = null;
let germanyBerserkCooldown = false;

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

function getSelectedCompetitionOpponent() {
  return (
    competitionLevels.find(
      (lvl) => lvl.key === competitionState.selectedOpponentId,
    ) || competitionLevels[0]
  );
}
function openCompetitionMenu() {
  const overlay = document.getElementById("competition-menu-overlay");
  if (!overlay) return;

  const selectedKey = data.competition.selected || "spain";
  const selectedIndex = getCompetitionIndexByKey(selectedKey);

  const visibleOpponents = [
    {
      lvl: getLoopedCompetitionLevel(selectedIndex - 1),
      pos: "left",
    },
    {
      lvl: getLoopedCompetitionLevel(selectedIndex),
      pos: "center",
    },
    {
      lvl: getLoopedCompetitionLevel(selectedIndex + 1),
      pos: "right",
    },
  ];

  const cardsHTML = visibleOpponents
    .map(({ lvl, pos }) => {
      const isUnlocked = data.competition.unlocked[lvl.key];
      const isSelected = pos === "center";

      return `
        <div
          class="competition-opponent-preview carousel-${pos} ${isSelected ? "selected" : ""} ${isUnlocked ? "" : "locked"}"
          onclick="selectCompetitionOpponent('${lvl.key}', event)"
        >
          <img src="${lvl.bg}" />

          <div class="competition-opponent-name">
            <img class="competition-menu-flag" src="${lvl.flag}" alt="${lvl.country}" />
            ${lvl.country.toUpperCase()}
          </div>

          <div class="competition-opponent-desc">
            ${isUnlocked ? `${lvl.name} • ${lvl.ovr} OVR` : "LOCKED"}
          </div>
        </div>
      `;
    })
    .join("");

  overlay.innerHTML = `
    <div class="competition-menu-screen">
      <div class="competition-menu-title">
        ⚔️ COMPETITION MODE ⚔️
      </div>

      <div class="competition-menu-subtitle">
        Выбери соперника
      </div>

      <div class="competition-carousel-wrap">
        <button
          type="button"
          class="competition-carousel-arrow competition-carousel-arrow-left"
          onclick="changeCompetitionCarousel(-1, event)"
        >
          ‹
        </button>

        <div class="competition-opponents-list">
          ${cardsHTML}
        </div>

        <button
          type="button"
          class="competition-carousel-arrow competition-carousel-arrow-right"
          onclick="changeCompetitionCarousel(1, event)"
        >
          ›
        </button>
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

  data.competition.selected = key;

  openCompetitionMenu();
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

  const selectedKey = data.competition.selected || "spain";

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
  competitionState.enemyBerserkActive = false;
  germanyBerserkCooldown = false;

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
    tryTriggerGermanyBerserk(enemy);

    updateCompetitionHud();
  }

  competitionState.enemyInterval = setInterval(
    enemyHit,
    enemy.stats.speed * 1000,
  );
  if (enemy.special?.name === "Pitbull Bite") {
    startPitbullAttack(enemy);
  }
  if (enemy.special?.name === "Ice Prison") {
    startIcePrisonCheck(enemy);
  }
}

function getCompetitionIndexByKey(key) {
  const index = competitionLevels.findIndex((lvl) => lvl.key === key);
  return index >= 0 ? index : 0;
}

function getLoopedCompetitionLevel(index) {
  const total = competitionLevels.length;
  return competitionLevels[(index + total) % total];
}

function changeCompetitionCarousel(step, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const currentKey = data.competition.selected || "spain";
  const currentIndex = getCompetitionIndexByKey(currentKey);
  const next = getLoopedCompetitionLevel(currentIndex + step);

  data.competition.selected = next.key;

  openCompetitionMenu();
}

function startIcePrisonCheck(enemy) {
  stopIcePrisonCheck();

  if (!enemy?.special) return;
  if (enemy.special.name !== "Ice Prison") return;

  const checkInterval = enemy.special.checkInterval || 1000;

  icePrisonInterval = setInterval(() => {
    if (currentMode !== "competition") return;
    if (data.competition.selected !== "norway") return;
    if (icePrisonActive) return;

    if (Math.random() >= enemy.special.chance) return;

    activateIcePrison(enemy);
  }, checkInterval);
}

function stopIcePrisonCheck() {
  if (icePrisonInterval) {
    clearInterval(icePrisonInterval);
    icePrisonInterval = null;
  }

  if (icePrisonTimeout) {
    clearTimeout(icePrisonTimeout);
    icePrisonTimeout = null;
  }

  icePrisonActive = false;
  icePrisonClicks = 0;

  const ice = document.getElementById("ice-prison-overlay");
  if (ice) {
    ice.style.display = "none";
  }
}

function activateIcePrison(enemy) {
  icePrisonActive = true;
  icePrisonClicks = 0;
  icePrisonClicksNeeded = enemy.special.clicksNeeded || 10;

  const ice = document.getElementById("ice-prison-overlay");

  if (ice) {
    ice.style.display = "block";
    ice.onclick = hitIcePrison;
  }

  spawnFloatingText(
    "ICE<br>PRISON!",
    window.innerWidth * 0.28,
    window.innerHeight * 0.42,
    "ultraSmall",
  );
}

function hitIcePrison(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!icePrisonActive) return;

  icePrisonClicks++;

  const ice = document.getElementById("ice-prison-overlay");

  if (ice) {
    ice.style.transform = "scale(0.96)";

    setTimeout(() => {
      ice.style.transform = "";
    }, 80);
  }

  spawnFloatingText(
    "-" + icePrisonClicks + "/" + icePrisonClicksNeeded,
    event?.clientX || window.innerWidth * 0.3,
    event?.clientY || window.innerHeight * 0.5,
    "freeze",
  );

  if (icePrisonClicks >= icePrisonClicksNeeded) {
    breakIcePrison();
  }
}

function breakIcePrison() {
  icePrisonActive = false;
  icePrisonClicks = 0;

  const ice = document.getElementById("ice-prison-overlay");

  if (ice) {
    ice.style.display = "none";
  }

  spawnFloatingText(
    "ICE BROKEN!",
    window.innerWidth * 0.28,
    window.innerHeight * 0.42,
    "freeze",
  );
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

function trySpanishCounterAttack(points, event) {
  if (currentMode !== "competition") return false;
  if (data.competition.selected !== "spain") return false;

  const enemy = competitionLevels.find((lvl) => lvl.key === "spain") || null;

  if (!enemy?.special) return false;

  if (Math.random() >= enemy.special.chance) return false;

  const counterPower = points * 2;

  competitionState.enemyScore += counterPower;

  spawnFloatingText(
    "COUNTER +" + Math.floor(counterPower),
    event.clientX,
    event.clientY - 40,
    "drain",
  );

  updateCompetitionHud();

  return true;
}

function tryItalianBlock(points, event) {
  if (currentMode !== "competition") return false;
  if (data.competition.selected !== "italy") return false;

  const enemy = competitionLevels.find((lvl) => lvl.key === "italy") || null;

  if (!enemy?.special) return false;

  if (Math.random() >= enemy.special.chance) return false;

  spawnFloatingText("BLOCK!", event.clientX, event.clientY - 40, "freeze");

  return true;
}

function tryTriggerEnemyAbility(enemy) {
  const ability = enemy.special;
  if (!ability) return;

  if (ability.name !== "Energy Rush") return;
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

  enemyAbilityTimeout = setTimeout(() => {
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

      tryTriggerEnemyAbility(enemy);

      updateCompetitionHud();
    }, enemy.stats.speed * 1000);
  }, ability.duration);
}

function tryTriggerGermanyBerserk(enemy) {
  const ability = enemy.special;
  if (!ability) return;
  if (ability.name !== "Deutsche Maschine") return;
  if (competitionState.enemyBerserkActive) return;
  if (germanyBerserkCooldown) return;

  const playerScore = Math.floor(getCompetitionPlayerScore());
  const enemyScore = Math.floor(competitionState.enemyScore || 0);

  if (playerScore - enemyScore < ability.triggerBehind) return;
  if (Math.random() >= ability.chance) return;

  competitionState.enemyBerserkActive = true;
  germanyBerserkCooldown = true;

  const opponentEl = document.getElementById("competition-opponent");

  if (opponentEl) {
    const rect = opponentEl.getBoundingClientRect();

    spawnFloatingText(
      "DEUTSCHE<br>MASCHINE!",
      rect.left + rect.width / 2,
      rect.top - 10,
      "ultraSmall",
    );
  }

  clearInterval(competitionState.enemyInterval);

  const berserkSpeed = enemy.stats.speed / ability.speedMultiplier;

  competitionState.enemyInterval = setInterval(() => {
    let gain = enemy.stats.power * ability.powerMultiplier;
    const isCrit = Math.random() < enemy.stats.critChance;

    if (isCrit) {
      gain *= enemy.stats.critMult;
    }

    competitionState.enemyScore += gain;

    const opponentEl = document.getElementById("competition-opponent");
    if (opponentEl) {
      const rect = opponentEl.getBoundingClientRect();

      spawnFloatingText(
        "+" + Math.floor(gain),
        rect.left + rect.width / 2,
        rect.top + 20,
        isCrit ? "crit" : "xp",
      );
    }

    updateCompetitionHud();
  }, berserkSpeed * 1000);

  germanyBerserkTimeout = setTimeout(() => {
    if (currentMode !== "competition") return;

    competitionState.enemyBerserkActive = false;

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

        spawnFloatingText(
          "+" + Math.floor(gain),
          rect.left + rect.width / 2,
          rect.top + 20,
          isCrit ? "crit" : "xp",
        );
      }

      tryTriggerEnemyAbility(enemy);
      tryTriggerGermanyBerserk(enemy);

      updateCompetitionHud();
    }, enemy.stats.speed * 1000);
  }, ability.duration);

  germanyBerserkCooldownTimeout = setTimeout(() => {
    germanyBerserkCooldown = false;
  }, ability.cooldown);
}

function stopCompetitionEnemy() {
  if (competitionState.enemyInterval) {
    clearInterval(competitionState.enemyInterval);
    competitionState.enemyInterval = null;
  }

  competitionState.enemyRushActive = false;
  competitionState.enemyBerserkActive = false;

  if (typeof germanyBerserkCooldown !== "undefined") {
    germanyBerserkCooldown = false;
  }
  clearTimeout(enemyAbilityTimeout);
  clearTimeout(germanyBerserkTimeout);
  clearTimeout(germanyBerserkCooldownTimeout);

  enemyAbilityTimeout = null;
  germanyBerserkTimeout = null;
  germanyBerserkCooldownTimeout = null;
  stopPitbullAttack();
  stopIcePrisonCheck();
}
