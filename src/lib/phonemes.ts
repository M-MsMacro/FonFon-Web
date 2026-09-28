export type PhonemeIsland = {
  id: string;
  symbol: string;
  word: string;
  letter: string;
  image: string;
};

export const PHONEME_ISLANDS: readonly PhonemeIsland[] = [
  { id: "sapo", symbol: "/s/", word: "sapo", letter: "S", image: "/islands/sapo.png" },
  { id: "hora", symbol: "r fraco", word: "hora", letter: "r", image: "/islands/hora.png" },
  { id: "zebra", symbol: "/z/", word: "zebra", letter: "Z", image: "/islands/zebra.png" },
  { id: "rato", symbol: "r forte", word: "rato", letter: "R", image: "/islands/rato.png" },
  { id: "olho", symbol: "/lh/", word: "olho", letter: "LH", image: "/islands/olho.png" },
  { id: "dente", symbol: "/d/", word: "dente", letter: "D", image: "/islands/dente.png" },
  { id: "prato", symbol: "/pr/", word: "prato", letter: "PR", image: "/islands/prato.png" },
  { id: "gato", symbol: "/g/", word: "gato", letter: "G", image: "/islands/gato.png" },
  { id: "jarra", symbol: "/j/", word: "jarra", letter: "J", image: "/islands/jarra.png" },
  { id: "carro", symbol: "/k/", word: "carro", letter: "K", image: "/islands/carro.png" },
];

const byId = new Map(PHONEME_ISLANDS.map((island) => [island.id, island]));

export const islandFor = (id: string): PhonemeIsland | undefined => byId.get(id);

export const symbolFor = (id: string): string => byId.get(id)?.symbol ?? id;
