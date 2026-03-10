const CV_LANGUAGES = {
    en: { label: 'English', flag: 'gb' },
    pl: { label: 'Polski', flag: 'pl' },
    de: { label: 'Deutsch', flag: 'de' },
    fr: { label: 'Français', flag: 'fr' },
    es: { label: 'Español', flag: 'es' },
};

const CV_TRANSLATIONS = {
    en: {
        summary: 'SUMMARY', experience: 'WORK EXPERIENCE', skills: 'SKILLS',
        projects: 'PROJECTS', courses: 'COURSES & TRAINING', education: 'EDUCATION',
        languages: 'LANGUAGES', certifications: 'CERTIFICATIONS',
    },
    pl: {
        summary: 'PODSUMOWANIE', experience: 'DOŚWIADCZENIE ZAWODOWE', skills: 'UMIEJĘTNOŚCI',
        projects: 'PROJEKTY', courses: 'KURSY I SZKOLENIA', education: 'EDUKACJA',
        languages: 'JĘZYKI', certifications: 'CERTYFIKATY',
    },
    de: {
        summary: 'ZUSAMMENFASSUNG', experience: 'BERUFSERFAHRUNG', skills: 'FÄHIGKEITEN',
        projects: 'PROJEKTE', courses: 'KURSE & WEITERBILDUNG', education: 'AUSBILDUNG',
        languages: 'SPRACHEN', certifications: 'ZERTIFIZIERUNGEN',
    },
    fr: {
        summary: 'RÉSUMÉ', experience: 'EXPÉRIENCE PROFESSIONNELLE', skills: 'COMPÉTENCES',
        projects: 'PROJETS', courses: 'FORMATIONS', education: 'FORMATION',
        languages: 'LANGUES', certifications: 'CERTIFICATIONS',
    },
    es: {
        summary: 'RESUMEN', experience: 'EXPERIENCIA LABORAL', skills: 'HABILIDADES',
        projects: 'PROYECTOS', courses: 'CURSOS Y FORMACIÓN', education: 'EDUCACIÓN',
        languages: 'IDIOMAS', certifications: 'CERTIFICACIONES',
    },
};

const CLAUSE_DEFAULTS = {
    en: 'I hereby consent to the processing of my personal data for the purpose of recruitment, in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 (GDPR).',
    pl: 'Wyrażam zgodę na przetwarzanie moich danych osobowych w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko, zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych (RODO).',
    de: 'Ich willige in die Verarbeitung meiner personenbezogenen Daten zum Zwecke des Bewerbungsverfahrens gemäß der Verordnung (EU) 2016/679 des Europäischen Parlaments und des Rates vom 27. April 2016 (DSGVO) ein.',
    fr: 'Je consens au traitement de mes données personnelles aux fins de recrutement, conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 (RGPD).',
    es: 'Autorizo el tratamiento de mis datos personales con fines de selección de personal, de acuerdo con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo de 27 de abril de 2016 (RGPD).',
};

function t(key) {
    const lang = cvData.cv_language || 'en';
    return (CV_TRANSLATIONS[lang] && CV_TRANSLATIONS[lang][key]) || CV_TRANSLATIONS.en[key] || key;
}

function getDefaultClause() {
    return CLAUSE_DEFAULTS[cvData.cv_language || 'en'] || CLAUSE_DEFAULTS.en;
}

function sanitizeHtml(html) {
    if (!html) return '';
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<(iframe|object|embed|applet|link|meta|base|form)[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<(iframe|object|embed|applet|link|meta|base|form|input|button|textarea|select)[^>]*\/?>/gi, '')
        .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s+on\w+\s*=\s*\S+/gi, '')
        .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
        .replace(/expression\s*\(/gi, 'blocked(')
        .replace(/-moz-binding\s*:/gi, 'blocked:')
        .replace(/behavior\s*:/gi, 'blocked:');
}

function esc(s) { if(!s)return''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

function cvFilename(ext, suffix) {
    const name = (cvData.personal && cvData.personal.name || '').trim();
    const safe = name.replace(/[^\w\s\-]/g, '').replace(/\s+/g, '_');
    const base = safe ? `CV_${safe}` : 'CV';
    return `${base}${suffix||''}.${ext}`;
}

function showToast(msg, err=false) {
    const t=document.getElementById('toast'); t.textContent=msg;
    t.className='toast show'+(err?' error':'');
    clearTimeout(t._t); t._t=setTimeout(()=>{t.className='toast';},3000);
}

const FONT_PRESETS = {
    calibri:  { name: 'Calibri',  family: "'Calibri', 'Segoe UI', sans-serif" },
    helvetica:{ name: 'Helvetica',family: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    georgia:  { name: 'Georgia',  family: "Georgia, 'Times New Roman', serif" },
    garamond: { name: 'Garamond', family: "'EB Garamond', Garamond, 'Times New Roman', serif" },
    inter:    { name: 'Inter',    family: "'Inter', system-ui, -apple-system, sans-serif" },
    roboto:   { name: 'Roboto',   family: "'Roboto', 'Segoe UI', sans-serif" },
};

function getFont() {
    return FONT_PRESETS[cvData.font_preset] || FONT_PRESETS.calibri;
}

const HEADING_COLORS = {
    black:    { name: 'Black',    color: '#111111' },
    auto:     { name: 'Auto',     color: null },
    navy:     { name: 'Navy',     color: '#1a233b' },
    graphite: { name: 'Graphite', color: '#374151' },
    steel:    { name: 'Steel',    color: '#475569' },
    ocean:    { name: 'Ocean',    color: '#0c4a6e' },
    forest:   { name: 'Forest',   color: '#14532d' },
    wine:     { name: 'Wine',     color: '#4a1d2e' },
    brown:    { name: 'Brown',    color: '#5c3d2e' },
    indigo:   { name: 'Indigo',   color: '#312e81' },
};

function getHeadingColor() {
    const h = HEADING_COLORS[cvData.heading_color];
    if (h && h.color) return h.color;
    return getScheme().primary;
}

const COLOR_SCHEMES = {
    navy:    { name: 'Navy',    primary: '#1a233b', accent: '#2d3a5c', text: '#333333', light: '#556580' },
    ocean:   { name: 'Ocean',   primary: '#0c4a6e', accent: '#0369a1', text: '#1e293b', light: '#64748b' },
    forest:  { name: 'Forest',  primary: '#14532d', accent: '#166534', text: '#1a2e05', light: '#4d7c0f' },
    wine:    { name: 'Wine',    primary: '#4a1d2e', accent: '#831843', text: '#2d1b1b', light: '#9f1239' },
    slate:   { name: 'Slate',   primary: '#334155', accent: '#475569', text: '#1e293b', light: '#64748b' },
    charcoal:{ name: 'Charcoal',primary: '#1c1c1c', accent: '#333333', text: '#111111', light: '#666666' },
};

const CONTACT_ICONS = {
    location: '<path d="M8 0C5.2 0 3 2.1 3 4.7 3 8.2 8 14 8 14s5-5.8 5-9.3C13 2.1 10.8 0 8 0zm0 6.5c-1 0-1.8-.8-1.8-1.8S7 2.9 8 2.9s1.8.8 1.8 1.8S9 6.5 8 6.5z"/>',
    email: '<path d="M14 3H2C.9 3 0 3.9 0 5v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 4l-6 3.5L2 7V5l6 3.5L14 5v2z"/>',
    phone: '<path d="M13.6 10.4l-2.8-.6c-.3-.1-.7 0-.9.3l-1.2 1.5c-2-1-3.6-2.6-4.6-4.6L5.6 5.8c.3-.3.3-.6.3-.9L5.3 2.1c-.1-.5-.5-.8-1-.8H2.1C1.5 1.3.9 1.8 1 2.4c.4 3 1.8 5.7 3.8 7.8 2 2 4.8 3.4 7.8 3.8.6.1 1.1-.5 1.1-1.1v-2.1c-.1-.4-.5-.7-1.1-.4z"/>',
    github: '<path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V14c-2.2.5-2.7-1.1-2.7-1.1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.7-.9-3.7-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4C13.7 14.5 16 11.5 16 8c0-4.4-3.6-8-8-8z"/>',
    linkedin: '<path d="M13.6 0H2.4C1.1 0 0 1 0 2.3v11.4C0 15 1.1 16 2.4 16h11.2c1.3 0 2.4-1 2.4-2.3V2.3C16 1 14.9 0 13.6 0zM4.7 13.6H2.4V6h2.4v7.6zM3.6 5.1c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.7 1.4-1.4 1.4zm10 8.5h-2.4V9.9c0-.9 0-2-1.2-2s-1.4.9-1.4 1.9v3.8H6.2V6h2.3v1h0c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2z"/>',
    website: '<path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm5.9 7H11c-.1-1.8-.5-3.4-1.1-4.6C11.8 3.5 13.3 5 13.9 7zM8 14c-1-.1-2-1.8-2.4-4h4.8c-.4 2.2-1.4 3.9-2.4 4zM5.5 9c-.1-.3-.1-.7-.1-1s0-.7.1-1h5c.1.3.1.7.1 1s0 .7-.1 1h-5zM2.1 7C2.7 5 4.2 3.5 6.1 2.4 5.5 3.6 5.1 5.2 5 7H2.1zM6.1 13.6C4.2 12.5 2.7 11 2.1 9H5c.1 1.8.5 3.4 1.1 4.6zM9.9 13.6c.6-1.2 1-2.8 1.1-4.6h2.9c-.6 2-2.1 3.5-4 4.6z"/>',
    twitter: '<path d="M16 3c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.6-2.1.8C12.7 1.8 11.8 1.5 10.8 1.5c-2 0-3.6 1.6-3.6 3.6 0 .3 0 .6.1.8C4.7 5.7 2.5 4.3 1 2.3c-.3.5-.5 1.1-.5 1.8 0 1.2.6 2.3 1.6 3-.6 0-1.2-.2-1.6-.4 0 1.7 1.2 3.2 2.9 3.5-.3.1-.6.1-1 .1-.2 0-.5 0-.7-.1.5 1.5 1.9 2.5 3.5 2.6C3.7 13.8 2.1 14.4.3 14.4c-.3 0-.6 0-.9-.1C1.7 15.4 3.7 16 5.8 16c7 0 10.8-5.8 10.8-10.8v-.5c.7-.5 1.4-1.2 1.9-1.9z"/>',
};

function getContactTypes() {
    return [
        { value: 'location', label: _ui('ctLocation') },
        { value: 'email', label: _ui('ctEmail') },
        { value: 'phone', label: _ui('ctPhone') },
        { value: 'github', label: _ui('ctGithub') },
        { value: 'linkedin', label: _ui('ctLinkedin') },
        { value: 'website', label: _ui('ctWebsite') },
        { value: 'twitter', label: _ui('ctTwitter') },
    ];
}

const FLAGS = {
    pl: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="240" fill="#fff"/><rect y="240" width="640" height="240" fill="#dc143c"/></svg>`,
    gb: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#012169"/><path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#fff"/><path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E"/><path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#fff"/><path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E"/></svg>`,
    de: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="160" fill="#000"/><rect y="160" width="640" height="160" fill="#D00"/><rect y="320" width="640" height="160" fill="#FFCE00"/></svg>`,
    fr: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="213" height="480" fill="#002395"/><rect x="213" width="214" height="480" fill="#fff"/><rect x="427" width="213" height="480" fill="#ED2939"/></svg>`,
    es: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#c60b1e"/><rect y="120" width="640" height="240" fill="#ffc400"/></svg>`,
    it: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="213" height="480" fill="#009246"/><rect x="213" width="214" height="480" fill="#fff"/><rect x="427" width="213" height="480" fill="#ce2b37"/></svg>`,
    ua: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="240" fill="#005BBB"/><rect y="240" width="640" height="240" fill="#FFD500"/></svg>`,
    ru: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="160" fill="#fff"/><rect y="160" width="640" height="160" fill="#0039A6"/><rect y="320" width="640" height="160" fill="#D52B1E"/></svg>`,
    us: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#B22234"/><g fill="#fff"><rect y="37" width="640" height="37"/><rect y="111" width="640" height="37"/><rect y="185" width="640" height="37"/><rect y="259" width="640" height="37"/><rect y="333" width="640" height="37"/><rect y="407" width="640" height="37"/></g><rect width="260" height="259" fill="#3C3B6E"/></svg>`,
    jp: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#fff"/><circle cx="320" cy="240" r="120" fill="#bc002d"/></svg>`,
    cn: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#de2910"/></svg>`,
    pt: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="256" height="480" fill="#006600"/><rect x="256" width="384" height="480" fill="#ff0000"/></svg>`,
    nl: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="160" fill="#AE1C28"/><rect y="160" width="640" height="160" fill="#fff"/><rect y="320" width="640" height="160" fill="#21468B"/></svg>`,
    cz: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#d7141a"/><rect width="640" height="240" fill="#fff"/><path d="M0 0l320 240L0 480z" fill="#11457e"/></svg>`,
    kr: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#fff"/><circle cx="320" cy="240" r="100" fill="#c60c30"/><path d="M320 140a100 100 0 0 1 0 200 50 50 0 0 1 0-100 50 50 0 0 0 0-100z" fill="#003478"/></svg>`,
    sa: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#006C35"/><rect x="160" y="160" width="320" height="40" fill="#fff"/></svg>`,
    ind: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="160" fill="#FF9933"/><rect y="160" width="640" height="160" fill="#fff"/><rect y="320" width="640" height="160" fill="#138808"/><circle cx="320" cy="240" r="40" fill="none" stroke="#000080" stroke-width="4"/></svg>`,
    tr: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#E30A17"/><circle cx="260" cy="240" r="100" fill="#fff"/><circle cx="285" cy="240" r="80" fill="#E30A17"/></svg>`,
    se: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#006AA7"/><rect x="176" width="64" height="480" fill="#FECC00"/><rect y="208" width="640" height="64" fill="#FECC00"/></svg>`,
    no: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#EF2B2D"/><rect x="176" width="64" height="480" fill="#fff"/><rect y="208" width="640" height="64" fill="#fff"/><rect x="192" width="32" height="480" fill="#002868"/><rect y="224" width="640" height="32" fill="#002868"/></svg>`,
    dk: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#C8102E"/><rect x="176" width="64" height="480" fill="#fff"/><rect y="208" width="640" height="64" fill="#fff"/></svg>`,
    fi: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#fff"/><rect x="176" width="64" height="480" fill="#003580"/><rect y="208" width="640" height="64" fill="#003580"/></svg>`,
    hu: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="160" fill="#CE2939"/><rect y="160" width="640" height="160" fill="#fff"/><rect y="320" width="640" height="160" fill="#477050"/></svg>`,
    ro: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="213" height="480" fill="#002B7F"/><rect x="213" width="214" height="480" fill="#FCD116"/><rect x="427" width="213" height="480" fill="#CE1126"/></svg>`,
    gr: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#0D5EAF"/><g fill="#fff"><rect y="53" width="640" height="53"/><rect y="160" width="640" height="53"/><rect y="267" width="640" height="53"/><rect y="373" width="640" height="53"/></g><rect width="267" height="267" fill="#0D5EAF"/><rect x="107" width="53" height="267" fill="#fff"/><rect y="107" width="267" height="53" fill="#fff"/></svg>`,
    il: `<svg viewBox="0 0 640 480" width="22" height="14"><rect width="640" height="480" fill="#fff"/><rect y="48" width="640" height="60" fill="#0038b8"/><rect y="372" width="640" height="60" fill="#0038b8"/></svg>`,
};

const FLAG_OPTIONS = [
    {value:'', labelKey:'flagNone'},
    {value:'pl', label:'Polska'}, {value:'gb', label:'UK'}, {value:'us', label:'USA'},
    {value:'de', label:'Niemcy'}, {value:'fr', label:'Francja'}, {value:'es', label:'Hiszpania'},
    {value:'it', label:'Włochy'}, {value:'pt', label:'Portugalia'}, {value:'nl', label:'Holandia'},
    {value:'ua', label:'Ukraina'}, {value:'cz', label:'Czechy'}, {value:'ru', label:'Rosja'},
    {value:'jp', label:'Japonia'}, {value:'cn', label:'Chiny'}, {value:'kr', label:'Korea'},
    {value:'sa', label:'Arabia'}, {value:'ind', label:'Indie'}, {value:'tr', label:'Turcja'},
    {value:'se', label:'Szwecja'}, {value:'no', label:'Norwegia'}, {value:'dk', label:'Dania'},
    {value:'fi', label:'Finlandia'}, {value:'hu', label:'Węgry'}, {value:'ro', label:'Rumunia'},
    {value:'gr', label:'Grecja'}, {value:'il', label:'Izrael'},
];

const LANGUAGES_DB = [
    { name: 'Polish', flag: 'pl' },
    { name: 'English', flag: 'gb' },
    { name: 'German', flag: 'de' },
    { name: 'French', flag: 'fr' },
    { name: 'Spanish', flag: 'es' },
    { name: 'Italian', flag: 'it' },
    { name: 'Portuguese', flag: 'pt' },
    { name: 'Dutch', flag: 'nl' },
    { name: 'Ukrainian', flag: 'ua' },
    { name: 'Czech', flag: 'cz' },
    { name: 'Russian', flag: 'ru' },
    { name: 'Japanese', flag: 'jp' },
    { name: 'Chinese', flag: 'cn' },
    { name: 'Korean', flag: 'kr' },
    { name: 'Arabic', flag: 'sa' },
    { name: 'Hindi', flag: 'ind' },
    { name: 'Turkish', flag: 'tr' },
    { name: 'Swedish', flag: 'se' },
    { name: 'Norwegian', flag: 'no' },
    { name: 'Danish', flag: 'dk' },
    { name: 'Finnish', flag: 'fi' },
    { name: 'Hungarian', flag: 'hu' },
    { name: 'Romanian', flag: 'ro' },
    { name: 'Greek', flag: 'gr' },
    { name: 'Hebrew', flag: 'il' },
];

const PROFICIENCY_LEVELS_I18N = {
    en: {
        native: 'Native or bilingual proficiency',
        full_professional: 'Full professional proficiency',
        professional_working: 'Professional working proficiency',
        limited_working: 'Limited working proficiency',
        elementary: 'Elementary proficiency',
    },
    pl: {
        native: 'Ojczysty lub dwujęzyczny',
        full_professional: 'Pełna biegłość zawodowa',
        professional_working: 'Profesjonalna znajomość robocza',
        limited_working: 'Ograniczona znajomość robocza',
        elementary: 'Znajomość podstawowa',
    },
    de: {
        native: 'Muttersprache oder zweisprachig',
        full_professional: 'Verhandlungssicher',
        professional_working: 'Fließend in Wort und Schrift',
        limited_working: 'Gute Kenntnisse',
        elementary: 'Grundkenntnisse',
    },
    fr: {
        native: 'Bilingue ou langue maternelle',
        full_professional: 'Courant',
        professional_working: 'Professionnel',
        limited_working: 'Notions avancées',
        elementary: 'Notions de base',
    },
    es: {
        native: 'Nativo o bilingüe',
        full_professional: 'Competencia profesional completa',
        professional_working: 'Competencia profesional',
        limited_working: 'Competencia básica profesional',
        elementary: 'Competencia elemental',
    },
};

const PROFICIENCY_KEYS = ['native', 'full_professional', 'professional_working', 'limited_working', 'elementary'];

function getProficiencyLevels(lang) {
    const tr = PROFICIENCY_LEVELS_I18N[lang] || PROFICIENCY_LEVELS_I18N.en;
    return PROFICIENCY_KEYS.map(k => ({ key: k, label: tr[k] }));
}

function getProficiencyLabel(key, lang) {
    const tr = PROFICIENCY_LEVELS_I18N[lang] || PROFICIENCY_LEVELS_I18N.en;
    return tr[key] || key;
}

// Legacy compat: old string values → keys
const PROFICIENCY_LEGACY = {
    'native': 'native', 'bilingual': 'native',
    'native or bilingual proficiency': 'native',
    'full professional proficiency': 'full_professional',
    'professional working proficiency': 'professional_working',
    'working proficiency': 'professional_working',
    'limited working proficiency': 'limited_working',
    'elementary proficiency': 'elementary',
    'beginner': 'elementary',
};

function migrateProficiencyLevel(val) {
    if (!val) return '';
    if (PROFICIENCY_KEYS.includes(val)) return val;
    return PROFICIENCY_LEGACY[val.toLowerCase()] || val;
}

function getLangFlag(langName) {
    const found = LANGUAGES_DB.find(l => l.name.toLowerCase() === (langName||'').toLowerCase());
    return found ? found.flag : '';
}

const COMPANY_COLORS = {
    'PZU':'#c41e3a', 'STM Cyber':'#1a5276', 'UBS / Credit-Suisse':'#cc0000',
    'Alior Bank':'#e6a817', 'Egnyte':'#00a651', 'Atos':'#0066a1', 'Eximo Project':'#2c3e50',
    'ISACA':'#003366', 'OffSec':'#d9534f', 'Microsoft':'#00a4ef', 'AWS':'#ff9900',
    'INE Security / eLearnSecurity':'#e74c3c', 'CompTIA':'#c8102e', 'TUV NORD':'#003399',
    'CISCO':'#049fd9', 'RedHat':'#cc0000', 'Government of the Republic of Poland':'#dc143c',
};

function getColor(name) {
    if (COMPANY_COLORS[name]) return COMPANY_COLORS[name];
    let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return `hsl(${Math.abs(h)%360}, 55%, 40%)`;
}
function getInitials(name) {
    return name.split(/[\s\/\-]+/).map(w => w[0]).filter(Boolean).slice(0,3).join('').toUpperCase();
}
function getContactSvg(icon, fill) {
    return `<svg viewBox="0 0 16 16" width="12" height="12" fill="${fill||'rgba(255,255,255,0.6)'}">${CONTACT_ICONS[icon]||CONTACT_ICONS.website}</svg>`;
}
function getScheme() {
    return COLOR_SCHEMES[cvData.color_scheme] || COLOR_SCHEMES.navy;
}
