export function renderProfile(profile) {
  document.getElementById("profile-card").innerHTML = `
    <img class="profile-avatar" src="${profile.image}">
    <div class="social-row">
      <button>X</button>
      <button>in</button>
      <button>wa</button>
    </div>
    <button id="follow-btn">Follow</button>
    <button id="draft-btn">Draft Intro</button>
  `;
}

export function renderSummary(text) {
  document.getElementById("summary-card").innerText = text;
}

export function renderNews(news) {
  const grid = document.getElementById("bento-grid");
  news.forEach(n => {
    grid.innerHTML += `
      <div class="bento-card news-card">
        <h4>${n.title}</h4>
        <a href="${n.link}" target="_blank">${n.source?.name || ""}</a>
      </div>
    `;
  });
}

export function renderSocial({ x, linkedin }) {
  const grid = document.getElementById("bento-grid");

  x.forEach(l => {
    grid.innerHTML += `
      <div class="bento-card social-card">
        <blockquote class="twitter-tweet">
          <a href="${l}"></a>
        </blockquote>
      </div>
    `;
  });

  linkedin.forEach(l => {
    grid.innerHTML += `
      <div class="bento-card social-card">
        <a href="${l}" target="_blank">View LinkedIn Post</a>
      </div>
    `;
  });

  if (window.twttr) twttr.widgets.load();
}
