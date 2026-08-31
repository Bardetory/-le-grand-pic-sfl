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
// ⚠️ COORDONNÉES À REMPLACER ⚠️
// Pour chaque point, ouvre Google Maps, fais un clic droit sur l'endroit exact,
// clique sur les chiffres qui apparaissent en haut (ex: 45.401234, 6.337456)
// pour les copier, puis colle-les ci-dessous à la place des valeurs actuelles.
const APARTMENT = { coords: [45.401, 6.337], label: "Le Grand Pic — l'appartement" };

const POINTS_OF_INTEREST = [
  { coords: [45.42114966247592, 6.365413096670549], label: 'Télésiège du Mollaret' },
  { coords: [45.42131490426381, 6.363923125824574], label: 'Boulangerie' },
  { coords: [45.42130526170192, 6.363416605674961], label: 'Spar (supérette)' },
  { coords: [45.420143740068006, 6.363138475414532], label: 'Espace bien-être / balnéo' }
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

let current = new Date();
current.setDate(1);

const monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const dowNames = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

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
  // Lundi = 0
  let startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'day empty';
    calendarGrid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'day available';
    el.textContent = d;
    el.title = 'Disponible';
    el.addEventListener('click', () => {
      const iso = new Date(year, month, d).toISOString().split('T')[0];
      if (dateArrivee) dateArrivee.value = iso;
    });
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
