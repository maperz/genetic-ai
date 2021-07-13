import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.130.1/examples/jsm/libs/stats.module.js';
import { CharacterController, HumanInputController, RandomInputController } from './character.js';
import { BoxController } from './box.js';
import { Scoreboard } from './score.js';

let container, stats, clock;
let camera, scene, renderer;

const scoreboard = new Scoreboard();

class IndividualRun {
  constructor(params) {
    this._scene = params.scene;
    this._characters = [];
    this._scoreboard = params.scoreboard;
  }

  startNewRound() {
    console.log("Starting new round");
    this.reset();

    this._boxController = new BoxController({ scene: this._scene });
    this._scoreboard.score = 0;

    this._characters = [];
    this._characters.push(new CharacterController({ id: 0, scene, input: new HumanInputController() }));

    const num_agents = 10;
    for (let i = 1; i <= num_agents; i++) {
      this._characters.push(new CharacterController({ id: i, scene, opacity, input: new RandomInputController({ prob: 0.01 }) }));
    }
  }

  reset() {
    if (this._boxController) {
      this._boxController.remove();
    }

    for (let i = 0; i < this._characters.length; i++) {
      const character = this._characters[i];
      character.remove();
    }
    this._characters = [];
  }

  update(dt) {
    this._characters.forEach((c) => c.update(dt));
    this._boxController.update(dt);
    this._scoreboard.score += dt;

    const boxes = this._boxController.getBoxes();

    for (let i = 0; i < this._characters.length; i++) {
      const character = this._characters[i];

      if (character.checkIntersection(boxes)) {
        console.log("Character hit box!");
        character.remove();
        this._characters.splice(i, 1);

        if (this._characters.length == 0) {
          this.startNewRound();
        }
      }
    }
  }
}



init();

const opacity = 0.2;

const run = new IndividualRun({ scene, scoreboard });

run.startNewRound();


update();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);

  //camera.position.set(10, 10, 20);
  //camera.lookAt(new THREE.Vector3(10, 5, 0));

  camera.position.set(0, 4, 30);
  camera.lookAt(new THREE.Vector3(0, 4, 0));

  //camera.position.set(0, 20, 0);
  //camera.lookAt(new THREE.Vector3(0, 0, 0));

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

  run.update(dt);

  renderer.render(scene, camera);

  requestAnimationFrame(update);
}