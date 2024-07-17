function updateLinksForLanguage(lang) {
  if (lang !== "en") return; // Only modify links if the language is 'en'

  const links = document.querySelectorAll('a[href*="/ruzakegila/"]');
  links.forEach((link) => {
    link.href = link.href.replace("/ruzakegila/", "/ruzakegila-en/");
  });
}

let cachedTranslations = null;
async function fetchTranslations() {
  if (cachedTranslations) return cachedTranslations;

  try {
    const response = await fetch(
      "/themes/ruza-custom-theme/asset/js/translations.json"
    );
    const data = await response.json();
    cachedTranslations = data;
    return data;
  } catch (error) {
    console.error("Failed to fetch translations:", error);
    return {}; // Return an empty object in case of failure
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function replaceTextNode(node, translations, lang) {
  if (!node.nodeValue.trim()) return;

  const text = node.nodeValue;
  if (!text || isURL(text)) return; // Skip URL-like text

  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  let newText = text;
  sortedKeys.forEach((key) => {
    const translation = translations[key][lang];
    if (translation) {
      const regex = new RegExp(`(${escapeRegExp(key)})`, "gi");
      newText = newText.replace(regex, translation);
    }
  });

  if (newText !== text) {
    node.nodeValue = newText;
  }
}

function replaceTextContent(element, translations, lang) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip elements with specific classes and URL-like text nodes
        if (
          isURL(node.nodeValue) ||
          node.parentNode.closest(".page-row, .song-intertext")
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        // Allow text nodes within <details> elements
        if (
          node.parentNode.tagName === "DETAILS" ||
          node.parentNode.closest("details")
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }

        // Only accept text nodes without child nodes for other elements
        return node.parentNode.childNodes.length === 1
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    replaceTextNode(node, translations, lang);
  }
}

async function translatePage(lang) {
  const translations = await fetchTranslations();
  if (!translations) return;

  replaceTextContent(document.body, translations, lang);
  updateLinksForLanguage(lang);
}

function detectLanguage() {
  const url = window.location.href;
  if (url.includes("ruzakegila-en")) {
    return "en"; // English
  } else if (url.includes("ruzakegila-rom")) {
    return "rom"; // Romanes
  }
  return null; // Default or no translation
}

const language = detectLanguage();
if (language) {
  document.addEventListener("DOMContentLoaded", () => {
    translatePage(language);
  });
}
