window.DEMO_RESULTS = {
    "Satya Nadella": "/demo/satya.html",
    "Jensen Huang": "/demo/jensen.html",
    "Sundar Pichai": "/demo/sundar.html",
    "Elon Musk": "/demo/elon.html",
    "Tim Cook": "/demo/tim.html"
  };
  
  
  // demoresults.js - Replace lines 19-25:

window.handleDemoResult = async function (name) {
  const demoPage = window.DEMO_RESULTS[name];
  if (!demoPage) {
    showError("Demo mode supports only suggested profiles.");
    return;
  }

  // Wait for DOM to be ready
  await new Promise(requestAnimationFrame);
  await new Promise(resolve => setTimeout(resolve, 100)); // extra safety

  const searchView = document.getElementById("searchView");
  const resultsView = document.getElementById("resultsView");
  const results = document.getElementById("results");

  if (!resultsView || !results) {
    console.error("Demo DOM still not available");
    return;
  }

  // Show results view, hide search
  resultsView.style.display = "block";
  resultsView.classList.remove("hidden");
  if (searchView) searchView.classList.add("fade-out");

  // Hide loader and greeting
  const loader = document.getElementById("loader");
  const greeting = document.getElementById("greeting");
  if (loader) loader.classList.add("hidden");
  if (greeting) greeting.style.display = "none";

  // Fetch and inject demo HTML
  try {
    const res = await fetch(demoPage);
    const html = await res.text();
    results.innerHTML = html;
    resultsView.classList.add("visible");
  } catch (err) {
    console.error("Failed to load demo page:", err);
    showError("Failed to load demo content.");
  }
};

  
  

  function ensureResultsView() {
    let resultsView = document.getElementById("resultsView");
    let results = document.getElementById("results");
  
    if (!resultsView || !results) {
      // Force results view visible
      document.body.classList.remove("is-loading");
  
      resultsView = document.getElementById("resultsView");
      results = document.getElementById("results");
    }
  
    return { resultsView, results };
  }
  