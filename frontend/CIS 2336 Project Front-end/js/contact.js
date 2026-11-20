const contactForm = document.getElementById("contact-form");

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 1000;

const contactFields = {
  name: document.getElementById("contact-name"),
  email: document.getElementById("contact-email"),
  topic: document.getElementById("contact-topic"),
  message: document.getElementById("contact-message")
};

function validateContactName() {
  const value = contactFields.name.value.trim();
  if (value === "") {
    return "Enter your name.";
  }
  if (!/^[\p{L}' .-]+$/u.test(value)) {
    return "Use letters, spaces, hyphens, or apostrophes only in your name.";
  }
  return "";
}

function validateContactEmail() {
  const value = contactFields.email.value.trim();
  if (value === "") {
    return "Enter your email address so we can reply.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    return "Enter an email address like name@example.com.";
  }
  return "";
}

function validateContactTopic() {
  if (contactFields.topic.value === "") {
    return "Choose what your message is about.";
  }
  return "";
}

function validateContactMessage() {
  const length = contactFields.message.value.trim().length;
  if (length === 0) {
    return "Write your message.";
  }
  if (length < MESSAGE_MIN) {
    return "Add a little more detail (at least " + MESSAGE_MIN + " characters).";
  }
  if (length > MESSAGE_MAX) {
    return "Keep your message under " + MESSAGE_MAX + " characters.";
  }
  return "";
}

const CONTACT_VALIDATORS = [
  { field: contactFields.name, validate: validateContactName },
  { field: contactFields.email, validate: validateContactEmail },
  { field: contactFields.topic, validate: validateContactTopic },
  { field: contactFields.message, validate: validateContactMessage }
];

function showContactError(field, message) {
  const errorElement = document.getElementById(field.id + "-error");
  errorElement.textContent = "";

  if (message) {
    const prefix = document.createElement("span");
    prefix.className = "visually-hidden";
    prefix.textContent = "Error: ";
    errorElement.appendChild(prefix);
    errorElement.appendChild(document.createTextNode(message));
    errorElement.hidden = false;
    field.setAttribute("aria-invalid", "true");
  } else {
    errorElement.hidden = true;
    field.removeAttribute("aria-invalid");
  }
}

function checkContactField(rule) {
  const message = rule.validate();
  showContactError(rule.field, message);
  return message;
}

function updateMessageCount() {
  const count = contactFields.message.value.trim().length;
  document.getElementById("message-count").textContent = count + " of " + MESSAGE_MAX + " characters";
}

function setUpContactForm() {
  if (!contactForm) {
    return;
  }

  const topicFromLink = new URLSearchParams(window.location.search).get("topic");
  if (topicFromLink && contactFields.topic.querySelector('option[value="' + topicFromLink + '"]')) {
    contactFields.topic.value = topicFromLink;
  }

  updateMessageCount();

  CONTACT_VALIDATORS.forEach(function (rule) {
    rule.field.addEventListener("blur", function () {
      if (rule.field.value !== "" || rule.field.hasAttribute("aria-invalid")) {
        checkContactField(rule);
      }
    });
    rule.field.addEventListener("input", function () {
      if (rule.field.hasAttribute("aria-invalid")) {
        checkContactField(rule);
      }
    });
  });

  contactFields.message.addEventListener("input", updateMessageCount);

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const thanks = document.getElementById("contact-thanks");
    thanks.hidden = true;

    const errors = [];
    CONTACT_VALIDATORS.forEach(function (rule) {
      const message = checkContactField(rule);
      if (message) {
        errors.push({ field: rule.field, message: message });
      }
    });

    if (errors.length > 0) {
      errors[0].field.focus();
      return;
    }

    document.getElementById("thanks-name").textContent = contactFields.name.value.trim();
    document.getElementById("thanks-email").textContent = contactFields.email.value.trim();

    contactForm.reset();
    updateMessageCount();
    thanks.hidden = false;
    thanks.focus();
  });
}

setUpContactForm();
