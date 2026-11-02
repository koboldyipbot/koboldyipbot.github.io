import {TwitchChannelPoints} from 'twitchChannelPoints';
import {TFMachineChat} from 'tfMachineChat';
import {TFMachineQueue} from 'tfMachineQueue';
import {getTwitchUtils} from 'twitchUtils';
import {playAudio} from 'tfMachineUtils';
import {TFAvatar} from 'tfMachineAvatar';
import {initialize as SVGUtilsInitialize} from 'svgUtils';

const twitchUtils = getTwitchUtils(secrets.twitch.chatBot);

const tfMachineBucketQueue = new TFMachineQueue(
  'tf_machine_bucket',
  twitchUtils,
  tfMachineDropUser,
  null,
  true,
  false
);

window.tfMachineBucketQueue = tfMachineBucketQueue;

const twitchChat = new TFMachineChat(tfMachineBucketQueue);

const tfMachineAudioBump = new Audio('/sounds/tf_machine/cm_catgirlbump.wav');
const tfMachineAudioFalling = new Audio('/sounds/tf_machine/cm_catgirlfallin.wav');

var DEBUG_ITEM;


// function tfMachineParse (isMod, commandArr, channel, context, msg, self) {
//     // if (user.bits >500 && user.bits % 10 == 3) {

//     if (isMod) {
//         let user = commandArr.length > 1 ? commandArr[1] : context.username;
//         tfMachineBucketQueue.enqueue(user);
//     }
//     // }
// }

// addModule("tfmachine", tfMachineParse);


const sceneShiftY = 500;

// TODO: remove this
function matterLoadImages(urls, onSuccess, onError) {
    let imgs = [];
    for (let i = 0; i < urls.length; i++) {
        imgs.push(null);
    }
    let numAdded = 0;
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let img = new Image();
        if (url.startsWith('https://')) {
            img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
            imgs[i] = img;
            numAdded += 1;

            if (numAdded == urls.length) {
                onSuccess(imgs);
            }
        };
        img.onerror = () => onError(url);
        img.src = url;
    }
}

function matterLoadImage(url, onSuccess, onError) {
    function callSuccess(urls) {
        onSuccess(urls[0]);
    }
    matterLoadImages([url], callSuccess, onError);
};

var matterEngine;
var matterRender;
var matterRunner;
// var matterDetector;

$('document').ready(function(){
  SVGUtilsInitialize().then(() => {
    tfMachineBucketQueue.enabled = true;
  })
  twitchChat.connect();
    console.debug('initializing physics');

    // module aliases
    let Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Events = Matter.Events,
        Detector = Matter.Detector;

    // create an engine
    matterEngine = Engine.create({
        velocityIterations: 8
    });
    // window.matterEngine = matterEngine; // for debugging

    // create a renderer
    matterRender = Render.create({
        element: document.body,
        engine: matterEngine,
        options: {
            background: 'transparent',
            wireframes: false,
            height: 1000,
            width: 400
        }
    });

    // scrapped work for reducing spin on collision
    // Events.on(matterEngine, 'collisionStart', (event) => {
    //     for (var i = 0; i < event.pairs.length; i++) {
    //         let pair = event.pairs[0];
    //         var collidedUser;
    //         if (pair.bodyA.label.endsWith("_hitbox")) {
    //             collidedUser = pair.bodyA;
    //         } else if (pair.bodyB.label.endsWith("_hitbox")) {
    //             collidedUser = pair.bodyB;
    //         } else {
    //             // only interested in decaying spin for users
    //             continue;
    //         }

    //         Body.setAngularVelocity(collidedUser, collidedUser.angularVelocity * 0.95);
            
    //         // console.log(`angular speed: ${collidedUser.angularSpeed} -- angular velocity: ${collidedUser.angularVelocity}`);
    //     }
    // });

    // var bucketBackImg = new Image();
    // bucketBackImg.src = './images/tf_machine/bucket_back.png';

    let boxScale = 1.1;

    matterLoadImage(
        '../../images/tf_machine/bucket_back.png',
        img => {
            var bucketBack = Bodies.rectangle(
                258, 200+sceneShiftY, 100, 100, 
                { 
                    label: 'bucketBack',
                    isStatic: true, 
                    collisionFilter: {
                        mask: 0
                    },
                    render: {
                        sprite: {
                            texture: img.src,
                            xScale: boxScale,
                            yScale: boxScale
                        }
                    }
                }
            );
            let group = Composite.create({label: `bucketBack_composite`});
            Composite.add(group, [bucketBack]);
            Composite.add(matterEngine.world, [group]);
        },
        () => {
            console.log("Error loading bucket back");
        }
    );

    matterLoadImage(
        '../../images/tf_machine/bucket_front.png',
        img => {
            var bucketFront = Bodies.rectangle(
                258, 200+sceneShiftY, 100, 100, 
                { 
                    label: 'bucketFront',
                    isStatic: true, 
                    collisionFilter: {
                        mask: 0
                    },
                    render: {
                        sprite: {
                            texture: img.src,
                            xScale: boxScale,
                            yScale: boxScale
                        }
                    }
                }
            );
            let group = Composite.create({label: `bucketFront_composite`});
            Composite.add(group, [bucketFront]);
            Composite.add(matterEngine.world, [group]);
        },
        () => {
            console.log("Error loading bucket front");
        }
    );

    // ensure bucketFront is always top-layer
    // move newly added item to a random z-index
    Events.on(matterEngine.world, "afterAdd", function(e) {
        matterEngine.world.composites.sort((a, b) => {
            // console.log(`comparing: ${a.label} and ${b.label}`);
            if (a.label === "bucketFront_composite" || b.label === "bucketBack_composite") {
                return 1;
            } else if (b.label === "bucketFront_composite" || a.label === "bucketBack_composite") {
                return -1;
            } else if (a.id === e.object.id || b.id == e.object.id){
                return Math.round(Math.random()) == 0 ? -1 : 1;
            } else {
                return 0;
            }
        });
    });

    let showBucket = false;
    var bucketLeft = Bodies.rectangle(165, -250+sceneShiftY, 20, config.tf_machine_bucket.leftWallHeight, 
        { 
            restitution: 1, 
            isStatic: true, 
            label: 'bucketLeft', 
            frictionStatic: 1,
            friction: 0.5,
            render: {visible: showBucket} 
        }
    );
    var bucketFloor1 = Bodies.rectangle(260, 235+sceneShiftY, 220, 20, 
        { 
            restitution: 1, 
            angle: Math.PI * 0.03,
            isStatic: true, 
            label: 'bucketFloor1', 
            frictionStatic: 1,
            friction: 0.5,
            render: {visible: showBucket} 
        }
    );
    var bucketFloor2 = Bodies.rectangle(340, 230+sceneShiftY, 60, 20, 
        { 
            restitution: 1, 
            angle: Math.PI * -0.16, 
            isStatic: true, 
            label: 'bucketFloor2', 
            frictionStatic: 1,
            friction: 0.5,
            render: {visible: showBucket} 
        }
    );
    // Body.setMass(bucketFloor1, 1000);
    // Body.setMass(bucketFloor2, 1000);
    var bucketRight = Bodies.rectangle(360, -250+sceneShiftY, 20, config.tf_machine_bucket.rightWallHeight,
        { 
            restitution: 1, 
            isStatic: true, 
            label: 'bucketRight', 
            frictionStatic: 1,
            render: {visible: showBucket} 
        }
    );
    var bucketComposite = Composite.create({label: `bucket_composite`});
    Composite.add(bucketComposite, [bucketLeft, bucketFloor1, bucketFloor2, bucketRight]);
    Composite.add(matterEngine.world, [bucketComposite]);

    // add all of the bodies to the world
    // bucketFront]);

    // run the renderer
    Render.run(matterRender);

    // create runner
    matterRunner = Runner.create();
    // matterDetector = Detector.create();

    // run the engine
    Runner.run(matterRunner, matterEngine);

});

async function tfMachineDropUser(username) {
    let Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Events = Matter.Events,
        Constraint = Matter.Constraint;

    console.log('oh?')

    let pfpBaseUrl = await twitchUtils.getTwitchProfilePictureURL(username);
    let tfAvatar = new TFAvatar(username);
    window.tfAvatar = tfAvatar;

    tfAvatar.interpretCode().then(() => {
      tfAvatar.renderTFed().then(() => {
        // tfAvatar.injectToDiv(tfedUserDiv);
        // tfedUserDiv.appendChild(avatarShirt);
        console.log('avatar rendered');
        matterLoadImage(
          pfpBaseUrl,
          img => {
              let tfedImg = tfAvatar.baseImg;
              let pfpImg = img;
              let tfedScale = 0.15;
              let startX = 258;
              let startY = 100; //-100;

              let startAngle = 0.125 * Math.PI * (Math.random() - 0.5);

              let hitbox = Bodies.trapezoid(startX, startY, 40, 75, .4,
                  {
                      // angle: startAngle,
                      label: `${username}_hitbox`,
                      slop: 0.1,
                      mass: 5,
                      density: .2,
                      frictionStatic: 1,
                      friction: 0.3,
                      restitution: 0.2,
                      // isStatic: true,
                      render: {
                          visible: false,
                          fillStyle: 'transparent',
                          strokeStyle: 'black',
                          lineWidth: 2
                      }
                  }
              );
              // console.log(hitbox.restitution);
              // console.log(`mass: ${hitbox.mass} -- density: ${hitbox.density}`);


              let spriteSize = 100;
              var spriteHolder = Bodies.rectangle(
                  startX, startY, spriteSize, spriteSize, 
                  { 
                      label: `tfed_${username}_sprite`,
                      // angle: startAngle,
                      // isStatic: true, 
                      collisionFilter: {
                          mask: 0
                      },
                      mass: 0,
                      render: {
                          // visible: false,
                          sprite: {
                              texture: tfedImg.src,
                              xScale: tfedScale,
                              yScale: tfedScale
                          }
                      }
                  }
              );

              window.tfAvatar = tfAvatar;
              tfAvatar.registerMatterSprite(spriteHolder.render.sprite);

              let pfpScale = 0.06;
              let tempCanvas = document.createElement('canvas');
              // document.body.appendChild(tempCanvas);
              let newWidth = spriteSize * pfpScale;
              let newHeight = spriteSize * pfpScale;
              tempCanvas.width = pfpImg.width;
              tempCanvas.height = pfpImg.height;
              let ctx = tempCanvas.getContext("2d");

              ctx.drawImage(pfpImg, 0, 0, pfpImg.width, pfpImg.height);

              let oldGlobalCompositeOperation = ctx.globalCompositeOperation;
              ctx.globalCompositeOperation = 'destination-in';
              ctx.beginPath();
              ctx.arc(pfpImg.width/2, pfpImg.width/2, pfpImg.width/2, 0, Math.PI*2);
              ctx.closePath();
              ctx.fill();

              let newPFPUrl = tempCanvas.toDataURL('image/png'); // about:config: privacy.resistFingerprinting needs to be false


              var pfpHolder = Bodies.circle(
                  startX, startY, newWidth,
                  { 
                      label: `tfed_${username}_pfp`,
                      // angle: startAngle,
                      // isStatic: true, 
                      collisionFilter: {
                          mask: 0
                      },
                      mass: 0,
                      render: {
                          // visible: false,
                          sprite: {
                              texture: newPFPUrl, //pfpImg.src,
                              xScale: pfpScale,
                              yScale: pfpScale
                          }
                      }
                  }
              );

              let constraintHitbox1 = Constraint.create({
                  bodyA: hitbox,
                  pointA: {x: 0, y: 10},
                  bodyB: spriteHolder,
                  pointB: {x: -10, y: 40},
                  length: 0,
                  stiffness: 1,
                  render: {
                      visible: false
                  }
              });
              let constraintHitbox2 = Constraint.create({
                  bodyA: hitbox,
                  pointA: {x: 0, y: -10},
                  bodyB: spriteHolder,
                  pointB: {x: -10, y: -10},
                  length: 0,
                  stiffness: 1,
                  render: {
                      visible: false
                  }
              });

              let constraintPFP1 = Constraint.create({
                  bodyA: spriteHolder,
                  pointA: {x: 1-12, y: 17-3},
                  bodyB: pfpHolder,
                  pointB: {x: 0, y: 0},
                  length: 0,
                  // damping: 0.2,
                  stiffness: 1,
                  render: {
                      visible: false
                  }
              })

              let constraintPFP2 = Constraint.create({
                  bodyA: spriteHolder,
                  pointA: {x: 1-12, y: 27-3},
                  bodyB: pfpHolder,
                  pointB: {x: 0, y: 5},
                  length: 0,
                  // damping: 0.2,
                  stiffness: 1,
                  render: {
                      visible: false
                  }
              })

              var tfedMain = Composite.create({
                  label: `tfed_${username}`,
                  bodies: [spriteHolder, pfpHolder, hitbox],
                  constraints: [constraintHitbox1, constraintHitbox2, constraintPFP1, constraintPFP2]
              });

              // let group = Composite.create({label: `catgirl_${username}`});
              // Composite.add(group, [spriteHolder, pfpHolder, catgirlMain, constraintHitbox1, constraintHitbox2, constraintPFP1, constraintPFP2]);

              // matterDetector.setBodies = matterDetector.bodies.concat([hitbox]);
              Composite.add(matterEngine.world, tfedMain);
              Body.rotate(hitbox, startAngle, null, true);
              playAudio(tfMachineAudioFalling);
              setTimeout(() => {
                  hitbox.restitution = 0;
                  // Body.setDensity(hitbox, 0.8);
                  // Body.setInertia(hitbox, 100000);
              }, 600);
              // Composite.add(matterEngine.world, [catgirlSprite]);
          },
          (url) => {
              console.log(`Error somewhere loading image: ${url}`);
          }
      );
      });
    });
}

window.tfMachineDropUser = tfMachineDropUser;