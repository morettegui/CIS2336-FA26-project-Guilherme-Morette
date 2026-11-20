const SITE_MENU = [
  { label: "Home", href: "index.html" },
  { label: "About", href: "about.html" },
  { label: "Services", href: "services.html" },
  { label: "Blog", href: "blog.html" },
  { label: "FAQ", href: "faq.html" },
  { label: "Contact", href: "contact.html" },
  { label: "References", href: "references.html" },
  { label: "Book a room", href: "booking.html", isCallToAction: true }
];

const PAGE_PARENTS = {
  "post.html": "blog.html"
};

function getCurrentPage() {
  let fileName = window.location.pathname.split("/").pop();

  if (fileName === "") {
    fileName = "index.html";
  }

  return PAGE_PARENTS[fileName] || fileName;
}

function createMenuLink(item, currentPage) {
  const listItem = document.createElement("li");
  const link = document.createElement("a");

  link.href = item.href;
  link.textContent = item.label;

  if (item.href === currentPage) {
    link.setAttribute("aria-current", "page");
  }

  listItem.appendChild(link);
  return listItem;
}

function buildHeader() {
  const header = document.getElementById("site-header");
  if (!header) {
    return;
  }

  const currentPage = getCurrentPage();

  const inner = document.createElement("div");
  inner.className = "container header-inner";

  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = "index.html";
  brand.innerHTML =
    '<img class="brand-mark" src="https://upload.wikimedia.org/wikipedia/commons/2/2a/University_of_Houston_Logo.svg" alt="University of Houston" width="690" height="581">' +
    '<span class="brand-text">Student Center<small>UH Sugar Land campus</small></span>';

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "menu-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "site-nav-list");
  toggle.innerHTML = '<span class="menu-icon" aria-hidden="true"></span> Menu';

  const nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.setAttribute("aria-label", "Main");

  const list = document.createElement("ul");
  list.className = "nav-list";
  list.id = "site-nav-list";

  SITE_MENU.forEach(function (item) {
    const listItem = createMenuLink(item, currentPage);
    if (item.isCallToAction) {
      listItem.firstChild.classList.add("nav-cta");
    }
    list.appendChild(listItem);
  });

  nav.appendChild(list);
  inner.appendChild(brand);
  inner.appendChild(toggle);
  inner.appendChild(nav);
  header.appendChild(inner);

  toggle.addEventListener("click", function () {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(header, toggle, !isOpen);
  });

  header.addEventListener("keydown", function (event) {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && isOpen) {
      setMenuOpen(header, toggle, false);
      toggle.focus();
    }
  });
}

function setMenuOpen(header, toggle, shouldOpen) {
  toggle.setAttribute("aria-expanded", String(shouldOpen));
  header.classList.toggle("menu-open", shouldOpen);
}

function buildFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) {
    return;
  }

  const currentPage = getCurrentPage();
  const year = new Date().getFullYear();

  const inner = document.createElement("div");
  inner.className = "container";

  const grid = document.createElement("div");
  grid.className = "footer-grid";

  const about = document.createElement("div");
  about.innerHTML =
    '<p class="footer-title">UH Sugar Land Student Center</p>' +
    "<p>14000 University Blvd, Sugar Land, TX 77479</p>";

  const footerNav = document.createElement("nav");
  footerNav.setAttribute("aria-label", "Footer");

  const list = document.createElement("ul");
  list.className = "footer-links";
  SITE_MENU.forEach(function (item) {
    list.appendChild(createMenuLink(item, currentPage));
  });
  footerNav.appendChild(list);

  grid.appendChild(about);
  grid.appendChild(footerNav);

  const note = document.createElement("p");
  note.className = "footer-note";
  note.textContent =
    "© " + year + " Guilherme Morette. This is a student class project, " +
    "not an official University of Houston website.";

  inner.appendChild(grid);
  inner.appendChild(note);
  footer.appendChild(inner);
}

buildHeader();
buildFooter();
