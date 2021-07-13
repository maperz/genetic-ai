import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.130.1/examples/jsm/libs/stats.module.js';
import { CharacterController, HumanInputController } from './character.js';
import { RandomInputController, SmarterInputController, ANNDrivenInputController } from './ai.js';
import { BoxController } from './box.js';
import { InfoBoard } from './info.js';

import { Neuron, ExampleNeuralNetwork,  } from './ann.js';
import {generateGen} from './gene.js';

let container, stats, clock;
let camera, scene, renderer;

const populationSize = 10;
const addHumanPlayer = false;

const scoreboard = new InfoBoard();

class IndividualRun {
  constructor(params) {
    this._populationSize = params.populationSize;
    this._scene = params.scene;
    this._charactersAlive = [];
    this._scoreboard = params.scoreboard;
    this._genes = Array.from({ length: this._populationSize }, () => generateGen());
  }

  startNewRound() {
    console.log("Starting new round");
    this.reset();

    this._boxController = new BoxController({ scene: this._scene });
    this._scoreboard.score = 0;

    this._charactersAlive = [];
    if (addHumanPlayer) {
      this._charactersAlive.push(new CharacterController({ id: 0, scene, input: new HumanInputController() }));
    }

    for (let i = 0; i < this._populationSize; i++) {

      /*
      const random = new RandomInputController({ prob: 0.01 });
      const smarter = new SmarterInputController();
      const input = i % 3 == 1 ? smarter : random;
      */
      const input = new ANNDrivenInputController({ genes: this._genes[i] });

      this._charactersAlive.push(new CharacterController({ id: i + 1, scene, opacity: 0.2, input }));
    }

    this._scoreboard.alive = this._charactersAlive.length;
  }

  reset() {
    if (this._boxController) {
      this._boxController.remove();
    }

    for (let i = 0; i < this._charactersAlive.length; i++) {
      const character = this._charactersAlive[i];
      character.remove();
    }

    this._charactersAlive = [];
  }

  update(dt) {
    this._charactersAlive.forEach((c) => c.update(dt));
    this._boxController.update(dt);
    this._scoreboard.score += dt;

    const boxes = this._boxController.getBoxes();

    const markedDeath = [];

    for (let i = 0; i < this._charactersAlive.length; i++) {
      const character = this._charactersAlive[i];
      if (character.checkIntersection(boxes)) {
        markedDeath.push(character);
      }
    }

    if (markedDeath.length > 0) {
      console.log(markedDeath.length + " characters hit the box!");
      for (let character of markedDeath) {
        character.remove();
        this._charactersAlive.splice(this._charactersAlive.indexOf(character), 1);
        this._scoreboard.alive = this._charactersAlive.length;
        if (this._charactersAlive.length == 0) {
          this.startNewRound();
        }
      }
    }

  }
}

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
  camera.layers.enable(1);

  //camera.position.set(10, 10, 20);
  //camera.lookAt(new THREE.Vector3(10, 5, 0));

  camera.position.set(0, 4, 30);
  camera.lookAt(new THREE.Vector3(0, 4, 0));

  //camera.position.set(0, 20, 0);
  //camera.lookAt(new THREE.Vector3(0, 0, 0));

  //camera.position.set(-10, 4, 0);
  //camera.lookAt(new THREE.Vector3(4, 4, 0));

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


init();

const run = new IndividualRun({ scene, scoreboard, populationSize });
run.startNewRound();

update();

/*
// Neuron Example

const a = new Neuron({inputs: [1], w: 0.2, b: 0.4});
const b = new Neuron({inputs: [1], w: 0.1, b: 0.0});
const c = new Neuron({inputs: [1], w: 0.5, b: 0.5});

const r = new Neuron({inputs: [a, b, c], w: 1, b: 0});

console.log(r.compute(1));

b.setInputs([10]);

console.log(r.compute(2));
*/


/*
// ANN example

const genes = Array.from({ length: 20 }, () => Math.random());
// const genes = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const ann = new ExampleNeuralNetwork({ genes });
ann.setSensorValues([1, 0, 1, 0, 0]);
console.log(ann.compute(1));
ann.setSensorValues([0, 0, 1, 1, 0]);
console.log(ann.compute(2));
ann.setSensorValues([1, 0, 1, 1, 1]);
console.log(ann.compute(3));
*/