const SUPPORTED_LANGS = ['en','pl','de','fr','es'];
let uiLang = localStorage.getItem('ui_language') || (() => {
    const bl = (navigator.language || '').slice(0,2).toLowerCase();
    return SUPPORTED_LANGS.includes(bl) ? bl : 'en';
})();

const UI = {
    en: {
        load: 'Load', exportJson: 'Export JSON', download: 'Download', clearAll: 'Clear', fetchAllLogos: 'Fetch all logos',
        confirmClear: 'Are you sure you want to clear all CV data?', toastCleared: 'CV data cleared', toastFetchingAllLogos: 'Fetching all logos...', toastAllLogosDone: 'All logos fetched',
        atsFriendly: 'ATS-Friendly', visualCv: 'Visual CV',
        dlDocx: 'DOCX', dlPdf: 'PDF',
        dlHintAts: 'For recruitment systems', dlHintAtsPdf: 'Simple text format', dlHintPretty: 'Identical to preview',
        themeLabel: 'Theme:', themeSidebar: 'Sidebar', themeTopbar: 'Top Bar', themeMinimal: 'Minimal',
        tabSettings: 'Settings', tabPersonal: 'Personal info', tabSummary: 'Summary',
        tabExperience: 'Experience', tabEducation: 'Education', tabSkills: 'Skills',
        tabProjects: 'Projects', tabCourses: 'Courses', tabLanguages: 'Languages', tabCertifications: 'Certifications',
        cvLanguage: 'CV Language', cvLangHint: 'Affects section names and default clause. Does not translate CV content.',
        clauseTitle: 'GDPR Clause', clauseHint: 'Optional data processing consent clause at the bottom of CV.',
        clauseToggle: 'Add clause to CV', clauseReset: 'Reset to default clause',
        sectionsTitle: 'CV Sections', sectionsHint: 'Drag to reorder. Eye icon enables/disables section in CV and tabs.',
        visualOptions: 'Visual options', visualOnlyBadge: 'Pretty only',
        visualHint: 'These options affect only the visual CV. Logos, colors, and theme are not used in ATS version.',
        toggleLogos: 'Show company logos', toggleCertLogos: 'Show certification issuer logos', toggleFlags: 'Show flags for languages',
        colorScheme: 'Color scheme',
        photoLabel: 'Candidate photo', photoHint: '(optional, Pretty only)', photoUpload: 'Choose photo', photoRemove: 'Remove photo',
        fullName: 'Full name', jobTitle: 'Job title', contacts: 'Contact details', addContact: '+ Add contact field',
        summaryLabel: 'Professional summary',
        sortByDate: 'Sort by date', addEmployer: '+ Add employer', addPosition: '+ Add position / promotion',
        remove: 'Remove', companyName: 'Company name (displayed)', position: 'Position',
        dateFrom: 'From', dateTo: 'To', description: 'Description', bulletPoints: 'Bullet points', paragraph: 'Paragraph',
        addBullet: '+ Add bullet', employerUrl: 'Employer URL (optional)', present: 'Present',
        addEducation: '+ Add education', institutionUrl: 'Institution URL',
        degree: 'Degree', field: 'Field of study', degreeHint: 'e.g. BSc, MSc, Engineer',
        addLanguage: '+ Add language', typeName: 'Type name', typeLevel: 'Type level',
        addCategory: '+ Add category', categoryName: 'Category name (e.g. Security Tools)', skill: 'Skill',
        addProject: '+ Add project', projectRole: 'Role / position', projectUrl: 'Project URL',
        projectRoleHint: 'e.g. Lead Developer',
        addCourse: '+ Add course', courseProvider: 'Provider', courseProviderHint: 'e.g. Coursera, Udemy',
        courseUrl: 'URL / certificate',
        addCertGroup: '+ Add certification group', issuerUrl: 'Issuer URL',
        verificationUrl: 'Verification URL (optional)',
        previewVisual: 'Visual', previewAts: 'ATS',
        togglePreview: 'Hide/show preview',
        fetchFromUrl: 'Fetch from URL', uploadFile: 'Upload file', removeLogo: 'Remove logo',
        toastFetchingLogo: 'Fetching logo...', toastLogoFetched: 'Logo fetched',
        toastLogoFetchFail: 'Failed to fetch logo', toastInvalidFile: 'Invalid file format',
        toastPhotoTooBig: 'Photo too large (max 5 MB)', toastPhotoAdded: 'Photo added',
        toastSorted: 'Sorted by date', toastLogoUploaded: 'Logo uploaded', toastLogoRemoved: 'Logo removed',
        toastFlagTooBig: 'Flag too large', toastFlagUploaded: 'Flag uploaded',
        toastClauseReset: 'Default clause restored',
        toastJsonSaved: 'Downloaded cv_data.json', toastDataLoaded: 'Loaded data from',
        toastInvalidFormat: 'Error: invalid file format',
        toastGenDocx: 'Generating ATS DOCX...', toastDocxDone: 'ATS DOCX downloaded', toastDocxFail: 'ATS DOCX generation error',
        toastGenAtsPdf: 'Generating ATS PDF...', toastAtsPdfDone: 'ATS PDF downloaded', toastAtsPdfFail: 'ATS PDF generation error',
        toastGenPdf: 'Generating PDF...', toastPdfDone: 'PDF downloaded', toastPdfFail: 'PDF generation error',
        secSummary: 'Summary', secExperience: 'Work experience', secSkills: 'Skills',
        secProjects: 'Projects', secCourses: 'Courses / Training', secEducation: 'Education',
        secCertifications: 'Certifications', secLanguages: 'Languages',
        sepLine: '── Line ──', sepSpace: '⬜ Space', addLine: '+ Line', addSpace: '+ Space',
        dragHint: 'Drag', showSection: 'Show section', hideSection: 'Hide section',
        yearOnly: '— (year only)', yearLabel: 'Year',
        monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        ctLocation: 'Location', ctEmail: 'E-mail', ctPhone: 'Phone', ctGithub: 'GitHub',
        ctLinkedin: 'LinkedIn', ctWebsite: 'Website', ctTwitter: 'Twitter/X',
        flagNone: 'None',
        noName: 'Unnamed', labelPlaceholder: 'Label', valuePlaceholder: 'Value',
        bold: 'Bold', italic: 'Italic', underline: 'Underline', bulletList: 'List', numberedList: 'Numbered list',
    },
    pl: {
        load: 'Wczytaj', exportJson: 'Eksportuj JSON', download: 'Pobierz', clearAll: 'Wyczyść', fetchAllLogos: 'Pobierz wszystkie loga',
        confirmClear: 'Czy na pewno chcesz wyczyścić wszystkie dane CV?', toastCleared: 'Dane CV wyczyszczone', toastFetchingAllLogos: 'Pobieram wszystkie loga...', toastAllLogosDone: 'Wszystkie loga pobrane',
        atsFriendly: 'ATS-Friendly', visualCv: 'Wizualne CV',
        dlDocx: 'DOCX', dlPdf: 'PDF',
        dlHintAts: 'Dla systemu rekrutacyjnego', dlHintAtsPdf: 'Prosty format tekstowy', dlHintPretty: 'Identyczny z podglądem',
        themeLabel: 'Motyw:', themeSidebar: 'Sidebar', themeTopbar: 'Top Bar', themeMinimal: 'Minimal',
        tabSettings: 'Ustawienia', tabPersonal: 'Dane osobowe', tabSummary: 'Podsumowanie',
        tabExperience: 'Doświadczenie', tabEducation: 'Edukacja', tabSkills: 'Umiejętności',
        tabProjects: 'Projekty', tabCourses: 'Kursy', tabLanguages: 'Języki', tabCertifications: 'Certyfikaty',
        cvLanguage: 'Język CV', cvLangHint: 'Wpływa na nazwy sekcji i domyślną klauzulę. Nie tłumaczy treści CV.',
        clauseTitle: 'Klauzula RODO', clauseHint: 'Opcjonalna klauzula o przetwarzaniu danych osobowych na dole CV.',
        clauseToggle: 'Dodaj klauzulę do CV', clauseReset: 'Przywróć domyślną klauzulę',
        sectionsTitle: 'Sekcje CV', sectionsHint: 'Przeciągnij aby zmienić kolejność. Ikonka oka włącza/wyłącza sekcję w CV i w zakładkach.',
        visualOptions: 'Opcje wizualne', visualOnlyBadge: 'Tylko Pretty',
        visualHint: 'Te opcje dotyczą tylko wizualnego CV. W wersji ATS loga, kolory i motyw nie są uwzględniane.',
        toggleLogos: 'Pokazuj loga firm', toggleCertLogos: 'Pokazuj loga wystawców certyfikatów', toggleFlags: 'Pokazuj flagi przy językach',
        colorScheme: 'Schemat kolorów',
        photoLabel: 'Zdjęcie kandydata', photoHint: '(opcjonalne, tylko Pretty)', photoUpload: 'Wybierz zdjęcie', photoRemove: 'Usuń zdjęcie',
        fullName: 'Imię i nazwisko', jobTitle: 'Tytuł zawodowy', contacts: 'Dane kontaktowe', addContact: '+ Dodaj pole kontaktowe',
        summaryLabel: 'Podsumowanie zawodowe',
        sortByDate: 'Sortuj wg dat', addEmployer: '+ Dodaj pracodawcę', addPosition: '+ Dodaj stanowisko / awans',
        remove: 'Usuń', companyName: 'Nazwa firmy (wyświetlana)', position: 'Stanowisko',
        dateFrom: 'Od', dateTo: 'Do', description: 'Opis', bulletPoints: 'Bullet points', paragraph: 'Paragraf',
        addBullet: '+ Dodaj punkt', employerUrl: 'URL pracodawcy (opcjonalnie)', present: 'Obecnie',
        addEducation: '+ Dodaj edukację', institutionUrl: 'URL uczelni',
        degree: 'Stopień', field: 'Kierunek', degreeHint: 'np. BSc, MSc, Inżynier',
        addLanguage: '+ Dodaj język', typeName: 'Wpisz nazwę', typeLevel: 'Wpisz poziom',
        addCategory: '+ Dodaj kategorię', categoryName: 'Nazwa kategorii (np. Security Tools)', skill: 'Umiejętność',
        addProject: '+ Dodaj projekt', projectRole: 'Rola / stanowisko', projectUrl: 'URL projektu',
        projectRoleHint: 'np. Lead Developer',
        addCourse: '+ Dodaj kurs', courseProvider: 'Organizator', courseProviderHint: 'np. Coursera, Udemy',
        courseUrl: 'URL / certyfikat',
        addCertGroup: '+ Dodaj grupę certyfikatów', issuerUrl: 'URL wydawcy',
        verificationUrl: 'URL weryfikacji (opcjonalnie)',
        previewVisual: 'Wizualny', previewAts: 'ATS',
        togglePreview: 'Ukryj/pokaż podgląd',
        fetchFromUrl: 'Pobierz z URL', uploadFile: 'Wgraj plik', removeLogo: 'Usuń logo',
        toastFetchingLogo: 'Pobieram logo...', toastLogoFetched: 'Logo pobrane',
        toastLogoFetchFail: 'Nie udało się pobrać logo', toastInvalidFile: 'Nieprawidłowy format pliku',
        toastPhotoTooBig: 'Zdjęcie zbyt duże (maks. 5 MB)', toastPhotoAdded: 'Zdjęcie dodane',
        toastSorted: 'Posortowano wg dat', toastLogoUploaded: 'Logo wgrane', toastLogoRemoved: 'Logo usunięte',
        toastFlagTooBig: 'Flaga za duża', toastFlagUploaded: 'Flaga wgrana',
        toastClauseReset: 'Przywrócono domyślną klauzulę',
        toastJsonSaved: 'Pobrano cv_data.json', toastDataLoaded: 'Wczytano dane z',
        toastInvalidFormat: 'Błąd: nieprawidłowy format pliku',
        toastGenDocx: 'Generowanie ATS DOCX...', toastDocxDone: 'ATS DOCX pobrany', toastDocxFail: 'Błąd generowania ATS DOCX',
        toastGenAtsPdf: 'Generowanie ATS PDF...', toastAtsPdfDone: 'ATS PDF pobrany', toastAtsPdfFail: 'Błąd generowania ATS PDF',
        toastGenPdf: 'Generowanie PDF...', toastPdfDone: 'PDF pobrany', toastPdfFail: 'Błąd generowania PDF',
        secSummary: 'Podsumowanie', secExperience: 'Doświadczenie zawodowe', secSkills: 'Umiejętności',
        secProjects: 'Projekty', secCourses: 'Kursy / Szkolenia', secEducation: 'Edukacja',
        secCertifications: 'Certyfikaty', secLanguages: 'Języki',
        sepLine: '── Linia ──', sepSpace: '⬜ Odstęp', addLine: '+ Linia', addSpace: '+ Odstęp',
        dragHint: 'Przeciągnij', showSection: 'Pokaż sekcję', hideSection: 'Ukryj sekcję',
        yearOnly: '— (tylko rok)', yearLabel: 'Rok',
        monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
        ctLocation: 'Lokalizacja', ctEmail: 'E-mail', ctPhone: 'Telefon', ctGithub: 'GitHub',
        ctLinkedin: 'LinkedIn', ctWebsite: 'Strona www', ctTwitter: 'Twitter/X',
        flagNone: 'Brak',
        noName: 'Bez nazwy', labelPlaceholder: 'Etykieta', valuePlaceholder: 'Wartość',
        bold: 'Pogrubienie', italic: 'Kursywa', underline: 'Podkreślenie', bulletList: 'Lista', numberedList: 'Lista numerowana',
    },
    de: {
        load: 'Laden', exportJson: 'JSON exportieren', download: 'Herunterladen', clearAll: 'Löschen', fetchAllLogos: 'Alle Logos laden',
        confirmClear: 'Sind Sie sicher, dass Sie alle CV-Daten löschen möchten?', toastCleared: 'CV-Daten gelöscht', toastFetchingAllLogos: 'Lade alle Logos...', toastAllLogosDone: 'Alle Logos geladen',
        atsFriendly: 'ATS-freundlich', visualCv: 'Visueller Lebenslauf',
        dlDocx: 'DOCX', dlPdf: 'PDF',
        dlHintAts: 'Für Bewerbungssysteme', dlHintAtsPdf: 'Einfaches Textformat', dlHintPretty: 'Identisch mit Vorschau',
        themeLabel: 'Design:', themeSidebar: 'Sidebar', themeTopbar: 'Top Bar', themeMinimal: 'Minimal',
        tabSettings: 'Einstellungen', tabPersonal: 'Persönliche Daten', tabSummary: 'Zusammenfassung',
        tabExperience: 'Erfahrung', tabEducation: 'Ausbildung', tabSkills: 'Fähigkeiten',
        tabProjects: 'Projekte', tabCourses: 'Kurse', tabLanguages: 'Sprachen', tabCertifications: 'Zertifizierungen',
        cvLanguage: 'CV-Sprache', cvLangHint: 'Beeinflusst Abschnittsnamen und Standardklausel. Übersetzt nicht den Inhalt.',
        clauseTitle: 'DSGVO-Klausel', clauseHint: 'Optionale Einwilligungsklausel zur Datenverarbeitung am Ende des Lebenslaufs.',
        clauseToggle: 'Klausel zum Lebenslauf hinzufügen', clauseReset: 'Standardklausel wiederherstellen',
        sectionsTitle: 'CV-Abschnitte', sectionsHint: 'Ziehen zum Neuordnen. Augensymbol aktiviert/deaktiviert den Abschnitt.',
        visualOptions: 'Visuelle Optionen', visualOnlyBadge: 'Nur Pretty',
        visualHint: 'Diese Optionen betreffen nur den visuellen Lebenslauf. In der ATS-Version werden Logos, Farben und Design nicht verwendet.',
        toggleLogos: 'Firmenlogos anzeigen', toggleCertLogos: 'Zertifizierungslogos anzeigen', toggleFlags: 'Flaggen bei Sprachen anzeigen',
        colorScheme: 'Farbschema',
        photoLabel: 'Bewerbungsfoto', photoHint: '(optional, nur Pretty)', photoUpload: 'Foto wählen', photoRemove: 'Foto entfernen',
        fullName: 'Vollständiger Name', jobTitle: 'Berufsbezeichnung', contacts: 'Kontaktdaten', addContact: '+ Kontaktfeld hinzufügen',
        summaryLabel: 'Berufliche Zusammenfassung',
        sortByDate: 'Nach Datum sortieren', addEmployer: '+ Arbeitgeber hinzufügen', addPosition: '+ Position / Beförderung hinzufügen',
        remove: 'Entfernen', companyName: 'Firmenname (angezeigt)', position: 'Position',
        dateFrom: 'Von', dateTo: 'Bis', description: 'Beschreibung', bulletPoints: 'Aufzählung', paragraph: 'Absatz',
        addBullet: '+ Punkt hinzufügen', employerUrl: 'Arbeitgeber-URL (optional)', present: 'Aktuell',
        addEducation: '+ Ausbildung hinzufügen', institutionUrl: 'URL der Institution',
        degree: 'Abschluss', field: 'Fachrichtung', degreeHint: 'z.B. BSc, MSc, Diplom',
        addLanguage: '+ Sprache hinzufügen', typeName: 'Name eingeben', typeLevel: 'Niveau eingeben',
        addCategory: '+ Kategorie hinzufügen', categoryName: 'Kategoriename (z.B. Security Tools)', skill: 'Fähigkeit',
        addProject: '+ Projekt hinzufügen', projectRole: 'Rolle / Position', projectUrl: 'Projekt-URL',
        projectRoleHint: 'z.B. Lead Developer',
        addCourse: '+ Kurs hinzufügen', courseProvider: 'Anbieter', courseProviderHint: 'z.B. Coursera, Udemy',
        courseUrl: 'URL / Zertifikat',
        addCertGroup: '+ Zertifizierungsgruppe hinzufügen', issuerUrl: 'Aussteller-URL',
        verificationUrl: 'Verifizierungs-URL (optional)',
        previewVisual: 'Visuell', previewAts: 'ATS',
        togglePreview: 'Vorschau ein-/ausblenden',
        fetchFromUrl: 'Von URL laden', uploadFile: 'Datei hochladen', removeLogo: 'Logo entfernen',
        toastFetchingLogo: 'Logo wird geladen...', toastLogoFetched: 'Logo geladen',
        toastLogoFetchFail: 'Logo konnte nicht geladen werden', toastInvalidFile: 'Ungültiges Dateiformat',
        toastPhotoTooBig: 'Foto zu groß (max. 5 MB)', toastPhotoAdded: 'Foto hinzugefügt',
        toastSorted: 'Nach Datum sortiert', toastLogoUploaded: 'Logo hochgeladen', toastLogoRemoved: 'Logo entfernt',
        toastFlagTooBig: 'Flagge zu groß', toastFlagUploaded: 'Flagge hochgeladen',
        toastClauseReset: 'Standardklausel wiederhergestellt',
        toastJsonSaved: 'cv_data.json heruntergeladen', toastDataLoaded: 'Daten geladen aus',
        toastInvalidFormat: 'Fehler: ungültiges Dateiformat',
        toastGenDocx: 'ATS DOCX wird generiert...', toastDocxDone: 'ATS DOCX heruntergeladen', toastDocxFail: 'Fehler bei ATS DOCX',
        toastGenAtsPdf: 'ATS PDF wird generiert...', toastAtsPdfDone: 'ATS PDF heruntergeladen', toastAtsPdfFail: 'Fehler bei ATS PDF',
        toastGenPdf: 'PDF wird generiert...', toastPdfDone: 'PDF heruntergeladen', toastPdfFail: 'Fehler bei PDF-Generierung',
        secSummary: 'Zusammenfassung', secExperience: 'Berufserfahrung', secSkills: 'Fähigkeiten',
        secProjects: 'Projekte', secCourses: 'Kurse / Weiterbildung', secEducation: 'Ausbildung',
        secCertifications: 'Zertifizierungen', secLanguages: 'Sprachen',
        sepLine: '── Linie ──', sepSpace: '⬜ Abstand', addLine: '+ Linie', addSpace: '+ Abstand',
        dragHint: 'Ziehen', showSection: 'Abschnitt anzeigen', hideSection: 'Abschnitt ausblenden',
        yearOnly: '— (nur Jahr)', yearLabel: 'Jahr',
        monthNames: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
        ctLocation: 'Standort', ctEmail: 'E-Mail', ctPhone: 'Telefon', ctGithub: 'GitHub',
        ctLinkedin: 'LinkedIn', ctWebsite: 'Webseite', ctTwitter: 'Twitter/X',
        flagNone: 'Keine',
        noName: 'Unbenannt', labelPlaceholder: 'Bezeichnung', valuePlaceholder: 'Wert',
        bold: 'Fett', italic: 'Kursiv', underline: 'Unterstrichen', bulletList: 'Liste', numberedList: 'Nummerierte Liste',
    },
    fr: {
        load: 'Charger', exportJson: 'Exporter JSON', download: 'Télécharger', clearAll: 'Effacer', fetchAllLogos: 'Charger tous les logos',
        confirmClear: 'Êtes-vous sûr de vouloir effacer toutes les données du CV ?', toastCleared: 'Données CV effacées', toastFetchingAllLogos: 'Chargement de tous les logos...', toastAllLogosDone: 'Tous les logos chargés',
        atsFriendly: 'Compatible ATS', visualCv: 'CV visuel',
        dlDocx: 'DOCX', dlPdf: 'PDF',
        dlHintAts: 'Pour les systèmes de recrutement', dlHintAtsPdf: 'Format texte simple', dlHintPretty: 'Identique à l\'aperçu',
        themeLabel: 'Thème :', themeSidebar: 'Sidebar', themeTopbar: 'Top Bar', themeMinimal: 'Minimal',
        tabSettings: 'Paramètres', tabPersonal: 'Données personnelles', tabSummary: 'Résumé',
        tabExperience: 'Expérience', tabEducation: 'Formation', tabSkills: 'Compétences',
        tabProjects: 'Projets', tabCourses: 'Cours', tabLanguages: 'Langues', tabCertifications: 'Certifications',
        cvLanguage: 'Langue du CV', cvLangHint: 'Affecte les noms de sections et la clause par défaut. Ne traduit pas le contenu.',
        clauseTitle: 'Clause RGPD', clauseHint: 'Clause optionnelle de consentement au traitement des données en bas du CV.',
        clauseToggle: 'Ajouter la clause au CV', clauseReset: 'Rétablir la clause par défaut',
        sectionsTitle: 'Sections du CV', sectionsHint: 'Glisser pour réordonner. L\'icône œil active/désactive la section.',
        visualOptions: 'Options visuelles', visualOnlyBadge: 'Pretty uniquement',
        visualHint: 'Ces options ne concernent que le CV visuel. Les logos, couleurs et thème ne sont pas utilisés dans la version ATS.',
        toggleLogos: 'Afficher les logos des entreprises', toggleCertLogos: 'Afficher les logos des émetteurs', toggleFlags: 'Afficher les drapeaux des langues',
        colorScheme: 'Palette de couleurs',
        photoLabel: 'Photo du candidat', photoHint: '(optionnel, Pretty uniquement)', photoUpload: 'Choisir une photo', photoRemove: 'Supprimer la photo',
        fullName: 'Nom complet', jobTitle: 'Titre professionnel', contacts: 'Coordonnées', addContact: '+ Ajouter un champ de contact',
        summaryLabel: 'Résumé professionnel',
        sortByDate: 'Trier par date', addEmployer: '+ Ajouter un employeur', addPosition: '+ Ajouter un poste / promotion',
        remove: 'Supprimer', companyName: 'Nom de l\'entreprise (affiché)', position: 'Poste',
        dateFrom: 'De', dateTo: 'À', description: 'Description', bulletPoints: 'Puces', paragraph: 'Paragraphe',
        addBullet: '+ Ajouter un point', employerUrl: 'URL de l\'employeur (optionnel)', present: 'Actuel',
        addEducation: '+ Ajouter une formation', institutionUrl: 'URL de l\'institution',
        degree: 'Diplôme', field: 'Domaine d\'études', degreeHint: 'ex. Licence, Master',
        addLanguage: '+ Ajouter une langue', typeName: 'Saisir le nom', typeLevel: 'Saisir le niveau',
        addCategory: '+ Ajouter une catégorie', categoryName: 'Nom de catégorie (ex. Security Tools)', skill: 'Compétence',
        addProject: '+ Ajouter un projet', projectRole: 'Rôle / poste', projectUrl: 'URL du projet',
        projectRoleHint: 'ex. Lead Developer',
        addCourse: '+ Ajouter un cours', courseProvider: 'Organisme', courseProviderHint: 'ex. Coursera, Udemy',
        courseUrl: 'URL / certificat',
        addCertGroup: '+ Ajouter un groupe de certifications', issuerUrl: 'URL de l\'émetteur',
        verificationUrl: 'URL de vérification (optionnel)',
        previewVisual: 'Visuel', previewAts: 'ATS',
        togglePreview: 'Afficher/masquer l\'aperçu',
        fetchFromUrl: 'Télécharger depuis URL', uploadFile: 'Télécharger un fichier', removeLogo: 'Supprimer le logo',
        toastFetchingLogo: 'Téléchargement du logo...', toastLogoFetched: 'Logo téléchargé',
        toastLogoFetchFail: 'Impossible de télécharger le logo', toastInvalidFile: 'Format de fichier invalide',
        toastPhotoTooBig: 'Photo trop grande (max 5 Mo)', toastPhotoAdded: 'Photo ajoutée',
        toastSorted: 'Trié par date', toastLogoUploaded: 'Logo téléchargé', toastLogoRemoved: 'Logo supprimé',
        toastFlagTooBig: 'Drapeau trop grand', toastFlagUploaded: 'Drapeau téléchargé',
        toastClauseReset: 'Clause par défaut rétablie',
        toastJsonSaved: 'cv_data.json téléchargé', toastDataLoaded: 'Données chargées depuis',
        toastInvalidFormat: 'Erreur : format de fichier invalide',
        toastGenDocx: 'Génération ATS DOCX...', toastDocxDone: 'ATS DOCX téléchargé', toastDocxFail: 'Erreur de génération ATS DOCX',
        toastGenAtsPdf: 'Génération ATS PDF...', toastAtsPdfDone: 'ATS PDF téléchargé', toastAtsPdfFail: 'Erreur de génération ATS PDF',
        toastGenPdf: 'Génération PDF...', toastPdfDone: 'PDF téléchargé', toastPdfFail: 'Erreur de génération PDF',
        secSummary: 'Résumé', secExperience: 'Expérience professionnelle', secSkills: 'Compétences',
        secProjects: 'Projets', secCourses: 'Formations', secEducation: 'Formation',
        secCertifications: 'Certifications', secLanguages: 'Langues',
        sepLine: '── Ligne ──', sepSpace: '⬜ Espace', addLine: '+ Ligne', addSpace: '+ Espace',
        dragHint: 'Glisser', showSection: 'Afficher la section', hideSection: 'Masquer la section',
        yearOnly: '— (année seule)', yearLabel: 'Année',
        monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
        ctLocation: 'Lieu', ctEmail: 'E-mail', ctPhone: 'Téléphone', ctGithub: 'GitHub',
        ctLinkedin: 'LinkedIn', ctWebsite: 'Site web', ctTwitter: 'Twitter/X',
        flagNone: 'Aucun',
        noName: 'Sans nom', labelPlaceholder: 'Libellé', valuePlaceholder: 'Valeur',
        bold: 'Gras', italic: 'Italique', underline: 'Souligné', bulletList: 'Liste', numberedList: 'Liste numérotée',
    },
    es: {
        load: 'Cargar', exportJson: 'Exportar JSON', download: 'Descargar', clearAll: 'Borrar', fetchAllLogos: 'Cargar todos los logos',
        confirmClear: '¿Está seguro de que desea borrar todos los datos del CV?', toastCleared: 'Datos del CV borrados', toastFetchingAllLogos: 'Cargando todos los logos...', toastAllLogosDone: 'Todos los logos cargados',
        atsFriendly: 'Compatible ATS', visualCv: 'CV visual',
        dlDocx: 'DOCX', dlPdf: 'PDF',
        dlHintAts: 'Para sistemas de reclutamiento', dlHintAtsPdf: 'Formato de texto simple', dlHintPretty: 'Idéntico a la vista previa',
        themeLabel: 'Tema:', themeSidebar: 'Sidebar', themeTopbar: 'Top Bar', themeMinimal: 'Minimal',
        tabSettings: 'Configuración', tabPersonal: 'Datos personales', tabSummary: 'Resumen',
        tabExperience: 'Experiencia', tabEducation: 'Educación', tabSkills: 'Habilidades',
        tabProjects: 'Proyectos', tabCourses: 'Cursos', tabLanguages: 'Idiomas', tabCertifications: 'Certificaciones',
        cvLanguage: 'Idioma del CV', cvLangHint: 'Afecta los nombres de secciones y la cláusula predeterminada. No traduce el contenido.',
        clauseTitle: 'Cláusula RGPD', clauseHint: 'Cláusula opcional de consentimiento de procesamiento de datos al final del CV.',
        clauseToggle: 'Añadir cláusula al CV', clauseReset: 'Restablecer cláusula predeterminada',
        sectionsTitle: 'Secciones del CV', sectionsHint: 'Arrastrar para reordenar. El icono del ojo activa/desactiva la sección.',
        visualOptions: 'Opciones visuales', visualOnlyBadge: 'Solo Pretty',
        visualHint: 'Estas opciones solo afectan al CV visual. Los logos, colores y tema no se usan en la versión ATS.',
        toggleLogos: 'Mostrar logos de empresas', toggleCertLogos: 'Mostrar logos de emisores', toggleFlags: 'Mostrar banderas de idiomas',
        colorScheme: 'Esquema de colores',
        photoLabel: 'Foto del candidato', photoHint: '(opcional, solo Pretty)', photoUpload: 'Elegir foto', photoRemove: 'Eliminar foto',
        fullName: 'Nombre completo', jobTitle: 'Título profesional', contacts: 'Datos de contacto', addContact: '+ Añadir campo de contacto',
        summaryLabel: 'Resumen profesional',
        sortByDate: 'Ordenar por fecha', addEmployer: '+ Añadir empleador', addPosition: '+ Añadir puesto / ascenso',
        remove: 'Eliminar', companyName: 'Nombre de empresa (mostrado)', position: 'Puesto',
        dateFrom: 'Desde', dateTo: 'Hasta', description: 'Descripción', bulletPoints: 'Viñetas', paragraph: 'Párrafo',
        addBullet: '+ Añadir punto', employerUrl: 'URL del empleador (opcional)', present: 'Actual',
        addEducation: '+ Añadir educación', institutionUrl: 'URL de la institución',
        degree: 'Título', field: 'Campo de estudio', degreeHint: 'ej. Grado, Máster',
        addLanguage: '+ Añadir idioma', typeName: 'Escribir nombre', typeLevel: 'Escribir nivel',
        addCategory: '+ Añadir categoría', categoryName: 'Nombre de categoría (ej. Security Tools)', skill: 'Habilidad',
        addProject: '+ Añadir proyecto', projectRole: 'Rol / puesto', projectUrl: 'URL del proyecto',
        projectRoleHint: 'ej. Lead Developer',
        addCourse: '+ Añadir curso', courseProvider: 'Proveedor', courseProviderHint: 'ej. Coursera, Udemy',
        courseUrl: 'URL / certificado',
        addCertGroup: '+ Añadir grupo de certificaciones', issuerUrl: 'URL del emisor',
        verificationUrl: 'URL de verificación (opcional)',
        previewVisual: 'Visual', previewAts: 'ATS',
        togglePreview: 'Mostrar/ocultar vista previa',
        fetchFromUrl: 'Descargar desde URL', uploadFile: 'Subir archivo', removeLogo: 'Eliminar logo',
        toastFetchingLogo: 'Descargando logo...', toastLogoFetched: 'Logo descargado',
        toastLogoFetchFail: 'No se pudo descargar el logo', toastInvalidFile: 'Formato de archivo no válido',
        toastPhotoTooBig: 'Foto demasiado grande (máx. 5 MB)', toastPhotoAdded: 'Foto añadida',
        toastSorted: 'Ordenado por fecha', toastLogoUploaded: 'Logo subido', toastLogoRemoved: 'Logo eliminado',
        toastFlagTooBig: 'Bandera demasiado grande', toastFlagUploaded: 'Bandera subida',
        toastClauseReset: 'Cláusula predeterminada restablecida',
        toastJsonSaved: 'cv_data.json descargado', toastDataLoaded: 'Datos cargados desde',
        toastInvalidFormat: 'Error: formato de archivo no válido',
        toastGenDocx: 'Generando ATS DOCX...', toastDocxDone: 'ATS DOCX descargado', toastDocxFail: 'Error al generar ATS DOCX',
        toastGenAtsPdf: 'Generando ATS PDF...', toastAtsPdfDone: 'ATS PDF descargado', toastAtsPdfFail: 'Error al generar ATS PDF',
        toastGenPdf: 'Generando PDF...', toastPdfDone: 'PDF descargado', toastPdfFail: 'Error al generar PDF',
        secSummary: 'Resumen', secExperience: 'Experiencia laboral', secSkills: 'Habilidades',
        secProjects: 'Proyectos', secCourses: 'Cursos / Formación', secEducation: 'Educación',
        secCertifications: 'Certificaciones', secLanguages: 'Idiomas',
        sepLine: '── Línea ──', sepSpace: '⬜ Espacio', addLine: '+ Línea', addSpace: '+ Espacio',
        dragHint: 'Arrastrar', showSection: 'Mostrar sección', hideSection: 'Ocultar sección',
        yearOnly: '— (solo año)', yearLabel: 'Año',
        monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        ctLocation: 'Ubicación', ctEmail: 'E-mail', ctPhone: 'Teléfono', ctGithub: 'GitHub',
        ctLinkedin: 'LinkedIn', ctWebsite: 'Sitio web', ctTwitter: 'Twitter/X',
        flagNone: 'Ninguno',
        noName: 'Sin nombre', labelPlaceholder: 'Etiqueta', valuePlaceholder: 'Valor',
        bold: 'Negrita', italic: 'Cursiva', underline: 'Subrayado', bulletList: 'Lista', numberedList: 'Lista numerada',
    },
};

function _ui(key) { return (UI[uiLang] && UI[uiLang][key]) || UI.en[key] || key; }

function setUiLanguage(lang) {
    uiLang = lang;
    localStorage.setItem('ui_language', lang);
    document.documentElement.lang = lang;
    applyUiLanguage();
    renderSectionOrder();
    renderCvLanguageSelector();
    renderColorSchemes();
    populateForm();
    updatePreview();
}

function renderUiLanguageSelector() {
    const c = document.getElementById('ui-lang-selector');
    if (!c) return;
    c.innerHTML = '';
    SUPPORTED_LANGS.forEach(code => {
        const lang = CV_LANGUAGES[code];
        const btn = document.createElement('button');
        btn.className = 'ui-lang-btn' + (uiLang === code ? ' active' : '');
        btn.innerHTML = FLAGS[lang.flag] || '';
        btn.title = lang.label;
        btn.onclick = () => setUiLanguage(code);
        c.appendChild(btn);
    });
}

function applyUiLanguage() {
    document.documentElement.lang = uiLang;
    const setText = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = _ui(key); };

    setText('btn-load-text', 'load');
    setText('btn-clear-text', 'clearAll');
    setText('btn-fetch-all-logos-text', 'fetchAllLogos');
    setText('btn-export-text', 'exportJson');
    setText('btn-download-text', 'download');
    setText('dl-label-ats', 'atsFriendly');
    setText('dl-label-visual', 'visualCv');
    setText('dl-hint-docx', 'dlHintAts');
    setText('dl-hint-ats-pdf', 'dlHintAtsPdf');
    setText('dl-hint-pretty-pdf', 'dlHintPretty');
    setText('theme-label-text', 'themeLabel');

    setText('tab-text-settings', 'tabSettings');
    setText('tab-text-personal', 'tabPersonal');
    setText('tab-text-summary', 'tabSummary');
    setText('tab-text-experience', 'tabExperience');
    setText('tab-text-education', 'tabEducation');
    setText('tab-text-skills', 'tabSkills');
    setText('tab-text-projects', 'tabProjects');
    setText('tab-text-courses', 'tabCourses');
    setText('tab-text-languages', 'tabLanguages');
    setText('tab-text-certifications', 'tabCertifications');

    setText('settings-cv-lang-title', 'cvLanguage');
    setText('settings-cv-lang-hint', 'cvLangHint');
    setText('settings-clause-title', 'clauseTitle');
    setText('settings-clause-hint', 'clauseHint');
    setText('settings-clause-toggle-text', 'clauseToggle');
    setText('settings-clause-reset', 'clauseReset');
    setText('settings-sections-title', 'sectionsTitle');
    setText('settings-sections-hint', 'sectionsHint');
    setText('settings-visual-title', 'visualOptions');
    setText('settings-visual-badge', 'visualOnlyBadge');
    setText('settings-visual-hint', 'visualHint');
    setText('settings-toggle-logos', 'toggleLogos');
    setText('settings-toggle-cert-logos', 'toggleCertLogos');
    setText('settings-toggle-flags', 'toggleFlags');
    setText('settings-color-title', 'colorScheme');
    setText('settings-color-badge', 'visualOnlyBadge');

    setText('lbl-photo', 'photoLabel');
    setText('lbl-photo-hint', 'photoHint');
    setText('lbl-photo-upload', 'photoUpload');
    setText('lbl-fullname', 'fullName');
    setText('lbl-jobtitle', 'jobTitle');
    setText('lbl-contacts', 'contacts');
    setText('btn-add-contact', 'addContact');

    setText('lbl-summary', 'summaryLabel');

    setText('btn-sort-date-text', 'sortByDate');
    setText('btn-add-employer', 'addEmployer');

    setText('btn-add-education', 'addEducation');
    setText('btn-add-language', 'addLanguage');
    setText('btn-add-category', 'addCategory');
    setText('btn-add-project', 'addProject');
    setText('btn-add-course', 'addCourse');
    setText('btn-add-cert-group', 'addCertGroup');

    setText('pmt-pretty-text', 'previewVisual');
    setText('pmt-ats-text', 'previewAts');

    const photoRemoveBtn = document.querySelector('.photo-remove-btn');
    if (photoRemoveBtn) photoRemoveBtn.title = _ui('photoRemove');

    const previewToggle = document.getElementById('preview-toggle-btn');
    if (previewToggle) previewToggle.title = _ui('togglePreview');

    renderUiLanguageSelector();
}
