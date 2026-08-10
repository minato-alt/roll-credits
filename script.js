const CONFIG = {
  // Put your exported Canva PDF at: letter/the-km-season-1-letter.pdf
  letterPath: "letter/the-km-season-1-letter.pdf",

  // Optional. Put a subtle ambience/projector sound at assets/ambience.mp3
  ambiencePath: "assets/ambience.mp3",

  loadingDuration: 2600,
  creditDuration: 1800,
  creditPause: 450
};

const scenes = {
  opening: document.getElementById("opening"),
  credits: document.getElementById("credits"),
  reveal: document.getElementById("reveal"),
  ending: document.getElementById("ending")
};

const loadingBar = document.getElementById("loadingBar");
const loadingText = document.getElementById("loadingText");
const playBtn = document.getElementById("playBtn");
const skipCredits = document.getElementById("skipCredits");
const openLetter = document.getElementById("openLetter");
const soundToggle = document.getElementById("soundToggle");

let ambience = null;
let creditsTimer = null;
let creditBlocks = [...document.querySelectorAll("[data-credit]")];

function showScene(scene) {
  Object.values(scenes).forEach(s => s.classList.remove("active"));
  scene.classList.add("active");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulated loading screen
async function preload() {
  const start = performance.now();

  while (performance.now() - start < CONFIG.loadingDuration) {
    const elapsed = performance.now() - start;
    const progress = Math.min(elapsed / CONFIG.loadingDuration, 1);
    loadingBar.style.width = `${progress * 100}%`;

    if (progress < 0.35) {
      loadingText.textContent = "LOADING SEASON FINALE";
    } else if (progress < 0.72) {
      loadingText.textContent = "RETRIEVING THE ARCHIVE";
    } else {
      loadingText.textContent = "READY";
    }

    await new Promise(requestAnimationFrame);
  }

  loadingBar.style.width = "100%";
  loadingText.textContent = "READY";
  playBtn.disabled = false;
}

async function startCredits() {
  showScene(scenes.credits);

  for (let i = 0; i < creditBlocks.length; i++) {
    creditBlocks[i].classList.add("show");
    await sleep(CONFIG.creditDuration);

    creditBlocks[i].classList.remove("show");
    await sleep(CONFIG.creditPause);
  }

  showScene(scenes.reveal);
}

function skipToReveal() {
  clearTimeout(creditsTimer);
  creditBlocks.forEach(block => block.classList.remove("show"));
  showScene(scenes.reveal);
}

async function openFinalScene() {
  // Open the PDF immediately from the user click.
  // This is the most reliable way to avoid browser popup blockers.
  const pdfWindow = window.open(CONFIG.letterPath, "_blank", "noopener,noreferrer");

  if (!pdfWindow) {
    // Fallback if the browser blocks the new tab.
    window.location.href = CONFIG.letterPath;
    return;
  }

  showScene(scenes.ending);
}

function setupAmbience() {
  ambience = new Audio(CONFIG.ambiencePath);
  ambience.loop = true;
  ambience.volume = 0.12;

  ambience.addEventListener("error", () => {
    // Optional audio. The page works normally if no audio file exists.
    soundToggle.style.display = "none";
  });

  soundToggle.addEventListener("click", async () => {
    if (!ambience) return;

    if (ambience.paused) {
      try {
        await ambience.play();
        soundToggle.textContent = "♫";
      } catch {
        soundToggle.textContent = "♪";
      }
    } else {
      ambience.pause();
      soundToggle.textContent = "♪";
    }
  });
}

playBtn.addEventListener("click", async () => {
  // Start ambience only after a user gesture.
  if (ambience) {
    try {
      await ambience.play();
      soundToggle.textContent = "♫";
    } catch {
      // Audio is optional.
    }
  }

  startCredits();
});

skipCredits.addEventListener("click", skipToReveal);
openLetter.addEventListener("click", openFinalScene);

setupAmbience();
preload();
