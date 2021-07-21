import { CharacterController, HumanInputController } from './character.js';
import { RandomInputController, SmarterInputController, ANNDrivenInputController } from './ai.js';
import { BoxController } from './box.js';
import { generateGen } from './gene.js';

export class IndividualRun {
    constructor(params) {
        this._populationSize = params.populationSize;
        this._scene = params.scene;

        this._characters = [];
        this._charactersAlive = [];
        this._iteration = 0;
        this._scoreboard = params.scoreboard;
    }

    init() {
        for (let i = 0; i < this._populationSize; i++) {
            const character = new CharacterController({ scene: this._scene, opacity: 0.2 });
            this._characters.push(character);
        }

        return Promise.all(this._characters.map(c => c.init()));
    }

    startNewRound() {
        this._iteration++;
        this._isReady = false;
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

            const character = this._characters[i];
            this._charactersAlive.push(character);
            
            character.start({id: i, input});
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

    isReady() {
        if (this._charactersAlive.length == 0) {
            return false;
        }

        if (this._isReady == true) {
            return true;
        }

        for (let i = 0; i < this._charactersAlive.length; i++) {
            const character = this._charactersAlive[i];
            if (!character.isReady()) {
                return false;
            }
        }
        this._isReady = true;
        return true;
    }

    update(dt) {
        if (!this.isReady()) {
            return;
        }

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
                character.stop();

                if (!character.isHuman) {
                    this._curGen[character.id].score = this._scoreboard.score;
                }

                this._charactersAlive.splice(this._charactersAlive.indexOf(character), 1);
                this._scoreboard.alive = this._charactersAlive.length;
            }

            if (this._charactersAlive.length == 0) {
                this.startNewRound();
            }
        }

    }
}


