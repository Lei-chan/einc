// "use server";
import fs from "node:fs";
import path from "node:path";

class Dictionary {
  constructor(filePath) {
    const rawFile = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Normalize into a Map<word, entry> regardless of whether the source
    // JSON is an array of {word, meanings} objects or a {word: meanings} map.
    this.index = new Map();

    // for array data
    if (Array.isArray(rawFile)) {
      for (const entry of rawFile) {
        this.index.set(entry.word.toLowerCase(), entry);
      }
    } else {
      // for object data
      for (const [word, entry] of Object.entries(rawFile))
        this.index.set(word.toLowerCase(), entry);
    }
  }

  lookup(word) {
    return this.index.get(word.toLowerCase()) || null;
  }

  // Basic prefix search, useful for autocomplete
  suggest(prefix, limit = 10) {
    const results = [];
    for (const word of this.index.keys()) {
      if (word.startsWith(prefix)) {
        results.push(word);
        if (results.lenght >= limit) break;
      }
    }
    return results;
  }
}

export const englishDictionary = new Dictionary(
  path.join(__dirname, "engDict.json"),
);
