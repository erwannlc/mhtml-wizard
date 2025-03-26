const GITHUB_LINK = "https://github.com/erwannlc/mhtml-wizard";

const ZIP_FILE_NAME = "converted-html-files";
const SITE_TITLE = "Mhtml Wizard";

const CONSTANT_FR = {
  SITE_TITLE,
  CANCEL: "Annuler",
  DOWNLOAD_HTML_FILE: "Télécharger le fichier .html",
  NEW_TAB: "Nouvel onglet",
  CLOSE_TAB: "Fermer l'onglet",
  DOWNLOAD_ALL_FILES: "Télécharger tous les fichiers",
  INFO: [
    "Mthml Wizard utilise",
    "mhtml-to-html",
    "pour convertir localement, dans votre navigateur, les fichiers mhtml en fichiers html uniques et autonomes.",
  ],
};
const CONSTANT_EN = {
  SITE_TITLE,
  CANCEL: "Cancel",
  DOWNLOAD_HTML_FILE: "Download .html file",
  NEW_TAB: "New tab",
  CLOSE_TAB: "Close tab",
  DOWNLOAD_ALL_FILES: "Download all files",
  INFO: [
    "Mthml Wizard uses",
    "mhtml-to-html library",
    "to convert locally, in your browser, mhtml files to standalone single html files.",
  ],
};

const CONVERT_FILE_EN = {
  ERROR: {
    FILE_TYPE: "This file is not an mht or mhtml file",
    FILE_READ: "A file could not be read",
    DUPLICATE_FILE: "This file has already been converted and can be found in the tabs",
  },
  TITLE: "Convert MHTML files to HTML",
  FORMATS: "Accepted formats: .mht, .mhtml",
  INSTRUCTIONS: "Drop files here or click",
  ACCESSIBILTY: "Upload an MHTML file to convert it to HTML",
  CONFIRM: "Display",
  RESET: "Reset",
  SUBMITTING: "Converting file...",
};
const CONVERT_FILE_FR = {
  ERROR: {
    FILE_TYPE: "Ce fichier n'est pas un fichier .mht ou .mhtml",
    FILE_READ: "Un fichier n'a pas pu être lu",
    DUPLICATE_FILE: "Ce fichier a déjà été converti et se trouve dans les onglets",
  },
  TITLE: "Convertissez vos fichiers mhtml en html",
  FORMATS: "Formats acceptés: .mht, .mhtml",
  INSTRUCTIONS: "Cliquez ou glissez-déposez vos fichiers ici",
  ACCESSIBILTY: "Envoyer un ou plusieurs fichiers MHTML pour les convertir en HTML",
  CONFIRM: "Afficher",
  RESET: "Annuler",
  SUBMITTING: "Conversion du fichier en cours...",
};

export {
  CONSTANT_EN,
  CONSTANT_FR,
  GITHUB_LINK,
  CONVERT_FILE_EN,
  CONVERT_FILE_FR,
  ZIP_FILE_NAME,
};
