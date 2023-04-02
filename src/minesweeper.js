const LEVELS = [
    {
        title: 'easy',
        value: 10,
    },
    {
        title: 'normal',
        value: 5,
    },
    {
        title: 'expert',
        value: 1,
    }
];
class Minesweeper {
    constructor({ divId = 'minesweeper', count = 8, level = LEVELS[1].title }) {
        if (! /^\d+$/.test(count) || count < 8 || count > 128) {
            throw ('Invalid count value!');
        }
        if (!LEVELS.find(lvl => lvl.title === level)) {
            throw (`Unkwnow level. please use one of these: ${LEVELS.map(itm => itm.title).join(',')}!`);
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
        this.minesweeperDiv.style.display = 'inline-block';
        this.minesweeperDiv.style.margin = '0 auto';
        this.width = (document.body.clientHeight < document.body.clientWidth)
            ? document.body.clientHeight
            : document.body.clientWidth;
        this.minesweeperDiv.style.width = (this.width + this.count) + 'px';
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
        this.minesweeperDiv.style.borderLeft = '1px solid grey';
        this.minesweeperDiv.style.borderTop = '1px solid grey';
        this.minesweeperDiv.style.backgroundColor = '#f7f7f7';
        this.blocks.forEach((items, i) => {
            items.forEach((item, j) => {
                let div = document.createElement('div');
                div.style.borderRight = '1px solid grey';
                div.style.borderBottom = '1px solid grey';
                div.style.width = this.getBlockSize() + 'px';
                div.style.height = this.getBlockSize() + 'px';
                div.style.float = 'left';
                div.style.textAlign = 'center';
                div.style.verticalAlign = 'middle';
                div.style.fontFamily = 'emoji';
                div.style.lineHeight = this.getBlockSize() + 'px';
                div.setAttribute('id', `ms-block-${i}-${j}`);
                div.style.fontSize = '4vmin';
                div.oncontextmenu = (e) => {
                    e.preventDefault();
                    if (e.target.innerHTML === '') {
                        e.target.innerHTML = '&#9873';
                        e.target.style.color = 'orange';
                    } else if (e.target.innerHTML.charCodeAt(0) === 9873) {
                        e.target.innerHTML = '';
                    }
                };
                div.onmousedown = (e) => {
                    console.log(1);
                    if (e.target.innerHTML === '') {
                        if (this.blocks[i][j].bomb) {
                            this.reveal(i, j);
                        } else {
                            div.innerHTML = item.touching;
                            this.recursiveOpenBlocks(i, j, LEVELS.find(lvl => lvl.title === this.level).value);
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
        document.getElementById(`ms-block-${i}-${j}`).style.boxShadow = 'inset 0 0 10px #f80000';
    }

    recursiveOpenBlocks(i, j, count) {
        if (count === 0)
            return;
        let y = this.ffn(i, j, count);
        if (y !== null) {
            document.getElementById(`ms-block-${y[0]}-${y[1]}`).innerHTML = this.blocks[y[0]][y[1]].touching;
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
        let tmpArr = [];
        if (count === 0)
            return;
        if (
            this.blocks[i][j + 1] !== undefined && !this.blocks[i][j + 1].bomb
        ) {
            this.showTouchings(i, j + 1);
            tmpArr.push([i, j + 1]);

        }
        if (
            this.blocks[i][j - 1] !== undefined && !this.blocks[i][j - 1].bomb
        ) {
            this.showTouchings(i, j - 1);
            tmpArr.push([i, j - 1]);
        }
        if (
            this.blocks[i + 1] !== undefined && this.blocks[i + 1][j] !== undefined && !this.blocks[i + 1][j].bomb
        ) {
            this.showTouchings(i + 1, j);
            tmpArr.push([i + 1, j]);
        }
        if (
            this.blocks[i - 1] !== undefined && this.blocks[i - 1][j] !== undefined && !this.blocks[i - 1][j].bomb
        ) {
            this.showTouchings(i - 1, j);
            tmpArr.push([i - 1, j]);
        }
        if (
            this.blocks[i + 1] !== undefined && this.blocks[i + 1][j - 1] !== undefined && !this.blocks[i + 1][j - 1].bomb
        ) {
            this.showTouchings(i + 1, j - 1);
            tmpArr.push([i + 1, j - 1]);
        }
        if (
            this.blocks[i - 1] !== undefined && this.blocks[i - 1][j + 1] !== undefined && !this.blocks[i - 1][j + 1].bomb
        ) {
            this.showTouchings(i - 1, j + 1);
            tmpArr.push([i - 1, j + 1]);
        }
        if (
            this.blocks[i - 1] !== undefined && this.blocks[i - 1][j - 1] !== undefined && !this.blocks[i - 1][j - 1].bomb
        ) {
            this.showTouchings(i - 1, j - 1);
            tmpArr.push([i - 1, j + 1]);
        }
        if (
            this.blocks[i + 1] !== undefined && this.blocks[i + 1][j + 1] !== undefined && !this.blocks[i + 1][j + 1].bomb
        ) {
            this.showTouchings(i + 1, j + 1);
            tmpArr.push([i + 1, j + 1]);
        }
        let rand = tmpArr[Math.floor(Math.random() * tmpArr.length)];
        this.ffn(rand[0], rand[1], count - 1);
        return null;
    }

    showTouchings(i, j) {
        document.getElementById(`ms-block-${i}-${j}`).innerHTML = this.blocks[i][j].touching;

    }

    docHeight() {
        return document.body.scrollHeight;
    }
}