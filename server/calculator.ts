export interface PreisBerechnung {
  basispreis: number;
  rabattProzent: number;
  preisProLand: number;
  gesamtpreis: number;
  anzahlLaender: number;
}

export function calculatePrice(
  bausteinPreise: number[],
  anzahlLaender: number,
  lieferart: "einmalig" | "rahmenvertrag"
): PreisBerechnung {
  // Basispreis: Summe aller Bausteinpreise
  const basispreis = bausteinPreise.reduce((sum, preis) => sum + preis, 0);

  // Rabatt ermitteln
  let rabattProzent = 0;

  if (lieferart === "rahmenvertrag") {
    rabattProzent = 16;
  } else {
    // Einmalige Lieferung mit Mengenrabatt
    if (anzahlLaender >= 15) {
      rabattProzent = 22;
    } else if (anzahlLaender >= 10) {
      rabattProzent = 17;
    } else if (anzahlLaender >= 5) {
      rabattProzent = 9;
    } else if (anzahlLaender >= 2) {
      rabattProzent = 4;
    }
  }

  // Preis pro Land nach Rabatt
  const preisProLand = Math.round(basispreis * (1 - rabattProzent / 100));

  // Gesamtpreis
  const gesamtpreis = preisProLand * anzahlLaender;

  return {
    basispreis,
    rabattProzent,
    preisProLand,
    gesamtpreis,
    anzahlLaender,
  };
}
