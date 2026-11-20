const ROOMS = [
  {
    id: "study-a",
    name: "Study Room A",
    type: "Small study room",
    capacity: 4,
    features: ["Whiteboard", "Wall screen with HDMI", "Power outlets at every seat"]
  },
  {
    id: "study-b",
    name: "Study Room B",
    type: "Small study room",
    capacity: 6,
    features: ["Whiteboard wall", "Wall screen with HDMI", "Window with natural light"]
  },
  {
    id: "meeting",
    name: "Group Meeting Room",
    type: "Meeting room",
    capacity: 10,
    features: ["Conference table", "Projector", "Video call camera and speaker"]
  },
  {
    id: "media",
    name: "Media Room",
    type: "Recording room",
    capacity: 3,
    features: ["Sound-treated walls", "Two podcast microphones", "Ring light"]
  },
  {
    id: "multipurpose",
    name: "Multipurpose Room",
    type: "Event space",
    capacity: 40,
    features: ["Movable tables and chairs", "Projector and sound system", "Small stage"]
  }
];

const OPENING_HOURS = [
  { day: "Sunday", open: null, close: null },
  { day: "Monday", open: "07:00", close: "22:00" },
  { day: "Tuesday", open: "07:00", close: "22:00" },
  { day: "Wednesday", open: "07:00", close: "22:00" },
  { day: "Thursday", open: "07:00", close: "22:00" },
  { day: "Friday", open: "07:00", close: "18:00" },
  { day: "Saturday", open: "09:00", close: "17:00" }
];

const BOOKING_RULES = {
  slotMinutes: 30,
  minMinutes: 30,
  maxMinutes: 180,
  maxDaysAhead: 30
};

const FAKE_NETWORK_DELAY_MS = 400;

const STORAGE_KEY = "uhsl-student-center-bookings";

function timeToMinutes(time) {
  const parts = time.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

function formatTime(time) {
  const totalMinutes = timeToMinutes(time);
  let hours = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }
  return hours + ":" + minutes + " " + period;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function parseISODate(dateString) {
  const parts = dateString.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function formatDate(dateString) {
  return parseISODate(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function dateFromToday(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return toISODate(date);
}

function currentTime() {
  const now = new Date();
  return minutesToTime(now.getHours() * 60 + now.getMinutes());
}

function findRoom(roomId) {
  return ROOMS.find(function (room) {
    return room.id === roomId;
  });
}

function getHoursForDate(dateString) {
  return OPENING_HOURS[parseISODate(dateString).getDay()];
}

const SAMPLE_BOOKINGS = [
  { roomId: "study-a", date: dateFromToday(0), start: "09:00", end: "11:00" },
  { roomId: "study-a", date: dateFromToday(0), start: "14:00", end: "16:00" },
  { roomId: "study-b", date: dateFromToday(0), start: "10:00", end: "13:00" },
  { roomId: "study-b", date: dateFromToday(0), start: "18:00", end: "20:00" },
  { roomId: "meeting", date: dateFromToday(0), start: "12:00", end: "14:00" },
  { roomId: "media", date: dateFromToday(0), start: "15:00", end: "17:00" },
  { roomId: "multipurpose", date: dateFromToday(0), start: "17:00", end: "20:00" },
  { roomId: "study-a", date: dateFromToday(1), start: "10:00", end: "12:00" },
  { roomId: "meeting", date: dateFromToday(1), start: "09:00", end: "12:00" },
  { roomId: "study-b", date: dateFromToday(2), start: "13:00", end: "15:00" }
];

function loadSavedBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function storeSavedBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
  }
}

function getAllBookings() {
  return SAMPLE_BOOKINGS.concat(loadSavedBookings());
}

function getAvailabilityResult(roomId, dateString, startTime, endTime) {
  const room = findRoom(roomId);
  if (!room) {
    return { available: false, reason: "invalid", message: "Choose a room from the list." };
  }

  const today = dateFromToday(0);
  const lastDay = dateFromToday(BOOKING_RULES.maxDaysAhead);
  if (dateString < today) {
    return { available: false, reason: "past", message: "That date has already passed." };
  }
  if (dateString > lastDay) {
    return {
      available: false,
      reason: "too-far",
      message: "You can book up to " + BOOKING_RULES.maxDaysAhead + " days ahead."
    };
  }

  const hours = getHoursForDate(dateString);
  if (!hours.open) {
    return {
      available: false,
      reason: "closed",
      message: "The Student Center is closed on " + hours.day + "s. Try another day."
    };
  }

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    return { available: false, reason: "invalid", message: "End time must be after start time." };
  }
  if (end - start > BOOKING_RULES.maxMinutes) {
    return {
      available: false,
      reason: "too-long",
      message: "You can book a room for up to " + BOOKING_RULES.maxMinutes / 60 + " hours at a time."
    };
  }
  if (start < timeToMinutes(hours.open) || end > timeToMinutes(hours.close)) {
    return {
      available: false,
      reason: "outside-hours",
      message:
        "On " + hours.day + "s we're open " + formatTime(hours.open) +
        " to " + formatTime(hours.close) + ". Pick a time in that window."
    };
  }

  if (dateString === today && start + BOOKING_RULES.slotMinutes <= timeToMinutes(currentTime())) {
    return { available: false, reason: "past", message: "That start time has already passed today." };
  }

  const clash = getAllBookings().find(function (booking) {
    return (
      booking.roomId === roomId &&
      booking.date === dateString &&
      start < timeToMinutes(booking.end) &&
      end > timeToMinutes(booking.start)
    );
  });

  if (clash) {
    return {
      available: false,
      reason: "conflict",
      conflict: { start: clash.start, end: clash.end },
      message:
        room.name + " is already booked from " + formatTime(clash.start) +
        " to " + formatTime(clash.end) + ". Try another time or room."
    };
  }

  return {
    available: true,
    reason: "ok",
    message:
      room.name + " is free on " + formatDate(dateString) + " from " +
      formatTime(startTime) + " to " + formatTime(endTime) + "."
  };
}

function checkAvailability(roomId, dateString, startTime, endTime) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(getAvailabilityResult(roomId, dateString, startTime, endTime));
    }, FAKE_NETWORK_DELAY_MS);
  });
}

function saveBooking(booking) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      const check = getAvailabilityResult(booking.roomId, booking.date, booking.start, booking.end);
      if (!check.available) {
        resolve({ ok: false, message: check.message });
        return;
      }

      const confirmation = "SC-" + Math.floor(10000 + Math.random() * 90000);
      const saved = loadSavedBookings();
      saved.push({
        roomId: booking.roomId,
        date: booking.date,
        start: booking.start,
        end: booking.end,
        confirmation: confirmation
      });
      storeSavedBookings(saved);

      resolve({ ok: true, confirmation: confirmation });
    }, FAKE_NETWORK_DELAY_MS);
  });
}
