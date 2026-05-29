// ===================================================================
// Stone Haus — A–Z view router
// Three states driven by URL hash:
//   #/                          → INDEX (service list)
//   #/<service>                 → SERVICE (project grid)
//   #/<service>/<project>       → PROJECT (detail)
// ===================================================================

(function () {
  const data = window.AZ_DATA;
  const services = data.services;
  const rail = document.getElementById('rail');
  const main = document.getElementById('main');
  const crumb = document.getElementById('crumb');

  // ---------- helpers ----------
  function svc(id)  { return services.find(s => s.id === id); }
  function proj(s, pid) { return s.projects.find(p => p.id === pid); }
  function pad(n)   { return n < 10 ? '0' + n : '' + n; }
  function projectIdx(s, pid) {
    return s.projects.findIndex(p => p.id === pid);
  }

  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    return { service: parts[0] || null, project: parts[1] || null };
  }
  function setHash(serviceId, projectId) {
    const h = '#/' + [serviceId, projectId].filter(Boolean).join('/');
    if (location.hash !== h) {
      location.hash = h;
    } else {
      render();
    }
  }

  // ---------- rail ----------
  function renderRail(serviceId, projectId) {
    const items = services.map((s, i) => {
      const isOpen = s.id === serviceId;
      const subItems = (isOpen && s.projects.length) ? s.projects.map(p => {
        const active = p.id === projectId ? ' class="is-active"' : '';
        return `<li${active}><button data-route="#/${s.id}/${p.id}">${p.title}</button></li>`;
      }).join('') : '';

      const liClass = ['rail__list__item'];
      if (s.id === serviceId) liClass.push('is-active');
      if (isOpen) liClass.push('is-open');

      return `
        <li class="${liClass.join(' ')}">
          <button data-route="#/${s.id}">${s.name}</button>
          ${subItems ? `<ul class="rail__sub">${subItems}</ul>` : ''}
        </li>`;
    }).join('');

    rail.innerHTML = `
      <div class="rail__label">
        <button data-route="#/" style="font:inherit; color:inherit;">Index</button>
        ${serviceId ? `<span class="crumb">${svc(serviceId).name}${projectId ? ' / ' + proj(svc(serviceId), projectId).title : ''}</span>` : ''}
      </div>
      <ul class="rail__list">${items}</ul>
    `;
  }

  // ---------- views ----------
  function renderIndex() {
    crumb.textContent = 'Index';
    const html = `
      <ol class="index-list" start="1">
        ${services.map((s, i) => `
          <li class="view-enter d${(i % 4) + 1}">
            <button data-route="#/${s.id}">
              <span class="ix">${pad(i + 1)}</span>${s.name}
            </button>
          </li>
        `).join('')}
      </ol>
    `;
    main.innerHTML = html;
  }

  function renderService(s) {
    crumb.textContent = s.name;
    const idx = services.indexOf(s);
    const cards = s.projects.length
      ? `<div class="grid">
          ${s.projects.map((p, i) => `
            <div class="card view-enter d${(i % 4) + 1}" data-route="#/${s.id}/${p.id}">
              <div class="thumb" data-bg="${p.thumbBg}">
                <div class="thumb-mark">
                  ${p.thumbMark}
                  <small>${p.thumbSub || ''}</small>
                </div>
              </div>
              <div class="card-title">${p.title}</div>
              <div class="card-meta">${p.client}</div>
            </div>
          `).join('')}
        </div>`
      : `<div style="font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:var(--stone); padding-top:20px">
          [ ${s.name} — projects coming soon ]
        </div>`;

    main.innerHTML = `
      <h1 class="svc-head view-enter"><span class="num">${pad(idx + 1)}</span>${s.name}</h1>
      ${cards}
    `;
  }

  function plateHtml(item, shape) {
    const sh = shape || 'wide';
    return `
      <div class="plate ${sh}" data-bg="${item.bg}" style="${plateStyle(item.bg)}">
        <div class="thumb-mark">${item.mark}<small>${item.sub || ''}</small></div>
      </div>
    `;
  }
  function plateStyle(bg) {
    const map = {
      rust:    'background:radial-gradient(70% 90% at 50% 60%, #b46c3a 0%, #6b3a16 60%, #2a160a 100%); border-color:transparent;',
      cream:   'background:radial-gradient(80% 100% at 50% 50%, #f6f3eb 0%, #c3bdaa 60%, #5e574a 100%); color:#1a1a1a; border-color:transparent;',
      ink:     'background:radial-gradient(70% 90% at 60% 50%, #2a3140 0%, #14181f 60%, #060709 100%); border-color:transparent;',
      olive:   'background:radial-gradient(70% 90% at 50% 55%, #6e715e 0%, #3e4136 60%, #14160f 100%); border-color:transparent;',
      copper:  'background:radial-gradient(80% 100% at 35% 40%, #c08b56 0%, #6a4524 60%, #2a1a0c 100%); border-color:transparent;',
      charcoal:'background:radial-gradient(60% 80% at 50% 50%, #2c2c2d 0%, #161616 50%, #0a0a0a 100%); border-color:transparent;',
      bone:    'background:radial-gradient(60% 80% at 50% 50%, #f4f2ef 0%, #c2bda9 60%, #6c6557 100%); color:#1a1a1a; border-color:transparent;',
      claret:  'background:radial-gradient(70% 90% at 50% 55%, #8d3a3a 0%, #4a1d1d 60%, #160808 100%); border-color:transparent;',
      forest:  'background:radial-gradient(70% 90% at 45% 50%, #2f4a36 0%, #182519 60%, #0a100c 100%); border-color:transparent;',
      indigo:  'background:radial-gradient(70% 90% at 50% 50%, #3a3d68 0%, #1c1e3a 60%, #0a0a1a 100%); border-color:transparent;'
    };
    return map[bg] || '';
  }

  function renderProject(s, p) {
    crumb.textContent = s.name + ' · ' + p.title;
    const i = projectIdx(s, p.id);
    const nextP = s.projects[(i + 1) % s.projects.length] || p;

    const media = (p.media || []).map(m => {
      if (m.kind === 'pair') {
        return `
          <div class="view-enter">
            <div class="pair">
              ${m.items.map(it => plateHtml(it, 'tall')).join('')}
            </div>
            ${m.caption ? `<div class="plate-caption">${m.caption}</div>` : ''}
          </div>`;
      }
      return `
        <div class="view-enter">
          ${plateHtml(m, m.shape || 'wide')}
          ${m.caption ? `<div class="plate-caption">${m.caption}</div>` : ''}
        </div>`;
    }).join('');

    main.innerHTML = `
      <div class="proj-head">
        <div class="view-enter">
          <div class="proj-svc">${s.name}</div>
          <div class="proj-client">${p.client}</div>
          <h1 class="proj-title">${p.title}</h1>
          <div class="proj-meta">
            <span>Year</span><b>${p.year}</b>
            <span>Type</span><b>${p.type}</b>
            <span>Location</span><b>${p.location}</b>
          </div>
        </div>
        <div class="proj-body view-enter d1">
          ${p.body.map(t => `<p>${t}</p>`).join('')}
        </div>
      </div>

      <div class="media">
        ${media}
      </div>

      <div class="next-link view-enter">
        <span class="label">Next in ${s.name}</span>
        <a href="#/${s.id}/${nextP.id}">${nextP.title}</a>
      </div>
    `;
  }

  // ---------- router ----------
  function render() {
    const { service, project } = parseHash();
    const s = service ? svc(service) : null;
    const p = (s && project) ? proj(s, project) : null;

    const shell = document.getElementById('shell');
    if (s && p)      shell.dataset.view = 'project';
    else if (s)      shell.dataset.view = 'service';
    else             shell.dataset.view = 'index';

    renderRail(s ? s.id : null, p ? p.id : null);

    if (s && p)      renderProject(s, p);
    else if (s)      renderService(s);
    else             renderIndex();

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  // Delegate clicks
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-route]');
    if (!t) return;
    e.preventDefault();
    const route = t.getAttribute('data-route');
    location.hash = route;
  });

  window.addEventListener('hashchange', render);
  render();
})();
