let cameroonClawActive = false;
let cameroonClawCooldown = false;
let cameroonClawInterval = null;
let cameroonClawCooldownTimeout = null;
let cameroonRoarActive = false;
let cameroonRoarCooldown = false;
let cameroonRoarTimeout = null;
let cameroonRoarCooldownTimeout = null;
let enemyAbilityTimeout = null;
let germanyBerserkTimeout = null;
let germanyBerserkCooldownTimeout = null;
let icePrisonActive = false;
let icePrisonClicks = 0;
let icePrisonClicksNeeded = 10;
let icePrisonInterval = null;
let icePrisonTimeout = null;
let carnivalCooldown = false;
let carnivalCooldownTimeout = null;
let carnivalBalls = [];
let carnivalActive = false;
let carnivalInterval = null;
let carnivalTimeout = null;
let competitionPitbullInterval = null;
let pitbullAtlasData = null;
let pitbullFrames = [];
let pitbullAnimationInterval = null;
let germanyBerserkCooldown = false;
let franceScoreHistory = [];
let franceHistoryInterval = null;

let marseilleTurnActive = false;
let marseilleTurnCooldown = false;

let marseilleTurnVisualTimeout = null;
let marseilleTurnCooldownTimeout = null;

async function loadPitbullAtlas() {
  try {
    const response = await fetch("competition/pitbull.json");
    const text = await response.text();

    pitbullAtlasData = JSON.parse(text);
    pitbullFrames = Object.values(pitbullAtlasData.frames);

    console.log("Pitbull atlas loaded:", pitbullFrames.length, "frames");
  } catch (e) {
    console.log("Pitbull atlas error:", e);
  }
}

function startPitbullAnimation() {
  const pitbull = document.getElementById("competition-pitbull");
  if (!pitbull || !pitbullAtlasData) return;

  const frames = pitbullFrames;
  if (!frames.length) return;

  if (pitbullAnimationInterval) {
    clearInterval(pitbullAnimationInterval);
    pitbullAnimationInterval = null;
  }

  let frameIndex = 0;

  function drawFrame() {
    const frameData = frames[frameIndex];
    if (!frameData || !frameData.frame) return;

    const frame = frameData.frame;

    pitbull.style.backgroundImage = "url('competition/pitbulls.png')";
    pitbull.style.backgroundPosition = `-${frame.x}px -${frame.y}px`;
    pitbull.style.backgroundSize = `${pitbullAtlasData.meta.size.w}px ${pitbullAtlasData.meta.size.h}px`;

    pitbull.style.width = `${frame.w}px`;
    pitbull.style.height = `${frame.h}px`;

    frameIndex = (frameIndex + 1) % frames.length;
  }

  drawFrame();

  pitbullAnimationInterval = setInterval(drawFrame, 375);
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
    tryTriggerBrazilCarnival(enemy);
    tryTriggerCameroonClaw(enemy);
    tryTriggerCameroonRoar(enemy);
    tryTriggerFranceMarseilleTurn(enemy);

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
  if (enemy.special?.name === "Marseille Turn") {
    startFranceScoreHistory();
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

  playSound(sounds.icePrison, 0.25, false);

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

  playSound(sounds.iceHit, 0.25, true);

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

  playSound(sounds.iceBreak, 0.3, false);

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

function tryTriggerCameroonClaw(enemy) {
  const ability = enemy.special;

  if (!ability) return;
  if (data.competition.selected !== "cameroon") return;
  if (ability.name !== "Cameroon Lion") return;

  if (cameroonClawActive) return;
  if (cameroonClawCooldown) return;
  if (cameroonRoarActive) return;
  if (cameroonRoarCooldown) return;

  if (Math.random() >= (ability.clawChance || 0.05)) return;

  activateCameroonClaw(ability);
}

function activateCameroonClaw(ability) {
  cameroonClawActive = true;
  cameroonClawCooldown = true;

  showCameroonClawVisual();

  const damages = ability.clawDamageSteps || [
    20, 40, 60, 80, 100, 120, 140, 160, 180, 200,
  ];

  let index = 0;

  cameroonClawInterval = setInterval(() => {
    if (currentMode !== "competition") {
      stopCameroonClaw();
      return;
    }

    if (data.competition.selected !== "cameroon") {
      stopCameroonClaw();
      return;
    }

    const damage = damages[index] || 0;

    if (damage > 0) {
      sCompetitionDrain += damage;

      const playerEl = document.querySelector("#game-screen .player-container");

      if (playerEl) {
        const rect = playerEl.getBoundingClientRect();

        spawnFloatingText(
          "-" + damage,
          rect.left + rect.width / 2,
          rect.top - 35,
          "drain",
        );
      } else {
        spawnFloatingText(
          "-" + damage,
          window.innerWidth * 0.5,
          window.innerHeight * 0.46,
          "drain",
        );
      }

      updateCompetitionHud();
    }

    index++;

    if (index >= damages.length) {
      stopCameroonClaw();
    }
  }, ability.clawTickInterval || 200);

  cameroonClawCooldownTimeout = setTimeout(() => {
    cameroonClawCooldown = false;
    cameroonClawCooldownTimeout = null;
  }, 3500);
}

function showCameroonClawVisual() {
  playSound(sounds.claw, 0.3, false);

  const field = document.getElementById("game-screen");
  if (!field) return;

  field.classList.add("cameroon-claw-shake");

  const flash = document.createElement("div");
  flash.className = "cameroon-red-flash";
  field.appendChild(flash);

  const claw = document.createElement("img");
  claw.className = "cameroon-claw-effect";
  claw.src = "competition/claw.png";
  claw.draggable = false;
  field.appendChild(claw);

  spawnFloatingText(
    "LION<br>CLAW!",
    window.innerWidth * 0.5,
    window.innerHeight * 0.32,
    "ultraSmall",
  );

  setTimeout(() => {
    field.classList.remove("cameroon-claw-shake");
  }, 450);

  setTimeout(() => {
    flash.remove();
    claw.remove();
  }, 900);
}

function stopCameroonClaw() {
  cameroonClawActive = false;

  if (cameroonClawInterval) {
    clearInterval(cameroonClawInterval);
    cameroonClawInterval = null;
  }
}

function tryTriggerCameroonRoar(enemy) {
  const ability = enemy.special;

  if (!ability) return;
  if (data.competition.selected !== "cameroon") return;
  if (ability.name !== "Cameroon Lion") return;

  if (cameroonRoarActive) return;
  if (cameroonRoarCooldown) return;

  // Не включаем рык, если сейчас работают когти
  if (cameroonClawActive) return;
  if (cameroonClawCooldown) return;

  if (Math.random() >= (ability.roarChance || 0.03)) return;

  activateCameroonRoar(ability);
}

function activateCameroonRoar(ability) {
  cameroonRoarActive = true;
  cameroonRoarCooldown = true;

  showCameroonRoarVisual();

  clearTimeout(cameroonRoarTimeout);

  cameroonRoarTimeout = setTimeout(() => {
    stopCameroonRoar();
  }, ability.roarDuration || 3000);

  clearTimeout(cameroonRoarCooldownTimeout);

  cameroonRoarCooldownTimeout = setTimeout(() => {
    cameroonRoarCooldown = false;
    cameroonRoarCooldownTimeout = null;
  }, 4000);
}

function stopCameroonRoar() {
  cameroonRoarActive = false;

  clearTimeout(cameroonRoarTimeout);
  cameroonRoarTimeout = null;

  const field = document.getElementById("game-screen");
  if (field) {
    field.classList.remove("cameroon-roar-shake");
    field.classList.remove("cameroon-roar-active");
  }

  document
    .querySelectorAll(".cameroon-roar-flash")
    .forEach((el) => el.remove());
}

function isCameroonRoarActive() {
  return (
    currentMode === "competition" &&
    data.competition.selected === "cameroon" &&
    cameroonRoarActive
  );
}

function getCameroonRoarMissChance() {
  if (!isCameroonRoarActive()) return 0;

  const enemy =
    competitionLevels.find((lvl) => lvl.key === data.competition.selected) ||
    null;

  return enemy?.special?.roarMissChance || 25;
}

function showCameroonRoarVisual() {
  playSound(sounds.roar, 0.35, false);

  const field = document.getElementById("game-screen");
  if (!field) return;

  field.classList.add("cameroon-roar-shake");
  field.classList.add("cameroon-roar-active");

  const flash = document.createElement("div");
  flash.className = "cameroon-roar-flash";
  field.appendChild(flash);

  spawnFloatingText(
    "ROAR!",
    window.innerWidth * 0.5,
    window.innerHeight * 0.32,
    "ultraSmall",
  );

  setTimeout(() => {
    field.classList.remove("cameroon-roar-shake");
  }, 600);

  setTimeout(() => {
    flash.remove();
  }, 900);
}

function startFranceScoreHistory() {
  stopFranceScoreHistory();

  franceScoreHistory = [];

  const recordScore = () => {
    if (
      currentMode !== "competition" ||
      data.competition.selected !== "france"
    ) {
      return;
    }

    const now = Date.now();

    franceScoreHistory.push({
      time: now,
      player: getCompetitionPlayerScore(),
      enemy: competitionState.enemyScore || 0,
    });

    // Нам нужны только последние ~3 секунды
    franceScoreHistory = franceScoreHistory.filter(
      (sample) => now - sample.time <= 3000,
    );
  };

  // Первый замер сразу
  recordScore();

  franceHistoryInterval = setInterval(recordScore, 100);
}

function stopFranceScoreHistory() {
  if (franceHistoryInterval) {
    clearInterval(franceHistoryInterval);
    franceHistoryInterval = null;
  }

  franceScoreHistory = [];
}

function tryTriggerFranceMarseilleTurn(enemy) {
  const ability = enemy.special;

  if (!ability) return;
  if (enemy.key !== "france") return;
  if (ability.name !== "Marseille Turn") return;

  if (marseilleTurnActive) return;
  if (marseilleTurnCooldown) return;

  const playerScore = getCompetitionPlayerScore();
  const enemyScore = competitionState.enemyScore || 0;

  // Франция использует финт только когда проигрывает
  if (playerScore <= enemyScore) return;

  if (Math.random() >= ability.chance) return;

  const now = Date.now();
  const windowMs = ability.window || 2000;

  // Ищем самый старый замер внутри нужного окна
  const oldSample = franceScoreHistory.find(
    (sample) => now - sample.time <= windowMs,
  );

  if (!oldSample) return;

  const playerGain = Math.max(0, playerScore - oldSample.player);
  const enemyGain = Math.max(0, enemyScore - oldSample.enemy);

  // Если за это время игрок заработал не больше Франции,
  // рулетка Франции не выгодна — ничего не делаем
  if (playerGain <= enemyGain) return;

  const difference = playerGain - enemyGain;

  marseilleTurnActive = true;
  marseilleTurnCooldown = true;

  // Меняем последние заработанные очки местами.
  // Игрок теряет разницу...
  sCompetitionDrain += difference;

  // ...а Франция получает эту же разницу
  competitionState.enemyScore += difference;

  playMarseilleTurnVisual(enemy, difference);

  updateCompetitionHud();

  // Сам финт закончен почти сразу
  marseilleTurnVisualTimeout = setTimeout(() => {
    marseilleTurnActive = false;
    marseilleTurnVisualTimeout = null;
  }, ability.turnDuration || 250);

  // Повторно использовать способность нельзя некоторое время
  marseilleTurnCooldownTimeout = setTimeout(() => {
    marseilleTurnCooldown = false;
    marseilleTurnCooldownTimeout = null;
  }, ability.cooldown || 3000);

  // После обмена начинаем историю заново,
  // чтобы один и тот же отрезок нельзя было украсть второй раз
  franceScoreHistory = [
    {
      time: Date.now(),
      player: getCompetitionPlayerScore(),
      enemy: competitionState.enemyScore || 0,
    },
  ];
}
function playMarseilleTurnVisual(enemy, difference) {
  const opponentEl = document.getElementById("competition-opponent");
  if (!opponentEl) return;

  const normalImage = enemy.opponent;
  const backImage = "competition/opponent_fra_back.png";

  const rect = opponentEl.getBoundingClientRect();

  spawnFloatingText(
    "MARSEILLE<br>TURN!",
    rect.left + rect.width / 2,
    rect.top - 20,
    "ultraSmall",
  );

  spawnFloatingText(
    "SWAP +" + Math.floor(difference),
    rect.left + rect.width / 2,
    rect.top + 30,
    "tele",
  );

  // Поворачивается спиной
  opponentEl.src = backImage;

  // Короткая бело-синяя подсветка
  opponentEl.style.filter =
    "drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 22px #3b82f6)";

  setTimeout(() => {
    if (
      currentMode === "competition" &&
      data.competition.selected === "france"
    ) {
      opponentEl.src = normalImage;
      opponentEl.style.filter = "";
    }
  }, enemy.special.turnDuration || 250);
}

function tryTriggerBrazilCarnival(enemy) {
  const ability = enemy.special;

  if (!ability) return;
  if (ability.name !== "CARNIVAL!") return;
  if (carnivalActive) return;
  if (carnivalCooldown) return;
  if (Math.random() >= ability.chance) return;

  carnivalActive = true;
  carnivalCooldown = true;

  const opponentEl = document.getElementById("competition-opponent");

  if (opponentEl) {
    const rect = opponentEl.getBoundingClientRect();

    spawnFloatingText(
      "CARNIVAL!",
      rect.left + rect.width / 2,
      rect.top - 10,
      "ultra",
    );
  }
  carnivalInterval = setInterval(() => {
    spawnCarnivalBall();
  }, ability.spawnSpeed || 200);

  carnivalTimeout = setTimeout(() => {
    clearInterval(carnivalInterval);
    carnivalInterval = null;

    carnivalActive = false;

    clearTimeout(carnivalCooldownTimeout);
    carnivalCooldownTimeout = setTimeout(() => {
      carnivalCooldown = false;
      carnivalCooldownTimeout = null;
    }, ability.cooldown || 4000);
  }, ability.duration);
}

function spawnCarnivalBall() {
  const field = document.getElementById("game-screen");
  if (!field) return;

  const types = ["gold", "fire", "combo", "crystal"];
  const randomType = types[Math.floor(Math.random() * types.length)];

  const usedIndexes = [];

  if (currentMainBallIndex !== -1) {
    usedIndexes.push(currentMainBallIndex);
  }

  extraBalls.forEach((extraBall) => {
    if (extraBall.style.display === "block") {
      const idx = parseInt(extraBall.dataset.ballIndex || "-1", 10);
      if (idx !== -1 && !usedIndexes.includes(idx)) {
        usedIndexes.push(idx);
      }
    }
  });

  carnivalBalls.forEach((ball) => {
    const idx = parseInt(ball.dataset.ballIndex || "-1", 10);
    if (idx !== -1 && !usedIndexes.includes(idx)) {
      usedIndexes.push(idx);
    }
  });

  const newIndex = getRandomFreeBallIndex(usedIndexes);
  if (newIndex === -1) return;

  const pos = ballPositions[newIndex];

  const ball = document.createElement("img");
  ball.className = "extra-ball carnival-ball";
  ball.dataset.ballType = randomType;
  ball.dataset.ballIndex = newIndex.toString();

  ball.style.display = "block";
  ball.style.position = "absolute";
  ball.style.left = pos.left;
  ball.style.top = pos.top;
  ball.style.cursor = "pointer";
  ball.style.imageRendering = "pixelated";
  ball.style.setProperty("--angle", "0deg");

  ball.draggable = false;
  ball.onclick = handleKick;

  applyBallType(ball, randomType);

  const colors = [
    "#ff4d4d",
    "#ffd24d",
    "#4dff88",
    "#4dd2ff",
    "#b84dff",
    "#ff66cc",
  ];

  const glow = colors[Math.floor(Math.random() * colors.length)];

  ball.style.filter = `drop-shadow(0 0 10px ${glow}) drop-shadow(0 0 18px ${glow})`;

  field.appendChild(ball);
  carnivalBalls.push(ball);

  setTimeout(() => {
    ball.remove();
    carnivalBalls = carnivalBalls.filter((b) => b !== ball);
  }, 750);
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

  clearInterval(carnivalInterval);
  clearTimeout(carnivalTimeout);
  clearTimeout(carnivalCooldownTimeout);

  carnivalInterval = null;
  carnivalTimeout = null;
  carnivalCooldownTimeout = null;

  carnivalActive = false;
  carnivalCooldown = false;

  carnivalBalls.forEach((ball) => ball.remove());
  carnivalBalls = [];

  enemyAbilityTimeout = null;
  germanyBerserkTimeout = null;
  germanyBerserkCooldownTimeout = null;
  stopPitbullAttack();
  stopIcePrisonCheck();
  stopFranceScoreHistory();

  clearTimeout(marseilleTurnVisualTimeout);
  clearTimeout(marseilleTurnCooldownTimeout);

  marseilleTurnVisualTimeout = null;
  marseilleTurnCooldownTimeout = null;

  marseilleTurnActive = false;
  marseilleTurnCooldown = false;

  const franceOpponent = document.getElementById("competition-opponent");

  if (franceOpponent && data.competition.selected === "france") {
    franceOpponent.style.filter = "";
  }

  stopCameroonClaw();
  stopCameroonRoar();

  clearTimeout(cameroonClawCooldownTimeout);
  cameroonClawCooldownTimeout = null;
  cameroonClawCooldown = false;

  clearTimeout(cameroonRoarCooldownTimeout);
  cameroonRoarCooldownTimeout = null;
  cameroonRoarCooldown = false;

  document
    .querySelectorAll(".cameroon-claw-effect")
    .forEach((el) => el.remove());

  document.querySelectorAll(".cameroon-red-flash").forEach((el) => el.remove());

  document
    .querySelectorAll(".cameroon-roar-flash")
    .forEach((el) => el.remove());

  const field = document.getElementById("game-screen");

  if (field) {
    field.classList.remove("cameroon-claw-shake");
    field.classList.remove("cameroon-roar-shake");
    field.classList.remove("cameroon-roar-active");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadPitbullAtlas();
});
