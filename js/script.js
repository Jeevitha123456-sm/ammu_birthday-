// ===========================================================
// PERSONALISATION — edit these to rename the celebrant / sender
// ===========================================================
const FRIEND_NAME = "Ammu";
const SENDER_NAME = "Jeevu";

// ===========================================================
// SCROLL PROGRESS THREAD
// ===========================================================
const threadFill = document.getElementById('threadFill');
function updateThread(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  threadFill.style.width = pct + '%';
}
document.addEventListener('scroll', updateThread, { passive:true });
updateThread();

// ===========================================================
// BACKGROUND MUSIC TOGGLE
// ===========================================================
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;

musicToggle.addEventListener('click', () => {
  if(musicPlaying){
    bgMusic.pause();
    musicPlaying = false;
  } else {
    bgMusic.play().catch(() => {
      musicPlaying = false;
      updateMusicButton();
    });
    musicPlaying = true;
  }
  updateMusicButton();
});

function updateMusicButton(){
  musicToggle.classList.toggle('is-playing', musicPlaying);
  musicToggle.setAttribute('aria-pressed', String(musicPlaying));
  musicToggle.setAttribute('aria-label', musicPlaying ? 'Pause birthday music' : 'Play birthday music');
}

// ===========================================================
// TRIVIA QUESTION BANK
// Edit the "q", "options", and "correct" (0 or 1) for each entry
// to match real facts about your friend.
// ===========================================================
const QUESTIONS = [
  { q: "What's her ultimate comfort food?", options: ["Biryani", "Pizza"], correct: 0 },
  { q: "Where would she move in a heartbeat?", options: ["The mountains", "A beach town"], correct: 1 },
  { q: "Her go-to karaoke song is more likely to be...", options: ["A power ballad", "A dance hit"], correct: 1 },
  { q: "What's her hidden talent?", options: ["Mimicry", "Doodling"], correct: 0 },
  { q: "Her biggest guilty pleasure?", options: ["Late-night snacking", "Reality TV"], correct: 0 },
  { q: "First thing she does in the morning?", options: ["Checks her phone", "Makes coffee"], correct: 1 },
  { q: "Her favourite way to spend a free Sunday?", options: ["Staying in", "Going out"], correct: 0 },
  { q: "What makes her laugh the hardest?", options: ["Bad puns", "Physical comedy"], correct: 0 },
  { q: "Her dream birthday gift would be...", options: ["An experience", "Something sentimental"], correct: 1 },
  { q: "What's her go-to comfort show/movie?", options: ["A sitcom rerun", "A rom-com"], correct: 0 }
];

// ===========================================================
// QUIZ STATE + DOM
// ===========================================================
const panelStart = document.getElementById('panelStart');
const panelQuestion = document.getElementById('panelQuestion');
const panelResult = document.getElementById('panelResult');
const startBtn = document.getElementById('startBtn');
const replayBtn = document.getElementById('replayBtn');
const optA = document.getElementById('optA');
const optB = document.getElementById('optB');
const quizQuestion = document.getElementById('quizQuestion');
const quizCount = document.getElementById('quizCount');
const progressBar = document.getElementById('progressBar');
const resultTitle = document.getElementById('resultTitle');
const resultNote = document.getElementById('resultNote');
const scoreValue = document.getElementById('scoreValue');

let order = [];
let current = 0;
let score = 0;
let answering = false;

function shuffledOrder(len){
  const arr = Array.from({length: len}, (_, i) => i);
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startQuiz(){
  order = shuffledOrder(QUESTIONS.length);
  current = 0;
  score = 0;
  panelStart.classList.add('quiz__panel--hidden');
  panelResult.classList.add('quiz__panel--hidden');
  panelQuestion.classList.remove('quiz__panel--hidden');
  renderQuestion();
}

function renderQuestion(){
  answering = true;
  const item = QUESTIONS[order[current]];
  quizCount.textContent = `Question ${current + 1} of ${QUESTIONS.length}`;
  progressBar.style.width = `${(current / QUESTIONS.length) * 100}%`;
  quizQuestion.textContent = item.q;
  optA.textContent = item.options[0];
  optB.textContent = item.options[1];
  optA.classList.remove('is-correct', 'is-wrong');
  optB.classList.remove('is-correct', 'is-wrong');
}

function pick(idx, btn, otherBtn){
  if(!answering) return;
  answering = false;
  const item = QUESTIONS[order[current]];
  const correctBtn = item.correct === 0 ? optA : optB;
  const wrongBtn = item.correct === 0 ? optB : optA;

  if(idx === item.correct){
    score++;
    btn.classList.add('is-correct');
  } else {
    btn.classList.add('is-wrong');
    correctBtn.classList.add('is-correct');
  }

  setTimeout(() => {
    current++;
    if(current >= QUESTIONS.length){
      showResult();
    } else {
      renderQuestion();
    }
  }, 500);
}

optA.addEventListener('click', () => pick(0, optA, optB));
optB.addEventListener('click', () => pick(1, optB, optA));

function showResult(){
  progressBar.style.width = '100%';
  panelQuestion.classList.add('quiz__panel--hidden');
  panelResult.classList.remove('quiz__panel--hidden');
  scoreValue.textContent = score;

  if(score >= 9){
    resultTitle.textContent = `Certified Best Friend — you know her inside out!`;
    resultNote.textContent = `Basically her human diary at this point.`;
  } else if(score >= 6){
    resultTitle.textContent = `Pretty impressive!`;
    resultNote.textContent = `You know her well — a few surprises left to uncover.`;
  } else if(score >= 3){
    resultTitle.textContent = `Not bad, not bad.`;
    resultNote.textContent = `Time for a deeper heart-to-heart soon.`;
  } else {
    resultTitle.textContent = `Well, this was educational.`;
    resultNote.textContent = `Score doesn't matter — showing up for her big day does.`;
  }
}

startBtn.addEventListener('click', startQuiz);
replayBtn.addEventListener('click', startQuiz);

// ===========================================================
// BLOW OUT THE CANDLE + CONFETTI
// ===========================================================
const tieButton = document.getElementById('tieButton');
const tieMessage = document.getElementById('tieMessage');
const tieSvg = document.getElementById('tieSvg');
let blown = false;

tieButton.addEventListener('click', () => {
  if(blown) return;
  blown = true;
  tieSvg.classList.add('tie--blown');
  tieMessage.classList.add('is-visible');
  launchConfetti();
});

// Lightweight confetti — no external dependencies
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let confettiRunning = false;

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ['#D6336C', '#E8B93E', '#2FBF9A', '#FFF3E9', '#F26B96'];

function launchConfetti(){
  const count = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160;
  particles = [];
  for(let i = 0; i < count; i++){
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 140,
      y: canvas.height * 0.55,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 11 - 4,
      size: Math.random() * 7 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      gravity: 0.28,
      life: 0
    });
  }
  if(!confettiRunning){
    confettiRunning = true;
    requestAnimationFrame(animateConfetti);
  }
}

function animateConfetti(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let alive = false;
  particles.forEach(p => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.life++;
    if(p.y < canvas.height + 40) alive = true;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  });
  if(alive){
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
