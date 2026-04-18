// =============================================
// Audio & Music
// =============================================
const audioSettings = {
  musicVolume: 0.09,
  soundVolume: 0.8,
  musicEnabled: true,
  soundEnabled: true,
};

const music = {
  menu: [
    new Audio("match/music/menu1.mp3"),
    new Audio("match/music/menu2.mp3"),
    new Audio("match/music/menu3.mp3"),
  ],
  game: new Audio("match/music/game.mp3"),
};

const sounds = {
  kick: new Audio("match/sound/kick.mp3"),
  gold: new Audio("match/sound/gold.mp3"),
  fire: new Audio("match/sound/fire.mp3"),
  combo: new Audio("match/sound/combo.mp3"),
  crystal: new Audio("match/sound/crystal.mp3"),
  piggyHit: new Audio("match/sound/piggy_hit.mp3"),
  piggyBreak: new Audio("match/sound/piggy_break.mp3"),
  telekinesis: new Audio("match/sound/tele.mp3"),
  shockwave: new Audio("match/sound/shockwave.mp3"),
  freeze: new Audio("match/sound/freeze.mp3"),
};

const menuPlaylist = music.menu;
let currentMusic = null;
let currentMusicType = null;
let currentMenuTrackIndex = 0;

menuPlaylist.forEach((track) => {
  track.preload = "auto";
  track.loop = false;

  track.addEventListener("ended", () => {
    if (currentMusicType !== "menu") return;
    playNextMenuTrack();
  });
});

music.game.preload = "auto";
music.game.loop = true;

Object.values(sounds).forEach((sound) => {
  sound.preload = "auto";
});

function applyMusicVolume() {
  const volume = audioSettings.musicEnabled ? audioSettings.musicVolume : 0;

  menuPlaylist.forEach((track) => {
    track.volume = volume;
  });

  music.game.volume = volume;
}

function setMusicVolume(value) {
  audioSettings.musicVolume = Math.max(0, Math.min(1, Number(value) || 0));
  applyMusicVolume();
}

function setSoundVolume(value) {
  audioSettings.soundVolume = Math.max(0, Math.min(1, Number(value) || 0));
}

function setMusicEnabled(enabled) {
  audioSettings.musicEnabled = !!enabled;
  applyMusicVolume();

  if (!audioSettings.musicEnabled) {
    if (currentMusic) {
      currentMusic.pause();
    }
    return;
  }

  if (currentMusic) {
    currentMusic.play().catch(() => {});
  }
}

function setSoundEnabled(enabled) {
  audioSettings.soundEnabled = !!enabled;
}

function playSound(sound, volume = 0.2, randomPitch = true) {
  if (!sound || !audioSettings.soundEnabled) return;

  try {
    const instance = sound.cloneNode();

    instance.volume = Math.max(
      0,
      Math.min(1, volume * audioSettings.soundVolume),
    );

    instance.playbackRate = randomPitch ? 0.9 + Math.random() * 0.2 : 1;
    instance.play().catch(() => {});
  } catch (e) {}
}

function stopAllMusic() {
  menuPlaylist.forEach((track) => {
    track.pause();
    track.currentTime = 0;
  });

  music.game.pause();
  music.game.currentTime = 0;

  currentMusic = null;
  currentMusicType = null;
}

function playMenuTrack(index) {
  if (!audioSettings.musicEnabled) return;
  if (!menuPlaylist.length) return;

  stopAllMusic();

  currentMenuTrackIndex = index;
  currentMusicType = "menu";
  currentMusic = menuPlaylist[currentMenuTrackIndex];

  applyMusicVolume();
  currentMusic.play().catch(() => {});
}

function playNextMenuTrack() {
  if (!menuPlaylist.length) return;

  let nextIndex = currentMenuTrackIndex;

  while (menuPlaylist.length > 1 && nextIndex === currentMenuTrackIndex) {
    nextIndex = Math.floor(Math.random() * menuPlaylist.length);
  }

  playMenuTrack(nextIndex);
}

function playMusic(type) {
  if (!audioSettings.musicEnabled) return;

  if (type === "menu") {
    if (currentMusicType === "menu" && currentMusic && !currentMusic.paused) {
      return;
    }

    if (currentMusicType !== "menu" || !currentMusic || currentMusic.paused) {
      currentMenuTrackIndex = Math.floor(Math.random() * menuPlaylist.length);
    }

    playMenuTrack(currentMenuTrackIndex);
    return;
  }

  if (type === "game") {
    if (currentMusicType === "game" && currentMusic === music.game) {
      applyMusicVolume();
      return;
    }

    stopAllMusic();

    currentMusicType = "game";
    currentMusic = music.game;

    applyMusicVolume();
    currentMusic.play().catch(() => {});
  }
}

function stopMusic() {
  stopAllMusic();
}

applyMusicVolume();

// =============================================
// Friend & Viewer Animation
// =============================================

let friendAtlasData = null;
let friendAnimationInterval = null;
let currentFriendFrame = 0;
let viewerAtlasData = null;
let viewerFrames = [];

// Функция загрузки JSON (Атласа)
async function loadFriendAtlas() {
  try {
    const response = await fetch("match/friend.json");
    const text = await response.text();
    friendAtlasData = JSON.parse(text);
    console.log("Данные друга загружены");
  } catch (e) {
    console.log("Ошибка загрузки JSON:", e);
  }
}
async function loadViewerAtlas() {
  try {
    const response = await fetch("match/viewer.json");
    const text = await response.text();
    viewerAtlasData = JSON.parse(text);
    viewerFrames = Object.values(viewerAtlasData.frames);
    console.log("Данные зрителя загружены");
  } catch (e) {
    console.log("Ошибка загрузки viewer.json:", e);
  }
}

// Функция смены кадров
function playFriendFrame() {
  if (!friendAtlasData) return;
  const friend = document.getElementById("friend-animation");

  const div = document.getElementById("friend-animation");
  const frames = Object.keys(friendAtlasData.frames);

  if (currentFriendFrame >= frames.length) currentFriendFrame = 0;

  const data = friendAtlasData.frames[frames[currentFriendFrame]].frame;

  const scale = 0.4;

  div.style.backgroundImage = "url('match/friend.png')";

  // 🔥 масштабируем позицию
  div.style.backgroundPosition = `-${data.x * scale}px -${data.y * scale}px`;

  // 🔥 масштабируем весь atlas
  div.style.backgroundSize = `${friendAtlasData.meta.size.w * scale}px ${friendAtlasData.meta.size.h * scale}px`;

  // 🔥 размер кадра
  div.style.width = `${data.w * scale}px`;
  div.style.height = `${data.h * scale}px`;

  // 🔥 зеркалим
  div.style.transform = "translate(-50%, -50%) scaleX(-1)";

  currentFriendFrame++;
}
function updateViewersDisplay() {
  const container = document.getElementById("viewers-container");
  if (!container) return;

  container.innerHTML = "";

  let count = Math.min(actualViewerCount || 0, 5);

  const viewerPositions = [
    { left: "5%", top: "55%" },
    { left: "9%", top: "55%" },
    { left: "-5%", top: "65%" },
    { left: "1%", top: "55%" },
    { left: "-1%", top: "65%" },
  ];

  for (let i = 0; i < count; i++) {
    const vDiv = document.createElement("div");
    vDiv.className = "viewer-sprite";
    vDiv.style.backgroundImage = "url('match/viewer.png')";

    const pos = viewerPositions[i] || { left: "8%", top: "18%" };
    vDiv.style.left = pos.left;
    vDiv.style.top = pos.top;

    const randomOffset = Math.floor(Math.random() * (viewerFrames.length || 1));

    container.appendChild(vDiv);
    animateSingleViewer(vDiv, randomOffset);
  }
}
function animateSingleViewer(el, frameIndex) {
  setInterval(
    () => {
      if (viewerFrames.length === 0 || !viewerAtlasData) return;

      frameIndex = (frameIndex + 1) % viewerFrames.length;
      const frame = viewerFrames[frameIndex].frame;

      const scale = 0.2;

      // ВОТ ЭТА СТРОКА ГЛАВНАЯ — она переключает кадр
      el.style.backgroundPosition = `-${frame.x * scale}px -${frame.y * scale}px`;

      el.style.width = `${frame.w * scale}px`;
      el.style.height = `${frame.h * scale}px`;

      el.style.backgroundSize = `${viewerAtlasData.meta.size.w * scale}px ${viewerAtlasData.meta.size.h * scale}px`;
      el.style.backgroundRepeat = "no-repeat";
    },
    800 + Math.random() * 200,
  ); // скорость анимации
}

// Функция запуска (вызывай её при покупке навыка)
function startFriend() {
  console.log("Пытаюсь запустить Друга...");

  const div = document.getElementById("friend-animation");

  // 1. Проверяем, есть ли вообще такой DIV на странице
  if (!div) {
    console.error("Ошибка: DIV #friend-animation не найден в HTML!");
    return;
  }

  // 2. Проверяем, загрузился ли JSON
  if (!friendAtlasData) {
    console.warn("Данные атласа еще не загружены. Пробую загрузить еще раз...");
    loadFriendAtlas(); // Пытаемся загрузить снова
    return;
  }

  // 3. Если всё ок — показываем и запускаем
  div.style.display = "block";

  if (!friendAnimationInterval) {
    friendAnimationInterval = setInterval(playFriendFrame, 100);
    console.log("Анимация запущена успешно!");
  }
}

// Сразу запускаем загрузку данных
loadFriendAtlas();
loadViewerAtlas();

// =============================================
// Balls
// ============================================
const ballPositions = [
  { left: "18%", top: "24%" },
  { left: "32%", top: "24%" },
  { left: "46%", top: "24%" },
  { left: "60%", top: "24%" },
  { left: "74%", top: "24%" },
  { left: "18%", top: "38%" },
  { left: "32%", top: "38%" },
  { left: "46%", top: "38%" },
  { left: "60%", top: "38%" },
  { left: "74%", top: "38%" },
  { left: "18%", top: "52%" },
  { left: "32%", top: "52%" },
  { left: "46%", top: "52%" },
  { left: "60%", top: "52%" },
  { left: "74%", top: "52%" },
  { left: "18%", top: "66%" },
  { left: "32%", top: "66%" },
  { left: "46%", top: "66%" },
  { left: "60%", top: "66%" },
  { left: "74%", top: "66%" },
  { left: "18%", top: "80%" },
  { left: "32%", top: "80%" },
  { left: "46%", top: "80%" },
  { left: "60%", top: "80%" },
  { left: "74%", top: "80%" },
];

function moveBallToRandomPosition(usedIndexes = []) {
  const ballContainer = document.getElementById("ball-container");
  if (!ballContainer) return;

  const newIndex = getRandomFreeBallIndex(usedIndexes, [currentMainBallIndex]);
  if (newIndex === -1) return;

  const pos = ballPositions[newIndex];
  ballContainer.style.left = pos.left;
  ballContainer.style.top = pos.top;
  ballContainer.style.transform = "translate(-50%, -50%)";

  currentMainBallIndex = newIndex;
  usedIndexes.push(newIndex);
}
function getRandomFreeBallIndex(usedIndexes = [], forbiddenIndexes = []) {
  const freeIndexes = ballPositions
    .map((_, index) => index)
    .filter(
      (index) =>
        !usedIndexes.includes(index) && !forbiddenIndexes.includes(index),
    );

  if (freeIndexes.length === 0) return -1;

  return freeIndexes[Math.floor(Math.random() * freeIndexes.length)];
}
function rollBallType() {
  const comboChance = [0, 0.5, 1, 1.5][data.lvls.synergy || 0] || 0;
  const fireChance = [0, 3, 6, 9][data.lvls.fireBall || 0] || 0;
  const goldChance = [0, 2, 4, 6][data.lvls.goldBall || 0] || 0;
  const crystalChance = [0, 1, 2, 3][data.lvls.crystalBall || 0] || 0;

  if (data.lvls.synergy > 0 && Math.random() * 100 < comboChance) {
    return "combo";
  }

  if (data.lvls.crystalBall > 0 && Math.random() * 100 < crystalChance) {
    return "crystal";
  }

  if (data.lvls.fireBall > 0 && Math.random() * 100 < fireChance) {
    return "fire";
  }

  if (data.lvls.goldBall > 0 && Math.random() * 100 < goldChance) {
    return "gold";
  }

  return "normal";
}

function applyBallType(ball, type) {
  if (!ball) return;

  ball.dataset.ballType = type;
  ball.classList.remove("gold-ball", "fire-ball", "combo-ball", "crystal-ball");

  if (type === "gold") {
    ball.src = "match/golden_ball.png";
    ball.classList.add("gold-ball");
  } else if (type === "fire") {
    ball.src = "match/fire_ball.png";
    ball.classList.add("fire-ball");
  } else if (type === "combo") {
    ball.src = "match/combo_ball.png";
    ball.classList.add("combo-ball");
  } else if (type === "crystal") {
    ball.src = "match/crystal_ball.png";
    ball.classList.add("crystal-ball");
  } else {
    ball.src = "match/ball.png";
  }
}

function createExtraBall() {
  const field = document.getElementById("game-screen");
  if (!field) return null;

  const ball = document.createElement("img");
  ball.src = "match/ball.png";
  ball.className = "extra-ball";
  ball.dataset.ballType = "normal";
  ball.dataset.spawnTime = "0";
  ball.dataset.lifeTime = "0";
  ball.style.display = "none";
  ball.style.setProperty("--angle", "0deg");
  ball.draggable = false;
  ball.onclick = handleKick;
  ball.dataset.ballIndex = "-1";

  ball.style.position = "absolute";
  ball.style.cursor = "pointer";
  ball.style.imageRendering = "pixelated";

  field.appendChild(ball);
  return ball;
}

function getExtraBallLifeTime() {
  return 750 + (data.lvls.specialReaction || 0) * 250;
}

function updateMultiBalls() {
  const maxExtraBalls = data.lvls.multiBall || 0;

  while (extraBalls.length < maxExtraBalls) {
    const newBall = createExtraBall();
    if (newBall) {
      extraBalls.push(newBall);
      currentExtraBallIndexes.push(-1);
    }
  }

  while (extraBalls.length > maxExtraBalls) {
    const ball = extraBalls.pop();
    currentExtraBallIndexes.pop();
    if (ball) ball.remove();
  }

  moveAllBallsToRandomPositions();
}
function moveAllBallsToRandomPositions() {
  const usedIndexes = [];

  extraBalls.forEach((extraBall) => {
    if (extraBall.style.display === "block") {
      const idx = parseInt(extraBall.dataset.ballIndex || "-1", 10);
      if (idx !== -1 && !usedIndexes.includes(idx)) {
        usedIndexes.push(idx);
      }
    }
  });

  moveBallToRandomPosition(usedIndexes);

  const mainBall = document.getElementById("ball");
  if (mainBall) {
    applyBallType(mainBall, "normal");
  }
}

function updateExtraBallLife() {
  const now = Date.now();

  extraBalls.forEach((ball, index) => {
    if (ball.style.display !== "block") return;

    const spawnTime = parseInt(ball.dataset.spawnTime || "0", 10);
    const lifeTime = parseInt(ball.dataset.lifeTime || "0", 10);

    if (spawnTime <= 0 || lifeTime <= 0) return;

    if (now - spawnTime >= lifeTime) {
      ball.style.display = "none";
      ball.dataset.spawnTime = "0";
      ball.dataset.lifeTime = "0";
      currentExtraBallIndexes[index] = -1;
      ball.dataset.ballIndex = "-1";
    }
  });
}

function getMainBallLifeTime() {
  return 750 + (data.lvls.reaction || 0) * 250;
}

function scheduleMainBallMove(delay = null) {
  clearTimeout(mainBallMoveTimeout);

  const time = delay ?? getMainBallLifeTime();

  mainBallMoveDelay = time;
  mainBallMoveStartedAt = Date.now();

  mainBallMoveTimeout = setTimeout(() => {
    moveAllBallsToRandomPositions();
    scheduleMainBallMove(getMainBallLifeTime());
  }, time);
}

function trySpawnExtraBall() {
  const spawnChance = 0.1; // всегда 10%

  // Ищем первый скрытый доп. мяч
  const hiddenBallIndex = extraBalls.findIndex(
    (ball) => ball.style.display !== "block",
  );
  if (hiddenBallIndex === -1) return;

  if (Math.random() >= spawnChance) return;

  const ball = extraBalls[hiddenBallIndex];
  if (!ball) return;

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

  const newIndex = getRandomFreeBallIndex(usedIndexes);
  if (newIndex === -1) return;

  const pos = ballPositions[newIndex];
  const ballType = rollBallType();

  ball.style.display = "block";
  ball.style.left = pos.left;
  ball.style.top = pos.top;
  ball.style.setProperty("--angle", "0deg");

  ball.dataset.spawnTime = Date.now().toString();
  ball.dataset.lifeTime = getExtraBallLifeTime().toString();

  applyBallType(ball, ballType);

  currentExtraBallIndexes[hiddenBallIndex] = newIndex;
  ball.dataset.ballIndex = newIndex.toString();
}

// =============================================
// Piggies
// ============================================

const piggyPositions = [
  { left: "18%", top: "30%" },
  { left: "30%", top: "30%" },
  { left: "42%", top: "30%" },
  { left: "54%", top: "30%" },
  { left: "66%", top: "30%" },
  { left: "78%", top: "30%" },

  { left: "18%", top: "45%" },
  { left: "30%", top: "45%" },
  { left: "42%", top: "45%" },
  { left: "54%", top: "45%" },
  { left: "66%", top: "45%" },
  { left: "78%", top: "45%" },

  { left: "18%", top: "60%" },
  { left: "30%", top: "60%" },
  { left: "42%", top: "60%" },
  { left: "54%", top: "60%" },
  { left: "66%", top: "60%" },
  { left: "78%", top: "60%" },
];

function getFreePiggyPosition() {
  const usedPositions = [];

  const piggy = document.getElementById("piggy");
  const surprisePiggy = document.getElementById("surprise-piggy");

  if (piggyState.active && piggy && piggy.style.left && piggy.style.top) {
    usedPositions.push(`${piggy.style.left}|${piggy.style.top}`);
  }

  if (
    surprisePiggyState.active &&
    surprisePiggy &&
    surprisePiggy.style.left &&
    surprisePiggy.style.top
  ) {
    usedPositions.push(
      `${surprisePiggy.style.left}|${surprisePiggy.style.top}`,
    );
  }

  const freePositions = piggyPositions.filter(
    (pos) => !usedPositions.includes(`${pos.left}|${pos.top}`),
  );

  if (freePositions.length === 0) return null;

  return freePositions[Math.floor(Math.random() * freePositions.length)];
}

function getPiggyData() {
  const lvl = data.lvls.piggy || 0;

  if (lvl === 1) {
    const variants = [
      { hp: 75, reward: 7 },
      { hp: 100, reward: 10 },
      { hp: 125, reward: 13 },
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  if (lvl === 2) {
    const variants = [
      { hp: 100, reward: 10 },
      { hp: 150, reward: 15 },
      { hp: 200, reward: 20 },
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  const variants = [
    { hp: 200, reward: 20 },
    { hp: 250, reward: 25 },
    { hp: 300, reward: 30 },
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function getSurprisePiggyData() {
  const lvl = data.lvls.surprisePiggy || 0;

  if (lvl === 1) {
    const variants = [
      { hp: 150, coinReward: 15, gemReward: 1 },
      { hp: 200, coinReward: 20, gemReward: 2 },
      { hp: 250, coinReward: 25, gemReward: 2 },
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  if (lvl === 2) {
    const variants = [
      { hp: 250, coinReward: 25, gemReward: 2 },
      { hp: 300, coinReward: 30, gemReward: 2 },
      { hp: 350, coinReward: 40, gemReward: 3 },
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  const variants = [
    { hp: 350, coinReward: 40, gemReward: 3 },
    { hp: 400, coinReward: 55, gemReward: 3 },
    { hp: 450, coinReward: 70, gemReward: 4 },
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function updatePiggySprite() {
  const piggy = document.getElementById("piggy");
  if (!piggy) return;

  if (!piggyState.active || piggyState.maxHp <= 0) {
    piggy.src = "match/piggy.png";
    return;
  }

  const hpPercent = (piggyState.hp / piggyState.maxHp) * 100;

  if (hpPercent <= 35) {
    piggy.src = "match/piggy_crack.png";
  } else {
    piggy.src = "match/piggy.png";
  }
}

function updatePiggyHpBar() {
  const piggy = document.getElementById("piggy");
  const bar = document.getElementById("piggy-hp-bar");
  const fill = document.getElementById("piggy-hp-fill");

  if (!piggy || !bar || !fill) return;

  if (!piggyState.active || piggyState.maxHp <= 0) {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "block";
  bar.style.left = piggy.style.left;
  bar.style.top = `calc(${piggy.style.top} - 55px)`;

  const percent = Math.max(0, (piggyState.hp / piggyState.maxHp) * 100);
  fill.style.width = percent + "%";
}

function updateSurprisePiggySprite() {
  const piggy = document.getElementById("surprise-piggy");
  if (!piggy) return;

  if (!surprisePiggyState.active || surprisePiggyState.maxHp <= 0) {
    piggy.src = "match/surprisePiggy.png";
    return;
  }

  const hpPercent = (surprisePiggyState.hp / surprisePiggyState.maxHp) * 100;

  if (hpPercent <= 35) {
    piggy.src = "match/surprisePiggy_crack.png";
  } else {
    piggy.src = "match/surprisePiggy.png";
  }
}
function updateSurprisePiggyHpBar() {
  const piggy = document.getElementById("surprise-piggy");
  const bar = document.getElementById("surprise-piggy-hp-bar");
  const fill = document.getElementById("surprise-piggy-hp-fill");

  if (!piggy || !bar || !fill) return;

  if (!surprisePiggyState.active || surprisePiggyState.maxHp <= 0) {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "block";
  bar.style.left = piggy.style.left;
  bar.style.top = `calc(${piggy.style.top} - 55px)`;

  const percent = Math.max(
    0,
    (surprisePiggyState.hp / surprisePiggyState.maxHp) * 100,
  );
  fill.style.width = percent + "%";
}
function getFreeClonePosition() {
  const used = [];

  if (currentMainBallIndex !== -1) {
    used.push(currentMainBallIndex);
  }

  currentExtraBallIndexes.forEach((idx) => {
    if (idx !== -1 && !used.includes(idx)) {
      used.push(idx);
    }
  });

  clonePiggies.forEach((piggy) => {
    if (piggy.style.display === "block") {
      const idx = parseInt(piggy.dataset.ballIndex || "-1", 10);
      if (idx !== -1 && !used.includes(idx)) used.push(idx);
    }
  });

  cloneSurprisePiggies.forEach((piggy) => {
    if (piggy.style.display === "block") {
      const idx = parseInt(piggy.dataset.ballIndex || "-1", 10);
      if (idx !== -1 && !used.includes(idx)) used.push(idx);
    }
  });

  const piggy = document.getElementById("piggy");
  if (piggyState.active && piggy) {
    const posKey = `${piggy.style.left}|${piggy.style.top}`;
    const idx = ballPositions.findIndex((p) => `${p.left}|${p.top}` === posKey);
    if (idx !== -1 && !used.includes(idx)) used.push(idx);
  }

  const surprisePiggy = document.getElementById("surprise-piggy");
  if (surprisePiggyState.active && surprisePiggy) {
    const posKey = `${surprisePiggy.style.left}|${surprisePiggy.style.top}`;
    const idx = ballPositions.findIndex((p) => `${p.left}|${p.top}` === posKey);
    if (idx !== -1 && !used.includes(idx)) used.push(idx);
  }

  return getRandomFreeBallIndex(used);
}

function createClonePiggy() {
  const field = document.getElementById("game-screen");
  if (!field) return null;

  const piggy = document.createElement("img");
  piggy.src = "match/piggy.png";
  piggy.className = "clone-piggy";
  piggy.style.display = "none";
  piggy.draggable = false;
  piggy.onclick = handleKick;

  piggy.dataset.isClone = "1";
  piggy.dataset.ballIndex = "-1";
  piggy.dataset.spawnTime = "0";
  piggy.dataset.lifeTime = "0";
  piggy.dataset.hp = "0";
  piggy.dataset.maxHp = "0";
  piggy.dataset.reward = "0";

  field.appendChild(piggy);
  return piggy;
}

function createCloneSurprisePiggy() {
  const field = document.getElementById("game-screen");
  if (!field) return null;

  const piggy = document.createElement("img");
  piggy.src = "match/surprisePiggy.png";
  piggy.className = "clone-surprise-piggy";
  piggy.style.display = "none";
  piggy.draggable = false;
  piggy.onclick = handleKick;

  piggy.dataset.isClone = "1";
  piggy.dataset.ballIndex = "-1";
  piggy.dataset.spawnTime = "0";
  piggy.dataset.lifeTime = "0";
  piggy.dataset.hp = "0";
  piggy.dataset.maxHp = "0";
  piggy.dataset.coinReward = "0";
  piggy.dataset.gemReward = "0";

  field.appendChild(piggy);
  return piggy;
}

// =============================================
// CLONES
// =============================================

function tryCloneTarget(target) {
  if (!target) return;
  if ((data.lvls.clone || 0) <= 0) return;
  if (target.dataset?.isClone === "1") return;

  const chance = getCloneChance();
  if (Math.random() * 100 >= chance) return;

  const freeIndex = getFreeClonePosition();
  if (freeIndex === -1) return;

  const pos = ballPositions[freeIndex];
  if (!pos) return;

  const now = Date.now();

  // Клон обычного мяча / special мяча
  if (target.id === "ball" || target.classList.contains("extra-ball")) {
    const clone = createExtraBall();
    if (!clone) return;

    clone.style.display = "block";
    clone.style.left = pos.left;
    clone.style.top = pos.top;
    clone.style.setProperty("--angle", "0deg");
    clone.dataset.ballIndex = freeIndex.toString();
    clone.dataset.spawnTime = now.toString();

    let lifeTime;

    if (target.id === "ball") {
      lifeTime = getMainBallLifeTime();
    } else {
      lifeTime = getExtraBallLifeTime();
    }

    clone.dataset.lifeTime = lifeTime.toString();
    clone.dataset.isClone = "1";

    const type = target.dataset.ballType || "normal";
    applyBallType(clone, type);
    clone.classList.add("clone");

    extraBalls.push(clone);
    currentExtraBallIndexes.push(freeIndex);

    const center = getElementCenter(clone);
    if (center) {
      spawnFloatingText("CLONE!", center.x, center.y - 20, "tele");
    }
    return;
  }

  // Клон обычной свинки
  if (target.id === "piggy" && piggyState.active) {
    const clone = createClonePiggy();
    if (!clone) return;
    clone.classList.add("clone");

    clone.style.display = "block";
    clone.style.left = pos.left;
    clone.style.top = pos.top;
    clone.dataset.ballIndex = freeIndex.toString();
    clone.dataset.spawnTime = now.toString();
    clone.dataset.lifeTime = getPiggyLifeTime().toString();
    clone.dataset.hp = piggyState.maxHp.toString();
    clone.dataset.maxHp = piggyState.maxHp.toString();
    clone.dataset.reward = piggyState.reward.toString();

    clonePiggies.push(clone);

    const center = getElementCenter(clone);
    if (center) {
      spawnFloatingText("CLONE!", center.x, center.y - 20, "tele");
    }
    return;
  }

  // Клон surprise-свинки
  if (target.id === "surprise-piggy" && surprisePiggyState.active) {
    const clone = createCloneSurprisePiggy();
    if (!clone) return;
    clone.classList.add("clone");

    clone.style.display = "block";
    clone.style.left = pos.left;
    clone.style.top = pos.top;
    clone.dataset.ballIndex = freeIndex.toString();
    clone.dataset.spawnTime = now.toString();
    clone.dataset.lifeTime = getSurprisePiggyLifeTime().toString();
    clone.dataset.hp = surprisePiggyState.maxHp.toString();
    clone.dataset.maxHp = surprisePiggyState.maxHp.toString();
    clone.dataset.coinReward = surprisePiggyState.coinReward.toString();
    clone.dataset.gemReward = surprisePiggyState.gemReward.toString();

    cloneSurprisePiggies.push(clone);

    const center = getElementCenter(clone);
    if (center) {
      spawnFloatingText("CLONE!", center.x, center.y - 20, "tele");
    }
  }
}
function updateClonePiggiesLife() {
  const now = Date.now();

  clonePiggies.forEach((piggy) => {
    if (piggy.style.display !== "block") return;

    const spawnTime = parseInt(piggy.dataset.spawnTime || "0", 10);
    const lifeTime = parseInt(piggy.dataset.lifeTime || "0", 10);

    if (spawnTime <= 0 || lifeTime <= 0) return;

    if (now - spawnTime >= lifeTime) {
      piggy.style.display = "none";
      piggy.dataset.ballIndex = "-1";
    }
  });

  cloneSurprisePiggies.forEach((piggy) => {
    if (piggy.style.display !== "block") return;

    const spawnTime = parseInt(piggy.dataset.spawnTime || "0", 10);
    const lifeTime = parseInt(piggy.dataset.lifeTime || "0", 10);

    if (spawnTime <= 0 || lifeTime <= 0) return;

    if (now - spawnTime >= lifeTime) {
      piggy.style.display = "none";
      piggy.dataset.ballIndex = "-1";
    }
  });
}

function getPiggyLifeTime() {
  return [0, 1000, 2000, 3000][data.lvls.piggy || 0] || 1000;
}

function getSurprisePiggyLifeTime() {
  return [0, 1200, 2200, 3200][data.lvls.surprisePiggy || 0] || 1200;
}

function updateKiosks() {
  const drinksKiosk = document.getElementById("kiosk-drinks");
  const attrKiosk = document.getElementById("kiosk-attr");

  // Если куплен хотя бы 1 уровень напитков — показываем киоск
  if (drinksKiosk) {
    drinksKiosk.style.display = data.lvls.drink > 0 ? "block" : "none";
  }

  // Если куплен хотя бы 1 уровень атрибутики — показываем киоск
  if (attrKiosk) {
    attrKiosk.style.display = data.lvls.attr > 0 ? "block" : "none";
  }
}

function trySpawnPiggy() {
  if (data.lvls.piggy <= 0) return;
  if (piggyState.active) return;

  const piggyChance = [0, 1, 2, 3][data.lvls.piggy || 0] || 0;
  if (Math.random() * 100 >= piggyChance) return;

  const piggy = document.getElementById("piggy");
  if (!piggy) return;

  const piggyData = getPiggyData();
  const pos = getFreePiggyPosition();
  if (!pos) return;

  piggy.style.left = pos.left;
  piggy.style.top = pos.top;
  piggy.style.display = "block";

  piggyState.active = true;
  piggyState.hp = piggyData.hp;
  piggyState.maxHp = piggyData.hp;
  piggyState.reward = piggyData.reward;
  piggyState.spawnTime = Date.now();
  piggyState.lifeTime = getPiggyLifeTime();

  updatePiggySprite();
  updatePiggyHpBar();
}

function trySpawnSurprisePiggy() {
  if (data.lvls.surprisePiggy <= 0) return;
  if (surprisePiggyState.active) return;

  const chance = [0, 0.5, 1, 1.5][data.lvls.surprisePiggy || 0] || 0;
  if (Math.random() * 100 >= chance) return;

  const piggy = document.getElementById("surprise-piggy");
  if (!piggy) return;

  const piggyData = getSurprisePiggyData();
  const pos = getFreePiggyPosition();
  if (!pos) return;

  piggy.style.left = pos.left;
  piggy.style.top = pos.top;
  piggy.style.display = "block";

  surprisePiggyState.active = true;
  surprisePiggyState.hp = piggyData.hp;
  surprisePiggyState.maxHp = piggyData.hp;
  surprisePiggyState.coinReward = piggyData.coinReward;
  surprisePiggyState.gemReward = piggyData.gemReward;
  surprisePiggyState.spawnTime = Date.now();
  surprisePiggyState.lifeTime = getSurprisePiggyLifeTime();

  updateSurprisePiggySprite();
  updateSurprisePiggyHpBar();
}

function updatePiggyLife() {
  if (!piggyState.active) return;

  const piggy = document.getElementById("piggy");
  if (!piggy) return;

  const now = Date.now();

  if (now - piggyState.spawnTime >= piggyState.lifeTime) {
    piggy.style.display = "none";

    piggyState.active = false;
    piggyState.hp = 0;
    piggyState.maxHp = 0;
    piggyState.reward = 0;
    piggyState.spawnTime = 0;
    piggyState.lifeTime = 0;

    updatePiggySprite();
    updatePiggyHpBar();
  }
}
function updateSurprisePiggyLife() {
  if (!surprisePiggyState.active) return;

  const piggy = document.getElementById("surprise-piggy");
  if (!piggy) return;

  const now = Date.now();

  if (now - surprisePiggyState.spawnTime >= surprisePiggyState.lifeTime) {
    piggy.style.display = "none";

    surprisePiggyState.active = false;
    surprisePiggyState.hp = 0;
    surprisePiggyState.maxHp = 0;
    surprisePiggyState.coinReward = 0;
    surprisePiggyState.gemReward = 0;
    surprisePiggyState.spawnTime = 0;
    surprisePiggyState.lifeTime = 0;

    updateSurprisePiggySprite();
    updateSurprisePiggyHpBar();
  }
}
function updatePiggySprite() {
  const piggy = document.getElementById("piggy");
  if (!piggy) return;

  if (!piggyState.active || piggyState.maxHp <= 0) {
    piggy.src = "match/piggy.png";
    return;
  }

  const hpPercent = (piggyState.hp / piggyState.maxHp) * 100;

  if (hpPercent <= 35) {
    piggy.src = "match/piggy_crack.png";
  } else {
    piggy.src = "match/piggy.png";
  }
}

function updateSurprisePiggySprite() {
  const piggy = document.getElementById("surprise-piggy");
  if (!piggy) return;

  if (!surprisePiggyState.active || surprisePiggyState.maxHp <= 0) {
    piggy.src = "match/surprisePiggy.png";
    return;
  }

  const hpPercent = (surprisePiggyState.hp / surprisePiggyState.maxHp) * 100;

  if (hpPercent <= 35) {
    piggy.src = "match/surprisePiggy_crack.png";
  } else {
    piggy.src = "match/surprisePiggy.png";
  }
}
// =============================================
// ... FLOATING TEXT ...
// =============================================
function spawnFloatingText(text, x, y, type = "xp") {
  const el = document.createElement("div");

  // SUPER CRIT — отдельная логика
  if (text === "SUPER CRIT!") {
    el.className = "floating-xp";
    el.innerHTML = text;
    el.style.color = "#ff00ff";
    el.style.fontSize = "2.5rem";
    el.style.scale = "1.4";
    el.style.textShadow = "0 0 10px #ff00ff";
  } else if (text === "SPECIAL CRIT!") {
    el.className = "floating-xp";
    el.innerHTML = text;
    el.style.color = "#00ffff";
    el.style.fontSize = "2.2rem";
    el.style.scale = "1.3";
    el.style.textShadow = "0 0 10px #00ffff";
  } else if (type === "ultra" || text === "ULTRA CRIT!") {
    el.className = "floating-xp";
    el.innerHTML = text;

    el.style.color = "#ffd700"; // золотой
    el.style.fontSize = "3rem"; // БОЛЬШЕ всех
    el.style.scale = "1.6";
    el.style.fontWeight = "bold";
    el.style.textShadow = `
    0 0 10px #ffd700,
    0 0 20px #ff8c00,
    0 0 30px #ff4500
  `;
  } else if (type === "piggyCoin") {
    el.className = "floating-coin";
    el.innerHTML = text;
    el.style.color = "#ffd700";
    el.style.fontSize = "2.4rem";
    el.style.fontWeight = "bold";
    el.style.textShadow = "0 0 12px #ffd700, 0 0 24px #ffae00";
  } else if (type === "piggyGem") {
    el.className = "floating-xp";
    el.innerHTML = text;
    el.style.color = "#6ee7ff";
    el.style.fontSize = "2.4rem";
    el.style.fontWeight = "bold";
    el.style.textShadow = "0 0 12px #6ee7ff, 0 0 24px #00e5ff";
  } else if (type === "shockwave") {
    el.className = "floating-xp";
    el.innerHTML = text;
    el.style.color = "#ffb347";
    el.style.fontSize = "1.5rem";
    el.style.fontWeight = "bold";
    el.style.textShadow = "0 0 8px #ffb347, 0 0 16px #ff6a00";
  } else if (type === "freeze") {
    el.className = "floating-xp";
    el.innerHTML = text;
    el.style.color = "#ffffff";
    el.style.fontSize = "1.4rem";
    el.style.fontWeight = "bold";
    el.style.textShadow = `
    0 0 6px #bfefff,
    0 0 12px #8fdfff,
    0 0 20px #dff9ff
  `;
  }

  // Монеты
  else if (type === "coin") {
    el.className = "floating-coin";
    el.innerHTML = text + " 🟡";
  }
  // Мидас
  else if (type === "midas") {
    el.className = "floating-coin";
    el.innerHTML = text + " ✨";
    el.style.color = "#ffd700";
    el.style.fontSize = "1.8rem";
    el.style.textShadow = "0 0 10px #ffd700";
  } else if (type === "tele") {
    el.className = "floating-xp";
    el.innerHTML = text;
    el.style.color = "#7ddfff";
    el.style.fontSize = "1.2rem";
    el.style.fontWeight = "bold";
    el.style.textShadow = "0 0 8px #7ddfff, 0 0 16px #3aa7ff";
  }
  // Время
  else if (type === "time") {
    el.className = "floating-xp";
    el.innerHTML = text + " ⏱";
    el.style.color = "#135713";
    el.style.fontSize = "1.6rem";
  }
  // XP / крит
  else {
    el.className = "floating-xp";
    el.innerHTML = text + " 🔹";

    if (type === "crit") {
      el.style.color = "#e74c3c";
      el.style.fontSize = "2rem";
      el.style.scale = "1.2";
    }
  }

  el.style.left = x - 20 + "px";
  el.style.top = y - 20 + "px";

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// =============================================
// DATA & UPGRADES & NODES
// =============================================

let data = {
  xp: 0,
  coins: 0,
  gems: 0,
  lvls: {
    click: 1,
    friend: 0,
    footy: 0,
    fCrit: 0,
    fCoin: 0,
    crit: 0,
    cCoin: 0,
    delay: 0,
    time: 0,
    viewer: 0,
    friendPower: 0,
    vStand: 0,
    fSec: 0,
    fan: 0,
    attr: 0,
    drink: 0,
    midas: 0,
    midasCrit: 0,
    reward: 0,
    bigReward: 0,
    specialCrit: 0,
    equip: 0,
    timeCoin: 0,
    coach: 0,
    reaction: 0,
    multiBall: 0,
    goldBall: 0,
    fireBall: 0,
    specialReaction: 0,
    crystalBall: 0,
    synergy: 0,
    piggy: 0,
    surprisePiggy: 0,
    personalReward: 0,
    adCampaign: 0,
    crystalTime: 0,
    vip: 0,
    reflex: 0,
    telekinesis: 0,
    clone: 0,
    shockwave: 0,
    freezing: 0,
    freezingTime: 0,
    competition: 0,
  },
  max: {
    click: 10,
    friend: 5,
    footy: 5,
    fCrit: 3,
    fCoin: 3,
    crit: 3,
    cCoin: 3,
    delay: 3,
    time: 3,
    viewer: 5,
    friendPower: 3,
    vStand: 5,
    fSec: 5,
    fan: 5,
    attr: 3,
    drink: 3,
    midas: 3,
    midasCrit: 3,
    reward: 5,
    bigReward: 3,
    specialCrit: 3,
    equip: 3,
    timeCoin: 3,
    coach: 3,
    reaction: 3,
    multiBall: 3,
    goldBall: 3,
    fireBall: 3,
    specialReaction: 3,
    crystalBall: 3,
    synergy: 3,
    piggy: 3,
    surprisePiggy: 3,
    personalReward: 3,
    adCampaign: 3,
    crystalTime: 3,
    vip: 3,
    reflex: 5,
    telekinesis: 3,
    clone: 3,
    shockwave: 3,
    freezing: 3,
    freezingTime: 3,
    competition: 1,
  },

  costs: {
    click: 10,
    friend: 20,
    footy: 20,
    fCrit: 120,
    fCoin: 400,
    crit: 100,
    cCoin: 500,
    delay: 150,
    time: 50,
    viewer: 150,
    friendPower: 10,
    vStand: 30,
    fSec: 150,
    fan: 1200,
    attr: 100,
    drink: 80,
    midas: 50,
    midasCrit: 200,
    reward: 50,
    bigReward: 100,
    specialCrit: 50,
    equip: 10,
    timeCoin: 300,
    coach: 40,
    reaction: 200,
    multiBall: 300,
    goldBall: 50,
    fireBall: 600,
    specialReaction: 2000,
    crystalBall: 150,
    synergy: 200,
    piggy: 50,
    surprisePiggy: 100,
    personalReward: 150,
    adCampaign: 50,
    crystalTime: 100,
    vip: 150,
    reflex: 1000,
    telekinesis: 200,
    clone: 400,
    shockwave: 100,
    freezing: 100,
    freezingTime: 200,
    competition: 10000,
  },
};
const extraCosts = {
  competition: 100000,
};
const reflexCosts = [1000, 3000, 9000, 20000, 50000];

const nodeData = [
  {
    id: "node-click",
    k: "click",
    name: "СИЛА УДАРА",
    cur: "xp",
    desc: "Увеличивает количество 🔹 за клик",
  },
  {
    id: "node-friend",
    k: "friend",
    name: "ДРУГ",
    cur: "xp",
    desc: "Автоматически приносит +1🔹 каждые 1с",
  },
  {
    id: "node-footy",
    k: "footy",
    name: "ФУТБОЛИСТ",
    cur: "coin",
    desc: "Автоматически приносит +4🔹 каждые 1с",
  },
  {
    id: "node-coach",
    k: "coach",
    name: "ТРЕНЕР",
    cur: "coin",
    desc: "Каждый футболист получает +2/4/6🔹 к силе удара",
  },
  {
    id: "node-fCrit",
    k: "fCrit",
    name: "КРИТ ДРУГА",
    cur: "xp",
    desc: "Шанс друга нанести удар x3 🔹",
  },
  {
    id: "node-fCoin",
    k: "fCoin",
    name: "МОНЕТА ДРУГА",
    cur: "xp",
    desc: "Шанс друга получить 🟡 при крите",
  },
  {
    id: "node-delay",
    k: "delay",
    name: "ЗАТЯЖКА",
    cur: "xp",
    desc: "Шанс получить доп. 1 секунду",
  },
  {
    id: "node-time",
    k: "time",
    name: "ВРЕМЯ",
    cur: "coin",
    desc: "Увеличивает таймер на 1 секунду",
  },
  {
    id: "node-crit",
    k: "crit",
    name: "ШАНС КРИТА",
    cur: "xp",
    desc: "Шанс нанести удар x3 🔹",
  },
  {
    id: "node-cCoin",
    k: "cCoin",
    name: "КРИТ-МОНЕТА",
    cur: "xp",
    desc: "Шанс получить 🟡 при крите",
  },
  {
    id: "node-midas",
    k: "midas",
    name: "УДАР МИДАСА",
    cur: "coin",
    desc: "Шанс получить 🟡 за клик",
  },
  {
    id: "node-specialCrit",
    k: "specialCrit",
    name: "ОСОБЫЙ КРИТ",
    cur: "coin",
    desc: "Шанс нанести крит по особым мячам",
  },
  {
    id: "node-midasCrit",
    k: "midasCrit",
    name: "БОГАТСТВО МИДАСА",
    cur: "coin",
    desc: "Увеличивает количество монет от Мидаса на 1, 2 и 3🟡",
  },
  {
    id: "node-viewer",
    k: "viewer",
    name: "ЗРИТЕЛЬ",
    cur: "xp",
    desc: "30% шанс, что на игру придёт зритель и принесёт доход - 2🟡",
  },
  {
    id: "node-v-stand",
    k: "vStand",
    name: "ТРИБУНА",
    cur: "coin",
    desc: "Зрителей +10",
  },
  {
    id: "node-adCampaign",
    k: "adCampaign",
    name: "РЕКЛАМА",
    cur: "coin",
    desc: "Повышает шанс прихода зрителей на 10/20/30%",
  },
  {
    id: "node-f-sec",
    k: "fSec",
    name: "ФАН-СЕКТОР",
    cur: "coin",
    desc: "Фанатов +10",
  },
  {
    id: "node-vip",
    k: "vip",
    name: "VIP ЛОЖА",
    cur: "coin",
    desc: "Шанс 30/60/90%, что придёт VIP-фанат и принесёт 3💎",
  },
  {
    id: "node-timeCoin",
    k: "timeCoin",
    name: "ВРЕМЯ - ДЕНЬГИ",
    cur: "xp",
    desc: "Даёт +1🟡 за каждую секунду от 'Затяжки'",
  },
  {
    id: "node-crystalTime",
    k: "crystalTime",
    name: "КРИСТАЛЬНОЕ ВРЕМЯ",
    cur: "coin",
    desc: "Даёт 💎 за каждую секунду матча: с 18 / 17 / 16 секунды",
  },

  {
    id: "node-friendPower",
    k: "friendPower",
    name: "СОСИСКИ",
    cur: "coin",
    desc: "Покормите друга и увеличте его силу удара на +2, +4, +6🔹",
  },
  {
    id: "node-fan",
    k: "fan",
    name: "ФАНАТ",
    cur: "xp",
    desc: "Ходит на каждую игру и приносит доход 2🟡",
  },
  {
    id: "node-drink",
    k: "drink",
    name: "НАПИТКИ",
    cur: "coin",
    desc: "Шанс 30/60/90%, что каждый зритель купит напиток (+1🟡)",
  },
  {
    id: "node-attr",
    k: "attr",
    name: "АТРИБУТИКА",
    cur: "coin",
    desc: "Шанс 10/20/30%, что каждый фанат купит шарф (+3🟡)",
  },
  {
    id: "node-reward",
    k: "reward",
    name: "НАГРАДА",
    cur: "coin",
    desc: "Даёт 3 бонусные монеты за каждые заработаные 900, 800, 700, 600, 500 XP",
  },
  {
    id: "node-bigReward",
    k: "bigReward",
    name: "БОЛЬШОЙ КУШ",
    cur: "coin",
    desc: "Усиливает навык 'Награды' на 2, 4 и 6 монет",
  },
  {
    id: "node-equip",
    k: "equip",
    name: "ЭКИПИРОВКА",
    cur: "coin", // будет покупаться за монеты, так как это снаряжение
    desc: "Увеличивает базовую силу удара на +2, +3, +5",
  },
  {
    id: "node-reaction",
    k: "reaction",
    name: "РЕАКЦИЯ",
    cur: "xp",
    desc: "Мяч дольше остаётся на месте (+0.25с)",
  },
  {
    id: "node-multiBall",
    k: "multiBall",
    name: "БОЛЬШЕ МЯЧЕЙ",
    cur: "xp",
    desc: "На поле появляется больше мячей",
  },
  {
    id: "node-piggy",
    k: "piggy",
    name: "СВИНКА-КОПИЛКА",
    cur: "coin",
    desc: "Шанс 1%,2%,3% появления копилки, которую нужно разбить для получения монет. С каждым уровнем копилка становится крепче, но и награда растёт",
  },
  {
    id: "node-surprisePiggy",
    k: "surprisePiggy",
    name: "КОПИЛКА С СЮРПРИЗОМ",
    cur: "coin",
    desc: "Шанс 0.5%, 1%, 1.5% появления копилки с особой наградой. С каждым уровнем копилка становится крепче, но и награда растёт",
  },
  {
    id: "node-shockwave",
    k: "shockwave",
    name: "ВЗРЫВНАЯ ВОЛНА",
    cur: "coin",
    desc: "После того, как свинка-копилка разбита, появляется волна, которая ударяет по соседним объектам, нанося им урон",
  },

  {
    id: "node-specialReaction",
    k: "specialReaction",
    name: "ОСОБАЯ РЕАКЦИЯ",
    cur: "xp",
    desc: "Увеличивает время жизни только доп. мячей (+0.25с)",
  },
  {
    id: "node-freezing",
    k: "freezing",
    name: "МОРОЗНОЕ КОСАНИЕ",
    cur: "coin",
    desc: "Шанс заморозить объект и увеличить время его жизни (+0.25с)",
  },
  {
    id: "node-freezingTime",
    k: "freezingTime",
    name: "СИЛЬНЫЙ МОРОЗ",
    cur: "coin",
    desc: "Увеличивает время заморозки объектов на 0.25с, 0.5с и 0.75с",
  },
  {
    id: "node-goldBall",
    k: "goldBall",
    name: "ЗОЛОТОЙ МЯЧ",
    cur: "coin",
    desc: "Шанс, что на поле появится золотой мяч, каждый удар по которому даёт 🟡",
  },
  {
    id: "node-fireBall",
    k: "fireBall",
    name: "ОГНЕННЫЙ МЯЧ",
    cur: "xp",
    desc: "Шанс, что на поле появится огненный мяч, каждый удар по которому - критический x3",
  },
  {
    id: "node-crystalBall",
    k: "crystalBall",
    name: "КРИСТАЛЬНЫЙ МЯЧ",
    cur: "coin",
    desc: "Шанс, что на поле появится кристальный мяч, каждый удар по которому даёт 💎",
  },
  {
    id: "node-synergy",
    k: "synergy",
    name: "СИНЕРГИЯ",
    cur: "coin",
    desc: "Шанс на появление специального мяча, который даёт (XP x3 + 🟡 + 💎)",
  },
  {
    id: "node-reflex",
    k: "reflex",
    name: "УСЛОВНЫЙ РЕФЛЕКС",
    cur: "xp",
    desc: "Автоклик с интервалом 0.30 / 0.25 / 0.20 / 0.15 / 0.10 секунды",
  },
  {
    id: "node-telekinesis",
    k: "telekinesis",
    name: "ТЕЛЕКИНЕЗ",
    cur: "coin",
    desc: "10%,20%,30% шанс, ударить по соседнему объекту при ударе.",
  },
  {
    id: "node-clone",
    k: "clone",
    name: "КЛОН",
    cur: "coin",
    desc: "1%,2%,3% шанс создать клон объекта при ударе, который повторяет все его свойства",
  },
  {
    id: "node-personalReward",
    k: "personalReward",
    name: "ИНД. НАГРАДА",
    cur: "coin",
    desc: "Даёт 💎 за личный XP: 1500 / 1250 / 1000",
  },

  {
    id: "node-competition",
    k: "competition",
    name: "СОСТЯЗАНИЕ",
    cur: "multi",
    desc: "Открывает режим состязаний",
  },
];

// 1. Храним текущие настройки игрока
// 1. В объекте теперь храним НАЗВАНИЕ цвета, а не код
let playerSettings = {
  name: "PLAYER",
  country: "ru",
  head: 1,
  shirtColor: "white",
  shortsColor: "white",
  socksColor: "white",
};

const MAX_HEADS = 18;

const AVAILABLE_FLAGS = [
  "ar", // Аргентина (первая)

  "al",
  "am",
  "be",
  "bg",
  "br",
  "by",
  "cm",
  "co",
  "cr",
  "cz",
  "de",
  "dk",
  "eng",
  "es",
  "fr",
  "ge",
  "hr",
  "it",
  "jp",
  "kz",
  "lt",
  "lv",
  "ma",
  "mx",
  "nl",
  "pl",
  "pt",
  "rs",
  "ru",
  "sn",
  "tr",
  "ua",
  "us",
  "uy",
  "uz",
];

let currentFlagIndex = 0;
playerSettings.country = AVAILABLE_FLAGS[0];

function normalizePlayerName(name) {
  const cleanName = (name || "").trim().replace(/\s+/g, " ");

  if (!cleanName) return "PLAYER";

  return cleanName.slice(0, 16).toUpperCase();
}

window.onload = function () {
  playMusic("menu");
  renderPlayerPreview();
  updatePlayerCard();
  initPlayerNameInput();
  initFlagControls();
};
function updatePlayerCardName() {
  const nameEl = document.getElementById("player-card-name");
  if (!nameEl) return;

  nameEl.innerText = normalizePlayerName(playerSettings.name);
}
function renderFlagPreview() {
  const flagImg = document.getElementById("selected-flag-preview");
  const flagCode = document.getElementById("selected-flag-code");

  if (flagImg) {
    flagImg.src = `flags/${playerSettings.country}.png`;
  }

  if (flagCode) {
    flagCode.innerText = playerSettings.country.toUpperCase();
  }
}

function changeFlag(step) {
  currentFlagIndex += step;

  if (currentFlagIndex >= AVAILABLE_FLAGS.length) currentFlagIndex = 0;
  if (currentFlagIndex < 0) currentFlagIndex = AVAILABLE_FLAGS.length - 1;

  playerSettings.country = AVAILABLE_FLAGS[currentFlagIndex];

  renderFlagPreview();
  updatePlayerFlag();
}
function initFlagControls() {
  const flagButtons = document.querySelectorAll(".js-change-flag");

  flagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.step);
      changeFlag(step);
    });
  });

  renderFlagPreview();
}

function renderPlayerCardPreview() {
  const headEl = document.getElementById("card-head");
  const shirtEl = document.getElementById("card-shirt");

  if (!headEl || !shirtEl) return;

  headEl.style.backgroundImage = `url('players/head${playerSettings.head}.png')`;
  shirtEl.style.backgroundImage = `url('players/shirt_${playerSettings.shirtColor}.png')`;
}

function calculateOVR() {
  const lvls = data?.lvls || {};

  const equipBonuses = [0, 2, 5, 10];
  const clickPower = (lvls.click || 0) + (equipBonuses[lvls.equip || 0] || 0);

  const coachBonusPerPlayer = (lvls.coach || 0) * 2;
  const footyTotal = (lvls.footy || 0) * (4 + coachBonusPerPlayer);
  const friendBase = lvls.friend || 0;
  const friendBonus = (lvls.friendPower || 0) * 2;
  const teamVal = friendBase + friendBonus + footyTotal;

  const critLevel = lvls.crit || 0;
  const reactionLevel = lvls.reaction || 0;
  const specialReactionLevel = lvls.specialReaction || 0;
  const reflexLevel = lvls.reflex || 0;

  let ovr =
    clickPower +
    Math.floor(teamVal / 3) +
    critLevel * 4 +
    reactionLevel * 3 +
    specialReactionLevel * 3 +
    reflexLevel * 5;

  // ⭐ бонусы за перки
  if ((lvls.fCrit || 0) === 3) {
    ovr += 1;
  }

  if ((lvls.specialCrit || 0) === 3) {
    ovr += 1;
  }
  if ((lvls.delay || 0) === 3) {
    ovr += 1;
  }

  return Math.floor(ovr);
}

function updatePlayerCardOVR() {
  const ovrEl = document.getElementById("card-ovr");
  if (!ovrEl) return;

  const ovr = calculateOVR();
  ovrEl.innerText = ovr;
  updateCardStyle(ovr);
}
function getCardTier(ovr) {
  if (ovr >= 95) return "diamond";
  if (ovr >= 90) return "platinum";
  if (ovr >= 75) return "gold";
  if (ovr >= 66) return "silver";
  if (ovr >= 50) return "bronze";
  return "base";
}
function updateCardStyle(ovr) {
  const card = document.getElementById("menu-player-card");
  if (!card) return;

  const tier = getCardTier(ovr);

  // удалить старые классы
  card.classList.remove(
    "card-base",
    "card-bronze",
    "card-silver",
    "card-gold",
    "card-platinum",
    "card-diamond",
  );

  // добавить новый
  card.classList.add("card-" + tier);
}

function updatePlayerFlag() {
  const flagEl = document.getElementById("card-flag");
  if (!flagEl) return;

  flagEl.src = `flags/${playerSettings.country}.png`;
}

function updatePlayerCardStats() {
  const clickStat = document.getElementById("card-stat-click");
  const critStat = document.getElementById("card-stat-crit");
  const teamStat = document.getElementById("card-stat-team");
  const reactionStat = document.getElementById("card-stat-reaction");
  const specialReactionStat = document.getElementById(
    "card-stat-special-reaction",
  );
  const reflexStat = document.getElementById("card-stat-reflex");

  const lvls = data?.lvls || {};

  const equipBonuses = [0, 2, 5, 10];
  const damageVal = (lvls.click || 0) + (equipBonuses[lvls.equip || 0] || 0);

  const critVal = (lvls.crit || 0) * 3;

  const coachBonusPerPlayer = (lvls.coach || 0) * 2;
  const footyTotal = (lvls.footy || 0) * (4 + coachBonusPerPlayer);
  const friendBase = lvls.friend || 0;
  const friendBonus = (lvls.friendPower || 0) * 2;
  const teamVal = friendBase + friendBonus + footyTotal;

  const reactionVal = (0.75 + (lvls.reaction || 0) * 0.25).toFixed(2) + "с";
  const specialReactionVal =
    (0.75 + (lvls.specialReaction || 0) * 0.25).toFixed(2) + "с";

  let reflexVal = "0";
  if ((lvls.reflex || 0) > 0) {
    const reflexMs = getReflexInterval();
    reflexVal = (reflexMs / 1000).toFixed(2) + "с";
  }

  if (clickStat) clickStat.innerText = damageVal;
  if (critStat) critStat.innerText = `${critVal}%`;
  if (teamStat) teamStat.innerText = teamVal;
  if (reactionStat) reactionStat.innerText = reactionVal;
  if (specialReactionStat) specialReactionStat.innerText = specialReactionVal;
  if (reflexStat) reflexStat.innerText = reflexVal;
}

function updatePlayerCard() {
  updatePlayerCardName();
  renderPlayerCardPreview();
  updatePlayerCardStats();
  updatePlayerCardOVR();
  updatePlayerFlag();
}
function initPlayerNameInput() {
  const input = document.getElementById("player-name-input");
  if (!input) return;

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\n/g, "");
    updatePlayerName();
    updatePlayerCardName();
  });
}

function updatePlayerName() {
  const input = document.getElementById("player-name-input");
  if (!input) return;

  playerSettings.name = normalizePlayerName(input.value);
}

function renderPlayerPreview() {
  const box = document.getElementById("player-preview");
  if (!box) return;

  box.innerHTML = `
    <div class="player-part p-socks" style="background-image: url('players/socks_${playerSettings.socksColor}.png');"></div>
    <div class="player-part p-shorts" style="background-image: url('players/shorts_${playerSettings.shortsColor}.png');"></div>
    <div class="player-part p-shirt" style="background-image: url('players/shirt_${playerSettings.shirtColor}.png');"></div>
    <div class="player-part p-head" style="background-image: url('players/head${playerSettings.head}.png');"></div>
  `;

  renderPlayerCardPreview();
}

function addRes(type, amt) {
  // Проверяем, существует ли объект data, чтобы не было ошибок
  if (typeof data !== "undefined") {
    data[type] += amt;

    // Обновляем текст на экране (золото, опыт и т.д.)
    if (typeof updateUI === "function") {
      updateUI();
    }
  } else {
    console.error(
      "Объект 'data' не найден! Проверь, как он объявлен в начале скрипта.",
    );
  }
}
function updatePartColor(part, colorName) {
  // part может быть 'shirtColor', 'shortsColor' или 'socksColor'
  playerSettings[part] = colorName;
  renderPlayerPreview();
}

// 2. Функция для стрелочек
function changeHead(step) {
  playerSettings.head += step;
  if (playerSettings.head > MAX_HEADS) playerSettings.head = 1;
  if (playerSettings.head < 1) playerSettings.head = MAX_HEADS;
  renderPlayerPreview();
}

// 4. ГЛАВНАЯ КНОПКА: Сохранить и перейти в игру
function savePlayerAndStart() {
  const customScreen = document.getElementById("custom-screen");
  const menuScreen = document.getElementById("menu-screen");
  const adminUI = document.getElementById("admin-ui");

  updatePlayerName();

  if (customScreen) customScreen.classList.remove("active");
  if (adminUI) adminUI.style.display = "flex";
  if (menuScreen) menuScreen.classList.add("active");

  updatePlayerCard();

  createVisualPlayer(
    32,
    73,
    playerSettings.head,
    playerSettings.shirtColor,
    playerSettings.shortsColor,
    playerSettings.socksColor,
  );
}

// 5. Отрисовка игрока на поле
function createVisualPlayer(
  percentX,
  percentY,
  headNum,
  sShirt,
  sShorts,
  sSocks,
) {
  const field = document.getElementById("game-screen");
  if (!field) return;

  const player = document.createElement("div");
  player.className = "player-container";
  player.style.left = percentX + "%";
  player.style.top = percentY + "%";
  player.style.position = "absolute";

  player.innerHTML = `
        <div class="player-part p-socks" style="background-image: url('players/socks_${sSocks}.png');"></div>
        <div class="player-part p-shorts" style="background-image: url('players/shorts_${sShorts}.png');"></div>
        <div class="player-part p-shirt" style="background-image: url('players/shirt_${sShirt}.png');"></div>
        <div class="player-part p-head" style="background-image: url('players/head${headNum}.png');"></div>
    `;

  field.appendChild(player);
}

// Твой код для дерева навыков ниже (оставил без изменений)
function initTree() {
  const tree = document.getElementById("tree");
  if (!tree) return;
  nodeData.forEach((n) => {
    const div = document.createElement("div");
    div.id = n.id;
    div.className = "skill-node";
    div.title = n.desc;
    div.onclick = () => buy(n.k, n.cur);
    div.innerHTML = `<small>${n.name}</small><span id="lvl-${n.k}">0/0</span><b class="price-${n.cur}" id="c-${n.k}">0</b>`;
    tree.appendChild(div);
  });
}

function updateUI() {
  document.getElementById("total-xp").innerText = Math.floor(data.xp);
  document.getElementById("total-coins").innerText = Math.floor(data.coins);
  document.getElementById("total-gems").innerText = Math.floor(data.gems || 0);

  if (typeof updatePlayerCardStats === "function") {
    updatePlayerCardStats();
  }

  if (typeof updatePlayerCard === "function") {
    updatePlayerCard();
  }

  nodeData.forEach((n) => {
    const el = document.getElementById(n.id);
    const isMax = data.lvls[n.k] >= data.max[n.k];
    let canSee = false;

    // ЛОГИКА ВИДИМОСТИ
    if (n.k === "click") canSee = true;

    // От Силы удара
    if (n.k === "friend" || n.k === "reaction" || n.k === "crit") {
      canSee = data.lvls.click >= 2;
    }

    // Левая ветка друга
    if (n.k === "fCrit" || n.k === "viewer") canSee = data.lvls.friend >= 1;
    if (n.k === "fCoin" || n.k === "friendPower") canSee = data.lvls.fCrit >= 1;

    // Ветка зрителей
    if (n.k === "vStand" || n.k === "fan") canSee = data.lvls.viewer >= 1;
    if (n.k === "adCampaign") canSee = data.lvls.vStand >= 1;
    if (n.k === "attr" || n.k === "drink" || n.k === "fSec")
      canSee = data.lvls.fan >= 1;
    if (n.k === "vip") canSee = data.lvls.fSec >= 1;

    // Правая верхняя ветка от Реакции
    if (n.k === "reflex" || n.k === "delay" || n.k === "multiBall")
      canSee = data.lvls.reaction >= 1;

    if (n.k === "footy") canSee = data.lvls.equip >= 1;

    if (n.k === "time") canSee = data.lvls.delay >= 1;
    if (n.k === "timeCoin") canSee = data.lvls.delay >= 1;
    if (n.k === "crystalTime") canSee = data.lvls.time >= 1;

    // Правая ветка профессии
    if (n.k === "reward" || n.k === "coach") canSee = data.lvls.footy >= 1;

    if (n.k === "bigReward" || n.k === "personalReward")
      canSee = data.lvls.reward >= 1;
    if (n.k === "telekinesis") canSee = data.lvls.reflex >= 1;
    if (n.k === "clone") canSee = data.lvls.telekinesis >= 1;
    if (n.k === "competition") canSee = data.lvls.personalReward >= 1;

    // Нижняя ветка критов
    if (n.k === "cCoin") canSee = data.lvls.crit >= 1;
    if (n.k === "midas") canSee = data.lvls.cCoin >= 1;

    // Ветка Мидаса
    if (n.k === "midasCrit") canSee = data.lvls.midas >= 1;

    // Новая ветка мячей
    if (n.k === "specialReaction" || n.k === "fireBall" || n.k === "equip")
      canSee = data.lvls.multiBall >= 1;

    if (n.k === "specialCrit" || n.k === "freezing")
      canSee = data.lvls.specialReaction >= 1;
    if (n.k === "freezingTime") canSee = data.lvls.freezing >= 1;

    if (n.k === "goldBall" || n.k === "piggy") canSee = data.lvls.fireBall >= 1;
    if (n.k === "surprisePiggy" || n.k === "shockwave")
      canSee = data.lvls.piggy >= 1;

    if (n.k === "crystalBall") canSee = data.lvls.goldBall >= 1;

    if (n.k === "synergy") canSee = data.lvls.crystalBall >= 1;

    if (canSee) el.classList.add("visible");
    el.classList.toggle("maxed", isMax);
    document.getElementById(`lvl-${n.k}`).innerText = isMax
      ? "MAX"
      : `${data.lvls[n.k]}/${data.max[n.k]}`;

    let icon = n.cur === "xp" ? "🔹" : "🟡";
    document.getElementById(`c-${n.k}`).innerHTML = isMax
      ? "✓"
      : n.k === "competition"
        ? `🟡 10k<br>🔹100k`
        : `${icon} ${data.costs[n.k]}`;

    if (!isMax) {
      let afford = (n.cur === "xp" ? data.xp : data.coins) >= data.costs[n.k];
      el.classList.toggle("disabled", !afford);
    }
  });
  updateLiveStats();
  updatePlayerCardStats();
}
function centerTreeOnClickNode() {
  const viewport = document.getElementById("tree-viewport");
  const clickNode = document.getElementById("node-click");

  if (!viewport || !clickNode) return;

  const targetLeft =
    clickNode.offsetLeft - viewport.clientWidth / 2 + clickNode.offsetWidth / 2;
  const targetTop =
    clickNode.offsetTop -
    viewport.clientHeight / 2 +
    clickNode.offsetHeight / 2;

  viewport.scrollLeft = Math.max(0, targetLeft);
  viewport.scrollTop = Math.max(0, targetTop);
}

function buy(type, cur) {
  // 1. Проверка на макс. уровень
  if (data.lvls[type] >= data.max[type]) return;

  if (type === "competition") {
    const costCoin = 10000;
    const costXP = 100000;

    if (data.coins >= costCoin && data.xp >= costXP) {
      data.coins -= costCoin;
      data.xp -= costXP;
      data.lvls[type]++;
      updateUI();

      // Всплывающее окно
      alert(
        "🏆 СОСТЯЗАНИЯ ОТКРЫТЫ!\n\n" +
          "Вы открыли режим состязаний.\n" +
          "Теперь вам доступны новые испытания и новые способы прогресса.",
      );
    } else {
      alert(
        `Чтобы открыть состязания, нужно накопить:\n🟡 ${costCoin} монет и 🔹 ${costXP} опыта!`,
      );
    }
    return;
    // Выходим из функции
  }

  // 3. Стандартная логика для остальных навыков
  let currencyKey = cur === "xp" ? "xp" : "coins";

  if (data[currencyKey] >= data.costs[type]) {
    data[currencyKey] -= data.costs[type];
    data.lvls[type]++;

    // Особый рост цены для Реакции
    if (type === "reaction") {
      if (data.lvls[type] === 1) {
        data.costs[type] = 1000;
      } else if (data.lvls[type] === 2) {
        data.costs[type] = 5000;
      }
    }
    // Особая цена для Рефлекса
    else if (type === "reflex") {
      const nextIndex = data.lvls[type];
      if (nextIndex < reflexCosts.length) {
        data.costs[type] = reflexCosts[nextIndex];
      }
    } else {
      data.costs[type] = Math.ceil(data.costs[type] * 1.8);
    }

    updateUI();
    updateKiosks();

    if (
      type === "multiBall" &&
      document.getElementById("game-screen").classList.contains("active")
    ) {
      updateMultiBalls();
    }
  }
}

let gInt,
  aInt,
  ballMoveInterval,
  extraBallLifeInterval,
  extraBallSpawnInterval,
  curMs,
  totalEl,
  sCoins,
  sGems,
  sClick,
  sFriend,
  sFooty,
  xpForCoin,
  personalXpForGem,
  sSpecialCritXP,
  sBallXP,
  sBallCoins,
  sBallGems,
  sLuckCoins,
  sPiggyCoins,
  sPiggyGems,
  sFireXP,
  sComboXP,
  sGoldCoins,
  sComboCoins,
  sCrystalGems,
  sComboGems,
  sTeleXP,
  sTeleCoins,
  sTeleGems,
  sPersonalRewardGems,
  sRewardCoins,
  sMidasCoins,
  sVipGems,
  sCrystalTimeGems,
  actualViewerCount;
let extraBalls = [];
let clonePiggies = [];
let cloneSurprisePiggies = [];
let currentMainBallIndex = -1;
let currentExtraBallIndexes = [];
let mainBallMoveTimeout;
let mainBallMoveDelay = 0;
let mainBallMoveStartedAt = 0;

let cloneLifeInterval;
let piggySpawnInterval;
let piggyLifeInterval;
let reflexInterval;
let mouseX = 0;
let mouseY = 0;
let shockwaveTimeouts = [];
let piggyState = {
  active: false,
  hp: 0,
  maxHp: 0,
  reward: 0,
  spawnTime: 0,
  lifeTime: 0,
};
let surprisePiggySpawnInterval;
let surprisePiggyLifeInterval;
let surprisePiggyState = {
  active: false,
  hp: 0,
  maxHp: 0,
  coinReward: 0,
  gemReward: 0,
  spawnTime: 0,
  lifeTime: 0,
};

function getReflexInterval() {
  return [0, 300, 250, 200, 150, 100][data.lvls.reflex || 0] || 0;
}

function getShockwaveHits() {
  return [0, 1, 2, 3][data.lvls.shockwave || 0] || 0;
}
function clearShockwaveTimeouts() {
  shockwaveTimeouts.forEach((id) => clearTimeout(id));
  shockwaveTimeouts = [];
}
function getShockwaveTargets(excludedElement = null) {
  const targets = [];

  const mainBall = document.getElementById("ball");
  if (mainBall && excludedElement !== mainBall) {
    targets.push(mainBall);
  }

  extraBalls.forEach((ball) => {
    if (ball && ball.style.display === "block" && excludedElement !== ball) {
      targets.push(ball);
    }
  });

  const piggy = document.getElementById("piggy");
  if (
    piggyState.active &&
    piggy &&
    piggy.style.display !== "none" &&
    excludedElement !== piggy
  ) {
    targets.push(piggy);
  }

  const surprisePiggy = document.getElementById("surprise-piggy");
  if (
    surprisePiggyState.active &&
    surprisePiggy &&
    surprisePiggy.style.display !== "none" &&
    excludedElement !== surprisePiggy
  ) {
    targets.push(surprisePiggy);
  }

  return targets;
}
function getCloneChance() {
  return [0, 1, 2, 3][data.lvls.clone || 0] || 0;
}

function getTelekinesisChance() {
  return [0, 10, 20, 30][data.lvls.telekinesis || 0] || 0;
}
function getTelekinesisTargets(excludedElement = null) {
  const targets = [];

  const mainBall = document.getElementById("ball");
  if (mainBall && excludedElement !== mainBall) {
    targets.push(mainBall);
  }

  extraBalls.forEach((ball) => {
    if (ball && ball.style.display === "block" && excludedElement !== ball) {
      targets.push(ball);
    }
  });

  const piggy = document.getElementById("piggy");
  if (
    piggyState.active &&
    piggy &&
    piggy.style.display !== "none" &&
    excludedElement !== piggy
  ) {
    targets.push(piggy);
  }

  const surprisePiggy = document.getElementById("surprise-piggy");
  if (
    surprisePiggyState.active &&
    surprisePiggy &&
    surprisePiggy.style.display !== "none" &&
    excludedElement !== surprisePiggy
  ) {
    targets.push(surprisePiggy);
  }

  return targets;
}
function refreshMatchRuntimeUI() {
  const scoreEl = document.getElementById("current-score");
  const coinsEl = document.getElementById("game-coins");
  let totalNow = sClick + sFriend + sFooty;

  if (scoreEl) scoreEl.innerText = Math.floor(totalNow);
  if (coinsEl) coinsEl.innerText = `🟡 ${Math.floor(sCoins)}`;
}

function getAutoClickTarget() {
  if (!mouseX && !mouseY) return null;

  const el = document.elementFromPoint(mouseX, mouseY);
  if (!el) return null;

  if (
    el.id === "ball" ||
    el.id === "piggy" ||
    el.id === "surprise-piggy" ||
    el.classList.contains("extra-ball") ||
    el.classList.contains("clone-piggy") ||
    el.classList.contains("clone-surprise-piggy")
  ) {
    return el;
  }

  return null;
}
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return Promise.resolve();

  const silentSounds = [];

  menuPlaylist.forEach((track) => {
    track.muted = true;
    track.currentTime = 0;
    silentSounds.push(
      track
        .play()
        .then(() => {
          track.pause();
          track.currentTime = 0;
          track.muted = false;
        })
        .catch(() => {
          track.muted = false;
        }),
    );
  });

  music.game.muted = true;
  music.game.currentTime = 0;
  silentSounds.push(
    music.game
      .play()
      .then(() => {
        music.game.pause();
        music.game.currentTime = 0;
        music.game.muted = false;
      })
      .catch(() => {
        music.game.muted = false;
      }),
  );

  audioUnlocked = true;
  return Promise.allSettled(silentSounds);
}

function showMenuAfterBoot() {
  const bootScreen = document.getElementById("boot-screen");
  const menuScreen = document.getElementById("menu-screen");

  if (bootScreen) {
    bootScreen.classList.remove("active");
  }

  if (menuScreen) {
    menuScreen.classList.add("active");
  }

  playMusic("menu");
}

function initBootScreen() {
  const bootStartBtn = document.getElementById("boot-start-btn");
  const menuScreen = document.getElementById("menu-screen");

  if (menuScreen) {
    menuScreen.classList.remove("active");
  }

  if (!bootStartBtn) return;

  bootStartBtn.addEventListener("click", async () => {
    await unlockAudio();
    showMenuAfterBoot();
  });
}

document.addEventListener("DOMContentLoaded", initBootScreen);

// =================================
// FREEZING
// ================================

function getFreezingChance() {
  return [0, 1, 2, 3][data.lvls.freezing || 0] || 0;
}
function getFreezingTimeBonus() {
  return [250, 500, 750, 1000][data.lvls.freezingTime || 0] || 250;
}
function applyFreezing(target, event) {
  if (!target) return;
  if ((data.lvls.freezing || 0) <= 0) return;

  const chance = getFreezingChance();
  if (Math.random() * 100 >= chance) return;
  playSound(sounds.freeze, 0.18, false);

  const bonusTime = getFreezingTimeBonus();

  // 🔵 EXTRA BALL (и клоны мячей)
  if (target.classList.contains("extra-ball")) {
    let lifeTime = parseInt(target.dataset.lifeTime || "0", 10);
    if (lifeTime > 0) {
      lifeTime += bonusTime;
      target.dataset.lifeTime = lifeTime.toString();
    }
  }

  // 🔵 ОСНОВНОЙ МЯЧ (опционально)
  if (target.id === "ball") {
    const elapsed = Date.now() - mainBallMoveStartedAt;
    let remaining = mainBallMoveDelay - elapsed;

    if (remaining < 0) remaining = 0;

    remaining += bonusTime;
    scheduleMainBallMove(remaining);
  }

  // 🐷 ОБЫЧНАЯ СВИНКА
  if (target.id === "piggy" && piggyState.active) {
    piggyState.lifeTime += bonusTime;
  }

  // 🐷 SURPRISE
  if (target.id === "surprise-piggy" && surprisePiggyState.active) {
    surprisePiggyState.lifeTime += bonusTime;
  }

  // 🧬 КЛОН СВИНКИ
  if (target.classList.contains("clone-piggy")) {
    let lifeTime = parseInt(target.dataset.lifeTime || "0", 10);
    if (lifeTime > 0) {
      lifeTime += bonusTime;
      target.dataset.lifeTime = lifeTime.toString();
    }
  }

  // 🧬 КЛОН SURPRISE
  if (target.classList.contains("clone-surprise-piggy")) {
    let lifeTime = parseInt(target.dataset.lifeTime || "0", 10);
    if (lifeTime > 0) {
      lifeTime += bonusTime;
      target.dataset.lifeTime = lifeTime.toString();
    }
  }

  // ❄️ ВИЗУАЛ
  const pos = getElementCenter(target);
  if (pos) {
    spawnFloatingText("❄️", pos.x, pos.y - 25, "freeze");
  }

  // ❄️ Лёгкий freeze-эффект
  target.classList.add("freeze-effect");

  setTimeout(() => {
    target.classList.remove("freeze-effect");
  }, 200);
}

function applyTelekinesis(sourceElement, sourceEvent) {
  if ((data.lvls.telekinesis || 0) <= 0) return;

  const chance = getTelekinesisChance();
  if (Math.random() * 100 >= chance) return;

  const targets = getTelekinesisTargets(sourceElement);
  if (targets.length === 0) return;

  const target = targets[Math.floor(Math.random() * targets.length)];
  if (!target) return;

  const targetPos = getElementCenter(target);
  if (!targetPos) return;

  playSound(sounds.telekinesis, 0.2, false);
  playTelekinesisImpact(target);

  const equipBonuses = [0, 2, 5, 10];
  let p = data.lvls.click + (equipBonuses[data.lvls.equip] || 0);

  spawnFloatingText("TELE HIT", targetPos.x, targetPos.y - 25, "tele");

  if (target.id === "piggy" && piggyState.active) {
    piggyState.hp -= p;

    if (piggyState.hp <= 0) {
      const shockwavePos = targetPos;
      sCoins += piggyState.reward;
      sPiggyCoins += piggyState.reward;

      spawnFloatingText("PIGGY BROKEN!", targetPos.x, targetPos.y - 5, "crit");

      setTimeout(() => {
        spawnFloatingText(
          "🟡 +" + piggyState.reward,
          targetPos.x + 20,
          targetPos.y + 20,
          "piggyCoin",
        );
      }, 120);

      target.style.display = "none";

      piggyState.active = false;
      piggyState.hp = 0;
      piggyState.maxHp = 0;
      piggyState.reward = 0;
      piggyState.spawnTime = 0;
      piggyState.lifeTime = 0;

      updatePiggySprite();
      updatePiggyHpBar();

      if (shockwavePos) {
        startShockwave(shockwavePos.x, shockwavePos.y, target);
      }
    } else {
      updatePiggySprite();
      updatePiggyHpBar();

      spawnFloatingText("-" + p, targetPos.x + 10, targetPos.y + 5, "xp");
    }

    const scoreEl = document.getElementById("current-score");
    const coinsEl = document.getElementById("game-coins");
    let totalNow = sClick + sFriend + sFooty;

    if (scoreEl) scoreEl.innerText = Math.floor(totalNow);
    if (coinsEl) coinsEl.innerText = `🟡 ${Math.floor(sCoins)}`;

    return;
  }

  if (target.id === "surprise-piggy" && surprisePiggyState.active) {
    surprisePiggyState.hp -= p;

    if (surprisePiggyState.hp <= 0) {
      const shockwavePos = targetPos;
      sCoins += surprisePiggyState.coinReward;
      sGems += surprisePiggyState.gemReward;

      sPiggyCoins += surprisePiggyState.coinReward;
      sPiggyGems += surprisePiggyState.gemReward;

      spawnFloatingText("SURPRISE!", targetPos.x, targetPos.y - 5, "tele");

      setTimeout(() => {
        spawnFloatingText(
          "🟡 +" + surprisePiggyState.coinReward,
          targetPos.x + 20,
          targetPos.y + 18,
          "piggyCoin",
        );
      }, 120);

      setTimeout(() => {
        spawnFloatingText(
          "💎 +" + surprisePiggyState.gemReward,
          targetPos.x + 35,
          targetPos.y + 38,
          "piggyGem",
        );
      }, 220);

      target.style.display = "none";

      surprisePiggyState.active = false;
      surprisePiggyState.hp = 0;
      surprisePiggyState.maxHp = 0;
      surprisePiggyState.coinReward = 0;
      surprisePiggyState.gemReward = 0;
      surprisePiggyState.spawnTime = 0;
      surprisePiggyState.lifeTime = 0;

      updateSurprisePiggySprite();
      updateSurprisePiggyHpBar();

      if (shockwavePos) {
        startShockwave(shockwavePos.x, shockwavePos.y, target);
      }
    } else {
      updateSurprisePiggySprite();
      updateSurprisePiggyHpBar();

      spawnFloatingText("-" + p, targetPos.x + 10, targetPos.y + 5, "xp");
    }

    const scoreEl = document.getElementById("current-score");
    const coinsEl = document.getElementById("game-coins");
    let totalNow = sClick + sFriend + sFooty;

    if (scoreEl) scoreEl.innerText = Math.floor(totalNow);
    if (coinsEl) coinsEl.innerText = `🟡 ${Math.floor(sCoins)}`;

    return;
  }

  const ballType = target?.dataset?.ballType || "normal";

  if (ballType === "gold") {
    sClick += p;
    sTeleXP += p;

    let amount = 1;
    sCoins += amount;
    sBallCoins += amount;
    sGoldCoins += amount;
    sTeleCoins += amount;
    console.log("TELE GOLD COINS", sTeleCoins);

    spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
    spawnFloatingText("+" + amount, targetPos.x + 28, targetPos.y - 6, "coin");
    return;
  }

  if (ballType === "fire") {
    const oldP = p;
    p *= 3;
    const bonusXP = p - oldP;

    sClick += p;
    sBallXP += bonusXP;
    sFireXP += bonusXP;

    spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
    return;
  }

  if (ballType === "combo") {
    const oldP = p;
    p *= 3;
    const bonusXP = p - oldP;

    sClick += p;
    sBallXP += bonusXP;
    sComboXP += bonusXP;
    sTeleXP += p;

    let amount = 1;
    sCoins += amount;
    sBallCoins += amount;
    sComboCoins += amount;
    sTeleCoins += amount;

    sGems += amount;
    sBallGems += amount;
    sComboGems += amount;
    sTeleGems += amount;

    spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
    spawnFloatingText("+" + amount, targetPos.x + 28, targetPos.y - 6, "coin");
    spawnFloatingText(
      "+" + amount + " 💎",
      targetPos.x + 40,
      targetPos.y + 14,
      "xp",
    );
    return;
  }

  if (ballType === "crystal") {
    sClick += p;
    sTeleXP += p;

    let amount = 1;
    sGems += amount;
    sBallGems += amount;
    sCrystalGems += amount;
    sTeleGems += amount;

    console.log(
      "TELE CRYSTAL GEMS",
      sTeleGems,
      target?.dataset?.ballType,
      target,
    );

    spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
    spawnFloatingText(
      "+" + amount + " 💎",
      targetPos.x + 28,
      targetPos.y - 6,
      "xp",
    );
    return;
  }

  sClick += p;
  sTeleXP += p;

  spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
}

function playShockwaveRing(x, y) {
  playSound(sounds.shockwave, 0.4, false);
  const ring = document.getElementById("shockwave-ring");
  const field = document.getElementById("game-screen");
  if (!ring || !field) return;

  const fieldRect = field.getBoundingClientRect();

  ring.style.left = x - fieldRect.left + "px";
  ring.style.top = y - fieldRect.top + "px";

  ring.classList.remove("active");
  void ring.offsetWidth; // перезапуск анимации
  ring.classList.add("active");
}
function playShockwaveImpact(target) {
  if (!target) return;

  const randomDeg = Math.floor(Math.random() * 360) - 180;
  target.style.setProperty("--angle", randomDeg + "deg");

  target.classList.add("shock-hit");

  if (target.id === "ball") {
    target.style.transform = `rotate(var(--angle, 0deg)) scale(0.88)`;
    setTimeout(() => {
      target.style.transform = `rotate(var(--angle, 0deg)) scale(1)`;
      target.classList.remove("shock-hit");
    }, 120);
    return;
  }

  if (target.classList.contains("extra-ball")) {
    target.style.transform = `translate(-50%, -50%) rotate(var(--angle, 0deg)) scale(0.88)`;
    setTimeout(() => {
      target.style.transform = `translate(-50%, -50%) rotate(var(--angle, 0deg)) scale(1)`;
      target.classList.remove("shock-hit");
    }, 120);
    return;
  }

  if (target.id === "piggy" || target.id === "surprise-piggy") {
    target.style.transform = "translate(-50%, -50%) scale(0.88)";
    setTimeout(() => {
      target.style.transform = "translate(-50%, -50%) scale(1)";
      target.classList.remove("shock-hit");
    }, 120);
    return;
  }

  setTimeout(() => {
    target.classList.remove("shock-hit");
  }, 120);
}

function applyShockwaveHitToTarget(target) {
  if (!target) return;

  const targetPos = getElementCenter(target);
  playShockwaveImpact(target);

  const equipBonuses = [0, 2, 5, 10];
  let p = data.lvls.click + (equipBonuses[data.lvls.equip] || 0);

  if (target.id === "piggy" && piggyState.active) {
    piggyState.hp -= p;

    if (piggyState.hp <= 0) {
      sCoins += piggyState.reward;
      sPiggyCoins += piggyState.reward;

      if (targetPos) {
        spawnFloatingText(
          "PIGGY BROKEN!",
          targetPos.x,
          targetPos.y - 5,
          "crit",
        );

        setTimeout(() => {
          spawnFloatingText(
            "🟡 +" + piggyState.reward,
            targetPos.x + 20,
            targetPos.y + 20,
            "piggyCoin",
          );
        }, 120);
      }

      target.style.display = "none";

      piggyState.active = false;
      piggyState.hp = 0;
      piggyState.maxHp = 0;
      piggyState.reward = 0;
      piggyState.spawnTime = 0;
      piggyState.lifeTime = 0;

      updatePiggySprite();
      updatePiggyHpBar();
    } else {
      updatePiggySprite();
      updatePiggyHpBar();

      if (targetPos) {
        spawnFloatingText("-" + p, targetPos.x + 10, targetPos.y + 5, "xp");
      }
    }

    return;
  }

  if (target.id === "surprise-piggy" && surprisePiggyState.active) {
    surprisePiggyState.hp -= p;

    if (surprisePiggyState.hp <= 0) {
      sCoins += surprisePiggyState.coinReward;
      sGems += surprisePiggyState.gemReward;

      sPiggyCoins += surprisePiggyState.coinReward;
      sPiggyGems += surprisePiggyState.gemReward;

      if (targetPos) {
        spawnFloatingText(
          "SURPRISE!",
          targetPos.x,
          targetPos.y - 5,
          "shockwave",
        );

        setTimeout(() => {
          spawnFloatingText(
            "🟡 +" + surprisePiggyState.coinReward,
            targetPos.x + 20,
            targetPos.y + 18,
            "piggyCoin",
          );
        }, 120);

        setTimeout(() => {
          spawnFloatingText(
            "💎 +" + surprisePiggyState.gemReward,
            targetPos.x + 35,
            targetPos.y + 38,
            "piggyGem",
          );
        }, 220);
      }

      target.style.display = "none";

      surprisePiggyState.active = false;
      surprisePiggyState.hp = 0;
      surprisePiggyState.maxHp = 0;
      surprisePiggyState.coinReward = 0;
      surprisePiggyState.gemReward = 0;
      surprisePiggyState.spawnTime = 0;
      surprisePiggyState.lifeTime = 0;

      updateSurprisePiggySprite();
      updateSurprisePiggyHpBar();
    } else {
      updateSurprisePiggySprite();
      updateSurprisePiggyHpBar();

      if (targetPos) {
        spawnFloatingText("-" + p, targetPos.x + 10, targetPos.y + 5, "xp");
      }
    }

    return;
  }

  const ballType = target?.dataset?.ballType || "normal";

  if (ballType === "gold") {
    sClick += p;
    sTeleXP += p;

    let amount = 1;
    sCoins += amount;
    sBallCoins += amount;
    sGoldCoins += amount;
    sTeleCoins += amount;

    if (targetPos) {
      spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
      spawnFloatingText(
        "+" + amount,
        targetPos.x + 28,
        targetPos.y - 6,
        "coin",
      );
    }
    return;
  }

  if (ballType === "fire") {
    const oldP = p;
    p *= 3;
    const bonusXP = p - oldP;

    sClick += p;
    sBallXP += bonusXP;
    sFireXP += bonusXP;
    sTeleXP += p;

    if (targetPos) {
      spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
    }
    return;
  }

  if (ballType === "combo") {
    const oldP = p;
    p *= 3;
    const bonusXP = p - oldP;

    sClick += p;
    sBallXP += bonusXP;
    sComboXP += bonusXP;
    sTeleXP += p;

    let amount = 1;
    sCoins += amount;
    sBallCoins += amount;
    sComboCoins += amount;
    sTeleCoins += amount;

    sGems += amount;
    sBallGems += amount;
    sComboGems += amount;
    sTeleGems += amount;

    if (targetPos) {
      spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
      spawnFloatingText(
        "+" + amount,
        targetPos.x + 28,
        targetPos.y - 6,
        "coin",
      );
      spawnFloatingText(
        "+" + amount + " 💎",
        targetPos.x + 40,
        targetPos.y + 14,
        "xp",
      );
    }
    return;
  }

  if (ballType === "crystal") {
    sClick += p;
    sTeleXP += p;

    let amount = 1;
    sGems += amount;
    sBallGems += amount;
    sCrystalGems += amount;
    sTeleGems += amount;

    if (targetPos) {
      spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
      spawnFloatingText(
        "+" + amount + " 💎",
        targetPos.x + 28,
        targetPos.y - 6,
        "xp",
      );
    }
    return;
  }

  sClick += p;

  if (targetPos) {
    spawnFloatingText("+" + p, targetPos.x + 10, targetPos.y + 5, "xp");
  }
}

function applyShockwavePulse(excludedElement = null) {
  const targets = getShockwaveTargets(excludedElement);
  if (targets.length === 0) return;

  targets.forEach((target) => {
    applyShockwaveHitToTarget(target);
  });

  refreshMatchRuntimeUI();
}

function startShockwave(originX, originY, excludedElement = null) {
  const hits = getShockwaveHits();
  if (!hits) return;

  if (originX != null && originY != null) {
    spawnFloatingText("SHOCKWAVE!", originX, originY - 30, "shockwave");

    playShockwaveRing(originX, originY);
  }

  for (let i = 0; i < hits; i++) {
    const timeoutId = setTimeout(() => {
      applyShockwavePulse(excludedElement);
    }, i * 120);

    shockwaveTimeouts.push(timeoutId);
  }
}

function playTelekinesisImpact(target) {
  if (!target) return;

  const randomDeg = Math.floor(Math.random() * 360) - 180;
  target.style.setProperty("--angle", randomDeg + "deg");

  target.classList.add("tele-hit");

  if (target.id === "ball") {
    target.style.transform = `rotate(var(--angle, 0deg)) scale(0.92)`;
    setTimeout(() => {
      target.style.transform = `rotate(var(--angle, 0deg)) scale(1)`;
      target.classList.remove("tele-hit");
    }, 120);
    return;
  }

  if (target.classList.contains("extra-ball")) {
    target.style.transform = `translate(-50%, -50%) rotate(var(--angle, 0deg)) scale(0.92)`;
    setTimeout(() => {
      target.style.transform = `translate(-50%, -50%) rotate(var(--angle, 0deg)) scale(1)`;
      target.classList.remove("tele-hit");
    }, 120);
    return;
  }

  if (target.id === "piggy" || target.id === "surprise-piggy") {
    target.style.transform = "translate(-50%, -50%) scale(0.92)";
    setTimeout(() => {
      target.style.transform = "translate(-50%, -50%) scale(1)";
      target.classList.remove("tele-hit");
    }, 120);
    return;
  }

  setTimeout(() => {
    target.classList.remove("tele-hit");
  }, 120);
}
function getElementCenter(el) {
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function startReflex() {
  const interval = getReflexInterval();
  if (!interval) return;

  clearInterval(reflexInterval);

  reflexInterval = setInterval(() => {
    const target = getAutoClickTarget();
    if (!target) return;

    handleKick({
      currentTarget: target,
      clientX: mouseX,
      clientY: mouseY,
    });
  }, interval);
}

function stopReflex() {
  clearInterval(reflexInterval);
  reflexInterval = null;
}

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function startGame() {
  playMusic("game");

  if (data.lvls.friend > 0) {
    startFriend();
  }
  sClick =
    sFriend =
    sFooty =
    sCoins =
    sLuckCoins =
    sGems =
    totalEl =
    xpForCoin =
    personalXpForGem =
    sBallXP =
    sBallCoins =
    sBallGems =
    sSpecialCritXP =
    sPiggyCoins =
    sPiggyGems =
    sTeleXP =
    sTeleCoins =
    sTeleGems =
    sFireXP =
    sComboXP =
    sGoldCoins =
    sComboCoins =
    sCrystalGems =
    sComboGems =
    sPersonalRewardGems =
    sRewardCoins =
    sMidasCoins =
    sVipGems =
    sCrystalTimeGems =
    actualViewerCount =
      0;

  piggyState.active = false;
  piggyState.hp = 0;
  piggyState.maxHp = 0;
  piggyState.reward = 0;
  piggyState.spawnTime = 0;
  piggyState.lifeTime = 0;
  stopReflex();
  clearShockwaveTimeouts();
  clonePiggies.forEach((p) => p.remove());
  cloneSurprisePiggies.forEach((p) => p.remove());
  clonePiggies = [];
  cloneSurprisePiggies = [];

  const shockwaveRing = document.getElementById("shockwave-ring");
  if (shockwaveRing) {
    shockwaveRing.classList.remove("active");
  }

  let maxT = (11 + data.lvls.time) * 1000;
  curMs = maxT;

  document.getElementById("admin-ui").style.display = "none";
  document.getElementById("menu-screen").classList.remove("active");
  document.getElementById("game-screen").classList.add("active");
  document.getElementById("top-stats-ui").classList.add("active");

  currentMainBallIndex = -1;
  currentExtraBallIndexes = [];

  let viewerCapacity = (data.lvls.viewer || 0) + (data.lvls.vStand || 0) * 10;
  let viewerChance = 30 + ([0, 10, 20, 30][data.lvls.adCampaign || 0] || 0);

  actualViewerCount = 0;
  for (let i = 0; i < viewerCapacity; i++) {
    if (Math.random() * 100 < viewerChance) {
      actualViewerCount++;
    }
  }

  updateViewersDisplay();
  updateKiosks();

  const mainBall = document.getElementById("ball");
  if (mainBall) {
    applyBallType(mainBall, "normal");
  }

  updateMultiBalls();

  scheduleMainBallMove(getMainBallLifeTime());

  extraBallSpawnInterval = setInterval(() => {
    trySpawnExtraBall();
  }, 300);

  extraBallLifeInterval = setInterval(() => {
    updateExtraBallLife();
  }, 100);

  piggySpawnInterval = setInterval(() => {
    trySpawnPiggy();
  }, 500);

  piggyLifeInterval = setInterval(() => {
    updatePiggyLife();
  }, 100);

  surprisePiggySpawnInterval = setInterval(() => {
    trySpawnSurprisePiggy();
  }, 500);

  surprisePiggyLifeInterval = setInterval(() => {
    updateSurprisePiggyLife();
  }, 100);

  cloneLifeInterval = setInterval(() => {
    updateClonePiggiesLife();
  }, 100);

  startReflex();

  gInt = setInterval(() => {
    curMs -= 10;
    totalEl += 10;
    document.getElementById("timer-text").innerText = fmt(curMs);

    let angle = (curMs / maxT) * 360;
    document.getElementById("stopwatch-hand").style.transform =
      `rotate(${angle}deg)`;

    if (curMs <= 0) {
      curMs = 0;
      clearInterval(gInt);
      stopGame();
    }
  }, 10);

  let friendTickCounter = 0;

  aInt = setInterval(() => {
    // 1. Футболисты
    let coachBonusPerPlayer = (data.lvls.coach || 0) * 2;
    let footyPowerPerSecond =
      (data.lvls.footy || 0) * (4 + coachBonusPerPlayer);
    let footyPowerPerTick = footyPowerPerSecond / 10;
    sFooty += footyPowerPerTick;

    // 2. Друг (удар ровно 1 раз в секунду)
    if (data.lvls.friend > 0) {
      friendTickCounter++;

      if (friendTickCounter >= 10) {
        let fPower = data.lvls.friend + (data.lvls.friendPower || 0) * 2;
        let isFriendCrit = false;
        let gotCoin = false;
        let coinAmt = 1;

        // ПРОВЕРКА КРИТА ДРУГА
        if (Math.random() * 100 < data.lvls.fCrit * 10) {
          fPower *= 3;
          isFriendCrit = true;

          if (Math.random() * 100 < data.lvls.fCoin * 25) {
            sCoins += coinAmt;
            sLuckCoins += coinAmt;
            gotCoin = true;
          }
        }

        sFriend += fPower;

        // --- ВИЗУАЛИЗАЦИЯ ---
        const friendDiv = document.getElementById("friend-animation");
        if (friendDiv && friendDiv.style.display !== "none") {
          const rect = friendDiv.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;

          spawnFloatingText("+" + fPower, x, y, isFriendCrit ? "crit" : "xp");

          if (gotCoin) {
            setTimeout(() => {
              spawnFloatingText("+" + coinAmt, x + 30, y - 20, "coin");
              document.getElementById("game-coins").innerText =
                `🟡 ${Math.floor(sCoins)}`;
            }, 200);
          }
        }

        friendTickCounter = 0;
      }
    } else {
      friendTickCounter = 0;
    }

    let totalNow = sClick + sFriend + sFooty;
    document.getElementById("current-score").innerText = Math.floor(totalNow);
  }, 100);
}

function handleKick(event) {
  let ball = event.currentTarget;

  if (ball) {
    let randomDeg = Math.floor(Math.random() * 360) - 180;
    ball.style.setProperty("--angle", randomDeg + "deg");
  }

  const clickedBall = event.currentTarget;
  const ballType = clickedBall?.dataset?.ballType || "normal";
  playSound(sounds.kick, 0.15);

  const equipBonuses = [0, 2, 5, 10];
  let p = data.lvls.click + (equipBonuses[data.lvls.equip] || 0);
  let isCrit = false;
  let isSuperCrit = false;

  if (Math.random() * 100 < data.lvls.crit * 3) {
    p *= 3;
    isCrit = true;

    if (Math.random() * 100 < [0, 25, 50, 75][data.lvls.cCoin]) {
      let bonusAmount = 1;
      sCoins += bonusAmount;
      sLuckCoins += bonusAmount;

      spawnFloatingText(
        "+" + bonusAmount,
        event.clientX + 40,
        event.clientY - 20,
        "coin",
      );
    }
  }

  if (clickedBall && clickedBall.id === "piggy" && piggyState.active) {
    piggyState.hp -= p;

    if (piggyState.hp <= 0) {
      playSound(sounds.piggyBreak, 0.35, false);
      const shockwavePos = getElementCenter(clickedBall);

      sCoins += piggyState.reward;
      sPiggyCoins += piggyState.reward;

      spawnFloatingText(
        "PIGGY BROKEN!",
        event.clientX,
        event.clientY - 20,
        "crit",
      );

      setTimeout(() => {
        spawnFloatingText(
          "🟡 +" + piggyState.reward,
          event.clientX + 35,
          event.clientY + 15,
          "piggyCoin",
        );
      }, 120);

      clickedBall.style.display = "none";

      piggyState.active = false;
      piggyState.hp = 0;
      piggyState.maxHp = 0;
      piggyState.reward = 0;
      piggyState.spawnTime = 0;
      piggyState.lifeTime = 0;

      updatePiggySprite();
      updatePiggyHpBar();

      if (shockwavePos) {
        startShockwave(shockwavePos.x, shockwavePos.y, clickedBall);
      }
    } else {
      playSound(sounds.piggyHit, 0.2);
      updatePiggySprite();
      updatePiggyHpBar();
      spawnFloatingText(
        "-" + p,
        event.clientX,
        event.clientY - 10,
        isCrit ? "crit" : "xp",
      );

      clickedBall.style.transform = "translate(-50%, -50%) scale(0.92)";
      setTimeout(() => {
        clickedBall.style.transform = "translate(-50%, -50%) scale(1)";
      }, 90);
    }

    const scoreEl = document.getElementById("current-score");
    const coinsEl = document.getElementById("game-coins");
    let totalNow = sClick + sFriend + sFooty;

    if (scoreEl) scoreEl.innerText = Math.floor(totalNow);
    if (coinsEl) coinsEl.innerText = `🟡 ${Math.floor(sCoins)}`;

    tryCloneTarget(clickedBall);
    applyFreezing(clickedBall, event);
    applyTelekinesis(clickedBall, event);

    return;
  }
  if (
    clickedBall &&
    clickedBall.classList.contains("clone-piggy") &&
    clickedBall.style.display === "block"
  ) {
    let hp = parseInt(clickedBall.dataset.hp || "0", 10);
    let reward = parseInt(clickedBall.dataset.reward || "0", 10);

    hp -= p;

    if (hp <= 0) {
      const shockwavePos = getElementCenter(clickedBall);
      playSound(sounds.piggyBreak, 0.35, false);
      sCoins += reward;
      sPiggyCoins += reward;

      spawnFloatingText(
        "PIGGY BROKEN!",
        event.clientX,
        event.clientY - 20,
        "crit",
      );

      setTimeout(() => {
        spawnFloatingText(
          "🟡 +" + reward,
          event.clientX + 35,
          event.clientY + 15,
          "piggyCoin",
        );
      }, 120);

      clickedBall.style.display = "none";
      clickedBall.dataset.ballIndex = "-1";
      if (shockwavePos) {
        startShockwave(shockwavePos.x, shockwavePos.y, clickedBall);
      }
    } else {
      playSound(sounds.piggyHit, 0.2);
      clickedBall.dataset.hp = hp.toString();

      spawnFloatingText(
        "-" + p,
        event.clientX,
        event.clientY - 10,
        isCrit ? "crit" : "xp",
      );

      clickedBall.style.transform = "translate(-50%, -50%) scale(0.92)";
      setTimeout(() => {
        clickedBall.style.transform = "translate(-50%, -50%) scale(1)";
      }, 90);
    }

    refreshMatchRuntimeUI();
    applyFreezing(clickedBall, event);
    applyTelekinesis(clickedBall, event);
    return;
  }

  if (
    clickedBall &&
    clickedBall.id === "surprise-piggy" &&
    surprisePiggyState.active
  ) {
    surprisePiggyState.hp -= p;

    if (surprisePiggyState.hp <= 0) {
      playSound(sounds.piggyBreak, 0.4, false);
      const shockwavePos = getElementCenter(clickedBall);
      sCoins += surprisePiggyState.coinReward;
      sGems += surprisePiggyState.gemReward;

      sPiggyCoins += surprisePiggyState.coinReward;
      sPiggyGems += surprisePiggyState.gemReward;

      spawnFloatingText(
        "SURPRISE!",
        event.clientX,
        event.clientY - 20,
        "ultra",
      );

      setTimeout(() => {
        spawnFloatingText(
          "🟡 +" + surprisePiggyState.coinReward,
          event.clientX + 35,
          event.clientY + 10,
          "piggyCoin",
        );
      }, 120);

      setTimeout(() => {
        spawnFloatingText(
          "💎 +" + surprisePiggyState.gemReward,
          event.clientX + 70,
          event.clientY + 30,
          "piggyGem",
        );
      }, 220);
      clickedBall.style.display = "none";

      surprisePiggyState.active = false;
      surprisePiggyState.hp = 0;
      surprisePiggyState.maxHp = 0;
      surprisePiggyState.coinReward = 0;
      surprisePiggyState.gemReward = 0;
      surprisePiggyState.spawnTime = 0;
      surprisePiggyState.lifeTime = 0;

      updateSurprisePiggySprite();
      updateSurprisePiggyHpBar();

      if (shockwavePos) {
        startShockwave(shockwavePos.x, shockwavePos.y, clickedBall);
      }
    } else {
      playSound(sounds.piggyHit, 0.22);
      updateSurprisePiggySprite();
      updateSurprisePiggyHpBar();

      spawnFloatingText(
        "-" + p,
        event.clientX,
        event.clientY - 10,
        isCrit ? "crit" : "xp",
      );

      clickedBall.style.transform = "translate(-50%, -50%) scale(0.92)";
      setTimeout(() => {
        clickedBall.style.transform = "translate(-50%, -50%) scale(1)";
      }, 90);
    }

    const scoreEl = document.getElementById("current-score");
    const coinsEl = document.getElementById("game-coins");
    let totalNow = sClick + sFriend + sFooty;

    if (scoreEl) scoreEl.innerText = Math.floor(totalNow);
    if (coinsEl) coinsEl.innerText = `🟡 ${Math.floor(sCoins)}`;

    tryCloneTarget(clickedBall);
    applyFreezing(clickedBall, event);
    applyTelekinesis(clickedBall, event);
    return;
  }

  if (
    clickedBall &&
    clickedBall.classList.contains("clone-surprise-piggy") &&
    clickedBall.style.display === "block"
  ) {
    let hp = parseInt(clickedBall.dataset.hp || "0", 10);
    let coinReward = parseInt(clickedBall.dataset.coinReward || "0", 10);
    let gemReward = parseInt(clickedBall.dataset.gemReward || "0", 10);

    hp -= p;

    if (hp <= 0) {
      const shockwavePos = getElementCenter(clickedBall);
      playSound(sounds.piggyBreak, 0.4, false);
      sCoins += coinReward;
      sGems += gemReward;
      sPiggyCoins += coinReward;
      sPiggyGems += gemReward;

      spawnFloatingText("SURPRISE!", event.clientX, event.clientY - 20, "tele");

      setTimeout(() => {
        spawnFloatingText(
          "🟡 +" + coinReward,
          event.clientX + 35,
          event.clientY + 10,
          "piggyCoin",
        );
      }, 120);

      setTimeout(() => {
        spawnFloatingText(
          "💎 +" + gemReward,
          event.clientX + 70,
          event.clientY + 30,
          "piggyGem",
        );
      }, 220);

      clickedBall.style.display = "none";
      clickedBall.dataset.ballIndex = "-1";
      if (shockwavePos) {
        startShockwave(shockwavePos.x, shockwavePos.y, clickedBall);
      }
    } else {
      playSound(sounds.piggyHit, 0.22);
      clickedBall.dataset.hp = hp.toString();

      spawnFloatingText(
        "-" + p,
        event.clientX,
        event.clientY - 10,
        isCrit ? "crit" : "xp",
      );

      clickedBall.style.transform = "translate(-50%, -50%) scale(0.92)";
      setTimeout(() => {
        clickedBall.style.transform = "translate(-50%, -50%) scale(1)";
      }, 90);
    }

    refreshMatchRuntimeUI();
    applyFreezing(clickedBall, event);
    applyTelekinesis(clickedBall, event);
    return;
  }

  const isSpecialBall =
    ballType === "gold" ||
    ballType === "fire" ||
    ballType === "crystal" ||
    ballType === "combo";

  let isSpecialCrit = false;

  if (isSpecialBall && data.lvls.specialCrit > 0) {
    const specialCritChances = [0, 5, 10, 15];
    const specialCritChance = specialCritChances[data.lvls.specialCrit] || 0;

    if (Math.random() * 100 < specialCritChance) {
      const oldP = p;
      p *= 3;
      const bonusXP = p - oldP;

      sBallXP += bonusXP;
      sSpecialCritXP += bonusXP;
      isSpecialCrit = true;
    }
  }

  if (ballType === "gold") {
    playSound(sounds.gold, 0.25);
    let amount = isSpecialCrit ? 3 : 1;

    sCoins += amount;
    sBallCoins += amount;
    sGoldCoins += amount;
    console.log("GOLD HIT", sGoldCoins);

    spawnFloatingText(
      "+" + amount,
      event.clientX + 35,
      event.clientY - 35,
      "coin",
    );
  }

  if (ballType === "fire") {
    playSound(sounds.fire, 0.25);
    const oldP = p;
    p *= 3;
    const bonusXP = p - oldP;
    sBallXP += bonusXP;
    sFireXP += bonusXP;

    if (isCrit) isSuperCrit = true;

    spawnFloatingText("FIRE!", event.clientX + 35, event.clientY - 35, "crit");
  }

  if (ballType === "combo") {
    playSound(sounds.combo, 0.3);
    const oldP = p;
    p *= 3;
    const bonusXP = p - oldP;
    sBallXP += bonusXP;
    sComboXP += bonusXP;

    if (isCrit) isSuperCrit = true;

    let amount = isSpecialCrit ? 3 : 1;

    sCoins += amount;
    sBallCoins += amount;
    sComboCoins += amount;

    sGems += amount;
    sBallGems += amount;
    sComboGems += amount;

    spawnFloatingText("COMBO!", event.clientX + 35, event.clientY - 35, "crit");

    spawnFloatingText(
      "+" + amount,
      event.clientX + 65,
      event.clientY - 10,
      "coin",
    );

    spawnFloatingText(
      "+" + amount + " 💎",
      event.clientX + 90,
      event.clientY + 10,
      "xp",
    );
  }

  if (ballType === "crystal") {
    playSound(sounds.crystal, 0.3);
    let amount = isSpecialCrit ? 3 : 1;

    sGems += amount;
    sBallGems += amount;
    sCrystalGems += amount;
    console.log("CRYSTAL HIT", sCrystalGems);

    spawnFloatingText(
      "+" + amount + " 💎",
      event.clientX + 35,
      event.clientY - 35,
      "xp",
    );
  }

  if (data.lvls.midas > 0) {
    const midasChances = [0, 3, 6, 9];
    const midasChance = midasChances[data.lvls.midas] || 0;

    if (Math.random() * 100 < midasChance) {
      const midasBonus = 1 + (data.lvls.midasCrit || 0);

      sCoins += midasBonus;
      sMidasCoins += midasBonus;

      spawnFloatingText(
        "+" + midasBonus,
        event.clientX + 45,
        event.clientY + 35,
        "midas",
      );
    }
  }

  if (Math.random() * 100 < [0, 0.5, 1, 1.5][data.lvls.delay]) {
    curMs += 1000;

    spawnFloatingText("+1", event.clientX + 20, event.clientY + 40, "time");

    if (data.lvls.timeCoin > 0) {
      let bonus = data.lvls.timeCoin;
      sCoins += bonus;
      sLuckCoins += bonus;

      spawnFloatingText(
        "+" + bonus,
        event.clientX + 60,
        event.clientY + 20,
        "coin",
      );
    }

    let b = document.getElementById("time-bonus");
    if (b) {
      b.classList.add("show-bonus");
      setTimeout(() => b.classList.remove("show-bonus"), 500);
    }
  }

  sClick += p;
  let totalNow = sClick + sFriend + sFooty;

  const scoreEl = document.getElementById("current-score");
  const coinsEl = document.getElementById("game-coins");

  if (scoreEl) scoreEl.innerText = Math.floor(totalNow);
  if (coinsEl) coinsEl.innerText = `🟡 ${Math.floor(sCoins)}`;

  if (isSuperCrit && isSpecialCrit) {
    spawnFloatingText("ULTRA CRIT!", event.clientX, event.clientY, "ultra");
  } else if (isSuperCrit) {
    spawnFloatingText("SUPER CRIT!", event.clientX, event.clientY, "crit");
  } else if (isSpecialCrit) {
    spawnFloatingText("SPECIAL CRIT!", event.clientX, event.clientY, "crit");
  } else {
    spawnFloatingText(
      "+" + p,
      event.clientX,
      event.clientY,
      isCrit ? "crit" : "xp",
    );
  }

  if (data.lvls.reward > 0) {
    let threshold = 1300 - data.lvls.reward * 100;
    const bigRewardBonuses = [0, 1, 3, 6];

    while (totalNow >= xpForCoin + threshold) {
      let bonus = 3 + (bigRewardBonuses[data.lvls.bigReward] || 0);
      sCoins += bonus;
      sRewardCoins += bonus;
      xpForCoin += threshold;

      spawnFloatingText(
        "+" + bonus,
        event.clientX - 40,
        event.clientY - 40,
        "coin",
      );
    }
  }

  if (data.lvls.personalReward > 0) {
    const gemThresholds = [0, 1500, 1250, 1000];
    const threshold = gemThresholds[data.lvls.personalReward] || 0;

    while (threshold > 0 && sClick >= personalXpForGem + threshold) {
      sGems += 1;
      sPersonalRewardGems += 1;
      personalXpForGem += threshold;

      spawnFloatingText("+1 💎", event.clientX - 20, event.clientY - 60, "xp");
    }
  }

  tryCloneTarget(clickedBall);
  applyFreezing(clickedBall, event);
  applyTelekinesis(clickedBall, event);
}

function showEl(id, display = "flex") {
  const el = document.getElementById(id);
  if (el) el.style.display = display;
}

function hideEl(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function stopGame() {
  clearTimeout(mainBallMoveTimeout);
  clearInterval(ballMoveInterval);
  clearInterval(gInt);
  clearInterval(aInt);
  clearInterval(extraBallSpawnInterval);
  clearInterval(extraBallLifeInterval);
  clearInterval(piggySpawnInterval);
  clearInterval(piggyLifeInterval);
  clearInterval(surprisePiggySpawnInterval);
  clearInterval(surprisePiggyLifeInterval);
  stopReflex();
  clearShockwaveTimeouts();
  clearInterval(cloneLifeInterval);

  clonePiggies.forEach((p) => p.remove());
  cloneSurprisePiggies.forEach((p) => p.remove());
  clonePiggies = [];
  cloneSurprisePiggies = [];

  playMusic("menu");

  const shockwaveRing = document.getElementById("shockwave-ring");
  if (shockwaveRing) shockwaveRing.classList.remove("active");

  const piggy = document.getElementById("piggy");
  if (piggy) piggy.style.display = "none";

  const surprisePiggy = document.getElementById("surprise-piggy");
  if (surprisePiggy) surprisePiggy.style.display = "none";

  piggyState.active = false;
  piggyState.hp = 0;
  piggyState.maxHp = 0;
  piggyState.reward = 0;
  piggyState.spawnTime = 0;
  piggyState.lifeTime = 0;

  surprisePiggyState.active = false;
  surprisePiggyState.hp = 0;
  surprisePiggyState.maxHp = 0;
  surprisePiggyState.coinReward = 0;
  surprisePiggyState.gemReward = 0;
  surprisePiggyState.spawnTime = 0;
  surprisePiggyState.lifeTime = 0;

  updatePiggySprite();
  updateSurprisePiggySprite();
  updatePiggyHpBar();
  updateSurprisePiggyHpBar();

  extraBalls.forEach((ball) => ball.remove());
  extraBalls = [];
  currentExtraBallIndexes = [];
  currentMainBallIndex = -1;

  const viewersContainer = document.getElementById("viewers-container");
  if (viewersContainer) viewersContainer.innerHTML = "";

  let vC = actualViewerCount || 0;
  let fC = (data.lvls.fan || 0) + (data.lvls.fSec || 0) * 10;
  let totalPeople = vC + fC;

  let vipChance = [0, 30, 60, 90][data.lvls.vip || 0] || 0;
  if (Math.random() * 100 < vipChance) {
    sGems += 3;
    sVipGems += 3;
  }

  let cBase = totalPeople * 2;

  clearInterval(friendAnimationInterval);
  friendAnimationInterval = null;

  const friendAnim = document.getElementById("friend-animation");
  if (friendAnim) friendAnim.style.display = "none";

  let drinkMoney = 0;
  let attrMoney = 0;
  let dCh = [0, 30, 60, 90][data.lvls.drink || 0] || 0;
  let aCh = [0, 10, 20, 30][data.lvls.attr || 0] || 0;

  for (let i = 0; i < totalPeople; i++) {
    if (Math.random() * 100 < dCh) drinkMoney++;
  }

  for (let i = 0; i < fC; i++) {
    if (Math.random() * 100 < aCh) attrMoney += 3;
  }

  let cExtra = drinkMoney + attrMoney;

  let crystalTimeThresholds = [0, 18, 17, 16];
  let crystalTimeNeed = crystalTimeThresholds[data.lvls.crystalTime || 0] || 0;

  if (crystalTimeNeed > 0) {
    let totalSeconds = Math.floor(totalEl / 1000);
    let extraSeconds = totalSeconds - crystalTimeNeed;

    if (extraSeconds > 0) {
      sGems += extraSeconds;
      sCrystalTimeGems += extraSeconds;
    }
  }

  let totalXP = Math.floor(sClick + sFriend + sFooty + sBallXP);
  let totalMatchCoins = sCoins + cBase + cExtra;
  let totalMatchGems = sGems;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setVal("res-time", (totalEl / 1000).toFixed(1) + "s");
  setVal("res-visitors", totalPeople);

  setVal("res-xp-total", totalXP);
  setVal("res-xp-click", Math.floor(sClick));
  setVal("res-xp-friend", Math.floor(sFriend));
  setVal("res-xp-footy", Math.floor(sFooty));
  setVal("res-xp-fire", Math.floor(sFireXP));
  setVal("res-xp-combo", Math.floor(sComboXP));
  setVal("res-xp-tele", Math.floor(sTeleXP));

  setVal("res-coin-total", totalMatchCoins);
  setVal("res-coin-base", cBase);
  setVal("res-coin-luck", Math.floor(sLuckCoins));
  setVal("res-coin-midas", Math.floor(sMidasCoins));
  setVal("res-coin-reward", Math.floor(sRewardCoins));
  setVal("res-coin-gold", Math.floor(sGoldCoins));
  setVal("res-coin-combo", Math.floor(sComboCoins));
  setVal("res-coin-piggy", Math.floor(sPiggyCoins));
  setVal("res-coin-tele", Math.floor(sTeleCoins));
  setVal("res-coin-drink", drinkMoney);
  setVal("res-coin-attr", attrMoney);

  setVal("res-gem-crystal", Math.floor(sCrystalGems));
  setVal("res-gem-combo", Math.floor(sComboGems));
  setVal("res-gem-vip", Math.floor(sVipGems));
  setVal("res-gem-time", Math.floor(sCrystalTimeGems));
  setVal("res-gem-personal", Math.floor(sPersonalRewardGems));
  setVal("res-gem-piggy", Math.floor(sPiggyGems));
  console.log("STOPGAME sTeleGems =", sTeleGems);
  setVal("res-gem-tele", Math.floor(sTeleGems));
  setVal("res-gem-total", Math.floor(totalMatchGems));

  data.xp += totalXP;
  data.coins += totalMatchCoins;
  data.gems += totalMatchGems;
  updateUI();

  if (sFireXP > 0) showEl("row-res-fire-xp");
  if (sComboXP > 0) showEl("row-res-combo-xp");
  if (data.lvls.friend > 0) showEl("row-res-friend-xp");
  if (data.lvls.footy > 0) showEl("row-res-footy-xp");
  if (sTeleXP > 0) showEl("row-res-tele-xp");

  if (data.lvls.viewer > 0 || data.lvls.vStand > 0 || data.lvls.fan > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-base");
    showEl("row-res-visitors", "inline");
  }

  if (sLuckCoins > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-luck");
  }

  if (sMidasCoins > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-midas");
  }

  if (sRewardCoins > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-reward");
  }

  if (sGoldCoins > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-gold-coin");
  }

  if (sComboCoins > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-combo-coin");
  }

  if (sPiggyCoins > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-piggy-coin");
  }

  if (sTeleCoins > 0) {
    showEl("summary-coin-col", "block");
    showEl("row-res-tele-coin");
  }

  if (data.lvls.drink > 0) showEl("row-res-drink");
  if (data.lvls.attr > 0) showEl("row-res-attr");

  if (totalMatchGems > 0) {
    showEl("summary-gem-col", "block");

    if (sPiggyGems > 0) showEl("row-res-gem-piggy");
    if (sCrystalGems > 0) showEl("row-res-gem-crystal");
    if (sComboGems > 0) showEl("row-res-gem-combo");
    if (sVipGems > 0) showEl("row-res-gem-vip");
    if (sCrystalTimeGems > 0) showEl("row-res-gem-time");
    if (sPersonalRewardGems > 0) showEl("row-res-gem-personal");
    if (sTeleGems > 0) showEl("row-res-gem-tele");

    showEl("row-res-total-gem");
  }

  if (totalMatchCoins > 0) showEl("row-res-total-coin");

  const overlay = document.getElementById("summary-overlay");
  if (overlay) overlay.style.display = "flex";
}
function closeSummary() {
  document.getElementById("summary-overlay").style.display = "none";

  // Сбрасываем видимость всех динамических строк
  const idsToHide = [
    "summary-coin-col",
    "summary-gem-col",
    "row-res-base",
    "row-res-luck",
    "row-res-drink",
    "row-res-attr",
    "row-res-total-coin",
    "row-res-friend-xp",
    "row-res-footy-xp",
    "row-res-gem-personal",
    "row-res-total-gem",
    "row-res-gem-vip",
    "row-res-reward",
    "row-res-midas",
    "row-res-fire-xp",
    "row-res-combo-xp",
    "row-res-gold-coin",
    "row-res-combo-coin",
    "row-res-gem-crystal",
    "row-res-gem-combo",
    "row-res-visitors",
    "row-res-gem-time",
    "row-res-piggy-coin",
    "row-res-gem-piggy",
    "row-res-tele-xp",
    "row-res-tele-coin",
    "row-res-gem-tele",
  ];
  idsToHide.forEach((id) => {
    let el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  document.getElementById("top-stats-ui").classList.remove("active");
  document.getElementById("game-screen").classList.remove("active");
  document.getElementById("menu-screen").classList.add("active");
  document.getElementById("admin-ui").style.display = "flex";
  updateUI();
}

function fmt(ms) {
  let t = Math.max(0, ms);
  let m = Math.floor(t / 60000);
  let s = Math.floor((t % 60000) / 1000);
  let c = Math.floor((t % 1000) / 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${c.toString().padStart(2, "0")}`;
}

function getExpectedIncome() {
  const viewerCapacity = (data.lvls.viewer || 0) + (data.lvls.vStand || 0) * 10;
  const viewerChance = 30 + ([0, 10, 20, 30][data.lvls.adCampaign || 0] || 0);

  const expectedViewers = viewerCapacity * (viewerChance / 100);
  const fans = (data.lvls.fan || 0) + (data.lvls.fSec || 0) * 10;
  const expectedPeople = fans + expectedViewers;

  // Билеты
  const expectedTickets = expectedPeople * 2;

  // Напитки
  const dCh = [0, 30, 60, 90][data.lvls.drink || 0] || 0;
  const expectedDrinks = expectedPeople * (dCh / 100);

  // Атрибутика: только фанаты, по 3 монеты
  const aCh = [0, 10, 20, 30][data.lvls.attr || 0] || 0;
  const expectedAttr = fans * (aCh / 100) * 3;

  return Math.round(expectedTickets + expectedDrinks + expectedAttr);
}

function getExpectedPeople() {
  const viewerCapacity = (data.lvls.viewer || 0) + (data.lvls.vStand || 0) * 10;
  const viewerChance = 30 + ([0, 10, 20, 30][data.lvls.adCampaign || 0] || 0);

  const expectedViewers = viewerCapacity * (viewerChance / 100);
  const fans = (data.lvls.fan || 0) + (data.lvls.fSec || 0) * 10;

  return Math.round(fans + expectedViewers);
}

function updateLiveStats() {
  const coachBonusPerPlayer = (data.lvls.coach || 0) * 2;
  const footyTotal = (data.lvls.footy || 0) * (4 + coachBonusPerPlayer);
  const friendBase = data.lvls.friend || 0;
  const friendBonus = (data.lvls.friendPower || 0) * 2;

  const teamVal = friendBase + friendBonus + footyTotal;
  const eBonuses = [0, 2, 5, 10];
  const damageVal = data.lvls.click + (eBonuses[data.lvls.equip] || 0);
  const ballLifeVal =
    (0.75 + (data.lvls.reaction || 0) * 0.25).toFixed(2) + "с";

  const critVal = data.lvls.crit * 3 + "%";
  const delayVal = [0, 0.5, 1, 2][data.lvls.delay] + "%";
  const specialBallLifeVal =
    (0.75 + (data.lvls.specialReaction || 0) * 0.25).toFixed(2) + "с";
  const peopleVal = "~" + getExpectedPeople();
  const incomeVal = "~" + getExpectedIncome();
  const specialCritVal = [0, 5, 10, 15][data.lvls.specialCrit || 0] + "%";

  const topBoxLeft = document.getElementById("top-box-left");
  const topBoxMiddle = document.getElementById("top-box-middle");
  const topBoxRight = document.getElementById("top-box-right");

  const rowTopDamage = document.getElementById("row-top-damage");
  const rowTopBallLife = document.getElementById("row-top-ball-life");
  const rowTopTeam = document.getElementById("row-top-team");
  const rowTopCrit = document.getElementById("row-top-crit");
  const rowTopDelay = document.getElementById("row-top-delay");
  const rowTopSpecialLife = document.getElementById("row-top-special-life");
  const rowTopPeople = document.getElementById("row-top-people");
  const rowTopIncome = document.getElementById("row-top-income");
  const rowTopSpecialCrit = document.getElementById("row-top-special-crit");
  const specialCritEl = document.getElementById("top-stat-special-crit");

  const damageEl = document.getElementById("top-stat-damage");
  const ballLifeEl = document.getElementById("top-stat-ball-life");
  const teamEl = document.getElementById("top-stat-team");
  const critEl = document.getElementById("top-stat-crit");
  const delayEl = document.getElementById("top-stat-delay");
  const specialLifeEl = document.getElementById("top-stat-special-life");
  const peopleEl = document.getElementById("top-stat-people");
  const incomeEl = document.getElementById("top-stat-income");

  if (damageEl) damageEl.innerText = damageVal;
  if (ballLifeEl) ballLifeEl.innerText = ballLifeVal;
  if (teamEl) teamEl.innerText = teamVal;
  if (critEl) critEl.innerText = critVal;
  if (delayEl) delayEl.innerText = delayVal;
  if (peopleEl) peopleEl.innerText = peopleVal;
  if (incomeEl) incomeEl.innerText = incomeVal;
  if (specialLifeEl) specialLifeEl.innerText = specialBallLifeVal;
  if (specialCritEl) specialCritEl.innerText = specialCritVal;

  // Левый блок — всегда виден
  if (topBoxLeft) topBoxLeft.style.display = "block";

  const hasTeam = data.lvls.friend > 0 || data.lvls.footy > 0;

  if (rowTopDamage) rowTopDamage.style.display = "block";
  if (rowTopBallLife) rowTopBallLife.style.display = "block";
  if (rowTopTeam) rowTopTeam.style.display = hasTeam ? "block" : "none";

  // Меняем порядок строк в левом блоке
  if (topBoxLeft && rowTopDamage && rowTopBallLife && rowTopTeam) {
    if (hasTeam) {
      // СИЛА → ПАРТНЁРЫ → ЖИЗНЬ МЯЧА
      topBoxLeft.appendChild(rowTopDamage);
      topBoxLeft.appendChild(rowTopTeam);
      topBoxLeft.appendChild(rowTopBallLife);
    } else {
      // СИЛА → ЖИЗНЬ МЯЧА
      topBoxLeft.appendChild(rowTopDamage);
      topBoxLeft.appendChild(rowTopBallLife);
    }
  }

  // Средний блок — только когда открыт крит или затяжка
  let showMiddle = false;

  if (rowTopCrit) {
    const show = data.lvls.crit > 0;
    rowTopCrit.style.display = show ? "block" : "none";
    if (show) showMiddle = true;
  }
  if (rowTopSpecialLife) {
    const show = data.lvls.specialReaction > 0;
    rowTopSpecialLife.style.display = show ? "block" : "none";
    if (show) showMiddle = true;
  }

  if (rowTopDelay) {
    const show = data.lvls.delay > 0;
    rowTopDelay.style.display = show ? "block" : "none";
    if (show) showMiddle = true;
  }

  if (topBoxMiddle) {
    topBoxMiddle.style.display = showMiddle ? "block" : "none";
  }

  // Правый блок — только когда открыта экономика людей
  const showRight =
    data.lvls.viewer > 0 ||
    data.lvls.fan > 0 ||
    data.lvls.vStand > 0 ||
    data.lvls.fSec > 0 ||
    data.lvls.drink > 0 ||
    data.lvls.attr > 0 ||
    data.lvls.adCampaign > 0;

  if (topBoxRight) {
    topBoxRight.style.display = showRight ? "block" : "none";
  }

  if (rowTopPeople) rowTopPeople.style.display = showRight ? "block" : "none";
  if (rowTopIncome) rowTopIncome.style.display = showRight ? "block" : "none";
  if (rowTopSpecialCrit) {
    rowTopSpecialCrit.style.display =
      data.lvls.specialCrit > 0 ? "block" : "none";
  }
}
initTree();
updateUI();
renderPlayerPreview();
setTimeout(centerTreeOnClickNode, 50);

function initCustomizationControls() {
  const headButtons = document.querySelectorAll(".js-change-head");

  headButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.step);
      changeHead(step);
    });
  });

  const colorGrids = document.querySelectorAll(".color-grid");

  colorGrids.forEach((grid) => {
    grid.addEventListener("click", (event) => {
      const colorButton = event.target.closest(".color-opt");
      if (!colorButton) return;

      const part = grid.dataset.part;
      const color = colorButton.dataset.color;

      updatePartColor(part, color);
    });
  });

  const savePlayerButton = document.getElementById("save-player-btn");
  if (savePlayerButton) {
    savePlayerButton.addEventListener("click", savePlayerAndStart);
  }
}

function initAdminControls() {
  const adminButtons = document.querySelectorAll(".js-admin-add");

  adminButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const resource = button.dataset.resource;
      const amount = Number(button.dataset.amount);

      addRes(resource, amount);
    });
  });
}

function initMainButtons() {
  const startMatchButton = document.getElementById("start-match-btn");
  if (startMatchButton) {
    startMatchButton.addEventListener("click", startGame);
  }

  const closeSummaryButton = document.getElementById("close-summary-btn");
  if (closeSummaryButton) {
    closeSummaryButton.addEventListener("click", closeSummary);
  }
}

function initGameClickTargets() {
  const ball = document.getElementById("ball");
  if (ball) {
    ball.addEventListener("click", handleKick);
  }

  const piggy = document.getElementById("piggy");
  if (piggy) {
    piggy.addEventListener("click", handleKick);
  }

  const surprisePiggy = document.getElementById("surprise-piggy");
  if (surprisePiggy) {
    surprisePiggy.addEventListener("click", handleKick);
  }
}

function initUIRefactorBindings() {
  initCustomizationControls();
  initAdminControls();
  initMainButtons();
  initGameClickTargets();
}

document.addEventListener("DOMContentLoaded", initUIRefactorBindings);
