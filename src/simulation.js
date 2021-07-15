import { CharacterController, HumanInputController } from './character.js';
import { RandomInputController, SmarterInputController, ANNDrivenInputController } from './ai.js';
import { BoxController } from './box.js';
import { generateGen } from './gene.js';

export class IndividualRun {
    constructor(params) {
        this._populationSize = params.populationSize;
        this._addHumanPlayer = params.humanplayer;
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
        if (this._addHumanPlayer) {
            this._charactersAlive.push(new CharacterController({ id: 0, scene, input: new HumanInputController() }));
        }

        for (let i = 0; i < this._populationSize; i++) {

            /*
            const random = new RandomInputController({ prob: 0.01 });
            const smarter = new SmarterInputController();
            const input = i % 3 == 1 ? smarter : random;
            */
            const input = new ANNDrivenInputController({ genes: this._genes[i] });

            this._charactersAlive.push(new CharacterController({ id: i + 1, scene: this._scene, opacity: 0.2, input }));
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


