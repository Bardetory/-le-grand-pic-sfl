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
if (document.getElementById('map') && window.L) {
  const center = [45.401, 6.337]; // Coordonnées approximatives de Saint-François-Longchamp, à ajuster avec l'adresse exacte
  const map = L.map('map', { scrollWheelZoom: false }).setView(center, 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  const points = [
    { coords: center, label: "Le Grand Pic — l'appartement" },
    { coords: [45.4015, 6.3378], label: 'Télésiège du Mollaret' },
    { coords: [45.4008, 6.3365], label: 'Boulangerie' },
    { coords: [45.4012, 6.3362], label: 'Sherpa (supérette)' },
    { coords: [45.4022, 6.3385], label: 'Restaurants du haut de station' },
    { coords: [45.4005, 6.3368], label: 'Espace bien-être / balnéo' }
  ];

  points.forEach(p => {
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
