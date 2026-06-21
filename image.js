const promptEl = document.getElementById('prompt');
const goBtn = document.getElementById('goBtn');
const panel = document.getElementById('panel');
const stage = document.getElementById('stage');
const placeholder = document.getElementById('placeholder');
const seedInfo = document.getElementById('seedInfo');
const regenBtn = document.getElementById('regenBtn');
const styleRow = document.getElementById('styleRow');
const ratioGroup = document.getElementById('ratioGroup');

let activeStyle = '';
let activeRatio = '1:1';
let lastFullPrompt = '';

const dims = {
  '1:1': [1024, 1024],
  '16:9': [1280, 720],
  '9:16': [720, 1280]
};

styleRow.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  styleRow.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeStyle = chip.dataset.style;
});

ratioGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.ratio-btn');
  if (!btn) return;
  ratioGroup.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeRatio = btn.dataset.r;
  stage.classList.remove('r-16-9', 'r-9-16');
  if (activeRatio === '16:9') stage.classList.add('r-16-9');
  if (activeRatio === '9:16') stage.classList.add('r-9-16');
});

function buildUrl(fullPrompt, seed) {
  const [w, h] = dims[activeRatio];
  const encoded = encodeURIComponent(fullPrompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;
}

function setLoading(isLoading) {
  goBtn.disabled = isLoading;
  panel.classList.toggle('casting', isLoading);
  goBtn.innerHTML = isLoading
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 3l3 7-3 7 16-7z"/></svg> Logging…'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 3l3 7-3 7 16-7z"/></svg> Log entry';
}

function renderImage(fullPrompt, seed) {
  setLoading(true);
  seedInfo.textContent = `entry no. ${seed}`;

  const url = buildUrl(fullPrompt, seed);
  const img = new Image();

  img.onload = () => {
    stage.innerHTML = '';
    stage.appendChild(img);
    setLoading(false);
    regenBtn.style.display = 'inline';
  };

  img.onerror = () => {
    stage.innerHTML = `<div class="error-box">Couldn't reach the image model.<br>It may be rate-limited or briefly down — try again in a moment.</div>`;
    setLoading(false);
  };

  img.src = url;
}

function generate() {
  const raw = promptEl.value.trim();
  if (!raw) {
    promptEl.focus();
    promptEl.placeholder = 'type something first…';
    return;
  }
  const fullPrompt = (activeStyle + ' ' + raw).trim();
  lastFullPrompt = fullPrompt;
  const seed = Math.floor(Math.random() * 1000000);
  renderImage(fullPrompt, seed);
}

goBtn.addEventListener('click', generate);
regenBtn.addEventListener('click', () => {
  if (!lastFullPrompt) return;
  const seed = Math.floor(Math.random() * 1000000);
  renderImage(lastFullPrompt, seed);
});

promptEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    generate();
  }
});