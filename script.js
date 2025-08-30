// =========================
// script.js (complete file)
// =========================

// ---------- Helper: safe query ----------
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

/* ========== PAGE NAVIGATION ========== */
function showPage(pageId) {
  // hide all content sections
  $$('.page-section').forEach(sec => sec.style.display = 'none');

  // show target section if exists
  const target = document.getElementById(pageId);
  if (!target) {
    console.warn("showPage: missing element with id:", pageId);
    return;
  }
  target.style.display = 'block';

  // remove active class from all nav links
  $$('.panel-option a').forEach(link => link.classList.remove('active'));

  // find the nav link that corresponds to this pageId and mark it active
  const anchors = $$('.panel-option a');
  const normalizedPage = pageId.toString().toLowerCase().replace(/\s+/g, '');

  let found = anchors.find(a => {
    const onclick = a.getAttribute('onclick') || '';
    if (onclick.includes("'" + pageId + "'") || onclick.includes('"' + pageId + '"')) return true;

    if (a.dataset && a.dataset.page && a.dataset.page === pageId) return true;

    // fallback: compare text (remove spaces)
    const txt = (a.textContent || '').trim().toLowerCase().replace(/\s+/g, '');
    if (txt === normalizedPage) return true;

    return false;
  });

  if (found) found.classList.add('active');
}

// show home by default
window.addEventListener('DOMContentLoaded', () => {
  showPage('home');
});


/* 
  Prevent anchor default jump (href="#") and make nav links call showPage reliably.
  This also keeps markup unchanged (we don't edit HTML file here).
*/
$$('.panel-option a').forEach(a => {
  a.addEventListener('click', (ev) => {
    ev.preventDefault(); // stop the '#' jump

    // try to extract page id from the inline onclick attribute: showPage('aboutus')
    const onclick = a.getAttribute('onclick') || '';
    let pageId = null;
    const m = onclick.match(/showPage\(['"]([^'"]+)['"]\)/);
    if (m) pageId = m[1];

    // fallback: use anchor text -> "About Us" -> "aboutus"
    if (!pageId) {
      pageId = (a.textContent || '').trim().toLowerCase().replace(/\s+/g, '');
    }

    if (pageId) showPage(pageId);
  });
});


/* ========== SEARCH SYSTEM ========== */

// Make sure the search input id matches your HTML: id="input"
const searchInput = document.getElementById('input');
if (!searchInput) {
  console.warn('Search input with id="input" not found in DOM.');
}

// Ensure a single #searchResults element exists (use existing or create)
let searchResultsBox = document.getElementById('searchResults');
if (!searchResultsBox) {
  searchResultsBox = document.createElement('div');
  searchResultsBox.id = 'searchResults';
  // Keep it appended to body so it can be absolutely positioned.
  document.body.appendChild(searchResultsBox);
}

// Data for searching: title + keywords + the page id (link)
const searchData = [
  {title: "Home", keywords: ["home", "landing"], link: "home"},
  {title: "About Us", keywords: ["about", "vision", "mission", "recognition"], link: "aboutus"},
  {title: "PCP Sikar (Institutions)", keywords: ["pcp", "career pioneer", "pcp sikar"], link: "institutions"},
  {title: "Prince Academy (Institutions)", keywords: ["academy", "prince academy", "school", "cbse"], link: "institutions"},
  {title: "Prince Defence Academy (Institutions)", keywords: ["defence", "nda", "airforce", "navy"], link: "institutions"},
  {title: "Prince College (Institutions)", keywords: ["college", "bsc", "ba", "bcom", "mca"], link: "institutions"},
  {title: "NEET Course", keywords: ["neet", "medical"], link: "courses"},
  {title: "IIT JEE Course", keywords: ["jee", "iit", "engineering"], link: "courses"},
  {title: "NDA Course", keywords: ["nda", "defence course"], link: "courses"},
  {title: "Results", keywords: ["results", "toppers", "ranks", "selections"], link: "results"},
  {title: "Facilities", keywords: ["hostel", "library", "sports", "canteen", "medical"], link: "facilities"},
  {title: "Contact Us", keywords: ["contact", "email", "phone", "address", "admission"], link: "contactus"}
];

function findMatches(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return searchData.filter(item => {
    if (item.title.toLowerCase().includes(q)) return true;
    return item.keywords.some(k => k.toLowerCase().includes(q));
  });
}

function renderSearchResults(results) {
  if (!results || results.length === 0) {
    searchResultsBox.innerHTML = `<div class="sr-no">No results found</div>`;
    return;
  }
  // create clickable rows, data-link stores page id
  searchResultsBox.innerHTML = results.map(r => {
    // escape HTML in title
    const safeTitle = r.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div class="sr-row" data-link="${r.link}">${safeTitle}</div>`;
  }).join('');
}

function positionDropdownUnderInput() {
  // position the dropdown under the search input (works for centered nav)
  if (!searchInput) return;
  const rect = searchInput.getBoundingClientRect();
  searchResultsBox.style.position = 'absolute';
  searchResultsBox.style.left = (rect.left + window.scrollX) + 'px';
  searchResultsBox.style.top = (rect.bottom + window.scrollY + 6) + 'px'; // small gap
  searchResultsBox.style.width = rect.width + 'px';
  // visual styles (some may already be in CSS)
  searchResultsBox.style.background = 'white';
  searchResultsBox.style.border = '1px solid rgba(0,0,0,0.08)';
  searchResultsBox.style.borderRadius = '8px';
  searchResultsBox.style.boxShadow = '0 6px 20px rgba(12,24,40,0.12)';
  searchResultsBox.style.zIndex = 9999;
  searchResultsBox.style.maxHeight = '260px';
  searchResultsBox.style.overflowY = 'auto';
}

/* Live suggestions while typing */
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value;
    if (!q || q.trim().length === 0) {
      searchResultsBox.style.display = 'none';
      return;
    }

    const matches = findMatches(q);
    renderSearchResults(matches);
    positionDropdownUnderInput();
    searchResultsBox.style.display = 'block';
  });

  // press Enter -> go to first result (if exists)
  searchInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const first = searchResultsBox.querySelector('.sr-row[data-link]');
      if (first) {
        const pageId = first.dataset.link;
        showPage(pageId);
      }
      searchResultsBox.style.display = 'none';
      searchInput.value = '';
    }
    // optional: handle ArrowDown / ArrowUp to move through suggestions (not implemented)
  });
}

// click a result row to go there
searchResultsBox.addEventListener('click', (ev) => {
  const row = ev.target.closest('.sr-row');
  if (!row) return;
  const pageId = row.dataset.link;
  if (pageId) {
    showPage(pageId);
    searchResultsBox.style.display = 'none';
    if (searchInput) searchInput.value = '';
  }
});

// hide dropdown when clicking outside
document.addEventListener('click', (ev) => {
  if (!searchResultsBox.contains(ev.target) && ev.target !== searchInput) {
    searchResultsBox.style.display = 'none';
  }
});

// reposition dropdown on resize/scroll (keeps it under input)
window.addEventListener('resize', () => {
  if (searchResultsBox.style.display === 'block') positionDropdownUnderInput();
});
window.addEventListener('scroll', () => {
  if (searchResultsBox.style.display === 'block') positionDropdownUnderInput();
});
