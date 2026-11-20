const IMAGE_BASE = "https://images.unsplash.com/photo-";

const BLOG_POSTS = [
  {
    id: "welcome-to-the-student-center",
    title: "Welcome to the new Student Center",
    date: "2026-11-02",
    author: "Student Center team",
    image: IMAGE_BASE + "1497366216548-37526070297c?w=1200&q=70&auto=format&fit=crop",
    imageAlt: "Bright, empty hallway with glass-walled rooms and a small seating area",
    summary: "Five bookable rooms, a café, and plenty of places to sit. Here's a quick tour of what's new on campus.",
    body: [
      { type: "p", text: "The Student Center is open! We built it for the moments between classes: when you need a quiet table, a room for your group project, or just a good cup of coffee before your next lecture." },
      { type: "h2", text: "What's inside" },
      { type: "list", items: [
        "Two small study rooms for 4 to 6 people",
        "A group meeting room with a projector and video call setup",
        "A media room for podcasts, presentations, and interviews",
        "A multipurpose room for club meetings and events",
        "An open lounge and café with free Wi-Fi"
      ] },
      { type: "h2", text: "Come say hi" },
      { type: "p", text: "Our front desk team is here whenever we're open. Stop by, ask questions, and tell us what you'd like to see next. This space is yours." }
    ]
  },
  {
    id: "how-to-book-a-room",
    title: "How to book a study room in under a minute",
    date: "2026-11-09",
    author: "Student Center team",
    image: IMAGE_BASE + "1501504905252-473c47e087f8?w=1200&q=70&auto=format&fit=crop",
    imageAlt: "Open laptop, notebook, pen, and coffee mug on a wooden table",
    summary: "No more waiting in line at the front desk. Pick a room, choose a time, and you're done.",
    body: [
      { type: "p", text: "You can now reserve any of our five rooms online. Here's how." },
      { type: "list", items: [
        "Go to the Book a room page.",
        "Pick a room. You'll see how many people it fits and what's inside.",
        "Choose a date and a start and end time. We'll tell you right away if it's free.",
        "Add your name, UH email, and UH ID, then press Book this room."
      ] },
      { type: "p", text: "You'll get a confirmation code on screen. Show it at the front desk when you arrive." },
      { type: "h2", text: "A few quick rules" },
      { type: "p", text: "You can book up to 3 hours at a time and up to 30 days ahead. If you don't check in within 15 minutes, the room goes back to the pool so someone else can use it." }
    ]
  },
  {
    id: "finals-week-study-tips",
    title: "Finals week: five ways to study smarter here",
    date: "2026-11-16",
    author: "Peer tutoring team",
    image: IMAGE_BASE + "1456513080510-7bf3a84b82f8?w=1200&q=70&auto=format&fit=crop",
    imageAlt: "Open textbooks stacked on a table in front of a bookshelf",
    summary: "Finals are coming. Here's how to use the Student Center to get through them with less stress.",
    body: [
      { type: "p", text: "Finals don't have to mean all-nighters. A few small changes can make your study time count." },
      { type: "list", items: [
        "Book a room early. Rooms fill up fast in December, so reserve yours a week ahead.",
        "Study in 50-minute blocks, then take a 10-minute break in the lounge.",
        "Teach it to a friend. Explaining a topic out loud shows you what you still need to review.",
        "Use the whiteboard. Drawing a concept map helps you see how ideas connect.",
        "Eat something real. The café serves breakfast tacos until 11 AM."
      ] },
      { type: "p", text: "We'll also stay open late during finals week. Check the hours on the homepage for any changes." }
    ]
  },
  {
    id: "whats-brewing-at-the-cafe",
    title: "What's brewing at the café this fall",
    date: "2026-11-12",
    author: "Café team",
    image: IMAGE_BASE + "1495474472287-4d71bcdd2085?w=1200&q=70&auto=format&fit=crop",
    imageAlt: "Friends raising two lattes and an iced coffee over a café table",
    summary: "Pumpkin spice is back, plus a new student meal deal that won't wreck your budget.",
    body: [
      { type: "p", text: "Our café has a few new things on the menu this season." },
      { type: "list", items: [
        "Pumpkin spice latte (yes, it's back)",
        "Honey cinnamon cold brew",
        "Breakfast tacos: egg and cheese, or potato and bean",
        "Student meal deal: any sandwich, chips, and a drink for $7"
      ] },
      { type: "p", text: "Bring your own cup and get 25 cents off any drink. Good for your wallet and the planet." }
    ]
  }
];

function formatPostDate(dateString) {
  const parts = dateString.split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function createElementWithText(tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  return element;
}

function getPostsNewestFirst() {
  return BLOG_POSTS.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
}

function renderBlogList() {
  const list = document.getElementById("blog-list");
  if (!list) {
    return;
  }

  getPostsNewestFirst().forEach(function (post) {
    const item = document.createElement("li");
    item.className = "card";

    const image = document.createElement("img");
    image.src = post.image;
    image.alt = "";
    image.width = 600;
    image.height = 400;
    image.loading = "lazy";

    const body = document.createElement("div");
    body.className = "card-body";

    const meta = document.createElement("p");
    meta.className = "card-meta";
    meta.innerHTML = '<time datetime="' + post.date + '"></time> · ';
    meta.querySelector("time").textContent = formatPostDate(post.date);
    meta.appendChild(document.createTextNode(post.author));

    const title = document.createElement("h2");
    title.className = "h3-size";
    const link = createElementWithText("a", post.title);
    link.href = "post.html?id=" + encodeURIComponent(post.id);
    title.appendChild(link);

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(createElementWithText("p", post.summary));

    item.appendChild(image);
    item.appendChild(body);
    list.appendChild(item);
  });
}

function renderPost() {
  const container = document.getElementById("post");
  if (!container) {
    return;
  }

  const postId = new URLSearchParams(window.location.search).get("id");
  const post = BLOG_POSTS.find(function (candidate) {
    return candidate.id === postId;
  });

  const heading = document.getElementById("post-title");
  const meta = document.getElementById("post-meta");

  if (!post) {
    heading.textContent = "We couldn't find that post";
    meta.textContent = "It may have moved, or the link may be missing part of the address.";
    container.appendChild(createElementWithText("p", "Head back to the blog to see all posts."));
    return;
  }

  document.title = post.title + " | UH Sugar Land Student Center";
  heading.textContent = post.title;
  meta.innerHTML = '<time datetime="' + post.date + '"></time> · ';
  meta.querySelector("time").textContent = formatPostDate(post.date);
  meta.appendChild(document.createTextNode(post.author));

  const image = document.createElement("img");
  image.src = post.image;
  image.alt = post.imageAlt;
  image.width = 1200;
  image.height = 675;
  container.appendChild(image);

  post.body.forEach(function (block) {
    if (block.type === "list") {
      const list = document.createElement("ul");
      block.items.forEach(function (text) {
        list.appendChild(createElementWithText("li", text));
      });
      container.appendChild(list);
    } else {
      container.appendChild(createElementWithText(block.type, block.text));
    }
  });
}

renderBlogList();
renderPost();
