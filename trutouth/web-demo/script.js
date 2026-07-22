document.addEventListener('DOMContentLoaded', () => {
  // Interactive demo controls
  const demoVolume = document.getElementById('demo-volume');
  const demoVolLabel = document.getElementById('demo-vol-label');
  const demoEar = document.getElementById('demo-ear');
  const demoSpatial = document.getElementById('demo-spatial');

  // Status display elements
  const sNoise = document.getElementById('s-noise');
  const sVol = document.getElementById('s-vol');
  const sEq = document.getElementById('s-eq');
  const sEar = document.getElementById('s-ear');
  const sSpatial = document.getElementById('s-spatial');

  // --- Noise Control ---
  document.querySelectorAll('.demo-nc').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.demo-nc').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sNoise.textContent = btn.dataset.value;
    });
  });

  // --- Volume ---
  demoVolume.addEventListener('input', () => {
    const val = demoVolume.value;
    demoVolLabel.textContent = `${val}%`;
    sVol.textContent = `${val}%`;
  });

  // --- EQ ---
  document.querySelectorAll('.demo-eq').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.demo-eq').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sEq.textContent = btn.dataset.value;
    });
  });

  // --- Ear Detection ---
  demoEar.addEventListener('change', () => {
    sEar.textContent = demoEar.checked ? 'On' : 'Off';
  });

  // --- Spatial Audio ---
  demoSpatial.addEventListener('change', () => {
    sSpatial.textContent = demoSpatial.checked ? 'On' : 'Off';
  });

  // --- Phone mockup: sync phone volume slider with demo volume ---
  const phoneVolumeSlider = document.querySelector('.phone-mockup input[type="range"]');
  const phoneVolPct = document.querySelector('.phone-mockup .vol-pct');

  if (phoneVolumeSlider) {
    phoneVolumeSlider.addEventListener('input', () => {
      if (phoneVolPct) phoneVolPct.textContent = `${phoneVolumeSlider.value}%`;
    });
  }

  // --- Phone mockup: noise control buttons ---
  document.querySelectorAll('.phone-mockup .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.segmented');
      if (!parent) return;
      parent.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // --- Phone mockup: EQ chips ---
  document.querySelectorAll('.phone-mockup .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const parent = chip.closest('.eq-chips');
      if (!parent) return;
      parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // --- Phone mockup: toggle switches ---
  document.querySelectorAll('.phone-mockup .switch input').forEach(toggle => {
    toggle.addEventListener('change', () => {
      // Visual feedback already handled by CSS
    });
  });

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Animated counter for hero stats (simple reveal) ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.feature-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s ease ${i * 0.1}s`;
    observer.observe(card);
  });

  console.log('🚀 Truetooth web demo loaded');
});
