export const MAX_CATEGORY_CHOICES = 11;

// Any new categories MUST be put at end of this list regardless of arrangement in character creator
export const CHARACTER_CATEGORIES = [
  // 'ears', 'shirt', 'hair', 'sleeves', 'eyes', 'pants', 'mouth', 'shoes', 'blink', 'tail', 'fur'
  'ears', 'shirt', 'hair', 'sleeves', 'eyes', 'pants', 'mouth', 'shoes', 'blink', 'tail', 'fur'
];

export const LAYERED_CATEGORIES = new Set([
  'hair', 'ears', 'sleeves'
]);

// used for loading files & draw order - back to front
export const CATEGORY_RENDER_ORDER = [
  // original order: 'hairBack', 'earsBack', 'sleevesBack', 'tail', 'fur', 'pants', 'shirt', 'mouth', 'hairFront', 'earsFront', 'eyes', 'sleevesFront', 'shoes'
  'tail', 'hairBack', 'earsBack', 'sleevesBack', 'body', 'sleevesFront', 'feet', 'head', 'mouth', 'hairFront', 'earsFront', 'eyes'
];

export const CATEGORY_CODE_LENGTH = 4;

export const CANVAS_PIXELS = 70;
export const CANVAS_ASEPRITE_DX = -49;
export const CANVAS_ASEPRITE_DY = -4;