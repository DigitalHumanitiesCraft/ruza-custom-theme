async function fetchTranslations() {
  try {
    const response = await fetch("/themes/ruza-custom-theme/asset/js/translations.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch translations:", error);
  }
}

function replaceText(node, translations, lang) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.textContent;
    Object.keys(translations).forEach((key) => {
      const translation = translations[key][lang];
      if (translation && text.includes(key)) {
        text = text.replace(new RegExp(key, "g"), translation);
      }
    });
    node.textContent = text;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach((child) => replaceText(child, translations, lang));
  }
}

function translatePage(lang) {
  fetchTranslations().then((translations) => {
    if (!translations) return;
    document.querySelectorAll("body, body *").forEach((element) => {
      replaceText(element, translations, lang);
    });
  });
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
  window.onload = () => translatePage(language);
}

//just a testcomment to see if git push is working

//another comment to see if the cronjob every hour works:)