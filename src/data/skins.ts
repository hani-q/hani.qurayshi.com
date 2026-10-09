// Site themes ("skins"), picked from the theme menu beside the mode toggle and stored in
// localStorage ("sf-skin"). Each has a dark and a light set in src/styles/skins.css, keyed by
// data-skin on the theme root; "default" sets no attribute. The swatch (paper, then the H and Q
// colours) only draws the menu chip. Only Default (no data-skin) cycles the HQ mark through its
// palettes (the page accents following it); every other skin draws the mark in one colour.
// fonts is the Google Fonts css2 family query for the skin's typefaces, loaded only when the
// skin is chosen (the stacks that use them are --sf-font/--sf-head/--sf-mono in skins.css).
export interface Skin {
  id: string;
  name: string;
  swatch: [string, string, string];
  fonts?: string;
}

export const skins: Skin[] = [
  { id: "default", name: "Default", swatch: ["#0D0D0D", "#3587C7", "#329A6D"] },
  { id: "neon", name: "Neon void", swatch: ["#060606", "#E3001B", "#F7B500"], fonts: "family=Orbitron:wght@600;800&family=Exo+2:wght@400;500;600;700" },
  { id: "pop", name: "Palette pop", swatch: ["#0E0E10", "#E0068C", "#1F6FD0"], fonts: "family=Archivo+Black&family=Work+Sans:wght@400;500;600;700" },
  { id: "blueprint", name: "Blueprint", swatch: ["#0E3A6B", "#DCEBFF", "#FFD36B"], fonts: "family=Architects+Daughter&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500" },
  { id: "exploded", name: "Exploded view", swatch: ["#131313", "#E3001B", "#F7B500"], fonts: "family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700" },
  { id: "ascii", name: "ASCII terminal", swatch: ["#030703", "#4DFF6A", "#D6FFD6"], fonts: "family=VT323&family=JetBrains+Mono:wght@700" },
  { id: "halftone", name: "Halftone print", swatch: ["#F4EFE2", "#D6001C", "#FFC21A"], fonts: "family=Bangers&family=Comic+Neue:wght@400;700" },
  { id: "swiss", name: "Swiss poster", swatch: ["#E3001B", "#FFFFFF", "#111111"], fonts: "family=Inter+Tight:wght@400;500;600;700;800" },
  { id: "moire", name: "Moiré rings", swatch: ["#070707", "#E3001B", "#F7B500"], fonts: "family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600;700" },
  { id: "boot", name: "Boot screen", swatch: ["#000000", "#E3001B", "#00A99D"], fonts: "family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Nunito+Sans:wght@400;600;700" },
  { id: "aurora", name: "Aurora mesh", swatch: ["#3587C7", "#E0068C", "#F7B500"], fonts: "family=Outfit:wght@400;500;600;700" },
  { id: "holo", name: "Holo card", swatch: ["#FF9AD5", "#9AD5FF", "#B6FFB0"], fonts: "family=Russo+One&family=Rubik:wght@400;500;600;700" },
];
