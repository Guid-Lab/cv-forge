let cvData = {};
let currentTheme = 'sidebar';
let previewMode = 'pretty';

let activeLogoMenu = null;

function closeLogoMenu() {
    if (activeLogoMenu) { activeLogoMenu.remove(); activeLogoMenu = null; }
}

document.addEventListener('click', e => {
    if (activeLogoMenu && !activeLogoMenu.contains(e.target) && !e.target.closest('.logo-clickable')) closeLogoMenu();
});

function showLogoMenu(el, opts) {
    closeLogoMenu();
    const menu = document.createElement('div');
    menu.className = 'logo-menu';

    let items = '';
    if (opts.hasUrl) {
        items += `<div class="logo-menu-item" data-action="fetch"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14.5C4.4 14.5 1.5 11.6 1.5 8S4.4 1.5 8 1.5 14.5 4.4 14.5 8 11.6 14.5 8 14.5z"/><path d="M10.3 5.3L7 8.6 5.7 7.3 4.3 8.7l2 2 .7.7.7-.7 4-4-1.4-1.4z"/></svg> ${_ui('fetchFromUrl')}</div>`;
    }
    items += `<div class="logo-menu-item" data-action="upload"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L3 5h3v6h4V5h3L8 0zM1 14h14v2H1v-2z"/></svg> ${_ui('uploadFile')}<input type="file" accept="image/*" hidden></div>`;
    if (opts.hasLogo) {
        items += `<div class="logo-menu-item logo-menu-danger" data-action="remove"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118z"/></svg> ${_ui('removeLogo')}</div>`;
    }
    menu.innerHTML = items;

    const rect = el.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.zIndex = '500';
    document.body.appendChild(menu);
    activeLogoMenu = menu;

    menu.querySelector('[data-action="upload"]')?.addEventListener('click', () => {
        const fi = menu.querySelector('input[type="file"]');
        fi.click();
        fi.onchange = () => { if (fi.files[0]) { opts.onUpload(fi.files[0]); closeLogoMenu(); } };
    });
    menu.querySelector('[data-action="fetch"]')?.addEventListener('click', () => {
        opts.onFetch(); closeLogoMenu();
    });
    menu.querySelector('[data-action="remove"]')?.addEventListener('click', () => {
        opts.onRemove(); closeLogoMenu();
    });
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function fetchLogoFromUrl(url) {
    if (!url) return null;
    showToast(_ui('toastFetchingLogo'));
    try {
        const res = await fetch('/api/fetch-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
        if (!res.ok) { showToast(_ui('toastLogoFetchFail'), true); return null; }
        const blob = await res.blob();
        const dataUrl = await fileToDataUrl(blob);
        showToast(_ui('toastLogoFetched'));
        return dataUrl;
    } catch (e) {
        showToast(_ui('toastLogoFetchFail'), true);
        return null;
    }
}

async function uploadLogoFile(file) {
    if (!file.type.startsWith('image/')) { showToast(_ui('toastInvalidFile'), true); return null; }
    if (file.size > 1024 * 1024) { showToast(_ui('toastPhotoTooBig'), true); return null; }
    try {
        return await fileToDataUrl(file);
    } catch(e) { return null; }
}

async function handlePhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast(_ui('toastInvalidFile'), true); return; }
    if (file.size > 5 * 1024 * 1024) { showToast(_ui('toastPhotoTooBig'), true); return; }
    const dataUrl = await fileToDataUrl(file);
    if (dataUrl) {
        collectData();
        cvData.personal.photo = dataUrl;
        updatePhotoPreview();
        updatePreview();
        autoSave();
        showToast(_ui('toastPhotoAdded'));
    }
    input.value = '';
}

function removePhoto() {
    collectData();
    cvData.personal.photo = '';
    updatePhotoPreview();
    updatePreview();
    autoSave();
}

function updatePhotoPreview() {
    const wrap = document.getElementById('photo-preview-wrap');
    const img = document.getElementById('photo-preview-img');
    const photo = cvData.personal && cvData.personal.photo || '';
    if (photo && photo.startsWith('data:image/')) {
        img.src = photo;
        wrap.style.display = '';
    } else {
        img.src = '';
        wrap.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    let loadedFromToken = false;
    const params = new URLSearchParams(window.location.search);
    const loadToken = params.get('load');
    if (loadToken) {
        window.history.replaceState({}, '', '/');
        try {
            const resp = await fetch('/api/load-data/' + encodeURIComponent(loadToken));
            if (resp.ok) {
                const parsed = await resp.json();
                if (parsed && typeof parsed === 'object') {
                    if (parsed.employer_groups) {
                        parsed.employer_groups.forEach(g => {
                            (g.positions || []).forEach(p => {
                                if (p.rich_description) p.rich_description = sanitizeHtml(p.rich_description);
                            });
                        });
                    }
                    if (parsed.personal && parsed.personal.photo && !parsed.personal.photo.startsWith('data:image/')) {
                        parsed.personal.photo = '';
                    }
                    cvData = parsed;
                    localStorage.setItem('cv_data', JSON.stringify(cvData));
                    loadedFromToken = true;
                }
            }
        } catch(e) {}
    }
    if (!loadedFromToken) {
        const stored = localStorage.getItem('cv_data');
        if (stored) {
            try { cvData = JSON.parse(stored); } catch(e) { cvData = {}; }
        }
    }
    if (!cvData || !cvData.personal) {
        cvData = {
            personal: { name: '', title: '', contacts: [] },
            summary: '',
            employer_groups: [],
            education: [],
            certifications: [],
            languages: [],
            skills: [],
            projects: [],
            courses: [],
            section_order: ['summary','experience','skills','projects','education','courses','certifications','languages'],
            disabled_sections: [],
            theme: 'sidebar',
            color_scheme: 'navy',
            show_company_logos: true,
            show_cert_logos: true,
            show_lang_flags: true,
        };
    }
    currentTheme = cvData.theme || 'sidebar';
    if (!cvData.color_scheme) cvData.color_scheme = 'navy';
    if (!cvData.cv_language) cvData.cv_language = 'en';
    if (!cvData.desc_format) cvData.desc_format = 'bullets';

    if ((!cvData.employer_groups || cvData.employer_groups.length === 0) && cvData.work_experience && cvData.work_experience.length > 0) {
        cvData.employer_groups = migrateWorkExperience(cvData.work_experience);
    }
    if (!cvData.employer_groups) cvData.employer_groups = [];

    if (cvData.certifications) {
        cvData.certifications.forEach(g => {
            g.items = (g.items||[]).map(item => typeof item === 'string' ? { name: item, url: '' } : item);
        });
    }

    if (!cvData.section_order) cvData.section_order = ['summary','experience','skills','projects','education','courses','certifications','languages'];
    const sectionStrings = cvData.section_order.filter(s => typeof s === 'string');
    const migrations = [
        { key: 'skills', after: 'experience' },
        { key: 'projects', after: 'skills' },
        { key: 'courses', after: 'education' },
    ];
    migrations.forEach(m => {
        if (!sectionStrings.includes(m.key)) {
            const idx = cvData.section_order.indexOf(m.after);
            cvData.section_order.splice(idx >= 0 ? idx + 1 : cvData.section_order.length, 0, m.key);
        }
    });
    if (!cvData.skills) cvData.skills = [];
    if (!cvData.projects) cvData.projects = [];
    if (!cvData.courses) cvData.courses = [];

    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === currentTheme));
    document.getElementById('toggle-company-logos').checked = cvData.show_company_logos !== false;
    document.getElementById('toggle-cert-logos').checked = cvData.show_cert_logos !== false;
    document.getElementById('toggle-lang-flags').checked = cvData.show_lang_flags !== false;

    renderCvLanguageSelector();
    renderSectionOrder();
    renderColorSchemes();
    updateTabVisibility();
    populateForm();
    applyUiLanguage();
    updatePreview();
});

function renderAll() {
    if ((!cvData.employer_groups || !cvData.employer_groups.length) && cvData.work_experience && cvData.work_experience.length > 0) {
        cvData.employer_groups = migrateWorkExperience(cvData.work_experience);
    }
    if (!cvData.employer_groups) cvData.employer_groups = [];
    if (cvData.certifications) {
        cvData.certifications.forEach(g => {
            g.items = (g.items||[]).map(item => typeof item === 'string' ? { name: item, url: '' } : item);
        });
    }
    if (!cvData.section_order) cvData.section_order = ['summary','experience','skills','projects','education','courses','certifications','languages'];
    if (!cvData.skills) cvData.skills = [];
    if (!cvData.projects) cvData.projects = [];
    if (!cvData.courses) cvData.courses = [];

    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === currentTheme));
    document.getElementById('toggle-company-logos').checked = cvData.show_company_logos !== false;
    document.getElementById('toggle-cert-logos').checked = cvData.show_cert_logos !== false;
    document.getElementById('toggle-lang-flags').checked = cvData.show_lang_flags !== false;

    renderCvLanguageSelector();
    renderSectionOrder();
    renderColorSchemes();
    updateTabVisibility();
    populateForm();
    applyUiLanguage();
    updatePreview();
}

function migrateWorkExperience(workExp) {
    const groupMap = {};
    const groupOrder = [];
    workExp.forEach(exp => {
        const company = exp.company || '';
        if (!groupMap[company]) {
            groupMap[company] = {
                id: 'g' + Date.now() + Math.random().toString(36).slice(2,6),
                group_name: company,
                logo: exp.logo || '',
                hidden: exp.hidden || false,
                positions: [],
            };
            groupOrder.push(company);
        }
        groupMap[company].positions.push({
            display_company: company,
            role: exp.role || '',
            date_from: exp.date_from || '',
            date_to: exp.date_to || '',
            bullets: exp.bullets || (exp.description ? exp.description.split(/[.;]/).map(s=>s.trim()).filter(Boolean) : []),
        });
    });
    return groupOrder.map(name => groupMap[name]);
}

function setTheme(theme, btn) {
    currentTheme = theme; cvData.theme = theme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    updatePreview();
}

function updateToggles() {
    cvData.show_company_logos = document.getElementById('toggle-company-logos').checked;
    cvData.show_cert_logos = document.getElementById('toggle-cert-logos').checked;
    cvData.show_lang_flags = document.getElementById('toggle-lang-flags').checked;
    updatePreview();
}

function switchTab(btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
}

function populateForm() {
    document.getElementById('personal-name').value = cvData.personal.name || '';
    document.getElementById('personal-title').value = cvData.personal.title || '';
    document.getElementById('summary-text').value = cvData.summary || '';
    updatePhotoPreview();
    const clauseCb = document.getElementById('toggle-clause');
    clauseCb.checked = cvData.clause_enabled || false;
    document.getElementById('clause-editor').style.display = cvData.clause_enabled ? '' : 'none';
    document.getElementById('clause-text').value = cvData.clause_text || getDefaultClause();
    renderContactsList();
    renderEmployerGroups();
    renderEducationList();
    renderSkillsList();
    renderProjectsList();
    renderCoursesList();
    renderLanguagesList();
    renderCertificationsList();
}

function collectData() {
    const contacts = [];
    document.querySelectorAll('#contacts-list .contact-row').forEach(row => {
        const icon = row.querySelector('.contact-type').value;
        const linkCb = row.querySelector('.contact-link-toggle');
        contacts.push({ type: icon, icon: icon, label: row.querySelector('.contact-label').value, value: row.querySelector('.contact-value').value, link: linkCb ? linkCb.checked : false });
    });
    const photo = cvData.personal && cvData.personal.photo || '';
    cvData.personal = { name: document.getElementById('personal-name').value, title: document.getElementById('personal-title').value, photo, contacts };
    cvData.summary = document.getElementById('summary-text').value;

    const clauseEl = document.getElementById('clause-text');
    if (clauseEl) cvData.clause_text = clauseEl.value;

    cvData.employer_groups = [];
    document.querySelectorAll('#employer-groups-list > .employer-group-card').forEach(groupEl => {
        const positions = [];
        groupEl.querySelectorAll('.position-card').forEach(posEl => {
            const fmt = posEl.dataset.format || 'bullets';
            const bullets = [];
            let richDesc = '';
            if (fmt === 'bullets') {
                posEl.querySelectorAll('.exp-bullet').forEach(inp => { if (inp.value.trim()) bullets.push(inp.value.trim()); });
            } else {
                const editor = posEl.querySelector('.pos-rich-desc');
                if (editor) richDesc = editor.innerHTML;
            }
            const posPresent = posEl.querySelector('.pos-to-present');
            const posDateTo = (posPresent && posPresent.checked) ? 'Present' : readDateFromSelects(posEl.querySelector('.pos-to'));
            positions.push({
                display_company: posEl.querySelector('.pos-display-company').value,
                role: posEl.querySelector('.pos-role').value,
                date_from: readDateFromSelects(posEl.querySelector('.pos-from')),
                date_to: posDateTo,
                desc_format: fmt,
                bullets,
                rich_description: richDesc,
            });
        });
        cvData.employer_groups.push({
            id: groupEl.dataset.id || '',
            group_name: groupEl.querySelector('.group-name-input').value,
            url: groupEl.querySelector('.group-url-input') ? groupEl.querySelector('.group-url-input').value : '',
            logo: groupEl.dataset.logo || '',
            hidden: groupEl.classList.contains('is-hidden'),
            positions,
        });
    });

    cvData.education = [];
    document.querySelectorAll('#education-list .entry-card').forEach(card => {
        const eduPresent = card.querySelector('.edu-to-present');
        const eduDateTo = (eduPresent && eduPresent.checked) ? 'Present' : readDateFromSelects(card.querySelector('.edu-to'));
        const level = card.querySelector('.edu-level') ? card.querySelector('.edu-level').value : '';
        cvData.education.push({
            institution: card.querySelector('.edu-institution').value,
            level: level,
            degree: card.querySelector('.edu-degree').value,
            date_from: readDateFromSelects(card.querySelector('.edu-from')),
            date_to: eduDateTo,
            logo: card.dataset.logo || '',
            url: card.querySelector('.edu-url') ? card.querySelector('.edu-url').value : '',
        });
    });

    const oldLangs = cvData.languages || [];
    cvData.languages = [];
    document.querySelectorAll('#languages-list .entry-card').forEach((card, i) => {
        let langName = card.querySelector('.lang-name').value;
        if (langName === '_custom') {
            const custom = card.querySelector('.lang-name-custom');
            langName = custom ? custom.value : '';
        }
        let level = card.querySelector('.lang-level').value;
        if (level === '_custom') {
            const custom = card.querySelector('.lang-level-custom');
            level = custom ? custom.value : '';
        }
        const langObj = {
            language: langName,
            level: level,
            flag: getLangFlag(langName),
        };
        if (oldLangs[i] && oldLangs[i].custom_flag) langObj.custom_flag = oldLangs[i].custom_flag;
        cvData.languages.push(langObj);
    });

    cvData.skills = [];
    document.querySelectorAll('#skills-list .skill-category-card').forEach(card => {
        const items = [];
        card.querySelectorAll('.skill-tag-input').forEach(inp => {
            if (inp.value.trim()) items.push(inp.value.trim());
        });
        cvData.skills.push({
            category: card.querySelector('.skill-category-name').value,
            items,
        });
    });

    cvData.projects = [];
    document.querySelectorAll('#projects-list .entry-card').forEach(card => {
        const present = card.querySelector('.proj-to-present');
        const dateTo = (present && present.checked) ? 'Present' : readDateFromSelects(card.querySelector('.proj-to'));
        cvData.projects.push({
            name: card.querySelector('.proj-name').value,
            url: card.querySelector('.proj-url') ? card.querySelector('.proj-url').value : '',
            role: card.querySelector('.proj-role') ? card.querySelector('.proj-role').value : '',
            date_from: readDateFromSelects(card.querySelector('.proj-from')),
            date_to: dateTo,
            description: card.querySelector('.proj-desc') ? card.querySelector('.proj-desc').value : '',
        });
    });

    cvData.courses = [];
    document.querySelectorAll('#courses-list .entry-card').forEach(card => {
        cvData.courses.push({
            name: card.querySelector('.course-name').value,
            provider: card.querySelector('.course-provider') ? card.querySelector('.course-provider').value : '',
            url: card.querySelector('.course-url') ? card.querySelector('.course-url').value : '',
            date: readDateFromSelects(card.querySelector('.course-date')),
        });
    });

    cvData.certifications = [];
    document.querySelectorAll('#certifications-list .entry-card').forEach(card => {
        const items = [];
        card.querySelectorAll('.cert-item-row').forEach(row => {
            const name = row.querySelector('.cert-item-input').value.trim();
            const urlInp = row.querySelector('.cert-item-url');
            const url = urlInp ? urlInp.value.trim() : '';
            if (name) items.push({ name, url });
        });
        cvData.certifications.push({
            issuer: card.querySelector('.cert-issuer').value,
            issuer_url: card.querySelector('.cert-issuer-url') ? card.querySelector('.cert-issuer-url').value : '',
            logo: card.dataset.logo || '',
            items,
        });
    });

    return cvData;
}

function renderContactsList() {
    const c = document.getElementById('contacts-list'); c.innerHTML = '';
    (cvData.personal.contacts || []).forEach((ct, i) => {
        const opts = getContactTypes().map(t => `<option value="${t.value}" ${t.value===ct.icon?'selected':''}>${t.label}</option>`).join('');
        const d = document.createElement('div'); d.className = 'contact-row';
        d.innerHTML = `<select class="contact-type" onchange="updatePreview()">${opts}</select>
            <input type="text" class="contact-label" value="${esc(ct.label)}" placeholder="${_ui('labelPlaceholder')}" onchange="updatePreview()">
            <input type="text" class="contact-value" value="${esc(ct.value)}" placeholder="${_ui('valuePlaceholder')}" onchange="updatePreview()">
            <label class="contact-link-wrap" title="Link"><input type="checkbox" class="contact-link-toggle" ${ct.link?'checked':''} onchange="updatePreview()"><span class="link-icon">&#128279;</span></label>
            <button class="btn-remove-item" onclick="removeContact(${i})">&times;</button>`;
        c.appendChild(d);
    });
}
function addContact() { collectData(); cvData.personal.contacts.push({type:'website',icon:'website',label:'',value:'',link:false}); renderContactsList(); updatePreview(); }
function removeContact(i) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.personal.contacts.splice(i,1); renderContactsList(); updatePreview(); }

function renderEmployerGroups() {
    const container = document.getElementById('employer-groups-list');
    container.innerHTML = '';
    (cvData.employer_groups || []).forEach((group, gi) => {
        container.appendChild(createEmployerGroupCard(group, gi));
    });
}

function createEmployerGroupCard(group, gi) {
    const card = document.createElement('div');
    card.className = 'employer-group-card' + (group.hidden ? ' is-hidden' : '');
    card.dataset.id = group.id || '';
    card.dataset.logo = group.logo || '';

    let positionsHtml = '';
    (group.positions || []).forEach((pos, pi) => {
        positionsHtml += createPositionHtml(pos, gi, pi);
    });

    const logoPreview = group.logo
        ? `<img src="${esc(group.logo)}" class="logo-thumb">`
        : `<div class="logo-placeholder" style="background:${getColor(group.group_name)}">${getInitials(group.group_name||'?')}</div>`;

    card.innerHTML = `
        <div class="group-header">
            <div class="group-logo-area logo-clickable" onclick="showGroupLogoMenu(${gi}, this)">
                <div class="group-logo-preview" id="group-logo-${gi}">${logoPreview}</div>
            </div>
            <div class="group-info">
                <input type="text" class="group-name-input" value="${esc(group.group_name)}" placeholder="${_ui('addEmployer').replace('+ ','')}" onchange="updatePreview()">
                <input type="text" class="group-url-input" value="${esc(group.url||'')}" placeholder="${_ui('employerUrl')}" onchange="updatePreview()" style="margin-top:4px;font-size:11px;padding:4px 8px;color:#666">
            </div>
            <div class="group-actions">
                <button class="btn-hide ${group.hidden?'hidden-entry':''}" onclick="toggleGroupHidden(${gi})" title="${group.hidden?_ui('showSection'):_ui('hideSection')}">${group.hidden?'&#128065;&#822;':'&#128065;'}</button>
                <button class="move-btn" onclick="moveGroup(${gi},-1)">&#9650;</button>
                <button class="move-btn" onclick="moveGroup(${gi},1)">&#9660;</button>
                <button class="btn-remove" onclick="removeGroup(${gi})">${_ui('remove')}</button>
            </div>
        </div>
        <div class="positions-list">${positionsHtml}</div>
        <button class="btn-add-position" onclick="addPosition(${gi})">${_ui('addPosition')}</button>
    `;
    return card;
}

function createPositionHtml(pos, gi, pi) {
    const fmt = pos.desc_format || 'bullets';
    const isBullets = fmt === 'bullets';

    let descEditorHtml = '';
    if (isBullets) {
        let bulletsHtml = (pos.bullets||[]).map((b,bi) =>
            `<div class="cert-item"><input type="text" class="exp-bullet" value="${esc(b)}" onchange="updatePreview()"><button class="btn-remove-item" onclick="removePosBullet(${gi},${pi},${bi})">&times;</button></div>`
        ).join('');
        descEditorHtml = `
            <div class="bullets-container">${bulletsHtml}</div>
            <button class="btn-add-cert-item" onclick="addPosBullet(${gi},${pi})">${_ui('addBullet')}</button>`;
    } else {
        const richContent = pos.rich_description || pos.bullets?.join('. ') || '';
        descEditorHtml = `
            <div class="rich-toolbar">
                <button type="button" class="rt-btn" onclick="richCmd('bold')" title="${_ui('bold')}"><b>B</b></button>
                <button type="button" class="rt-btn" onclick="richCmd('italic')" title="${_ui('italic')}"><i>I</i></button>
                <button type="button" class="rt-btn" onclick="richCmd('underline')" title="${_ui('underline')}"><u>U</u></button>
                <span class="rt-sep"></span>
                <button type="button" class="rt-btn" onclick="richCmd('insertUnorderedList')" title="${_ui('bulletList')}">&#8226;</button>
                <button type="button" class="rt-btn" onclick="richCmd('insertOrderedList')" title="${_ui('numberedList')}">1.</button>
            </div>
            <div class="rich-editor pos-rich-desc" contenteditable="true" data-gi="${gi}" data-pi="${pi}">${richContent}</div>`;
    }

    return `<div class="position-card" data-format="${fmt}">
        <div class="position-header">
            <span class="position-title">${esc(pos.display_company)} - ${esc(pos.role)}</span>
            <div class="entry-card-actions">
                <button class="move-btn" onclick="movePosition(${gi},${pi},-1)">&#9650;</button>
                <button class="move-btn" onclick="movePosition(${gi},${pi},1)">&#9660;</button>
                <button class="btn-remove" onclick="removePosition(${gi},${pi})">${_ui('remove')}</button>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>${_ui('companyName')}</label><input type="text" class="pos-display-company" value="${esc(pos.display_company || g.group_name || '')}" onchange="updatePreview()"></div>
        </div>
        <div class="form-group"><label>${_ui('position')}</label><input type="text" class="pos-role" value="${esc(pos.role)}" onchange="updatePreview()"></div>
        <div class="form-row">
            <div class="form-group"><label>${_ui('dateFrom')}</label>${makeDateFromHtml('pos-from', pos.date_from)}</div>
            <div class="form-group"><label>${_ui('dateTo')}</label>${makeDateToHtml('pos-to', pos.date_to, gi, pi)}</div>
        </div>
        <div class="form-group">
            <div class="desc-format-toggle">
                <label>${_ui('description')}</label>
                <div class="desc-toggle-btns">
                    <button type="button" class="dtb ${isBullets?'active':''}" onclick="setPosDescFormat(${gi},${pi},'bullets')">&#8226; ${_ui('bulletPoints')}</button>
                    <button type="button" class="dtb ${!isBullets?'active':''}" onclick="setPosDescFormat(${gi},${pi},'paragraph')">&#182; ${_ui('paragraph')}</button>
                </div>
            </div>
            ${descEditorHtml}
        </div>
    </div>`;
}

function richCmd(cmd) {
    document.execCommand(cmd, false, null);
}

document.addEventListener('paste', e => {
    const el = e.target.closest('[contenteditable="true"]');
    if (!el) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, sanitizeHtml(text));
});

document.addEventListener('input', e => {
    if (e.target.closest('[contenteditable="true"]')) debouncePreview();
});

function setPosDescFormat(gi, pi, fmt) {
    collectData();
    const pos = cvData.employer_groups[gi].positions[pi];
    if (fmt === 'paragraph' && pos.desc_format !== 'paragraph') {
        pos.rich_description = pos.bullets ? pos.bullets.join('. ') + '.' : '';
    } else if (fmt === 'bullets' && pos.desc_format === 'paragraph') {
        const text = (pos.rich_description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        pos.bullets = text.split(/\.\s+/).map(s => s.replace(/\.$/,'').trim()).filter(Boolean);
        pos.rich_description = '';
    }
    pos.desc_format = fmt;
    renderEmployerGroups();
    updatePreview();
}

function addEmployerGroup() {
    collectData();
    cvData.employer_groups.push({ id: 'g'+Date.now()+'_'+Math.random().toString(36).slice(2,6), group_name: '', url: '', logo: '', hidden: false, positions: [{ display_company: '', role: '', date_from: '', date_to: '', bullets: [''] }] });
    renderEmployerGroups(); updatePreview();
}
function removeGroup(gi) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.employer_groups.splice(gi,1); renderEmployerGroups(); updatePreview(); }
function toggleGroupHidden(gi) { collectData(); cvData.employer_groups[gi].hidden = !cvData.employer_groups[gi].hidden; renderEmployerGroups(); updatePreview(); }
function moveGroup(gi, dir) {
    collectData(); const arr = cvData.employer_groups; const ni = gi+dir;
    if (ni<0||ni>=arr.length) return; [arr[gi],arr[ni]]=[arr[ni],arr[gi]];
    renderEmployerGroups(); updatePreview();
}
function addPosition(gi) { collectData(); cvData.employer_groups[gi].positions.push({display_company:cvData.employer_groups[gi].group_name,role:'',date_from:'',date_to:'',bullets:['']}); renderEmployerGroups(); updatePreview(); }
function removePosition(gi,pi) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.employer_groups[gi].positions.splice(pi,1); renderEmployerGroups(); updatePreview(); }
function movePosition(gi,pi,dir) {
    collectData(); const arr = cvData.employer_groups[gi].positions; const ni = pi+dir;
    if (ni<0||ni>=arr.length) return; [arr[pi],arr[ni]]=[arr[ni],arr[pi]];
    renderEmployerGroups(); updatePreview();
}
function addPosBullet(gi,pi) { collectData(); cvData.employer_groups[gi].positions[pi].bullets.push(''); renderEmployerGroups(); updatePreview(); }
function removePosBullet(gi,pi,bi) { collectData(); cvData.employer_groups[gi].positions[pi].bullets.splice(bi,1); renderEmployerGroups(); updatePreview(); }

function sortGroupsByDate() {
    collectData();
    const parseDate = s => {
        if (!s||s.toLowerCase()==='present') return new Date(9999,0);
        const n = dateToNum(s);
        if (n > 0 && n < 999912) return new Date(Math.floor(n/100), (n%100)-1);
        if (/^\d{4}-\d{2}$/.test(s)) { const [y,mo]=s.split('-'); return new Date(parseInt(y),parseInt(mo)-1); }
        const p = s.split(' ');
        return new Date(parseInt(p[p.length-1])||0, 0);
    };
    cvData.employer_groups.sort((a,b) => {
        const aD = a.positions.length ? parseDate(a.positions[0].date_to) : new Date(0);
        const bD = b.positions.length ? parseDate(b.positions[0].date_to) : new Date(0);
        return bD - aD;
    });
    renderEmployerGroups(); updatePreview();
    showToast(_ui('toastSorted'));
}

function showGroupLogoMenu(gi, el) {
    collectData();
    const group = cvData.employer_groups[gi];
    showLogoMenu(el, {
        hasLogo: !!group.logo,
        hasUrl: !!group.url,
        onUpload: async (file) => {
            const url = await uploadLogoFile(file);
            if (url) { collectData(); cvData.employer_groups[gi].logo = url; renderEmployerGroups(); updatePreview(); showToast(_ui('toastLogoUploaded')); }
        },
        onFetch: async () => {
            const url = await fetchLogoFromUrl(cvData.employer_groups[gi].url);
            if (url) { collectData(); cvData.employer_groups[gi].logo = url; renderEmployerGroups(); updatePreview(); }
        },
        onRemove: () => { collectData(); cvData.employer_groups[gi].logo = ''; renderEmployerGroups(); updatePreview(); showToast(_ui('toastLogoRemoved')); },
    });
}

function renderEducationList() {
    const c = document.getElementById('education-list'); c.innerHTML = '';
    (cvData.education||[]).forEach((edu,i) => {
        const card = document.createElement('div'); card.className = 'entry-card';
        card.dataset.logo = edu.logo || '';

        const logoPreview = edu.logo
            ? `<img src="${esc(edu.logo)}" class="logo-thumb-sm">`
            : `<div class="logo-placeholder-sm" style="background:${getColor(edu.institution)}">${getInitials(edu.institution||'?')}</div>`;

        card.innerHTML = `<div class="entry-card-header">
            <div style="display:flex;align-items:center;gap:8px">
                <div class="cert-logo-area logo-clickable" onclick="showEduLogoMenu(${i}, this)">
                    ${logoPreview}
                </div>
                <span class="entry-card-title">${edu.institution||_ui('noName')}</span>
            </div>
            <div class="entry-card-actions"><button class="btn-remove" onclick="removeEducation(${i})">${_ui('remove')}</button></div></div>
            <div class="form-group"><label>${_ui('tabEducation')}</label><input type="text" class="edu-institution" value="${esc(edu.institution)}" onchange="updateCardTitle(this);updatePreview()"></div>
            <div class="form-group"><label>${_ui('institutionUrl')}</label><input type="text" class="edu-url" value="${esc(edu.url||'')}" placeholder="https://..." onchange="updatePreview()" style="font-size:11px;padding:5px 8px;color:#666"></div>
            <div class="form-row">
                <div class="form-group"><label>${_ui('degree')}</label><input type="text" class="edu-level" value="${esc(edu.level||'')}" placeholder="${_ui('degreeHint')}" onchange="updatePreview()"></div>
                <div class="form-group"><label>${_ui('field')}</label><input type="text" class="edu-degree" value="${esc(edu.degree)}" onchange="updatePreview()"></div>
            </div>
            <div class="form-row"><div class="form-group"><label>${_ui('dateFrom')}</label>${makeDateFromHtml('edu-from', edu.date_from)}</div>
            <div class="form-group"><label>${_ui('dateTo')}</label>${makeDateToHtml('edu-to', edu.date_to, i)}</div></div>`;
        c.appendChild(card);
    });
}

function showEduLogoMenu(i, el) {
    collectData();
    const edu = cvData.education[i];
    showLogoMenu(el, {
        hasLogo: !!edu.logo,
        hasUrl: !!edu.url,
        onUpload: async (file) => {
            const url = await uploadLogoFile(file);
            if (url) { collectData(); cvData.education[i].logo = url; renderEducationList(); updatePreview(); showToast(_ui('toastLogoUploaded')); }
        },
        onFetch: async () => {
            const url = await fetchLogoFromUrl(cvData.education[i].url);
            if (url) { collectData(); cvData.education[i].logo = url; renderEducationList(); updatePreview(); }
        },
        onRemove: () => { collectData(); cvData.education[i].logo = ''; renderEducationList(); updatePreview(); showToast(_ui('toastLogoRemoved')); },
    });
}
function addEducation() { collectData(); cvData.education.push({institution:'',degree:'',date_from:'',date_to:'',logo:''}); renderEducationList(); updatePreview(); }
function removeEducation(i) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.education.splice(i,1); renderEducationList(); updatePreview(); }

function renderLanguagesList() {
    const c = document.getElementById('languages-list'); c.innerHTML = '';
    (cvData.languages||[]).forEach((lang,i) => {
        if (!lang.flag && lang.language) lang.flag = getLangFlag(lang.language);

        const langOpts = LANGUAGES_DB.map(l =>
            `<option value="${l.name}" ${l.name===lang.language?'selected':''}>${l.name}</option>`
        ).join('');
        const levelOpts = PROFICIENCY_LEVELS.map(lv =>
            `<option value="${lv}" ${lv===lang.level?'selected':''}>${lv}</option>`
        ).join('');
        const flagPreview = (lang.flag && FLAGS[lang.flag]) ? FLAGS[lang.flag] : '';

        const isCustomLang = LANGUAGES_DB.every(l => l.name !== lang.language);
        const hasBuiltinFlag = lang.flag && FLAGS[lang.flag];
        const customFlagUrl = lang.custom_flag || '';

        let flagUploadHtml = '';
        if (isCustomLang || !hasBuiltinFlag) {
            const currentCustomFlag = customFlagUrl
                ? `<img src="${esc(customFlagUrl)}" style="width:22px;height:14px;object-fit:cover;border-radius:2px;border:1px solid #eee">`
                : '<span style="font-size:10px;color:#aaa">brak</span>';
            flagUploadHtml = `<div class="form-group" style="flex:0 0 auto">
                <label>Flaga</label>
                <div class="custom-flag-upload">
                    <span class="cfu-preview">${currentCustomFlag}</span>
                    <label class="cfu-btn" title="${_ui('uploadFile')} (max 128x96px)">
                        <input type="file" accept="image/*" onchange="uploadLangFlag(${i}, this)" hidden>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L3 5h3v6h4V5h3L8 0zM1 14h14v2H1v-2z"/></svg>
                    </label>
                </div>
                <span style="font-size:9px;color:#aaa">max 128x96px</span>
            </div>`;
        }

        const card = document.createElement('div'); card.className = 'entry-card';
        card.innerHTML = `<div class="entry-card-header">
            <div style="display:flex;align-items:center;gap:8px">
                <span class="lang-flag-preview">${flagPreview}</span>
                <span class="entry-card-title">${lang.language||_ui('noName')}</span>
            </div>
            <div class="entry-card-actions"><button class="btn-remove" onclick="removeLanguage(${i})">${_ui('remove')}</button></div></div>
            <div class="form-row">
                <div class="form-group"><label>${_ui('tabLanguages')}</label>
                    <select class="lang-name" onchange="onLangChange(${i}, this)">${langOpts}<option value="_custom" ${isCustomLang?'selected':''}>Other...</option></select>
                    ${isCustomLang?`<input type="text" class="lang-name-custom" value="${esc(lang.language)}" placeholder="${_ui('typeName')}" style="margin-top:4px" onchange="updatePreview()">`:''}</div>
                <div class="form-group"><label>Level</label>
                    <select class="lang-level" onchange="updatePreview()">${levelOpts}<option value="_custom" ${PROFICIENCY_LEVELS.every(lv=>lv!==lang.level)?'selected':''}>Other...</option></select>
                    ${PROFICIENCY_LEVELS.every(lv=>lv!==lang.level)?`<input type="text" class="lang-level-custom" value="${esc(lang.level)}" placeholder="${_ui('typeLevel')}" style="margin-top:4px" onchange="updatePreview()">`:''}</div>
                ${flagUploadHtml}
            </div>`;
        c.appendChild(card);
    });
}

function onLangChange(i, sel) {
    collectData();
    const langName = sel.value;
    if (langName === '_custom') {
        cvData.languages[i].language = '';
        cvData.languages[i].flag = '';
        cvData.languages[i].custom_flag = '';
    } else {
        cvData.languages[i].language = langName;
        cvData.languages[i].flag = getLangFlag(langName);
    }
    renderLanguagesList();
    updatePreview();
}

async function uploadLangFlag(i, input) {
    const file = input.files[0]; if (!file) return;
    const img = new Image();
    img.onload = async () => {
        URL.revokeObjectURL(img.src);
        if (img.width > 128 || img.height > 96) {
            showToast(`${_ui('toastFlagTooBig')} (${img.width}x${img.height}). Max: 128x96px`, true);
            return;
        }
        const dataUrl = await fileToDataUrl(file);
        if (dataUrl) {
            collectData();
            cvData.languages[i].custom_flag = dataUrl;
            cvData.languages[i].flag = '';
            renderLanguagesList(); updatePreview();
            showToast(_ui('toastFlagUploaded'));
        }
    };
    img.src = URL.createObjectURL(file);
}
function addLanguage() { collectData(); cvData.languages.push({language:'',level:'',flag:''}); renderLanguagesList(); updatePreview(); }
function removeLanguage(i) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.languages.splice(i,1); renderLanguagesList(); updatePreview(); }

function renderSkillsList() {
    const c = document.getElementById('skills-list'); c.innerHTML = '';
    (cvData.skills||[]).forEach((cat, ci) => {
        const card = document.createElement('div');
        card.className = 'entry-card skill-category-card';
        let tagsHtml = '';
        (cat.items||[]).forEach((item, ii) => {
            tagsHtml += `<div class="skill-tag-row">
                <input type="text" class="skill-tag-input" value="${esc(item)}" placeholder="${_ui('skill')}" onchange="updatePreview()">
                <button class="btn-remove-item" onclick="removeSkillItem(${ci},${ii})">&times;</button>
            </div>`;
        });
        card.innerHTML = `
            <div class="card-header">
                <input type="text" class="skill-category-name" value="${esc(cat.category)}" placeholder="${_ui('categoryName')}" onchange="updatePreview()">
                <div class="card-actions">
                    <button class="btn-move" onclick="moveSkillCategory(${ci},-1)">&#9650;</button>
                    <button class="btn-move" onclick="moveSkillCategory(${ci},1)">&#9660;</button>
                    <button class="btn-remove" onclick="removeSkillCategory(${ci})">${_ui('remove')}</button>
                </div>
            </div>
            <div class="skill-tags-list">${tagsHtml}</div>
            <button class="btn-add-cert-item" onclick="addSkillItem(${ci})">+ ${_ui('skill')}</button>`;
        c.appendChild(card);
    });
}
function addSkillCategory() { collectData(); if(!cvData.skills) cvData.skills=[]; cvData.skills.push({category:'',items:['']});renderSkillsList();updatePreview(); }
function removeSkillCategory(ci) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.skills.splice(ci,1); renderSkillsList(); updatePreview(); }
function moveSkillCategory(ci,dir) { collectData(); const a=cvData.skills,ni=ci+dir; if(ni<0||ni>=a.length)return; [a[ci],a[ni]]=[a[ni],a[ci]]; renderSkillsList(); updatePreview(); }
function addSkillItem(ci) { collectData(); cvData.skills[ci].items.push(''); renderSkillsList(); updatePreview(); }
function removeSkillItem(ci,ii) { collectData(); cvData.skills[ci].items.splice(ii,1); renderSkillsList(); updatePreview(); }

function renderProjectsList() {
    const c = document.getElementById('projects-list'); c.innerHTML = '';
    (cvData.projects||[]).forEach((proj, i) => {
        const card = document.createElement('div');
        card.className = 'entry-card';
        card.innerHTML = `
            <div class="entry-card-header">
                <span class="entry-card-title">${_ui('tabProjects')} ${i+1}</span>
                <div class="entry-card-actions">
                    <button class="move-btn" onclick="moveProject(${i},-1)">&#9650;</button>
                    <button class="move-btn" onclick="moveProject(${i},1)">&#9660;</button>
                    <button class="btn-remove" onclick="removeProject(${i})">${_ui('remove')}</button>
                </div>
            </div>
            <div class="form-group"><label>${_ui('tabProjects')}</label><input type="text" class="proj-name" value="${esc(proj.name)}" onchange="updatePreview()"></div>
            <div class="form-group"><label>${_ui('projectRole')}</label><input type="text" class="proj-role" value="${esc(proj.role||'')}" placeholder="${_ui('projectRoleHint')}" onchange="updatePreview()"></div>
            <div class="form-group"><label>${_ui('projectUrl')}</label><input type="text" class="proj-url" value="${esc(proj.url||'')}" placeholder="https://..." onchange="updatePreview()"></div>
            <div class="form-row">
                <div class="form-group"><label>${_ui('dateFrom')}</label>${makeDateFromHtml('proj-from', proj.date_from)}</div>
                <div class="form-group"><label>${_ui('dateTo')}</label>${makeDateToHtml('proj-to', proj.date_to, i)}</div>
            </div>
            <div class="form-group"><label>${_ui('description')}</label><textarea class="proj-desc" rows="3" onchange="updatePreview()">${esc(proj.description||'')}</textarea></div>`;
        c.appendChild(card);
    });
}
function addProject() { collectData(); if(!cvData.projects) cvData.projects=[]; cvData.projects.push({name:'',role:'',url:'',date_from:'',date_to:'',description:''}); renderProjectsList(); updatePreview(); }
function removeProject(i) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.projects.splice(i,1); renderProjectsList(); updatePreview(); }
function moveProject(i,dir) { collectData(); const a=cvData.projects,ni=i+dir; if(ni<0||ni>=a.length)return; [a[i],a[ni]]=[a[ni],a[i]]; renderProjectsList(); updatePreview(); }

function renderCoursesList() {
    const c = document.getElementById('courses-list'); c.innerHTML = '';
    (cvData.courses||[]).forEach((course, i) => {
        const card = document.createElement('div');
        card.className = 'entry-card';
        card.innerHTML = `
            <div class="entry-card-header">
                <span class="entry-card-title">${_ui('tabCourses')} ${i+1}</span>
                <div class="entry-card-actions">
                    <button class="move-btn" onclick="moveCourse(${i},-1)">&#9650;</button>
                    <button class="move-btn" onclick="moveCourse(${i},1)">&#9660;</button>
                    <button class="btn-remove" onclick="removeCourse(${i})">${_ui('remove')}</button>
                </div>
            </div>
            <div class="form-group"><label>${_ui('tabCourses')}</label><input type="text" class="course-name" value="${esc(course.name)}" onchange="updatePreview()"></div>
            <div class="form-row">
                <div class="form-group"><label>${_ui('courseProvider')}</label><input type="text" class="course-provider" value="${esc(course.provider||'')}" placeholder="${_ui('courseProviderHint')}" onchange="updatePreview()"></div>
                <div class="form-group"><label>${_ui('dateTo')}</label>${makeDateFromHtml('course-date', course.date||'')}</div>
            </div>
            <div class="form-group"><label>${_ui('courseUrl')}</label><input type="text" class="course-url" value="${esc(course.url||'')}" placeholder="https://..." onchange="updatePreview()"></div>`;
        c.appendChild(card);
    });
}
function addCourse() { collectData(); if(!cvData.courses) cvData.courses=[]; cvData.courses.push({name:'',provider:'',url:'',date:''}); renderCoursesList(); updatePreview(); }
function removeCourse(i) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.courses.splice(i,1); renderCoursesList(); updatePreview(); }
function moveCourse(i,dir) { collectData(); const a=cvData.courses,ni=i+dir; if(ni<0||ni>=a.length)return; [a[i],a[ni]]=[a[ni],a[i]]; renderCoursesList(); updatePreview(); }

function renderCertificationsList() {
    const c = document.getElementById('certifications-list'); c.innerHTML = '';
    (cvData.certifications||[]).forEach((g,gi) => {
        const card = document.createElement('div'); card.className = 'entry-card'; card.dataset.logo = g.logo||'';
        let itemsHtml = (g.items||[]).map((item,ii) => {
            const name = typeof item === 'string' ? item : (item.name || '');
            const url = typeof item === 'string' ? '' : (item.url || '');
            return `<div class="cert-item-row">
                <div class="cert-item"><input type="text" class="cert-item-input" value="${esc(name)}" onchange="updatePreview()"><button class="btn-remove-item" onclick="removeCertItem(${gi},${ii})">&times;</button></div>
                <input type="text" class="cert-item-url" value="${esc(url)}" placeholder="${_ui('verificationUrl')}" onchange="updatePreview()" style="width:100%;font-size:10px;padding:3px 8px;color:#888;border:1px solid #eee;border-radius:4px;margin-bottom:4px">
            </div>`;
        }).join('');

        const logoPreview = g.logo
            ? `<img src="${esc(g.logo)}" class="logo-thumb-sm">`
            : `<div class="logo-placeholder-sm" style="background:${getColor(g.issuer)}">${getInitials(g.issuer||'?')}</div>`;

        card.innerHTML = `<div class="entry-card-header">
            <div style="display:flex;align-items:center;gap:8px">
                <div class="cert-logo-area logo-clickable" id="cert-logo-${gi}" onclick="showCertLogoMenu(${gi}, this)">${logoPreview}
                </div>
                <span class="entry-card-title">${g.issuer||_ui('noName')}</span>
            </div>
            <div class="entry-card-actions">
                <button class="move-btn" onclick="moveCertGroup(${gi},-1)">&#9650;</button>
                <button class="move-btn" onclick="moveCertGroup(${gi},1)">&#9660;</button>
                <button class="btn-remove" onclick="removeCertGroup(${gi})">${_ui('remove')}</button>
            </div></div>
            <div class="form-group"><label>${_ui('tabCertifications')}</label><input type="text" class="cert-issuer" value="${esc(g.issuer)}" onchange="updateCardTitle(this);updatePreview()"></div>
            <div class="form-group"><label>${_ui('issuerUrl')}</label><input type="text" class="cert-issuer-url" value="${esc(g.issuer_url||'')}" placeholder="https://..." onchange="updatePreview()" style="font-size:11px;padding:5px 8px;color:#666"></div>
            <div class="form-group"><label>${_ui('tabCertifications')}</label><div>${itemsHtml}</div><button class="btn-add-cert-item" onclick="addCertItem(${gi})">+ ${_ui('tabCertifications')}</button></div>`;
        c.appendChild(card);
    });
}
function addCertGroup() { collectData(); cvData.certifications.push({issuer:'',issuer_url:'',logo:'',items:[{name:'',url:''}]}); renderCertificationsList(); updatePreview(); }
function removeCertGroup(gi) { if (!confirm(_ui('remove')+'?')) return; collectData(); cvData.certifications.splice(gi,1); renderCertificationsList(); updatePreview(); }
function moveCertGroup(gi,dir) { collectData(); const a=cvData.certifications,ni=gi+dir; if(ni<0||ni>=a.length)return; [a[gi],a[ni]]=[a[ni],a[gi]]; renderCertificationsList(); updatePreview(); }
function addCertItem(gi) { collectData(); cvData.certifications[gi].items.push({name:'',url:''}); renderCertificationsList(); updatePreview(); }
function removeCertItem(gi,ii) { collectData(); cvData.certifications[gi].items.splice(ii,1); renderCertificationsList(); updatePreview(); }

function showCertLogoMenu(gi, el) {
    collectData();
    const g = cvData.certifications[gi];
    const fetchUrl = g.issuer_url || ((g.issuer || '').trim().toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'') + '.com');
    showLogoMenu(el, {
        hasLogo: !!g.logo,
        hasUrl: !!(g.issuer_url || g.issuer),
        onUpload: async (file) => {
            const url = await uploadLogoFile(file);
            if (url) { collectData(); cvData.certifications[gi].logo = url; renderCertificationsList(); updatePreview(); showToast(_ui('toastLogoUploaded')); }
        },
        onFetch: async () => {
            const url = await fetchLogoFromUrl(fetchUrl);
            if (url) { collectData(); cvData.certifications[gi].logo = url; renderCertificationsList(); updatePreview(); }
        },
        onRemove: () => { collectData(); cvData.certifications[gi].logo = ''; renderCertificationsList(); updatePreview(); showToast(_ui('toastLogoRemoved')); },
    });
}

function updateCardTitle(inp) {
    const card = inp.closest('.entry-card,.employer-group-card');
    const title = card.querySelector('.entry-card-title');
    if (title) title.textContent = inp.value || _ui('noName');
}

function getSectionLabel(key) {
    const map = {
        summary: 'secSummary', experience: 'secExperience', skills: 'secSkills',
        projects: 'secProjects', courses: 'secCourses', education: 'secEducation',
        certifications: 'secCertifications', languages: 'secLanguages',
    };
    return _ui(map[key] || key);
}

const TAB_SECTION_MAP = {
    summary: 'summary',
    experience: 'experience',
    skills: 'skills',
    projects: 'projects',
    courses: 'courses',
    education: 'education',
    certifications: 'certifications',
    languages: 'languages',
};

function isSectionEnabled(key) {
    const disabled = cvData.disabled_sections || [];
    return !disabled.includes(key);
}

function toggleSection(key, enabled) {
    if (!cvData.disabled_sections) cvData.disabled_sections = [];
    if (enabled) {
        cvData.disabled_sections = cvData.disabled_sections.filter(s => s !== key);
    } else {
        if (!cvData.disabled_sections.includes(key)) cvData.disabled_sections.push(key);
    }
    renderSectionOrder();
    updateTabVisibility();
    updatePreview();
    scheduleAutoSave();
}

function updateTabVisibility() {
    document.querySelectorAll('#panel-tabs .tab').forEach(btn => {
        const tab = btn.dataset.tab;
        if (tab === 'settings' || tab === 'personal') return;
        if (TAB_SECTION_MAP[tab]) {
            btn.style.display = isSectionEnabled(tab) ? '' : 'none';
            if (!isSectionEnabled(tab) && btn.classList.contains('active')) {
                const settingsBtn = document.querySelector('.tab[data-tab="settings"]');
                if (settingsBtn) switchTab(settingsBtn);
            }
        }
    });
}

function renderSectionOrder() {
    const c = document.getElementById('section-order-list'); if (!c) return;
    c.innerHTML = '';
    (cvData.section_order||[]).forEach((sec, i) => {
        const div = document.createElement('div');
        div.dataset.soiIndex = i;
        if (typeof sec === 'object' && sec.type) {
            div.className = 'section-order-item soi-separator';
            const isLine = sec.type === 'line';
            div.innerHTML = `
                <span class="soi-drag-handle" title="${_ui('dragHint')}">⠿</span>
                <span class="soi-label soi-sep-label">${isLine ? _ui('sepLine') : _ui('sepSpace')}</span>
                <div class="soi-actions">
                    <input type="number" class="soi-height" value="${sec.height||10}" min="2" max="80" onchange="setSepHeight(${i}, this.value)" title="px">
                    <span style="font-size:10px;color:#aaa">px</span>
                    <button class="move-btn" onclick="moveSectionOrder(${i},-1)">&#9650;</button>
                    <button class="move-btn" onclick="moveSectionOrder(${i},1)">&#9660;</button>
                    <button class="btn-remove-item" onclick="removeSectionItem(${i})" title="${_ui('remove')}">&times;</button>
                </div>`;
        } else {
            const enabled = isSectionEnabled(sec);
            div.className = 'section-order-item' + (enabled ? '' : ' soi-disabled');
            div.innerHTML = `
                <span class="soi-drag-handle" title="${_ui('dragHint')}">⠿</span>
                <button class="soi-eye${enabled ? '' : ' soi-eye-off'}" onclick="toggleSection('${sec}', ${!enabled})" title="${enabled ? _ui('hideSection') : _ui('showSection')}">
                    ${enabled
                        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3C4.4 3 1.3 5.1 0 8c1.3 2.9 4.4 5 8 5s6.7-2.1 8-5c-1.3-2.9-4.4-5-8-5zm0 8.3A3.3 3.3 0 118 4.7a3.3 3.3 0 010 6.6zm0-5.3a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/></svg>'
                        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4.7c1.8 0 3.3 1.5 3.3 3.3 0 .4-.1.8-.2 1.2l1.9 1.9c1-.8 1.8-1.9 2.3-3.1-1.3-2.9-4.4-5-8-5-.9 0-1.7.1-2.5.4l1.4 1.4c.4-.1.8-.1 1.2-.1zM1.3 2l1.5 1.5.3.3C2 4.7 1.2 5.8.7 7c1.3 2.9 4.4 5 8 5 1 0 2-.2 2.9-.5l.3.3 1.9 1.9.8-.8L2.1 1.2 1.3 2zm3.5 3.5l1 1c0 .2-.1.3-.1.5a2 2 0 002 2c.2 0 .3 0 .5-.1l1 1c-.4.2-.9.4-1.5.4A3.3 3.3 0 014.7 7c0-.6.1-1.1.4-1.5z" fill="currentColor"/></svg>'
                    }
                </button>
                <span class="soi-label">${getSectionLabel(sec)}</span>
                <div class="soi-actions">
                    <button class="move-btn" onclick="moveSectionOrder(${i},-1)">&#9650;</button>
                    <button class="move-btn" onclick="moveSectionOrder(${i},1)">&#9660;</button>
                </div>`;
        }
        c.appendChild(div);
    });

    const btns = document.createElement('div');
    btns.className = 'soi-add-btns';
    btns.innerHTML = `
        <button class="btn-add-cert-item" onclick="addSeparator('line')">${_ui('addLine')}</button>
        <button class="btn-add-cert-item" onclick="addSeparator('space')">${_ui('addSpace')}</button>`;
    c.appendChild(btns);

    initSectionDragDrop(c);
}

function initSectionDragDrop(container) {
    const getItems = () => Array.from(container.querySelectorAll('.section-order-item'));
    let startY = 0, startIdx = -1, clone = null, placeholder = null, currentOver = -1;

    getItems().forEach(item => {
        const handle = item.querySelector('.soi-drag-handle');
        if (!handle) return;

        handle.addEventListener('pointerdown', e => {
            e.preventDefault();
            startIdx = parseInt(item.dataset.soiIndex);
            startY = e.clientY;

            const rect = item.getBoundingClientRect();
            clone = item.cloneNode(true);
            clone.className = 'section-order-item soi-clone';
            clone.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;z-index:999;pointer-events:none;opacity:0.85;box-shadow:0 4px 16px rgba(0,0,0,0.2);`;
            document.body.appendChild(clone);

            item.classList.add('soi-dragging');
            currentOver = startIdx;

            const onMove = ev => {
                ev.preventDefault();
                const dy = ev.clientY - startY;
                clone.style.top = (rect.top + dy) + 'px';

                const items = getItems();
                let overIdx = -1;
                for (let i = 0; i < items.length; i++) {
                    const r = items[i].getBoundingClientRect();
                    if (ev.clientY >= r.top && ev.clientY < r.bottom) { overIdx = i; break; }
                }
                if (overIdx === -1) return;

                items.forEach(el => el.classList.remove('soi-drag-above', 'soi-drag-below'));
                if (overIdx !== startIdx) {
                    const r2 = items[overIdx].getBoundingClientRect();
                    const mid = r2.top + r2.height / 2;
                    if (ev.clientY < mid) {
                        items[overIdx].classList.add('soi-drag-above');
                    } else {
                        items[overIdx].classList.add('soi-drag-below');
                    }
                }
                currentOver = overIdx;
            };

            const onUp = ev => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                if (clone) { clone.remove(); clone = null; }
                item.classList.remove('soi-dragging');
                getItems().forEach(el => el.classList.remove('soi-drag-above', 'soi-drag-below'));

                if (currentOver !== -1 && currentOver !== startIdx) {
                    const items = getItems();
                    const r = items[currentOver].getBoundingClientRect();
                    const mid = r.top + r.height / 2;
                    const above = ev.clientY < mid;

                    const arr = cvData.section_order;
                    const moved = arr.splice(startIdx, 1)[0];
                    let insertAt = currentOver;
                    if (startIdx < currentOver) insertAt--;
                    if (!above) insertAt++;
                    arr.splice(insertAt, 0, moved);
                    renderSectionOrder();
                    updatePreview();
                }
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
        });
    });
}

function moveSectionOrder(i, dir) {
    const arr = cvData.section_order; const ni = i+dir;
    if (ni<0||ni>=arr.length) return;
    [arr[i],arr[ni]]=[arr[ni],arr[i]];
    renderSectionOrder(); updatePreview();
}

function addSeparator(type) {
    cvData.section_order.push({ type, height: type === 'line' ? 12 : 20 });
    renderSectionOrder(); updatePreview();
}

function removeSectionItem(i) {
    cvData.section_order.splice(i, 1);
    renderSectionOrder(); updatePreview();
}

function setSepHeight(i, val) {
    const item = cvData.section_order[i];
    if (typeof item === 'object') {
        item.height = Math.max(2, Math.min(80, parseInt(val) || 10));
    }
    updatePreview();
}

function renderCvLanguageSelector() {
    const c = document.getElementById('cv-language-selector'); if (!c) return;
    c.innerHTML = '';
    Object.entries(CV_LANGUAGES).forEach(([code, lang]) => {
        const btn = document.createElement('button');
        btn.className = 'cv-lang-btn' + ((cvData.cv_language||'en')===code?' active':'');
        const flagSvg = FLAGS[lang.flag] || '';
        btn.innerHTML = `${flagSvg} ${lang.label}`;
        btn.onclick = () => setCvLanguage(code);
        c.appendChild(btn);
    });
}

function setCvLanguage(code) {
    const oldLang = cvData.cv_language || 'en';
    const oldDefault = CLAUSE_DEFAULTS[oldLang] || CLAUSE_DEFAULTS.en;
    cvData.cv_language = code;
    const clauseEl = document.getElementById('clause-text');
    const currentText = clauseEl ? clauseEl.value : (cvData.clause_text || '');
    if (!currentText || currentText === oldDefault) {
        cvData.clause_text = CLAUSE_DEFAULTS[code] || CLAUSE_DEFAULTS.en;
        if (clauseEl) clauseEl.value = cvData.clause_text;
    }
    renderCvLanguageSelector();
    updatePreview();
}

function toggleClause() {
    const cb = document.getElementById('toggle-clause');
    cvData.clause_enabled = cb.checked;
    const editor = document.getElementById('clause-editor');
    editor.style.display = cb.checked ? '' : 'none';
    if (cb.checked && !cvData.clause_text) {
        cvData.clause_text = getDefaultClause();
        document.getElementById('clause-text').value = cvData.clause_text;
    }
    updatePreview();
}

function resetClauseToDefault() {
    cvData.clause_text = getDefaultClause();
    document.getElementById('clause-text').value = cvData.clause_text;
    updatePreview();
    showToast(_ui('toastClauseReset'));
}

function renderColorSchemes() {
    const c = document.getElementById('color-scheme-list'); if (!c) return;
    c.innerHTML = '';
    Object.entries(COLOR_SCHEMES).forEach(([key, scheme]) => {
        const div = document.createElement('button');
        div.className = 'color-scheme-btn' + (cvData.color_scheme===key?' active':'');
        div.onclick = () => { cvData.color_scheme = key; renderColorSchemes(); updatePreview(); };
        div.innerHTML = `<div class="cs-swatch" style="background:${scheme.primary}"></div><span>${scheme.name}</span>`;
        c.appendChild(div);
    });
}

let _previewTimer = null;
let _autoSaveTimer = null;

function debouncePreview() {
    clearTimeout(_previewTimer);
    _previewTimer = setTimeout(updatePreview, 150);
}

function scheduleAutoSave() {
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(autoSave, 1500);
}

function autoSave() {
    try {
        collectData();
        const json = JSON.stringify(cvData);
        localStorage.setItem('cv_data', json);
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            showToast('Storage full — export JSON to avoid data loss', true);
        }
    }
}

function saveData() {
    collectData();
    clearTimeout(_autoSaveTimer);
    try {
        localStorage.setItem('cv_data', JSON.stringify(cvData));
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            showToast('Storage full — export JSON to avoid data loss', true);
        }
    }
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv_data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast(_ui('toastJsonSaved'));
}

function loadDataFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (!parsed || typeof parsed !== 'object') throw new Error('Invalid format');
                if (parsed.personal && typeof parsed.personal !== 'object') throw new Error('Invalid format');
                if (parsed.employer_groups) {
                    parsed.employer_groups.forEach(g => {
                        (g.positions || []).forEach(p => {
                            if (p.rich_description) p.rich_description = sanitizeHtml(p.rich_description);
                        });
                    });
                }
                if (parsed.personal && parsed.personal.photo && !parsed.personal.photo.startsWith('data:image/')) {
                    parsed.personal.photo = '';
                }
                cvData = parsed;
                localStorage.setItem('cv_data', JSON.stringify(cvData));
                currentTheme = cvData.theme || 'sidebar';
                renderAll();
                showToast(_ui('toastDataLoaded') + ' ' + file.name);
            } catch(err) {
                showToast(_ui('toastInvalidFormat'), true);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (!confirm(_ui('confirmClear'))) return;
    cvData = {
        personal: { name: '', title: '', photo: '', contacts: [] },
        summary: '',
        employer_groups: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        courses: [],
        languages: [],
        section_order: ['summary','experience','skills','projects','certifications','education','courses','languages'],
        disabled_sections: [],
        color_scheme: 'navy',
        show_company_logos: true,
        show_cert_logos: true,
        show_lang_flags: true,
        cv_language: cvData.cv_language || 'en',
        clause_enabled: false,
        clause_text: '',
    };
    localStorage.setItem('cv_data', JSON.stringify(cvData));
    renderAll();
    showToast(_ui('toastCleared'));
}

async function fetchAllLogos() {
    collectData();
    const tasks = [];
    (cvData.employer_groups || []).forEach((g, gi) => {
        if (g.url && !g.logo) {
            tasks.push({ type: 'employer', index: gi, url: g.url });
        }
    });
    (cvData.education || []).forEach((e, i) => {
        if (e.url && !e.logo) {
            tasks.push({ type: 'education', index: i, url: e.url });
        }
    });
    (cvData.certifications || []).forEach((c, gi) => {
        const fetchUrl = c.issuer_url || c.url || '';
        if (fetchUrl && !c.logo) {
            tasks.push({ type: 'certification', index: gi, url: fetchUrl });
        }
    });
    if (tasks.length === 0) {
        showToast(_ui('toastAllLogosDone'));
        return;
    }
    showToast(_ui('toastFetchingAllLogos'));
    for (const task of tasks) {
        const logo = await fetchLogoFromUrl(task.url);
        if (!logo) continue;
        if (task.type === 'employer') cvData.employer_groups[task.index].logo = logo;
        else if (task.type === 'education') cvData.education[task.index].logo = logo;
        else if (task.type === 'certification') cvData.certifications[task.index].logo = logo;
    }
    renderAll();
    showToast(_ui('toastAllLogosDone'));
}

function toggleDownloadMenu(btn) {
    const menu = btn.parentElement.querySelector('.download-menu');
    const isOpen = menu.classList.contains('show');
    menu.classList.toggle('show');
    btn.classList.toggle('open');
    if (!isOpen) {
        const close = (e) => {
            if (!btn.parentElement.contains(e.target)) {
                menu.classList.remove('show');
                btn.classList.remove('open');
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    }
}

let _generating = false;

function _lockDownloads() {
    _generating = true;
    document.querySelectorAll('.download-menu button').forEach(b => b.disabled = true);
}

function _unlockDownloads() {
    _generating = false;
    document.querySelectorAll('.download-menu button').forEach(b => b.disabled = false);
}

async function downloadAtsDocx() {
    if (_generating) return;
    _lockDownloads(); collectData(); showToast(_ui('toastGenDocx'));
    try {
        const res = await fetch('/api/generate/docx', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(cvData) });
        if (!res.ok) throw new Error(); downloadBlob(await res.blob(), cvFilename('docx')); showToast(_ui('toastDocxDone'));
    } catch(e) { showToast(_ui('toastDocxFail'), true); }
    _unlockDownloads();
}

async function downloadAtsPdf() {
    if (_generating) return;
    _lockDownloads(); collectData(); showToast(_ui('toastGenAtsPdf'));
    try {
        const res = await fetch('/api/generate/ats-pdf', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(cvData) });
        if (!res.ok) throw new Error(); downloadBlob(await res.blob(), cvFilename('pdf', '_ATS')); showToast(_ui('toastAtsPdfDone'));
    } catch(e) { showToast(_ui('toastAtsPdfFail'), true); }
    _unlockDownloads();
}

async function downloadPrettyPdf() {
    if (_generating) return;
    _lockDownloads(); collectData(); showToast(_ui('toastGenPdf'));
    try {
        const pagesHtml = document.getElementById('cv-pages').innerHTML;
        const res = await fetch('/api/generate/pdf', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ html: pagesHtml, cv_data: cvData }),
        });
        if (!res.ok) throw new Error();
        downloadBlob(await res.blob(), cvFilename('pdf'));
        showToast(_ui('toastPdfDone'));
    } catch(e) { showToast(_ui('toastPdfFail'), true); }
    _unlockDownloads();
}

function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href=url; a.download=name; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function getMonthLabels() { return _ui('monthNames'); }

function parseDateStr(dateStr) {
    if (!dateStr || dateStr.toLowerCase() === 'present') return {month: -1, year: ''};
    const parts = dateStr.trim().split(' ');
    if (parts.length === 2) {
        const mi = MONTH_NAMES.indexOf(parts[0]);
        if (mi >= 0) return {month: mi, year: parts[1]};
        const miFull = MONTH_FULL.indexOf(parts[0]);
        if (miFull >= 0) return {month: miFull, year: parts[1]};
        const miLower = MONTH_FULL.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
        if (miLower >= 0) return {month: miLower, year: parts[1]};
    }
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const [y,m] = dateStr.split('-');
        return {month: parseInt(m,10)-1, year: y};
    }
    if (/^\d{4}$/.test(dateStr.trim())) return {month: -1, year: dateStr.trim()};
    return {month: -1, year: ''};
}

function monthValueToDate(val) {
    if (typeof val === 'string') {
        if (!val) return '';
        if (/^\d{4}-\d{2}$/.test(val)) { const [y,m]=val.split('-'); return `${MONTH_NAMES[parseInt(m,10)-1]} ${y}`; }
        return val;
    }
    return '';
}

function readDateFromSelects(container) {
    if (!container) return '';
    const ms = container.querySelector('.date-month-sel');
    const ys = container.querySelector('.date-year-sel');
    if (!ys) return '';
    const y = ys.value;
    if (!y) return '';
    const m = ms ? ms.value : '';
    if (m === '' || m === '-1') return y;
    return `${MONTH_NAMES[parseInt(m,10)]} ${y}`;
}

function isPresent(dateStr) {
    return dateStr && dateStr.toLowerCase() === 'present';
}

function yearOptions(selectedYear) {
    const now = new Date().getFullYear();
    let opts = `<option value="">${_ui('yearLabel')}</option>`;
    for (let y = now + 2; y >= 1970; y--) {
        opts += `<option value="${y}" ${String(y)===String(selectedYear)?'selected':''}>${y}</option>`;
    }
    return opts;
}

function monthOptions(selectedMonth) {
    let opts = `<option value="-1">${_ui('yearOnly')}</option>`;
    for (let m = 0; m < 12; m++) {
        opts += `<option value="${m}" ${String(m)===String(selectedMonth)?'selected':''}>${getMonthLabels()[m]}</option>`;
    }
    return opts;
}

function makeDateFromHtml(cls, dateStr) {
    const d = parseDateStr(dateStr);
    return `<div class="date-selects-wrap ${cls}">
        <select class="date-month-sel" onchange="updatePreview()">${monthOptions(d.month)}</select>
        <select class="date-year-sel" onchange="updatePreview()">${yearOptions(d.year)}</select>
    </div>`;
}

function makeDateToHtml(cls, dateStr, gi, pi) {
    const pres = isPresent(dateStr);
    const d = pres ? {month:-1, year:''} : parseDateStr(dateStr);
    const idSuffix = pi !== undefined ? `${gi}-${pi}` : `${gi}`;
    return `<div class="date-present-wrap">
        <div class="date-selects-wrap ${cls}" style="flex:1">
            <select class="date-month-sel" ${pres?'disabled':''} onchange="updatePreview()">${monthOptions(d.month)}</select>
            <select class="date-year-sel" ${pres?'disabled':''} onchange="updatePreview()">${yearOptions(d.year)}</select>
        </div>
        <label><input type="checkbox" class="${cls}-present" ${pres?'checked':''} onchange="togglePresent(this, '${cls}', '${idSuffix}')"> ${_ui('present')}</label>
    </div>`;
}

function togglePresent(cb, cls, idSuffix) {
    const wrap = cb.closest('.date-present-wrap');
    const selects = wrap.querySelectorAll('.date-month-sel, .date-year-sel');
    if (cb.checked) {
        selects.forEach(sel => {
            sel.dataset.prevValue = sel.value;
            sel.disabled = true;
        });
    } else {
        selects.forEach(sel => {
            sel.disabled = false;
            if (sel.dataset.prevValue) { sel.value = sel.dataset.prevValue; delete sel.dataset.prevValue; }
        });
    }
    updatePreview();
}

function dateToNum(dateStr) {
    if (!dateStr || dateStr.toLowerCase() === 'present') return 999912;
    const parts = dateStr.trim().split(' ');
    if (parts.length === 2) {
        const monthName = parts[0];
        const year = parseInt(parts[1]);
        if (year) {
            const allMonths = SUPPORTED_LANGS.map(l => (UI[l] && UI[l].monthNames) || UI.en.monthNames);
            for (const names of allMonths) {
                const idx = names.indexOf(monthName);
                if (idx !== -1) return year * 100 + (idx + 1);
            }
        }
    }
    if (/^\d{4}$/.test(dateStr.trim())) return parseInt(dateStr) * 100;
    return 0;
}

function validateDateRanges() {
    document.querySelectorAll('.position-card').forEach(posEl => {
        const from = readDateFromSelects(posEl.querySelector('.pos-from'));
        const pres = posEl.querySelector('.pos-to-present');
        const to = (pres && pres.checked) ? 'Present' : readDateFromSelects(posEl.querySelector('.pos-to'));
        const fromN = dateToNum(from), toN = dateToNum(to);
        posEl.classList.toggle('date-warning', fromN > 0 && toN > 0 && fromN > toN);
    });
    document.querySelectorAll('#education-list .entry-card').forEach(card => {
        const from = readDateFromSelects(card.querySelector('.edu-from'));
        const pres = card.querySelector('.edu-to-present');
        const to = (pres && pres.checked) ? 'Present' : readDateFromSelects(card.querySelector('.edu-to'));
        const fromN = dateToNum(from), toN = dateToNum(to);
        card.classList.toggle('date-warning', fromN > 0 && toN > 0 && fromN > toN);
    });
    document.querySelectorAll('#projects-list .entry-card').forEach(card => {
        const from = readDateFromSelects(card.querySelector('.proj-from'));
        const pres = card.querySelector('.proj-to-present');
        const to = (pres && pres.checked) ? 'Present' : readDateFromSelects(card.querySelector('.proj-to'));
        const fromN = dateToNum(from), toN = dateToNum(to);
        card.classList.toggle('date-warning', fromN > 0 && toN > 0 && fromN > toN);
    });
}

(function initResize() {
    const handle = document.getElementById('panel-resize-handle');
    if (!handle) return;
    let startX, startW;
    const editor = document.querySelector('.editor-panel');

    handle.addEventListener('pointerdown', e => {
        e.preventDefault();
        handle.classList.add('active');
        startX = e.clientX;
        startW = editor.offsetWidth;
        handle.setPointerCapture(e.pointerId);

        const onMove = ev => {
            const newW = Math.max(320, Math.min(startW + (ev.clientX - startX), window.innerWidth - 200));
            editor.style.width = newW + 'px';
            editor.style.flex = 'none';
        };
        const onUp = () => {
            handle.classList.remove('active');
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
        };
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
    });
})();
