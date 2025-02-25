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

async function translateToEnglish(germanText) {
  const translations = await fetchTranslations();

  // Sort keys by length in descending order
  const sortedKeys = Object.keys(translations).sort(
    (a, b) => b.length - a.length
  );

  const translatedParts = [];

  for (const key of sortedKeys) {
    // Escape the key for use in regex
    let escapedKey = escapeRegExp(key);

    // Handle parentheses specially
    escapedKey = escapedKey
      .replace(/\\\(/g, "(?:\\(|\\s|^)")
      .replace(/\\\)/g, "(?:\\)|\\s|$)");

    // Create a regex that allows for word boundaries or punctuation
    const regex = new RegExp(
      `(^|\\s|[.,;:!?])${escapedKey}(?=$|\\s|[.,;:!?])`,
      "gi"
    );

    germanText = germanText.replace(regex, (match, prefix, offset) => {
      // Check if this part has already been translated
      for (const part of translatedParts) {
        if (offset >= part.start && offset < part.end) {
          return match; // Skip translation if already translated
        }
      }

      // If not translated, perform the translation
      const translation = prefix + translations[key].en;

      // Mark this portion as translated
      translatedParts.push({
        start: offset,
        end: offset + match.length,
        original: match,
        translated: translation,
      });

      return translation;
    });
  }

  return germanText;
}

function shouldTranslateElement(element) {
  // um anchor delay zu verhindern
  if (window.isAnchorScrolling()) return false;

  // Check if the element or its ancestors have the excluded classes
  if (element.closest(".page-row, .song-intertext")) {
    // Exception 1: Allow translation for <a> tags with text "Mehr" and class "btn"
    if (
      element.tagName === "A" &&
      element.classList.contains("btn") &&
      element.textContent.trim() === "Mehr"
    ) {
      return true;
    }

    // Exception 2: Allow translation for <details> elements and their descendants
    if (element.closest("details")) {
      return true;
    }

    // For all other elements within excluded classes, don't translate
    return false;
  }

  // Exclude translation for a span with the text "Walter Deutsch"
  if (
    element.tagName === "SPAN" &&
    element.textContent.trim() === "Walter Deutsch"
  ) {
    return false;
  }

  // Translate elements not within excluded classes
  return true;
}

function updateLinks() {
  const links = document.querySelectorAll("a:not(.language-picker a)");
  const englishPath = "/s/ruzakegila-en/";
  const romanesPath = "/s/ruzakegila-rom/";
  const germanPath = "/s/ruzakegila/";

  links.forEach((link) => {
    if (link.href.includes(germanPath)) {
      // Check current site version to determine correct path
      const currentPath = window.location.href;
      let newPath = germanPath;

      if (currentPath.includes("ruzakegila-en")) {
        newPath = englishPath;
      } else if (currentPath.includes("ruzakegila-rom")) {
        newPath = romanesPath;
      }

      if (newPath !== germanPath) {
        link.href = link.href.replace(germanPath, newPath);
      }
    }
  });
}

async function translateAttributes(element) {
  const attributesToTranslate = [
    "alt",
    "title",
    "placeholder",
    "aria-label",
    "data-bs-content",
    "data-bs-title",
    "data-bs-original-title",
  ];

  for (let attr of attributesToTranslate) {
    if (element.hasAttribute(attr)) {
      element.setAttribute(
        attr,
        await translateToEnglish(element.getAttribute(attr))
      );
    }
  }
}

async function translateSelectOptions(selectElement) {
  for (let option of selectElement.options) {
    option.text = await translateToEnglish(option.text);
    option.value = await translateToEnglish(option.value);
  }
}

async function translatePage() {
  // Translate text nodes
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        return shouldTranslateElement(node.parentElement)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  let textNode;
  while ((textNode = walker.nextNode())) {
    if (textNode.nodeValue.trim()) {
      textNode.nodeValue = await translateToEnglish(textNode.nodeValue);
    }
  }

  // Translate attributes
  const elements = document.body.getElementsByTagName("*");
  for (let element of elements) {
    if (shouldTranslateElement(element)) {
      await translateAttributes(element);
    }
  }

  // Translate select options
  const selectElements = document.querySelectorAll(
    "select.form-select.filter-options"
  );
  for (let select of selectElements) {
    if (shouldTranslateElement(select)) {
      await translateSelectOptions(select);
    }
  }

  // Update links
  updateLinks();
  // Dispatch event when translations are complete
  document.dispatchEvent(new CustomEvent("translationsComplete"));
}

// Check URL and initiate translation if needed
function checkUrlAndTranslate() {
  const url = window.location.href;

  // Determine language based on URL
  let lang = "de";
  if (url.includes("ruzakegila-en")) {
    lang = "en";
  } else if (url.includes("ruzakegila-rom")) {
    lang = "rom";
  }

  // Change HTML lang attribute based on the URL
  document.documentElement.setAttribute("lang", lang);

  // Apply English translations for both English and Romanes sites
  if (url.includes("ruzakegila-en") || url.includes("ruzakegila-rom")) {
    translatePage();
  }
}

// Run the check when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", checkUrlAndTranslate);

// Also run the check when the history state changes (for single-page applications)
window.addEventListener("popstate", checkUrlAndTranslate);

/* // Updated test cases
async function runTestCases() {
  console.log(await translateToEnglish("musikalische Transkription"));
  console.log(await translateToEnglish("Wiener Zeitung"));
  console.log(await translateToEnglish("Ruža Nikolić-Lakatos über die langsame Lieder"));
  console.log(await translateToEnglish("Deutsch")); // Should output: "Guitar"
  console.log(await translateToEnglish("Gitarre:")); // Should output: "Guitar:"
  console.log(await translateToEnglish("Die Familie Nikolić mit Mozes F. Heinschink (rechts)")); // Should output: "The Nikolić family with Mozes F. Heinschink (right)"
  console.log(await translateToEnglish("Liedaufnahme während eines Geburtstagsfeier von Ruža Nikolić-Lakatos")); // Should output: "Recording during Ruža Nikolić-Lakatos' birthday party"
  console.log(await translateToEnglish("Ein Text mit Gitarre und Aufnahme")); // Should output: "Ein Text mit Guitar und Recording"
  console.log(await translateToEnglish("Unbekannter Text")); // Should output: "Unbekannter Text" (not translated)
  console.log(await translateToEnglish("Alle Genres und Alle Themen")); // Should output: "All Genres und All Topics"
  console.log(await translateToEnglish("Gitarre, Aufnahme; Gitarre: Aufnahme")); // Should output: "Guitar, Recording; Guitar: Recording"
}


// Run test cases when in development environment
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  runTestCases();
} */
