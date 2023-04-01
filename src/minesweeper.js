const LEVELS = ['easy', 'normal', 'expert'];

class Minesweeper {
    constructor({ divId = 'minesweeper', count = 8, level = LEVELS[1] }) {
        if (! /^\d+$/.test(count) || count < 8 || count > 128) {
            throw ('Invalid count value!');
        }
        if (!LEVELS.includes(level)) {
            throw (`Unkwnow level. please use one of these: ${LEVELS.join(',')}!`);
        }
        this.blocks = [];
        this.level = level;
        this.divId = divId;
        this.count = count;
        this.width = null;
        this.minesweeperDiv = null;
        this.initSize();
        this.initData();
        this.initUi();
        this.watchWindow();
    }
    initSize() {
        this.minesweeperDiv = document.getElementById(this.divId);
        this.minesweeperDiv.style.minHeight = '100vh';
        this.minesweeperDiv.style.margin = '0 auto';
        this.width = (document.body.clientHeight < document.body.clientWidth)
            ? document.body.clientHeight
            : document.body.clientWidth;
        this.minesweeperDiv.style.width = this.width + 'px';
        this.initUi();
    }

    getBlockSize() {
        return Math.floor(this.width / this.count);
    }

    watchWindow() {
        window.addEventListener('resize', evt => this.initSize());
    }

    initData() {
        let tmpArr = [];
        for (let i = 0; i < this.count * this.count; i++) {
            tmpArr.push({
                id: i,
                bomb: Math.floor(Math.random() * 10) < 3,
                touching: 0
            });
            if (tmpArr.length === this.count) {
                this.blocks.push(tmpArr);
                tmpArr = [];
            }
        }

        for (let i = 0; i < this.blocks.length; i++) {
            for (let j = 0; j < this.blocks[i].length; j++) {
                this.blocks[i][j].touching = this.haveBombNeig(i, j);
            }
        }
    }

    initUi() {
        if (this.minesweeperDiv === null) {
            throw ('Minesweeper element not found!');
        }
        this.minesweeperDiv.innerHTML = '';
        this.blocks.forEach((items, i) => {
            items.forEach((item, j) => {
                let div = document.createElement('button');
                div.style.display = 'block';
                div.style.width = this.getBlockSize() + 'px';
                div.style.height = this.getBlockSize() + 'px';
                div.style.float = 'left';
                div.setAttribute('id', `ms-block-${i}-${j}`);
                div.style.fontSize = '4vmin';
                div.oncontextmenu = (e) => {
                    e.preventDefault();
                    if (e.target.innerHTML === '') {
                        e.target.innerHTML = '&#9873';
                    } else {
                        e.target.innerHTML = '';
                    }
                };
                div.onclick = (e) => {
                    if (e.target.innerHTML === '') {
                        if (this.blocks[i][j].bomb) {
                            this.reveal(i, j);
                            alert('you lose :(');
                        } else {
                            div.innerHTML = item.touching;
                            this.recursiveOpenBlocks(i, j, 15);
                        }
                    }
                }
                this.minesweeperDiv.appendChild(div);
            });
        });

    }

    reveal(i, j) {
        for (let i = 0; i < this.count; i++) {
            for (let j = 0; j < this.count; j++) {
                document.getElementById(`ms-block-${i}-${j}`).innerHTML = this.blocks[i][j].bomb ? '&#128163;' : this.blocks[i][j].touching;
            }
        }
        document.getElementById(`ms-block-${i}-${j}`).style.backgroundColor = 'red';
    }

    recursiveOpenBlocks(i, j, count) {
        if (count === 0)
            return;
        let y = this.ffn(i, j);
        console.log(y, count);
        // if (this.haveBombNeig(i, j) === 0) {
        //     return;
        // }
        if (y !== []) {
            document.getElementById(`ms-block-${y[0]}-${y[1]}`).innerHTML = this.blocks[y[0]][y[1]].touching;
            this.recursiveOpenBlocks(y[0], y[1], count - 1);
        }
    }

    haveBombNeig(i, j) {
        let count = 0;
        if (this.blocks[i][j + 1] !== undefined) {
            count += this.blocks[i][j + 1].bomb ? 1 : 0;
        }
        if (this.blocks[i][j - 1] !== undefined) {
            count += this.blocks[i][j - 1].bomb ? 1 : 0;
        }
        if (this.blocks[i + 1] !== undefined && this.blocks[i + 1][j] !== undefined) {
            count += this.blocks[i + 1][j].bomb ? 1 : 0;
        }
        if (this.blocks[i - 1] !== undefined && this.blocks[i - 1][j] !== undefined) {
            count += this.blocks[i - 1][j].bomb ? 1 : 0;
        }
        if (this.blocks[i + 1] !== undefined && this.blocks[i + 1][j - 1] !== undefined) {
            count += this.blocks[i + 1][j - 1].bomb ? 1 : 0;
        }
        if (this.blocks[i - 1] !== undefined && this.blocks[i - 1][j + 1] !== undefined) {
            count += this.blocks[i - 1][j + 1].bomb ? 1 : 0;
        }
        if (this.blocks[i - 1] !== undefined && this.blocks[i - 1][j - 1] !== undefined) {
            count += this.blocks[i - 1][j - 1].bomb ? 1 : 0;
        }
        if (this.blocks[i + 1] !== undefined && this.blocks[i + 1][j + 1] !== undefined) {
            count += this.blocks[i + 1][j + 1].bomb ? 1 : 0;
        }
        return count;
    }

    ffn(i, j, count) {
        if (count === 0)
            return;
        if (
            this.blocks[i][j + 1] !== undefined && !this.blocks[i][j + 1].bomb
        ) {
            return [i, j + 1];
        }
        if (
            this.blocks[i][j - 1] !== undefined && !this.blocks[i][j - 1].bomb
        ) {
            return [i, j - 1];
        }
        if (
            this.blocks[i + 1] !== undefined && this.blocks[i + 1][j] !== undefined && !this.blocks[i + 1][j].bomb
        ) {
            return [i + 1, j];
        }
        if (
            this.blocks[i - 1] !== undefined && this.blocks[i - 1][j] !== undefined && !this.blocks[i - 1][j].bomb
        ) {
            return [i - 1, j];
        }
        if (
            this.blocks[i + 1] !== undefined && this.blocks[i + 1][j - 1] !== undefined && !this.blocks[i + 1][j - 1].bomb
        ) {
            return [i + 1, j - 1];
        }
        if (
            this.blocks[i - 1] !== undefined && this.blocks[i - 1][j + 1] !== undefined && !this.blocks[i - 1][j + 1].bomb
        ) {
            return [i - 1, j + 1];
        }
        if (
            this.blocks[i - 1] !== undefined && this.blocks[i - 1][j - 1] !== undefined && !this.blocks[i - 1][j - 1].bomb
        ) {
            return [i - 1, j - 1];
        }
        if (
            this.blocks[i + 1] !== undefined && this.blocks[i + 1][j + 1] !== undefined && !this.blocks[i + 1][j + 1].bomb
        ) {
            return [i + 1, j + 1];
        }

        return [];
    }

    docHeight() {
        return document.body.scrollHeight;
    }
}