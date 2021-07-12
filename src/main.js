import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.130.1/examples/jsm/libs/stats.module.js';
import { CharacterController, HumanInputController, RandomInputController } from './character.js';
import { BoxController } from './box.js';
import { Scoreboard } from './score.js';

let container, stats, clock;
let camera, scene, renderer;

const scoreboard = new Scoreboard();

init();

const opacity = 0.2;
const num_agents = 5;

const characters = []

// characters.push(  new CharacterController({ id: 0, scene, input: new HumanInputController() }));

for (let i = 1; i < num_agents; i++) {
  characters.push(new CharacterController({ id: i, scene, opacity, input: new RandomInputController({ prob: 0.01 }) }));
}

const boxController = new BoxController({ scene });

update();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
  camera.position.set(10, 10, 20);
  camera.lookAt(new THREE.Vector3(10, 5, 0));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e0e0);
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

  clock = new THREE.Clock();

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

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);

  // stats
  stats = new Stats();

  container.appendChild(scoreboard.dom);
  container.appendChild(stats.dom);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function update() {
  const dt = clock.getDelta();
  stats.update();

  characters.forEach((c) => c.update(dt));
  boxController.update(dt);

  renderer.render(scene, camera);

  scoreboard.score += dt;

  requestAnimationFrame(update);
}