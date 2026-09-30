/**
 * bundle.js — IELTS Vocabulary Trainer
 * Rick & Morty inspired theme · British English pronunciation
 * ============================================================
 */

document.documentElement.setAttribute('data-js', 'yes');

/* ============== audio.js ============== */
var audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { audioCtx = null; }
  }
  return audioCtx;
}

function playTone(freq, startAt, duration, type, gain) {
  type = type || 'sine'; gain = gain || 0.18;
  var ctx = getAudioCtx();
  if (!ctx) return;
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(ctx.destination);
  var t = ctx.currentTime + startAt;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function playCorrect() {
  playTone(523.25, 0.00, 0.22, 'sine', 0.20);
  playTone(659.25, 0.12, 0.22, 'sine', 0.20);
  playTone(783.99, 0.24, 0.32, 'triangle', 0.22);
}

function playWrong() {
  var ctx = getAudioCtx();
  if (!ctx) return;
  playTone(220.00, 0.00, 0.18, 'square', 0.14);
  playTone(164.81, 0.16, 0.28, 'square', 0.14);
  var bufSize = ctx.sampleRate * 0.2;
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize) * 0.12;
  }
  var ns = ctx.createBufferSource();
  ns.buffer = buf;
  var ng = ctx.createGain();
  ng.gain.value = 0.7;
  ns.connect(ng);
  ng.connect(ctx.destination);
  ns.start();
}

var currentUtterance = null;
var speechReady = false;

function warmUpSpeech() {
  if (!window.speechSynthesis || speechReady) return;
  try {
    var voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { speechReady = true; return; }
    window.speechSynthesis.onvoiceschanged = function() {
      window.speechSynthesis.getVoices();
      speechReady = true;
    };
    var u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}

/* British English voice — prefers en-GB, falls back to any en */
function speak(word) {
  if (!word || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    var voices = window.speechSynthesis.getVoices();
    var u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-GB';
    u.rate = 0.78;
    u.pitch = 1;
    var gbVoice = null;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v.lang && v.lang.startsWith('en-GB')) { gbVoice = v; break; }
    }
    if (gbVoice) u.voice = gbVoice;
    u.volume = 1;
    currentUtterance = u;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

/* ============== storage.js ============== */
var ERROR_KEY = 'daily-120-vocabulary-errors';
var DAILY_HISTORY_KEY = 'daily-120-vocabulary-history';

function normalizeWordKey(word) {
  return String(word || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function getErrors() {
  var stored;
  try { stored = JSON.parse(localStorage.getItem(ERROR_KEY) || '[]'); }
  catch (e) { return []; }

  if (!Array.isArray(stored)) return [];
  var merged = [];
  for (var i = 0; i < stored.length; i++) {
    var item = stored[i];
    if (!item || !item.word) continue;
    var source = item.source || 'daily';
    var key = source + '|' + normalizeWordKey(item.word);
    var existing = null;
    for (var j = 0; j < merged.length; j++) {
      if (merged[j]._key === key) { existing = merged[j]; break; }
    }
    var attempts = Math.max(1, Number(item.attempts) || 1);
    if (existing) {
      existing.attempts += attempts;
      if (String(item.date || '') >= String(existing.date || '')) {
        existing.answer = item.answer || existing.answer;
        existing.date = item.date || existing.date;
        existing.mode = item.mode || existing.mode;
        existing.meaning = item.meaning || existing.meaning;
      }
    } else {
      merged.push({
        _key: key,
        word: String(item.word).trim().replace(/\s+/g, ' '),
        meaning: item.meaning || '暂无中文释义',
        answer: item.answer || '未填写',
        date: item.date || '',
        mode: item.mode || 'unknown',
        source: source,
        attempts: attempts
      });
    }
  }

  var result = merged.map(function(item) {
    var copy = Object.assign({}, item);
    delete copy._key;
    return copy;
  });
  if (JSON.stringify(stored) !== JSON.stringify(result)) {
    localStorage.setItem(ERROR_KEY, JSON.stringify(result));
  }
  return result;
}

function saveErrors(errors) {
  localStorage.setItem(ERROR_KEY, JSON.stringify(errors));
  updateErrorCountUI(
    document.getElementById('errorCount'),
    document.getElementById('ieltsErrorCount')
  );
}

function saveError(word, answer, mode, source) {
  var errors = getErrors();
  var sourceName = source || 'daily';
  var key = normalizeWordKey(word.word);
  var existing = errors.find(function(item) {
    return item.source === sourceName && normalizeWordKey(item.word) === key;
  });
  if (existing) {
    existing.attempts = (Number(existing.attempts) || 1) + 1;
    existing.meaning = word.meaning || existing.meaning;
    existing.answer = answer || '未填写';
    existing.date = new Date().toISOString().slice(0, 10);
    existing.mode = mode || existing.mode;
  } else {
    errors.push({
      word: word.word,
      meaning: word.meaning,
      answer: answer || '未填写',
      date: new Date().toISOString().slice(0, 10),
      mode: mode || 'unknown',
      source: sourceName,
      attempts: 1
    });
  }
  saveErrors(errors);
  return errors;
}

function getDailyWordHistory() {
  try {
    var history = JSON.parse(localStorage.getItem(DAILY_HISTORY_KEY) || '[]');
    return Array.isArray(history) ? history : [];
  } catch (e) { return []; }
}

function saveDailyWordList(value) {
  var history = getDailyWordHistory();
  var current = localStorage.getItem(STORAGE_KEY) || '';
  var snapshots = [current, value];
  for (var i = 0; i < snapshots.length; i++) {
    var content = String(snapshots[i] || '').trim();
    if (!content) continue;
    var existing = history.find(function(item) { return item.content === content; });
    if (existing) {
      existing.savedAt = new Date().toISOString();
    } else {
      history.push({ content: content, savedAt: new Date().toISOString() });
    }
  }
  history.sort(function(a, b) { return new Date(a.savedAt) - new Date(b.savedAt); });
  localStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(history.slice(-50)));
  localStorage.setItem(STORAGE_KEY, value);
}

function updateErrorCountUI(dailyEl, ieltsEl) {
  var errors = getErrors();
  var dailyCount = errors.filter(function(e) { return e.source === 'daily'; }).length;
  var ieltsCount = errors.filter(function(e) { return e.source === 'ielts'; }).length;
  if (dailyEl) dailyEl.textContent = dailyCount;
  if (ieltsEl) ieltsEl.textContent = ieltsCount;
}

/* ============== wormhole.js ============== */
var STATUS_MSGS = [
  { t: 0.0,  text: '⚡ 传送门启动...',          sub: '正在充能粒子加速器' },
  { t: 0.18, text: '🔮 正在穿越次元屏障...',     sub: '已突破第 3 维度' },
  { t: 0.38, text: '🌌 目标锁定：IELTS 词汇星域', sub: '量子导航已校准' },
  { t: 0.58, text: '🌀 进入时空隧道...',         sub: '相对论弯曲率 78.3%' },
  { t: 0.75, text: '📡 接近中...',              sub: '准备接收数据流' },
  { t: 0.92, text: '✅ 抵达目的地',              sub: '词汇同步率 100%' }
];

var wormholeActive = false;
var wormholeSkipCallback = null;
var wormholeRAF = null;

function startWormhole(callback) {
  var canvas = document.getElementById('wormhole');
  var statusOverlay = document.getElementById('wormholeStatus');
  var statusText = statusOverlay.querySelector('.status-text');
  var statusSub = statusOverlay.querySelector('.status-sub');
  var skipHint = document.getElementById('wormholeSkip');
  var ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');
  statusOverlay.classList.add('active');
  if (skipHint) skipHint.classList.add('active');

  wormholeActive = true;
  wormholeSkipCallback = callback;

  var cx = canvas.width / 2;
  var cy = canvas.height / 2;
  var focalLength = 400;
  var NUM_RINGS = 30;
  var NUM_PARTICLES = 120;
  var MAX_DEPTH = 5000;

  var rings = [];
  for (var i = 0; i < NUM_RINGS; i++) {
    rings.push({
      z: -MAX_DEPTH + (MAX_DEPTH / NUM_RINGS) * i,
      radius: 60 + Math.random() * 150,
      hue: 160 + Math.random() * 60,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.0003 + Math.random() * 0.0006,
      thickness: 1.5 + Math.random() * 2
    });
  }

  var particles = [];
  for (var j = 0; j < NUM_PARTICLES; j++) {
    particles.push({
      z: -Math.random() * MAX_DEPTH,
      xOffset: (Math.random() - 0.5) * 200,
      yOffset: (Math.random() - 0.5) * 200,
      speed: 18 + Math.random() * 17,
      size: 1.5 + Math.random() * 2.5,
      hue: 140 + Math.random() * 100,
      brightness: 60 + Math.random() * 40
    });
  }

  var coreParticles = [];
  for (var k = 0; k < 30; k++) {
    var angle = Math.random() * Math.PI * 2;
    var rad = Math.random() * 50;
    coreParticles.push({
      x: cx + Math.cos(angle) * rad,
      y: cy + Math.sin(angle) * rad,
      angle: angle, rad: rad,
      speed: 0.005 + Math.random() * 0.01,
      size: 2 + Math.random() * 4,
      hue: Math.random() > 0.5 ? 120 : 160
    });
  }

  var DURATION = 8500;
  var startTime = performance.now();

  function finishWormhole() {
    if (!wormholeActive) return;
    wormholeActive = false;
    if (wormholeRAF) { cancelAnimationFrame(wormholeRAF); wormholeRAF = null; }
    canvas.classList.remove('active');
    canvas.classList.add('fadeout');
    statusOverlay.classList.remove('active');
    if (skipHint) skipHint.classList.remove('active');
    setTimeout(function() {
      canvas.classList.remove('fadeout');
      canvas.style.opacity = '0';
      if (wormholeSkipCallback) {
        var cb = wormholeSkipCallback;
        wormholeSkipCallback = null;
        cb();
      }
    }, 600);
  }

  function skipWormhole() {
    if (!wormholeActive) return;
    if (skipHint) skipHint.classList.remove('active');
    finishWormhole();
  }

  /* Bind skip handlers — fires once */
  var skipHandler = function(e) {
    if (!wormholeActive) return;
    /* Ignore checkbox change event that would conflict with the toggle */
    if (e.target && e.target.id === 'startToggle') return;
    skipWormhole();
  };
  document.addEventListener('keydown', skipHandler, { once: true });
  if (skipHint) {
    skipHint.addEventListener('click', function(e) {
      if (!wormholeActive) return;
      skipWormhole();
    }, { once: true });
  }

  function animate() {
    if (!wormholeActive) return;
    var elapsed = performance.now() - startTime;
    var progress = Math.min(elapsed / DURATION, 1);

    // Update status text
    for (var m = STATUS_MSGS.length - 1; m >= 0; m--) {
      if (progress >= STATUS_MSGS[m].t) {
        statusText.textContent = STATUS_MSGS[m].text;
        statusSub.textContent = STATUS_MSGS[m].sub;
        break;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var ease = 1 - Math.pow(1 - progress, 2.5);

    // Tunnel rings
    for (var r = 0; r < rings.length; r++) {
      var ring = rings[r];
      var z = ring.z + elapsed * 0.15;
      if (z > 100) { z = -MAX_DEPTH; ring.radius = 60 + Math.random() * 150; ring.hue = 160 + Math.random() * 60; }
      ring.z = z;
      ring.rotation += ring.rotSpeed * elapsed * 0.3;
      var scale = focalLength / (focalLength + z + ease * 500);
      if (scale < 0.01) continue;
      var screenR = ring.radius * scale;
      var alpha = Math.min(1, (1 - Math.abs(z) / MAX_DEPTH)) * 0.5 * (0.4 + ease * 0.3);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.rotation * 2);
      ctx.scale(1 + ease * 0.3, 1 - ease * 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, screenR, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsla(' + (ring.hue + ease * 30) + ', 80%, ' + (50 + ease * 20) + '%, ' + alpha + ')';
      ctx.lineWidth = Math.max(0.5, ring.thickness * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, screenR * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsla(' + (ring.hue + 40) + ', 70%, 60%, ' + (alpha * 0.3) + ')';
      ctx.lineWidth = Math.max(0.3, ring.thickness * scale * 0.5);
      ctx.stroke();
      ctx.restore();
    }

    // Flying particles
    for (var p = 0; p < particles.length; p++) {
      var pt = particles[p];
      var pz = pt.z + elapsed * 0.12 * pt.speed * 0.02;
      if (pz > 100) { pz = -MAX_DEPTH; pt.xOffset = (Math.random() - 0.5) * 300; pt.yOffset = (Math.random() - 0.5) * 300; }
      pt.z = pz;
      var spiralAngle = elapsed * 0.001 + pz * 0.002;
      var spiralMag = 20 + ease * 60;
      var px = cx + pt.xOffset * (1 - ease * 0.3) + Math.cos(spiralAngle) * spiralMag;
      var py = cy + pt.yOffset * (1 - ease * 0.3) + Math.sin(spiralAngle) * spiralMag;
      var ps = focalLength / (focalLength + pz + ease * 300);
      if (ps < 0.01) continue;
      var pa = Math.min(1, (1 - Math.abs(pz) / MAX_DEPTH)) * 0.7 * (0.3 + ease * 0.3);
      var psize = pt.size * ps;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.5, psize), 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + (pt.hue + ease * 30) + ', 80%, ' + pt.brightness + '%, ' + pa + ')';
      ctx.fill();
      if (psize > 1) {
        ctx.beginPath();
        ctx.arc(px, py, psize * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + (pt.hue + ease * 30) + ', 80%, ' + pt.brightness + '%, ' + (pa * 0.15) + ')';
        ctx.fill();
      }
    }

    // Core particles
    for (var c = 0; c < coreParticles.length; c++) {
      var cp = coreParticles[c];
      cp.angle += cp.speed * elapsed * 0.5;
      var cr = cp.rad * (1 + ease * 0.5);
      var cpx = cx + Math.cos(cp.angle + ease * 2) * cr;
      var cpy = cy + Math.sin(cp.angle * 0.7 + ease * 1.5) * cr * 0.8;
      var ca = (1 - ease * 0.3) * 0.6;
      ctx.beginPath();
      ctx.arc(cpx, cpy, cp.size * (1 - ease * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + cp.hue + ', 100%, 60%, ' + ca + ')';
      ctx.fill();
    }

    // Center glow
    var glowR = 30 + ease * 120;
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    var glowIntensity = progress < 0.5 ? progress * 2 * 0.4 : (1 - (progress - 0.5) * 2) * 0.4;
    grad.addColorStop(0, 'rgba(57, 255, 20, ' + glowIntensity + ')');
    grad.addColorStop(0.3, 'rgba(103, 232, 249, ' + (glowIntensity * 0.5) + ')');
    grad.addColorStop(0.6, 'rgba(167, 139, 250, ' + (glowIntensity * 0.2) + ')');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White flash at the end
    if (progress > 0.9) {
      var flash = (progress - 0.9) * 10;
      ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(flash * 0.3, 0.6) + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (progress < 1) {
      wormholeRAF = requestAnimationFrame(animate);
    } else {
      canvas.classList.remove('active');
      canvas.classList.add('fadeout');
      statusOverlay.classList.remove('active');
      if (skipHint) skipHint.classList.remove('active');
      setTimeout(function() {
        canvas.classList.remove('fadeout');
        canvas.style.opacity = '0';
        wormholeActive = false;
        if (callback) callback();
      }, 600);
    }
  }
  animate();
}

/* ============== app.js ============== */
var STORAGE_KEY = 'daily-120-vocabulary';
var SAMPLE = 'abandon\t放弃\nresilient\t有韧性的\nmeticulous\t一丝不苟的\narticulate\t善于表达的\nimmerse\t沉浸';

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, function(c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function shuffle(a) {
  var r = a.slice();
  for (var i = r.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = r[i]; r[i] = r[j]; r[j] = tmp;
  }
  return r;
}

function coinFlip() { return Math.random() < 0.5; }

/* ----- Vocabulary Parsing (daily) ----- */
function parseWords(value) {
  return value.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean).map(function(line) {
    var parts = line.split(/\t|\s+-\s+|\s*,\s*|={1,2}/).map(function(p) { return p.trim(); }).filter(Boolean);
    if (parts.length > 1) return { word: parts[0], meaning: parts.slice(1).join(' / ') || '暂无中文释义' };
    var ci = line.search(/[\u3400-\u9fff]/);
    if (ci < 0) return { word: line, meaning: '暂无中文释义' };
    var w = line.slice(0, ci).trim();
    var m = line.slice(ci).trim();
    w = w.replace(/\s*\((?:n|v|adj|adv|prep|conj|pron|短语)\)\s*$/i, '').trim();
    return { word: w, meaning: m || '暂无中文释义' };
  }).filter(function(e) { return e.word; });
}

/* ============================================================
   IELTS Vocabulary — loaded from js/data/ielts.js
   ============================================================ */
var IELTS_WORDS = [];
var IELTS_SECTIONS = {};
var ieltsWords = [];

function initIELTSData() {
  if (typeof IELTS_WORDS_DATA !== 'undefined' && IELTS_WORDS_DATA.length) {
    var sections = {};
    var all = [];
    for (var i = 0; i < IELTS_WORDS_DATA.length; i++) {
      var item = IELTS_WORDS_DATA[i];
      var sec = item.section || '全部';
      all.push(item);
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push(item);
    }
    IELTS_WORDS = all;
    IELTS_SECTIONS = sections;
    ieltsWords = all.slice();
  } else {
    /* Fallback: try to load from original TXT via XHR */
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'IELTS_core_vocabulary/IELTS 词库.txt', false);
      xhr.overrideMimeType && xhr.overrideMimeType('text/plain; charset=utf-8');
      xhr.onload = function() {
        if (xhr.status === 0 || xhr.status === 200) parseIELTSRawText(xhr.responseText);
      };
      xhr.send();
    } catch (e) { /* file:// — no fallback */ }
  }
}

/* Only used as XHR fallback */
function parseIELTSRawText(raw) {
  var lines = (raw || '').split(/\r?\n/);
  var sections = {};
  var all = [];
  var currentSection = '全部';
  var i, line, trimmed;
  for (i = 0; i < lines.length; i++) {
    trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (/^第[一二三四五六七八九十]+节/.test(trimmed)) {
      currentSection = trimmed;
      if (!sections[currentSection]) sections[currentSection] = [];
      continue;
    }
    if (/^[一二三四五六七八九十]+[、\s]/.test(trimmed) && trimmed.length < 20) continue;
    var item = parseIELTSLine(trimmed);
    if (item) {
      item.section = currentSection;
      all.push(item);
      if (sections[currentSection]) sections[currentSection].push(item);
    }
  }
  IELTS_WORDS = all;
  IELTS_SECTIONS = sections;
  ieltsWords = all.slice();
}

function parseIELTSLine(line) {
  var m = line.match(/^(.+?)\s*\[([^\]]*)\]\s*(.*)$/);
  if (m) return { word: m[1].trim(), meaning: m[3].trim() || '暂无释义' };
  m = line.match(/^(.+?)\s+([\u3400-\u9fff].*)$/);
  if (m) return { word: m[1].trim(), meaning: m[2].trim() };
  if (line.length > 0 && !/^[一二三四五六七八九十]/.test(line) && !/^第/.test(line) && !/[\u3400-\u9fff]/.test(line)) {
    return { word: line, meaning: '暂无释义' };
  }
  return null;
}

/* Initialize */
initIELTSData();

/* ----- Letter Comparison (after submission) ----- */
function renderLetterComparison(correctWord, userAnswer) {
  var correct = (correctWord || '').split('');
  var answer = (userAnswer || '').split('');
  var html = '<div class="letter-slots result-slots">';
  var len = Math.max(correct.length, answer.length);
  for (var i = 0; i < len; i++) {
    var c = correct[i];
    var a = answer[i];
    if (c === undefined) html += '<span class="slot extra">' + escapeHtml(a.toUpperCase()) + '</span>';
    else if (c === ' ' && (a === undefined || a === ' ')) html += '<span class="slot space">&nbsp;</span>';
    else if (a === undefined) html += '<span class="slot missing">_</span>';
    else if (c.toLowerCase() === a.toLowerCase()) html += '<span class="slot correct">' + escapeHtml(c.toUpperCase()) + '</span>';
    else html += '<span class="slot wrong">' + escapeHtml(a.toUpperCase()) + '</span>';
  }
  html += '</div>';
  return html;
}

/* ----- Session State ----- */
var currentDailySession = null;
var currentIELTSSession = null;
var selectedIELTSSection = '全部';

function getSession(source) {
  return source === 'daily' ? currentDailySession : currentIELTSSession;
}
function setSession(source, s) {
  if (source === 'daily') currentDailySession = s;
  else currentIELTSSession = s;
}
function getActiveSource() {
  var active = document.querySelector('.nav-tab.active');
  return active ? (active.dataset.tab || 'daily') : 'daily';
}

/* ----- Card Rendering ----- */
function renderCard(source) {
  var session = getSession(source);
  var isIELTS = source === 'ielts';
  var cardArea = document.getElementById(isIELTS ? 'ieltsCardArea' : 'cardArea');
  var progressText = document.getElementById(isIELTS ? 'ieltsProgressText' : 'progressText');
  var progressBar = document.getElementById(isIELTS ? 'ieltsProgressBar' : 'progressBar');

  if (!session || !session.words || !session.words.length) {
    cardArea.className = 'empty';
    cardArea.innerHTML = '<div><strong>' + (isIELTS ? 'IELTS 核心词汇已就绪' : '准备好了吗？') + '</strong>' + (isIELTS ? '点击"随机开始默写"开始练习。' : '在左侧粘贴词表，然后点击"随机开始"。') + '</div>';
    progressText.textContent = '尚未开始';
    progressBar.style.width = '0%';
    return;
  }

  var word = session.words[session.index];
  if (!word) {
    cardArea.className = 'empty';
    cardArea.innerHTML = '<div><strong>全部完成！</strong>正确 ' + session.correctCount + ' 题，错误 ' + session.wrong + ' 题。</div>';
    progressText.textContent = '已完成';
    progressBar.style.width = '100%';
    return;
  }

  var total = session.words.length;
  var done = session.index + (session.submitted ? 1 : 0);

  function modeName(m) { return ({ audio: '听音默写', meaning: '看义默写', mixed: '混合默写' })[m] || m; }
  progressText.textContent = Math.min(done, total) + ' / ' + total + ' · ' + modeName(session.mode);
  progressBar.style.width = Math.round((Math.min(done, total) / total) * 100) + '%';

  var promptMode = session.promptMode;
  var prompt = promptMode === 'audio'
    ? '<span class="prompt-label">请听发音并默写英文</span><br>🔊 点击下方按钮或按 Ctrl+A 重播<br><button class="button meaning-hint-btn" data-action="hint" type="button">查看中文释义</button> <span class="meaning-hint-text" hidden>' + escapeHtml(word.meaning) + '</span>'
    : '<span class="prompt-label">中文意思</span><br>' + escapeHtml(word.meaning);

  var letterHtml = '';
  var resultHtml = '';
  var extraSpeakBtn = '';

  if (session.submitted) {
    /* After submission: show comparison + word card + speak */
    letterHtml = renderLetterComparison(word.word, session.answer);

    /* Display word & meaning — NO slot underlines */
    resultHtml =
      '<div class="result-word-card">' +
        '<div class="result-word-en">' + escapeHtml(word.word) + '</div>' +
        '<div class="result-word-cn">' + escapeHtml(word.meaning) + '</div>' +
        '<button class="button result-speak-btn" data-action="speak" type="button">🔊 播放发音</button>' +
      '</div>';

    if (session.answerCorrect) {
      letterHtml += '<div class="result correct">✅ 正确</div>';
    } else {
      letterHtml += '<div class="result wrong">❌ 你的答案：<strong>' + escapeHtml(session.answer || '未填写') + '</strong></div>';
    }
  }

  var statsHtml = (session.index > 0 || session.submitted)
    ? '<div class="stats-bar"><span class="stat ok">✓ 正确 ' + session.correctCount + '</span><span class="stat err">✗ 错误 ' + session.wrong + '</span></div>'
    : '';

  cardArea.className = 'card';
  cardArea.innerHTML =
    '<div class="card-number">WORD ' + String(session.index + 1).padStart(3, '0') + ' / ' + total + '</div>' +
    '<div class="prompt">' + prompt + '</div>' +
    '<div class="card-actions">' +
      '<button class="button" data-action="speak" type="button">🔊 播放发音</button>' +
    '</div>' +
    letterHtml +
    resultHtml +
    statsHtml +
    '<div class="feedback">' +
      (session.submitted
        ? '<button class="button" data-action="next" type="button">' + (session.index >= total - 1 ? '完成本轮 ✓' : '下一题 →') + '</button>' +
          '<button class="button" data-action="repeat" type="button">🔄 再来一次</button>'
        : '<span style="color:var(--text-muted);">直接输入答案 · Enter提交 · Ctrl+A重播</span>') +
    '</div>';

  if (!session.submitted && word) {
    var promptEl = cardArea.querySelector('.prompt');
    if (promptEl) {
      var slotsDiv = document.createElement('div');
      slotsDiv.className = 'letter-input-container';
      var wordLen = Math.max((word.word || '').length, 1);
      var slotsHTML = '';
      for (var s = 0; s < wordLen; s++) {
        slotsHTML += word.word.charAt(s) === ' '
          ? '<span class="slot space">&nbsp;</span>'
          : '<span class="slot empty">_</span>';
      }
      slotsDiv.innerHTML =
    '<div class="letter-slots" id="liveSlots-' + source + '">' + slotsHTML + '</div>' +
    '<div style="font:12px -apple-system,sans-serif;color:var(--text-muted);">直接输入答案（短语可含空格和标点）· Enter提交 · Ctrl+A重播</div>';
      promptEl.after(slotsDiv);
    }
  }
  cardArea.dataset.currentWord = word ? word.word : '';
}

function startSession(words, source, isErrors) {
  if (!words.length) {
    var statusEl = document.getElementById(source === 'ielts' ? 'ieltsStatus' : 'status');
    statusEl.textContent = '没有可用的单词。';
    return;
  }

  var isIELTS = source === 'ielts';
  var modeSelector = isIELTS ? 'input[name="ieltsMode"]:checked' : 'input[name="mode"]:checked';
  var pickedMode = (document.querySelector(modeSelector) || {}).value || 'audio';
  var firstPromptMode = pickedMode === 'mixed' ? (coinFlip() ? 'audio' : 'meaning') : pickedMode;

  var session = {
    words: shuffle(words), index: 0, mode: pickedMode,
    submitted: false, answer: '', answerCorrect: false,
    promptMode: firstPromptMode, source: source,
    correctCount: 0, wrong: 0, errors: []
  };
  setSession(source, session);

  var statusEl = document.getElementById(isIELTS ? 'ieltsStatus' : 'status');
  statusEl.textContent = isErrors
    ? '已载入 ' + words.length + ' 道错题，开始错题默写。'
    : '已生成随机顺序，共 ' + words.length + ' 个单词。';

  renderCard(source);
  if (session.promptMode === 'audio' && words[0]) speak(words[0].word);
}

function handleNext(source) {
  var session = getSession(source);
  if (!session || !session.submitted) return;

  if (session.index < session.words.length - 1) {
    session.index += 1;
    session.submitted = false;
    session.answer = '';
    session.promptMode = session.mode === 'mixed' ? (coinFlip() ? 'audio' : 'meaning') : session.mode;
    renderCard(source);
    if (session.promptMode === 'audio') speak(session.words[session.index]?.word);
  } else {
    var statusEl = document.getElementById(source === 'ielts' ? 'ieltsStatus' : 'status');
    statusEl.textContent = '本轮完成：正确 ' + session.correctCount + ' 题，错误 ' + session.wrong + ' 题。';
    renderCard(source);
  }
}

/* ----- IELTS Section UI ----- */
function updateIELTSSections() {
  var container = document.getElementById('ieltsSections');
  var sectionNames = Object.keys(IELTS_SECTIONS);
  if (!sectionNames.length) {
    container.innerHTML = '<span style="color:var(--text-muted);">词库加载中...</span>';
    return;
  }
  var html = '<button class="button ' + (selectedIELTSSection === '全部' ? 'primary' : '') + '" data-section="全部">全部 (' + IELTS_WORDS.length + ')</button>';
  for (var i = 0; i < sectionNames.length; i++) {
    var name = sectionNames[i];
    var count = (IELTS_SECTIONS[name] || []).length;
    var isActive = selectedIELTSSection === name;
    html += '<button class="button ' + (isActive ? 'primary' : '') + '" data-section="' + escapeHtml(name) + '">' + escapeHtml(name) + ' (' + count + ')</button>';
  }
  container.innerHTML = html;

  var buttons = container.querySelectorAll('button');
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].addEventListener('click', function() {
      var section = this.dataset.section;
      selectedIELTSSection = section;
      updateIELTSSections();
      ieltsWords = section === '全部' ? IELTS_WORDS.slice() : (IELTS_SECTIONS[section] || []).slice();
      document.getElementById('ieltsWordCount').textContent = ieltsWords.length + ' 词';
    });
  }
}

/* ----- Tab Switching ----- */
function switchTab(tabId) {
  var tabs = document.querySelectorAll('.nav-tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  var contents = document.querySelectorAll('.tab-content');
  for (var j = 0; j < contents.length; j++) contents[j].classList.remove('active');
  document.querySelector('.nav-tab[data-tab="' + tabId + '"]').classList.add('active');
  document.getElementById('tab-' + tabId).classList.add('active');
  renderCard(tabId);
}

/* ----- Slot Input (live typing, underscored start) ----- */
function renderLiveSlots(source, correctWord, input) {
  var container = document.getElementById('liveSlots-' + source);
  if (!container) return;
  var correct = (correctWord || '').split('');
  var answer = (input || '').split('');
  var len = Math.max(correct.length, answer.length, 1);
  var html = '';
  for (var i = 0; i < len; i++) {
    var c = correct[i];
    var a = answer[i];
    if (c === ' ' && (a === undefined || a === ' ')) {
      html += '<span class="slot space">&nbsp;</span>';
    } else if (!a) {
      /* Empty slot — show underscore only, never reveal the letter */
      html += '<span class="slot empty">_</span>';
    } else {
      html += '<span class="slot filled">' + (a === ' ' ? '&nbsp;' : escapeHtml(a.toUpperCase())) + '</span>';
    }
  }
  container.innerHTML = html;
}

function handleSlotSubmit(source, word, session, input) {
  var answer = input.trim().replace(/\s+/g, ' ');
  session.answer = answer;
  session.answerCorrect = answer.toLowerCase() === word.word.trim().replace(/\s+/g, ' ').toLowerCase();
  session.submitted = true;
  delete session.inputBuffer;

  if (session.answerCorrect) {
    session.correctCount += 1;
    playCorrect();
  } else {
    session.wrong += 1;
    saveError(word, answer, session.mode === 'mixed' ? session.promptMode : session.mode, source);
    playWrong();
  }
  renderCard(source);

  /* Auto-speak word after submission (British English) */
  setTimeout(function() {
    speak(word.word);
  }, 400);
}

/* ----- Update Daily Count ----- */
function updateDailyCount() {
  var input = document.getElementById('wordInput');
  var count = document.getElementById('wordCount');
  var total = parseWords(input.value).length;
  count.textContent = total + ' / 120';
}

var errorManagerSource = 'daily';

function renderErrorManager() {
  var list = document.getElementById('errorManagerList');
  var errors = getErrors();
  var entries = [];
  for (var i = 0; i < errors.length; i++) {
    if (errors[i].source === errorManagerSource) entries.push({ error: errors[i], index: i });
  }
  if (!entries.length) {
    list.innerHTML = '<p class="manager-empty">这个词库还没有错题记录。</p>';
    return;
  }
  list.innerHTML = entries.map(function(entry) {
    var error = entry.error;
    return '<article class="manager-entry">' +
      '<div class="manager-entry-main"><strong>' + escapeHtml(error.word) + '</strong>' +
      '<span>' + escapeHtml(error.meaning || '暂无中文释义') + '</span></div>' +
      '<div class="manager-entry-meta">累计错答 ' + (Number(error.attempts) || 1) + ' 次 · 最近 ' + escapeHtml(error.date || '未知') + '</div>' +
      '<div class="manager-entry-actions"><button class="button" data-action="edit-error" data-index="' + entry.index + '" type="button">编辑</button>' +
      '<button class="button coral" data-action="delete-error" data-index="' + entry.index + '" type="button">删除</button></div>' +
      '<div class="manager-editor" data-editor="' + entry.index + '" hidden>' +
      '<label>英文词条<input name="word" value="' + escapeHtml(error.word) + '"></label>' +
      '<label>中文释义<input name="meaning" value="' + escapeHtml(error.meaning || '') + '"></label>' +
      '<button class="button primary" data-action="save-error" data-index="' + entry.index + '" type="button">保存修改</button></div>' +
      '</article>';
  }).join('');
}

function renderDailyHistory() {
  var list = document.getElementById('dailyHistoryList');
  var history = getDailyWordHistory();
  if (!history.length) {
    list.innerHTML = '<p class="manager-empty">还没有已保存的词表历史。开始练习后，词表会自动归档。</p>';
    return;
  }
  list.innerHTML = history.map(function(item, index) {
    var date = new Date(item.savedAt);
    var dateText = isNaN(date.getTime()) ? '未知日期' : date.toLocaleString();
    var preview = item.content.split(/\r?\n/).slice(0, 2).join(' · ');
    return '<article class="manager-entry history-entry"><div class="manager-entry-main"><strong>' +
      escapeHtml(dateText) + ' · ' + parseWords(item.content).length + ' 个词</strong><span>' + escapeHtml(preview) +
      '</span></div><button class="button" data-action="restore-daily-list" data-history-index="' + index + '" type="button">恢复此词表</button></article>';
  }).reverse().join('');
}

/* ----- Initialization ----- */
function init() {
  /* IELTS data is already parsed from embedded string */
  document.getElementById('ieltsWordCount').textContent = IELTS_WORDS.length + ' 词';
  updateIELTSSections();

  var dailyInput = document.getElementById('wordInput');
  dailyInput.value = localStorage.getItem(STORAGE_KEY) || '';
  updateDailyCount();

  updateErrorCountUI(
    document.getElementById('errorCount'),
    document.getElementById('ieltsErrorCount')
  );
}

/* ==================================================================
   EVENT BINDING
   ================================================================== */
document.addEventListener('DOMContentLoaded', function() {
  init();

  // ---- Landing toggle ----
  var startToggle = document.getElementById('startToggle');

  /* Launch function */
  function launchApp() {
    if (window._wormholeLaunched) return;
    window._wormholeLaunched = true;

    /* Force checkbox to ON for visual lever animation */
    startToggle.checked = true;

    /* Show immediate visual feedback */
    var switchEl = document.querySelector('.knife-switch');
    switchEl.style.transition = 'box-shadow 0.15s';
    switchEl.style.boxShadow = '0 0 60px rgba(57,255,20,0.4)';

    /* Failsafe: force transition after 10s even if wormhole hangs */
    var failsafeTimer = setTimeout(function() {
      if (!window._appShown) {
        document.getElementById('landing').classList.add('hidden');
        document.getElementById('app').classList.add('show');
        window._appShown = true;
      }
    }, 10000);

    /* Short delay for CSS transition to render lever drop */
    setTimeout(function() {
      try {
        getAudioCtx();
        warmUpSpeech();
        startWormhole(function() {
          if (window._appShown) return;
          window._appShown = true;
          clearTimeout(failsafeTimer);
          document.getElementById('landing').classList.add('hidden');
          document.getElementById('app').classList.add('show');
        });
      } catch (err) {
        console.warn('launch err:', err);
        /* Fallback: direct transition */
        if (!window._appShown) {
          window._appShown = true;
          clearTimeout(failsafeTimer);
          document.getElementById('landing').classList.add('hidden');
          document.getElementById('app').classList.add('show');
        }
      }
    }, 300);
  }

  /* Primary: click on the knife-switch */
  document.querySelector('.knife-switch').addEventListener('click', function(e) {
    launchApp();
    e.preventDefault();
    e.stopPropagation();
  });

  /* Backup: checkbox change event */
  startToggle.addEventListener('change', function() {
    if (this.checked) launchApp();
  });

  /* Backup: click the "⏎ 点此直接进入" text */
  document.getElementById('backupTrigger').addEventListener('click', function(e) {
    launchApp();
    e.stopPropagation();
  });

  // ---- Tab switching ----
  var tabs = document.querySelectorAll('.nav-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function() {
      var tabId = this.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  }

  // ---- Daily: word count ----
  document.getElementById('wordInput').addEventListener('input', updateDailyCount);

  // ---- Daily: start ----
  document.querySelector('.start-btn').addEventListener('click', function() {
    getAudioCtx();
    warmUpSpeech();
    var words = parseWords(document.getElementById('wordInput').value);
    saveDailyWordList(document.getElementById('wordInput').value);
    startSession(words, 'daily');
  });

  // ---- Daily: sample ----
  document.querySelector('.sample-btn').addEventListener('click', function() {
    document.getElementById('wordInput').value = SAMPLE;
    updateDailyCount();
  });

  // ---- Daily: clear ----
  document.querySelector('.clear-btn').addEventListener('click', function() {
    document.getElementById('wordInput').value = '';
    updateDailyCount();
  });

  // ---- IELTS: start ----
  document.querySelector('.ielts-start-btn').addEventListener('click', function() {
    getAudioCtx();
    warmUpSpeech();
    if (!ieltsWords.length) {
      document.getElementById('ieltsStatus').textContent = 'IELTS 词库尚未加载完成，请稍候。';
      return;
    }
    startSession(ieltsWords, 'ielts');
  });

  // ---- IELTS: shuffle ----
  document.getElementById('ieltsShuffleBtn').addEventListener('click', function() {
    if (ieltsWords.length) {
      ieltsWords = shuffle(ieltsWords);
      document.getElementById('ieltsWordCount').textContent = ieltsWords.length + ' 词';
    }
  });

  // ---- Error review buttons ----
  document.querySelector('.error-btn').addEventListener('click', function() {
    var errors = getErrors().filter(function(e) { return e.source === 'daily'; });
    if (!errors.length) { document.getElementById('status').textContent = '没有错题。'; return; }
    startSession(errors.map(function(e) { return { word: e.word, meaning: e.meaning }; }), 'daily', true);
  });
  document.querySelector('.ielts-error-btn').addEventListener('click', function() {
    var errors = getErrors().filter(function(e) { return e.source === 'ielts'; });
    if (!errors.length) { document.getElementById('ieltsStatus').textContent = '没有错题。'; return; }
    startSession(errors.map(function(e) { return { word: e.word, meaning: e.meaning }; }), 'ielts', true);
  });

  // ---- Hide panel ----
  document.getElementById('hidePanelBtn').addEventListener('click', function() {
    var source = getActiveSource();
    var layout = document.getElementById(source === 'ielts' ? 'ieltsLayout' : 'dailyLayout');
    var setup = layout.querySelector('.setup');
    var showBtn = document.getElementById('showPanelBtn');
    if (setup.classList.contains('hidden')) {
      setup.classList.remove('hidden');
      layout.classList.remove('solo');
      showBtn.classList.remove('visible');
    } else {
      setup.classList.add('hidden');
      layout.classList.add('solo');
      showBtn.classList.add('visible');
    }
  });

  // ---- Show panel ----
  document.getElementById('showPanelBtn').addEventListener('click', function() {
    var source = getActiveSource();
    var layout = document.getElementById(source === 'ielts' ? 'ieltsLayout' : 'dailyLayout');
    var setup = layout.querySelector('.setup');
    setup.classList.remove('hidden');
    layout.classList.remove('solo');
    document.getElementById('showPanelBtn').classList.remove('visible');
  });

  // ---- Delegated card events ----
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;
    var source = getActiveSource();

    if (action === 'manage-errors') {
      errorManagerSource = btn.dataset.source || source;
      document.getElementById('errorManagerTitle').textContent = errorManagerSource === 'ielts' ? 'IELTS 错题管理' : '自定义词表错题管理';
      renderErrorManager();
      document.getElementById('errorManagerDialog').showModal();
      return;
    }
    if (action === 'close-errors') {
      document.getElementById('errorManagerDialog').close();
      return;
    }
    if (action === 'edit-error') {
      var editor = document.querySelector('.manager-editor[data-editor="' + btn.dataset.index + '"]');
      if (editor) editor.hidden = !editor.hidden;
      return;
    }
    if (action === 'save-error') {
      var errorIndex = Number(btn.dataset.index);
      var errorList = getErrors();
      var errorEditor = document.querySelector('.manager-editor[data-editor="' + errorIndex + '"]');
      if (!errorList[errorIndex] || !errorEditor) return;
      var correctedWord = errorEditor.querySelector('[name="word"]').value.trim();
      if (!correctedWord) return;
      errorList[errorIndex].word = correctedWord.replace(/\s+/g, ' ');
      errorList[errorIndex].meaning = errorEditor.querySelector('[name="meaning"]').value.trim() || '暂无中文释义';
      saveErrors(errorList);
      renderErrorManager();
      return;
    }
    if (action === 'delete-error') {
      var deleteIndex = Number(btn.dataset.index);
      var deleteList = getErrors();
      if (!deleteList[deleteIndex] || !window.confirm('确定从错题本中删除“' + deleteList[deleteIndex].word + '”吗？')) return;
      deleteList.splice(deleteIndex, 1);
      saveErrors(deleteList);
      renderErrorManager();
      return;
    }
    if (action === 'manage-history') {
      renderDailyHistory();
      document.getElementById('dailyHistoryDialog').showModal();
      return;
    }
    if (action === 'close-history') {
      document.getElementById('dailyHistoryDialog').close();
      return;
    }
    if (action === 'restore-daily-list') {
      var historyIndex = Number(btn.dataset.historyIndex);
      var history = getDailyWordHistory();
      if (!history[historyIndex]) return;
      document.getElementById('wordInput').value = history[historyIndex].content;
      localStorage.setItem(STORAGE_KEY, history[historyIndex].content);
      updateDailyCount();
      document.getElementById('status').textContent = '已恢复历史词表，可直接开始练习。';
      document.getElementById('dailyHistoryDialog').close();
      return;
    }

    if (action === 'hint') {
      var meaningHint = btn.nextElementSibling;
      if (meaningHint) {
        meaningHint.hidden = !meaningHint.hidden;
        btn.textContent = meaningHint.hidden ? '查看中文释义' : '隐藏中文释义';
      }
      return;
    }

    if (action === 'speak') {
      var session = getSession(source);
      var word = session ? session.words[session ? session.index : 0] : null;
      if (word) {
        speak(word.word);
        /* Update mode to show word again */
        session.promptDisplay = 'both';
      }
      return;
    }
    if (action === 'next' && getSession(source) && getSession(source).submitted) {
      handleNext(source);
      return;
    }
    if (action === 'repeat') {
      var session = getSession(source);
      if (!session) return;
      session.submitted = false;
      session.answer = '';
      renderCard(source);
      return;
    }
  });

  // ---- KEYBOARD INPUT for letter slots ----
  document.addEventListener('keydown', function(e) {
    var source = getActiveSource();
    var session = getSession(source);
    if (!session) return;

    /* Skip if typing in textarea */
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.isComposing || e.keyCode === 229) return;

    var word = session.words[session.index];
    if (!word) return;

    if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      speak(word.word);
      return;
    }

    /* ALT key — repeat (try again) */
    if (e.key === 'Alt' && session.submitted) {
      e.preventDefault();
      session.submitted = false;
      session.answer = '';
      renderCard(source);
      return;
    }

    /* ENTER key — next (only if submitted) */
    if (e.key === 'Enter' && session.submitted) {
      e.preventDefault();
      handleNext(source);
      return;
    }

    /* Arrow keys when submitted */
    if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && session.submitted) {
      e.preventDefault();
      handleNext(source);
      return;
    }

    if (session.submitted) return;

    /* ---- Letter input ---- */
    var currentInput = session.inputBuffer || '';

    // Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      session.inputBuffer = currentInput.slice(0, -1);
      renderLiveSlots(source, word.word, session.inputBuffer);
      return;
    }

    // Enter to submit
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSlotSubmit(source, word, session, session.inputBuffer || '');
      return;
    }

    // Printable character
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && e.key.charCodeAt(0) >= 32) {
      e.preventDefault();
      var newInput = currentInput + e.key;
      session.inputBuffer = newInput;
      renderLiveSlots(source, word.word, newInput);
      return;
    }
  });
});