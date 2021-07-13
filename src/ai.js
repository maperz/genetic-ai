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
