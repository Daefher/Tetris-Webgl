
const sceneWidth = window.innerWidth;
const sceneHeigth = window.innerHeight;

var scene;
var camera;
var renderer;
var container;
var board;
var SpotLightHelper;
var cameraHelper;


/* 
    TODO:Buscar ejemplo dobre Physijs para implentar las collisones
*/

init();

function init(){
    createScene();
    update();
}
function createScene(){
    scene = new THREE.Scene();
    scene.backgroud = new THREE.Color(0xff00ff);
    
    camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeigth,0.1,1000); 
    camera.position.set(0,0,11);
    

    renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setSize(sceneWidth, sceneHeigth);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change',render);
    orbitControl.enableZoom = true;
    
    
    var ambienLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambienLight);
    var SpotLight = new THREE.SpotLight(0xffffff,1);

    SpotLight.position.set(0,15,25);
    SpotLight.angle = Math.PI/4;
    SpotLight.distance = 15;
    SpotLight.penumbra = 0.05;
    SpotLight.distance = 90;
    SpotLight.decay = 0;

    SpotLight.castShadow = true;
    //SpotLight.shadow.update(SpotLight);
    SpotLight.shadow.mapSize.width = 1024;
    SpotLight.shadow.mapSize.height = 1024;
    SpotLight.shadow.camera.near = 0.5;
    SpotLight.shadow.camera.far = 90;   
    scene.add(SpotLight);   
   
    SpotLightHelper  = new THREE.SpotLightHelper(SpotLight);
    scene.add(SpotLightHelper);
    cameraHelper = new THREE.CameraHelper(SpotLight.shadow.camera);
    scene.add(cameraHelper)

    board = createBoard(0,0,0);

    var Plane = new THREE.PlaneBufferGeometry(100,100,1);
    var PlaneMaterial = new THREE.MeshPhongMaterial({color:0x22222222, side: THREE.DoubleSide});
    GroundMesh = new THREE.Mesh(Plane, PlaneMaterial)
    GroundMesh.position.z = -5;
    GroundMesh.position.y = -10;
    GroundMesh.rotation.x = Math.PI/2;
    GroundMesh.receiveShadow = true;

    scene.add(GroundMesh);
    
    
    //board.castShadow = true;
    scene.add(board);
    /*
    var T = createT();
    var L = createLJ(0xfce903);
    var J = createLJ(0xff0090);
    var I = createI();
    var O = createO();
    var S = createSZ(0x0000ff);
    var Z = createSZ(0x00ff00);
    L.position.y -= 1;
    I.position.y += 1.5;
    O.position.x += 2;  
    J.position.x -= 2;
    J.rotation.y += Math.PI;
    S.position.x += 2.5;
    S.position.y += 1.5;

    Z.rotation.y = Math.PI;
    Z.position.x -= 2.5;
    Z.position.y += 1.5;

    scene.add(L);
    scene.add(T);
    scene.add(I);
    scene.add(O);
    scene.add(J);
    scene.add(S);
    scene.add(Z);
    */

    scene.add( new THREE.AxesHelper( 10 ) );

    orbitControl.target.copy(board.position);
    orbitControl.update();
    //camera.position.z = 0;


    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
}

function createRigidBody(obj, physhape, mass, pos , quat){
    obj.position.copy(pos);
    obj.quaternion.copy(quat);

    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z,));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

    var motionState = new Ammo.btDefaultMotionState(transform);

    var localInertia = new Ammo.btVector3(0,0,0);
    physhape.calculateLocalInertia(mass, localInertia);

    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physhape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    obj.userData.physicsBody = body;

    scene.add(obj);

    if(mass > 0){
        rigidBodies.push(obj);
        body.setActivationState(4);
    }
    physicsWorld.addRigidBody(body);


}

function generateObjects(){
    var numTypes = 7;
    var objectType  = Math.ceil(Math.random * numTypes);
    objectType = 1
    var obj = null;
    var shape = null;

    switch (objectType) {
        case 1:
            obj,shape = createT(margin);

            
            break;
        case 2:
            
            break;
        default:
            break;
    }


}
function createT(){   
    var base = createCube(3/2,1/2,1/2,0x3d3e40);    
    var top = createCube(1/2,1/2,1/2,0x3d3e40);
    top.position.y += 1/2;
    base.add(top);    
    return base;
}
function createLJ(color){
    var base =  createCube(3/2,1/2,1/2, color );
    var nod  = createCube(1/2,1/2,1/2, color);
    nod.position.x -= 1/2;
    nod.position.y -= 1/2;

    base.add(nod);
    return base;
}
function createI(){
    var body = createCube(4/2,1/2,1/2,0xff0000);
    return body;
}
function createO(){
    var O = createCube(2/2,2/2,1/2, 0x00b7eb);
    return O;
}
function createSZ(color){
    var top = createCube(2/2,1/2,1/2,color);
    var down = createCube(2/2,1/2,1/2,color);
    down.position.y -= 1/2;
    down.position.x -= 1/2;
    top.add(down);
    return top;
}
function createBoard(x,y,z){
    var board = new THREE.Group();
        var cubeTop = createCube(9,1,1, 0x181009 );
        var cubeleftSide = createCube(1,14,1,0x181009 ); 
        var cubeRightSide = createCube(1,14,1,0x181009 );
        var cubeDown = createCube(9,1,1,0x181009 );

    cubeTop.position.y += 7;
    cubeDown.position.y -= 7;
    cubeleftSide.position.x += 4;
    cubeRightSide.position.x -= 4;

    board.add(cubeTop);
    board.add(cubeleftSide);
    board.add(cubeRightSide);
    board.add(cubeDown);

    
    return board;
}

function createCube(w,h,d, color){
    var geometry = new THREE.BoxGeometry(w,h,d);
    var material = new THREE.MeshPhongMaterial({ color: color});
    var cube = new THREE.Mesh(geometry,material);   
    
    cube.castShadow = true;
    cube.receiveShadow = true;

    return cube;
}

function update(){    
    render();    
    requestAnimationFrame(update);    
}
function render(){    
    renderer.render(scene,camera);
}

function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
