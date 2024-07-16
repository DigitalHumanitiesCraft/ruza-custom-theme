async function fetchTranslations() {
  try {
    const response = await fetch(
      "/themes/ruza-custom-theme/asset/js/translations.json"
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch translations:", error);
  }
}

function replaceText(content, translations, lang) {
  // Sort keys by length in descending order to replace longer phrases first
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  sortedKeys.forEach((key) => {
    const translation = translations[key][lang];
    if (translation) {
      const regex = new RegExp(key, "g");
      content = content.replace(regex, translation);
    }
  });
  return content;
}

async function translatePage(lang) {
  const translations = await fetchTranslations();
  if (!translations) return;

  // Get the entire HTML content of the body
  let content = document.body.innerHTML;
  // Replace text in the content
  content = replaceText(content, translations, lang);
  // Apply the translated content back to the body
  document.body.innerHTML = content;
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
