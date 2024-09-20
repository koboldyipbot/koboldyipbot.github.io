$('document').ready(function(){
    console.log('initializing physics');

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

    // create an engine
    var engine = Engine.create();

    // create a renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            wireframeBackground: 'transparent'
        }
    });

    // create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(450, 50, 80, 80);
    var bucketLeft = Bodies.rectangle(200, 200, 20, 100, { isStatic: true });
    var bucketFloor = Bodies.rectangle(260, 240, 100, 20, { isStatic: true });
    var bucketRight = Bodies.rectangle(320, 200, 20, 100, { isStatic: true });

    var bucketBack = Bodies.rectangle(
        200, 200, 100, 100, 
        { 
            isStatic: true, 
            render: {
                sprite: {
                    texture: '../../images/tf_machine/bucket_back.png'
                }
            }
        }
    );

    var bucketFront = Bodies.rectangle(
        200, 200, 100, 100, 
        { 
            isStatic: true, 
            render: {
                sprite: {
                    texture: '../../images/tf_machine/bucket_front.png'
                }
            }
        }
    );





    // add all of the bodies to the world
    Composite.add(engine.world, [bucketBack, boxA, boxB, bucketLeft, bucketFloor, bucketRight, bucketFront]);

    // run the renderer
    Render.run(render);

    // create runner
    var runner = Runner.create();

    // run the engine
    Runner.run(runner, engine);

});