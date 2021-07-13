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
        score.style = "font-size: 30px; padding: 8px 16px; font-family: Arial, Helvetica, sans-serif;";
        dom.appendChild(score);
        this._scoreDiv = score;

        const alive = document.createElement('div');
        alive.style = "font-size: 30px; padding: 8px 16px; font-family: Arial, Helvetica, sans-serif;";
        dom.appendChild(alive);
        this._aliveDiv = alive;

        this._dom = dom;

        this.score = 0;
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
        this._aliveDiv.innerText = this._alive;
    }

    get alive() {
        return this._alive;
    }

    get dom() {
        this._init();
        return this._dom;
    }

}