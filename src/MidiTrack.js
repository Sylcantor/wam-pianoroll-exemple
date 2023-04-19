import { Region } from "./Region";
//rgba(43,65,98,1)
class MidiTrack {
    constructor(state) {
        console.log("MidiTrack constructor");
        this.state = state;
        this.midiTrack = new PIXI.Application({width: 900, height: 200, background: '0xABC798'});
        this.midiTrack.stage.interactive = true;
        this.midiTrack.stage.hitArea = this.midiTrack.screen;
        this.pixijsContainer = document.querySelector("#midiTrack");
        this.pixijsContainer.innerHTML = "";
        this.pixijsContainer.appendChild(this.midiTrack.view);

        //draw the countour of the midi track
        /*
        const rect = new PIXI.Graphics();
        rect.lineStyle(1, 0x131B23, 1);
        rect.drawRect(1, 0, this.midiTrack.renderer.width - 1, this.midiTrack.renderer.height - 1);
    
        this.midiTrack.stage.addChild(rect);
        */

        this.selectedContainer = new Region(this.midiTrack,state);
        this.midiTrack.stage.addChild(this.selectedContainer);
    }

    getHtmlElement() {
        return this.midiTrack.view;
    }

    getMidiTrack() {
        return this.midiTrack;
    }

    updateState(state) {
        this.state = state;
        this.selectedContainer.updateState(state);
    }

    resizeContainer(event) {
      console.log("resizeContainer");
        if (this.moove) {
            console.log("resizeContainer");
            console.log(event);
        }
    }

    render() {
        console.log("MidiTrack render");
        this.selectedContainer.renderNotes();
    }
}

export { MidiTrack };


