const PAGE_W = 794, PAGE_H = 1123, SIDEBAR_W = 240;

function contactHref(type, value) {
    if (!value) return '';
    if (type === 'email') return `mailto:${value}`;
    if (type === 'phone') return `tel:${value.replace(/\s+/g,'')}`;
    if (type === 'website' || type === 'github' || type === 'linkedin' || type === 'twitter') {
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
        return `https://${value}`;
    }
    return value;
}

function wrapLink(href, content, color) {
    if (!href) return content;
    return `<a href="${esc(href)}" style="color:${color||'inherit'};text-decoration:none" target="_blank">${content}</a>`;
}

function renderLogoOrInitials(name, logoUrl, size) {
    if (logoUrl) return `<img src="${esc(logoUrl)}" style="width:${size}px;height:${size}px;border-radius:4px;object-fit:contain">`;
    return `<div style="width:${size}px;height:${size}px;border-radius:4px;background:${getColor(name)};display:flex;align-items:center;justify-content:center;color:white;font-size:${Math.floor(size*0.4)}px;font-weight:700;flex-shrink:0">${getInitials(name||'?')}</div>`;
}

function renderExpGroup(group) {
    const showLogo = cvData.show_company_logos !== false;
    const multiPos = group.positions.length > 1;
    const scheme = getScheme();
    let html = `<div class="cv-exp-item">`;

    if (showLogo) {
        html += `<div style="flex-shrink:0;margin-top:1px">${renderLogoOrInitials(group.group_name, group.logo, 28)}</div>`;
    }

    const groupUrl = group.url || '';
    if (multiPos) {
        html += `<div class="cv-timeline-track"><div class="cv-timeline-line" style="background:${scheme.primary}25"></div>`;
        group.positions.forEach((pos, pi) => {
            html += `<div class="cv-timeline-pos">`;
            html += `<div class="cv-timeline-dot" style="background:${scheme.primary};box-shadow:0 0 0 2px ${scheme.primary}15"></div>`;
            html += `<div class="cv-timeline-content">`;
            html += renderPositionContent(pos, scheme, groupUrl);
            html += `</div></div>`;
        });
        html += `<div class="cv-timeline-end" style="background:${scheme.primary}40"></div>`;
        html += `</div>`;
    } else {
        html += `<div class="cv-exp-content">`;
        html += renderPositionContent(group.positions[0], scheme, groupUrl);
        html += `</div>`;
    }

    html += '</div>';
    return html;
}

function renderPositionContent(pos, scheme, groupUrl) {
    let html = '';
    const companyName = groupUrl
        ? wrapLink(groupUrl.startsWith('http') ? groupUrl : 'https://'+groupUrl, esc(pos.display_company), scheme.primary)
        : esc(pos.display_company);
    html += `<div class="cv-exp-header"><span class="cv-exp-company" style="color:${scheme.primary}">${companyName}</span><span class="cv-exp-date">${esc(pos.date_from)} - ${esc(pos.date_to)}</span></div>`;
    html += `<div class="cv-exp-role">${esc(pos.role)}</div>`;

    const fmt = pos.desc_format || 'bullets';
    if (fmt === 'paragraph' && pos.rich_description) {
        html += `<div style="font-size:9px;color:#666;line-height:1.65;margin-top:2px">${sanitizeHtml(pos.rich_description)}</div>`;
    } else if (pos.bullets && pos.bullets.length) {
        html += '<ul style="margin:2px 0 0;padding-left:14px;list-style:none">';
        pos.bullets.forEach(b => { html += `<li style="font-size:9px;color:#666;line-height:1.6;padding-left:10px;position:relative"><span style="position:absolute;left:0;color:#999">›</span>${esc(b)}</li>`; });
        html += '</ul>';
    }
    return html;
}

function renderSidebar(p) {
    const scheme = getScheme();
    let contactsHtml = (p.contacts||[]).map(c => {
        const lbl = c.label ? esc(c.label)+': ' : '';
        const val = c.link ? wrapLink(contactHref(c.icon, c.value), esc(c.value), 'rgba(255,255,255,0.8)') : esc(c.value);
        return `<div class="cv-contact-item"><div class="cv-contact-icon">${getContactSvg(c.icon)}</div><span>${lbl}${val}</span></div>`;
    }).join('');
    const photoHtml = p.photo ? `<img class="cv-photo" src="${esc(p.photo)}" alt="">` : '';
    return `<div class="cv-sidebar" style="background:${scheme.primary}">${photoHtml}<div class="cv-name">${esc(p.name)}</div><div class="cv-title-text">${esc(p.title)}</div><div style="margin-top:auto"></div>${contactsHtml}</div>`;
}

function renderTopBar(p) {
    const scheme = getScheme();
    let contactsHtml = (p.contacts||[]).map(c => {
        const val = c.link ? wrapLink(contactHref(c.icon, c.value), esc(c.value), 'rgba(255,255,255,0.8)') : esc(c.value);
        return `<span class="cv-topbar-contact">${getContactSvg(c.icon,'rgba(255,255,255,0.7)')} ${val}</span>`;
    }).join('');
    const photoHtml = p.photo ? `<img class="cv-photo" src="${esc(p.photo)}" alt="">` : '';
    return `<div class="cv-topbar-header" style="background:${scheme.primary}">${photoHtml}<div class="cv-topbar-info"><div class="cv-topbar-name">${esc(p.name)}</div><div class="cv-topbar-title">${esc(p.title)}</div><div class="cv-topbar-contacts">${contactsHtml}</div></div></div>`;
}

function renderMinimalHeader(p) {
    const scheme = getScheme();
    let contactsHtml = (p.contacts||[]).map(c => {
        const val = c.link ? wrapLink(contactHref(c.icon, c.value), esc(c.value), '#555') : esc(c.value);
        return `<span class="cv-min-contact">${getContactSvg(c.icon,'#888')} ${val}</span>`;
    }).join('');
    const photoHtml = p.photo ? `<img class="cv-photo" src="${esc(p.photo)}" alt="">` : '';
    return `<div class="cv-minimal-header">${photoHtml}<div class="cv-min-name" style="color:${scheme.primary}">${esc(p.name)}</div><div class="cv-min-title">${esc(p.title)}</div><div class="cv-min-line" style="background:${scheme.primary}"></div><div class="cv-min-contacts">${contactsHtml}</div></div>`;
}

function updatePreview() {
    if (previewMode === 'ats') { renderAtsPreview(); return; }
    collectData();
    if (typeof validateDateRanges === 'function') validateDateRanges();
    const pagesContainer = document.getElementById('cv-pages');
    const p = cvData.personal;
    const scheme = getScheme();
    const mainBlocks = [];

    const sectionRenderers = {
        summary: () => {
            if (!cvData.summary) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('summary')}</div><div class="cv-summary-text">${esc(cvData.summary)}</div>` });
        },
        experience: () => {
            const visibleGroups = (cvData.employer_groups||[]).filter(g => !g.hidden);
            if (!visibleGroups.length) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('experience')}</div>`, keepWithNext: true });
            visibleGroups.forEach(group => { mainBlocks.push({ html: renderExpGroup(group) }); });
        },
        skills: () => {
            if (!cvData.skills || !cvData.skills.length) return;
            const cats = cvData.skills.filter(c => c.category || (c.items && c.items.length));
            if (!cats.length) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('skills')}</div>`, keepWithNext: true });
            let h = '<div class="cv-skills-grid">';
            cats.forEach(cat => {
                h += `<div class="cv-skill-category"><span class="cv-skill-cat-name" style="color:${scheme.primary}">${esc(cat.category)}</span><div class="cv-skill-tags">`;
                (cat.items||[]).forEach(item => {
                    if (item) h += `<span class="cv-skill-tag" style="background:${scheme.primary}0d;color:${scheme.primary};border:1px solid ${scheme.primary}25">${esc(item)}</span>`;
                });
                h += '</div></div>';
            });
            h += '</div>';
            mainBlocks.push({ html: h });
        },
        projects: () => {
            if (!cvData.projects || !cvData.projects.length) return;
            const projs = cvData.projects.filter(p => p.name);
            if (!projs.length) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('projects')}</div>`, keepWithNext: true });
            projs.forEach(proj => {
                const projName = proj.url
                    ? wrapLink(proj.url.startsWith('http') ? proj.url : 'https://'+proj.url, esc(proj.name), scheme.primary)
                    : esc(proj.name);
                let h = `<div class="cv-project-item">`;
                h += `<div class="cv-exp-header"><span class="cv-exp-company" style="color:${scheme.primary}">${projName}</span>`;
                if (proj.date_from || proj.date_to) h += `<span class="cv-exp-date">${esc(proj.date_from||'')} - ${esc(proj.date_to||'')}</span>`;
                h += `</div>`;
                if (proj.role) h += `<div class="cv-exp-role" style="font-style:italic">${esc(proj.role)}</div>`;
                if (proj.description) h += `<div class="cv-exp-desc">${esc(proj.description)}</div>`;
                h += `</div>`;
                mainBlocks.push({ html: h });
            });
        },
        courses: () => {
            if (!cvData.courses || !cvData.courses.length) return;
            const crs = cvData.courses.filter(c => c.name);
            if (!crs.length) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('courses')}</div>`, keepWithNext: true });
            let h = '<div class="cv-courses-list">';
            crs.forEach(course => {
                const courseName = course.url
                    ? wrapLink(course.url.startsWith('http') ? course.url : 'https://'+course.url, esc(course.name), '#555')
                    : esc(course.name);
                h += `<div class="cv-course-item">`;
                h += `<span class="cv-course-name">${courseName}</span>`;
                if (course.provider) h += `<span class="cv-course-provider"> — ${esc(course.provider)}</span>`;
                if (course.date) h += `<span class="cv-course-date">${esc(course.date)}</span>`;
                h += `</div>`;
            });
            h += '</div>';
            mainBlocks.push({ html: h });
        },
        education: () => {
            if (!cvData.education || !cvData.education.length) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('education')}</div>`, keepWithNext: true });
            cvData.education.forEach(edu => {
                const eduLogo = edu.logo
                    ? `<div class="cv-edu-logo" style="background:transparent"><img src="${esc(edu.logo)}" style="width:28px;height:28px;object-fit:contain;border-radius:4px"></div>`
                    : `<div class="cv-edu-logo" style="background:${getColor(edu.institution)}"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 0L0 4l8 4 8-4L8 0zM0 6v4l8 4 8-4V6L8 10 0 6z" fill="white"/></svg></div>`;
                const eduName = edu.url
                    ? wrapLink(edu.url.startsWith('http') ? edu.url : 'https://'+edu.url, esc(edu.institution), scheme.primary)
                    : esc(edu.institution);
                const eduDegreeText = [edu.level, edu.degree].filter(x=>x).join(' — ');
                mainBlocks.push({ html: `<div class="cv-edu-item">${eduLogo}<div class="cv-edu-content"><div class="cv-edu-header"><span class="cv-edu-institution" style="color:${scheme.primary}">${eduName}</span><span class="cv-edu-date">${esc(edu.date_from)} - ${esc(edu.date_to)}</span></div><div class="cv-edu-degree">${esc(eduDegreeText)}</div></div></div>` });
            });
        },
        languages: () => {
            if (!cvData.languages || !cvData.languages.length) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('languages')}</div>`, keepWithNext: true });
            const showFlags = cvData.show_lang_flags !== false;
            cvData.languages.forEach(lang => {
                let flagHtml = '';
                if (showFlags) {
                    if (lang.custom_flag) {
                        flagHtml = `<div class="cv-lang-flag" style="border:1px solid #eee;border-radius:2px"><img src="${esc(lang.custom_flag)}" style="width:22px;height:14px;object-fit:cover;display:block"></div>`;
                    } else if (lang.flag && FLAGS[lang.flag]) {
                        flagHtml = `<div class="cv-lang-flag" style="border:1px solid #eee;border-radius:2px">${FLAGS[lang.flag]}</div>`;
                    }
                }
                mainBlocks.push({ html: `<div class="cv-lang-item">${flagHtml}<span><span class="cv-lang-name">${esc(lang.language)}</span> - ${esc(lang.level)}</span></div>` });
            });
        },
        certifications: () => {
            if (!cvData.certifications || !cvData.certifications.length) return;
            mainBlocks.push({ html: `<div class="cv-section-title" style="color:${scheme.primary}">${t('certifications')}</div>`, keepWithNext: true });
            const showCertLogos = cvData.show_cert_logos !== false;
            cvData.certifications.forEach(g => {
                let h = `<div class="cv-cert-group">`;
                if (showCertLogos) h += `<div style="flex-shrink:0">${renderLogoOrInitials(g.issuer, g.logo, 32)}</div>`;
                const issuerName = g.issuer_url
                    ? wrapLink(g.issuer_url.startsWith('http') ? g.issuer_url : 'https://'+g.issuer_url, esc(g.issuer), scheme.primary)
                    : esc(g.issuer);
                h += `<div class="cv-cert-content"><div class="cv-cert-issuer" style="color:${scheme.primary}">${issuerName}</div>`;
                g.items.forEach(item => {
                    const certName = typeof item === 'string' ? item : (item.name || '');
                    const certUrl = typeof item === 'string' ? '' : (item.url || '');
                    const certText = certUrl ? wrapLink(certUrl.startsWith('http') ? certUrl : 'https://'+certUrl, esc(certName), '#555') : esc(certName);
                    h += `<div class="cv-cert-item-text">${certText}</div>`;
                });
                h += '</div></div>';
                mainBlocks.push({ html: h });
            });
        },
    };

    (cvData.section_order || ['summary','experience','skills','projects','education','courses','certifications','languages']).forEach(sec => {
        if (typeof sec === 'object' && sec.type) {
            if (sec.type === 'line') {
                mainBlocks.push({ html: `<div style="height:${parseInt(sec.height)||12}px;display:flex;align-items:center"><div style="flex:1;height:1px;background:#ddd"></div></div>` });
            } else {
                mainBlocks.push({ html: `<div style="height:${parseInt(sec.height)||20}px"></div>` });
            }
        } else if (sectionRenderers[sec] && isSectionEnabled(sec)) {
            sectionRenderers[sec]();
        }
    });

    if (cvData.clause_enabled && cvData.clause_text) {
        mainBlocks.push({ html: `<div class="cv-clause">${esc(cvData.clause_text)}</div>` });
    }

    const isSidebar = currentTheme === 'sidebar';
    const PAGE1_MAIN_W = isSidebar ? (PAGE_W - SIDEBAR_W - 64) : (PAGE_W - 80);
    const PAGE_CONTENT_W = PAGE_W - 80;
    const USABLE_H = PAGE_H - 60;

    const measure = document.getElementById('cv-measure');
    let headerHeight = 0;
    if (!isSidebar) {
        measure.style.width = PAGE_CONTENT_W+'px'; measure.style.padding = '0';
        measure.innerHTML = currentTheme==='topbar' ? renderTopBar(p) : renderMinimalHeader(p);
        headerHeight = measure.offsetHeight;
    }

    measure.style.width = PAGE1_MAIN_W+'px'; measure.style.padding = '0';
    const p1H = mainBlocks.map(b => { measure.innerHTML=b.html; return measure.offsetHeight; });
    measure.style.width = PAGE_CONTENT_W+'px';
    const pNH = mainBlocks.map(b => { measure.innerHTML=b.html; return measure.offsetHeight; });
    measure.innerHTML = ''; measure.style.width = '';

    const pages = [{ blocks: [], isFirst: true }];
    let curH = isSidebar ? 0 : headerHeight, curPage = 0;
    for (let i=0; i<mainBlocks.length; i++) {
        const block = mainBlocks[i];
        const heights = curPage===0 ? p1H : pNH;
        let h = heights[i];
        if (block.keepWithNext && i+1<mainBlocks.length) h += heights[i+1];
        if (curH>0 && curH+h>USABLE_H) { curPage++; pages.push({blocks:[],isFirst:false}); curH=0; }
        pages[curPage].blocks.push(block);
        curH += (curPage===0?p1H:pNH)[i];
    }

    let pagesHtml = '';
    pages.forEach((page,idx) => {
        const content = page.blocks.map(b=>b.html).join('');
        const num = `<div class="preview-page-number">${idx+1} / ${pages.length}</div>`;
        if (page.isFirst && isSidebar)
            pagesHtml += `<div class="preview-page"><div class="cv-page1-layout">${renderSidebar(p)}<div class="cv-main">${content}</div></div>${num}</div>`;
        else if (page.isFirst && currentTheme==='topbar')
            pagesHtml += `<div class="preview-page">${renderTopBar(p)}<div class="cv-content-page">${content}</div>${num}</div>`;
        else if (page.isFirst && currentTheme==='minimal')
            pagesHtml += `<div class="preview-page"><div class="cv-content-page">${renderMinimalHeader(p)}${content}</div>${num}</div>`;
        else
            pagesHtml += `<div class="preview-page"><div class="cv-content-page">${content}</div>${num}</div>`;
    });
    pagesContainer.innerHTML = pagesHtml;
    scheduleAutoSave();
}

function setPreviewMode(mode, btn) {
    previewMode = mode;
    document.querySelectorAll('.pmt-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    updatePreview();
}

function togglePreview() {
    const panel = document.getElementById('preview-panel');
    const layout = document.querySelector('.layout');
    const icon = document.getElementById('preview-toggle-icon');
    const editor = document.querySelector('.editor-panel');
    const collapsed = !panel.classList.contains('collapsed');

    panel.classList.toggle('collapsed', collapsed);
    layout.classList.toggle('preview-hidden', collapsed);
    icon.style.transform = collapsed ? 'rotate(180deg)' : '';

    if (collapsed) {
        editor.style.flex = '1';
        editor.style.width = '';
    } else {
        editor.style.flex = '';
        editor.style.width = '42%';
    }
}

function renderAtsPreview() {
    collectData();
    if (typeof validateDateRanges === 'function') validateDateRanges();
    const pagesContainer = document.getElementById('cv-pages');
    const p = cvData.personal;
    let html = '<div class="preview-page ats-preview-page"><div class="ats-content">';

    html += `<div class="ats-name">${esc(p.name)}</div>`;
    html += `<div class="ats-title">${esc(p.title)}</div>`;

    const contactVals = (p.contacts||[]).filter(c => c.value).map(c => {
        if (c.link) {
            const href = contactHref(c.icon || c.type, c.value);
            return href ? `<a href="${esc(href)}" style="color:#556580">${esc(c.value)}</a>` : esc(c.value);
        }
        return esc(c.value);
    });
    if (contactVals.length) html += `<div class="ats-contacts">${contactVals.join(' | ')}</div>`;
    html += '<div class="ats-hr"></div>';

    const sectionOrder = cvData.section_order || ['summary','experience','skills','projects','education','courses','certifications','languages'];
    sectionOrder.forEach(sec => {
        if (typeof sec === 'object') return;
        if (!isSectionEnabled(sec)) return;
        if (sec === 'summary' && cvData.summary) {
            html += `<div class="ats-section-title">${t('summary')}</div>`;
            html += `<div class="ats-text">${esc(cvData.summary)}</div>`;
            html += '<div class="ats-hr"></div>';
        }
        if (sec === 'experience') {
            const groups = (cvData.employer_groups||[]).filter(g => !g.hidden);
            if (!groups.length) return;
            html += `<div class="ats-section-title">${t('experience')}</div>`;
            groups.forEach(group => {
                (group.positions||[]).forEach(pos => {
                    const company = pos.display_company || group.group_name;
                    const companyHref = group.url ? (group.url.startsWith('http')?group.url:'https://'+group.url) : '';
                    const companyHtml = companyHref
                        ? `<a href="${esc(companyHref)}" style="color:#1a233b">${esc(company)}</a>`
                        : esc(company);
                    html += `<div class="ats-company">${companyHtml}</div>`;
                    html += `<div class="ats-role">${esc(pos.role)} &nbsp;|&nbsp; ${esc(pos.date_from)} - ${esc(pos.date_to)}</div>`;
                    if (pos.desc_format === 'paragraph' && pos.rich_description) {
                        html += `<div class="ats-desc">${sanitizeHtml(pos.rich_description)}</div>`;
                    } else {
                        (pos.bullets||[]).forEach(b => {
                            html += `<div class="ats-bullet">• ${esc(b)}</div>`;
                        });
                    }
                });
            });
            html += '<div class="ats-hr"></div>';
        }
        if (sec === 'skills') {
            const skills = (cvData.skills||[]).filter(c => c.category || (c.items&&c.items.length));
            if (!skills.length) return;
            html += `<div class="ats-section-title">${t('skills')}</div>`;
            skills.forEach(cat => {
                const items = (cat.items||[]).filter(x=>x);
                if (cat.category || items.length) {
                    html += `<div class="ats-skill-line"><strong>${esc(cat.category)}:</strong> ${items.map(i=>esc(i)).join(', ')}</div>`;
                }
            });
            html += '<div class="ats-hr"></div>';
        }
        if (sec === 'projects') {
            const projs = (cvData.projects||[]).filter(p => p.name);
            if (!projs.length) return;
            html += `<div class="ats-section-title">${t('projects')}</div>`;
            projs.forEach(proj => {
                const projHref = proj.url ? (proj.url.startsWith('http')?proj.url:'https://'+proj.url) : '';
                const projHtml = projHref
                    ? `<a href="${esc(projHref)}" style="color:#1a233b">${esc(proj.name)}</a>`
                    : esc(proj.name);
                html += `<div class="ats-company">${projHtml}</div>`;
                if (proj.role || proj.date_from || proj.date_to) {
                    html += `<div class="ats-role">`;
                    if (proj.role) html += esc(proj.role);
                    if (proj.date_from || proj.date_to) {
                        if (proj.role) html += ` &nbsp;|&nbsp; `;
                        html += `${esc(proj.date_from||'')} - ${esc(proj.date_to||'')}`;
                    }
                    html += `</div>`;
                }
                if (proj.description) html += `<div class="ats-text" style="padding-left:12px">${esc(proj.description)}</div>`;
            });
            html += '<div class="ats-hr"></div>';
        }
        if (sec === 'courses') {
            const crs = (cvData.courses||[]).filter(c => c.name);
            if (!crs.length) return;
            html += `<div class="ats-section-title">${t('courses')}</div>`;
            crs.forEach(course => {
                const courseHref = course.url ? (course.url.startsWith('http')?course.url:'https://'+course.url) : '';
                const nameHtml = courseHref
                    ? `<a href="${esc(courseHref)}" style="color:#555">${esc(course.name)}</a>`
                    : esc(course.name);
                let line = `• ${nameHtml}`;
                if (course.provider) line += ` — ${esc(course.provider)}`;
                if (course.date) line += ` (${esc(course.date)})`;
                html += `<div class="ats-bullet">${line}</div>`;
            });
            html += '<div class="ats-hr"></div>';
        }
        if (sec === 'education') {
            if (!cvData.education || !cvData.education.length) return;
            html += `<div class="ats-section-title">${t('education')}</div>`;
            cvData.education.forEach(edu => {
                const instHref = edu.url ? (edu.url.startsWith('http')?edu.url:'https://'+edu.url) : '';
                const instHtml = instHref
                    ? `<a href="${esc(instHref)}" style="color:#1a233b">${esc(edu.institution)}</a>`
                    : esc(edu.institution);
                html += `<div class="ats-company">${instHtml}</div>`;
                const atsEduDegree = [edu.level, edu.degree].filter(x=>x).join(' — ');
                html += `<div class="ats-role">${esc(atsEduDegree)} &nbsp;|&nbsp; ${esc(edu.date_from)} - ${esc(edu.date_to)}</div>`;
            });
            html += '<div class="ats-hr"></div>';
        }
        if (sec === 'certifications') {
            if (!cvData.certifications || !cvData.certifications.length) return;
            html += `<div class="ats-section-title">${t('certifications')}</div>`;
            cvData.certifications.forEach(g => {
                const issuerHref = g.issuer_url ? (g.issuer_url.startsWith('http')?g.issuer_url:'https://'+g.issuer_url) : '';
                const issuerHtml = issuerHref
                    ? `<a href="${esc(issuerHref)}" style="color:#1a233b">${esc(g.issuer)}</a>`
                    : esc(g.issuer);
                html += `<div class="ats-company">${issuerHtml}</div>`;
                (g.items||[]).forEach(item => {
                    const name = typeof item === 'string' ? item : (item.name||'');
                    const url = typeof item === 'string' ? '' : (item.url||'');
                    const certHref = url ? (url.startsWith('http')?url:'https://'+url) : '';
                    const nameHtml = certHref
                        ? `<a href="${esc(certHref)}" style="color:#555">${esc(name)}</a>`
                        : esc(name);
                    html += `<div class="ats-bullet">• ${nameHtml}</div>`;
                });
            });
            html += '<div class="ats-hr"></div>';
        }
        if (sec === 'languages') {
            if (!cvData.languages || !cvData.languages.length) return;
            html += `<div class="ats-section-title">${t('languages')}</div>`;
            cvData.languages.forEach(lang => {
                html += `<div class="ats-text"><strong>${esc(lang.language)}</strong> - ${esc(lang.level)}</div>`;
            });
            html += '<div class="ats-hr"></div>';
        }
    });

    if (cvData.clause_enabled && cvData.clause_text) {
        html += `<div style="margin-top:20px;padding-top:8px;border-top:1px solid #ddd;font-size:8px;color:#999;line-height:1.5;font-style:italic">${esc(cvData.clause_text)}</div>`;
    }

    html += '</div></div>';
    pagesContainer.innerHTML = html;
    scheduleAutoSave();
}
