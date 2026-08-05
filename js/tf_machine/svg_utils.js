import * as TFMachineBase from 'tfMachineBase';

var xmlns = "http://www.w3.org/2000/svg";

const BASE_SVGS = {};

let baseUrl = `${window.location.origin}/images/tf_machine/catgirls`;

for (let i = 0; i < TFMachineBase.CATEGORY_RENDER_ORDER.length; i++) {
  let category = TFMachineBase.CATEGORY_RENDER_ORDER[i];
  BASE_SVGS[category] = [];
  for (let j = 0; j < TFMachineBase.MAX_CATEGORY_CHOICES; j++) {
    let image = `${TFMachineBase.CATEGORY_RENDER_ORDER[i]}${j+1}.svg`;
    let svg = await loadSVG(`${baseUrl}/${image}`);
    if (svg != null && svg.children.length > 0) {
      BASE_SVGS[category].push(svg);
    }
  }
}

export function getPart(category, index, color, furColor = null) {
  let svg = BASE_SVGS[category][index];
  let newSvg = svg.cloneNode(true); // deep copy so we can modify color
  // TODO: modify colors
  let img = new Image();
  let svgBlob = new Blob([newSvg], { type: 'image/svg+xml;charset=utf-8' });
  img.src = URL.createObjectURL(svgBlob);
  return img;
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