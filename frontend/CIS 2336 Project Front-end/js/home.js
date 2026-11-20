const BOARD_REFRESH_MS = 60 * 1000;

function createRoomCard(room) {
  const card = document.createElement("li");
  card.className = "room-status";
  card.id = "room-now-" + room.id;

  const title = document.createElement("h3");
  title.textContent = room.name;

  const capacity = document.createElement("span");
  capacity.className = "room-capacity";
  capacity.textContent = "Up to " + room.capacity + " people";

  const status = document.createElement("span");
  status.className = "status-pill";
  status.textContent = "Checking…";

  const detail = document.createElement("span");
  detail.className = "room-detail";

  card.appendChild(title);
  card.appendChild(capacity);
  card.appendChild(status);
  card.appendChild(detail);
  return card;
}

function updateRoomCard(room, state, statusText, detailText) {
  const card = document.getElementById("room-now-" + room.id);
  card.classList.remove("is-free", "is-busy");
  if (state === "free") {
    card.classList.add("is-free");
  }
  if (state === "busy") {
    card.classList.add("is-busy");
  }

  card.querySelector(".status-pill").textContent = statusText;
  card.querySelector(".room-detail").textContent = detailText;

  const oldLink = card.querySelector(".btn");
  if (oldLink) {
    oldLink.remove();
  }
  if (state === "free") {
    const link = document.createElement("a");
    link.className = "btn btn-primary btn-small";
    link.href = "booking.html?room=" + room.id;
    link.innerHTML = 'Book it<span class="visually-hidden"> - ' + room.name + "</span>";
    card.appendChild(link);
  }
}

function refreshRoomsBoard() {
  const today = dateFromToday(0);
  const hours = getHoursForDate(today);
  const now = timeToMinutes(currentTime());

  const isOpenNow =
    hours.open !== null &&
    now >= timeToMinutes(hours.open) &&
    now < timeToMinutes(hours.close);

  if (!isOpenNow) {
    const closedNote = getNextOpeningText(hours, now);
    ROOMS.forEach(function (room) {
      updateRoomCard(room, "closed", "Closed now", closedNote);
    });
    showUpdatedTime();
    return;
  }

  const checkUntil = Math.min(now + BOOKING_RULES.slotMinutes, timeToMinutes(hours.close));

  ROOMS.forEach(function (room) {
    checkAvailability(room.id, today, minutesToTime(now), minutesToTime(checkUntil)).then(function (result) {
      if (result.available) {
        updateRoomCard(room, "free", "Free now", "Walk in or book ahead.");
      } else if (result.reason === "conflict") {
        updateRoomCard(room, "busy", "In use", "Booked until " + formatTime(result.conflict.end) + ".");
      } else {
        updateRoomCard(room, "closed", "Not bookable now", result.message);
      }
    });
  });

  showUpdatedTime();
}

function getNextOpeningText(todayHours, nowMinutes) {
  if (todayHours.open !== null && nowMinutes < timeToMinutes(todayHours.open)) {
    return "Opens today at " + formatTime(todayHours.open) + ".";
  }

  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    const hours = getHoursForDate(dateFromToday(daysAhead));
    if (hours.open !== null) {
      const dayName = daysAhead === 1 ? "tomorrow" : hours.day;
      return "Opens " + dayName + " at " + formatTime(hours.open) + ".";
    }
  }
  return "";
}

function showUpdatedTime() {
  const updated = document.getElementById("board-updated");
  if (updated) {
    updated.textContent = "Last updated at " + formatTime(currentTime()) + ". Refreshes every minute.";
  }
}

function setUpRoomsBoard() {
  const board = document.getElementById("rooms-board");
  if (!board) {
    return;
  }

  ROOMS.forEach(function (room) {
    board.appendChild(createRoomCard(room));
  });

  refreshRoomsBoard();
  setInterval(refreshRoomsBoard, BOARD_REFRESH_MS);
}

function buildHoursTable() {
  const tableBody = document.getElementById("hours-table-body");
  if (!tableBody) {
    return;
  }

  const todayIndex = new Date().getDay();

  const weekOrder = [1, 2, 3, 4, 5, 6, 0];

  weekOrder.forEach(function (dayIndex) {
    const hours = OPENING_HOURS[dayIndex];
    const row = document.createElement("tr");

    const dayCell = document.createElement("th");
    dayCell.scope = "row";
    dayCell.textContent = hours.day;

    const timeCell = document.createElement("td");
    timeCell.textContent = hours.open
      ? formatTime(hours.open) + " – " + formatTime(hours.close)
      : "Closed";

    if (dayIndex === todayIndex) {
      row.className = "is-today";
      dayCell.textContent = hours.day + " (today)";
    }

    row.appendChild(dayCell);
    row.appendChild(timeCell);
    tableBody.appendChild(row);
  });
}

setUpRoomsBoard();
buildHoursTable();
