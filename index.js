'use strict';

let game = null;
let data = null;
const genOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

function toggleDarkMode(event) {
    console.log('test');
    document.body.classList.toggle('dark');
}
document.getElementById('dark-mode').addEventListener('click', toggleDarkMode);

function startGame(event) {
    event.preventDefault();
    document.getElementById('start').hidden = true;
    document.getElementById('game').hidden = false;
    switch (document.getElementById('difficulty').value) {
        case 'easy':
            game = new EasyGame();
            break;
        case 'medium':
            game = new MediumGame();
            break;
        case 'hard':
            game = new HardGame();
            break;
    }
    document.getElementById('name').focus();
}
document.getElementById('start-form').addEventListener('submit', startGame);

function submitName(event) {
    event.preventDefault();
    if (game) {
        game.submit(document.getElementById('name').value);
    }
}
document.getElementById('game-form').addEventListener('submit', submitName);

function endGame() {
    game.end();
    game = null;
    document.getElementById('start').hidden = false;
    document.getElementById('game').hidden = true;
    document.getElementById('submit-start').innerHTML = 'Play Again';
}

class Game {
    time = 60;
    timerId = null;
    addTimeId = null;
    addTimeFade = 0;
    resultId = null;
    resultFade = 0;
    score = 0;
    answers = new Array(data.count).fill(false);

    constructor() {
        this.timerId = setInterval(() => this.updateTimer(true), 1000);
        this.updateTimer(false);
        document.getElementById('score').innerHTML = 0;
        document.getElementById('panels').innerHTML = '';
        document.getElementById('add-time').style.color = 'transparent';
        document.getElementById('result').style.color = 'transparent';
    }

    updateTimer(tick) {
        if (tick) {
            this.time -= 1;
        }
        let minutes = Math.floor(this.time / 60).toString();
        let seconds = (this.time % 60).toString();
        if (seconds.length < 2) {
            seconds = '0' + seconds;
        }
        document.getElementById('time').innerHTML = minutes + ':' + seconds;
        if (tick && this.time <= 0) {
            endGame();
        }
    }

    submit(name) {
        let formattedName = name.trim().replaceAll(' ', '').replaceAll('-', '').replaceAll('.', '').toLowerCase();
        let id = data.names[formattedName];
        if (!id) {
            this.onFailure(name + ' does not exist');
        } else if (this.answers[id - 1]) {
            document.getElementById('name').value = '';
            this.onFailure('Already have ' + data.pokemon[id - 1].name);
        } else {
            this.answers[id - 1] = true;
            this.score += 1;
            document.getElementById('score').innerHTML = this.score;
            document.getElementById('name').value = '';
            this.addPokemon(data.pokemon[id - 1]);
            if (this.score < data.count) {
                this.onSuccess(data.pokemon[id - 1].name);
            } else {
                endGame();
            }
        }
    }

    onSuccess(name) {
        let result = document.getElementById('result');
        this.resultFade = 1;
        if (this.resultId) {
            clearInterval(this.resultId)
        }
        result.innerHTML = name;
        let resultColor = document.body.classList.contains('dark') ? '0 200 0' : '0 68 0';
        result.style.color = `rgb(${resultColor} / 1)`;
        result.hidden = false;
        this.resultId = setInterval(() => {
            this.resultFade -= 0.05;
            result.style.color = `rgb(${resultColor} / ${this.resultFade})`;
            if (this.resultFade <= 0) {
                result.hidden = true;
                clearInterval(this.resultId);
                this.resultId = null;
            }
        }, 75);

        this.time += 6;
        this.updateTimer(false);
        this.addTimerFade = 1;
        if (this.addTimeId) {
            clearInterval(this.addTimeId);
        }
        let addTime = document.getElementById('add-time');
        let addTimeColor = document.body.classList.contains('dark') ? '200 200 200' : '0 0 0';
        addTime.style.color = `rgb(${addTimeColor} / 1)`;
        addTime.hidden = false;
        this.addTimeId = setInterval(() => {
            this.addTimerFade -= 0.05;
            addTime.style.color = `rgb(${addTimeColor} / ${this.addTimerFade})`;
            if (this.addTimerFade <= 0) {
                addTime.hidden = true;
                clearInterval(this.addTimeId);
                this.addTimeId = null;
            }
        }, 75);
    }

    addPokemon(pokemon) {
        throw Error();
    }

    onFailure(reason) {
        let result = document.getElementById('result');
        this.resultFade = 1;
        if (this.resultId) {
            clearInterval(this.resultId)
        }
        result.innerHTML = reason;
        let color = document.body.classList.contains('dark') ? '200 0 0' : '68 0 0';
        result.style.color = `rgb(${color} / 1)`;
        result.hidden = false;
        this.resultId = setInterval(() => {
            this.resultFade -= 0.05;
            result.style.color = `rgb(${color} / ${Math.min(this.resultFade, 1)})`;
            if (this.resultFade <= 0) {
                result.hidden = true;
                clearInterval(this.resultId);
                this.resultId = null;
            }
        }, 75);
    }

    end() {
        if (this.timerId != null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        if (this.addTimeId) {
            clearInterval(this.addTimeId);
            this.addTimeId = null;
        }
        if (this.resultId) {
            clearInterval(this.resultId);
            this.resultId = null;
        }
        let win = this.score >= data.count;
        document.getElementById('result-win').hidden = !win;
        document.getElementById('result-lose').hidden = win;
        document.getElementById('result-score').innerHTML = this.score;
        let totalTime = 60 + 6 * this.score - this.time;
        let minutes = Math.floor(totalTime / 60).toString();
        let seconds = (totalTime % 60).toString();
        if (seconds.length < 2) {
            seconds = '0' + seconds;
        }
        document.getElementById('result-time').innerHTML = minutes + ':' + seconds;
        document.getElementById('result-difficulty').innerHTML = this.getMode();
        document.getElementById('end-result').hidden = false;
        document.getElementById('instructions').hidden = true;

        document.getElementById('panels').innerHTML = '';
        let resultPanel = document.createElement('div');
        resultPanel.innerHTML = '<ul style="margin-block-start:0"></ul>';
        resultPanel.style.backgroundColor = 'rgb(0 255 0 / 0.25)';
        for (let k = 0; k < this.answers.length; k++) {
            if (this.answers[k]) {
                let line = document.createElement('li');
                let pokemon = data.pokemon[k];
                line.innerHTML = `<img src="assets/${pokemon.id}.png" alt="${pokemon.name}"> ${pokemon.name}`;
                resultPanel.firstElementChild.appendChild(line);
            }
        }
        document.getElementById('panels').appendChild(resultPanel);
    }

    getMode() {
        throw Error();
    }
}

class EasyGame extends Game {
    panels = new Array(genOrder.length);
    genScores = new Array(genOrder.length);
    genStart = new Array(genOrder.length);

    constructor() {
        super();
        for (let k = 0; k < genOrder.length; k++) {
            this.panels[k] = document.createElement('details');
            this.genScores[k] = 0;
            this.panels[k].style.backgroundColor = `hsl(${k * 250} 100 50 / 0.25)`;
            let gen = genOrder[k];
            this.panels[k].innerHTML = `<summary>Generation ${gen}: <span>0</span> / ${data.genCounts[gen]}</summary><div><ol></ol></div>`;
            let pokemon = data.pokemon.filter(pokemon => pokemon.gen == gen);
            this.genStart[k] = pokemon[0].id;
            this.panels[k].querySelector('ol').innerHTML = pokemon
                .map(pokemon => `<li>#${pokemon.id}: ???</li>`)
                .join('');
            document.getElementById('panels').appendChild(this.panels[k]);
        }
    }

    addPokemon(pokemon) {
        let gen = genOrder.indexOf(pokemon.gen);
        this.genScores[gen] += 1;
        let line = this.panels[gen].querySelector('ol').children[pokemon.id - this.genStart[gen]];
        this.panels[gen].querySelector('span').innerHTML = this.genScores[gen];
        line.innerHTML = `#${pokemon.id}: <img src="assets/${pokemon.id}.png" alt="${pokemon.name}"> ${pokemon.name}`;
    }

    getMode() {
        return 'Easy';
    }
}

class MediumGame extends Game {
    panels = new Array(genOrder.length);
    genScores = new Array(genOrder.length);

    constructor() {
        super();
        for (let k = 0; k < genOrder.length; k++) {
            this.panels[k] = document.createElement('details');
            this.genScores[k] = 0;
            this.panels[k].open = true;
            this.panels[k].style.backgroundColor = `hsl(${k * 250} 100 50 / 0.25)`;
            let gen = genOrder[k];
            this.panels[k].innerHTML = `<summary>Generation ${gen}: <span>0</span> / ${data.genCounts[gen]}</summary><div><ul></ul></div>`;
            document.getElementById('panels').appendChild(this.panels[k]);
        }
    }

    addPokemon(pokemon) {
        let line = document.createElement('li');
        line.innerHTML = `<img src="assets/${pokemon.id}.png" alt="${pokemon.name}"> ${pokemon.name}`;
        let gen = genOrder.indexOf(pokemon.gen);
        this.genScores[gen] += 1;
        this.panels[gen].querySelector('span').innerHTML = this.genScores[gen];
        this.panels[gen].querySelector('ul').prepend(line);
    }

    getMode() {
        return 'Medium';
    }
}

class HardGame extends Game {
    panel;

    constructor() {
        super();
        this.panel = document.createElement('div');
        this.panel.style.backgroundColor = 'rgb(0 255 255 / 0.25)';
        this.panel.innerHTML = '<ul style="margin-block-start:0"></ul>';
        document.getElementById('panels').appendChild(this.panel);
    }

    addPokemon(pokemon) {
        let line = document.createElement('li');
        line.innerHTML = `<img src="assets/${pokemon.id}.png" alt="${pokemon.name}"> ${pokemon.name}`;
        this.panel.firstElementChild.prepend(line);
    }

    getMode() {
        return 'Hard';
    }
}

fetch('./data.json')
    .then(response => response.json())
    .then(response => {
        data = response;
        document.getElementById('submit-start').disabled = false;
        for (let element of document.getElementsByClassName('count')) {
            element.innerHTML = data.count;
        }
    });
