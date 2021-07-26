export class InfoBoard {

    constructor(model) {
        this._model = model;
        this.score = 0;
        this.alive = 0;
        this.iteration = 0;
    }
    
    set score(val) {
        this._model.score = val;
    }

    get score() {
        return this._model.score;
    }

    set alive(val) {
        this._model.alive = val;
    }

    get alive() {
        return this._model.alive;
    }

    set iteration(val) {
        this._model.iteration = val;
    }

    get iteration() {
        return this._model.iteration;
    }
}