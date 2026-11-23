import * as TFMachineBase from 'tfMachineBase';
import {TFAvatar} from 'tfMachineAvatar';
import * as SVGUtils from 'svgUtils';

var activeCharacter = null;
var displayedParts = null;
var highlightedItem = null;

function generateAlert(text) {

  let alerts = document.getElementById('alerts');

  let alert = document.createElement('div');
  alert.classList.add('alert');
  let title = document.createElement('p');
  title.classList.add('alertTitle');
  title.textContent = 'Warning';

  let alertP = document.createElement('p');
  alertP.classList.add('alertText');
  alertP.textContent = text;

  let closeButton = document.createElement('div');
  closeButton.textContent = '❌';
  closeButton.classList.add('alertCloseButton');
  closeButton.onclick = () => {
    alert.remove();
  }

  alert.appendChild(closeButton);
  alert.appendChild(title);
  alert.appendChild(alertP);
  alerts.appendChild(alert);

}

// setup app

window.generateAlert = generateAlert;

SVGUtils.initialize().then(() => {
  console.log("building character");

  activeCharacter = new TFAvatar();
  window.activeCharacter = activeCharacter;
  window.character = activeCharacter;

  let code = findGetParameter('code');
  let name = findGetParameter('name');

  let promise = null;
  if (name !== null && code === null) {
    promise = activeCharacter.randomizeCharacter(name);
  } else {
    promise = activeCharacter.interpretCode(code);
  }

  // interpolate the initial code
  promise.then(() => {
    // display the interpolated code once loaded into the character
    updateCodeFromCharacter();

    // setup the code input/output
    let codeText = document.getElementById('codeText');
    codeText.addEventListener('input', updateCharacterFromCode);
    let codeCopy = document.getElementById('codeCopy');
    codeCopy.onclick = () => {
      navigator.clipboard.writeText(codeText.value);
    }

    // render
    activeCharacter.renderTFed().then(() => {
      console.log("tfed character rendered");

      // after first render, register the images into the UI
      let div = document.getElementById("character");
      activeCharacter.injectToDiv(div);
      

      // enable the UI
      initializeCategoryButtons();
    });
  });
});

function updateCodeFromCharacter() {
  const url = new URL(window.location);
  url.searchParams.set('code', activeCharacter.code);
  history.pushState(null, '', url);

  let codeText = document.getElementById('codeText');
  codeText.value = activeCharacter.code;
}

function updateCharacterFromCode() {
  console.log('updating character');
  let codeText = document.getElementById('codeText');

  const url = new URL(window.location);
  url.searchParams.set('code', codeText.value);
  history.pushState(null, '', url);

  activeCharacter.interpretCode(codeText.value).then(() => {
    activeCharacter.renderTFed();
    console.log('character changed');
  })
}

function initializeCategoryButtons() {
  for (let i = 0; i < TFMachineBase.CHOOSABLE_CATEGORIES.length; i++) {
    let topCategory = TFMachineBase.CHOOSABLE_CATEGORIES[i];
    if (topCategory === 'fur') {
      // color boxes
      let part = document.querySelector(`#fur p`);
      let colorBucket = document.querySelector(`#${topCategory} .colorBucket`);
      part.onclick = () => {
        displayColorPicker('fur');
      };
      colorBucket.onclick = () => {
        displayColorPicker('fur');
      };
    } else {
      let part = document.querySelector(`#${topCategory} p`);
      let leftArrow = document.querySelector(`#${topCategory} .leftArrow`);
      let colorBucket = document.querySelector(`#${topCategory} .colorBucket`);
      let rightArrow = document.querySelector(`#${topCategory} .rightArrow`);

      part.onclick = () => {
        displayParts(topCategory);
      };

      leftArrow.onclick = () => {
        activeCharacter.prevPart(topCategory).then(() => {
          updateCodeFromCharacter();
          if (displayedParts === `${topCategory}Color`) {
            displayColorPicker(topCategory);
          } else {
            displayParts(topCategory);
          }
        });
      };

      rightArrow.onclick = () => {
        activeCharacter.nextPart(topCategory).then(() => {
          updateCodeFromCharacter();
          if (displayedParts === `${topCategory}Color`) {
            displayColorPicker(topCategory);
          } else {
            displayParts(topCategory);
          }
        });
      };

      colorBucket.onclick = () => {
        if (displayedParts !== `${topCategory}Color`) {
          displayColorPicker(topCategory);
        }
      };
    }
  }
  
  displayParts("ears");
}


function displayColorPicker(topCategory) {
  displayedParts = `${topCategory}Color`;

  let partPickerItems = document.querySelector('#partPickerItems');
  partPickerItems.textContent = '';

  let category;
  if (TFMachineBase.LAYERED_CATEGORIES.has(topCategory)) {
    category = `${topCategory}Front`; 
  } else {
    category = topCategory;
  }

  let baseColorNumber = TFMachineBase.ColorRamp.getBaseCategoryColorRampElement(category).colorNumber;
  let first = true;
  for (let i = baseColorNumber; first || i != baseColorNumber; i = (i + 1) % TFMachineBase.ColorRamp.pickableColorList.length) {
    first = false;
    let colorString = TFMachineBase.ColorRamp.pickableColorList[i].color;
    let partPickerItem = document.createElement('div');
    partPickerItem.classList.add('partPickerItem');
    let partPickerWindow = document.createElement('div');
    partPickerWindow.classList.add('partPickerWindow');
    
    partPickerItems.appendChild(partPickerItem);
    partPickerItem.appendChild(partPickerWindow);
    

    if (category === 'fur') {
      partPickerWindow.classList.add('furColorPicker');
      partPickerWindow.style['background-color'] = colorString;
    } else {
      let img = SVGUtils.getMenuPartImage(topCategory, activeCharacter.parts[category].fileNumber, colorString, activeCharacter.parts['fur'].color);
      partPickerWindow.appendChild(img);
    }

    if (colorString === activeCharacter.parts[category].color) {
      highlightedItem.style = '';
      partPickerItem.style['border-right'] = '2px solid red';
      partPickerItem.style['border-bottom'] = '2px solid red';
      highlightedItem = partPickerItem;
    }

    partPickerItem.onclick = () => {
      highlightedItem.style = '';
      partPickerItem.style['border-right'] = '2px solid red';
      partPickerItem.style['border-bottom'] = '2px solid red';
      highlightedItem = partPickerItem;

      activeCharacter.changePart(topCategory, activeCharacter.parts[category].fileNumber, colorString).then(() => {
        updateCodeFromCharacter();
      });
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

  let partPickerItems = document.querySelector('#partPickerItems');
  partPickerItems.textContent = '';

  let pickable = SVGUtils.BASE_SVGS[category].pickable;

  for (let i = 0; i < pickable.length; i++) {
    let partFileNumber = pickable[i]+1;
    let img = SVGUtils.getMenuPartImage(topCategory, partFileNumber, activeCharacter.parts[category].color, activeCharacter.parts['fur'].color);
    let partPickerItem = document.createElement('div');
    partPickerItem.classList.add('partPickerItem');
    partPickerItem.id = `partPickerItem${partFileNumber}`;
    let partPickerWindow = document.createElement('div');
    partPickerWindow.classList.add('partPickerWindow');
    partPickerItems.appendChild(partPickerItem);
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

      activeCharacter.changePart(topCategory, partFileNumber, activeCharacter.parts[category].color).then(() => {
        updateCodeFromCharacter();
      });
    }
  }
}
