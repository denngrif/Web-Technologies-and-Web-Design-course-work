/* =========================================================
   НАЛАШТУВАННЯ — міняй тут
   ========================================================= */
const CONFIG = {
  name: "Denys PASIIEVYCH",
  headline: "3D Artist",                // підпис під іменем
  email: "pasiyevych@gmail.com",
  heroImage: "2.png",       // обкладинка (файл з папки media)
  avatar: "av v4.png",                // аватарка (файл з папки media)
};

// Усі роботи. Додати нову: скопіюй рядок і вкажи файл із папки media.
// tag — категорія для фільтра, desc — необовʼязковий опис (покажеться на сторінці проєкту).
const RENDERS = [
  { file: "rendered room.png", title: "Isometric Workspace",        tag: "Isometric" },
  { file: "island.png",        title: "Beach House Island",         tag: "Isometric" },
  { file: "japhouse.png",      title: "Japanese House Island",      tag: "Isometric" },
  { file: "room 2 .png",       title: "Isometric Living Room",      tag: "Isometric" },
  { file: "2.png",             title: "Cherry Tree Corridor",       tag: "Architecture" },
  { file: "123457765432.png",  title: "Cherry Tree Corridor, Wide", tag: "Architecture" },
  { file: "x2.png",            title: "Snow Globe",                 tag: "Logos" },
  { file: "av v4.png",         title: "Neon D",                     tag: "Logos" },
  { file: "D logo.png",        title: "D Logo",                     tag: "Logos" },
  { file: "fnaf.png",          title: "FNAF Pizzeria",              tag: "Environments" },
  { file: "0002.png",          title: "Lone Figure",                tag: "Environments" },
  { file: "0001.png",          title: "Music Flat Lay",             tag: "Still Life" },
  { file: "5.png",             title: "Retro Console",              tag: "Still Life" },
  { file: "3.png",             title: "Red Cube",                   tag: "Still Life" },
  { file: "6.jpg",             title: "Prop on Asphalt",            tag: "Still Life" },
];

const ALL = "All";
const src = (file) => "media/" + encodeURI(file);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);

/* =========================================================
   Тексти з CONFIG
   ========================================================= */
document.querySelectorAll('[data-bind="name"]').forEach((el) => (el.textContent = CONFIG.name));
document.querySelectorAll("[data-mail]").forEach((a) => (a.href = "mailto:" + CONFIG.email));
$("mailText").textContent = CONFIG.email;
$("headline").textContent = CONFIG.headline;
$("pjHeadline").textContent = CONFIG.headline;
$("year").textContent = new Date().getFullYear();
$("projectCount").textContent = RENDERS.length;
$("avatar").src = src(CONFIG.avatar);
$("avatar").alt = CONFIG.name;
$("pjAvatar").src = src(CONFIG.avatar);

/* =========================================================
   COVER
   ========================================================= */
$("heroImg").src = src(CONFIG.heroImage);

/* =========================================================
   ВКЛАДКИ
   ========================================================= */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      $(t.getAttribute("aria-controls")).hidden = !on;
    });
  });
});

/* =========================================================
   ПОРТФОЛІО: фільтри, пошук, «денойз» при появі
   ========================================================= */
const grid = $("grid");
const filtersEl = $("filters");
const searchEl = $("search");
const emptyEl = $("empty");
let currentTag = ALL;
let query = "";
let visible = RENDERS.slice();

const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 })
  : null;

function buildFilters() {
  const tags = [ALL, ...new Set(RENDERS.map((r) => r.tag))];
  filtersEl.innerHTML = "";
  tags.forEach((tag) => {
    const count = tag === ALL ? RENDERS.length : RENDERS.filter((r) => r.tag === tag).length;
    const b = document.createElement("button");
    b.className = "filter";
    b.type = "button";
    b.dataset.tag = tag;
    b.setAttribute("aria-pressed", String(tag === currentTag));
    b.innerHTML = `${esc(tag)}<small>${count}</small>`;
    b.addEventListener("click", () => setFilter(tag));
    filtersEl.appendChild(b);
  });
}

function renderGrid() {
  const q = query.trim().toLowerCase();
  visible = RENDERS.filter((r) =>
    (currentTag === ALL || r.tag === currentTag) &&
    (!q || r.title.toLowerCase().includes(q) || r.tag.toLowerCase().includes(q))
  );
  grid.innerHTML = "";
  emptyEl.hidden = visible.length > 0;

  visible.forEach((item, i) => {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.setAttribute("aria-label", "Open project: " + item.title);
    card.innerHTML = `
      <img loading="lazy" alt="${esc(item.title)}" src="${src(item.file)}">
      <span class="card-over">
        <span class="card-title">${esc(item.title)}</span>
        <span class="card-sub"><span>${esc(item.tag)}</span><span class="card-res"></span></span>
      </span>`;

    const im = card.querySelector("img");
    const res = card.querySelector(".card-res");
    const showSize = () => { res.textContent = `${im.naturalWidth}×${im.naturalHeight}`; };
    if (im.complete && im.naturalWidth) showSize(); else im.addEventListener("load", showSize);
    im.addEventListener("error", () => { card.hidden = true; });

    card.addEventListener("click", () => openProject(i));
    grid.appendChild(card);

    if (io && !reduceMotion) io.observe(card); else card.classList.add("in");
  });
}

function refresh() {
  grid.classList.add("out");
  setTimeout(() => { renderGrid(); grid.classList.remove("out"); }, reduceMotion ? 0 : 200);
}

function setFilter(tag) {
  if (tag === currentTag) return;
  currentTag = tag;
  filtersEl.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tag === tag)));
  refresh();
}

let searchTimer;
searchEl.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    query = searchEl.value;
    // пошук працює в портфоліо — перемикаємось на цю вкладку
    if ($("tab-portfolio").hidden) $("t-portfolio").click();
    refresh();
  }, 180);
});

buildFilters();
renderGrid();

/* =========================================================
   СТОРІНКА ПРОЄКТУ (як на ArtStation)
   ========================================================= */
const pj = $("project");
const pjImg = $("pjImg");
let pjIndex = 0;
let lastFocus = null;

function showProject() {
  const item = visible[pjIndex];
  pjImg.classList.add("loading");
  pjImg.onload = () => {
    $("pjRes").textContent = `${pjImg.naturalWidth}×${pjImg.naturalHeight}`;
    requestAnimationFrame(() => pjImg.classList.remove("loading"));
  };
  pjImg.src = src(item.file);
  pjImg.alt = item.title;
  $("pjTitle").textContent = item.title;
  $("pjTag").textContent = item.tag;
  $("pjCount").textContent = `${pjIndex + 1} / ${visible.length}`;
  const d = $("pjDesc");
  d.hidden = !item.desc;
  d.textContent = item.desc || "";
  pj.scrollTop = 0;
}

function openProject(i) {
  lastFocus = document.activeElement;
  pjIndex = i;
  pj.hidden = false;
  document.body.style.overflow = "hidden";
  showProject();
  $("pjClose").focus();
}

function closeProject() {
  pj.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

function step(dir) {
  pjIndex = (pjIndex + dir + visible.length) % visible.length;
  showProject();
}

$("pjClose").addEventListener("click", closeProject);
$("pjPrev").addEventListener("click", () => step(-1));
$("pjNext").addEventListener("click", () => step(1));

document.addEventListener("keydown", (e) => {
  if (pj.hidden) return;
  if (e.key === "Escape") closeProject();
  else if (e.key === "ArrowLeft") step(-1);
  else if (e.key === "ArrowRight") step(1);
});
