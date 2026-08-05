import * as TFMachineBase from 'tfMachineBase';
import {CatgirlAvatar} from 'tfMachineUtils';

var activeCharacter = null;

console.log("building character");

activeCharacter = new CatgirlAvatar();
window.character = activeCharacter;
console.log("catgirl created");
activeCharacter.renderCatgirl();
let div = document.getElementById("character");
div.appendChild(activeCharacter.baseImg);
div.appendChild(activeCharacter.blinkImg);
