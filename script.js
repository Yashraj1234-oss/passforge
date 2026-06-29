/* ============================================================
   PassForge — script.js
   Uses crypto.getRandomValues() for cryptographically secure
   random number generation (never Math.random).
   ============================================================ */

// ── DOM references ──────────────────────────────────────────
const display     = document.getElementById('password-display');
const copyBtn     = document.getElementById('copy-btn');
const copyIcon    = document.getElementById('copy-icon');
const checkIcon   = document.getElementById('check-icon');
const copyFb      = document.getElementById('copy-feedback');
const slider      = document.getElementById('length-slider');
const lengthVal   = document.getElementById('length-value');
const strengthTxt = document.getElementById('strength-text');
const bars        = document.querySelectorAll('.bar');
const errorMsg    = document.getElementById('error-msg');
const generateBtn = document.getElementById('generate-btn');
const btnIcon     = generateBtn.querySelector('svg');

// Checkboxes
const cbUpper   = document.getElementById('opt-upper');
const cbLower   = document.getElementById('opt-lower');
const cbNumbers = document.getElementById('opt-numbers');
const cbSpecial = document.getElementById('opt-special');

// ── Character pools ──────────────────────────────────────────
const POOL = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  special: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

// ── Secure random integer in [0, max) ────────────────────────
function secureRandInt(max) {
  // Use rejection sampling to avoid modulo bias
  const limit = Math.floor(0x100000000 / max) * max;
  const arr = new Uint32Array(1);
  let n;
  do {
    crypto.getRandomValues(arr);
    n = arr[0];
  } while (n >= limit);
  return n % max;
}

// ── Shuffle an array in-place (Fisher–Yates) ─────────────────
function secureShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Build password ───────────────────────────────────────────
function generatePassword() {
  const length = parseInt(slider.value, 10);

  // Collect active pools
  const activePools = [];
  if (cbUpper.checked)   activePools.push(POOL.upper);
  if (cbLower.checked)   activePools.push(POOL.lower);
  if (cbNumbers.checked) activePools.push(POOL.numbers);
  if (cbSpecial.checked) activePools.push(POOL.special);

  // Validation — at least one type must be selected
  if (activePools.length === 0) {
    showError(true);
    return null;
  }
  showError(false);

  // Combined alphabet
  const alphabet = activePools.join('');

  // Guarantee at least one character from every active pool
  const guaranteed = activePools.map(pool => pool[secureRandInt(pool.length)]);

  // Fill the rest randomly from the full alphabet
  const remaining = length - guaranteed.length;
  const rest = Array.from({ length: remaining }, () => alphabet[secureRandInt(alphabet.length)]);

  // Merge and shuffle so guaranteed chars aren't always at the start
  const chars = secureShuffle([...guaranteed, ...rest]);
  return chars.join('');
}

// ── Strength scoring ─────────────────────────────────────────
// Returns 1 (weak) → 4 (strong)
function scoreStrength(password) {
  const len = password.length;
  let score = 0;

  // Length contribution
  if (len >= 8)  score++;
  if (len >= 16) score++;
  if (len >= 32) score++;

  // Variety contribution
  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;
  if (variety >= 2) score++;
  if (variety >= 4) score++;

  // Clamp to 1–4
  return Math.max(1, Math.min(4, score));
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_CLASSES = ['', 'weak', 'fair', 'good', 'strong'];

function updateStrength(password) {
  if (!password) {
    bars.forEach(b => b.className = 'bar');
    strengthTxt.textContent = '—';
    strengthTxt.className = 'strength-text';
    return;
  }

  const score = scoreStrength(password);
  const cls = STRENGTH_CLASSES[score];

  bars.forEach((bar, i) => {
    // Activate bars up to the score level
    bar.className = 'bar' + (i < score ? ` active-${cls}` : '');
  });

  strengthTxt.textContent = STRENGTH_LABELS[score];
  strengthTxt.className = `strength-text ${cls}`;
}

// ── Update slider fill track ─────────────────────────────────
function updateSliderTrack() {
  const min = parseInt(slider.min, 10);
  const max = parseInt(slider.max, 10);
  const val = parseInt(slider.value, 10);
  const pct = ((val - min) / (max - min)) * 100;

  slider.style.background = `linear-gradient(
    to right,
    var(--accent) 0%,
    var(--accent) ${pct}%,
    var(--border) ${pct}%,
    var(--border) 100%
  )`;
}

// ── Show / hide error ────────────────────────────────────────
function showError(visible) {
  errorMsg.classList.toggle('hidden', !visible);
}

// ── Render password to screen ────────────────────────────────
function renderPassword(password) {
  if (!password) return;

  display.textContent = password;
  display.classList.remove('placeholder');

  // Enable copy
  copyBtn.disabled = false;

  updateStrength(password);
}

// ── Copy to clipboard ────────────────────────────────────────
let copyTimeout;

async function copyPassword() {
  const text = display.textContent.trim();
  if (!text || display.classList.contains('placeholder')) return;

  try {
    await navigator.clipboard.writeText(text);
    // Visual feedback
    copyIcon.classList.add('hidden');
    checkIcon.classList.remove('hidden');
    copyFb.classList.remove('hidden');

    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copyIcon.classList.remove('hidden');
      checkIcon.classList.add('hidden');
      copyFb.classList.add('hidden');
    }, 2000);
  } catch {
    // Fallback for older browsers
    const range = document.createRange();
    range.selectNode(display);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  }
}

// ── Button spin animation ────────────────────────────────────
function triggerSpin() {
  btnIcon.classList.remove('spinning');
  // Force reflow so animation retriggers on repeated clicks
  void btnIcon.offsetWidth;
  btnIcon.classList.add('spinning');
}

// ── Initialise display placeholder ──────────────────────────
function initPlaceholder() {
  display.textContent = 'Click generate →';
  display.classList.add('placeholder');
  copyBtn.disabled = true;
}

// ── Event listeners ──────────────────────────────────────────

// Generate button
generateBtn.addEventListener('click', () => {
  triggerSpin();
  const pw = generatePassword();
  if (pw) renderPassword(pw);
});

// Copy button
copyBtn.addEventListener('click', copyPassword);

// Slider: update numeric label + track fill
slider.addEventListener('input', () => {
  const val = slider.value;
  lengthVal.textContent = val;
  slider.setAttribute('aria-valuenow', val);
  updateSliderTrack();
});

// Checkbox changes: hide any lingering error
[cbUpper, cbLower, cbNumbers, cbSpecial].forEach(cb => {
  cb.addEventListener('change', () => {
    // Only clear error; don't auto-regenerate
    const anyChecked = cbUpper.checked || cbLower.checked
                    || cbNumbers.checked || cbSpecial.checked;
    if (anyChecked) showError(false);
  });
});

// ── Init ─────────────────────────────────────────────────────
initPlaceholder();
updateSliderTrack();
