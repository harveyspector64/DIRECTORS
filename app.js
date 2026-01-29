const filters = {
  budget: document.getElementById("filter-budget"),
  genre: document.getElementById("filter-genre"),
  tone: document.getElementById("filter-tone"),
  track: document.getElementById("filter-track"),
  leverage: document.getElementById("filter-leverage"),
  presales: document.getElementById("filter-presales"),
  scale: document.getElementById("filter-scale"),
};

const listEl = document.getElementById("director-list");
const matchCount = document.getElementById("match-count");
const projectForm = document.getElementById("project-form");
const projectList = document.querySelector(".project-list");
const clearProjectsBtn = document.getElementById("clear-projects");
const clearFiltersBtn = document.getElementById("clear-filters");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const dataStamp = document.getElementById("data-stamp");

const state = {
  projects: [],
  directors: [],
};

const tokenize = (value) =>
  value
    .toLowerCase()
    .split(/[,/]/)
    .map((token) => token.trim())
    .filter(Boolean);

const buildOptions = (values) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const populateSelect = (select, options) => {
  const baseOption = select.querySelector("option");
  select.innerHTML = "";
  select.appendChild(baseOption);
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
};

const computeMatchScore = (director, project) => {
  if (!project) {
    return 0;
  }

  let score = 0;
  const genreTokens = tokenize(project.genre || "");
  const toneTokens = tokenize(project.tone || "");

  if (project.budget && director.budgetTier === project.budget) score += 2;
  if (project.presales && director.presalesReadiness === project.presales) score += 2;
  if (project.priority === "Commercial heat" && director.packagingLeverage === "High") {
    score += 2;
  }
  if (project.priority === "Awards potential" && director.awards.includes("Oscar")) {
    score += 2;
  }
  if (
    project.priority === "International presales" &&
    ["Strong", "Very strong"].includes(director.internationalAppeal)
  ) {
    score += 2;
  }

  genreTokens.forEach((token) => {
    if (director.genres.some((genre) => genre.toLowerCase().includes(token))) {
      score += 1;
    }
  });

  toneTokens.forEach((token) => {
    if (director.tone.some((tone) => tone.toLowerCase().includes(token))) {
      score += 1;
    }
  });

  return score;
};

const renderDirectors = () => {
  listEl.innerHTML = "";
  const searchValue = searchInput.value.toLowerCase();
  const activeProject = state.projects[0];

  const filtered = state.directors
    .filter((director) => {
      const budgetMatch = !filters.budget.value || director.budgetTier === filters.budget.value;
      const genreMatch =
        !filters.genre.value || director.genres.includes(filters.genre.value);
      const toneMatch = !filters.tone.value || director.tone.includes(filters.tone.value);
      const trackMatch = !filters.track.value || director.trackRecord === filters.track.value;
      const leverageMatch =
        !filters.leverage.value || director.packagingLeverage === filters.leverage.value;
      const presalesMatch =
        !filters.presales.value || director.presalesReadiness === filters.presales.value;
      const scaleMatch = !filters.scale.value || director.scale === filters.scale.value;
      const searchMatch =
        !searchValue ||
        director.name.toLowerCase().includes(searchValue) ||
        director.knownFor.some((title) => title.toLowerCase().includes(searchValue)) ||
        director.awards.toLowerCase().includes(searchValue);

      return (
        budgetMatch &&
        genreMatch &&
        toneMatch &&
        trackMatch &&
        leverageMatch &&
        presalesMatch &&
        scaleMatch &&
        searchMatch
      );
    })
    .map((director) => ({
      ...director,
      matchScore: computeMatchScore(director, activeProject),
    }));

  const sorted = [...filtered].sort((a, b) => {
    if (sortSelect.value === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortSelect.value === "leverage") {
      return b.packagingLeverage.localeCompare(a.packagingLeverage);
    }
    return b.matchScore - a.matchScore;
  });

  matchCount.textContent = sorted.length.toString();

  if (sorted.length === 0) {
    const empty = document.createElement("div");
    empty.className = "director-card";
    empty.innerHTML =
      "<h4>No matches</h4><p class=\"director-notes\">Try widening the bucket filters.</p>";
    listEl.appendChild(empty);
    return;
  }

  sorted.forEach((director) => {
    const card = document.createElement("div");
    card.className = "director-card";
    card.setAttribute("role", "listitem");

    const sourceLinks = director.sources
      .map((source) => `<a href=\"${source}\" target=\"_blank\" rel=\"noreferrer\">Source</a>`)
      .join(" ");

    card.innerHTML = `
      <div class="director-header">
        <h4>${director.name}</h4>
        ${activeProject ? `<span class="match-pill">Match ${director.matchScore}</span>` : ""}
      </div>
      <div class="filmography">Known for: ${director.knownFor.join(", ")}</div>
      <div class="tag-row">
        <span class="tag">${director.budgetTier}</span>
        <span class="tag">${director.scale}</span>
        <span class="tag">${director.trackRecord}</span>
        <span class="tag">Leverage ${director.packagingLeverage}</span>
        <span class="tag">Presales ${director.presalesReadiness}</span>
      </div>
      <div class="tag-row">
        ${director.genres.map((genre) => `<span class=\"tag\">${genre}</span>`).join(" ")}
        ${director.tone.map((tone) => `<span class=\"tag\">${tone}</span>`).join(" ")}
      </div>
      <p class="director-notes">${director.notes}</p>
      <div class="tag-row">
        <span class="tag">${director.awards}</span>
        <span class="tag">Intl: ${director.internationalAppeal}</span>
        <span class="tag">Availability: ${director.availability}</span>
      </div>
      <div class="source-links">${sourceLinks}</div>
    `;

    listEl.appendChild(card);
  });
};

const renderProjects = () => {
  projectList.innerHTML = "";
  if (state.projects.length === 0) {
    projectList.innerHTML =
      "<p class=\"director-notes\">No projects yet. Add one to anchor your search.</p>";
    return;
  }

  state.projects.forEach((project, index) => {
    const card = document.createElement("div");
    card.className = "project-card";
    const matchLabel = index === 0 ? "Active project" : "Saved";
    card.innerHTML = `
      <h3>${project.name}</h3>
      <div class="project-meta">
        <span>${project.genre || "Genre: TBD"}</span>
        <span>${project.budget || "Budget: TBD"}</span>
        <span>${project.tone || "Tone: TBD"}</span>
        <span>${project.priority || "Priority: TBD"}</span>
        <span>Presales ${project.presales || "TBD"}</span>
      </div>
      <div class="project-score">${matchLabel}</div>
    `;
    projectList.appendChild(card);
  });
};

Object.values(filters).forEach((filter) =>
  filter.addEventListener("change", renderDirectors)
);

searchInput.addEventListener("input", renderDirectors);
sortSelect.addEventListener("change", renderDirectors);

clearFiltersBtn.addEventListener("click", () => {
  Object.values(filters).forEach((filter) => {
    filter.value = "";
  });
  searchInput.value = "";
  sortSelect.value = "match";
  renderDirectors();
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(projectForm);
  const project = {
    name: data.get("name"),
    budget: data.get("budget"),
    genre: data.get("genre"),
    tone: data.get("tone"),
    priority: data.get("priority"),
    presales: data.get("presales"),
  };
  state.projects.unshift(project);
  projectForm.reset();
  renderProjects();
  renderDirectors();
});

clearProjectsBtn.addEventListener("click", () => {
  state.projects = [];
  renderProjects();
  renderDirectors();
});

const hydrateFilters = () => {
  populateSelect(filters.budget, buildOptions(state.directors.map((d) => d.budgetTier)));
  populateSelect(
    filters.genre,
    buildOptions(state.directors.flatMap((d) => d.genres))
  );
  populateSelect(filters.tone, buildOptions(state.directors.flatMap((d) => d.tone)));
  populateSelect(filters.track, buildOptions(state.directors.map((d) => d.trackRecord)));
  populateSelect(
    filters.leverage,
    buildOptions(state.directors.map((d) => d.packagingLeverage))
  );
  populateSelect(
    filters.presales,
    buildOptions(state.directors.map((d) => d.presalesReadiness))
  );
  populateSelect(filters.scale, buildOptions(state.directors.map((d) => d.scale)));
};

const loadDirectors = async () => {
  const response = await fetch("directors.json");
  state.directors = await response.json();
  hydrateFilters();
  dataStamp.textContent = `Director data: ${state.directors.length} entries loaded`;
  renderDirectors();
};

renderProjects();
loadDirectors();
