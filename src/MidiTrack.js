import { Region } from "./Region";
//rgba(43,65,98,1)
class MidiTrack {
    constructor(state) {
        this.state = state;
        this.basicWidth = 900;
        this.basicHeight = 200;
        this.midiTrack = new PIXI.Application({width: this.basicWidth*2, height: this.basicHeight, background: '0xABC798'});
        this.midiTrack.stage.interactive = true;
        this.midiTrack.stage.hitArea = this.midiTrack.screen;
        this.pixijsContainer = document.querySelector("#midiTrack");
        this.pixijsContainer.innerHTML = "";
        this.pixijsContainer.appendChild(this.midiTrack.view);

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
        //this.midiTrack.view.width = this.basicWidth * (state.clip.state.length/96);
        this.selectedContainer.updateState(state);
    }

    render() {
        this.selectedContainer.renderNotes();
    }
}

export { MidiTrack };


