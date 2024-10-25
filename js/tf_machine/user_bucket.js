const sceneShiftY = 500;

function matterLoadImages(urls, onSuccess, onError) {
    let imgUrls = [];
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let img = new Image();
        img.onload = () => {
            imgUrls.push(img.src);

            if (imgUrls.length == urls.length) {
                onSuccess(imgUrls);
            }
        };
        img.onerror = onError();
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

$('document').ready(function(){
    console.log('initializing physics');

    // module aliases
    let Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;
        Events = Matter.Events;

    // create an engine
    matterEngine = Engine.create({
        velocityIterations: 8
    });

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

    // var bucketBackImg = new Image();
    // bucketBackImg.src = './images/tf_machine/bucket_back.png';

    let boxScale = 1.1;

    

    matterLoadImage(
        './images/tf_machine/bucket_back.png',
        url => {
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
                            texture: url,
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
        './images/tf_machine/bucket_front.png',
        url => {
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
                            texture: url,
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
    Events.on(matterEngine.world, "afterAdd", function(items) {
        console.log("doing comparisons!");
        matterEngine.world.composites.sort((a, b) => {
            console.log(`comparing: ${a.label} and ${b.label}`);
            if (a.label === "bucketFront_composite" || b.label === "bucketBack_composite") {
                return 1;
            } else if (b.label === "bucketFront_composite" || a.label === "bucketBack_composite") {
                return -1;
            } else {
                return 0;
            }
        });
    });

    var bucketLeft = Bodies.rectangle(200, -250+sceneShiftY, 20, 1000, { isStatic: true, label: 'bucketLeft' });
    var bucketFloor = Bodies.rectangle(260, 240+sceneShiftY, 100, 20, { isStatic: true, label: 'bucketFloor' });
    var bucketRight = Bodies.rectangle(320, -250+sceneShiftY, 20, 1000, { isStatic: true, label: 'bucketRight' });
    var bucketComposite = Composite.create({label: `bucket_composite`});
    Composite.add(bucketComposite, [bucketLeft, bucketFloor, bucketRight]);
    Composite.add(matterEngine.world, [bucketComposite]);

    // add all of the bodies to the world
    // bucketFront]);

    // run the renderer
    Render.run(matterRender);

    // create runner
    matterRunner = Runner.create();

    // run the engine
    Runner.run(matterRunner, matterEngine);

});


function addCatgirl(name) {
    let Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Events = Matter.Events,
        Constraint = Matter.Constraint;

    matterLoadImage(
        './images/tf_machine/catgirl.png',
        url => {
            let catgirlScale = 0.3;
            let startX = 258;
            let startY = 50;

            let startAngle = 0.25 * Math.PI * (Math.random() - 0.5);

            // let catgirlHead = Bodies.circle(startX+2, startY-18, 26, {
            //     label: `catgirl_${name}_head`,
            //     // isStatic: true,
            //     render: {
            //         fillStyle: 'transparent',
            //         strokeStyle: 'black',
            //         lineWidth: 2,
            //         slop: 0,
            //     },
            // });
            // let catgirlBody = Bodies.circle(startX+2, startY+26, 15, {
            //     label: `catgirl_${name}_body`,
            //     // isStatic: true,
            //     render: {
            //         fillStyle: 'transparent',
            //         strokeStyle: 'black',
            //         lineWidth: 2,
            //         slop: 0,
            //     },
            // });

            // let hitbox = Bodies.fromVertices(startX, startY, 
            //     [{x:15, y:20}, {x:5, y:100}, {x:45, y:100}, {x:35, y:20}],
            //     {
            //         angle: startAngle,
            //         render: {
            //             fillStyle: 'transparent',
            //             strokeStyle: 'black',
            //             lineWidth: 2,
            //             // slop: 0.2,
            //             friction: 0.9,
            //             frictionStatic: 10,
            //             // restitution: 0.2
            //         }
            //     }
            // );

            let hitbox = Bodies.trapezoid(startX, startY, 40, 75, .4,
                {
                    angle: startAngle,
                    render: {
                        visible: false,
                        fillStyle: 'transparent',
                        strokeStyle: 'black',
                        lineWidth: 2,
                        // slop: 0.2,
                        friction: 0.9,
                        frictionStatic: 100,
                        // restitution: 0.2
                    }
                }
            );


            var spriteHolder = Bodies.rectangle(
                startX, startY, 100, 100, 
                { 
                    label: `catgirl_${name}_sprite`,
                    angle: startAngle,
                    // isStatic: true, 
                    collisionFilter: {
                        mask: 0
                    },
                    mass: 0,
                    render: {
                        // visible: false,
                        sprite: {
                            texture: url,
                            xScale: catgirlScale,
                            yScale: catgirlScale
                        }
                    }
                }
            );

            var catgirlMain = Body.create({
                parts: [hitbox],
                render: {
                    sprite: {
                        texture: url,
                        xScale: catgirlScale,
                        yScale: catgirlScale
                    }
                }
            });

            let constraint1 = Constraint.create({
                bodyA: catgirlMain,
                pointA: {x: 0, y: 10},
                bodyB: spriteHolder,
                pointB: {x: 0, y: 40},
                length: 0,
                render: {
                    visible: false
                }
            });
            let constraint2 = Constraint.create({
                bodyA: catgirlMain,
                pointA: {x: 0, y: -10},
                bodyB: spriteHolder,
                pointB: {x: 0, y: -10},
                length: 0,
                render: {
                    visible: false
                }
            });
            // let constraintBody1 = Constraint.create({
            //     bodyA: catgirlBody,
            //     pointA: {x: 0, y: 10},
            //     bodyB: catgirlMain,
            //     pointB: {x: 0, y: 10},
            //     length: 0
            // });
            // let constraintBody2 = Constraint.create({
            //     bodyA: catgirlBody,
            //     pointA: {x: 0, y: -10},
            //     bodyB: catgirlMain,
            //     pointB: {x: 0, y: -10},
            //     length: 0
            // });

            let group = Composite.create({label: `catgirl_${name}`});
            // Composite.add(group, [spriteHolder, catgirlHead, catgirlBody, constraintHead1, constraintHead2, constraintBody1, constraintBody2]);
            Composite.add(group, [spriteHolder, catgirlMain, constraint1, constraint2]);

            Composite.add(matterEngine.world, group);
            setTimeout(() => {
                console.log(`previous density: ${hitbox.density}`);
                Body.setDensity(hitbox, 0.8);
                Body.setInertia(hitbox, 100000);
            }, 600);
            // Composite.add(matterEngine.world, [catgirlSprite]);
        },
        () => {
            console.log("Error  Loading ");
        }
    );
}