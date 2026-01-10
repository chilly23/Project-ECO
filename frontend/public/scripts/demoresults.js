// demoresults.js - Fixed version

window.DEMO_RESULTS = {
  "Satya Nadella": "/satya.html",
  "Jensen Huang": "/jensen.html",
  "Sundar Pichai": "/sundar.html",
  "Elon Musk": "/elon.html",
  "Tim Cook": "/tim.html"
};

window.handleDemoResult = async function (name) {
  const demoPage = window.DEMO_RESULTS[name];
  if (!demoPage) {
    showError("Demo mode supports only suggested profiles.");
    return;
  }

  // Wait for next frame + buffer
  await new Promise(requestAnimationFrame);
  await new Promise(resolve => setTimeout(resolve, 150));

  const searchView = document.getElementById("searchView");
  let resultsView = document.getElementById("resultsView");
  let results = document.getElementById("results");

  // CREATE elements if they don't exist
  if (!resultsView) {
    resultsView = document.createElement("div");
    resultsView.id = "resultsView";
    resultsView.className = "results-view";
    document.body.appendChild(resultsView);
  }

  if (!results) {
    results = document.createElement("div");
    results.id = "results";
    resultsView.appendChild(results);
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
    hideLoader(); // ensure loader is hidden
  } catch (err) {
    console.error("Failed to load demo page:", err);
    showError("Failed to load demo content.");
  }
};
