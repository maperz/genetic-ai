import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.130.1/examples/jsm/libs/stats.module.js';
import { IndividualRun } from './simulation.js';
import { InfoBoard } from './info.js';

// Config;
const populationSize = 10;
const addHumanPlayer = false;

class Program {

  constructor() {
    this._init();
  }

  _init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.layers.enable(1);

    //camera.position.set(10, 10, 20);
    //camera.lookAt(new THREE.Vector3(10, 5, 0));

    camera.position.set(0, 4, 30);
    camera.lookAt(new THREE.Vector3(0, 4, 0));

    //camera.position.set(0, 20, 0);
    //camera.lookAt(new THREE.Vector3(0, 0, 0));

    //camera.position.set(-10, 4, 0);
    //camera.lookAt(new THREE.Vector3(4, 4, 0));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    this._clock = new THREE.Clock();

    // lights

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    // ground

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    scene.add(mesh);

    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', this._onWindowResize);

    // stats
    const stats = new Stats();
    const scoreboard = new InfoBoard();

    container.appendChild(scoreboard.dom);
    container.appendChild(stats.dom);

    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    this._stats = stats;

    this._scoreboard = scoreboard;
    this._simulation = new IndividualRun({ scene, scoreboard, populationSize, humanplayer: addHumanPlayer });
    this._simulation.startNewRound();
  }

  update() {
    const dt = this._clock.getDelta();
    this._stats.update();

    this._simulation.update(dt);

    this._renderer.render(this._scene, this._camera);
  }

  _onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

const program = new Program();
function loop() {
  program.update();
  requestAnimationFrame(loop);
}

loop();