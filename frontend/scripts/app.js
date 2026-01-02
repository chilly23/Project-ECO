import { getWikiProfile } from "./wiki.js";
import { fetchNews, fetchSocialLinks } from "./serp.js";
import { getAISummary, draftIntro } from "./ai.js";
import {
  renderProfile,
  renderSummary,
  renderNews,
  renderSocial
} from "./render.js";

export async function startSearch(name) {
  showLoader();

  const [profile, news, social, summary] = await Promise.all([
    getWikiProfile(name),
    fetchNews(name),
    fetchSocialLinks(name),
    getAISummary(name)
  ]);

  hideLoader();

  renderProfile(profile);
  renderSummary(summary);
  renderNews(news);
  renderSocial(social);
}
