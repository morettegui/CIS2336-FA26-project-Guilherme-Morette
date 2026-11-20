const bookingForm = document.getElementById("booking-form");

const fields = {
  fullName: document.getElementById("full-name"),
  email: document.getElementById("email"),
  studentId: document.getElementById("student-id"),
  room: document.getElementById("room"),
  guests: document.getElementById("guests"),
  date: document.getElementById("date"),
  startTime: document.getElementById("start-time"),
  endTime: document.getElementById("end-time"),
  purpose: document.getElementById("purpose"),
  agree: document.getElementById("agree")
};

const PURPOSE_MIN = 10;
const PURPOSE_MAX = 300;

function validateFullName() {
  const value = fields.fullName.value.trim();
  if (value === "") {
    return "Enter your full name.";
  }
  if (!/^[\p{L}' .-]+$/u.test(value)) {
    return "Use letters, spaces, hyphens, or apostrophes only in your name.";
  }
  if (value.split(" ").filter(Boolean).length < 2) {
    return "Enter your first and last name.";
  }
  return "";
}

function validateEmail() {
  const value = fields.email.value.trim();
  if (value === "") {
    return "Enter your UH email address.";
  }
  if (!/^[^\s@]+@(uh\.edu|cougarnet\.uh\.edu)$/i.test(value)) {
    return "Use your UH email, ending in @uh.edu or @cougarnet.uh.edu.";
  }
  return "";
}

function validateStudentId() {
  const value = fields.studentId.value.trim();
  if (value === "") {
    return "Enter your UH ID number.";
  }
  if (!/^\d{7}$/.test(value)) {
    return "Your UH ID is exactly 7 digits, with no letters or spaces.";
  }
  return "";
}

function validateRoom() {
  if (!findRoom(fields.room.value)) {
    return "Choose a room.";
  }
  return "";
}

function validateGuests() {
  const value = fields.guests.value.trim();
  if (value === "") {
    return "Enter how many people are coming, including you.";
  }

  const guests = Number(value);
  if (!Number.isInteger(guests) || guests < 1) {
    return "Enter a whole number of people, 1 or more.";
  }

  const room = findRoom(fields.room.value);
  if (room && guests > room.capacity) {
    return room.name + " fits up to " + room.capacity + " people. Choose a bigger room or a smaller group.";
  }
  return "";
}

function validateDate() {
  const value = fields.date.value;
  if (value === "") {
    return "Choose a date.";
  }
  if (value < dateFromToday(0)) {
    return "Choose today or a future date.";
  }
  if (value > dateFromToday(BOOKING_RULES.maxDaysAhead)) {
    return "You can book up to " + BOOKING_RULES.maxDaysAhead + " days ahead.";
  }
  if (getHoursForDate(value).open === null) {
    return "We're closed on " + getHoursForDate(value).day + "s. Choose another day.";
  }
  return "";
}

function validateStartTime() {
  if (fields.startTime.value === "") {
    return "Choose a start time.";
  }
  return "";
}

function validateEndTime() {
  if (fields.endTime.value === "") {
    return "Choose an end time.";
  }
  if (fields.startTime.value === "") {
    return "";
  }

  const length = timeToMinutes(fields.endTime.value) - timeToMinutes(fields.startTime.value);
  if (length <= 0) {
    return "End time must be after the start time.";
  }
  if (length > BOOKING_RULES.maxMinutes) {
    return "You can book up to " + BOOKING_RULES.maxMinutes / 60 + " hours at a time.";
  }
  return "";
}

function validatePurpose() {
  const length = fields.purpose.value.trim().length;
  if (length === 0) {
    return "Tell us briefly what you'll use the room for.";
  }
  if (length < PURPOSE_MIN) {
    return "Add a little more detail (at least " + PURPOSE_MIN + " characters).";
  }
  if (length > PURPOSE_MAX) {
    return "Keep it under " + PURPOSE_MAX + " characters.";
  }
  return "";
}

function validateAgree() {
  if (!fields.agree.checked) {
    return "Check the box to agree to the room rules.";
  }
  return "";
}

const VALIDATORS = [
  { field: fields.fullName, validate: validateFullName },
  { field: fields.email, validate: validateEmail },
  { field: fields.studentId, validate: validateStudentId },
  { field: fields.room, validate: validateRoom },
  { field: fields.guests, validate: validateGuests },
  { field: fields.date, validate: validateDate },
  { field: fields.startTime, validate: validateStartTime },
  { field: fields.endTime, validate: validateEndTime },
  { field: fields.purpose, validate: validatePurpose },
  { field: fields.agree, validate: validateAgree }
];

function showFieldError(field, message) {
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

function validateField(rule) {
  const message = rule.validate();
  showFieldError(rule.field, message);
  return message;
}

function validateAllFields() {
  const errors = [];
  VALIDATORS.forEach(function (rule) {
    const message = validateField(rule);
    if (message) {
      errors.push({ field: rule.field, message: message });
    }
  });
  return errors;
}

function fillRoomOptions() {
  ROOMS.forEach(function (room) {
    const option = document.createElement("option");
    option.value = room.id;
    option.textContent = room.name + " (up to " + room.capacity + " people)";
    fields.room.appendChild(option);
  });
}

function fillTimeOptions() {
  let earliest = 24 * 60;
  let latest = 0;
  OPENING_HOURS.forEach(function (hours) {
    if (hours.open) {
      earliest = Math.min(earliest, timeToMinutes(hours.open));
      latest = Math.max(latest, timeToMinutes(hours.close));
    }
  });

  for (let minutes = earliest; minutes <= latest; minutes += BOOKING_RULES.slotMinutes) {
    const time = minutesToTime(minutes);
    if (minutes < latest) {
      fields.startTime.appendChild(createTimeOption(time));
    }
    if (minutes > earliest) {
      fields.endTime.appendChild(createTimeOption(time));
    }
  }
}

function createTimeOption(time) {
  const option = document.createElement("option");
  option.value = time;
  option.textContent = formatTime(time);
  return option;
}

function showRoomDetails() {
  const panel = document.getElementById("room-details");
  const room = findRoom(fields.room.value);
  panel.innerHTML = "";

  if (!room) {
    const prompt = document.createElement("p");
    prompt.textContent = "Choose a room to see its size and equipment.";
    panel.appendChild(prompt);
    fields.guests.removeAttribute("max");
    return;
  }

  const title = document.createElement("h3");
  title.textContent = room.name;

  const summary = document.createElement("p");
  summary.className = "card-meta";
  summary.textContent = room.type + " · up to " + room.capacity + " people";

  const list = document.createElement("ul");
  room.features.forEach(function (feature) {
    const item = document.createElement("li");
    item.textContent = feature;
    list.appendChild(item);
  });

  panel.appendChild(title);
  panel.appendChild(summary);
  panel.appendChild(list);

  fields.guests.max = room.capacity;
}

let latestCheckNumber = 0;

function setAvailabilityMessage(state, title, message) {
  const box = document.getElementById("availability-status");
  box.className = "availability";
  box.innerHTML = "";

  if (!state) {
    return;
  }

  box.classList.add("is-" + state);
  const heading = document.createElement("strong");
  heading.textContent = title;
  box.appendChild(heading);
  box.appendChild(document.createTextNode(message));
}

function updateAvailability() {
  const roomId = fields.room.value;
  const date = fields.date.value;
  const start = fields.startTime.value;
  const end = fields.endTime.value;

  if (!roomId || !date || !start || !end) {
    setAvailabilityMessage("", "", "");
    return;
  }

  latestCheckNumber = latestCheckNumber + 1;
  const thisCheck = latestCheckNumber;
  setAvailabilityMessage("checking", "Checking…", "Looking up this room and time.");

  checkAvailability(roomId, date, start, end).then(function (result) {
    if (thisCheck !== latestCheckNumber) {
      return;
    }
    if (result.available) {
      setAvailabilityMessage("available", "Available", result.message);
    } else {
      setAvailabilityMessage("unavailable", "Not available", result.message);
    }
  });
}

function showConfirmation(booking, confirmationCode) {
  const panel = document.getElementById("booking-confirmation");
  const room = findRoom(booking.roomId);

  document.getElementById("confirm-code").textContent = confirmationCode;
  document.getElementById("confirm-room").textContent = room.name;
  document.getElementById("confirm-date").textContent = formatDate(booking.date);
  document.getElementById("confirm-time").textContent =
    formatTime(booking.start) + " – " + formatTime(booking.end);
  document.getElementById("confirm-guests").textContent = booking.guests;
  document.getElementById("confirm-name").textContent = booking.name;

  panel.hidden = false;
  panel.focus();
}

function resetBookingForm() {
  bookingForm.reset();
  VALIDATORS.forEach(function (rule) {
    showFieldError(rule.field, "");
  });
  updatePurposeCount();
  showRoomDetails();
  setAvailabilityMessage("", "", "");
}

function updatePurposeCount() {
  const count = fields.purpose.value.trim().length;
  document.getElementById("purpose-count").textContent = count + " of " + PURPOSE_MAX + " characters";
}

function setUpBookingForm() {
  if (!bookingForm) {
    return;
  }

  fillRoomOptions();
  fillTimeOptions();

  fields.date.min = dateFromToday(0);
  fields.date.max = dateFromToday(BOOKING_RULES.maxDaysAhead);

  const roomFromLink = new URLSearchParams(window.location.search).get("room");
  if (findRoom(roomFromLink)) {
    fields.room.value = roomFromLink;
  }
  showRoomDetails();
  updatePurposeCount();

  VALIDATORS.forEach(function (rule) {
    rule.field.addEventListener("blur", function () {
      const hasValue = rule.field.type === "checkbox" ? rule.field.checked : rule.field.value !== "";
      if (hasValue || rule.field.hasAttribute("aria-invalid")) {
        validateField(rule);
      }
    });

    rule.field.addEventListener("input", function () {
      if (rule.field.hasAttribute("aria-invalid")) {
        validateField(rule);
      }
    });
  });

  fields.room.addEventListener("change", function () {
    showRoomDetails();
    if (fields.guests.value !== "") {
      validateField({ field: fields.guests, validate: validateGuests });
    }
    updateAvailability();
  });

  fields.startTime.addEventListener("change", function () {
    if (fields.startTime.value && fields.endTime.value === "") {
      const suggestedEnd = minutesToTime(timeToMinutes(fields.startTime.value) + 60);
      if (fields.endTime.querySelector('option[value="' + suggestedEnd + '"]')) {
        fields.endTime.value = suggestedEnd;
      }
    }
    if (fields.endTime.value !== "") {
      validateField({ field: fields.endTime, validate: validateEndTime });
    }
    updateAvailability();
  });

  fields.date.addEventListener("change", updateAvailability);
  fields.endTime.addEventListener("change", updateAvailability);
  fields.purpose.addEventListener("input", updatePurposeCount);

  bookingForm.addEventListener("submit", handleBookingSubmit);
}

function handleBookingSubmit(event) {
  event.preventDefault();
  document.getElementById("booking-confirmation").hidden = true;

  const errors = validateAllFields();
  if (errors.length > 0) {
    errors[0].field.focus();
    return;
  }

  const booking = {
    name: fields.fullName.value.trim(),
    email: fields.email.value.trim(),
    studentId: fields.studentId.value.trim(),
    roomId: fields.room.value,
    guests: Number(fields.guests.value),
    date: fields.date.value,
    start: fields.startTime.value,
    end: fields.endTime.value,
    purpose: fields.purpose.value.trim()
  };

  const submitButton = document.getElementById("booking-submit");
  submitButton.disabled = true;
  submitButton.textContent = "Booking…";

  saveBooking(booking).then(function (result) {
    submitButton.disabled = false;
    submitButton.textContent = "Book this room";

    if (!result.ok) {
      setAvailabilityMessage("unavailable", "Not available", result.message);
      showFieldError(fields.startTime, result.message);
      fields.startTime.focus();
      return;
    }

    resetBookingForm();
    showConfirmation(booking, result.confirmation);
  });
}

setUpBookingForm();
