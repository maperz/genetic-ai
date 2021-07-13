import { ExampleNeuralNetwork } from './ann.js';

export class RandomInputController {
    constructor(params) {
        this._prob = params.prob ?? 0;
    }

    shouldJump(sensorInput) {
        return Math.random() >= (1.0 - this._prob);
    }
};

export class SmarterInputController {
    constructor() {
        this._threshhold = 6;
    }

    shouldJump(sensorInput) {
        const sensor = sensorInput[4];
        return sensor && sensor < this._threshhold;
    }
};

export class ANNDrivenInputController {
    constructor(params) {
        this._stepCounter = 0;
        this._genes = params.genes;
        this._ann = new ExampleNeuralNetwork({ genes: this._genes });
    }

    shouldJump(sensorInput) {
       this._ann.setSensorValues(sensorInput);
       const result = this._ann.compute(this._stepCounter++);
       return result[0] > 0.5;
    }

}
