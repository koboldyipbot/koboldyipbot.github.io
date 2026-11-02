import * as TFMachineBase from 'tfMachineBase';

var xmlns = "http://www.w3.org/2000/svg";

export const BASE_SVGS = {};
window.BASE_SVGS = BASE_SVGS;
window.DEBUG_STUFF = [];

export function listParts(category) {
  let ret = [];
  for (let i = 0; i < BASE_SVGS[category].pickable.length; i++) {
    ret.push(BASE_SVGS[category].parts[BASE_SVGS[category].pickable[i]]);
  }
  return ret;
}

export function getRandomPart(category, color, furColor) {
  let randomIndex = Math.floor(Math.random() * BASE_SVGS.BASE_SVGS[category].randomList.length);
  let partIndex = BASE_SVGS.BASE_SVGS[category].randomList[randomIndex];
  if (color === null) {
    color = TFMachineBase.ColorRamp.getRandomColor();
  }
  if (furColor === null) {
    furColor = TFMachineBase.ColorRamp.getRandomColor();
  }
  return getPart(category, partIndex, color, furColor);
}


export async function initialize() {
  console.log('initializing SVGs');
  if (BASE_SVGS.length === 0) {
    return;
  }
  let baseUrl = `${window.location.origin}/images`;
  let imagesPath = 'tf_machine/avatar';
  let imageList = await listImages(imagesPath);
  let filenameRegex = /([^\d_]+)(_norandom)?(\d+)\.svg/;

  for (let i in imageList) {
    let filename = imageList[i];
    let match = filename.match(filenameRegex);
    let categoryName = match[1];
    let randomable = match[2] === undefined;
    let partNumber = Number(match[3]) - 1;

    if (!(categoryName in BASE_SVGS)) {
      BASE_SVGS[categoryName] = {
        randomList: [], pickable: [], pickableIndexMap: {}, parts: [], partCount: 0
      }
    }

    let [randomList, pickable, parts] = [
      BASE_SVGS[categoryName].randomList, 
      BASE_SVGS[categoryName].pickable, 
      BASE_SVGS[categoryName].parts
    ];

    let url = `${baseUrl}/${imagesPath}/${filename}`;
    let svg = await loadSVG(url);

    if (svg.childElementCount > 0 || parts.length === 0) {
      pickable.push(partNumber);
      parts[partNumber] = svg;
      if (randomable && parts.length > 0 && partNumber > 0) {
        randomList.push(partNumber);
      }
    }
  }

  // sort & index pickable parts by part number
  for (let categoryName in BASE_SVGS) {
    BASE_SVGS[categoryName].pickable.sort((x,y) => { return x - y; });
    
    let pickable = BASE_SVGS[categoryName].pickable;
    let pickableIndexMap = {};
    for (let i = 0; i < pickable.length; i++) {
      pickableIndexMap[pickable[i]] = i;
    }
    BASE_SVGS[categoryName].pickableIndexMap = pickableIndexMap;
  }

  // for (let i = 0; i < TFMachineBase.CATEGORY_RENDER_ORDER.length; i++) {
  //   let category = TFMachineBase.CATEGORY_RENDER_ORDER[i];
  //   BASE_SVGS[category] = [];
  //   for (let j = 0; j < TFMachineBase.MAX_CATEGORY_CHOICES; j++) {
  //     let image = `${TFMachineBase.CATEGORY_RENDER_ORDER[i]}${j+1}.svg`;
  //     let svg = await loadSVG(`${baseUrl}/${image}`);
  //     if (svg != null && svg.children.length > 0) {
  //       BASE_SVGS[category].push(svg);
  //     }
  //   }
  // }
  console.log('initialization complete');
}

// Returns a mapping from new color to all the SVG elements to set to that color.
function generateColorChanges(newSvg, colorReplacementMap) {
  let colorChanges = {};
  for (let baseColor in colorReplacementMap) {
    let targetColor = colorReplacementMap[baseColor];
    let colorChangeArr = [];
    let nodeList = newSvg.querySelectorAll(`[fill="${baseColor}"]`);
    for (let i = 0; i < nodeList.length; i++) {
      colorChangeArr.push(nodeList[i]);
    }
    colorChanges[targetColor] = colorChangeArr;
  }
  return colorChanges;
}

export function getPart(category, fileNumber, color, furColor = null) {
  let svg = BASE_SVGS[category].parts[fileNumber - 1];
  let newSvg = svg.cloneNode(true); // deep copy so we can modify color

  let colorReplacements = TFMachineBase.ColorRamp.getColorRampReplacements(category, color);
  let furColorReplacements = null;
  if (furColor !== null) {
    furColorReplacements = TFMachineBase.ColorRamp.getColorRampReplacements('fur', furColor);
  }

  // pregenerate color changes so we don't accidentally change anything twice
  let colorChanges = generateColorChanges(newSvg, colorReplacements);
  if (furColorReplacements !== null) {
    let furColorChanges = generateColorChanges(newSvg, furColorReplacements);
    for (let targetColor in furColorChanges) {
      if (targetColor in colorChanges) {
        colorChanges[targetColor] = colorChanges[targetColor].concat(furColorChanges[targetColor]);
      } else {
        colorChanges[targetColor] = furColorChanges[targetColor];
      }
    }
  }

  // apply all color changes
  for (let targetColor in colorChanges) {
    let pixelList = colorChanges[targetColor];
    for (let i = 0; i < pixelList.length; i++) {
      let before = pixelList[i].getAttribute('fill');
      pixelList[i].setAttribute("fill", targetColor);
    }
  }
  return newSvg;
}

const menuPartImageCache = {};

export function getMenuPartImage(topCategory, fileNumber, color, furColor) {
  if (!(topCategory in menuPartImageCache)) {
    menuPartImageCache[topCategory] = {};
  }

  if (!(fileNumber in menuPartImageCache[topCategory])) {
    menuPartImageCache[topCategory][fileNumber] = {};
  }

  if (!(color in menuPartImageCache[topCategory][fileNumber])) {
    menuPartImageCache[topCategory][fileNumber][color] = {};
  }

  if (furColor in menuPartImageCache[topCategory][fileNumber][color]) {
    return menuPartImageCache[topCategory][fileNumber][color][furColor];
  }

  let baseCategories;
  if (TFMachineBase.LAYERED_CATEGORIES.has(topCategory)) {
    baseCategories = [`${topCategory}Back`, `${topCategory}Front`];
  } else {
    baseCategories = [topCategory];
  }

  let canvas = document.createElement('canvas');
  canvas.width = TFMachineBase.CANVAS_PIXELS_X * 3;
  canvas.height = TFMachineBase.CANVAS_PIXELS_Y * 3;
  let ctx = canvas.getContext("2d");
  ctx.scale(2.41*3, 2.41*3);

  let imgRender = new Image();
  imgRender.classList.add(`${topCategory}Menu`);
  let rendersCompleted = 0;
  let doOnload = (ctx, img) => {
    rendersCompleted += 1;
    if (rendersCompleted === baseCategories.length) {
      imgRender.src = ctx.canvas.toDataURL('image/png');
    }
  }

  for (let partNum = 0; partNum < baseCategories.length; partNum++) {
    let svg = getPart(baseCategories[partNum], fileNumber, color, furColor);
    drawSVGOnCanvas(svg, ctx, doOnload);
  }

  menuPartImageCache[topCategory][fileNumber][color][furColor] = imgRender;

  return imgRender;
}

async function loadSVG(url) {
  try {
    let resp = await fetch(url);
    let text = await resp.text();
    let parser = new DOMParser();
    return parser.parseFromString(text, 'image/svg+xml').getElementsByTagName("svg")[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function drawSVGOnCanvas(svg, ctx, doOnload) {
  // assumes canvas matches size of image
  var blob = new Blob([svg.outerHTML], {type: 'image/svg+xml'});
  var url = URL.createObjectURL(blob);
  var img = new Image();
  img.onload = function() {
    ctx.drawImage(img, TFMachineBase.CANVAS_ASEPRITE_DX, TFMachineBase.CANVAS_ASEPRITE_DY); // 0, 0);
    URL.revokeObjectURL(url);
    window.lastCTX = ctx;
    doOnload(ctx, img);
  };
  img.src = url;
}


