import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    AmbientLight,
    DirectionalLight,
    PMREMGenerator,
    ACESFilmicToneMapping,
    Color
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

let camera, scene, renderer, controls;

init();
loadModel();
animate();

function init() {
    // Renderer setup
    const container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Scene setup
    scene = new Scene();

    // Camera setup
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100000);
    camera.position.set(5000, 0.9, 2.7);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    // Lighting setup
    const ambientLight = new AmbientLight(0x404040, 1.5); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1.0); // Direct light source
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Environment map setup
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new EXRLoader().load('3.exr', (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = new Color(0xffffff); // Optional background color
        texture.dispose();
        pmremGenerator.dispose();
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function loadModel() {
    // GLTF Loader setup
    const loader = new GLTFLoader();
    loader.load('2.glb', (gltf) => {
        scene.add(gltf.scene);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
