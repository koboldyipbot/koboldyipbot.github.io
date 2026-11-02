import * as TFMachineBase from 'tfMachineBase';
import * as TFMachineUtils from 'tfMachineUtils';
import {saveCode, loadCode} from 'userConfig';
import {BASE_SVGS, drawSVGOnCanvas, getPart, getRandomPart} from 'svgUtils';
import {TwitchUtils} from 'twitchUtils';

/**
 * Usage: Instantiate, then either run interpretCode or randomizeCharacter, then renderTFed.
 * 
 * interpretCode:
 *   let character = new TFAvatar();
 *   let code = someKindOfValueFromInput;
 *   activeCharacter.interpretCode(code).then(() => {
 * 
 */
export class TFAvatar {
  // helper map for quick code index lookups
  static CODE_MAP = (() => {
    let retMap = {};
    for (let i = 0; i < TFMachineBase.CHOOSABLE_CATEGORIES.length; i++) {
      let category = TFMachineBase.CHOOSABLE_CATEGORIES[i];
      retMap[category] = i * 4;
    }
    return retMap;
  })();

  constructor (username = null) {
    this.username = username;
    this._code = null;
    this.parts = null;
    this.baseImg = null;
    this.blinkImg = null;
    this.blinkingStarted = false;
    this.matterSprite = null;
    this.ceased = false; // set to true to stop all animations and related functions managed in this code
  }

  cease() {
    this.ceased = true;
  }

  // should only ever be set by interpretCode
  get code() {
    return this._code;
  }

  async interpretCode(code = null) {
    /**
     *  Interpolates the provided customization code.
     *  Returns a map of layered part category names to the corresponding image of that layered category part.
     *  Supports adding extra categories.
     * 
     *  `code`: 44 character encoded string
     *    valid characters: 0-9, a-z, A-Z - supports 3844 choices per category.
     * 
     *    Each 4 digits represent a category part number for the specific part in the first 2 digits, 
     *        and its selected color in the last 2 digits:
     *    - 0-3: Ears
     *    - 4-7: Shirt
     *    - 8-11: Hair
     *    - 12-15: Sleeves
     *    - 16-19: Eyes
     *    - 20-23: Pants
     *    - 24-27: Mouth
     *    - 28-31: Feet
     *    - 32-35: Blink
     *    - 36-39: Tail
     *    - 40-43: Fur (skin color on all parts)
     * 
     *  Part 1 of each category represents "nothing" on a part.
     */
    let that = this;

    code = code || null;

    if (code === null && that.username !== null) {
      code = loadCode(that.username);
    } else if (code === null) {
      code = Array.from({length: TFMachineBase.CHOOSABLE_CATEGORIES.length}, () => { return "0100" }).join("");
    }

    // reject if there are invalid characters
    if (code.match(TFMachineUtils.INVALID_CHARACTER_REGEX)) {
      throw new Error(`"${code}" contains invalid regex - valid characters are numbers or letters only.`);
    } 

    // If too short, just pad out with 0's.
    if (code.length < TFMachineBase.CHOOSABLE_CATEGORIES.length * 4) {
      code = `${code}${new Array(TFMachineBase.CHOOSABLE_CATEGORIES.length * 4 - code.length + 1).join('0')}`;
    }

    // If too long: We'll just ignore the excess.
    if (code.length > TFMachineBase.CHOOSABLE_CATEGORIES.length * 4) {
      code = code.slice(0, TFMachineBase.CHOOSABLE_CATEGORIES.length * 4);
    }

    // no-op if code is the same
    if (code === that.code) {
      return;
    }

    // this should be the only place we ever set the code
    that._code = code;

    // save it to storage if we're managing a user
    if (that.username !== null) {
      saveCode(that.username, that.code);
    }

    // Return all parts as a map to render both blink and non-blink
    that.parts = {};

    // only one head right now
    that.parts['head'] = {fileNumber: 2, color: TFMachineBase.ColorRamp.categoryBaseColors['head']};

    for (let i = 0; i < TFMachineBase.CHOOSABLE_CATEGORIES.length; i++) {
      let category = TFMachineBase.CHOOSABLE_CATEGORIES[i];
      // let endIndex = startIndex + CATEGORY_CODE_LENGTH - 1;
      let startIndex = i * 4;
      let partCode = code.slice(startIndex, startIndex+2);
      let colorCode = code.slice(startIndex+2, startIndex+4);
      let partFileNumber = 1;
      let colorNumber = 0;
      let multiplier = 1;
      for (let digit = 1; digit >= 0; digit--) {
        partFileNumber += TFMachineUtils.DIGIT_NUMBER_MAP[partCode[digit]] * multiplier;
        colorNumber += TFMachineUtils.DIGIT_NUMBER_MAP[colorCode[digit]] * multiplier;
        multiplier = multiplier * TFMachineUtils.VALID_DIGIT_STRING.length;
      }

      let color = TFMachineBase.ColorRamp.getColorFromColorNumber(category, colorNumber); // the color string
      if (TFMachineBase.LAYERED_CATEGORIES.has(category)) {
        let safePartFileNumber = partFileNumber % BASE_SVGS[`${category}Front`].parts.length;
        if (safePartFileNumber === 0) {
          safePartFileNumber = BASE_SVGS[`${category}Front`].parts.length;
        }
        that.parts[`${category}Front`] = {fileNumber: safePartFileNumber, color: color}; // `${category}Front${fileNumber}` // `images/tf_machine/catgirls/${fileCode}/${category}Front.png`;
        that.parts[`${category}Back`] = {fileNumber: safePartFileNumber, color: color}; // `${category}Back${fileNumber}` // `images/tf_machine/catgirls/${fileCode}/${category}Back.png`;
      } else if (category === 'fur') {
        that.parts['fur'] = {fileNumber: 2, color: color};
      // } else if (category === 'blink' || category === 'eyes') {
        // that.parts[category] = {fileNumber: partFileNumber, color: TFMachineBase.ColorRamp.categoryBaseColors[category]};
      } else {
        let safePartFileNumber = partFileNumber % BASE_SVGS[category].parts.length;
        if (safePartFileNumber === 0) {
          safePartFileNumber = BASE_SVGS[category].parts.length;
        }
        that.parts[category] = {fileNumber: safePartFileNumber, color: color}; // `${category}${fileNumber}`; // `images/tf_machine/catgirls/${fileCode}/${category}.png`;
      }
    }
  }

  async changePart(category, partFileNumber, color) {
    let that = this;

    // update code & rerender
    let codePrefix = that.code.slice(0, TFAvatar.CODE_MAP[category]);
    let codePostfix = that.code.slice(TFAvatar.CODE_MAP[category] + 4, that.code.length);
    let newPartCode = TFAvatar.getPartCode(category, partFileNumber, color);
    let newCode = `${codePrefix}${newPartCode}${codePostfix}`;
    that.interpretCode(newCode).then(() => {
      that.renderTFed();
    });
  }

  async prevPart(topCategory) {
    let that = this;
    let category = topCategory;
    if (TFMachineBase.LAYERED_CATEGORIES.has(category)) {
      category = `${category}Front`;
    }

    let pickable = BASE_SVGS[category].pickable;
    let pickableIndexMap = BASE_SVGS[category].pickableIndexMap;
    let partFileNumber = that.parts[category].fileNumber;

    let curPickableIndex = pickableIndexMap[partFileNumber-1];
    let prevPickableIndex = (curPickableIndex - 1 + pickable.length) % pickable.length;
    let newPartFileNumber = pickable[prevPickableIndex] + 1;
    that.changePart(topCategory, newPartFileNumber, that.parts[category].color);
  }

  async nextPart(topCategory) {
    let that = this;
    let category = topCategory;
    if (TFMachineBase.LAYERED_CATEGORIES.has(category)) {
      category = `${category}Front`;
    }

    let pickable = BASE_SVGS[category].pickable;
    let pickableIndexMap = BASE_SVGS[category].pickableIndexMap;
    let partFileNumber = that.parts[category].fileNumber;

    let curPickableIndex = pickableIndexMap[partFileNumber-1];
    let nextPickableIndex = (curPickableIndex + 1) % pickable.length;
    let newPartFileNumber = pickable[nextPickableIndex] + 1;
    that.changePart(topCategory, newPartFileNumber, that.parts[category].color);
  }

  static getPartCode(category, partFileNumber, color) {
    let partCode = `${TFMachineUtils.VALID_DIGIT_STRING[Math.floor((partFileNumber-1) / TFMachineUtils.VALID_DIGIT_STRING.length)]}${TFMachineUtils.VALID_DIGIT_STRING[(partFileNumber-1) % TFMachineUtils.VALID_DIGIT_STRING.length]}`;
    let colorNumber = ColorRamp.getColorNumberCodeFromColor(category, color);
    let colorCode = `${TFMachineUtils.VALID_DIGIT_STRING[Math.floor(colorNumber / TFMachineUtils.VALID_DIGIT_STRING.length)]}${TFMachineUtils.VALID_DIGIT_STRING[colorNumber % TFMachineUtils.VALID_DIGIT_STRING.length]}`;
    return `${partCode}${colorCode}`;
  }

  async randomizeCharacter(seedString = null) {
    let that = this;
    // Generate a random tfed character and return the code used to generate it.
    let code = '';
    
    let rng = new Srand();
    if (seedString !== null) {
      rng.seed(TwitchUtils.interpolateUsernameToSeed(seedString));
    }
    function random() {
      let roll = rng.random();
      return roll;
    }
    for (let i = 0; i < TFMachineBase.CHOOSABLE_CATEGORIES.length; i++) {
      let category = TFMachineBase.CHOOSABLE_CATEGORIES[i];
      let flattenedCategory = category;
      if (TFMachineBase.LAYERED_CATEGORIES.has(category)) {
        flattenedCategory = `${category}Back`;
      }

      let partFileNumber = BASE_SVGS[flattenedCategory].randomList[Math.floor(random() * BASE_SVGS[flattenedCategory].randomList.length)] + 1;
      
      let color = TFMachineBase.ColorRamp.getRandomColor(random);
      code = code.concat(TFAvatar.getPartCode(category, partFileNumber, color));
    }
    await that.interpretCode(code);
  }

  renderTFed() {
    return new Promise(resolve => {
      let that = this;

      if (that.code === null) {
        that.interpretCode();
      }

      let eyesCanvas = document.createElement('canvas');
      let blinkCanvas = document.createElement('canvas');
      
      // eyesCanvas.width = TFMachineBase.CANVAS_PIXELS_X * 3;
      // eyesCanvas.height = TFMachineBase.CANVAS_PIXELS_Y * 3;
      // let eyesCtx = eyesCanvas.getContext("2d");
      // eyesCtx.scale(2.41*3, 2.41*3);

      // blinkCanvas.width = TFMachineBase.CANVAS_PIXELS_X * 3;
      // blinkCanvas.height = TFMachineBase.CANVAS_PIXELS_Y * 3;
      // let blinkCtx = blinkCanvas.getContext("2d");
      // blinkCtx.scale(2.41*3, 2.41*3);
      eyesCanvas.width = TFMachineBase.CANVAS_PIXELS_X * 5;
      eyesCanvas.height = TFMachineBase.CANVAS_PIXELS_Y * 5;
      let eyesCtx = eyesCanvas.getContext("2d");
      eyesCtx.scale(12, 12);

      blinkCanvas.width = TFMachineBase.CANVAS_PIXELS_X * 5;
      blinkCanvas.height = TFMachineBase.CANVAS_PIXELS_Y * 5;
      let blinkCtx = blinkCanvas.getContext("2d");
      blinkCtx.scale(12, 12);

      let rendersCompleted = 0;
      function doOnload(ctx, img) {
        // ctx.drawImage(img, 0, 0);
        // URL.revokeObjectURL(url);
        rendersCompleted += 1;
        if (rendersCompleted == TFMachineBase.CATEGORY_RENDER_ORDER.length * 2) {
          // all done, draw the canvases and start blinking!
          if (that.baseImg === null) {
            that.baseImg = new Image();
            that.baseImg.classList.add('picrewCharacter');
          }
          that.baseImg.src = eyesCanvas.toDataURL('image/png'); // about:config: privacy.resistFingerprinting needs to be false

          if (that.blinkImg === null) {
            that.blinkImg = new Image();
            that.blinkImg.classList.add('picrewCharacter');
          }
          that.blinkImg.src = blinkCanvas.toDataURL('image/png');

          if (!that.blinkingStarted) {
            that.unblinkFunction();
            that.blinkingStarted = true;
          }

          resolve();
        }
      }

      for (let i = 0; i < TFMachineBase.CATEGORY_RENDER_ORDER.length; i++) {
        let part = TFMachineBase.CATEGORY_RENDER_ORDER[i];
        // console.log(`rendering ${part}`);

        if (part === 'eyes') {
          let eyesSvg = getPart('eyes', that.parts['eyes']['fileNumber'], that.parts['eyes']['color'], that.parts['fur']['color']);
          drawSVGOnCanvas(eyesSvg, eyesCtx, doOnload);
          // eyesCtx.stroke(new Path2D(eyesSvg)); //drawImage(eyesImg, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);

          let blinkSvg = getPart('blink', that.parts['blink']['fileNumber'], that.parts['blink']['color'], that.parts['fur']['color']);
          drawSVGOnCanvas(blinkSvg, blinkCtx, doOnload);
          // blinkCtx.stroke(new Path2D(blinkSvg)); //drawImage(blinkImg, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);
        // } else if (part === 'fur') {
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
          let svg = getPart(part, that.parts[part]['fileNumber'], that.parts[part]['color'], that.parts['fur']['color']);
          drawSVGOnCanvas(svg, eyesCtx, doOnload);
          drawSVGOnCanvas(svg, blinkCtx, doOnload);
          // eyesCtx.stroke(new Path2D(svg)); //drawImage(img, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, 70,70);//TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);
          // blinkCtx.stroke(new Path2D(svg)); //drawImage(img, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY, 70,70);//TFMachineBase.CANVAS_PIXELS, TFMachineBase.CANVAS_PIXELS);
        }
      }
    });
  }

  blinkFunction() {
    if (!this.ceased) {
      let that = this;
      if (this.matterSprite !== null) {
        that.matterSprite.texture = that.blinkImg.src;
      } else {
        that.baseImg.style.display = 'none';
        that.blinkImg.style.display = 'block';
      }
      
      setTimeout(() => { that.unblinkFunction() }, Math.floor(Math.random() * 50) + 50);
    }
  }

  unblinkFunction() {
    if (!this.ceased) {
      let that = this;
      if (this.matterSprite !== null) {
        that.matterSprite.texture = that.baseImg.src;
      } else {
        that.baseImg.style.display = 'block';
        that.blinkImg.style.display = 'none';
      }
      setTimeout(() => { that.blinkFunction() }, Math.floor(Math.random() * 1000) + 500);
    }
  }

  injectToDiv(div) {
    if (this.matterSprite !== null) {
      throw new Error('Using matterSprite to render animation!  Remove matterSprite from constructor, or do not use div injection for blink animation.');
    }
    div.appendChild(this.baseImg);
    div.appendChild(this.blinkImg);
  }

  registerMatterSprite(matterSprite) {
    this.matterSprite = matterSprite;
  }
}