import {TwitchChannelPoints} from 'twitchChannelPoints';
import {TFMachineChat} from 'tfMachineChat';
import {TFMachineQueue} from 'tfMachineQueue';
import {getTwitchUtils} from 'twitchUtils';
import {playAudio} from 'tfMachineUtils';
import {TFAvatar} from 'tfMachineAvatar';
import {initialize as SVGUtilsInitialize} from 'svgUtils';

const twitchUtils = getTwitchUtils(secrets.twitch.chatBot);

const tfMachineQueue = new TFMachineQueue(
  'tf_machine',
  twitchUtils,
  tfMachineStart,
  () => {
    $("#tfMachineInput").fadeOut(800);
  },
  false,
  false
);

const twitchChat = new TFMachineChat(tfMachineQueue);
window.twitchChat = twitchChat;


// function tfMachineParse (isMod, commandArr, channel, context, msg, self) {
//  console.log('made it');
//     // if (user.bits >500 && user.bits % 10 == 3) {

//     if (isMod) {
//        let user = commandArr.length > 1 ? commandArr[1] : context.username;
//         tfMachineQueue.enqueue(user);
//     }
//     // }
// }

// addModule("tfmachine", tfMachineParse);

// function onConnectedHandler (addr, port) {
  // console.log(`* Connected to ${addr}:${port}`);


window.onload = (event) => {
  // preload images
  preloadImage(tfMachineImgEmpty);
  preloadImage(tfMachineImgDoorClose);
  preloadImage(tfMachineImgDoorCloseFront);
  preloadImage(tfMachineImgDoorOpenLayerBack);
  preloadImage(tfMachineImgDoorOpenLayerFront);
  preloadImage(tfMachineImgFiring);
  preloadImage(tfMachineImgShaking);
  preloadImage(tfMachineImgDoorOpenSlamLayerBack);
  preloadImage(tfMachineImgDoorOpenSlamLayerFront);
  preloadImage(tfMachineImgPushButtonBack);
  preloadImage(tfMachineImgPushButtonFront);
  preloadImage(tfMachineImgMachineWorkingLayerBack);
  preloadImage(tfMachineImgMachineWorkingLayerFront);

  SVGUtilsInitialize().then(() => {
    tfMachineQueue.enabled = true;
  })

  // initialize chat
  twitchChat.connect();
}


// images
const tfMachineImgEmpty = '/images/tf_machine/empty.png';
const tfMachineImgDoorClose = '/images/tf_machine/doorClose.png';
const tfMachineImgDoorCloseFront = '/images/tf_machine/doorClose_layerFront.png'; 
const tfMachineImgDoorOpenLayerBack = '/images/tf_machine/DoorOpen_layerBack.png'; 
const tfMachineImgDoorOpenLayerFront = '/images/tf_machine/DoorOpen_layerFront.png'; 
const tfMachineImgFiring = '/images/tf_machine/Firing.png'; 
const tfMachineImgShaking = '/images/tf_machine/Shaking.png'; 
const tfMachineImgDoorOpenSlamLayerBack = '/images/tf_machine/DoorOpenSlam_layerBack.png'; 
const tfMachineImgDoorOpenSlamLayerFront = '/images/tf_machine/DoorOpenSlam_layerFront.png';
const tfMachineImgPushButtonBack = '/images/tf_machine/MachinePushButton_Back.png';
const tfMachineImgPushButtonFront = '/images/tf_machine/MachinePushButton_Front.png';
const tfMachineImgMachineWorkingLayerBack = '/images/tf_machine/MachineWorking_BackLoop.gif'; 
const tfMachineImgMachineWorkingLayerFront = '/images/tf_machine/MachineWorking_FrontLoop.gif';
const tfMachineImgExitStretchBack = '/images/tf_machine/MachineExitStretch_Back.png';
const tfMachineImgExitStretchFront = '/images/tf_machine/MachineExitStretch_Front.png';
const tfMachineImgExitExplosionBack = '/images/tf_machine/MachineExitExplosion_Back.png';
const tfMachineImgExitExplosionFront = '/images/tf_machine/MachineExitExplosion_Front.png';

// sounds
const tfMachineAudioButton = new Audio('/sounds/tf_machine/cm_button.wav');
const tfMachineAudioEject = new Audio('/sounds/tf_machine/cm_catgirleject.wav');
const tfMachineAudioDoorClose = new Audio('/sounds/tf_machine/cm_doorclose.wav');
const tfMachineAudioDoorOpen = new Audio('/sounds/tf_machine/cm_dooropen.wav');
const tfMachineAudioNyaaa = new Audio('/sounds/tf_machine/cm_nyaaa.wav');
const tfMachineAudioPersonIntro = new Audio('/sounds/tf_machine/cm_personintro.wav');
const tfMachineAudioHeh = new Audio('/sounds/tf_machine/cm_redeem.wav');
const tfMachineAudioShake = new Audio('/sounds/tf_machine/cm_shake.wav');
const tfMachineAudioWibbleIntro = new Audio('/sounds/tf_machine/cm_wibble_intro.wav');
const tfMachineAudioWibbleOutro = new Audio('/sounds/tf_machine/cm_wibble_outro.wav');
const tfMachineAudioWibbleLoop = new Audio('/sounds/tf_machine/cm_wibble_loop.wav');

function createWibbleAudio() {
  let a = tfMachineAudioWibbleLoop.cloneNode(true);
  a.load();
  return a;
}

function resetWibbleAudio(audio) {
  audio.currentTime = 0;
  return audio;
}

const tfMachineAudioWibbleLoopPool = new ObjectPool(createWibbleAudio, resetWibbleAudio, 10);


function tfMachineGenerateTFedUser(username, avatarSrc) {
  // const tempImgData = 'data:image/png;base64,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';
  // let tfedUser = $(`<div class="tfedUser"><img src="${tempImgData}" /><img class="tfMachineAvatarShirt" src="${avatarSrc}" /></div>`);
  let tfedUserDiv = document.createElement('div');
  console.log(tfedUserDiv);
  tfedUserDiv.classList = 'tfedUser';
  let tfAvatar = new TFAvatar(username);
  let avatarShirt = new Image();
  avatarShirt.src = avatarSrc;
  avatarShirt.classList = 'tfMachineAvatarShirt';

  tfAvatar.interpretCode().then(() => {
    tfAvatar.renderTFed().then(() => {
      tfAvatar.injectToDiv(tfedUserDiv);
      tfedUserDiv.appendChild(avatarShirt);
    });
  });
  return {
    tfedUserDiv: tfedUserDiv,
    tfAvatar: tfAvatar
  };
}


async function tfMachineStart(username) {
  // reset state
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  tfMachineImgBack[0].src = tfMachineImgDoorClose;
  tfMachineImgFront[0].src = tfMachineImgEmpty;

  // fetch user profile pic
  let imgUrl = await twitchUtils.getTwitchProfilePictureURL(username);

  let tfMachineInput = $("#tfMachineInput");
  let userDiv = $(`<div class="tfUserDiv"><p>${username}</p><img src="${imgUrl}" /></div>`);

  tfMachineInput.append(userDiv);
  async function doOpen() {
    tfMachineOpen(username);
  }
  tfMachineInput.fadeIn(800, doOpen);
}

window.tfMachineStart = tfMachineStart;

async function tfMachineOpen(username) {
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  let userDiv = $(".tfUserDiv");

  // var state = 0;

  // function afterBounce(e) {
  //   if (state < 2) {
  //     state += 1;
  //   } else {
  //     let userDiv = $(".tfUserDiv");
  //     userDiv[0].removeEventListener("animationend", afterBounce);
  //     tfMachineImgBack[0].src = tfMachineImgMachineWorkingLayerBack;
  //     tfMachineImgFront[0].src = tfMachineImgMachineWorkingLayerFront;
  //     setTimeout(tfMachineExit, 1400, user);
  //   }
  // }
  // userDiv[0].addEventListener("animationend", afterBounce);
  // userDiv[0].style.animation = "2s ease-in forwards tfMachineUserDropAnim, 0.4s ease-out 2s 1 alternate forwards tfMachineUserBounceAnim, 0.4s ease-out 2.4s 1 reverse forwards tfMachineUserBounceAnim";
  function userEntered(e) {
    console.log('userEntered start');
    userDiv[0].removeEventListener("animationend", userEntered);

    playAudio(tfMachineAudioPersonIntro).then(() => { 
      setTimeout(() => { 
        console.log('starting tfMachineClose');
        tfMachineClose(username);
      }, 1250);
    });
    
  }
  setTimeout(() => { playAudio(tfMachineAudioHeh); }, 1500);
  userDiv[0].addEventListener("animationend", userEntered);
  userDiv[0].style.animation = "2s cubic-bezier(.74,.06,.81,.14) forwards tfMachineUserEnterAnim";

  setTimeout(() => {
    tfMachineImgBack[0].src = tfMachineImgDoorOpenSlamLayerBack;
    tfMachineImgFront[0].src = tfMachineImgDoorOpenSlamLayerFront;

    setTimeout(() => {
      tfMachineImgBack[0].src = tfMachineImgDoorOpenLayerBack;
      tfMachineImgFront[0].src = tfMachineImgDoorOpenLayerFront;
    }, 200);
  }, 50);
  
  playAudio(tfMachineAudioDoorOpen);
  console.log('tfMachineOpen done');
}

async function tfMachineClose(username) {
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  let userDiv = $(".tfUserDiv");
  console.log(userDiv);

  setTimeout(() => {
    tfMachineImgBack[0].src = tfMachineImgDoorClose;
    tfMachineImgFront[0].src = tfMachineImgDoorCloseFront;
  }, 50);

  playAudio(tfMachineAudioDoorClose);

  // if add slam anim, call instead of tfMachineDoYourThang
  // function removeSlamMarker() {
  //   tfMachineImgFront[0].src = tfMachineImgDoorClose;
  //   setTimeout(tfMachineDoYourThang, 100, username);
  // }

  setTimeout(() => { playAudio(tfMachineAudioButton); }, 350);
  setTimeout(tfMachinePushButton, 400, username);
}

async function tfMachinePushButton(username) {
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  
  tfMachineImgBack[0].src = tfMachineImgPushButtonBack;
  tfMachineImgFront[0].src = tfMachineImgPushButtonFront;

  function resetButton(username) {
    tfMachineImgBack[0].src = tfMachineImgDoorClose;
    tfMachineImgFront[0].src = tfMachineImgDoorCloseFront;
    setTimeout(tfMachineDoYourThang, 600, username);
  }
  
  setTimeout(resetButton, 200, username);
}

async function tfMachineDoYourThang(username) {
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  // let userDiv = $(".tfUserDiv");

  // generate avatar early
  let tfAvatar = new TFAvatar(username);

  let wibbleLooping = true;
  let activeWibbles = [];

  function wibbleLoop() {
    if (wibbleLooping) {
      let a = tfMachineAudioWibbleLoopPool.getElement();
      activeWibbles.push(a);
      playAudio(a.data).then(
        () => { 
          if (wibbleLooping) {
            activeWibbles.shift();
            tfMachineAudioWibbleLoopPool.releaseElement(a);
          }
        }
      );
      setTimeout(wibbleLoop, 400);
    } else {
      for (let i in activeWibbles) {
        activeWibbles[0].data.pause();
        tfMachineAudioWibbleLoopPool.releaseElement(activeWibbles[0]);
        activeWibbles.shift();
      }
      playAudio(tfMachineAudioWibbleOutro);
    }
  }

  playAudio(tfMachineAudioWibbleIntro).then(wibbleLoop);

  tfMachineImgBack[0].src = tfMachineImgMachineWorkingLayerBack;
  tfMachineImgFront[0].src = tfMachineImgMachineWorkingLayerFront;

  // function removeAvatar() {
  //   userDiv.remove();
  //   wibbleLoop = false;
  // }

  // setTimeout(removeAvatar, 1500);
  setTimeout(() => { 
    wibbleLooping = false; 
    setTimeout(tfMachineExitMachine, 400, username);
  }, 1600, username);
}

async function tfMachineExitMachine(username) {
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  let userDiv = $(".tfUserDiv");
  let avatar = userDiv[0].getElementsByTagName('img')[0].src;

  function spawnTFed(username) {
    let tfMachineInput = $("#tfMachineInput");
    let tfedUserData = tfMachineGenerateTFedUser(username, avatar);
    tfMachineInput[0].appendChild(tfedUserData.tfedUserDiv);
    tfMachineImgBack[0].src = tfMachineImgEmpty;
    tfMachineImgFront[0].src = tfMachineImgDoorClose;

    setTimeout(tfMachinePrepareToLaunch, 200, tfedUserData.tfAvatar);
  }

  tfMachineImgBack[0].src = tfMachineImgExitStretchBack;
  tfMachineImgFront[0].src = tfMachineImgExitStretchFront;
  userDiv.remove();

  function exitExplosion() {
    tfMachineImgBack[0].src = tfMachineImgExitExplosionBack;
    tfMachineImgFront[0].src = tfMachineImgExitExplosionFront;

    setTimeout(spawnTFed, 100, username);
  }

  setTimeout(exitExplosion, 100, username);
}

async function tfMachinePrepareToLaunch(tfAvatar) {
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  let userDiv = $(".tfedUser");

  // tfMachineImgBack[0].src = tfMachineImgEmpty;
  // tfMachineImgFront[0].src = tfMachineImgDoorClose;
  playAudio(tfMachineAudioShake);

  function shake(shakesLeft) {
    if (shakesLeft > 0) {
      tfMachineImgFront[0].src = tfMachineImgShaking;

      function unshake() {
        tfMachineImgFront[0].src = tfMachineImgDoorClose;
        setTimeout(shake, 100, shakesLeft - 1);
      }

      setTimeout(unshake, 100);
    } else {
      tfMachineLaunch(tfAvatar);
    }
  }

  setTimeout(shake, 300, 3);
}

async function tfMachineLaunch(tfAvatar) {
  let tfMachineImgBack = $("#tfMachineLayerBack");
  let tfMachineImgFront = $("#tfMachineLayerFront");
  let userDiv = $(".tfedUser");

  playAudio(tfMachineAudioEject);

  setTimeout(() => {
    tfMachineImgBack[0].src = tfMachineImgEmpty;
    tfMachineImgFront[0].src = tfMachineImgFiring;
    setTimeout(() => { tfMachineImgFront[0].src = tfMachineImgDoorClose; }, 100);
  }, 200);

  setTimeout(() => {
    playAudio(tfMachineAudioNyaaa);
  }, 300);

  setTimeout(() => {
    userDiv[0].addEventListener('animationend', () => {
      userDiv[0].remove();
      tfAvatar.cease();
      tfMachineQueue.processNext();
    });
    userDiv[0].style.animation = "2s cubic-bezier(.17,.67,0,1.08) forwards tfMachineLaunchUser";
  }, 200);
  
}

// display profile pic & name
// animate profile pic & name:
// 1. ego into machine
// 2. animate machine