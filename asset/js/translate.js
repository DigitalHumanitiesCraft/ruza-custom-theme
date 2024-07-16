// Trie data structure for efficient string matching
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.translation = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, translation) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
    node.translation = translation;
  }
}

// Function to fetch translations from JSON file
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

// Function to build Trie from translations
function buildTrie(translations, lang) {
  const trie = new Trie();
  for (const [key, value] of Object.entries(translations)) {
    if (value[lang]) {
      trie.insert(key.toLowerCase(), value[lang]);
    }
  }
  return trie;
}

// Improved replaceText function using Trie for efficient matching
function replaceText(content, trie, lang) {
  const words = content.split(/(\s+)/);
  const result = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (/\s+/.test(word)) {
      result.push(word);
      continue;
    }

    let node = trie.root;
    let j = i;
    let longestMatch = null;
    let longestMatchIndex = i;

    while (j < words.length && node) {
      const currentWord = words[j].toLowerCase();
      for (const char of currentWord) {
        if (!node.children.has(char)) {
          break;
        }
        node = node.children.get(char);
        if (node.isEndOfWord) {
          longestMatch = node.translation;
          longestMatchIndex = j;
        }
      }
      if (node && node.children.size > 0) {
        j++;
      } else {
        break;
      }
    }

    if (longestMatch) {
      result.push(longestMatch);
      i = longestMatchIndex;
    } else {
      result.push(word);
    }
  }

  return result.join("");
}

// Improved translatePage function
async function translatePage(lang) {
  const translations = await fetchTranslations();
  if (!translations) return;

  const trie = buildTrie(translations, lang);

  // Get all text nodes in the body
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    node.textContent = replaceText(node.textContent, trie, lang);
  }
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

// Main execution
const language = detectLanguage();
if (language) {
  // Use DOMContentLoaded to ensure translation is applied as soon as possible
  document.addEventListener("DOMContentLoaded", () => {
    translatePage(language);
  });
}
