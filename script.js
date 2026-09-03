const SUPABASE_URL = 'https://jlweertrmbbskwibnyin.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NJSrNiKspLE2kQjOJRaVYA_h7BArE62';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ===================================================
   TYPOGRAPHY CONFIG
   Shared between the admin controls and the public
   site's CSS custom-property rendering.
=================================================== */
const FONT_OPTIONS = [
  { value: '', label: 'Default (Inter)' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: "'Courier New', Courier, monospace", label: 'Courier New' }
];

// key: matches the property name stored inside site_settings.typography (jsonb)
// cssSizeVar/cssFontVar: the CSS custom properties applied on the public site
// sizeInput/fontSelect/sizeLabel: element ids in the admin Settings tab
const TYPOGRAPHY_FIELDS = [
  { key: 'heroTitle', defaultSize: 42, sizeInput: 'adm-hero-title-size', fontSelect: 'adm-hero-title-font', sizeLabel: 'adm-hero-title-size-val', cssSizeVar: '--tf-hero-title-size', cssFontVar: '--tf-hero-title-family' },
  { key: 'heroSubtitle', defaultSize: 21, sizeInput: 'adm-hero-subtitle-size', fontSelect: 'adm-hero-subtitle-font', sizeLabel: 'adm-hero-subtitle-size-val', cssSizeVar: '--tf-hero-subtitle-size', cssFontVar: '--tf-hero-subtitle-family' },
  { key: 'aboutText', defaultSize: 17, sizeInput: 'adm-about-text-size', fontSelect: 'adm-about-text-font', sizeLabel: 'adm-about-text-size-val', cssSizeVar: '--tf-about-size', cssFontVar: '--tf-about-family' },
  { key: 'headings', defaultSize: 29, sizeInput: 'adm-heading-size', fontSelect: 'adm-heading-font', sizeLabel: 'adm-heading-size-val', cssSizeVar: '--tf-heading-size', cssFontVar: '--tf-heading-family' },
  { key: 'bodyText', defaultSize: 15, sizeInput: 'adm-body-size', fontSelect: 'adm-body-font', sizeLabel: 'adm-body-size-val', cssSizeVar: '--tf-body-size', cssFontVar: '--tf-body-family' },
  { key: 'projects', defaultSize: 15, sizeInput: 'adm-projects-size', fontSelect: 'adm-projects-font', sizeLabel: 'adm-projects-size-val', cssSizeVar: '--tf-projects-size', cssFontVar: '--tf-projects-family' },
  { key: 'education', defaultSize: 15, sizeInput: 'adm-education-size', fontSelect: 'adm-education-font', sizeLabel: 'adm-education-size-val', cssSizeVar: '--tf-education-size', cssFontVar: '--tf-education-family' },
  { key: 'skills', defaultSize: 14, sizeInput: 'adm-skills-size', fontSelect: 'adm-skills-font', sizeLabel: 'adm-skills-size-val', cssSizeVar: '--tf-skills-size', cssFontVar: '--tf-skills-family' },
  { key: 'social', defaultSize: 14, sizeInput: 'adm-social-size', fontSelect: 'adm-social-font', sizeLabel: 'adm-social-size-val', cssSizeVar: '--tf-social-size', cssFontVar: '--tf-social-family' },
  { key: 'contact', defaultSize: 15, sizeInput: 'adm-contact-size', fontSelect: 'adm-contact-font', sizeLabel: 'adm-contact-size-val', cssSizeVar: '--tf-contact-size', cssFontVar: '--tf-contact-family' }
];

// Populates each font-family <select>, and wires each slider so its live
// value readout updates as the admin drags it. Safe to call once — it
// short-circuits on selects that are already populated.
function setupTypographyControls() {
  TYPOGRAPHY_FIELDS.forEach(field => {
    const select = document.getElementById(field.fontSelect);
    if (select && !select.dataset.populated) {
      FONT_OPTIONS.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        optionEl.style.fontFamily = opt.value || 'inherit';
        select.appendChild(optionEl);
      });
      select.dataset.populated = 'true';
    }

    const slider = document.getElementById(field.sizeInput);
    const label = document.getElementById(field.sizeLabel);
    if (slider && label && !slider.dataset.wired) {
      slider.addEventListener('input', () => {
        label.textContent = `${slider.value}px`;
      });
      slider.dataset.wired = 'true';
    }
  });
}

// Reads the current slider/select values out of the admin Settings tab into
// a plain typography object ready to save to Supabase.
function readTypographyFromControls() {
  const typography = {};
  TYPOGRAPHY_FIELDS.forEach(field => {
    const slider = document.getElementById(field.sizeInput);
    const select = document.getElementById(field.fontSelect);
    typography[field.key] = {
      size: slider ? Number(slider.value) : field.defaultSize,
      font: select ? select.value : ''
    };
  });
  return typography;
}

// Populates the admin sliders/dropdowns/labels from a saved typography
// object (falling back to each field's default when nothing is saved yet).
function applyTypographyToControls(typography) {
  const saved = typography && typeof typography === 'object' ? typography : {};
  TYPOGRAPHY_FIELDS.forEach(field => {
    const setting = saved[field.key] || {};
    const size = setting.size || field.defaultSize;

    const slider = document.getElementById(field.sizeInput);
    const label = document.getElementById(field.sizeLabel);
    const select = document.getElementById(field.fontSelect);

    if (slider) slider.value = size;
    if (label) label.textContent = `${size}px`;
    if (select) select.value = setting.font || '';
  });
}

// Detect page mode & initialize setup
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupSecretAdminAccess();
  // Dark mode toggle is intentionally removed from the public UI.
  // Keep the helper for backward compatibility with older cached markup.
  setupThemeToggle();
  setupBackToTop();
  setupActiveNavHighlight();

  if (document.getElementById('public-site')) {
    initPublicSite();
  } else if (document.getElementById('admin-site')) {
    initAdminSite();
  }
});

/* ===================================================
   THEME TOGGLE (light/dark)
=================================================== */
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (toggleBtn) toggleBtn.textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      if (toggleBtn) toggleBtn.textContent = '🌙';
    }
  };

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (err) { /* storage unavailable */ }

  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (err) { /* storage unavailable */ }
    });
  }
}

/* ===================================================
   BACK TO TOP BUTTON
=================================================== */
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===================================================
   ACTIVE NAV LINK HIGHLIGHTING ON SCROLL
=================================================== */
function setupActiveNavHighlight() {
  const navLinks = Array.from(document.querySelectorAll('#nav-menu a[href^="#"]'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('nav-link-active'));
        link.classList.add('nav-link-active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* ===================================================
   SECRET ADMIN ACCESS (via profile photo)
   Click the profile photo 5 times within 2 seconds
   to navigate to the admin panel, since the Admin
   link is no longer shown in the nav menu.
=================================================== */
function setupSecretAdminAccess() {
  const imgEl = document.getElementById('profile-img');
  if (!imgEl) return;

  const REQUIRED_CLICKS = 5;
  const RESET_DELAY_MS = 2000;
  let clickCount = 0;
  let resetTimer = null;

  imgEl.style.cursor = 'pointer';

  imgEl.addEventListener('click', () => {
    clickCount++;

    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      clickCount = 0;
    }, RESET_DELAY_MS);

    if (clickCount >= REQUIRED_CLICKS) {
      clickCount = 0;
      if (resetTimer) clearTimeout(resetTimer);
      window.location.href = 'admin.html';
    }
  });
}

/* ===================================================
   MOBILE MENU & SCROLL ANIMATIONS
=================================================== */
function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('nav-active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('nav-active');
      });
    });
  }
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-box').forEach(box => {
    box.classList.add('animate-on-scroll');
    observer.observe(box);
  });
}

/* ===================================================
   PUBLIC SITE FUNCTIONS (index.html)
=================================================== */
async function initPublicSite() {
  void Promise.allSettled([loadSiteSettings(), loadProjects(), loadEducation(), loadCertificates(), loadSkills()]);

  // Handle Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusDiv = document.getElementById('contact-status');

      // Honeypot: real users never fill this hidden field; bots often do
      const honeypot = document.getElementById('c-website');
      if (honeypot && honeypot.value.trim() !== '') {
        statusDiv.innerText = 'Message sent successfully!';
        statusDiv.style.color = '#16a34a';
        contactForm.reset();
        return;
      }

      statusDiv.innerText = 'Sending message...';

      const name = document.getElementById('c-name').value;
      const email = document.getElementById('c-email').value;
      const message = document.getElementById('c-message').value;

      const { error } = await supabaseClient.from('contacts').insert([{ name, email, message }]);

      if (error) {
        statusDiv.innerText = 'Error: ' + error.message;
        statusDiv.style.color = '#e11d48';
      } else {
        statusDiv.innerText = 'Message sent successfully!';
        statusDiv.style.color = '#16a34a';
        contactForm.reset();
      }
    });
  }
}

async function loadSiteSettings() {
  const { data } = await supabaseClient.from('site_settings').select('*').eq('id', 1).maybeSingle();
  if (data) {
    if (document.getElementById('hero-title')) document.getElementById('hero-title').innerText = data.hero_title || 'Swabhiman Thapa';
    if (document.getElementById('hero-subtitle')) document.getElementById('hero-subtitle').innerText = data.hero_subtitle || 'Graduate Mechanical Engineer';
    if (document.getElementById('about-text')) document.getElementById('about-text').innerText = data.about_text || 'Graduate Mechanical Engineer presenting selected engineering work, technical skills, education, certifications, and professional development.';
    
    // Profile Image
    const imgEl = document.getElementById('profile-img');
    if (imgEl && data.profile_photo_url) {
      imgEl.src = data.profile_photo_url;
      imgEl.style.display = 'inline-block';
    }

    // Direct Contact Details
    if (document.getElementById('contact-email-val')) document.getElementById('contact-email-val').innerText = data.email || 'N/A';
    if (document.getElementById('contact-phone-val')) document.getElementById('contact-phone-val').innerText = data.phone || 'N/A';

    // CV Link
    const cvBtn = document.getElementById('cv-download-btn');
    if (cvBtn && data.cv_url) {
      cvBtn.href = data.cv_url;
      cvBtn.style.display = 'inline-block';
    }

    // Social & Contact Buttons
    const socialContainer = document.getElementById('social-links');
    if (socialContainer) {
      let socialHtml = '';
      if (data.linkedin_url) {
        socialHtml += `<a href="${ensureAbsoluteUrl(data.linkedin_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-social btn-linkedin">LinkedIn</a>`;
      }
      if (data.facebook_url) {
        socialHtml += `<a href="${ensureAbsoluteUrl(data.facebook_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-social btn-facebook">Facebook</a>`;
      }
      if (data.whatsapp_number) {
        socialHtml += `<a href="https://wa.me/${data.whatsapp_number.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-social btn-whatsapp">WhatsApp</a>`;
      }
      if (data.other_contact_url) {
        socialHtml += `<a href="${ensureAbsoluteUrl(data.other_contact_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-social btn-other">${data.other_contact_label || 'Contact'}</a>`;
      }
      socialContainer.innerHTML = socialHtml;
    }

    updateSeoMetadata(data);
    applyTypography(data.typography);
  }
}

// Sets CSS custom properties on <html> from the saved typography JSON so
// custom font sizes/families (set in the admin panel) render on the public
// site. Falls back silently to the built-in design when nothing is set.
function applyTypography(typography) {
  if (!typography || typeof typography !== 'object') return;
  const root = document.documentElement;

  TYPOGRAPHY_FIELDS.forEach(field => {
    const setting = typography[field.key];
    if (!setting) return;

    if (setting.size) {
      root.style.setProperty(field.cssSizeVar, `${setting.size}px`);
    }
    if (setting.font) {
      root.style.setProperty(field.cssFontVar, setting.font);
    }
  });
}

// Keep <title>, meta description, and Open Graph/Twitter tags in sync with
// the real profile content, and publish a JSON-LD Person schema so search
// engines and recruiter/ATS crawlers can read the profile correctly.
function updateSeoMetadata(data) {
  const title = data.hero_title ? `${data.hero_title} — Portfolio` : 'Portfolio';
  const description = (data.about_text || data.hero_subtitle || 'Professional portfolio showcasing projects, education, and skills.').slice(0, 160);

  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
  const setContent = (id, value) => { const el = document.getElementById(id); if (el) el.setAttribute('content', value); };

  setText('page-title', title);
  setContent('meta-description', description);
  setContent('meta-author', data.hero_title || '');
  setContent('og-title', title);
  setContent('og-description', description);
  setContent('twitter-title', title);
  setContent('twitter-description', description);
  if (data.profile_photo_url) {
    setContent('og-image', data.profile_photo_url);
  }

  const sameAs = [data.linkedin_url, data.facebook_url, data.other_contact_url]
    .filter(Boolean)
    .map(ensureAbsoluteUrl);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.hero_title || undefined,
    description: data.about_text || undefined,
    email: data.email || undefined,
    telephone: data.phone || undefined,
    image: data.profile_photo_url || undefined,
    sameAs: sameAs.length ? sameAs : undefined
  };

  let script = document.getElementById('ld-json-person');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-json-person';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
}

// Prepend https:// if a URL was entered without a scheme, so links open
// the external site instead of resolving as a relative path on this domain.
function ensureAbsoluteUrl(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '#';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function loadProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;
  container.innerHTML = '<p>Loading projects...</p>';

  const { data, error } = await supabaseClient
    .from('projects')
    .select('id,title,description,report_url,media_url,display_order')
    .order('display_order', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Projects load failed:', error);
    container.innerHTML = '<p>Unable to load projects right now.</p>';
    return;
  }

  if (!data?.length) {
    container.innerHTML = '<p>No projects added yet.</p>';
    return;
  }

  container.innerHTML = data.map(project => `
    <article class="card">
      ${renderCardMedia(project.media_url)}
      <h3>${escapeHtml(project.title || 'Untitled Project')}</h3>
      <p>${escapeHtml(project.description || '')}</p>
      ${project.report_url ? `<a href="${escapeAttribute(project.report_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top:14px;display:inline-block;">View Report</a>` : ''}
    </article>`).join('');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

// Renders a project/education card's video/GIF clip as either a looping <video>
// (autoplay, muted, no controls) or an <img> for GIFs, based on the file extension
// of the stored URL. Shared by both the Projects and Education sections.
function renderCardMedia(mediaUrl) {
  if (!mediaUrl) return '';
  const isGif = /\.gif($|\?)/i.test(mediaUrl);
  if (isGif) {
    return `<img src="${mediaUrl}" alt="" class="card-media" loading="lazy">`;
  }
  return `
    <video class="card-media" autoplay muted loop playsinline preload="metadata">
      <source src="${mediaUrl}">
    </video>`;
}

async function loadEducation() {
  const container = document.getElementById('education-container');
  if (!container) return;
  const { data } = await supabaseClient.from('education').select('*').order('display_order', { ascending: true, nullsFirst: false });
  container.innerHTML = (data && data.length) ? '' : '<p>No education details added yet.</p>';
  
  data?.forEach(e => {
    container.innerHTML += `
      <div class="card">
        ${renderCardMedia(e.media_url)}
        <h3>${e.degree}</h3>
        <p><strong>${e.institution}</strong></p>
        <p><small>${e.year_range || ''}</small></p>
        ${e.syllabus_url ? `<a href="${e.syllabus_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top:14px; display:inline-block;">Syllabus Covered</a>` : ''}
      </div>`;
  });
}

async function loadCertificates() {
  const container = document.getElementById('certificates-container');
  if (!container) return;
  const { data } = await supabaseClient.from('certificates').select('*').order('display_order', { ascending: true, nullsFirst: false });
  container.innerHTML = (data && data.length) ? '' : '<p>No certificates added yet.</p>';

  data?.forEach(c => {
    const isPdf = /\.pdf($|\?)/i.test(c.image_url || '');
    container.innerHTML += `
      <div class="cert-card">
        <span class="cert-badge">🏅</span>
        <div class="cert-card-frame">
          ${c.image_url
            ? (isPdf
                ? `<span class="cert-placeholder">📄</span>`
                : `<img src="${c.image_url}" alt="${c.title} certificate" loading="lazy">`)
            : `<span class="cert-placeholder">📜</span>`}
        </div>
        <h3>${c.title}</h3>
        <p class="cert-issuer">${c.issuer || ''}</p>
        <div class="cert-meta">
          ${c.issue_date ? `<span class="cert-pill">${c.issue_date}</span>` : ''}
          ${c.credential_id ? `<span class="cert-pill">ID: ${c.credential_id}</span>` : ''}
        </div>
        <div class="cert-actions">
          ${c.image_url ? `<a href="${c.image_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View Certificate</a>` : ''}
          ${c.credential_url ? `<a href="${c.credential_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Verify</a>` : ''}
        </div>
      </div>`;
  });
}

async function loadSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;
  const { data } = await supabaseClient.from('skills').select('*').order('display_order', { ascending: true, nullsFirst: false });
  container.innerHTML = (data && data.length) ? '' : '<p>No skills added yet.</p>';
  
  data?.forEach(s => {
    container.innerHTML += `
      <span class="badge">
        <span class="badge-name">${s.skill_name} <small class="badge-category">(${s.category || 'General'})</small></span>
        ${s.level ? `<span class="badge-level badge-level-${s.level.toLowerCase()}">${s.level}</span>` : ''}
      </span>`;
  });
}

/* ===================================================
   ADMIN DASHBOARD FUNCTIONS (admin.html)
=================================================== */
async function initAdminSite() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  const authSection = document.getElementById('auth-section');
  const dashboardSection = document.getElementById('dashboard-section');

  if (session) {
    if (authSection) authSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    loadAdminDashboard();
  } else {
    if (authSection) authSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
  }

  // Handle Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else window.location.reload();
    });
  }

  // Handle Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.reload();
    });
  }
}

function loadAdminDashboard() {
  setupTypographyControls();
  loadAdminSettings();
  loadAdminProjects();
  loadAdminEducation();
  loadAdminCertificates();
  loadAdminSkills();
  loadAdminMessages();

  // Tab switcher
  window.openTab = function(evt, tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
  };

  // 1. Upload/Change Photo
  const photoForm = document.getElementById('photo-form');
  if (photoForm) {
    photoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = document.getElementById('photo-file').files[0];
      if (!file) return alert('Select a photo first.');

      // Resize/compress the profile photo in the browser before upload so large
      // phone photos do not get stored or served at their original resolution.
      let uploadFile = file;
      try {
        if (file.type.startsWith('image/')) {
          const optimizedBlob = await optimizeProfilePhoto(file, 900, 0.82);
          if (optimizedBlob) {
            uploadFile = new File([optimizedBlob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
          }
        }
      } catch (optimizeError) {
        console.warn('Photo optimization skipped:', optimizeError);
      }

      const filePath = `profile_${Date.now()}.jpg`;
      const { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, uploadFile);
      if (uploadError) return alert('Upload failed: ' + uploadError.message);

      const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
      const { error: settingsError } = await supabaseClient.from('site_settings').upsert({ id: 1, profile_photo_url: data.publicUrl });
      if (settingsError) return alert('Photo saved, but settings update failed: ' + settingsError.message);
      alert('Profile photo updated!');
      loadAdminSettings();
    });
  }

  // 2. Remove Photo
  const removePhotoBtn = document.getElementById('remove-photo-btn');
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', async () => {
      if (confirm('Remove profile photo?')) {
        await supabaseClient.from('site_settings').upsert({ id: 1, profile_photo_url: null });
        alert('Photo removed.');
        loadAdminSettings();
      }
    });
  }

  // 3. Update Settings
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { error } = await supabaseClient.from('site_settings').upsert({
        id: 1,
        hero_title: document.getElementById('adm-hero-title').value,
        hero_subtitle: document.getElementById('adm-hero-subtitle').value,
        about_text: document.getElementById('adm-about-text').value,
        email: document.getElementById('adm-email').value,
        phone: document.getElementById('adm-phone').value,
        typography: readTypographyFromControls()
      });
      if (error) {
        alert('Save failed: ' + error.message);
      } else {
        alert('Settings saved!');
      }
    });
  }

  // 3b. Update Social & Contact Links
  const socialForm = document.getElementById('social-form');
  if (socialForm) {
    socialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { error } = await supabaseClient.from('site_settings').upsert({
        id: 1,
        linkedin_url: document.getElementById('adm-linkedin').value,
        facebook_url: document.getElementById('adm-facebook').value,
        whatsapp_number: document.getElementById('adm-whatsapp').value,
        other_contact_label: document.getElementById('adm-other-label').value,
        other_contact_url: document.getElementById('adm-other-url').value
      });
      if (error) {
        alert('Save failed: ' + error.message);
      } else {
        alert('Social links saved!');
      }
    });
  }

  // 4. Upload CV
  const cvForm = document.getElementById('cv-form');
  if (cvForm) {
    cvForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = document.getElementById('cv-file').files[0];
      if (!file) return;

      const filePath = `cv_${Date.now()}.pdf`;
      const { error } = await supabaseClient.storage.from('documents').upload(filePath, file);
      if (error) return alert('CV Upload failed: ' + error.message);

      const { data } = supabaseClient.storage.from('documents').getPublicUrl(filePath);
      await supabaseClient.from('site_settings').upsert({ id: 1, cv_url: data.publicUrl });
      alert('CV updated!');
      loadAdminSettings();
    });
  }

  // 5. Add / Update Project
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('p-edit-id').value;
      const submitBtn = document.getElementById('project-submit-btn');
      const file = document.getElementById('p-report-file').files[0];
      const mediaFile = document.getElementById('p-media-file').files[0];
      let reportUrl = document.getElementById('p-existing-report').value || null;
      let mediaUrl = document.getElementById('p-existing-media').value || null;

      submitBtn.disabled = true;
      const originalLabel = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';

      try {
        if (!document.getElementById('p-title').value.trim()) {
          throw new Error('Project title is required.');
        }

        if (file) {
          if (file.type !== 'application/pdf') throw new Error('Project report must be a PDF.');
          if (file.size > 10 * 1024 * 1024) throw new Error('Project report must be 10 MB or smaller.');
        }

        if (mediaFile) {
          const allowed = ['video/mp4','video/webm','video/quicktime','image/gif'];
          if (!allowed.includes(mediaFile.type)) throw new Error('Project clip must be MP4, WebM, MOV, or GIF.');
          if (mediaFile.size > 20 * 1024 * 1024) throw new Error('Project clip must be 20 MB or smaller.');
        }

        if (file) {
        const filePath = `project_report_${Date.now()}.pdf`;
        const { error: uploadError } = await supabaseClient.storage.from('documents').upload(filePath, file);
        if (uploadError) {
          alert('Report upload failed: ' + uploadError.message);
          submitBtn.disabled = false;
          submitBtn.innerText = originalLabel;
          return;
        }
        const { data } = supabaseClient.storage.from('documents').getPublicUrl(filePath);
        reportUrl = data.publicUrl;
      }

      if (mediaFile) {
        const ext = mediaFile.name.split('.').pop().toLowerCase();
        const filePath = `project_media_${Date.now()}.${ext}`;
        const { error: mediaUploadError } = await supabaseClient.storage.from('documents').upload(filePath, mediaFile);
        if (mediaUploadError) {
          alert('Clip upload failed: ' + mediaUploadError.message);
          submitBtn.disabled = false;
          submitBtn.innerText = originalLabel;
          return;
        }
        const { data } = supabaseClient.storage.from('documents').getPublicUrl(filePath);
        mediaUrl = data.publicUrl;
      }

        const payload = {
          title: document.getElementById('p-title').value.trim(),
          description: document.getElementById('p-desc').value.trim(),
          report_url: reportUrl,
          media_url: mediaUrl
        };

        let result;
        if (editId) {
          result = await supabaseClient.from('projects').update(payload).eq('id', editId).select().single();
        } else {
          result = await supabaseClient.from('projects').insert([{ ...payload, display_order: Date.now() }]).select().single();
        }

        if (result.error) throw new Error(result.error.message);

        alert(editId ? 'Project updated successfully.' : 'Project added successfully.');
        resetProjectForm();
        await loadAdminProjects();
      } catch (err) {
        console.error('Project save failed:', err);
        alert('Project could not be saved: ' + (err.message || 'Unknown error'));
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalLabel;
      }
    });
  }

  // Show filename when a new project report is chosen
  const projectReportFile = document.getElementById('p-report-file');
  if (projectReportFile) {
    projectReportFile.addEventListener('change', () => {
      const file = projectReportFile.files[0];
      if (!file) return;
      document.getElementById('p-report-status').innerText = `Selected: ${file.name}`;
      document.getElementById('p-remove-report-btn').style.display = 'inline-flex';
    });
  }

  const projectRemoveReportBtn = document.getElementById('p-remove-report-btn');
  if (projectRemoveReportBtn) {
    projectRemoveReportBtn.addEventListener('click', () => {
      document.getElementById('p-existing-report').value = '';
      document.getElementById('p-report-file').value = '';
      document.getElementById('p-report-status').innerText = '';
      projectRemoveReportBtn.style.display = 'none';
    });
  }

  // Show filename when a new project clip (video/GIF) is chosen
  const projectMediaFile = document.getElementById('p-media-file');
  if (projectMediaFile) {
    projectMediaFile.addEventListener('change', () => {
      const file = projectMediaFile.files[0];
      if (!file) return;
      document.getElementById('p-media-status').innerText = `Selected: ${file.name}`;
      document.getElementById('p-remove-media-btn').style.display = 'inline-flex';
    });
  }

  const projectRemoveMediaBtn = document.getElementById('p-remove-media-btn');
  if (projectRemoveMediaBtn) {
    projectRemoveMediaBtn.addEventListener('click', () => {
      document.getElementById('p-existing-media').value = '';
      document.getElementById('p-media-file').value = '';
      document.getElementById('p-media-status').innerText = '';
      projectRemoveMediaBtn.style.display = 'none';
    });
  }

  const projectCancelBtn = document.getElementById('project-cancel-btn');
  if (projectCancelBtn) {
    projectCancelBtn.addEventListener('click', resetProjectForm);
  }

  // 6. Add / Update Education
  const eduForm = document.getElementById('edu-form');
  if (eduForm) {
    eduForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('edu-edit-id').value;
      const submitBtn = document.getElementById('edu-submit-btn');
      const file = document.getElementById('edu-syllabus-file').files[0];
      const mediaFile = document.getElementById('edu-media-file').files[0];
      let syllabusUrl = document.getElementById('edu-existing-syllabus').value || null;
      let mediaUrl = document.getElementById('edu-existing-media').value || null;

      submitBtn.disabled = true;
      const originalLabel = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';

      if (file) {
        const filePath = `edu_syllabus_${Date.now()}.pdf`;
        const { error: uploadError } = await supabaseClient.storage.from('documents').upload(filePath, file);
        if (uploadError) {
          alert('Syllabus upload failed: ' + uploadError.message);
          submitBtn.disabled = false;
          submitBtn.innerText = originalLabel;
          return;
        }
        const { data } = supabaseClient.storage.from('documents').getPublicUrl(filePath);
        syllabusUrl = data.publicUrl;
      }

      if (mediaFile) {
        const ext = mediaFile.name.split('.').pop().toLowerCase();
        const filePath = `edu_media_${Date.now()}.${ext}`;
        const { error: mediaUploadError } = await supabaseClient.storage.from('documents').upload(filePath, mediaFile);
        if (mediaUploadError) {
          alert('Clip upload failed: ' + mediaUploadError.message);
          submitBtn.disabled = false;
          submitBtn.innerText = originalLabel;
          return;
        }
        const { data } = supabaseClient.storage.from('documents').getPublicUrl(filePath);
        mediaUrl = data.publicUrl;
      }

      const payload = {
        institution: document.getElementById('edu-inst').value,
        degree: document.getElementById('edu-deg').value,
        year_range: document.getElementById('edu-yr').value,
        syllabus_url: syllabusUrl,
        media_url: mediaUrl
      };

      if (editId) {
        await supabaseClient.from('education').update(payload).eq('id', editId);
      } else {
        await supabaseClient.from('education').insert([{ ...payload, display_order: Date.now() }]);
      }

      submitBtn.disabled = false;
      resetEduForm();
      loadAdminEducation();
    });
  }

  // Show filename when a new syllabus is chosen
  const eduSyllabusFile = document.getElementById('edu-syllabus-file');
  if (eduSyllabusFile) {
    eduSyllabusFile.addEventListener('change', () => {
      const file = eduSyllabusFile.files[0];
      if (!file) return;
      document.getElementById('edu-syllabus-status').innerText = `Selected: ${file.name}`;
      document.getElementById('edu-remove-syllabus-btn').style.display = 'inline-flex';
    });
  }

  const eduRemoveSyllabusBtn = document.getElementById('edu-remove-syllabus-btn');
  if (eduRemoveSyllabusBtn) {
    eduRemoveSyllabusBtn.addEventListener('click', () => {
      document.getElementById('edu-existing-syllabus').value = '';
      document.getElementById('edu-syllabus-file').value = '';
      document.getElementById('edu-syllabus-status').innerText = '';
      eduRemoveSyllabusBtn.style.display = 'none';
    });
  }

  // Show filename when a new education clip (video/GIF) is chosen
  const eduMediaFile = document.getElementById('edu-media-file');
  if (eduMediaFile) {
    eduMediaFile.addEventListener('change', () => {
      const file = eduMediaFile.files[0];
      if (!file) return;
      document.getElementById('edu-media-status').innerText = `Selected: ${file.name}`;
      document.getElementById('edu-remove-media-btn').style.display = 'inline-flex';
    });
  }

  const eduRemoveMediaBtn = document.getElementById('edu-remove-media-btn');
  if (eduRemoveMediaBtn) {
    eduRemoveMediaBtn.addEventListener('click', () => {
      document.getElementById('edu-existing-media').value = '';
      document.getElementById('edu-media-file').value = '';
      document.getElementById('edu-media-status').innerText = '';
      eduRemoveMediaBtn.style.display = 'none';
    });
  }

  const eduCancelBtn = document.getElementById('edu-cancel-btn');
  if (eduCancelBtn) {
    eduCancelBtn.addEventListener('click', resetEduForm);
  }

  // 6b. Add / Update Certificate
  const certForm = document.getElementById('cert-form');
  if (certForm) {
    certForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('cert-edit-id').value;
      const submitBtn = document.getElementById('cert-submit-btn');
      const imageFile = document.getElementById('cert-image-file').files[0];
      let imageUrl = document.getElementById('cert-existing-image').value || null;

      submitBtn.disabled = true;
      const originalLabel = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';

      if (imageFile) {
        const ext = imageFile.name.split('.').pop().toLowerCase();
        const filePath = `certificate_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabaseClient.storage.from('documents').upload(filePath, imageFile);
        if (uploadError) {
          alert('Certificate image upload failed: ' + uploadError.message);
          submitBtn.disabled = false;
          submitBtn.innerText = originalLabel;
          return;
        }
        const { data } = supabaseClient.storage.from('documents').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const payload = {
        title: document.getElementById('cert-title').value,
        issuer: document.getElementById('cert-issuer').value,
        issue_date: document.getElementById('cert-date').value,
        credential_id: document.getElementById('cert-cred-id').value,
        credential_url: document.getElementById('cert-cred-url').value,
        image_url: imageUrl
      };

      if (editId) {
        await supabaseClient.from('certificates').update(payload).eq('id', editId);
      } else {
        await supabaseClient.from('certificates').insert([{ ...payload, display_order: Date.now() }]);
      }

      submitBtn.disabled = false;
      resetCertForm();
      loadAdminCertificates();
    });
  }

  // Show filename when a new certificate image is chosen
  const certImageFile = document.getElementById('cert-image-file');
  if (certImageFile) {
    certImageFile.addEventListener('change', () => {
      const file = certImageFile.files[0];
      if (!file) return;
      document.getElementById('cert-image-status').innerText = `Selected: ${file.name}`;
      document.getElementById('cert-remove-image-btn').style.display = 'inline-flex';
    });
  }

  const certRemoveImageBtn = document.getElementById('cert-remove-image-btn');
  if (certRemoveImageBtn) {
    certRemoveImageBtn.addEventListener('click', () => {
      document.getElementById('cert-existing-image').value = '';
      document.getElementById('cert-image-file').value = '';
      document.getElementById('cert-image-status').innerText = '';
      certRemoveImageBtn.style.display = 'none';
    });
  }

  const certCancelBtn = document.getElementById('cert-cancel-btn');
  if (certCancelBtn) {
    certCancelBtn.addEventListener('click', resetCertForm);
  }

  // 7. Add / Update Skill
  const skillForm = document.getElementById('skill-form');
  if (skillForm) {
    skillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('s-edit-id').value;
      const payload = {
        category: document.getElementById('s-cat').value,
        skill_name: document.getElementById('s-name').value,
        level: document.getElementById('s-level').value
      };

      if (editId) {
        await supabaseClient.from('skills').update(payload).eq('id', editId);
      } else {
        await supabaseClient.from('skills').insert([{ ...payload, display_order: Date.now() }]);
      }

      resetSkillForm();
      loadAdminSkills();
    });
  }

  const skillCancelBtn = document.getElementById('skill-cancel-btn');
  if (skillCancelBtn) {
    skillCancelBtn.addEventListener('click', resetSkillForm);
  }
}

/* ---------- Form reset helpers (exit edit mode) ---------- */
function resetProjectForm() {
  document.getElementById('project-form').reset();
  document.getElementById('p-edit-id').value = '';
  document.getElementById('p-existing-report').value = '';
  document.getElementById('p-report-status').innerText = '';
  document.getElementById('p-remove-report-btn').style.display = 'none';
  document.getElementById('p-existing-media').value = '';
  document.getElementById('p-media-status').innerText = '';
  document.getElementById('p-remove-media-btn').style.display = 'none';
  document.getElementById('project-form-heading').innerText = 'Add Project';
  document.getElementById('project-submit-btn').innerText = 'Add Project';
  document.getElementById('project-cancel-btn').style.display = 'none';
}

function resetEduForm() {
  document.getElementById('edu-form').reset();
  document.getElementById('edu-edit-id').value = '';
  document.getElementById('edu-existing-syllabus').value = '';
  document.getElementById('edu-syllabus-status').innerText = '';
  document.getElementById('edu-remove-syllabus-btn').style.display = 'none';
  document.getElementById('edu-existing-media').value = '';
  document.getElementById('edu-media-status').innerText = '';
  document.getElementById('edu-remove-media-btn').style.display = 'none';
  document.getElementById('edu-form-heading').innerText = 'Add Education';
  document.getElementById('edu-submit-btn').innerText = 'Add Education';
  document.getElementById('edu-cancel-btn').style.display = 'none';
}

function resetCertForm() {
  document.getElementById('cert-form').reset();
  document.getElementById('cert-edit-id').value = '';
  document.getElementById('cert-existing-image').value = '';
  document.getElementById('cert-image-status').innerText = '';
  document.getElementById('cert-remove-image-btn').style.display = 'none';
  document.getElementById('cert-form-heading').innerText = 'Add Certificate';
  document.getElementById('cert-submit-btn').innerText = 'Add Certificate';
  document.getElementById('cert-cancel-btn').style.display = 'none';
}

function resetSkillForm() {
  document.getElementById('skill-form').reset();
  document.getElementById('s-edit-id').value = '';
  document.getElementById('skill-form-heading').innerText = 'Add Skill';
  document.getElementById('skill-submit-btn').innerText = 'Add Skill';
  document.getElementById('skill-cancel-btn').style.display = 'none';
}

/* ---------- Edit helpers (populate form, enter edit mode) ---------- */
function editProject(id) {
  const p = (window._projectsCache || []).find(x => String(x.id) === String(id));
  if (!p) return;
  document.getElementById('p-edit-id').value = p.id;
  document.getElementById('p-title').value = p.title || '';
  document.getElementById('p-desc').value = p.description || '';
  document.getElementById('p-report-file').value = '';
  document.getElementById('p-existing-report').value = p.report_url || '';
  const status = document.getElementById('p-report-status');
  const removeBtn = document.getElementById('p-remove-report-btn');
  if (p.report_url) {
    status.innerHTML = `Current report: <a href="${p.report_url}" target="_blank">View PDF</a>`;
    removeBtn.style.display = 'inline-flex';
  } else {
    status.innerText = '';
    removeBtn.style.display = 'none';
  }
  document.getElementById('p-media-file').value = '';
  document.getElementById('p-existing-media').value = p.media_url || '';
  const mediaStatus = document.getElementById('p-media-status');
  const removeMediaBtn = document.getElementById('p-remove-media-btn');
  if (p.media_url) {
    mediaStatus.innerHTML = `Current clip: <a href="${p.media_url}" target="_blank">View</a>`;
    removeMediaBtn.style.display = 'inline-flex';
  } else {
    mediaStatus.innerText = '';
    removeMediaBtn.style.display = 'none';
  }
  document.getElementById('project-form-heading').innerText = 'Edit Project';
  document.getElementById('project-submit-btn').innerText = 'Update Project';
  document.getElementById('project-cancel-btn').style.display = 'inline-flex';
  document.getElementById('project-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editEducation(id) {
  const e = (window._eduCache || []).find(x => String(x.id) === String(id));
  if (!e) return;
  document.getElementById('edu-edit-id').value = e.id;
  document.getElementById('edu-inst').value = e.institution || '';
  document.getElementById('edu-deg').value = e.degree || '';
  document.getElementById('edu-yr').value = e.year_range || '';
  document.getElementById('edu-syllabus-file').value = '';
  document.getElementById('edu-existing-syllabus').value = e.syllabus_url || '';
  const status = document.getElementById('edu-syllabus-status');
  const removeBtn = document.getElementById('edu-remove-syllabus-btn');
  if (e.syllabus_url) {
    status.innerHTML = `Current syllabus: <a href="${e.syllabus_url}" target="_blank">View PDF</a>`;
    removeBtn.style.display = 'inline-flex';
  } else {
    status.innerText = '';
    removeBtn.style.display = 'none';
  }
  document.getElementById('edu-media-file').value = '';
  document.getElementById('edu-existing-media').value = e.media_url || '';
  const eduMediaStatus = document.getElementById('edu-media-status');
  const eduRemoveMediaBtn = document.getElementById('edu-remove-media-btn');
  if (e.media_url) {
    eduMediaStatus.innerHTML = `Current clip: <a href="${e.media_url}" target="_blank">View</a>`;
    eduRemoveMediaBtn.style.display = 'inline-flex';
  } else {
    eduMediaStatus.innerText = '';
    eduRemoveMediaBtn.style.display = 'none';
  }
  document.getElementById('edu-form-heading').innerText = 'Edit Education';
  document.getElementById('edu-submit-btn').innerText = 'Update Education';
  document.getElementById('edu-cancel-btn').style.display = 'inline-flex';
  document.getElementById('edu-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editCertificate(id) {
  const c = (window._certsCache || []).find(x => String(x.id) === String(id));
  if (!c) return;
  document.getElementById('cert-edit-id').value = c.id;
  document.getElementById('cert-title').value = c.title || '';
  document.getElementById('cert-issuer').value = c.issuer || '';
  document.getElementById('cert-date').value = c.issue_date || '';
  document.getElementById('cert-cred-id').value = c.credential_id || '';
  document.getElementById('cert-cred-url').value = c.credential_url || '';
  document.getElementById('cert-image-file').value = '';
  document.getElementById('cert-existing-image').value = c.image_url || '';
  const status = document.getElementById('cert-image-status');
  const removeBtn = document.getElementById('cert-remove-image-btn');
  if (c.image_url) {
    status.innerHTML = `Current image: <a href="${c.image_url}" target="_blank">View</a>`;
    removeBtn.style.display = 'inline-flex';
  } else {
    status.innerText = '';
    removeBtn.style.display = 'none';
  }
  document.getElementById('cert-form-heading').innerText = 'Edit Certificate';
  document.getElementById('cert-submit-btn').innerText = 'Update Certificate';
  document.getElementById('cert-cancel-btn').style.display = 'inline-flex';
  document.getElementById('cert-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editSkill(id) {
  const s = (window._skillsCache || []).find(x => String(x.id) === String(id));
  if (!s) return;
  document.getElementById('s-edit-id').value = s.id;
  document.getElementById('s-cat').value = s.category || '';
  document.getElementById('s-name').value = s.skill_name || '';
  document.getElementById('s-level').value = s.level || 'Intermediate';
  document.getElementById('skill-form-heading').innerText = 'Edit Skill';
  document.getElementById('skill-submit-btn').innerText = 'Update Skill';
  document.getElementById('skill-cancel-btn').style.display = 'inline-flex';
  document.getElementById('skill-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function optimizeProfilePhoto(file, maxDimension = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return reject(new Error('Canvas unavailable'));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image compression failed')), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not read image')); };
    img.src = objectUrl;
  });
}

async function loadAdminSettings() {
  const { data } = await supabaseClient.from('site_settings').select('*').eq('id', 1).maybeSingle();
  if (data) {
    if (document.getElementById('adm-hero-title')) document.getElementById('adm-hero-title').value = data.hero_title || '';
    if (document.getElementById('adm-hero-subtitle')) document.getElementById('adm-hero-subtitle').value = data.hero_subtitle || '';
    if (document.getElementById('adm-about-text')) document.getElementById('adm-about-text').value = data.about_text || '';
    if (document.getElementById('adm-email')) document.getElementById('adm-email').value = data.email || '';
    if (document.getElementById('adm-phone')) document.getElementById('adm-phone').value = data.phone || '';
    if (document.getElementById('adm-linkedin')) document.getElementById('adm-linkedin').value = data.linkedin_url || '';
    if (document.getElementById('adm-facebook')) document.getElementById('adm-facebook').value = data.facebook_url || '';
    if (document.getElementById('adm-whatsapp')) document.getElementById('adm-whatsapp').value = data.whatsapp_number || '';
    if (document.getElementById('adm-other-label')) document.getElementById('adm-other-label').value = data.other_contact_label || '';
    if (document.getElementById('adm-other-url')) document.getElementById('adm-other-url').value = data.other_contact_url || '';

    applyTypographyToControls(data.typography);

    const preview = document.getElementById('photo-preview-container');
    if (preview) {
      preview.innerHTML = data.profile_photo_url 
        ? `<img src="${data.profile_photo_url}" class="profile-preview">` 
        : '<p style="color:#777;">No profile photo set.</p>';
    }

    const cvStatus = document.getElementById('cv-status');
    if (cvStatus) {
      cvStatus.innerHTML = data.cv_url 
        ? `Current CV: <a href="${data.cv_url}" target="_blank">View PDF</a>` 
        : 'No CV uploaded.';
    }

    const adminCvLink = document.getElementById('admin-cv-link');
    if (adminCvLink) {
      if (data.cv_url) {
        adminCvLink.href = data.cv_url;
        adminCvLink.style.display = 'inline-flex';
      } else {
        adminCvLink.removeAttribute('href');
        adminCvLink.style.display = 'none';
      }
    }
  }
}

// Shared drag handle markup, prepended to every reorderable admin list-item.
const DRAG_HANDLE = `<span class="drag-handle" title="Drag to reorder">⠿</span>`;

// Initializes SortableJS on a reorderable admin list. On drop, writes the new
// display_order (1, 2, 3...) for every item in that list back to Supabase.
function initSortableList(containerId, tableName, reloadFn) {
  const el = document.getElementById(containerId);
  if (!el || typeof Sortable === 'undefined') return;
  if (el._sortableInstance) el._sortableInstance.destroy();
  el._sortableInstance = new Sortable(el, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'drag-ghost',
    onEnd: async () => {
      const ids = Array.from(el.children)
        .map((node) => node.dataset.id)
        .filter(Boolean);
      await Promise.all(
        ids.map((id, index) =>
          supabaseClient.from(tableName).update({ display_order: index + 1 }).eq('id', id)
        )
      );
      if (reloadFn) reloadFn();
    }
  });
}

async function loadAdminProjects() {
  const container = document.getElementById('admin-projects-list');
  if (!container) return;
  const { data } = await supabaseClient.from('projects').select('*').order('display_order', { ascending: true, nullsFirst: false });
  window._projectsCache = data || [];
  container.innerHTML = data?.map(p => `
    <div class="list-item" data-id="${p.id}">
      ${DRAG_HANDLE}
      <span><strong>${p.title}</strong></span>
      <span class="list-item-actions">
        <button class="btn btn-secondary" onclick="editProject('${p.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteRecord('projects', '${p.id}', loadAdminProjects)">Delete</button>
      </span>
    </div>
  `).join('') || '<p>No projects.</p>';
  initSortableList('admin-projects-list', 'projects', loadAdminProjects);
}

async function loadAdminEducation() {
  const container = document.getElementById('admin-edu-list');
  if (!container) return;
  const { data } = await supabaseClient.from('education').select('*').order('display_order', { ascending: true, nullsFirst: false });
  window._eduCache = data || [];
  container.innerHTML = data?.map(e => `
    <div class="list-item" data-id="${e.id}">
      ${DRAG_HANDLE}
      <span><strong>${e.degree}</strong> @ ${e.institution}</span>
      <span class="list-item-actions">
        <button class="btn btn-secondary" onclick="editEducation('${e.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteRecord('education', '${e.id}', loadAdminEducation)">Delete</button>
      </span>
    </div>
  `).join('') || '<p>No education items.</p>';
  initSortableList('admin-edu-list', 'education', loadAdminEducation);
}

async function loadAdminCertificates() {
  const container = document.getElementById('admin-cert-list');
  if (!container) return;
  const { data } = await supabaseClient.from('certificates').select('*').order('display_order', { ascending: true, nullsFirst: false });
  window._certsCache = data || [];
  container.innerHTML = data?.map(c => `
    <div class="list-item" data-id="${c.id}">
      ${DRAG_HANDLE}
      <span><strong>${c.title}</strong> @ ${c.issuer || ''}</span>
      <span class="list-item-actions">
        <button class="btn btn-secondary" onclick="editCertificate('${c.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteRecord('certificates', '${c.id}', loadAdminCertificates)">Delete</button>
      </span>
    </div>
  `).join('') || '<p>No certificates.</p>';
  initSortableList('admin-cert-list', 'certificates', loadAdminCertificates);
}

async function loadAdminSkills() {
  const container = document.getElementById('admin-skills-list');
  if (!container) return;
  const { data } = await supabaseClient.from('skills').select('*').order('display_order', { ascending: true, nullsFirst: false });
  window._skillsCache = data || [];
  container.innerHTML = data?.map(s => `
    <div class="list-item" data-id="${s.id}">
      ${DRAG_HANDLE}
      <span><strong>${s.skill_name}</strong> (${s.category || 'General'}) &middot; ${s.level || 'Intermediate'}</span>
      <span class="list-item-actions">
        <button class="btn btn-secondary" onclick="editSkill('${s.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteRecord('skills', '${s.id}', loadAdminSkills)">Delete</button>
      </span>
    </div>
  `).join('') || '<p>No skills.</p>';
  initSortableList('admin-skills-list', 'skills', loadAdminSkills);
}

async function loadAdminMessages() {
  const container = document.getElementById('admin-messages-list');
  if (!container) return;
  const { data } = await supabaseClient.from('contacts').select('*').order('created_at', { ascending: false });
  container.innerHTML = data?.map(m => `
    <div class="card message-card" style="margin-bottom:15px;">
      <div class="message-card-header">
        <h4>${m.name} (${m.email})</h4>
        <button class="btn btn-danger" onclick="deleteRecord('contacts', '${m.id}', loadAdminMessages)">Delete</button>
      </div>
      <p style="margin:10px 0;">${m.message}</p>
      <small style="color:#777;">Received: ${new Date(m.created_at).toLocaleString()}</small>
    </div>
  `).join('') || '<p>No messages received yet.</p>';
}

async function deleteRecord(table, id, callback) {
  if (confirm('Delete this item?')) {
    await supabaseClient.from(table).delete().eq('id', id);
    callback();
  }
}