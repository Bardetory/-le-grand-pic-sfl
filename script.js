// ---------- Menu mobile ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- FAQ accordion ----------
document.querySelectorAll('.accordion__trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const panel = trigger.nextElementSibling;
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    // close all
    document.querySelectorAll('.accordion__trigger').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
      t.nextElementSibling.style.maxHeight = null;
    });

    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ---------- Map ----------
const APARTMENT = { coords: [45.420575498759206, 6.363554839027996], label: "Le Grand Pic — l'appartement" };

const POINTS_OF_INTEREST = [
  { coords: [45.421315332451094, 6.365456012013619], label: 'Télésiège du Mollaret' },
  { coords: [45.42135963094954, 6.363933667584487], label: 'Boulangerie' },
  { coords: [45.42130629417531, 6.363433112075676], label: 'Sherpa (supérette)' },
  { coords: [45.42028167514089, 6.36312571691603], label: 'Espace bien-être' }
];

if (document.getElementById('map') && window.L) {
  const map = L.map('map', { scrollWheelZoom: false }).setView(APARTMENT.coords, 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // Icône ambre distincte pour l'appartement
  const apartmentIcon = L.divIcon({
    className: 'apartment-marker',
    html: '<span></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  L.marker(APARTMENT.coords, { icon: apartmentIcon, zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup(`<strong>${APARTMENT.label}</strong>`)
    .openPopup();

  POINTS_OF_INTEREST.forEach(p => {
    L.marker(p.coords).addTo(map).bindPopup(p.label);
  });
}

// ---------- Calendrier de disponibilités ----------
const calendarGrid = document.getElementById('calendarGrid');
const calendarLabel = document.getElementById('calendarLabel');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');
const dateArrivee = document.getElementById('dateArrivee');
const dateDepart = document.getElementById('dateDepart');

// Semaines de vacances scolaires : réservation uniquement à la semaine, du samedi au samedi.
// Toussaint et Noël sont les mêmes dates pour toute la France.
// Hiver et Printemps sont décalés par zone (A, B, C) : chaque période ci-dessous couvre
// l'ensemble des 3 zones (de la date de début la plus tôt à la date de fin la plus tard),
// pour qu'aucune semaine de vacances d'aucune zone ne soit oubliée.
// Source : calendrier officiel du ministère de l'Éducation nationale.
// ⚠️ À METTRE À JOUR CHAQUE ANNÉE (dates publiées ~1 à 2 ans à l'avance sur education.gouv.fr).
const SCHOOL_HOLIDAY_PERIODS = [
  { start: '2026-10-17', end: '2026-11-02' }, // Vacances de la Toussaint 2026 (toutes zones)
  { start: '2026-12-19', end: '2027-01-04' }, // Vacances de Noël 2026-2027 (toutes zones)
  { start: '2027-02-06', end: '2027-03-08' }, // Vacances d'hiver 2027 (zone C au 6/02 → zone B au 8/03)
  { start: '2027-04-03', end: '2027-05-03' }  // Vacances de printemps 2027 (zone C au 3/04 → zone B au 3/05)
];

// Périodes déjà réservées par d'autres personnes (à compléter à la main : { start: 'AAAA-MM-JJ', end: 'AAAA-MM-JJ' })
const BOOKED_RANGES = [];

let current = new Date();
current.setDate(1);

let selStart = null; // Date d'arrivée
let selEnd = null;   // Date de départ

const monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const dowNames = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

// Formatage en date locale (évite le décalage d'un jour de toISOString, qui convertit en UTC)
function formatLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseLocal(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a, b) {
  return a && b && a.getTime() === b.getTime();
}

function isPeakDate(date) {
  return SCHOOL_HOLIDAY_PERIODS.some(p => date >= parseLocal(p.start) && date <= parseLocal(p.end));
}

function isBookedDate(date) {
  return BOOKED_RANGES.some(r => date >= parseLocal(r.start) && date <= parseLocal(r.end));
}

// Renvoie la semaine samedi -> samedi (exclusif) contenant la date donnée
function getSaturdayWeek(date) {
  const dow = date.getDay(); // 0 = dimanche ... 6 = samedi
  const daysSinceSaturday = (dow + 1) % 7;
  const start = new Date(date);
  start.setDate(start.getDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function handleDayClick(date) {
  if (isBookedDate(date)) {
    alert("Ces dates sont déjà réservées. N'hésitez pas à nous contacter par email pour vérifier une éventuelle disponibilité.");
    return;
  }

  if (isPeakDate(date)) {
    // Vacances scolaires : sélection automatique de la semaine samedi -> samedi
    const week = getSaturdayWeek(date);
    selStart = week.start;
    selEnd = week.end;
  } else {
    // Hors vacances : sélection libre, jour par jour
    if (selStart === null && selEnd === null) {
      selStart = date;
    } else if (selStart !== null && selEnd === null) {
      if (isSameDay(date, selStart)) {
        selStart = null; // on déclique l'unique date sélectionnée
      } else if (date > selStart) {
        selEnd = date;
      } else {
        selEnd = selStart;
        selStart = date;
      }
    } else {
      if (isSameDay(date, selStart)) {
        selStart = selEnd;
        selEnd = null;
      } else if (isSameDay(date, selEnd)) {
        selEnd = null;
      } else if (date < selStart) {
        selStart = date; // la période s'allonge
      } else if (date > selEnd) {
        selEnd = date; // la période s'allonge
      } else {
        // date à l'intérieur de la période : elle se raccourcit du côté le plus proche
        const distToStart = date - selStart;
        const distToEnd = selEnd - date;
        if (distToStart <= distToEnd) selStart = date; else selEnd = date;
      }
    }
  }

  dateArrivee.value = selStart ? formatLocal(selStart) : '';
  dateDepart.value = selEnd ? formatLocal(selEnd) : '';

  renderCalendar(current);
}

function renderCalendar(date) {
  calendarGrid.innerHTML = '';
  calendarLabel.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  dowNames.forEach(d => {
    const el = document.createElement('div');
    el.className = 'dow';
    el.textContent = d;
    calendarGrid.appendChild(el);
  });

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'day empty';
    calendarGrid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    const el = document.createElement('div');
    el.className = 'day';
    el.textContent = d;

    const booked = isBookedDate(dayDate);
    const peak = isPeakDate(dayDate);
    const selected = selStart && (
      isSameDay(dayDate, selStart) ||
      (selEnd && dayDate >= selStart && dayDate <= selEnd)
    );

    if (booked) {
      el.classList.add('day--booked');
      el.title = 'Déjà réservé';
    } else {
      if (peak) el.classList.add('day--peak');
      if (selected) el.classList.add('day--selected');
      el.title = peak ? 'Disponible — semaine vacances scolaires' : 'Disponible';
    }

    el.addEventListener('click', () => handleDayClick(dayDate));
    calendarGrid.appendChild(el);
  }
}

renderCalendar(current);

prevBtn.addEventListener('click', () => {
  current.setMonth(current.getMonth() - 1);
  renderCalendar(current);
});
nextBtn.addEventListener('click', () => {
  current.setMonth(current.getMonth() + 1);
  renderCalendar(current);
});
