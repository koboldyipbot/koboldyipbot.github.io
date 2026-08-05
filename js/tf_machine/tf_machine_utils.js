import * as TFMachineBase from 'tfMachineBase';
import {getPart} from 'svgUtils';

const INVALID_CHARACTER_REGEX = /[^0-9a-zA-Z]/;
const DIGIT_NUMBER_MAP = {};
const VALID_DIGIT_STRING = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (let i = 0; i < VALID_DIGIT_STRING.length; i++) {
  DIGIT_NUMBER_MAP[VALID_DIGIT_STRING[i]] = i;
}


export class CatgirlAvatar {
  constructor (characterDiv) {
    this.parts = null;
    this.baseImg = null;
    this.blinkImg = null;
    this.blinkingStarted = false;
  }

  interpretCode(code) {
    /**
     *  Interpolates the provided customization code.
     *  Returns a map of layered part category names to the corresponding image of that layered category part.
     *  Supports adding extra categories.
     * 
     *  `code`: 44 character encoded string
     *    valid characters: 0-9, a-z, A-Z - supports 3844 choices per category.
     * 
     *    Each 4 digits represent a category code for the specific part in the first 2 digits, 
     *        and its selected color in the last 2 digits:
     *    - 0-3: Ears
     *    - 4-7: Shirt
     *    - 8-11: Hair
     *    - 12-15: Sleeves
     *    - 16-19: Eyes
     *    - 20-23: Pants
     *    - 24-27: Mouth
     *    - 28-31: Shoes
     *    - 32-35: Blink
     *    - 36-39: Tail
     *    - 40-43: Fur (skin color on all parts)
     */
    let that = this;

    if (code == null) {
      code = Array.from({length: 44}, () => "0").join("")
    }

    // reject if there are invalid characters
    if (code.match(INVALID_CHARACTER_REGEX)) {
      throw new Error(`"${code}" contains invalid regex - valid characters are numbers or letters only.`);
    }

    // If too short, just pad out with 0's.
    if (code.length < TFMachineBase.CHARACTER_CATEGORIES.length * 4) {
      code = `${code}${new Array(TFMachineBase.CHARACTER_CATEGORIES.length * 4 - code.length + 1).join('0')}`;
    }

    // If too long: We'll just ignore the excess.

    // Return all parts as a map to render both blink and non-blink
    let startIndex = 0;
    that.parts = {};
    // only one head right now
    that.parts['head'] = `head1`;

    for (let i = 0; i < TFMachineBase.CHARACTER_CATEGORIES.length; i++) {
      let category = TFMachineBase.CHARACTER_CATEGORIES[i];
      // let endIndex = startIndex + CATEGORY_CODE_LENGTH - 1;
      let partCode = code.slice(startIndex, startIndex+2);
      let colorCode = code.slice(startIndex+2, startIndex+4);
      let partFileNumber = 0;
      let colorNumber = 0;
      for (let digit = 1; digit >= 0; digit--) {
        partFileNumber += DIGIT_NUMBER_MAP[partCode[digit]] * (2 - digit) * VALID_DIGIT_STRING.length;
        colorNumber += DIGIT_NUMBER_MAP[colorCode[digit]] * (2 - digit) * VALID_DIGIT_STRING.length;
      }

      if (category === 'shirt' || category === 'pants') {
        // currently conjoined in 'body', just use shirt for now
        // parts['shirt'] = `body${fileNumber}`;
        that.parts['shirt'] = {fileNumber: partFileNumber, colorNumber: colorNumber};
        that.parts['pants'] = null;
      } else if (TFMachineBase.LAYERED_CATEGORIES.has(category)) {
        that.parts[`${category}Front`] = {fileNumber: partFileNumber, colorNumber: colorNumber}; // `${category}Front${fileNumber}` // `images/tf_machine/catgirls/${fileCode}/${category}Front.png`;
        that.parts[`${category}Back`] = {fileNumber: partFileNumber, colorNumber: colorNumber}; // `${category}Back${fileNumber}` // `images/tf_machine/catgirls/${fileCode}/${category}Back.png`;
      } else if (category === 'fur') {
        that.parts['fur'] = colorNumber;
      } else {
        that.parts[category] = {fileNumber: partFileNumber, colorNumber: colorNumber}; // `${category}${fileNumber}`; // `images/tf_machine/catgirls/${fileCode}/${category}.png`;
      }
    }

    // return parts;
  }

  async renderCatgirl() {
    let that = this;

    if (that.baseImg == null) {
      that.interpretCode();
    }

    let eyesCanvas = document.createElement('canvas');
    let blinkCanvas = document.createElement('canvas');
    
    eyesCanvas.width = TFMachineBase.CANVAS_PIXELS;
    eyesCanvas.height = TFMachineBase.CANVAS_PIXELS;
    let eyesCtx = eyesCanvas.getContext("2d");

    blinkCanvas.width = TFMachineBase.CANVAS_PIXELS;
    blinkCanvas.height = TFMachineBase.CANVAS_PIXELS;
    let blinkCtx = blinkCanvas.getContext("2d");

    for (let i = 0; i < TFMachineBase.CATEGORY_RENDER_ORDER.length; i++) {
      let part = TFMachineBase.CATEGORY_RENDER_ORDER[i];

      if (part === 'eyes') {
        let eyesImg = getPart('eyes', that.parts['eyes']['fileNumber'], that.parts['eyes']['colorNumber']);
        eyesCtx.drawImage(eyesImg, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);

        let blinkImg = getPart('blink', that.parts['blink']['fileNumber'], that.parts['blink']['colorNumber']);
        blinkCtx.drawImage(blinkImg, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);
      } else if (part === 'fur') {
        // handled by SVG handler?
        // let bodyImg = new Image();
        // bodyImg.src = parts['body'];
        // eyesCtx.drawImage(bodyImg, CANVAS_ASEPRITE_DX, CANVAS_ASEPRITE_DY, CANVAS_PIXELS, CANVAS_PIXELS);
        // blinkCtx.drawImage(bodyImg, CANVAS_ASEPRITE_DX, CANVAS_ASEPRITE_DY, CANVAS_PIXELS, CANVAS_PIXELS);

        // let headImg = new Image();
        // headImg.src = parts['head'];
        // eyesCtx.drawImage(headImg, CANVAS_ASEPRITE_DX, CANVAS_ASEPRITE_DY, CANVAS_PIXELS, CANVAS_PIXELS);
        // blinkCtx.drawImage(headImg, CANVAS_ASEPRITE_DX, CANVAS_ASEPRITE_DY, CANVAS_PIXELS, CANVAS_PIXELS);
      } else {
        console.log(`part: ${part}`);
        let img = getPart(part, that.parts[part]['fileNumber'], that.parts[part]['colorNumber']);
        console.log(img);
        eyesCtx.drawImage(img, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);
        blinkCtx.drawImage(img, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);
      }
    }

    that.baseImg = eyesCanvas.toDataURL('image/png'); // about:config: privacy.resistFingerprinting needs to be false
    that.blinkImg = blinkCanvas.toDataURL('image/png');

    if (!that.blinkingStarted) {
      that.unblinkFunction();
      that.blinkingStarted = true;
    }
  }

  blinkFunction() {
    that.baseImg.style.display = 'none';
    that.blinkImg.style.display = 'block';
    setTimeout(Math.floor(Math.random() * 50) + 50, unblinkFunction);
  }

  unblinkFunction() {
    that.baseImg.style.display = 'block';
    that.blinkImg.style.display = 'none';
    setTimeout(Math.floor(Math.random() * 500) + 500, blinkFunction);
  }
}