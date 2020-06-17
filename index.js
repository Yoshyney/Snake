class Game {
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.height = canvas.height;
        this.width = canvas.width;
        this.launchGame();
    }

    launchGame(){
        this.cells = [];
        this.player = {};
        this.event;
        this.tickCount = 0;
        this.defineCell();
        this.placePlayer();
        this.placeFruit();
        this.registerEvent();
        if(this.animation == undefined){
            this.animation = requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    defineCell(){
        let cells = 64; 
        for(let x = 0; x < cells; x++){
            this.cells[x] = [];
            for(let y = 0; y < cells; y++){
                this.cells[x][y] = new Cell(this.width / cells, this.height / cells, x * this.width / cells, y * this.height / cells, x, y);
            }
        }
    }

    cleanCell(){
        for(let x = 0; x < this.cells.length; x++){
            for(let y = 0; y < this.cells[x].length; y++){
                this.cells[x][y].by = null;
                this.cells[x][y].full = false;
            }
        }
        this.placePlayer();
        this.placeFruit();
    }

    placePlayer(){
        this.player = new Player(this.cells[0][0]);
    }

    placeFruit(){
        while(true){
            let cell = this.cells[this.chooseRandom()][this.chooseRandom()];
            if(!cell.full){
                this.fruit = new Fruit(cell);
                cell.full = true;
                cell.by = "fruit";
                break;
            }
        }
    }

    registerEvent(){
        this.event = document.addEventListener("keypress", this.movement.bind(this));
    }

    movement(e){
        switch (e.key){
            case "z":
                if(this.player.direction != "bot" || this.player.length_ == 1){
                    this.player.direction = "top";
                }
                break;
        
            case "s":
                if(this.player.direction != "top" || this.player.length_ == 1){
                    this.player.direction = "bot";
                }
                break;

            case "q":
                if(this.player.direction != "right" || this.player.length_ == 1){
                    this.player.direction = "left";
                }
                break;

            case "d":
                if(this.player.direction != "left" || this.player.length_ == 1){
                    this.player.direction = "right";
                }
                break;

            case "r":
                this.cleanCell();
                break;
        }
    }

    gameLoop(){
        if(this.tickCount > 1){
            this.movePlayer();
            this.drawElement();
            this.tickCount = 0;
        }else{
            this.tickCount++;
        }
        this.animation = requestAnimationFrame(this.gameLoop.bind(this));
    }


    drawElement(){
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.fillRect(this.player.head.x, this.player.head.y, this.player.head.width, this.player.head.height);
            this.player.body.forEach(body => {
                this.ctx.fillRect(body.x, body.y, body.width, body.height);
            });
            this.ctx.fillRect(this.fruit.cell.x, this.fruit.cell.y, this.fruit.cell.width, this.fruit.cell.height);
    }

    chooseRandom(){
        return Math.floor(Math.random() * this.cells.length);
    }

    movePlayer(){
        let direction = this.player.direction;
        let actualCell = this.cells[this.player.head.cellx][this.player.head.celly];
        let newCell;
        let result;
        try{
            if(this.player.length_ != 1){
                this.moveTail(actualCell);
            }
            switch (direction){
                case "right":
                    newCell = this.cells[this.player.head.cellx + 1][this.player.head.celly];
                    result = this.changeCellStatus(actualCell, newCell);
                    break;
                
                case "left":
                    newCell = this.cells[this.player.head.cellx - 1][this.player.head.celly];
                    result = this.changeCellStatus(actualCell, newCell);
                    break;
                
                case "top":
                    newCell = this.cells[this.player.head.cellx][this.player.head.celly - 1];
                    result = this.changeCellStatus(actualCell, newCell);
                    break;
                
                case "bot":
                    newCell = this.cells[this.player.head.cellx][this.player.head.celly + 1];
                    result = this.changeCellStatus(actualCell, newCell);
                    break;
            }
            if(result){
                this.player.head = newCell;
            }
        }catch(e){
            console.log(e)
            alert("You lose wall are hard for a snake :c");
            this.endGame();
        }
    }

    moveTail(actualCell){
        for(let x = 0; x < this.player.body.length; x++){
            let oldCell = this.player.body[x];
            this.changeCellStatus(this.player.body[x], actualCell, "body");
            this.player.body[x] = actualCell;
            actualCell = oldCell;
        }
    }

    changeCellStatus(oldCell, newCell, type = "head"){
        if(newCell.full && type == "head"){
            if(newCell.by == "fruit"){
                this.player.body.push(oldCell);
                this.player.length_++;
                this.placeFruit();
            }else if(newCell.by == "snake"){
                alert("Eat the fruit not yourself :c");
                this.endGame();
                return false;
            }
        }
        if( (type == "head" && this.player.length_ == 1) || type != "head"){
            oldCell.full = false;
            oldCell.by = null;
        }
        newCell.full = true;
        newCell.by = "snake";
        return true;
    }

    endGame(){
        this.cleanCell();
    }
}

class Cell {

    constructor(width, height, x, y, cellx, celly){
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.cellx = cellx;
        this.celly = celly;
        this.full = false;
        this.by = null;
    }

    get full() {
        return this._full;
    }
    
    set full(bool){
        this._full = bool;
    }

    get by(){
        return this._by;
    }

    set by(things){
        this._by = things;
    }
}

class Player {

    constructor(head){
        this.head = head;
        this.body = [];
        this._direction = "bot";
        this._length = 1;
    }

    get direction(){
        return this._direction;
    }

    set direction(direction){
        this._direction = direction;
    }

    get length_() {
        return this._length;
    }

    set length_(length){
        this._length = length;
    }
}

class Fruit {

    constructor(cell) {
        this.cell = cell;
    }
}


let canvas = document.getElementById("game");
new Game(canvas);