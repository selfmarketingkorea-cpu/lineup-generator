<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>LINEUP — AI 줄세우기</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --black: #0a0a0a; --white: #f5f3ee; --accent: #e8c547; --red: #d94f3d; --gray: #6b6b6b; --border: #2a2a2a; --green: #6fcf6f; }
  html, body { background: var(--black); color: var(--white); font-family: 'Noto Sans KR', sans-serif; min-height: 100vh; overflow-x: hidden; }
  body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 9999; opacity: 0.35; }

  header { display: flex; align-items: center; justify-content: space-between; padding: 24px 40px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.92); backdrop-filter: blur(12px); }
  .logo { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 0.08em; color: var(--white); line-height: 1; }
  .logo span { color: var(--accent); }
  .header-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--gray); letter-spacing: 0.15em; text-transform: uppercase; }

  main { max-width: 1200px; margin: 0 auto; padding: 60px 40px 100px; }
  .top-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; margin-bottom: 40px; }
  .left-panel { display: flex; flex-direction: column; gap: 24px; }
  .section-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
  .panel-title { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 0.95; letter-spacing: 0.03em; }
  .panel-title em { color: var(--accent); font-style: normal; display: block; }
  .panel-desc { font-size: 14px; line-height: 1.8; color: #aaa; font-weight: 300; max-width: 360px; }
  .how-list { display: flex; flex-direction: column; gap: 12px; }
  .how-item { display: flex; align-items: flex-start; gap: 14px; }
  .how-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--border); line-height: 1; min-width: 28px; transition: color 0.3s; }
  .how-item.active .how-num { color: var(--accent); }
  .how-text { font-size: 13px; color: #888; line-height: 1.6; padding-top: 4px; }
  .how-item.active .how-text { color: var(--white); }

  .right-panel { display: flex; flex-direction: column; gap: 20px; }
  .upload-zone { border: 1px dashed #333; border-radius: 2px; min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; cursor: pointer; transition: border-color 0.2s, background 0.2s; position: relative; overflow: hidden; background: #0d0d0d; }
  .upload-zone:hover, .upload-zone.drag-over { border-color: var(--accent); background: #111; }
  .upload-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .upload-icon { width: 56px; height: 56px; border: 1px solid #2a2a2a; border-radius: 2px; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s; }
  .upload-zone:hover .upload-icon { border-color: var(--accent); }
  .upload-icon svg { width: 24px; height: 24px; stroke: #555; transition: stroke 0.2s; }
  .upload-zone:hover .upload-icon svg { stroke: var(--accent); }
  .upload-text { text-align: center; }
  .upload-text strong { display: block; font-size: 15px; font-weight: 500; margin-bottom: 4px; }
  .upload-text span { font-size: 12px; color: var(--gray); font-family: 'JetBrains Mono', monospace; }

  #preview-wrap { display: none; }
  #preview-img { width: 100%; border-radius: 2px; display: block; }

  .action-wrap { display: none; flex-direction: column; gap: 10px; margin-top: 4px; }
  .preview-actions { display: flex; gap: 8px; }
  .btn-primary { flex: 1; background: var(--white); color: var(--black); border: none; padding: 14px 20px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.1em; cursor: pointer; border-radius: 2px; transition: background 0.15s, transform 0.1s; display: flex; align-items: center; justify-content: center; }
  .btn-primary:hover { background: var(--accent); }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-secondary { background: transparent; color: var(--gray); border: 1px solid var(--border); padding: 14px 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: border-color 0.15s, color 0.15s; white-space: nowrap; }
  .btn-secondary:hover { border-color: var(--gray); color: var(--white); }

  .loading-bar { display: none; height: 2px; background: #1a1a1a; border-radius: 1px; overflow: hidden; }
  .loading-bar.active { display: block; }
  .loading-fill { height: 100%; background: var(--accent); animation: loading-anim 2.5s ease-in-out infinite; }
  @keyframes loading-anim { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }

  .status-box { background: #111; border: 1px solid var(--border); border-radius: 2px; padding: 14px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.8; color: var(--gray); display: none; white-space: pre-wrap; }
  .status-box.visible { display: block; }
  .status-box.analyzing { border-color: var(--accent); color: #ccc; }
  .status-box.success { border-color: var(--green); color: var(--green); }
  .status-box.error { border-color: var(--red); color: var(--red); }

  .results-section { display: none; }
  .results-section.visible { display: block; margin-top: 40px; }
  .results-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; }
  .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .result-card { position: relative; background: #111; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; }
  .result-card img { width: 100%; display: block; }
  .result-card .card-badge { position: absolute; top: 8px; left: 8px; background: var(--accent); color: var(--black); font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; }
  .result-card .card-loading { width: 100%; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; background: #0d0d0d; }
  .result-card .card-loading .spinner { width: 28px; height: 28px; border: 2px solid #2a2a2a; border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  .result-card .card-loading span { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--gray); letter-spacing: 0.1em; }
  .result-card .card-error { width: 100%; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--red); background: #0d0d0d; padding: 16px; text-align: center; }
  .result-card .card-btn { width: 100%; background: transparent; color: var(--accent); border: none; border-top: 1px solid var(--border); padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: background 0.15s, color 0.15s; }
  .result-card .card-btn:hover { background: var(--accent); color: var(--black); }

  @keyframes spin { to { transform: rotate(360deg); } }

  .ticker { position: fixed; bottom: 0; left: 0; right: 0; height: 32px; background: var(--accent); color: var(--black); display: flex; align-items: center; overflow: hidden; z-index: 200; }
  .ticker-inner { display: flex; gap: 60px; animation: ticker-scroll 22s linear infinite; white-space: nowrap; }
  .ticker-inner span { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 0.15em; }
  @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  @media (max-width: 768px) {
    header { padding: 16px 20px; }
    main { padding: 32px 20px 80px; }
    .top-section { grid-template-columns: 1fr; gap: 32px; }
    .panel-title { font-size: 38px; }
    .results-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<header>
  <div class="logo">LINE<span>UP.</span></div>
  <div class="header-tag">// AI 줄세우기 — Powered by OpenAI</div>
</header>
<main>
  <div class="top-section">
    <div class="left-panel">
      <div>
        <div class="section-label">// AI 인물 생성 + 줄세우기</div>
        <h1 class="panel-title">건물 사진<br/>하나면<br/><em>줄 완성</em></h1>
      </div>
      <p class="panel-desc">가게 사진을 올리면 AI가 4가지 버전을 동시에 생성해요. 마음에 드는 걸 골라서 다운로드하세요.<br/><br/>
        <span style="color:var(--green);font-size:12px;">✓ OpenAI gpt-image-1 기술</span>
      </p>
      <div class="how-list">
        <div class="how-item active" id="step-1"><div class="how-num">01</div><div class="how-text">문이 잘 보이는 가게/건물 사진을 올려주세요</div></div>
        <div class="how-item" id="step-2"><div class="how-num">02</div><div class="how-text">"줄 세우기 시작" 버튼을 클릭하세요</div></div>
        <div class="how-item" id="step-3"><div class="how-num">03</div><div class="how-text">AI가 4가지 버전을 동시에 생성해요</div></div>
        <div class="how-item" id="step-4"><div class="how-num">04</div><div class="how-text">마음에 드는 버전을 다운로드하세요</div></div>
      </div>
    </div>
    <div class="right-panel">
      <div class="upload-zone" id="upload-zone" ondragover="onDragOver(event)" ondragleave="onDragLeave()" ondrop="onDrop(event)">
        <input type="file" id="file-input" accept="image/*" onchange="onFileSelect(event)"/>
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div class="upload-text">
          <strong>사진을 끌어다 놓거나 클릭해서 선택</strong>
          <span>JPG · PNG · WEBP — 최대 5MB</span>
        </div>
      </div>
      <div id="preview-wrap"><img id="preview-img" alt="원본 사진"/></div>
      <div class="loading-bar" id="loading-bar"><div class="loading-fill"></div></div>
      <div class="action-wrap" id="action-wrap">
        <div class="preview-actions">
          <button class="btn-primary" id="btn-generate" onclick="generate()">줄 세우기 시작 (4장)</button>
          <button class="btn-secondary" onclick="resetAll()">다시 선택</button>
        </div>
      </div>
      <div class="status-box" id="status-box"></div>
    </div>
  </div>
  <div class="results-section" id="results-section">
    <div class="results-label">// AI 생성 결과 — 마음에 드는 버전을 다운로드하세요</div>
    <div class="results-grid" id="results-grid"></div>
  </div>
</main>
<div class="ticker">
  <div class="ticker-inner">
    <span>LINEUP GENERATOR</span><span>·</span><span>AI 줄세우기</span><span>·</span><span>4장 동시 생성</span><span>·</span><span>POWERED BY OPENAI</span><span>·</span><span>배경 유지 + 인물 생성</span><span>·</span>
    <span>LINEUP GENERATOR</span><span>·</span><span>AI 줄세우기</span><span>·</span><span>4장 동시 생성</span><span>·</span><span>POWERED BY OPENAI</span><span>·</span><span>배경 유지 + 인물 생성</span><span>·</span>
  </div>
</div>
<script>
const SCRIPT_URL = '/api/generate';
const TOTAL = 4;
let uploadedDataUrl = null;

function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.classList.toggle('active', i === n);
  }
}
function onDragOver(e) { e.preventDefault(); document.getElementById('upload-zone').classList.add('drag-over'); }
function onDragLeave() { document.getElementById('upload-zone').classList.remove('drag-over'); }
function onDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadFile(file);
}
function onFileSelect(e) { const file = e.target.files[0]; if (file) loadFile(file); }

function loadFile(file) {
  if (file.size > 5 * 1024 * 1024) { showStatus('error', '파일이 5MB를 초과해요.'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedDataUrl = e.target.result;
    document.getElementById('preview-img').src = uploadedDataUrl;
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('preview-wrap').style.display = 'block';
    document.getElementById('action-wrap').style.display = 'flex';
    document.getElementById('results-section').classList.remove('visible');
    document.getElementById('status-box').classList.remove('visible');
    setStep(2);
  };
  reader.readAsDataURL(file);
}

function resetAll() {
  uploadedDataUrl = null;
  document.getElementById('upload-zone').style.display = 'flex';
  document.getElementById('preview-wrap').style.display = 'none';
  document.getElementById('action-wrap').style.display = 'none';
  document.getElementById('results-section').classList.remove('visible');
  document.getElementById('status-box').classList.remove('visible');
  document.getElementById('loading-bar').classList.remove('active');
  document.getElementById('file-input').value = '';
  setStep(1);
}

async function callAPI(base64, mimeType) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, mimeType: mimeType })
  });
  return await res.json();
}

async function generate() {
  if (!uploadedDataUrl) return;
  const btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.textContent = '생성 중...';
  document.getElementById('loading-bar').classList.add('active');
  showStatus('analyzing', '// 4장 동시 생성 중...\n// 완성되는 대로 하나씩 나타나요\n// 30초~1분 소요될 수 있어요');
  setStep(3);

  const base64 = uploadedDataUrl.split(',')[1];
  const mimeType = uploadedDataUrl.split(';')[0].split(':')[1];

  const grid = document.getElementById('results-grid');
  grid.innerHTML = '';
  document.getElementById('results-section').classList.add('visible');

  const cards = [];
  for (let i = 0; i < TOTAL; i++) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = '<div class="card-loading"><div class="spinner"></div><span>VER.' + (i+1) + ' 생성 중...</span></div>';
    grid.appendChild(card);
    cards.push(card);
  }

  let doneCount = 0;
  const promises = Array.from({ length: TOTAL }, (_, i) =>
    callAPI(base64, mimeType).then(data => {
      doneCount++;
      if (data.error || !data.image) {
        cards[i].innerHTML = '<div class="card-error">// VER.' + (i+1) + ' 생성 실패<br/>' + (data.error || '오류') + '</div>';
      } else {
        const dataUrl = 'data:' + (data.mimeType || 'image/png') + ';base64,' + data.image;
        cards[i].innerHTML =
          '<div class="card-badge">VER.' + (i+1) + '</div>' +
          '<img src="' + dataUrl + '" alt="결과 ' + (i+1) + '"/>' +
          '<button class="card-btn" onclick="downloadImage(\'' + dataUrl + '\', ' + (i+1) + ')">다운로드</button>';
      }
      showStatus('analyzing', '// ' + doneCount + '/' + TOTAL + '장 완성...\n// 나머지 생성 중...');
    }).catch(err => {
      cards[i].innerHTML = '<div class="card-error">// VER.' + (i+1) + ' 오류<br/>' + err.message + '</div>';
    })
  );

  await Promise.all(promises);
  document.getElementById('loading-bar').classList.remove('active');
  showStatus('success', '// 완성! 4장 모두 생성됐어요\n// 마음에 드는 버전을 다운로드하세요');
  btn.disabled = false;
  btn.textContent = '다시 생성 (4장)';
  setStep(4);
}

function downloadImage(dataUrl, num) {
  const a = document.createElement('a');
  a.download = 'lineup-ver' + num + '.png';
  a.href = dataUrl;
  a.click();
}

function showStatus(type, msg) {
  const box = document.getElementById('status-box');
  box.className = 'status-box visible ' + type;
  box.textContent = msg;
}
</script>
</body>
</html>
