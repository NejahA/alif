// ===== Attractions Data =====
const attractions = [
    {
        icon: '&#127963;',
        name: 'Great Mosque of Mahdia',
        desc: 'Built in the 10th century by the Fatimids, this mosque features a grand façade with a monumental arched entrance and a unique minaret.',
        tag: 'Historical'
    },
    {
        icon: '&#127960;',
        name: 'Borj el-Kebir',
        desc: 'A massive 16th-century fortress built by the Ottomans on the site of an earlier Fatimid palace, offering panoramic sea views.',
        tag: 'Fortress'
    },
    {
        icon: '&#127754;',
        name: 'Mahdia Beach',
        desc: 'Kilometers of pristine white sand and crystal-clear turquoise waters, perfect for swimming, sunbathing, and water sports.',
        tag: 'Beach'
    },
    {
        icon: '&#127965;',
        name: 'Old Medina',
        desc: 'A charming labyrinth of narrow streets, whitewashed houses, and traditional souks selling local handicrafts and spices.',
        tag: 'Culture'
    },
    {
        icon: '&#127938;',
        name: 'Fishing Port',
        desc: 'One of Tunisia\'s most important fishing ports. Watch the colorful boats return at sunset with the day\'s fresh catch.',
        tag: 'Harbor'
    },
    {
        icon: '&#127867;',
        name: 'Skifa Kahla',
        desc: 'The "Black Gate" — a monumental arched gateway from the Fatimid era that once served as the main entrance to the old city.',
        tag: 'Landmark'
    }
];

// ===== Inject Attraction Cards =====
const grid = document.getElementById('attractions-grid');

attractions.forEach(attraction => {
    const card = document.createElement('div');
    card.className = 'attraction-card';
    card.innerHTML = `
        <div class="card-icon">${attraction.icon}</div>
        <h3>${attraction.name}</h3>
        <p>${attraction.desc}</p>
        <span class="card-tag">${attraction.tag}</span>
    `;
    grid.appendChild(card);
});

// ===== Navbar Scroll Effect =====
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Hamburger Menu Toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close nav on link click (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ===== Back-to-Top Button =====
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// ===== Smooth reveal on scroll (Intersection Observer) =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe timeline items, culture cards, gallery items
document.querySelectorAll('.timeline-item, .culture-card, .gallery-item, .attraction-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});