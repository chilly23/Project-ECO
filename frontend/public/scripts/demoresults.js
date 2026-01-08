window.DEMO_RESULTS = {
    "Satya Nadella": "/demo/satya.html",
    "Jensen Huang": "/demo/jensen.html",
    "Sundar Pichai": "/demo/sundar.html",
    "Elon Musk": "/demo/elon.html",
    "Tim Cook": "/demo/tim.html"
  };
  
  window.handleDemoResult = async function (name) {
    const demoPage = window.DEMO_RESULTS[name];
    if (!demoPage) {
      showError("Demo mode supports only suggested profiles.");
      return;
    }
  
    // Wait one frame so UI state settles
    await new Promise(requestAnimationFrame);
  
    const searchView = document.getElementById("searchView");
    const { resultsView, results } = ensureResultsView();
  
    if (!resultsView || !results || !searchView) {
      console.error("Demo DOM still not available");
      return;
    }
  
    resultsView.classList.remove("hidden");
    searchView.classList.add("fade-out");
  
    const res = await fetch(demoPage);
    const html = await res.text();
    results.innerHTML = html;
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
  