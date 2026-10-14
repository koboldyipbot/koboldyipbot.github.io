import * as TFMachineBase from 'tfMachineBase';
import {CatgirlAvatar} from 'tfMachineUtils';
import * as SVGUtils from 'svgUtils';

var activeCharacter = null;
var displayedParts = null;
var highlightedItem = null;


SVGUtils.initialize().then(() => {
  console.log("building character");

  activeCharacter = new CatgirlAvatar();
  window.activeCharacter = activeCharacter;
  window.character = activeCharacter;
  console.log("catgirl created");
  activeCharacter.interpretCode().then(() => {
    activeCharacter.renderCatgirl().then(() => {
      console.log("catgirl rendered");
      let div = document.getElementById("character");
      console.log(activeCharacter.baseImg);
      div.appendChild(activeCharacter.baseImg);
      div.appendChild(activeCharacter.blinkImg);

      initializeCategoryButtons();


    });
  });
});

function initializeCategoryButtons() {
  for (let i = 0; i < TFMachineBase.CHOOSABLE_CATEGORIES.length; i++) {
    let category = TFMachineBase.CHOOSABLE_CATEGORIES[i];
    if (category === 'fur') {
      // color boxes
      let part = document.querySelector(`#fur p`).parentNode;
      let colorBucket = document.querySelector(`#${category} .colorBucket`);
      part.onclick = () => {
        displayColorPicker('fur');
      };
      colorBucket.onclick = () => {
        displayColorPicker('fur');
      };
    } else {
      let part = document.querySelector(`#${category} p`).parentNode;
      let leftArrow = document.querySelector(`#${category} .leftArrow`);
      let colorBucket = document.querySelector(`#${category} .colorBucket`);
      let rightArrow = document.querySelector(`#${category} .rightArrow`);

      part.onclick = () => {
        displayParts(category);
      };

      leftArrow.onclick = () => {
        activeCharacter.prevPart(category).then(() => {
          displayParts(category);
        });
      };

      rightArrow.onclick = () => {
        activeCharacter.nextPart(category).then(() => {
          displayParts(category);
        });
      };

      colorBucket.onclick = () => {
        displayColorPicker(category);
      };
    }
  }
  
  displayParts("ears");
}


function displayColorPicker(topCategory) {
  if (displayedParts === `${topCategory}Color`) {
    return;
  }
  displayedParts = `${topCategory}Color`;

  let partPicker = document.querySelector('#partPicker');
  partPicker.textContent = '';

  let category;
  if (TFMachineBase.LAYERED_CATEGORIES.has(topCategory)) {
    category = `${topCategory}Front`; 
  } else {
    category = topCategory;
  }

  for (let i = 0; i < TFMachineBase.ColorRamp.pickableColorList.length; i++) {
    let colorString = TFMachineBase.ColorRamp.pickableColorList[i].color;
    let partPickerItem = document.createElement('div');
    partPickerItem.classList.add('partPickerItem');
    let partPickerWindow = document.createElement('div');
    partPickerWindow.classList.add('partPickerWindow');
    
    partPicker.appendChild(partPickerItem);
    partPickerItem.appendChild(partPickerWindow);

    if (category === 'fur') {
      partPickerWindow.style['background-color'] = colorString;
    } else {
      let img = SVGUtils.getMenuPartImage(topCategory, activeCharacter.parts[category].fileNumber, colorString, activeCharacter.parts['fur'].color);
      partPickerWindow.appendChild(img);
    }

    partPickerItem.onclick = () => {
      highlightedItem.style = '';
      partPickerItem.style['border-right'] = '2px solid red';
      partPickerItem.style['border-bottom'] = '2px solid red';
      highlightedItem = partPickerItem;

      activeCharacter.changePart(topCategory, activeCharacter.parts[category].fileNumber, colorString);
    }
  }
}

function displayParts(topCategory) {
  let category;
  if (TFMachineBase.LAYERED_CATEGORIES.has(topCategory)) {
    category = `${topCategory}Front`; 
  } else {
    category = topCategory;
  }

  if (displayedParts === topCategory) {
    let itemToHighlight = document.getElementById(`partPickerItem${activeCharacter.parts[category].fileNumber}`);
    if (highlightedItem !== itemToHighlight) {
      highlightedItem.style = '';
      itemToHighlight.style['border-right'] = '2px solid red';
      itemToHighlight.style['border-bottom'] = '2px solid red';
      highlightedItem = itemToHighlight;
    }
    return;
  }
  displayedParts = topCategory;

  let partPicker = document.querySelector('#partPicker');
  partPicker.textContent = '';

  let pickable = SVGUtils.BASE_SVGS[category].pickable;

  for (let i = 0; i < pickable.length; i++) {
    let partFileNumber = pickable[i]+1;
    let img = SVGUtils.getMenuPartImage(topCategory, partFileNumber, activeCharacter.parts[category].color, activeCharacter.parts['fur'].color);
    let partPickerItem = document.createElement('div');
    partPickerItem.classList.add('partPickerItem');
    partPickerItem.id = `partPickerItem${partFileNumber}`;
    let partPickerWindow = document.createElement('div');
    partPickerWindow.classList.add('partPickerWindow');
    partPicker.appendChild(partPickerItem);
    partPickerItem.appendChild(partPickerWindow);
    partPickerWindow.appendChild(img);

    if (partFileNumber === activeCharacter.parts[category].fileNumber) {
      highlightedItem = partPickerItem;
      partPickerItem.style['border-right'] = '2px solid red';
      partPickerItem.style['border-bottom'] = '2px solid red';
    }

    partPickerItem.onclick = () => {
      highlightedItem.style = '';
      partPickerItem.style['border-right'] = '2px solid red';
      partPickerItem.style['border-bottom'] = '2px solid red';
      highlightedItem = partPickerItem;

      activeCharacter.changePart(topCategory, partFileNumber, activeCharacter.parts[category].color);
    }
  }
}
