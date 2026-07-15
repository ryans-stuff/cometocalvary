(function(){
  // ---- Hero dropdown menu ----
  const heroToggle = document.getElementById('heroMenuToggle');
  const heroDropdown = document.getElementById('heroDropdown');
  heroToggle.addEventListener('click', () => {
    const open = heroDropdown.classList.toggle('is-open');
    heroToggle.classList.toggle('is-open', open);
    heroToggle.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if(!heroDropdown.contains(e.target) && !heroToggle.contains(e.target)){
      heroDropdown.classList.remove('is-open');
      heroToggle.classList.remove('is-open');
      heroToggle.setAttribute('aria-expanded', 'false');
    }
  });
  heroDropdown.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    heroDropdown.classList.remove('is-open');
    heroToggle.classList.remove('is-open');
  }));

  // ---- Sticky nav mobile toggle ----
  const stickyToggle = document.getElementById('stickyToggle');
  const stickyLinks = document.getElementById('stickyLinks');
  stickyToggle.addEventListener('click', () => stickyLinks.classList.toggle('is-open'));
  stickyLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => stickyLinks.classList.remove('is-open')));

  // ---- Sticky nav visibility + shadow ----
  const stickyNav = document.getElementById('stickyNav');
  const heroEl = document.getElementById('home');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onScroll(){
    const heroBottom = heroEl.getBoundingClientRect().bottom;
    stickyNav.classList.toggle('is-visible', heroBottom < 80);
    stickyNav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

 

  // ---- Parallax on hero collage columns ----
  const parallaxEls = document.querySelectorAll('.parallax-el');
  let ticking = false;
  function updateParallax(){
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.1;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
    ticking = false;
  }
  if(!reduceMotion){
    document.addEventListener('scroll', () => {
      if(!ticking){ requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
})();

function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

async function getEvents() {
      const response = await fetch("./events.json");
      return await response.json();
  }

  function getNextEvents(events, count = 3) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return events
      .map(event => {
        let nextDate = null;

        if (Array.isArray(event.date)) {
          // Multiple individual dates
          const upcoming = event.date
            .map(d => parseLocalDate(d))
            .filter(d => d >= now)
            .sort((a, b) => a - b);

          if (upcoming.length) nextDate = upcoming[0];

        } else if (typeof event.date === "string" && event.date.includes("/")) {
          // Date range
          const [start, end] = event.date.split("/");
          const startDate = new Date(start);
          const endDate = new Date(end);

          if (endDate >= now)
            nextDate = startDate >= now ? startDate : now;

        } else {
          // Single date
          const date = parseLocalDate(event.date);
          if (date >= now) nextDate = date;
        }

        return nextDate ? { ...event, nextDate } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.nextDate - b.nextDate)
      .slice(0, count)
      .map(({ nextDate, ...event }) => event);
  }

  async function updateUpcoming() {
    const events = await getEvents();
    const upcomingEvents = getNextEvents(events, 3);

    const eventsContainer = document.getElementById("eventsGrid");
    eventsContainer.innerHTML = "";

    upcomingEvents.forEach(event => {
        const eventCard = document.createElement('div');
      eventCard.className = 'event-card';

      const eventMedia = document.createElement('div');
      eventMedia.className = 'event-media';
      const ph = document.createElement('div');
      ph.className = `ph ${event.image || 'ph-6'}`;
      ph.style.backgroundImage = event.image ? `url(${event.image})` : '';
      const eventDate = document.createElement('div');
      eventDate.className = 'event-date';

      const localDate = parseLocalDate(event.date);

      const d = document.createElement('div');
      d.className = 'd';
      d.textContent = localDate.getDate();
      const m = document.createElement('div');
      m.className = 'm';
      m.textContent = localDate.toLocaleString('default', { month: 'short' });
      console.log(event.date, d.textContent, m.textContent);
      eventDate.appendChild(d);
      eventDate.appendChild(m);
      eventMedia.appendChild(ph);
      eventMedia.appendChild(eventDate);

      const eventBody = document.createElement('div');
      eventBody.className = 'event-body';
      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = event.time;
      const h3 = document.createElement('h3');
      h3.textContent = event.event;
      const p = document.createElement('p');
      p.textContent = event.description;
      eventBody.appendChild(time);
      eventBody.appendChild(h3);
      eventBody.appendChild(p);

      eventCard.appendChild(eventMedia);
      eventCard.appendChild(eventBody);
      eventsContainer.appendChild(eventCard);
    });
}

updateUpcoming();