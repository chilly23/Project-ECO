let API_KEY, CX, API_KEY2, CX2, OPENROUTER_KEY, APOLLO_KEY;

async function loadConfig() {
  const res = await fetch('/api/config');
  const cfg = await res.json();
  
  API_KEY        = cfg.GOOGLE_API_KEY;
  CX             = cfg.GOOGLE_CX;
  API_KEY2       = cfg.GOOGLE_API_KEY_2;
  CX2            = cfg.GOOGLE_CX_2;
  OPENROUTER_KEY = cfg.OPENROUTER_KEY;
  APOLLO_KEY     = cfg.APOLLO_KEY;
}




// import { handleDemoResult } from "demoresults.js";


// Google Custom Search key rotation config index
// We'll build configs dynamically from localStorage + these defaults
let currentConfigIndex = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function getGoogleConfigs() {
  const primaryKey = localStorage.getItem('eco_google_api') || API_KEY;
  const primaryCx = localStorage.getItem('eco_CX') || CX;
  const secondaryKey = localStorage.getItem('eco_google_api_2') || API_KEY2;
  const secondaryCx = localStorage.getItem('eco_CX_2') || CX2;

  const configs = [];
  if (primaryKey && primaryCx) configs.push({ key: primaryKey, cx: primaryCx });
  if (secondaryKey && secondaryCx) configs.push({ key: secondaryKey, cx: secondaryCx });
  return configs;
}

// Global state
let activeIndex = -1;
let suggestionIndex = -1;
let currentQuery = '';
let currentExecutive = null;
let vantaEffect = null;
let searchResults = null;

// DOM Elements - will be initialized after DOM loads
let results, searchInput, searchView, resultsView, suggestionsList, backBtn, toast, toastMessage;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize DOM references
  results = document.getElementById("results");
  searchInput = document.getElementById('searchInput');
  searchView = document.getElementById('searchView');
  resultsView = document.getElementById('resultsView');
  suggestionsList = document.getElementById('suggestionChips');
  backBtn = document.getElementById('backBtn');
  toast = document.getElementById('toast');
  toastMessage = document.getElementById('toastMessage');
  await loadConfig();
  init();
  loadSettings();
  setupNetworkFeed();
  setupGreeting();
});

function init() {
  lucide.createIcons();
  renderSuggestions();
  setupEventListeners();
  setupSettings();
  setupTheme();
  setupBackground();
}

// Settings
function loadSettings() {
  const username = localStorage.getItem('eco_username') || localStorage.getItem('username') || 'Guest';
  const aboutMe = localStorage.getItem('eco_about') || localStorage.getItem('aboutMe') || '';
  const theme = localStorage.getItem('eco_theme') || localStorage.getItem('theme') || 'dark';
  const bg = localStorage.getItem('eco_bg') || localStorage.getItem('bg') || 'net';

  const userNameEl = document.getElementById('userName');
  const usernameInput = document.getElementById('usernameInput');
  const aboutMeInput = document.getElementById('aboutMeInput');

  applyTheme(theme);
  const themeSwitch = document.getElementById('switch');
  if (themeSwitch) {
    themeSwitch.checked = theme === 'dark';
  }

  setBackground(bg);

  document.querySelectorAll('[data-bg]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bg === bg);
  });

  const googleKeyInput = document.getElementById('googleKey');
  const googleCxInput = document.getElementById('googleCX');
  const googleKey2Input = document.getElementById('googleKey2');
  const googleCx2Input = document.getElementById('googleCX2');
  const openrouterKeyInput = document.getElementById('openrouterKey');
  const apolloKeyInput = document.getElementById('apolloKey');

  if (userNameEl) userNameEl.textContent = username;
  if (usernameInput) usernameInput.value = username;
  if (aboutMeInput) aboutMeInput.value = aboutMe;

  if (googleKeyInput) googleKeyInput.value = localStorage.getItem('eco_google_api') || '';
  if (googleCxInput) googleCxInput.value = localStorage.getItem('eco_CX') || '';
  if (googleKey2Input) googleKey2Input.value = localStorage.getItem('eco_google_api_2') || '';
  if (googleCx2Input) googleCx2Input.value = localStorage.getItem('eco_CX_2') || '';
  if (openrouterKeyInput) openrouterKeyInput.value = localStorage.getItem('eco_openrouter_api') || '';
  if (apolloKeyInput) apolloKeyInput.value = localStorage.getItem('eco_apollo_api') || '';

}

function getGoogleConfigs() {
  return [
    { key: API_KEY, cx: CX },
    { key: API_KEY2, cx: CX2 }
  ].filter(c => c.key && c.cx);
}



document.getElementById('showDataBtn').onclick = () => {
  alert(JSON.stringify(localStorage, null, 2));
};

function isFollowing(name) {
  const network = JSON.parse(localStorage.getItem('eco_network') || '[]');
  return network.some(p => p.name === name);
}

function toggleFollow(name, btn) {
  let network = JSON.parse(localStorage.getItem('eco_network') || '[]');

  if (isFollowing(name)) {
    network = network.filter(p => p.name !== name);
    btn.textContent = 'Follow';
    btn.classList.remove('following');
  } else {
    network.push({ name });
    btn.textContent = 'Following';
    btn.classList.add('following');
  }

  localStorage.setItem('eco_network', JSON.stringify(network));
}



function showError(msg) {
  const e = document.getElementById("errorBox");
  if (!e) return;
  e.querySelector("p").textContent = msg;
  e.classList.remove("hidden");
}


function setupSettings() {
  // Settings panel toggle
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsClose = document.getElementById('settingsClose');

  // Theme toggle (checkbox based)
const themeSwitch = document.getElementById('switch');

if (themeSwitch) {
  themeSwitch.addEventListener('change', () => {
    const theme = themeSwitch.checked ? 'dark' : 'light';
    applyTheme(theme);
  });
}


  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      settingsPanel.classList.add('open');
    });
  }

  if (settingsClose) {
    settingsClose.addEventListener('click', () => {
      settingsPanel.classList.remove('open');
    });
  }

  const fakeChats = [
  {
    name: "Alia Bhatt",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRce7IDauYwRLmVlTH5sfC7C3OEGOCL9quRcw&s",
    message: "Hello Alia, we would love to explore a brand collaboration with you for an upcoming campaign aligned with purpose and impact. It would be great to discuss this briefly if you are open."
  },
  {
    name: "Jensen Huang",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jen-Hsun_Huang_2025.jpg/250px-Jen-Hsun_Huang_2025.jpg",
    message: "Hello Jensen, your journey from a small startup to a tech titan is truly inspiring—can we chat about the leadership lessons you’ve learned along the way?"
  },
  {
    name: "Dr. BR Shetty",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0129YvFVrowEhvcoKY4V7oLdulLHgez4nNA&s",
    message: "Hi"
  },
  {
    name: "Ahmed bin Saeed Al Maktoum",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuE-Q711uNkMhzoKP09PGVRMNjnwUkeDKaJ0MRfxEWv5hmaRbZ_gGCYxJ7nF3s1G8P7DV1WO6BdRCNb1ilR6HiBOBD23R-HSCwrjmN2Q&s=10",
    message: "We would be honored to have you at our conference to share insights and engage with leaders shaping the future. Your perspective would add strong value to the discussion."
  }
];

function renderFakeChats() {
  const bar = document.getElementById("fakeChatBar");
  bar.innerHTML = fakeChats.map(c => `
    <div class="chat-avatar" onclick="openFakeChat('${c.name}')">
      <img src="${c.avatar}">
      <span>${c.name.split(" ")[0]}</span>
    </div>
  `).join("");
}

function openFakeChat(name) {
  const chat = fakeChats.find(c => c.name === name);
  if (!chat) return;

  document.getElementById("chatAvatar").src = chat.avatar;
  document.getElementById("chatName").textContent = chat.name;

  document.getElementById("chatMessages").innerHTML = `
    <div class="chat-bubble">${chat.message}</div>
  `;

  document.getElementById("fakeChatModal").classList.remove("hidden");
}

function closeFakeChat() {
  document.getElementById("fakeChatModal").classList.add("hidden");
}


/* Init */
document.addEventListener("DOMContentLoaded", () => {
  renderFakeChats();
});


document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("settingsPanel").classList.add("open");
});


  // Username
  const usernameInput = document.getElementById('usernameInput');
  if (usernameInput) {
    usernameInput.addEventListener('change', (e) => {
      const value = e.target.value.trim();
      if (value) {
        localStorage.setItem('eco_username', value);
        localStorage.setItem("username", value);
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = value;
      }
    });
  }

  // About Me
  const aboutMeInput = document.getElementById('aboutMeInput');
  if (aboutMeInput) {
    aboutMeInput.addEventListener('change', (e) => {
      localStorage.setItem('eco_about', e.target.value);
      localStorage.setItem("aboutMe", e.target.value);
    });
  }

  // Secondary / Apollo keys auto-save on change
  const googleKey2Input = document.getElementById('googleKey2');
  if (googleKey2Input) {
    googleKey2Input.addEventListener('change', (e) => {
      localStorage.setItem('eco_google_api_2', e.target.value.trim());
    });
  }

  const googleCx2Input = document.getElementById('googleCX2');
  if (googleCx2Input) {
    googleCx2Input.addEventListener('change', (e) => {
      localStorage.setItem('eco_CX_2', e.target.value.trim());
    });
  }

  const apolloKeyInput = document.getElementById('apolloKey');
  if (apolloKeyInput) {
    apolloKeyInput.addEventListener('change', (e) => {
      localStorage.setItem('eco_apollo_api', e.target.value.trim());
    });
  }


  // Background buttons
  document.querySelectorAll('[data-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
      const bg = btn.dataset.bg;
      setBackground(bg);
      document.querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Theme and Background
function setupTheme() {
  // Already handled in loadSettings
}


  // Pre-fill inputs
document.getElementById('googleKey').value = API_KEY;
document.getElementById('googleKey2').value = API_KEY2;
document.getElementById('googleCX').value = CX;
document.getElementById('googleCX2').value = CX2;
document.getElementById('openrouterKey').value = OPENROUTER_KEY;
document.getElementById('apolloKey').value = APOLLO_KEY;
  // ... other keys



function applyTheme(theme) {
  document.body.classList.toggle('light-mode', theme === 'light');
  localStorage.setItem('eco_theme', theme);
  localStorage.setItem('theme', theme);
}

function setupBackground() {
  // Already handled in loadSettings
}

function setBackground(bgType) {
  destroyVanta();
  localStorage.setItem("bg", bgType);
  localStorage.setItem("eco_bg", bgType);
 
  document.body.classList.remove('vanta-active');
  
  if (bgType === 'grid' || typeof VANTA === 'undefined') {
    const grid = document.querySelector(".bg-grid");
    if (grid) grid.style.display = "block";
    return;
  }

  document.body.classList.add('vanta-active');
  const config = { el: "#vanta-bg" };

  switch(bgType) {
    case 'dots':
      if (VANTA.DOTS) vantaEffect = VANTA.DOTS(config);
      break;
    case 'fog':
      if (VANTA.FOG) vantaEffect = VANTA.FOG(config);
      break;
    case 'net':
      if (VANTA.NET) vantaEffect = VANTA.NET(config);
      break;
    // case 'cells':
    //   if (VANTA.CELLS) vantaEffect = VANTA.CELLS(config);
    //   break;
    // case 'topo':
    //   if (VANTA.TOPOLOGY) vantaEffect = VANTA.TOPOLOGY(config);
    //   break;
    default:
      const grid = document.querySelector(".bg-grid");
      if (grid) grid.style.display = "block";
      break;
  }
}

function destroyVanta() {
  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }
  document.querySelector(".bg-grid").style.display = "none";
}

// Network Feed
function setupNetworkFeed() {
  const networkToggle = document.getElementById("networkToggle");
  const network = JSON.parse(localStorage.getItem("eco_network") || "[]");
  
  // Auto-show if user has network
  if (network.length > 0) {
    loadNetworkFeed();
    if (networkToggle) networkToggle.classList.add('active');
  }
  
  if (networkToggle) {
    networkToggle.addEventListener("click", () => {
      networkToggle.classList.toggle('active');
      if (networkToggle.classList.contains('active')) {
        loadNetworkFeed();
      } else {
        const networkFeed = document.getElementById("networkFeed");
        if (networkFeed) networkFeed.classList.add("hidden");
      }
    });
  }
}


async function loadNetworkFeed() {
  const networkFeed = document.getElementById("networkFeed");
  const networkFeedLoader = document.getElementById("networkFeedLoader");
  const networkFeedContent = document.getElementById("networkFeedContent");
  
  const network = JSON.parse(localStorage.getItem("eco_network") || localStorage.getItem("network") || "[]");
  
  if (network.length === 0) {
    networkFeed.classList.add("hidden");
    return;
  }
  
  networkFeed.classList.remove("hidden");
  networkFeedLoader.classList.remove("hidden");
  networkFeedContent.innerHTML = "<h3 class='network-heading'>Latest activities from your network</h3>";
  
  try {
    const allResults = [];
    
    for (const person of network.slice(0, 5)) {
      const [newsResults] = await Promise.all([
        fetchGoogleResults(`recent news on ${person.name}`, 1)
      ]);
      
      const allNews = processNews(newsResults).filter(n => n.image);
      // Shuffle and pick 4 random cards
      const shuffled = allNews.sort(() => Math.random() - 0.5);
      const news = shuffled.slice(0, 4);

      allResults.push({ person: person.name, news });
    }
    
    renderNetworkFeed(allResults);
  } catch (err) {
    console.error("Network feed error:", err);
  } finally {
    networkFeedLoader.classList.add("hidden");
  }
}

function renderNetworkFeed(data) {
  const networkFeedContent = document.getElementById("networkFeedContent");
  networkFeedContent.innerHTML = `<h3 class="network-heading">Recent activity on your network</h3>` + data.map(({ person, news }) => `
    <div class="network-person-section">
      <div class="network-news-grid">
      ${news.filter(n => n.image).map(n => `
      <div class="network-news-card bento-card" style="color: #000; background-color: #D3DAD9">
        <img src="${n.image}" alt="${n.title}" onerror="this.closest('.network-news-card').remove()" />
        <a href="${n.link}" target="_blank" style="color: #000;">${n.title}</a>
        <div class="meta">${n.source}</div>
      </div>
    `).join("")}
      </div>
    </div>
  `).join("");
}

// Search functionality
 const suggestions = [
  {name: "Satya Nadella", company: "Microsoft"},
  {name: "Jensen Huang", company: "NVIDIA"},
  {name: "Sundar Pichai", company: "Google"},
  {name: "Elon Musk", company: "Tesla"},
  {name: "Tim Cook", company: "Apple"}
 ];

function renderSuggestions() {
  const container = document.getElementById('suggestionChips');
  if (container) {
    container.innerHTML = suggestions.map(s => 
      `<div class="chip" onclick="selectSuggestion('${s.name}')">${s.name}</div>`
    ).join('');
  }
}

function setupEventListeners() {
  // Search input
  searchInput.addEventListener('input', handleInputChange);
  searchInput.addEventListener("keydown", handleKeyDown);
  
  // Search icon
  const searchIcon = document.getElementById("search-icon");
  if (searchIcon) {
    searchIcon.addEventListener("click", () => {
      if (searchInput.value.trim()) {
        startSearchFlow();
      }
    });
  }
  
      // Suggestions chips are handled via onclick in renderSuggestions
  
  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', handleBack);
  }

  // Click outside suggestion dropdown to close it
  document.addEventListener('click', (evt) => {
    const dropdown = document.getElementById('suggestionsDropdown');
    const searchContainer = document.querySelector('.search-container');
    if (!dropdown || !searchContainer) return;
    if (!searchContainer.contains(evt.target)) {
      dropdown.classList.remove('visible');
    }
  });
}

if (!API_KEY || !CX) {
  console.warn("Primary Google API key or CX missing");
}

if (!API_KEY2 || !CX_2) {
  console.warn("Backup Google API key or CX missing");
}

if (!OPENROUTER_KEY) {
  console.warn("Gen AI API key missing");
}

if (!APOLLO_KEY) {
  console.warn("Apollo API key missing");
}

function handleKeyDown(e) {
  const dropdown = document.getElementById('suggestionsDropdown');
  const items = dropdown ? dropdown.querySelectorAll('.suggestion-item') : [];


  if (!items.length) {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) startSearchFlow();
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    suggestionIndex = (suggestionIndex + 1) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    suggestionIndex = (suggestionIndex - 1 + items.length) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (suggestionIndex >= 0) {
      selectSuggestion(items[suggestionIndex].dataset.name);
    }
  } else if (e.key === 'Escape') {
    if (dropdown) dropdown.classList.remove('visible');
  }
}

function updateActiveItem(items) {
  items.forEach((item, i) => {
    item.classList.toggle('active', i === suggestionIndex);
  });
}


function clearSuggestionsAndExtras() {
  const dropdown = document.getElementById('suggestionsDropdown');
  if (dropdown) dropdown.classList.remove('visible');
  activeIndex = -1;
}

function selectSuggestion(value) {
  if (searchInput) searchInput.value = value;
  const dropdown = document.getElementById('suggestionsDropdown');
  if (dropdown) dropdown.classList.remove('visible');
  startSearchFlow();
}

function handleInputChange() {
  const q = searchInput.value.trim();
  const dropdown = document.getElementById('suggestionsDropdown');
  
  if (!q || q.length < 2) {
    if (dropdown) dropdown.classList.remove('visible');
    return;
  }
  
  // Debounce
  clearTimeout(handleInputChange.timeout);
  handleInputChange.timeout = setTimeout(() => {
    fetchSuggestions(q);
  }, 300);
}

document.addEventListener("click", (e) => {
  const panel = document.getElementById("settingsPanel");
  const button = document.getElementById("settingsBtn");

  if (!panel.classList.contains("open")) return;

  const clickedInsidePanel = panel.contains(e.target);
  const clickedButton = button.contains(e.target);

  if (!clickedInsidePanel && !clickedButton) {
    panel.classList.remove("open");
    button.classList.remove("spinning"); // if you have icon spin
  }
});


// REPLACE fetchSuggestions with DuckDuckGo Instant Answer API (no rate limit)
async function fetchSuggestions(query) {
  const dropdown = document.getElementById('suggestionsDropdown');
  if (!dropdown) return;
  
  try {
    // Use DuckDuckGo Instant Answer API (no API key required, no rate limit)
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`
    );
    const data = await res.json();
    
    // Collect related topics and results
    let names = [];
    
    // Add main result if exists
    if (data.Heading) names.push(data.Heading);
    
    // Add related topics
    if (data.RelatedTopics) {
      data.RelatedTopics.forEach(topic => {
        if (topic.Text) {
          const name = topic.Text.split(' - ')[0].trim();
          if (name && name.length < 60) names.push(name);
        }
        // Handle nested topics
        if (topic.Topics) {
          topic.Topics.forEach(t => {
            if (t.Text) {
              const n = t.Text.split(' - ')[0].trim();
              if (n && n.length < 60) names.push(n);
            }
          });
        }
      });
    }
    
    names = [...new Set(names)].slice(0, 6);
    
    if (names.length === 0) {
      // Fallback to Wikipedia if DuckDuckGo returns nothing
      const wikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=6&namespace=0&format=json&origin=*`
      );
      const wikiData = await wikiRes.json();
      names = [...new Set(wikiData[1] || [])].slice(0, 6);
    }

    if (names.length === 0) {
      dropdown.classList.remove('visible');
      return;
    }

    const items = await Promise.all(names.map(async (name) => {
      let img = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
      try {
        const imgRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
        const imgData = await imgRes.json();
        if (imgData.thumbnail?.source) img = imgData.thumbnail.source;
      } catch {}
      return { name, img };
    }));

    dropdown.innerHTML = items.map((item, i) => `
      <div class="suggestion-item ${i === 0 ? 'active' : ''}" data-name="${item.name}">
        <img src="${item.img}" class="suggestion-img" alt="${item.name}">
        <span>${item.name}</span>
      </div>
    `).join('');

    dropdown.classList.add('visible');
    suggestionIndex = 0;

    dropdown.querySelectorAll('.suggestion-item').forEach((item, i) => {
      item.addEventListener('click', () => selectSuggestion(item.dataset.name));
      item.addEventListener('mouseenter', () => {
        dropdown.querySelectorAll('.suggestion-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        suggestionIndex = i;
      });
    });

  } catch (err) {
    console.error('Search error:', err);
  }
}


function isDemoMode() {
  return localStorage.getItem("eco_demo_mode") === "true";
}

const demoToggle = document.getElementById("demoModeToggle");

if (demoToggle) {
  demoToggle.checked = isDemoMode();

  demoToggle.addEventListener("change", () => {
    const isDemo = demoToggle.checked;
    localStorage.setItem("eco_demo_mode", isDemo ? "true" : "false");
    
    if (isDemo) {
      // When enabling demo mode, redirect to Jensen page
      window.location.href = "/jensen.html";
    } else {
      // When disabling demo mode, go back to main search
      window.location.href = "/";
    }
  });
}



function showLoader() {
  const loaderEl = document.getElementById("loader");
  if (loaderEl) loaderEl.classList.remove("hidden");
  document.getElementById("static-suggestions").style.display = "None";
  
  // Disable search input
  const searchInput = document.getElementById("searchInput");
  const searchmask = document.getElementById("input-mask");
  if (searchInput) {
    searchInput.disabled = true;
    searchInput.style.backgroundColor = "rgb(30, 30, 30)";
    searchInput.style.cursor = "not-allowed";
  }

  if (searchmask) {
    searchmask.style.display = "none";
  }
}

function hideLoader() {
  const loaderEl = document.getElementById("loader");
  if (loaderEl) loaderEl.classList.add("hidden");
  
  // Re-enable search input
  const searchInput = document.getElementById("searchInput");
  const searchmask = document.getElementById("input-mask");
  if (searchInput) {
    searchInput.disabled = false;
    searchInput.style.backgroundColor = "rgb(0, 0, 0)";
    searchInput.style.cursor = "text";
  }
  if (searchmask) {
    searchmask.style.display = "block";
  }
}

function extractProfileLinksFromResults(xItems, liItems) {
  let xProfile = null;
  let linkedinProfile = null;

  // X / Twitter
  if (Array.isArray(xItems)) {
    for (const item of xItems) {
      const url = item.link;
      if (!url) continue;

      // Ignore posts
      if (url.includes("/status/")) continue;

      // Keep clean profile root
      if (url.includes("x.com/") || url.includes("twitter.com/")) {
        xProfile = url.split("/status")[0];
        break;
      }
    }
  }

  // LinkedIn
  if (Array.isArray(liItems)) {
    for (const item of liItems) {
      const url = item.link;
      if (!url) continue;

      if (url.includes("linkedin.com/in/")) {
        linkedinProfile = url.split("?")[0];
        break;
      }
    }
  }

  return {
    x: xProfile,
    linkedin: linkedinProfile
  };
}


// Search Flow
async function startSearchFlow() {
  const query = searchInput.value.trim();
  if (!query) return;

  currentQuery = query;

  // Reset UI state for new search
  const resultsView = document.getElementById("resultsView");
  const bentoGrid = document.getElementById("bentoGrid");
  
  // Clear previous results
  if (bentoGrid) bentoGrid.innerHTML = '';
  if (resultsView) resultsView.classList.remove("visible");
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  const MIN_LOADING_TIME = 4000;
  const startTime = Date.now();

  document.getElementById("resultsView").style.display = "block";

  showLoader();
  

if (isDemoMode()) {
  // Simply redirect to the Jensen Huang demo page
  window.location.href = "/jensen.html";
  return;
}


  try {
    // 1. Non-rate-limited calls can stay parallel
    const profile = await getWikiProfile(query);

// 2. Google calls MUST be serial
const newsResults = await fetchGoogleResults(
  `recent news on ${query}`,
  1,
  { recentDays: 30 }
);

await sleep(400);

const xResults = await fetchGoogleResults(
  `site:x.com OR site:twitter.com ${query}`,
  1,
  { recentDays: 30 }
);

await sleep(400);

const liResults = await fetchGoogleResults(
  `site:linkedin.com ${query}`,
  1,
  { recentDays: 30 }
);


    const news = processNews(newsResults).slice(0, 20);
    const newsContext = news.slice(0, 5).map(n => `- ${n.title}: ${n.snippet}`).join('\n');
    const aiSummaryResult = await getAISummaryWithContext(query, newsContext);
    const xPosts = processXPosts(xResults).slice(0, 6);
    const linkedin = processLinkedIn(liResults).slice(0, 6);
    const socialProfiles = extractProfileLinksFromResults(xResults, liResults);


    const aiSummary = aiSummaryResult || {
      summary: null,
      icebreakers: [],
      error: null
    };

    searchResults = {
      profile,
      news,
      xPosts,
      linkedin,
      aiSummary,
      socialProfiles
    };

    // ⏱ Ensure loader stays for at least 4s
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

    
  console.log("AI summary payload:", aiSummary);
    setTimeout(() => {
      renderResults();
      
    document.getElementById("greeting").style.display = "none";
      hideLoader();
      if (resultsView) resultsView.classList.add("visible");
    }, remaining);

  } catch (err) {
    console.error("Search error:", err);

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

    setTimeout(() => {
      hideLoader();
      showError("Search failed. Please check your API keys in settings.");
      showToast("Search failed. Please try again.", true);
    }, remaining);
  }
}


// API Functions
async function fetchGoogleResults(query, pages = 2, { recentDays = null } = {}) {
  const allResults = [];
  const configs = getGoogleConfigs();

  if (!configs.length) return allResults;

  for (let page = 0; page < pages; page++) {
    const start = 1 + page * 10;
    let pageFetched = false;

    // Try each config ONCE per page, cyclically
    for (let attempt = 0; attempt < configs.length; attempt++) {
      const configIndex =
        (currentConfigIndex + attempt) % configs.length;

      const { key, cx } = configs[configIndex];

      try {
        const base = "https://www.googleapis.com/customsearch/v1";
        const params = new URLSearchParams({
          q: query,
          num: "10",
          start: String(start),
          key,
          cx
        });

        if (recentDays) {
          params.set("dateRestrict", `d${recentDays}`);
        }

        const url = `${base}?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();

        // ---- HARD QUOTA CHECK ----
        if (data?.error?.code === 429) {
          console.warn(
            `Google API quota hit on config ${configIndex}, switching`
          );
          continue; // try next key
        }

        // ---- OTHER API ERRORS ----
        if (!res.ok || data.error) {
          console.error(
            "Google search error on config",
            configIndex,
            data.error || res.statusText
          );
          continue;
        }

        // ---- SUCCESS ----
        if (data.items) {
          allResults.push(...data.items);
        }

        // Lock working config for next calls
        currentConfigIndex = configIndex;
        pageFetched = true;
        break;
      } catch (err) {
        console.error(
          "Google search network failure on config",
          configIndex,
          err
        );
      }
    }

    // If BOTH keys failed for this page, skip page and continue
    if (!pageFetched) {
      console.warn("All Google API keys exhausted for page", page);
      continue;
    }
  }

  return allResults;
}


async function getWikiProfile(name) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    const data = await res.json();
    return {
      name,
      image: data.thumbnail?.source || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
      extract: data.extract || ''
    };
  } catch {
    return {
      name,
      image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
      extract: ''
    };
  }
}

function showToast(message, type = "info", duration = 8000) {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  root.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


function getOpenRouterKey() {
  // Prefer user-provided key from settings, fall back to baked-in key
  return localStorage.getItem('eco_openrouter_api') || OPENROUTER_KEY;
}

async function getAISummary(name) {
  const key = getOpenRouterKey();
  if (!key) {
    return {
      summary: null,
      icebreakers: [],
      error: "AI key missing. Add your OpenRouter key in settings to enable AI cards."
    };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ECO Platform'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [{
          role: 'user',
          content: `You are helping with executive research. For "${name}", return strict JSON with two fields: "summary" (2-3 sentence overview) and "icebreakers" (array of 3 short-medium, warm intro messages). No extra text.`
        }],
        "reasoning": {"enabled": true}
      })
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("AI summary API error:", data.error || res.statusText);
      return {
        summary: null,
        icebreakers: [],
        error: "AI summary unavailable. Please check your AI API key."
      };
    }

    const raw = data.choices?.[0]?.message?.content || "";

const cleaned = raw
  .replace(/```json/gi, "")
  .replace(/```/g, "")
  .trim();

let parsed;

try {
  parsed = JSON.parse(cleaned);
} catch (e) {
  console.warn("AI response not valid JSON, fallback to text", cleaned);
  return {
    summary: cleaned || null,
    icebreakers: [],
    error: null
  };
}

return {
  summary: parsed.summary || null,
  icebreakers: Array.isArray(parsed.icebreakers)
    ? parsed.icebreakers.slice(0, 3)
    : [],
  error: null
};


    return {
      summary: parsed?.summary || null,
      icebreakers: Array.isArray(parsed?.icebreakers) ? parsed.icebreakers.slice(0, 3) : [],
      error: null
    };
  } catch (err) {
    console.error("AI summary network error:", err);
    return {
      summary: null,
      icebreakers: [],
      error: "AI summary unavailable due to a network error."
    };
  }
}

async function getAISummaryWithContext(name, newsContext) {
  const key = getOpenRouterKey();
  if (!key) {
    return {
      summary: null,
      icebreakers: [],
      error: "AI key missing. Add your OpenRouter key in settings to enable AI cards."
    };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ECO Platform'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [{
          role: 'user',
          content: `You are helping with executive research. For "${name}", here is the latest news:

${newsContext || 'No recent news available.'}

Based on this context, return strict JSON with two fields: "summary" (2-3 sentence overview focusing on recent developments) and "icebreakers" (array of 3 short-medium, warm intro messages that reference recent news). No extra text.`
        }],
        "reasoning": {"enabled": true}
      })
    });
    
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("AI summary API error:", data.error || res.statusText);
      return { summary: null, icebreakers: [], error: "AI summary unavailable." };
    }

    const raw = data.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        summary: parsed.summary || null,
        icebreakers: Array.isArray(parsed.icebreakers) ? parsed.icebreakers.slice(0, 3) : [],
        error: null
      };
    } catch {
      return { summary: cleaned || null, icebreakers: [], error: null };
    }
  } catch (err) {
    console.error("AI summary network error:", err);
    return { summary: null, icebreakers: [], error: "AI summary unavailable." };
  }
}


function renderCard(cardElement, data) {
  if (!data || data.error) {
    cardElement.innerHTML = `
      <div class="card-error">
        <span class="error-icon"></span>
        <p>Something went wrong</p>
      </div>
    `;
    cardElement.classList.add('error-state');
    return;
  }
  // Normal rendering...
}


async function getApolloContact(name, company) {
  if (!APOLLO_KEY) {
    // Return placeholder structure
    return {
      email: null,
      linkedin: null,
      twitter: null,
      phone: null
    };
  }
  
  try {
    const res = await fetch('/api/apollo', {
      headers: {
        'Content-Type': 'application/json'},
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Apollo fetch failed:', error);
    return { error: true, message: error.message };
  }
}

async function draftIntro(targetName) {
  const aboutMe = localStorage.getItem('eco_about') || localStorage.getItem("aboutMe") || 'a professional';
  
  if (!aboutMe || aboutMe === 'a professional') {
    showToast("Please set 'About me' in settings first.", true);
    return;
  }
  
  const key = getOpenRouterKey();
  if (!key) {
    showToast("Please add an OpenRouter key in settings first.", true);
    return;
  }

  try {
    showToast("Generating draft intro...");
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ECO Platform'
      },      
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [{
          role: 'user',
          content: `Here's about me: ${aboutMe}. Now write a brief, warm introduction email for ${targetName}. Keep it under 100 words.`
        }],
        "reasoning": {"enabled": true}
      })
    });
    
    const data = await res.json();
    const draft = data.choices?.[0]?.message?.content || "Failed to generate draft.";
    
    // Copy to clipboard
    navigator.clipboard.writeText(draft);
    showToast("Draft intro copied to clipboard!");
    
    showToast(`Draft Introduction:\n\n${draft}`, "success", 8000);
  } catch (err) {
    console.error("Draft intro error:", err);
    showToast("Failed to generate draft intro.", true);
  }
}

// Process results
function processNews(items) {
  return items.map(item => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet || "",
    image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src || null,
    source: new URL(item.link).hostname.replace('www.', '')
  }));
}

async function fetchApolloData(name) {
  const apolloKey = localStorage.getItem('eco_apollo_api') || APOLLO_KEY;
  if (!apolloKey) return null;

  try {
    const res = await fetch('/api/apollo', {  // Your serverless endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        person_titles: [],
        q_keywords: name,
        page: 1,
        per_page: 1
      })
    });
    const data = await res.json();
    return data.people?.[0] || null;
  } catch (err) {
    console.error('Apollo fetch failed:', err);
    return null;
  }
}


function processXPosts(items) {
  return items
    .filter(item => item.link && item.link.includes('/status/'))
    .map(item => ({ link: item.link }));
}

function processLinkedIn(items) {
  return items.map(item => ({
    title: item.title,
    link: item.link
  }));
}

function copycard(){
  document.getElementById("copy-btn").textContent = "Copied";
}

// Render results
function renderResults() {
  const isHome = !searchResults.profile;
  
  

  document.getElementById("searchView").style.display = "none";
  if (!searchResults) return;
  
  const { profile, news, xPosts, linkedin, aiSummary, socialProfiles } = searchResults;
  
  const grid = document.getElementById("bentoGrid");
  if (!grid) return;

  
  // Get Apollo contact info
  getApolloContact(profile.name, "").then(contacts => {
    const colors = ['card-color-1', 'card-color-2', 'card-color-3', 'card-color-4','card-color-5'];
    let colorIndex = 0;

    const getNextColor = (lastColor) => {
      let color = colors[colorIndex % 5];
      while (color === lastColor && colors.length > 1) {
        colorIndex++;
        color = colors[colorIndex % 5];
      }
      colorIndex++;
      return color;
    };

    let html = '<div class="bento-left">';

    // Resolve follow state once, outside of template HTML
    const isAlreadyFollowing = isFollowing(profile.name);

    // Profile Card
    html += `
      <div class="bento-card profile-card">
        <img src="${profile.image}" class="profile-avatar" alt="${profile.name}">
        <h2 class="profile-name">${profile.name}</h2>
        <p class="profile-title">${profile.company || '—'}</p>
        <div class="social-row">
          <button class="social-btn mailb" onclick="openSocial('mail','${profile.name}','${contacts.email}')">
            <i data-lucide="mail"></i>
          </button>

          <button class="social-btn linkedinb" onclick="openSocial('linkedin','${profile.name}','${socialProfiles.linkedin}')">
            <i data-lucide="linkedin"></i>
          </button>

          <button class="social-btn xb" onclick="openSocial('x','${profile.name}','${socialProfiles.x}')">

            <i data-lucide="twitter"></i>
          </button>

          <button class="social-btn wb" onclick="openSocial('whatsapp','${profile.name}','${contacts.phone}')">
            <i data-lucide="phone"></i>
          </button>
      </div>

        <div class="action-btns">

          <button class="follow-btn ${isAlreadyFollowing ? 'following' : ''}" onclick="toggleFollow('${profile.name}', this)"> ${isAlreadyFollowing ? 'Following' : 'Follow'} </button>

          <button class="draft-btn" onclick="draftIntro('${profile.name}')"><i data-lucide="sparkles" style="width: 16px; height: 16px; color: white;"></i>
          Draft Intro</button>
        </div>
      </div>
    `;

  

    // AI summary + drafts (column 2 of bento-left)
html += `
<div class="ai-stack">
  <div class="bento-card ai-summary-card">
    <div class="card-title">
      <i data-lucide="brain"></i>
      AI Synthesis
    </div>
    <p class="ai-text">
      ${aiSummary?.summary || "AI summary unavailable."}
    </p>
  </div>

  <div class="draft-stack">
    ${(aiSummary?.icebreakers || []).slice(0,3).map((d, i) => `<div class="icebreaker-actions">
    <button class="copy-btn" id="copy-btn" onclick="copycard()">Copy</button>
  </div>  
      <div class="draft-card">
        <div class="draft-index">${i + 1}</div>
        <p>${d}</p>
      </div>
    `).join("")}
  </div>
</div>
`;


    html += `<div class="news-grid">`; 

    // News Cards
    let lastColor = getNextColor();
    news.filter(n => n.image).forEach(n => {
      lastColor = getNextColor(lastColor);
      html += `
        <div class="bento-card ${lastColor}">
          <img src="${n.image}" class="news-img" alt="${n.title}" onerror="this.closest('.bento-card').remove()">
          <h3 class="news-title">${n.title}</h3>
          <p class="news-source">${n.source}</p>
          <a href="${n.link}" target="_blank" style="color: inherit; text-decoration: none;" class="news-source-view">View →</a><br><br>
        </div>
      `;
    });

    html += '</div>';
    html += '</div>';

    // Right column
    html += '<div class="bento-right">';

    

    // X Posts
    xPosts.forEach(post => {
      html += `
        <div class="x-embed" id="x-post-${post.link.split('/').pop()}">
          <div class="card-title">
            <i data-lucide="twitter"></i>
            X Post
          </div>
          <div class="loading-post">Loading post...</div>
        </div>
      `;
    });

    // LinkedIn
    linkedin.forEach(li => {
      html += `
        <div class="linkedin-card">
          <div class="card-title">
            <i data-lucide="linkedin" class="lucide-linkedin1"></i>
            LinkedIn
          </div>
          <p>${li.title}</p>
          <a href="${li.link}" target="_blank" style="color: #fff;">View post</a>
        </div>
      `;
    });

    html += '</div>';

    grid.innerHTML = html;
    lucide.createIcons();

    // Load X embeds
    xPosts.forEach(post => {
      loadXEmbed(post.link);
    });
    
    // Show results view
    if (resultsView) {
      resultsView.classList.add('visible');
    }
  });
}

function parseAIResponse(raw) {
  if (!raw) return { summary: "", icebreakers: [] };

  // Remove markdown code fences if present
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Try JSON parse
  try {
    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || "",
      icebreakers: Array.isArray(parsed.icebreakers)
        ? parsed.icebreakers
        : []
    };
  } catch {
    // Fallback: treat as plain summary text
    return {
      summary: raw,
      icebreakers: []
    };
  }
}

function getRandomBentoColor(index = null) {
  const colors = [ "#001523", "#07525E", "#702006", "#EB7300" ];
  if (index !== null) {
    return colors[index % colors.length];
  }
  return colors[Math.floor(Math.random() * colors.length)];
}

async function loadXEmbed(tweetUrl) {
  const postId = tweetUrl.split('/').pop();
  const container = document.getElementById(`x-post-${postId}`);
  if (!container) return;
  
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?omit_script=true&url=${encodeURIComponent(tweetUrl)}`
    );
    const data = await res.json();
    
    if (data.html) {
      container.innerHTML = data.html;
      if (window.twttr?.widgets) {
        twttr.widgets.load(container);
      }
    }
  } catch (err) {
    container.innerHTML = `<a href="${tweetUrl}" target="_blank" style="color: white; background-color: black;">View post on X</a>`;
  }
}

// Follow functionality
function handleFollow(name, image) {
  const network = JSON.parse(localStorage.getItem('eco_network') || localStorage.getItem("network") || "[]");
  
  if (!network.find(p => p.name === name)) {
    network.push({ name, image, addedAt: new Date().toISOString() });
    localStorage.setItem('eco_network', JSON.stringify(network));
    localStorage.setItem("network", JSON.stringify(network));
    showToast(`${name} added to network!`);
    document.getElementById("follow-btn").textContent = "Following"
    document.getElementById("follow-btn").style.backgroundColor = "black";
    document.getElementById("follow-btn").style.Color = "white";
  } else {
    showToast(`${name} is already in your network.`);
  }
}

function showSearchView() {
  document.querySelector(".suggestions")?.classList.remove("fade-out");
  document.querySelector(".suggestions")?.classList.add("visible");
}

// Back button
function handleBack() {
  if (searchInput) searchInput.value = '';
  currentQuery = '';
  searchResults = null;

  document.getElementById("static-suggestions").style.display = "block";
  document.getElementById("resultsView").style.display = "none";
  document.getElementById("greeting").style.display = "block";
  document.getElementById("searchView").style.display = "block";
  
  showSearchView();
  if (searchView) {
    searchView.style.display = "";
    searchView.classList.remove("hiding");
  }
  
  if (resultsView) {
    resultsView.classList.remove("visible");
  }
  
}

// Toast
function showToast(message, isError = false) {
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Open social links
function openSocial(platform, name, url) {
  if (!url) {
    const urls = {
      x: `https://x.com/search?q=${encodeURIComponent(name)}`,
      linkedin: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent('Check out ' + name)}`,
      mail: `mailto:?subject=${encodeURIComponent('Introduction to ' + name)}`
    };
    window.open(urls[platform], '_blank');
  } else {
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/${url.replace(/\D/g, '')}`, '_blank');
    } else if (platform === 'mail') {
      window.open(`mailto:${url}`, '_blank');
    } else {
      window.open(url, '_blank');
    }
  }
}

// Expose functions globally
window.handleFollow = handleFollow;
window.draftIntro = draftIntro;
window.openSocial = openSocial;
window.selectSuggestion = selectSuggestion;

function setupGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Morning';
  if (hour >= 12 && hour < 17) greeting = 'Afternoon';
  else if (hour >= 17 && hour < 21) greeting = 'Evening';
  else if (hour >= 21) greeting = 'Night';
  
  const greetingEl = document.getElementById('greetingTime');
  if (greetingEl) greetingEl.textContent = greeting;
}

function saveKey(type) {
  // Store user-provided keys under eco_* names so they can be reused
  const map = {
    google: "eco_google_api",
    cx: "eco_CX",
    or: "eco_openrouter_api"
  };
  const el = document.getElementById(
    type === "google" ? "googleKey" :
    type === "cx" ? "googleCX" : "openrouterKey"
  );
  if (!el || !map[type]) return;
  localStorage.setItem(map[type], el.value.trim());
}

["googleKey2", "googleCx2", "apolloKey"].forEach(id => {
  const v = localStorage.getItem(id);
  if (v) document.getElementById(id).value = v;
});

async function fetchNetworkData() {
  const raw = JSON.parse(localStorage.getItem("eco_network") || "[]");

  const nodes = [
    { id: "You", center: true },
    ...raw.map(p => ({ id: p.name }))
  ];

  const links = raw.map(p => ({
    source: "You",
    target: p.name
  }));

  return { nodes, links };
}

function renderNetwork({ nodes, links }) {
  const svg = d3.select("#networkSvg");
  svg.selectAll("*").remove();

  const width = svg.node().clientWidth;
  const height = svg.node().clientHeight;

  svg.attr("width", width).attr("height", height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;

  const angleStep = (2 * Math.PI) / (nodes.length - 1);

  nodes.forEach((n, i) => {
    if (n.center) {
      n.x = cx;
      n.y = cy;
    } else {
      const angle = angleStep * (i - 1);
      n.x = cx + radius * Math.cos(angle);
      n.y = cy + radius * Math.sin(angle);
    }
  });

  svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("x1", d => nodes.find(n => n.id === d.source).x)
    .attr("y1", d => nodes.find(n => n.id === d.source).y)
    .attr("x2", d => nodes.find(n => n.id === d.target).x)
    .attr("y2", d => nodes.find(n => n.id === d.target).y)
    .attr("stroke", "#3A3A3A")
    .attr("stroke-width", 1.3);

  svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.center ? 11 : 6)
    .attr("fill", d => d.center ? "#E9762B" : "#8A8A8A");

  svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y + (d.center ? -16 : 14))
    .attr("text-anchor", "middle")
    .attr("font-size", d => d.center ? "13px" : "11px")
    .attr("fill", "#B5B5B5")
    .text(d => d.id);
}



async function openNetwork() {
  document.getElementById("networkModal").classList.remove("hidden");

  const data = await fetchNetworkData();
  renderNetwork(data);
}

function closeNetwork() {
  document.getElementById("networkModal").classList.add("hidden");
  d3.select("#networkSvg").selectAll("*").remove();
}


