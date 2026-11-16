const accountInput = document.getElementById('accountName');
const accountPreview = document.getElementById('accountPreview');
const profileUrlInput = document.getElementById('profileUrl');
const profileFileInput = document.getElementById('profileFile');
const profilePreview = document.getElementById('profilePreview');
const storyCanvas = document.getElementById('storyCanvas');
const viewport = document.getElementById('viewport');
const resButtons = document.getElementById('resButtons');
const storyDropzone = document.getElementById('storyDropzone');
const storyFileInput = document.getElementById('storyFile');
const clearStoryButton = document.getElementById('clearStory');
const igProfileLink = document.getElementById('igProfileLink');

const defaultStory = '';

const updateAccountName = () => {
  accountPreview.textContent = accountInput.value.trim() || 'adraff.design';
};

const setProfileImage = (src) => {
  if (!src) return;
  profilePreview.style.backgroundImage = `url(${src})`;
};

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(true);
  img.onerror = () => resolve(false);
  img.src = src;
});

const trySetInstagramAvatar = async (username) => {
  const cacheBust = Date.now();
  const candidates = [
    `https://unavatar.io/instagram/${encodeURIComponent(username)}?t=${cacheBust}`,
    `https://unavatar.io/https://www.instagram.com/${encodeURIComponent(username)}?t=${cacheBust}`,
  ];
  for (const url of candidates) {
    // Try sequentially to avoid flashing
    // eslint-disable-next-line no-await-in-loop
    const ok = await loadImage(url);
    if (ok) {
      setProfileImage(url);
      return true;
    }
  }
  const dicebear = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(username)}&backgroundColor=6b7280&fontWeight=700&radius=50`;
  setProfileImage(dicebear);
  return false;
};

const extractInstagramUsername = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('@')) return trimmed.slice(1);
  // If it's just a username without URL
  if (/^[a-zA-Z0-9._]+$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes('instagram.com')) return '';
    const parts = url.pathname.split('/').filter(Boolean);
    if (!parts.length) return '';
    const blocked = new Set(['p', 'reel', 'tv', 'stories', 'explore', 'direct', 'accounts', 'about']);
    const candidate = parts[0];
    if (blocked.has(candidate)) return '';
    return candidate;
  } catch (e) {
    return '';
  }
};

const applyInstagramProfile = async (inputValue) => {
  const username = extractInstagramUsername(inputValue);
  if (!username) return;
  accountInput.value = username;
  updateAccountName();
  await trySetInstagramAvatar(username);
};

const readImageFile = (file, onLoad) => {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => onLoad(e.target.result);
  reader.readAsDataURL(file);
};

const setStoryImage = (src) => {
  if (src) {
    storyCanvas.style.backgroundImage = `url(${src})`;
    storyCanvas.classList.remove('empty');
  } else {
    storyCanvas.style.backgroundImage = '';
    storyCanvas.classList.add('empty');
  }
};

const handleStoryFiles = (files) => {
  if (!files || !files.length) return;
  readImageFile(files[0], setStoryImage);
};

const fitResolution = (sizeString) => {
  const [w, h] = sizeString.split('x').map(Number);
  if (!w || !h) return;
  const maxWidth = 520;
  const maxHeight = Math.max(520, window.innerHeight * 0.82);
  const scale = Math.min(maxWidth / w, maxHeight / h, 1);
  const targetW = Math.round(w * scale);
  const targetH = Math.round(h * scale);
  viewport.style.width = `${targetW}px`;
  viewport.style.height = `${targetH}px`;
};

accountInput.addEventListener('input', updateAccountName);

profileUrlInput.addEventListener('input', () => {
  const url = profileUrlInput.value.trim();
  if (!url) return;
  setProfileImage(url);
});

profileFileInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  readImageFile(file, setProfileImage);
  profileFileInput.value = '';
});

igProfileLink.addEventListener('change', (e) => applyInstagramProfile(e.target.value));
igProfileLink.addEventListener('paste', (e) => {
  setTimeout(() => applyInstagramProfile(e.target.value), 0);
});
igProfileLink.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    applyInstagramProfile(e.target.value);
  }
});

storyDropzone.addEventListener('click', () => storyFileInput.click());
storyDropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    storyFileInput.click();
  }
});

storyDropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  storyDropzone.classList.add('dragging');
  storyCanvas.classList.add('dragging');
});

storyDropzone.addEventListener('dragleave', () => {
  storyDropzone.classList.remove('dragging');
  storyCanvas.classList.remove('dragging');
});

storyDropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  storyDropzone.classList.remove('dragging');
  storyCanvas.classList.remove('dragging');
  handleStoryFiles(event.dataTransfer.files);
  storyCanvas.classList.add('dropped');
  setTimeout(() => storyCanvas.classList.remove('dropped'), 340);
});

storyFileInput.addEventListener('change', (event) => {
  handleStoryFiles(event.target.files);
  storyFileInput.value = '';
});

clearStoryButton.addEventListener('click', () => {
  setStoryImage(defaultStory);
});

resButtons.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-size]');
  if (!btn) return;
  resButtons.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  fitResolution(btn.dataset.size);
});

window.addEventListener('resize', () => {
  const active = resButtons.querySelector('button.active');
  if (active) fitResolution(active.dataset.size);
});

// Init defaults
setStoryImage(defaultStory);
updateAccountName();
resButtons.querySelector('button[data-size="1080x2400"]').classList.add('active');
fitResolution('1080x2400');
