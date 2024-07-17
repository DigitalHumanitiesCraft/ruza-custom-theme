function updateLinksForLanguage(lang) {
  if (lang !== "en") return; // Only modify links if the language is 'en'

  const links = document.querySelectorAll('a[href*="/ruzakegila/"]');
  links.forEach((link) => {
    link.href = link.href.replace("/ruzakegila/", "/ruzakegila-en/");
  });
}

// Fetch translations and cache them
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
  }
}

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Function to replace text nodes only if they have no child nodes
function replaceTextNode(node, translations, lang) {
  if (!node.nodeValue.trim()) return;

  const text = node.nodeValue;
  if (!text) return;

  // Sort keys by length in descending order to replace longer phrases first
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  let newText = text;
  sortedKeys.forEach((key) => {
    const translation = translations[key][lang];
    if (translation) {
      const regex = new RegExp(escapeRegExp(key), "gi");

      newText = newText.replace(regex, translation);
    }
  });

  if (newText !== text) {
    node.nodeValue = newText;
  }
}

// Function to process only text nodes without child nodes
function replaceTextContent(element, translations, lang) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Only accept text nodes without child nodes
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

  // Replace text in the content
  replaceTextContent(document.body, translations, lang);
  // Update all links on the page
  updateLinksForLanguage(lang);
}

// Function to extract language from URL
function detectLanguage() {
  const url = window.location.href;
  if (url.includes("ruzakegila-en")) {
    return "en"; // English
  } else if (url.includes("ruzakegila-rom")) {
    return "rom"; // Romanes
  }
  return null; // Default or no translation
}

// Set up translation based on detected language
const language = detectLanguage();
if (language) {
  // Use DOMContentLoaded to ensure translation is applied as soon as possible
  document.addEventListener("DOMContentLoaded", () => {
    translatePage(language);
  });
}
