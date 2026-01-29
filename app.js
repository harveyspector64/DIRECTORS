const directors = [
  {
    name: "Mara Chen",
    focus: ["Action", "Comedy"],
    budget: "$30-60M",
    cast: "Ensemble",
    tone: "High energy",
    track: "Established",
    presales: "High",
    notes:
      "Action-comedy specialist with repeat studio partnerships; sharp ensemble timing.",
  },
  {
    name: "Luca Rivera",
    focus: ["Thriller", "Drama"],
    budget: "$10-30M",
    cast: "Breakout",
    tone: "Grounded",
    track: "Rising",
    presales: "Medium",
    notes:
      "Grounded thrillers, character-driven; strong with emerging talent packages.",
  },
  {
    name: "Priya Nassar",
    focus: ["Sci-Fi", "Action"],
    budget: "$60M+",
    cast: "Movie star",
    tone: "Stylized",
    track: "Veteran",
    presales: "High",
    notes:
      "Big-scale visuals and IP builds; reliable on premium FX budgets.",
  },
  {
    name: "Jonas Holt",
    focus: ["Comedy", "Family"],
    budget: "<$10M",
    cast: "Ensemble",
    tone: "Commercial",
    track: "Established",
    presales: "Medium",
    notes:
      "Family-friendly crowd-pleasers with efficient schedules and solid ROI.",
  },
  {
    name: "Selene Park",
    focus: ["Drama", "Thriller"],
    budget: "$30-60M",
    cast: "Movie star",
    tone: "Prestige",
    track: "Established",
    presales: "High",
    notes:
      "Awards-friendly prestige meets commercial tension; strong talent pull.",
  },
  {
    name: "Andre Kline",
    focus: ["Action", "Thriller"],
    budget: "$60M+",
    cast: "International",
    tone: "Commercial",
    track: "Veteran",
    presales: "High",
    notes:
      "International action footprint; pre-sales anchor in Europe/Asia.",
  },
  {
    name: "Isabella Cortez",
    focus: ["Comedy", "Drama"],
    budget: "$10-30M",
    cast: "Ensemble",
    tone: "Grounded",
    track: "Rising",
    presales: "Low",
    notes:
      "Character-led comedies, strong festival profile, lean production style.",
  },
  {
    name: "Ethan North",
    focus: ["Action", "Sci-Fi"],
    budget: "$30-60M",
    cast: "Movie star",
    tone: "Stylized",
    track: "Established",
    presales: "High",
    notes:
      "Known for kinetic world-building; top-tier vendors already engaged.",
  },
];

const filters = {
  budget: document.getElementById("filter-budget"),
  genre: document.getElementById("filter-genre"),
  cast: document.getElementById("filter-cast"),
  tone: document.getElementById("filter-tone"),
  track: document.getElementById("filter-track"),
  presales: document.getElementById("filter-presales"),
};

const listEl = document.getElementById("director-list");
const matchCount = document.getElementById("match-count");
const projectForm = document.getElementById("project-form");
const projectList = document.querySelector(".project-list");
const clearProjectsBtn = document.getElementById("clear-projects");

const state = {
  projects: [],
};

const renderDirectors = () => {
  listEl.innerHTML = "";
  const filtered = directors.filter((director) => {
    const budgetMatch = !filters.budget.value || director.budget === filters.budget.value;
    const genreMatch =
      !filters.genre.value || director.focus.includes(filters.genre.value);
    const castMatch = !filters.cast.value || director.cast === filters.cast.value;
    const toneMatch = !filters.tone.value || director.tone === filters.tone.value;
    const trackMatch = !filters.track.value || director.track === filters.track.value;
    const presalesMatch =
      !filters.presales.value || director.presales === filters.presales.value;
    return (
      budgetMatch && genreMatch && castMatch && toneMatch && trackMatch && presalesMatch
    );
  });

  matchCount.textContent = filtered.length.toString();

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "director-card";
    empty.innerHTML =
      "<h4>No matches</h4><p class=\"director-notes\">Try widening the bucket filters.</p>";
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((director) => {
    const card = document.createElement("div");
    card.className = "director-card";
    card.setAttribute("role", "listitem");

    card.innerHTML = `
      <h4>${director.name}</h4>
      <div class="tag-row">
        <span class="tag">${director.budget}</span>
        <span class="tag">${director.cast}</span>
        <span class="tag">${director.tone}</span>
        <span class="tag">${director.track}</span>
        <span class="tag">Presales ${director.presales}</span>
      </div>
      <div class="tag-row">
        ${director.focus.map((genre) => `<span class=\"tag\">${genre}</span>`).join(" ")}
      </div>
      <p class="director-notes">${director.notes}</p>
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

  state.projects.forEach((project) => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <h3>${project.name}</h3>
      <div class="project-meta">
        <span>${project.genre || "Genre: TBD"}</span>
        <span>${project.budget || "Budget: TBD"}</span>
        <span>${project.cast || "Cast: TBD"}</span>
        <span>${project.tone || "Tone: TBD"}</span>
        <span>Presales ${project.presales || "TBD"}</span>
      </div>
    `;
    projectList.appendChild(card);
  });
};

Object.values(filters).forEach((filter) =>
  filter.addEventListener("change", renderDirectors)
);

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(projectForm);
  const project = {
    name: data.get("name"),
    budget: data.get("budget"),
    genre: data.get("genre"),
    cast: data.get("cast"),
    tone: data.get("tone"),
    presales: data.get("presales"),
  };
  state.projects.unshift(project);
  projectForm.reset();
  renderProjects();
});

clearProjectsBtn.addEventListener("click", () => {
  state.projects = [];
  renderProjects();
});

renderProjects();
renderDirectors();
