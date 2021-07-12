import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export class HumanInputController {
  constructor() {
    this._Init();
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 32: // SPACE
        this._keys.space = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 32: // SPACE
        this._keys.space = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
    }
  }

  isJumpRequested() {
    return this._keys.space;
  }
};

export class RandomInputController {

  constructor(params) {
    this._prob = params.prob ?? 0;
  }

  isJumpRequested() {
    return Math.random() >= (1.0 - this._prob);
  }
};

export class CharacterController {

  constructor(params) {
    this._id = params.id;
    this._defaultState = "Running";
    this._input = params.input;
    this._scene = params.scene;
    this._gravity = 0.75;
    this._opacity = params.opacity ?? 1.0;

    this._decceleration = new THREE.Vector3(-2, -2, 0);
    this._acceleration = new THREE.Vector3(1, 50, 0.0);
    this._velocity = new THREE.Vector3(0, 0, 0);

    this._init();
  }

  _init() {
    this._loadModel();
  }

  _loadModel() {
    const loader = new GLTFLoader();
    loader.load('resources/robot/RobotExpressive.glb', (gltf) => {
      this._model = gltf.scene.children[0];
      this._model.rotation.y = Math.PI / 2;
      this._scene.add(this._model);
      this._initActions(gltf.animations);
      
      this._model.traverse(n => { if ( n.isMesh && n.material ) {
        const mat = n.material;
        mat.transparent = true;
        mat.opacity = this._opacity;

        const colors = [
          new THREE.Color(1,0,0),
          new THREE.Color(0,1,0),
          new THREE.Color(0,0,1),
          new THREE.Color(1,1,0),
          new THREE.Color(0,1,1),
          new THREE.Color(1,0,1),
        ]

        if (this._id != 0) {
          mat.color = colors[(this._id - 1) % colors.length];
        }
      }});

    }, undefined, function (e) {
      console.error(e);
    });
  }

  _initActions(animations) {
    const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
    const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

    this._mixer = new THREE.AnimationMixer(this._model);

    this._actions = {};

    for (let i = 0; i < animations.length; i++) {
      const clip = animations[i];
      const action = this._mixer.clipAction(clip);
      this._actions[clip.name] = action;

      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    }

    this._activeAction = this._actions[this._defaultState];
    this._activeAction.startAt(Math.random() * 0.5);
    this._activeAction.play();
  }

  _doJump() {
    this._fadeToAction("Jump", 0.2);

    const restoreState = () => {
      this._mixer.removeEventListener('finished', restoreState);
      this._fadeToAction(this._defaultState, 0.2);
    }

    this._mixer.addEventListener('finished', restoreState);
  }
/*
  _addSensors() {
    var headOffset = new THREE.Vector3(0, 3, 0);
    var start = new THREE.Vector3();
    start.addVectors(this._model.position, headOffset);

    var distance = 20;
    var direction = new THREE.Vector3(1, 0, 0);

    var end = new THREE.Vector3();
    end.addVectors(start, direction.multiplyScalar(distance));

    var geometry = new THREE.Geometry();
    geometry.vertices.push(start);
    geometry.vertices.push(end);
    var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    material.transparent = true;
    material.opacity = 0.5;
    var line = new THREE.Line(geometry, material);

    this._scene.add(line);
  }*/

  update(dt) {
    if (this._mixer) this._mixer.update(dt);

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );

    frameDecceleration.multiplyScalar(dt);

    velocity.add(frameDecceleration);

    const acc = this._acceleration.clone();

    if (this._input && this._input.isJumpRequested()
    && this._model
      && this._model.position.y <= 0) {
      velocity.y += acc.y * dt;
      this._doJump();
    }

    /*if (this._input._keys.left) {
      velocity.x -= acc.x * dt;
    }

    if (this._input._keys.right) {
      velocity.x += acc.x * dt;
    }*/

    velocity.y -= this._gravity * dt;

    if (this._model) {
      this._model.position.add(velocity);
      this._model.position.y = Math.max(0, this._model.position.y);
    }
  }

  _fadeToAction(name, duration) {
    this._previousAction = this._activeAction;
    this._activeAction = this._actions[name];

    if (this._previousAction !== this._activeAction) {
      this._previousAction.fadeOut(duration);
    }

    this._activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();

  }
}