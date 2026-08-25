let prestigeResetRequired = false;
let prestigeData = {
  totalPrestiges: 0,

  skills: {
    playerPower: 0,
    playerCritChance: 0,
    playerCritPower: 0,
    superReaction: 0,
    hemisphere: 0,
    speedDemon: 0,

    dogPower: 0,
    dogCritChance: 0,
    dogCritPower: 0,
    searchDog: 0,
    midasDog: 0,
    madDog: 0,
  },
};
const prestigeSkills = [
  // ИГРОК — 1 ряд
  {
    k: "playerPower",
    name: "МОЩНЫЙ УДАР",
    desc: "+4 / +5/ +6 к силе удара",
    group: "basic",
    max: 3,
  },
  {
    k: "playerCritChance",
    name: "ГОЛЕВОЕ ЧУТЬЁ",
    desc: "+2% шанс крита за уровень",
    group: "basic",
    max: 3,
  },
  {
    k: "playerCritPower",
    name: "УДАР С ЛЕТУ",
    desc: "+1x сила крита за уровень",
    group: "basic",
    max: 3,
  },
  {
    k: "superReaction",
    name: "КОНЦЕНТРАЦИЯ",
    desc: "Все мячи остаются дольше на 0.25с",
    group: "advanced",
    max: 2,
  },
  {
    k: "hemisphere",
    name: "ВТОРОЕ ПОЛУШАРИЕ",
    desc: "Телекинез может поразить вторую цель с шансом 15% и 30% на втором уровне",
    group: "advanced",
    max: 2,
  },
  {
    k: "speedDemon",
    name: "ДЕМОН СКОРОСТИ",
    desc: "Рефлекс работает в 2 раза быстрее. Даёт автоудар с интервалом 0.3с без прокаченого рефлекса",
    group: "ultimate",
    max: 1,
  },

  // ПЁС — 1 ряд
  {
    k: "dogPower",
    name: "КОРМ С ПРОТЕИНОМ",
    desc: "+3, +4, +5 к силе друга",
    group: "basic",
    max: 3,
  },
  {
    k: "dogCritChance",
    name: "ОСТРЫЙ НЮХ",
    desc: "+7% шанс крита друга",
    group: "basic",
    max: 3,
  },
  {
    k: "dogCritPower",
    name: "ОСТРЫЕ КЛЫКИ",
    desc: "+1x к силе крита друга",
    group: "basic",
    max: 3,
  },

  // ПЁС — 2 ряд
  {
    k: "searchDog",
    name: "ПОИСКОВЫЙ ПЁС",
    desc: "Даёт 1💎 за каждые 500 / 250 XP друга",
    group: "advanced",
    max: 2,
  },
  {
    k: "midasDog",
    name: "ПЁС МИДАСА",
    desc: "50% шанс получить 1, 2🟡 при ударе друга",
    group: "advanced",
    max: 2,
  },

  // ПЁС — финальный
  {
    k: "madDog",
    name: "БЕШЕНЫЙ ПЁС",
    desc: "Друг атакует в два раза быстрее",
    group: "ultimate",
    max: 1,
  },
];

function getPrestigeSkillCost(skill) {
  const lvl = prestigeData.skills[skill.k] || 0;

  if (skill.group === "basic") {
    return [100, 200, 300][lvl] || 999999;
  }

  if (skill.group === "advanced") {
    return [200, 400][lvl] || 999999;
  }

  if (skill.group === "ultimate") {
    return 2000;
  }

  return 999999;
}

function canSeePrestigeSkill(skill) {
  const s = prestigeData.skills;

  // Первый ряд всегда виден
  if (skill.group === "basic") return true;

  // Второй ряд игрока
  // Второй ряд игрока — Концентрация
  if (skill.k === "superReaction") {
    return (s.playerPower || 0) > 0 || (s.playerCritChance || 0) > 0;
  }

  // Второй ряд игрока — Второе полушарие
  if (skill.k === "hemisphere") {
    return (s.playerCritChance || 0) > 0 || (s.playerCritPower || 0) > 0;
  }

  // Третий ряд игрока
  if (skill.k === "speedDemon") {
    return (s.superReaction || 0) > 0 || (s.hemisphere || 0) > 0;
  }

  // Второй ряд пса
  if (skill.k === "midasDog") {
    return (s.dogPower || 0) > 0 || (s.dogCritChance || 0) > 0;
  }

  if (skill.k === "searchDog") {
    return (s.dogCritChance || 0) > 0 || (s.dogCritPower || 0) > 0;
  }

  // Третий ряд пса
  if (skill.k === "madDog") {
    return (s.searchDog || 0) > 0 || (s.midasDog || 0) > 0;
  }

  return true;
}

function openPrestigeMenu() {
  const menu = document.getElementById("menu-screen");
  const prestige = document.getElementById("prestige-screen");
  const adminUI = document.getElementById("admin-ui");

  if (!prestige) {
    console.error("prestige-screen не найден");
    return;
  }

  if (menu) menu.classList.remove("active");
  if (adminUI) adminUI.style.display = "none";

  prestige.classList.add("active");

  if (typeof renderPrestigeTree === "function") {
    renderPrestigeTree();
  }

  if (typeof updatePrestigeExitState === "function") {
    updatePrestigeExitState();
  }
}

function closePrestigeMenu() {
  if (prestigeResetRequired) {
    showGameMessage?.(
      "⚠️ НУЖЕН СБРОС",
      "Вы уже выбрали постоянный талант.<br>Теперь нужно сбросить прогресс, чтобы завершить перерождение.",
    );
    return;
  }

  const menu = document.getElementById("menu-screen");
  const prestige = document.getElementById("prestige-screen");
  const adminUI = document.getElementById("admin-ui");

  if (prestige) prestige.classList.remove("active");
  if (menu) menu.classList.add("active");
  if (adminUI) adminUI.style.display = "flex";
}

function renderPrestigeTree() {
  const gemsEl = document.getElementById("prestige-gems");

  if (gemsEl) {
    gemsEl.innerText = Math.floor(data.gems || 0);
  }

  prestigeSkills.forEach((skill) => {
    const el = document.getElementById(`prestige-${skill.k}`);
    if (!el) return;

    const lvl = prestigeData.skills[skill.k] || 0;
    const isMax = lvl >= skill.max;
    const canSee = canSeePrestigeSkill(skill);
    const cost = getPrestigeSkillCost(skill);
    const canBuy = (data.gems || 0) >= cost;

    el.style.display = canSee ? "block" : "none";

    if (!canSee) return;

    el.title = `${skill.name}\n\n${skill.desc}\n\nСтоимость: ${cost} 💎\nУровень: ${lvl}/${skill.max}`;

    el.innerHTML = `
      <div class="prestige-node-title">
        ${skill.name}
      </div>

      <div class="prestige-node-bottom">
        ${
          isMax
            ? `<span class="prestige-max">MAX</span>`
            : `<span>💎 ${cost}</span>`
        }

        <span class="prestige-level">
          ${lvl}/${skill.max}
        </span>
      </div>
    `;

    el.classList.toggle("locked", !canBuy && !isMax);
    el.classList.toggle("maxed", isMax);

    el.onclick = () => buyPrestigeSkill(skill.k);
  });
}
function buyPrestigeSkill(skillKey) {
  const skill = prestigeSkills.find((s) => s.k === skillKey);
  if (!skill) return;

  if (!canSeePrestigeSkill(skill)) return;

  const currentLevel = prestigeData.skills[skillKey] || 0;

  if (currentLevel >= skill.max) return;

  const cost = getPrestigeSkillCost(skill);

  if ((data.gems || 0) < cost) {
    showGameMessage?.(
      "❌ НЕДОСТАТОЧНО ГЕМОВ",
      `Для покупки таланта нужно 💎 ${cost}.`,
    );
    return;
  }

  data.gems -= cost;
  prestigeData.skills[skillKey]++;

  prestigeResetRequired = true;
  updatePrestigeExitState();

  renderPrestigeTree();

  if (typeof updateUI === "function") {
    updateUI();
  }
}

function updatePrestigeExitState() {
  const closeBtn = document.getElementById("close-prestige-btn");

  if (!closeBtn) return;

  if (prestigeResetRequired) {
    closeBtn.style.display = "none";
  } else {
    closeBtn.style.display = "inline-block";
  }
}

function createFreshDataAfterPrestige(keepGems) {
  return {
    xp: 0,
    coins: 0,
    gems: keepGems,

    competition: {
      currentLevel: 0,
      unlocked: {
        spain: true,
        england: false,
        germany: false,
        netherlands: false,
        norway: false,
        brazil: false,
        italy: false,
      },
      firstClear: {
        spain: false,
        england: false,
        germany: false,
        netherlands: false,
        norway: false,
        brazil: false,
        italy: false,
      },
      selected: "spain",
    },

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
      friendSpeed: 0,
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

    max: { ...data.max },

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
      friendSpeed: 20,
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
      competition: 1000,
    },
  };
}

function canShowPrestigeButton() {
  return (
    (data.lvls.crystalBall || 0) > 0 ||
    (data.lvls.synergy || 0) > 0 ||
    (data.lvls.personalReward || 0) > 0 ||
    (data.lvls.crystalTime || 0) > 0 ||
    (data.lvls.vip || 0) > 0 ||
    (data.lvls.surprisePiggy || 0) > 0
  );
}

function updatePrestigeButton() {
  const btn = document.getElementById("open-prestige-btn");
  if (!btn) return;

  btn.style.display = canShowPrestigeButton() ? "inline-block" : "none";
}
function resetProgressForPrestige() {
  const keepGems = data.gems || 0;

  data = createFreshDataAfterPrestige(keepGems);

  prestigeData.totalPrestiges++;

  prestigeResetRequired = false;

  if (typeof updateUI === "function") {
    updateUI();
  }

  if (typeof updatePlayerCard === "function") {
    updatePlayerCard();
  }

  if (typeof updateCompetitionButton === "function") {
    updateCompetitionButton();
  }

  updatePrestigeExitState();

  closePrestigeMenu();
}
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-prestige-btn");
  const closeBtn = document.getElementById("close-prestige-btn");
  const resetBtn = document.getElementById("prestige-reset-btn");

  if (openBtn) {
    openBtn.addEventListener("click", openPrestigeMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closePrestigeMenu);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      showGameMessage(
        "💎 ПЕРЕРОЖДЕНИЕ",
        `
        Вы действительно хотите переродиться?<br><br>
        ❗ Весь обычный прогресс будет сброшен<br>
        ✅ Таланты престижа останутся навсегда
        `,
        [
          {
            text: "ОТМЕНА",
            className: "msg-btn-cancel",
          },
          {
            text: "ПЕРЕРОДИТЬСЯ",
            className: "msg-btn-confirm",
            onClick: () => {
              resetProgressForPrestige();
            },
          },
        ],
      );
    });
  }

  updatePrestigeButton();
});
