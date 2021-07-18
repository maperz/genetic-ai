export class InfoBoard {

    constructor() {
    }

    _init() {
        if (this._dom) {
            return;
        }

        const dom = document.createElement('div');

        dom.style = "position: fixed; top: 0px; right: 0px; cursor: pointer; opacity: 0.9; z-index: 10000;";

        const score = document.createElement('div');
        score.style = "font-size: 26px; padding: 8px 16px; font-family: Arial, Helvetica, sans-serif; text-align: right;";
        dom.appendChild(score);
        this._scoreDiv = score;

        const iteration = document.createElement('div');
        iteration.style = "font-size: 20px; padding: 4px 16px; font-family: Arial, Helvetica, sans-serif; text-align: right;";
        dom.appendChild(iteration);
        this._iterationDiv = iteration;

        const alive = document.createElement('div');
        alive.style = "font-size: 20px; padding: 4px 16px; font-family: Arial, Helvetica, sans-serif; text-align: right;";
        dom.appendChild(alive);
        this._aliveDiv = alive;

        this._dom = dom;

        this.score = 0;
        this.alive = 0;
        this.iteration = 0;
    }

    set score(val) {
        this._score = val;
        this._scoreDiv.innerText = this._score.toFixed(2);
    }

    get score() {
        return this._score;
    }

    set alive(val) {
        this._alive = val;
        this._aliveDiv.innerText = val;
    }

    get alive() {
        return this._alive;
    }

    set iteration(val) {
        this._iteration = val;
        this._iterationDiv.innerText = val;
    }

    get iteration() {
        return this._iteration;
    }


    get dom() {
        this._init();
        return this._dom;
    }

}