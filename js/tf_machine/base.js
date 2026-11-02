export const MAX_CATEGORY_CHOICES = 11;

// Any new categories MUST be put at end of this list regardless of arrangement in character creator
export const CHOOSABLE_CATEGORIES = [
  // 'ears', 'shirt', 'hair', 'sleeves', 'eyes', 'pants', 'mouth', 'shoes', 'blink', 'tail', 'fur'
  'ears', 'shirt', 'hair', 'sleeves', 'eyes', 'pants', 'mouth', 'feet', 'blink', 'tail', 'fur' // fur is color only
];

export const LAYERED_CATEGORIES = new Set([
  'hair', 'ears', 'sleeves'
]);

// used for loading files & draw order - back to front
export const CATEGORY_RENDER_ORDER = [
  // original order: 'hairBack', 'earsBack', 'sleevesBack', 'tail', 'fur', 'pants', 'shirt', 'mouth', 'hairFront', 'earsFront', 'eyes', 'sleevesFront', 'shoes'
  'tail', 'hairBack', 'earsBack', 'sleevesBack', 'fur', 'shirt', 'pants', 'sleevesFront', 'feet', 'head', 'mouth', 'hairFront', 'earsFront', 'eyes'
];

export const CATEGORY_CODE_LENGTH = 4;

export const CANVAS_PIXELS_X = 150; // 174;  base fit: 62px, scale: 2.41
export const CANVAS_PIXELS_Y = 150; // 92;
export const CANVAS_ASEPRITE_DX = -52;
export const CANVAS_ASEPRITE_DY = -10; // -8;


/*
  Color Ramping: See images/tf_machine/picrew/unused/color ramps.png

  Color ramping is based around the Endesga 64 palette: https://lospec.com/palette-list/endesga-64
  Similar colors are grouped together for fill and shadow.  The first color itself is not selectable,
  but is used as a shadow color for the last element in the list.

  The code is configured to be able to process colors 4 shades deep- the base color, and the previous 4 colors
  on the ramp, wrapping back to the right side of the list.
  If any colors in the base art exist outside of these in the ramp of a specific part, they will not be processed.
*/

export class ColorRampElement {
  constructor(color, colorNumber) {
    this.color = color;
    this.colorNumber = colorNumber;
    this.prev = null;
    this.next = null;
  }
}

export class ColorRamp {
  static colorRampBaseList = [
    // ["#131313", "#1B1B1B"], // blacks - not used in color ramp
    // ["#FFFFFF"], // white - not used in color ramp
    ["#272727", "#3D3D3D", "#5D5D5D", "#858585", "#B4B4B4"], // grays
    ["#0E071B", "#1A1932", "#2A2F4E", "#424C6E", "#657392", "#92A1B9", "#C7CFDD"], // dark blues
    ["#391F21", "#5D2C28", "#8A4836", "#BF6F4A", "#E69C69", "#F6CA9F", "#F9E6CF"], // browns
    ["#8E251D", "#FF5000", "#ED7614", "#FFA214", "#FFC825", "#FFEB57"], // red-yellow
    ["#0C2E44", "#134C4C", "#1E6F50", "#33984B", "#5AC54F", "#99E65F", "#D3FC7E"], // greens
    ["#00396D", "#0069AA", "#0098DC", "#00CDF9", "#0CF1FF", "#94FDFF", "#FDD2ED", "#DB3FFD"], // blue-pink
    ["#1C121C", "#03193F", "#0C0293", "#3003D9", "#7A09FA"], // dark blue-lavender
    ["#3B1443", "#622461", "#93388F", "#CA52C9", "#F389F5"], // pinks
    ["#571C27", "#891e2B", "#C42430", "#EA323C", "#FF0040"], // reds
    ["#C64524", "#C85086", "#F5555D", "#F68187", "#E07438", "#EDAB50"] // pink-red-orange-yellow
  ];

  static categoryBaseColors = {
    'tail': '#622461',
    'hair': '#622461',
    'ears': '#622461',
    'sleeves': '#99E65F',
    'fur': '#F6CA9F',
    'shirt': '#99E65F',
    'pants': '#0098DC',
    'feet': '#657392',
    'head': '#F6CA9F', // colors unused, overridden by fur
    'mouth': '#E69C69',
    'eyes': '#FF5000',
    'blink': '#FF5000'
  };

  // Stores a mapping of the color string to ColorRampEntry.
  // Generated in colorList generator.
  static colorRampMap = {};

  // Excludes the first shade of each color for ease of random color selection
  static pickableColorList = [];

  // Flat array of colors for use with colorNumber lookups.
  // Processes color strings into ColorRampElement entries with self-aware linked list of ramps.
  // Color number is used differently based on the base color of a category, which affects how 
  // the code generator works - it's up to the code and part generation code to translate.
  static colorList = (() => {
    let rampList = [];
    let colorNumber = 0;
    for (let i = 0; i < ColorRamp.colorRampBaseList.length; i++) {
      let baseRamp = ColorRamp.colorRampBaseList[i];
      let ramp = [];
      for (let j = 0; j < baseRamp.length; j++) {
        
        let baseColor = new ColorRampElement(baseRamp[j]);
        let shadeColor = ramp[j-1];
        if (shadeColor !== undefined) {
          shadeColor.next = baseColor;
          baseColor.prev = shadeColor;
        }
        ColorRamp.colorRampMap[baseColor.color] = baseColor;
        if (j > 0) { // reserved shades are excluded from ColorNumbers since they are not pickable
          ColorRamp.pickableColorList.push(baseColor);
          baseColor.colorNumber = colorNumber;
          colorNumber += 1;
        }
        ramp.push(baseColor);
      }
      ramp[0].prev = ramp[ramp.length-1];
      ramp[ramp.length-1].next = ramp[0];
      rampList = rampList.concat(ramp);
    }
    return rampList;
  })();

  static colorNumberLookup = (() => {
    let lookup = [];
    for (let i = 0; i < ColorRamp.colorRampBaseList.length; i++) {
      let ramp = ColorRamp.colorRampBaseList.slice(1); // exclude shade-only colors
      lookup = lookup.concat(ramp[i]);
    }
    return lookup;
  })();

  
  // Cache to avoid reprocessing color ramps for a color repeatedly
  static colorRampCache = {};

  // Returns a map of the base color and the previous 4 shades on ramp to their replacement color on target color's ramp.
  static getColorRampReplacements(category, targetColor) {
    if (category === "blink") {
      // black only
      return {};
    }

    let retMap = {};

    let baseColorRampElement = ColorRamp.getBaseCategoryColorRampElement(category);

    if (baseColorRampElement.color == targetColor) {
      return {};
    }

    // Rather than regenerate over and over, return from cache if it exists
    if (baseColorRampElement.color in ColorRamp.colorRampCache && targetColor in ColorRamp.colorRampCache[baseColorRampElement.color]) {
      return ColorRamp.colorRampCache[baseColorRampElement.color][targetColor];
    }
    
    let nextBaseColor = baseColorRampElement;
    let nextTargetColor = ColorRamp.colorRampMap[targetColor];
    for (let i = 0; i < 5; i++) {
      retMap[nextBaseColor.color] = nextTargetColor.color;
      nextBaseColor = nextBaseColor.prev;
      nextTargetColor = nextTargetColor.prev;
    }

    // Store in cache
    if (!(baseColorRampElement.color in ColorRamp.colorRampCache)) {
      ColorRamp.colorRampCache[baseColorRampElement.color] = {};
    }

    ColorRamp.colorRampCache[baseColorRampElement.color][targetColor] = retMap;

    return retMap;
  }

  static getBaseCategoryColorRampElement(category) {
    let colorCategory = category;
    if (category.endsWith("Front")) {
      colorCategory = category.slice(0, category.length - 5);
    } else if (category.endsWith("Back")) {
      colorCategory = category.slice(0, category.length - 4);
    }
    return ColorRamp.colorRampMap[ColorRamp.categoryBaseColors[colorCategory]];
  }

  static getColorFromColorNumber(category, colorNumber) {
    let colorRampElement = ColorRamp.getBaseCategoryColorRampElement(category);
    let saneColorNumber = (colorRampElement.colorNumber + colorNumber) % ColorRamp.pickableColorList.length;
    return ColorRamp.pickableColorList[saneColorNumber].color;
  }

  static getColorNumberCodeFromColor(category, color) {
    let baseColorRampElement = ColorRamp.getBaseCategoryColorRampElement(category);
    let colorRampElement = ColorRamp.colorRampMap[color];
    // differs based on category - relative colorNumber is 0 for code generation purposes
    return (ColorRamp.pickableColorList.length + colorRampElement.colorNumber - baseColorRampElement.colorNumber) % ColorRamp.pickableColorList.length;
  }

  static getRandomColor(randomFunc=Math.random) {
    let colorElement = ColorRamp.pickableColorList[Math.floor(randomFunc() * ColorRamp.pickableColorList.length)];
    return colorElement.color;
  }
}


window.ColorRamp = ColorRamp;
