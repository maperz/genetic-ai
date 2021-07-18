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
        this._iteration = 0;
        this._scoreboard = params.scoreboard;
    }

    startNewRound() {
        this._iteration++;
        console.log("Starting iteration: " + this._iteration);
        this._scoreboard.iteration = this._iteration;
        this.reset();

        this._prevGen = this._curGen;
        this._curGen = this._generateGeneration(this._prevGen);

        this._boxController = new BoxController({ scene: this._scene });
        this._scoreboard.score = 0;

        this._charactersAlive = [];

        for (let i = 0; i < this._populationSize; i++) {

            /*
            const random = new RandomInputController({ prob: 0.01 });
            const smarter = new SmarterInputController();
            const input = i % 3 == 1 ? smarter : random;
            */
            const genes = this._curGen[i].genes;
            const input = new ANNDrivenInputController({ genes });

            this._charactersAlive.push(new CharacterController({ id: i, scene: this._scene, opacity: 0.2, input }));
        }

        if (this._addHumanPlayer) {
            this._charactersAlive.push(new CharacterController({ id: this._populationSize, scene, input: new HumanInputController(), isHuman: true }));
        }

        this._scoreboard.alive = this._charactersAlive.length;
    }

    _generateGeneration(prev) {
        if (!prev) {
            return Array.from({ length: this._populationSize }, () => ({ genes: generateGen(), score: 0 }));
        }

        prev.sort((a, b) => a.score >= b.score);
        
        // TODO: Generate based on the prev score a new population

        return Array.from({ length: this._populationSize }, () => ({ genes: generateGen(), score: 0 }));
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
            //console.log(markedDeath.length + " characters hit the box!");
            for (let character of markedDeath) {
                character.remove();

                if (!character.isHuman) {
                    this._curGen[character.id].score = this._scoreboard.score;
                }

                this._charactersAlive.splice(this._charactersAlive.indexOf(character), 1);
                this._scoreboard.alive = this._charactersAlive.length;
                if (this._charactersAlive.length == 0) {
                    this.startNewRound();
                }
            }
        }

    }
}


