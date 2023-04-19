
class Region extends PIXI.Container {
    constructor(pixiApp,state){
        super();
        this.pixiApp = pixiApp;
        this.regionWidthStart = 0;
        this.regionWidthEnd = 400;
        this.regionHeight = 200;
        this.interactive = true;
        this.background = new PIXI.Graphics();
        this.hitAreaRight = new PIXI.Graphics();
        this.hitAreaLeft = new PIXI.Graphics();

        this.move = false;
        this.resizeLeft = false;
        this.resizeRight = false;

        this.state = state;
        this.rectMap = {};
        this.rectCounter = 0;

        this.moveStartX = 0;
        this.moveStartY = 0;
        
        this.addChild(this.background);
        this.drawBackground();
        this.drawHitArea();
        this.initControls();



    }

    updateState(state) {
        this.state = state;
    }


    drawBackground(color = 0x000000) {
        this.background.clear();
        this.background.beginFill(0xF1DEDC);
        this.background.lineStyle({width: 1, color: color});
        this.background.drawRect(this.regionWidthStart, 0, this.regionWidthEnd - this.regionWidthStart, this.regionHeight);
    }

    drawHitArea() {
        //create hit area at the bottom right corner of the region
        // i want a pretty angle at the bottom right corner
        this.hitAreaRight.clear();
        this.hitAreaRight.beginFill(0x000000, 1);
        this.hitAreaRight.drawRect(this.regionWidthEnd - 30, this.regionHeight - 30, 29, 29);
        this.hitAreaRight.endFill();
        this.addChild(this.hitAreaRight);

        //create hit area at the bottom left corner of the region
        // i want a pretty angle at the bottom right corner
        this.hitAreaLeft.clear();
        this.hitAreaLeft.beginFill(0x000000, 1);
        this.hitAreaLeft.drawRect(this.regionWidthStart, this.regionHeight - 30, 29, 29);
        this.hitAreaLeft.endFill();
        this.addChild(this.hitAreaLeft);
    }

    initControls() {
        this.hitAreaRight.interactive = true;
        this.hitAreaLeft.interactive = true;

        this.on("pointerdown", this.onClickStart, this);

        this.pixiApp.stage.on("pointerup", this.onEnd, this);
        this.pixiApp.stage.on("pointerupoutside", this.onEnd, this);
    }

    onClickStart(event) {
        //check who is clicked
        if(event.target == this.hitAreaLeft){
            this.resizeLeft = true;
            this.pixiApp.stage.on("pointermove", this.onResizeMove, this);
        }
        if(event.target == this.hitAreaRight){
            this.resizeRight = true;
            this.pixiApp.stage.on("pointermove", this.onResizeMove, this);
        }
        else if(event.target == this){
            this.move = true;
            this.moveStartX = event.data.global.x;
            this.moveStartY = event.data.global.y;
            this.pixiApp.stage.on("pointermove", this.onMove, this);
        }
    }

    onResizeMove(event) {
        if(this.resizeRight){

            

            this.regionWidthEnd = event.data.global.x;
            //this.hitAreaRight.position.x = this.regionWidthEnd - 30;
            this.drawBackground();
            this.drawHitArea();
        } else if (this.resizeLeft){
            this.regionWidthStart = event.data.global.x;
            //this.hitAreaLeft.position.x = this.regionWidthStart;
            this.drawBackground();
            this.drawHitArea();
        }
    }

    onMove(event) {
        if(this.move){
            console.log("move");
            //check if the region is out of the screen
            if(this.regionWidthStart + event.data.global.x - this.moveStartX < 0){
                this.regionWidthStart = 0;
            } else if(this.regionWidthEnd + event.data.global.x - this.moveStartX > this.pixiApp.renderer.width){
                this.regionWidthEnd = this.pixiApp.renderer.width;
            } else {
                this.regionWidthStart += event.data.global.x - this.moveStartX;
                this.regionWidthEnd += event.data.global.x - this.moveStartX;
            }
            this.moveStartX = event.data.global.x;
            this.moveStartY = event.data.global.y;
            this.drawBackground();
            this.drawHitArea();
        }
    }

    onEnd() {
        if(this.move){
            this.move = false;
            this.pixiApp.stage.off("pointermove", this.onResizeMove, this);
        }
        if(this.resizeRight || this.resizeLeft){
            this.resizeRight = false;
            this.pixiApp.stage.off("pointermove", this.onResizeMove, this);
        }
    }

    renderNotes(){
        


        const rectWidth = this.pixiApp.renderer.width / 16;
        const rectHeight = this.pixiApp.renderer.height / 128;

        const displayedRectIds = new Set();

        // Supprimer les notes qui ne sont plus nécessaires de la carte rectMap
        Object.keys(this.rectMap).forEach((rectId) => {
            const noteIndex = this.state.clip.state.notes.findIndex((note) => (`${note.number},${(note.tick/6)}` === rectId));
            if (noteIndex === -1) {
                this.removeChild(this.rectMap[rectId]);
                delete this.rectMap[rectId];
            }
        });

        Object.values(this.rectMap).forEach((rect) => {
            const note = rect.note;
            const noteStartX = Math.floor((note.tick/6) * rectWidth);
            const noteEndX = noteStartX + rectWidth * (note.duration/6);
            const displayedStartX = Math.max(noteStartX, this.regionWidthStart);
            const displayedEndX = Math.min(noteEndX, this.regionWidthEnd);
            if (displayedStartX < displayedEndX) {
                displayedRectIds.add(`${note.number},${(note.tick/6)}`);
                rect.clear();
                rect.beginFill(0x2274A5);
                rect.drawRect(
                    displayedStartX,
                    Math.floor((127 - note.number) * rectHeight),
                    displayedEndX - displayedStartX,
                    rectHeight
                );
                rect.endFill();
                rect.visible = true;
            } else {
                this.removeChild(rect);
                delete this.rectMap[`${note.number},${(note.tick/6)}`];
            }
        });
        this.state.clip.state.notes.forEach((note) => {
            const rectId = `${note.number},${(note.tick/6)}`;
            if (!displayedRectIds.has(rectId) && (Math.floor((note.tick/6) * rectWidth)) < this.regionWidthEnd && ((Math.floor((note.tick/6) * rectWidth)    + rectWidth * (note.duration/6)) > this.regionWidthStart)) {
                const rect = new PIXI.Graphics();
                rect.beginFill(0x2274A5);
                rect.drawRect(
                    Math.max(this.regionWidthStart, Math.floor((note.tick/6) * rectWidth)),
                    Math.floor((127 - note.number) * rectHeight),
                    Math.min(this.regionWidthEnd, Math.floor((note.tick/6) * rectWidth) + rectWidth * (note.duration/6)) - Math.max(this.regionWidthStart, Math.floor((note.tick/6) * rectWidth)),
                    rectHeight
                );
                rect.endFill();
                rect.note = note;
                this.addChild(rect);
                this.rectMap[rectId] = rect;
            }
        });
    }
}

export {Region}