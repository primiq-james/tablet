const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatOutput = document.getElementById("chat-output");
const chatCitations = document.getElementById("chat-citations");
const contextButton = document.getElementById("context-button");
const routerOutput = document.getElementById("router-output");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

const mediaForm = document.getElementById("media-form");
const mediaInput = document.getElementById("media-input");
const mediaResults = document.getElementById("media-results");

const scanButton = document.getElementById("scan-button");
const voiceInputButton = document.getElementById("voice-input-button");
const voiceOutputButton = document.getElementById("voice-output-button");
const voiceStatus = document.getElementById("voice-status");

const cameraPreview = document.getElementById("camera-preview");
const cameraCanvas = document.getElementById("camera-canvas");
const cameraSnapshot = document.getElementById("camera-snapshot");
const cameraStartButton = document.getElementById("camera-start-button");
const cameraAnalyzeButton = document.getElementById("camera-analyze-button");
const cameraSaveButton = document.getElementById("camera-save-button");
const cameraAutoButton = document.getElementById("camera-auto-button");
const cameraStatus = document.getElementById("camera-status");
const visionPrompt = document.getElementById("vision-prompt");
const visionOutput = document.getElementById("vision-output");

const galleryRefreshButton = document.getElementById("gallery-refresh-button");
const galleryResults = document.getElementById("gallery-results");

const settingsForm = document.getElementById("settings-form");
const settingsStatus = document.getElementById("settings-status");
const settingsLibraryRoot = document.getElementById("settings-library-root");
const settingsChatModel = document.getElementById("settings-chat-model");
const settingsVisionModel = document.getElementById("settings-vision-model");
const settingsWhisperModelSize = document.getElementById("settings-whisper-model-size");
const settingsPiperBinary = document.getElementById("settings-piper-binary");
const settingsPiperModelPath = document.getElementById("settings-piper-model-path");
const settingsCameraInterval = document.getElementById("settings-camera-interval");
const settingsChatLimit = document.getElementById("settings-chat-limit");
const settingsRetrievalWindow = document.getElementById("settings-retrieval-window");
const settingsVoiceOutputEnabled = document.getElementById("settings-voice-output-enabled");
const settingsCameraAutoAnalyze = document.getElementById("settings-camera-auto-analyze");

let currentSettings = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let cameraStream = null;
let isAnalyzingFrame = false;
let autoAnalyzeEnabled = false;
let autoAnalyzeTimer = null;

function setStatus(element, message) {
  element.innerHTML = `<p class="status">${message}</p>`;
}

function setVoiceStatus(message) {
  voiceStatus.textContent = message;
}

function setCameraStatus(message) {
  cameraStatus.textContent = message;
}

function setSettingsStatus(message) {
  settingsStatus.textContent = message;
}

function updateVoiceButtons() {
  voiceInputButton.textContent = isRecording ? "Stop Whisper Recording" : "Record with Whisper";
  voiceInputButton.classList.toggle("active", isRecording);
  const voiceEnabled = Boolean(currentSettings?.voice_output_enabled);
  voiceOutputButton.textContent = voiceEnabled ? "Piper Output On" : "Piper Output Off";
  voiceOutputButton.classList.toggle("active", voiceEnabled);
}

function updateCameraButtons() {
  cameraStartButton.textContent = cameraStream ? "Restart Camera" : "Start Camera";
  cameraAutoButton.textContent = autoAnalyzeEnabled ? "Auto Analyze On" : "Auto Analyze Off";
  cameraAutoButton.classList.toggle("active", autoAnalyzeEnabled);
  cameraAnalyzeButton.disabled = !cameraStream || isAnalyzingFrame;
  cameraSaveButton.disabled = !cameraStream;
}

function setRouterDecision(route, reason, targetModel) {
  routerOutput.textContent = `${route} · ${targetModel} · ${reason}`;
}

function renderCitations(citations) {
  if (!citations.length) {
    chatCitations.innerHTML = "";
    return;
  }

  chatCitations.innerHTML = citations.map((citation) => `
    <div class="citation-card">
      <strong>${citation.title}</strong>
      <div class="meta">${citation.category}${citation.page_number ? `, page ${citation.page_number}` : ""}</div>
      <div class="meta">${citation.path}</div>
    </div>
  `).join("");
}

function renderResults(results) {
  if (!results.length) {
    setStatus(searchResults, "No document matches yet.");
    return;
  }

  searchResults.innerHTML = results.map((result) => `
    <div class="result-card">
      <h3>${result.title}</h3>
      <div class="meta">${result.category} · ${result.extension}${result.page_number ? ` · page ${result.page_number}` : ""}</div>
      <div class="meta">${result.path}</div>
      <p class="snippet">${result.snippet}</p>
    </div>
  `).join("");
}

function renderMedia(results) {
  if (!results.length) {
    setStatus(mediaResults, "No media matches yet.");
    return;
  }

  mediaResults.innerHTML = results.map((result) => `
    <article class="media-card">
      ${result.previewable ? `<img src="${result.file_url}" alt="${result.title}">` : ""}
      <h3>${result.title}</h3>
      <div class="meta">${result.category} · ${result.extension}</div>
      <div class="meta">${result.path}</div>
      <p class="snippet">${result.snippet}</p>
      <div class="media-links">
        <a href="${result.file_url}" target="_blank" rel="noreferrer">Open file</a>
      </div>
    </article>
  `).join("");
}

function renderGallery(captures) {
  if (!captures.length) {
    setStatus(galleryResults, "No saved captures yet.");
    return;
  }

  galleryResults.innerHTML = captures.map((capture) => `
    <article class="media-card">
      <img src="${capture.image_url}" alt="${capture.filename}">
      <h3>${capture.label || capture.filename}</h3>
      <div class="meta">${new Date(capture.created_at).toLocaleString()}</div>
      <div class="meta">${capture.path}</div>
      ${capture.analysis ? `<div class="analysis">${capture.analysis}</div>` : `<p class="snippet">No analysis saved yet.</p>`}
      <div class="media-links">
        <a href="${capture.image_url}" target="_blank" rel="noreferrer">Open image</a>
        <a href="#" data-capture-analyze="${capture.id}">Re-analyze</a>
      </div>
    </article>
  `).join("");
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

async function loadSettings() {
  currentSettings = await getJson("/settings");

  settingsLibraryRoot.value = currentSettings.library_root;
  settingsChatModel.value = currentSettings.chat_model;
  settingsVisionModel.value = currentSettings.vision_model;
  settingsWhisperModelSize.value = currentSettings.whisper_model_size;
  settingsPiperBinary.value = currentSettings.piper_binary;
  settingsPiperModelPath.value = currentSettings.piper_model_path;
  settingsCameraInterval.value = currentSettings.camera_interval_seconds;
  settingsChatLimit.value = currentSettings.default_chat_limit;
  settingsRetrievalWindow.value = currentSettings.retrieval_window;
  settingsVoiceOutputEnabled.checked = currentSettings.voice_output_enabled;
  settingsCameraAutoAnalyze.checked = currentSettings.camera_auto_analyze;

  autoAnalyzeEnabled = currentSettings.camera_auto_analyze;
  updateVoiceButtons();
  updateCameraButtons();
  setSettingsStatus("Settings loaded");
}

async function saveSettings(event) {
  event.preventDefault();
  setSettingsStatus("Saving settings...");

  currentSettings = await postJson("/settings", {
    library_root: settingsLibraryRoot.value.trim(),
    chat_model: settingsChatModel.value.trim(),
    vision_model: settingsVisionModel.value.trim(),
    whisper_model_size: settingsWhisperModelSize.value.trim(),
    piper_binary: settingsPiperBinary.value.trim(),
    piper_model_path: settingsPiperModelPath.value.trim(),
    camera_interval_seconds: Number(settingsCameraInterval.value),
    default_chat_limit: Number(settingsChatLimit.value),
    retrieval_window: Number(settingsRetrievalWindow.value),
    voice_output_enabled: settingsVoiceOutputEnabled.checked,
    camera_auto_analyze: settingsCameraAutoAnalyze.checked,
  });

  autoAnalyzeEnabled = currentSettings.camera_auto_analyze;
  updateVoiceButtons();
  updateCameraButtons();
  if (cameraStream && autoAnalyzeEnabled) {
    startAutoAnalyzeLoop();
  }
  setSettingsStatus("Settings saved");
}

async function routeCurrentMessage(message) {
  const payload = await postJson("/router/route", {
    message,
    limit: currentSettings?.default_chat_limit || 6,
  });
  setRouterDecision(payload.route, payload.reason, payload.target_model);
  return payload;
}

async function synthesizeAndPlay(text) {
  if (!currentSettings?.voice_output_enabled || !text.trim()) {
    return;
  }

  setVoiceStatus("Generating Piper audio...");
  const payload = await postJson("/speech/speak", { text });
  if (!payload.success || !payload.audio_url) {
    setVoiceStatus(payload.message);
    return;
  }

  const audio = new Audio(payload.audio_url);
  await audio.play();
  setVoiceStatus("Piper playback complete");
}

async function transcribeRecordedAudio(blob) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  setVoiceStatus("Transcribing with faster-whisper...");
  const response = await fetch("/speech/transcribe", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Transcription failed with status ${response.status}`);
  }
  const payload = await response.json();
  if (!payload.success) {
    throw new Error("Whisper transcription did not return text. Check Pi-side faster-whisper.");
  }
  chatInput.value = payload.text;
  setVoiceStatus("Transcription ready");
}

function initializeRecorder() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    voiceInputButton.disabled = true;
    setVoiceStatus("Browser audio recording not supported");
    return;
  }
}

async function toggleAudioRecording() {
  if (isRecording) {
    mediaRecorder.stop();
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.onstart = () => {
    isRecording = true;
    updateVoiceButtons();
    setVoiceStatus("Recording for Whisper...");
  };

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    isRecording = false;
    updateVoiceButtons();
    stream.getTracks().forEach((track) => track.stop());
    try {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      await transcribeRecordedAudio(blob);
    } catch (error) {
      setVoiceStatus(`Transcription error: ${error.message}`);
    }
  };

  mediaRecorder.start();
}

async function loadGallery() {
  const payload = await getJson("/camera/captures");
  renderGallery(payload.captures || []);
}

function captureCurrentFrame() {
  if (!cameraStream || !cameraPreview.videoWidth || !cameraPreview.videoHeight) {
    throw new Error("Camera stream is not ready yet.");
  }

  cameraCanvas.width = cameraPreview.videoWidth;
  cameraCanvas.height = cameraPreview.videoHeight;
  const context = cameraCanvas.getContext("2d");
  context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
  const imageDataUrl = cameraCanvas.toDataURL("image/jpeg", 0.82);
  cameraSnapshot.src = imageDataUrl;
  cameraSnapshot.style.display = "block";
  return imageDataUrl;
}

async function saveCurrentCapture() {
  if (!cameraStream) {
    return;
  }

  const imageData = captureCurrentFrame();
  const payload = await postJson("/camera/capture", {
    image_data: imageData,
    label: "Manual capture",
  });
  setCameraStatus(`Saved capture ${payload.filename}`);
  await loadGallery();
  return payload;
}

async function analyzeCurrentFrame() {
  if (!cameraStream || isAnalyzingFrame) {
    return;
  }

  try {
    isAnalyzingFrame = true;
    updateCameraButtons();
    setCameraStatus("Capturing frame...");
    const imageData = captureCurrentFrame();
    setCameraStatus("Analyzing camera frame...");
    const payload = await postJson("/vision/identify", {
      image_data: imageData,
      prompt: visionPrompt.value.trim() || "Identify the main item I am holding and what it seems to be used for.",
    });
    visionOutput.textContent = payload.message;
    if (currentSettings?.voice_output_enabled) {
      await synthesizeAndPlay(payload.message);
    }
    setCameraStatus(payload.grounded ? "Vision analysis complete" : "Vision fallback returned");
  } catch (error) {
    visionOutput.textContent = `Could not analyze frame: ${error.message}`;
    setCameraStatus("Camera analysis failed");
  } finally {
    isAnalyzingFrame = false;
    updateCameraButtons();
  }
}

function startAutoAnalyzeLoop() {
  if (autoAnalyzeTimer) {
    clearInterval(autoAnalyzeTimer);
    autoAnalyzeTimer = null;
  }

  if (!autoAnalyzeEnabled || !cameraStream) {
    updateCameraButtons();
    return;
  }

  const intervalSeconds = currentSettings?.camera_interval_seconds || 4;
  autoAnalyzeTimer = setInterval(() => {
    if (!isAnalyzingFrame) {
      analyzeCurrentFrame();
    }
  }, intervalSeconds * 1000);
  setCameraStatus(`Auto analyze every ${intervalSeconds} seconds`);
  updateCameraButtons();
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus("Camera access not supported in this browser");
    return;
  }

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  try {
    setCameraStatus("Requesting camera...");
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    cameraPreview.srcObject = cameraStream;
    await cameraPreview.play();
    setCameraStatus("Camera live");
    if (autoAnalyzeEnabled) {
      startAutoAnalyzeLoop();
    }
  } catch (error) {
    setCameraStatus(`Camera error: ${error.message}`);
  } finally {
    updateCameraButtons();
  }
}

async function reanalyzeCapture(captureId) {
  const payload = await postJson("/camera/captures/analyze", {
    capture_id: captureId,
    prompt: visionPrompt.value.trim() || "Identify the main item in this capture and explain what it appears to be.",
  });
  visionOutput.textContent = payload.analysis || "No analysis returned.";
  await loadGallery();
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) {
    return;
  }

  setStatus(chatOutput, "Routing request...");
  chatCitations.innerHTML = "";

  try {
    await routeCurrentMessage(message);
    const payload = await postJson("/chat/answer", {
      message,
      limit: currentSettings?.default_chat_limit || 6,
    });
    chatOutput.textContent = payload.message;
    renderCitations(payload.citations || []);
    await synthesizeAndPlay(payload.message);
  } catch (error) {
    chatOutput.textContent = `Could not get grounded answer: ${error.message}`;
  }
});

contextButton.addEventListener("click", async () => {
  const message = chatInput.value.trim();
  if (!message) {
    return;
  }

  setStatus(chatOutput, "Building retrieval context...");
  chatCitations.innerHTML = "";

  try {
    await routeCurrentMessage(message);
    const payload = await postJson("/chat/context", {
      message,
      limit: currentSettings?.default_chat_limit || 6,
    });
    chatOutput.textContent = payload.context || "No context found.";
    renderCitations(payload.citations || []);
  } catch (error) {
    chatOutput.textContent = `Could not build context: ${error.message}`;
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  setStatus(searchResults, "Searching local documents...");
  try {
    const payload = await getJson(`/search?query=${encodeURIComponent(query)}&limit=8`);
    renderResults(payload.results || []);
  } catch (error) {
    setStatus(searchResults, `Search failed: ${error.message}`);
  }
});

mediaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = mediaInput.value.trim();
  if (!query) {
    return;
  }

  setStatus(mediaResults, "Searching local diagrams, photos, and maps...");
  try {
    const payload = await getJson(`/search/media?query=${encodeURIComponent(query)}&limit=9`);
    renderMedia(payload.results || []);
  } catch (error) {
    setStatus(mediaResults, `Media search failed: ${error.message}`);
  }
});

scanButton.addEventListener("click", async () => {
  scanButton.disabled = true;
  scanButton.textContent = "Scanning...";

  try {
    const payload = await postJson("/library/scan", {});
    scanButton.textContent = `Indexed ${payload.indexed_count} files`;
  } catch (error) {
    scanButton.textContent = "Scan failed";
  } finally {
    setTimeout(() => {
      scanButton.disabled = false;
      scanButton.textContent = "Scan Library";
    }, 2500);
  }
});

voiceInputButton.addEventListener("click", async () => {
  try {
    await toggleAudioRecording();
  } catch (error) {
    setVoiceStatus(`Recorder error: ${error.message}`);
  }
});

voiceOutputButton.addEventListener("click", async () => {
  if (!currentSettings) {
    return;
  }

  currentSettings = await postJson("/settings", {
    voice_output_enabled: !currentSettings.voice_output_enabled,
  });
  settingsVoiceOutputEnabled.checked = currentSettings.voice_output_enabled;
  updateVoiceButtons();
  setVoiceStatus(currentSettings.voice_output_enabled ? "Piper output enabled" : "Piper output disabled");
});

cameraStartButton.addEventListener("click", async () => {
  await startCamera();
});

cameraAnalyzeButton.addEventListener("click", async () => {
  await analyzeCurrentFrame();
});

cameraSaveButton.addEventListener("click", async () => {
  try {
    await saveCurrentCapture();
  } catch (error) {
    setCameraStatus(`Save failed: ${error.message}`);
  }
});

cameraAutoButton.addEventListener("click", async () => {
  autoAnalyzeEnabled = !autoAnalyzeEnabled;
  currentSettings = await postJson("/settings", { camera_auto_analyze: autoAnalyzeEnabled });
  settingsCameraAutoAnalyze.checked = currentSettings.camera_auto_analyze;
  autoAnalyzeEnabled = currentSettings.camera_auto_analyze;
  if (autoAnalyzeEnabled) {
    startAutoAnalyzeLoop();
  } else {
    if (autoAnalyzeTimer) {
      clearInterval(autoAnalyzeTimer);
      autoAnalyzeTimer = null;
    }
    setCameraStatus(cameraStream ? "Camera live" : "Camera idle");
    updateCameraButtons();
  }
});

galleryRefreshButton.addEventListener("click", async () => {
  await loadGallery();
});

galleryResults.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const captureId = target.getAttribute("data-capture-analyze");
  if (!captureId) {
    return;
  }

  event.preventDefault();
  try {
    await reanalyzeCapture(captureId);
  } catch (error) {
    visionOutput.textContent = `Could not analyze saved capture: ${error.message}`;
  }
});

settingsForm.addEventListener("submit", saveSettings);

async function initializeApp() {
  setStatus(searchResults, "Search results will appear here.");
  setStatus(mediaResults, "Media hits will appear here.");
  setStatus(galleryResults, "Saved captures will appear here.");
  chatOutput.textContent = "Ask a grounded question to query your local library.";
  visionOutput.textContent = "Show the camera an item, circuit, tool, component, or object and analyze a frame.";
  initializeRecorder();
  await loadSettings();
  await loadGallery();
  setRouterDecision("idle", "Waiting for a request", currentSettings?.chat_model || "qwen2.5:1.5b");
}

initializeApp().catch((error) => {
  setSettingsStatus(`Initialization failed: ${error.message}`);
});
