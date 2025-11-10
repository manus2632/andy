/**
 * Mapping von deutschen/internationalen Ländernamen zu DB-Namen
 */

interface LaenderMapping {
  [key: string]: string;
}

// Mapping: Varianten → DB-Name
const LAENDER_MAPPING: LaenderMapping = {
  // Deutschland
  "deutschland": "Germany",
  "germany": "Germany",
  "de": "Germany",
  "deu": "Germany",
  
  // Österreich
  "österreich": "Austria",
  "oesterreich": "Austria",
  "austria": "Austria",
  "at": "Austria",
  "aut": "Austria",
  
  // Schweiz
  "schweiz": "Switzerland",
  "switzerland": "Switzerland",
  "ch": "Switzerland",
  "che": "Switzerland",
  
  // Frankreich
  "frankreich": "France",
  "france": "France",
  "fr": "France",
  "fra": "France",
  
  // Italien
  "italien": "Italy",
  "italy": "Italy",
  "it": "Italy",
  "ita": "Italy",
  
  // Spanien
  "spanien": "Spain",
  "spain": "Spain",
  "es": "Spain",
  "esp": "Spain",
  
  // Niederlande
  "niederlande": "Netherlands",
  "netherlands": "Netherlands",
  "holland": "Netherlands",
  "nl": "Netherlands",
  "nld": "Netherlands",
  
  // Belgien
  "belgien": "Belgium",
  "belgium": "Belgium",
  "be": "Belgium",
  "bel": "Belgium",
  
  // Polen
  "polen": "Poland",
  "poland": "Poland",
  "pl": "Poland",
  "pol": "Poland",
  
  // Tschechien
  "tschechien": "Czech Republic",
  "tschechische republik": "Czech Republic",
  "czech republic": "Czech Republic",
  "czechia": "Czech Republic",
  "cz": "Czech Republic",
  "cze": "Czech Republic",
  
  // UK
  "vereinigtes königreich": "United Kingdom",
  "vereinigtes koenigreich": "United Kingdom",
  "united kingdom": "United Kingdom",
  "großbritannien": "United Kingdom",
  "grossbritannien": "United Kingdom",
  "great britain": "United Kingdom",
  "uk": "United Kingdom",
  "gb": "United Kingdom",
  "gbr": "United Kingdom",
  
  // USA
  "vereinigte staaten": "United States",
  "united states": "United States",
  "usa": "United States",
  "us": "United States",
  "amerika": "United States",
  "america": "United States",
  
  // Kanada
  "kanada": "Canada",
  "canada": "Canada",
  "ca": "Canada",
  "can": "Canada",
  
  // Schweden
  "schweden": "Sweden",
  "sweden": "Sweden",
  "se": "Sweden",
  "swe": "Sweden",
  
  // Norwegen
  "norwegen": "Norway",
  "norway": "Norway",
  "no": "Norway",
  "nor": "Norway",
  
  // Dänemark
  "dänemark": "Denmark",
  "daenemark": "Denmark",
  "denmark": "Denmark",
  "dk": "Denmark",
  "dnk": "Denmark",
  
  // Finnland
  "finnland": "Finland",
  "finland": "Finland",
  "fi": "Finland",
  "fin": "Finland",
  
  // Portugal
  "portugal": "Portugal",
  "pt": "Portugal",
  "prt": "Portugal",
  
  // Griechenland
  "griechenland": "Greece",
  "greece": "Greece",
  "gr": "Greece",
  "grc": "Greece",
  
  // Türkei
  "türkei": "Turkey",
  "tuerkei": "Turkey",
  "turkey": "Turkey",
  "tr": "Turkey",
  "tur": "Turkey",
};

/**
 * Ordnet extrahierte Ländernamen DB-Ländern zu
 * @param extrahierteLaender Array von Ländernamen aus LLM-Extraktion
 * @param dbLaender Array von Ländern aus DB
 * @returns Array von DB-Länder-IDs
 */
export function matcheLaender(
  extrahierteLaender: string[],
  dbLaender: Array<{ id: number; name: string }>
): number[] {
  const gematchteIds: number[] = [];
  
  for (const extrahiertesLand of extrahierteLaender) {
    const normalized = extrahiertesLand.toLowerCase().trim();
    
    // 1. Versuch: Direktes Mapping
    const mappedName = LAENDER_MAPPING[normalized];
    if (mappedName) {
      const dbLand = dbLaender.find(l => l.name.toLowerCase() === mappedName.toLowerCase());
      if (dbLand && !gematchteIds.includes(dbLand.id)) {
        gematchteIds.push(dbLand.id);
        continue;
      }
    }
    
    // 2. Versuch: Exakte Übereinstimmung mit DB-Namen
    const exactMatch = dbLaender.find(l => l.name.toLowerCase() === normalized);
    if (exactMatch && !gematchteIds.includes(exactMatch.id)) {
      gematchteIds.push(exactMatch.id);
      continue;
    }
    
    // 3. Versuch: Teilstring-Match (z.B. "Czech" matched "Czech Republic")
    const partialMatch = dbLaender.find(l => 
      l.name.toLowerCase().includes(normalized) || 
      normalized.includes(l.name.toLowerCase())
    );
    if (partialMatch && !gematchteIds.includes(partialMatch.id)) {
      gematchteIds.push(partialMatch.id);
    }
  }
  
  return gematchteIds;
}
