import VuMeter from "../lib/utils/vu-meter.js";

const plugin1Url = "../burns-audio-wam/src/plugins/pianoroll/dist/index.js";
const plugin2Url = "https://mainline.i3s.unice.fr/wam2/packages/obxd/index.js";

let audioCtx;

const btnStart = document.getElementById("btn-start");
const inputTempo = document.getElementById("tempo-display-input");
const vuMeterCanvas = document.getElementById("canvas2");
const btnStartDemo = document.getElementById("btn-start-demo");
const demoDiv = document.getElementById("demo-div");
const widgetLoadingDiv = document.getElementById("widget-loading");
const loadingWheelDiv = document.getElementById("loading-wheel")



btnStartDemo.onclick = async () => {
    btnStartDemo.style.display = "none";
    demoDiv.style.display = "";
    await startHost();
}

/**
 * Self-invoking asynchronous function to initialize the host.
 */
async function startHost () {
    audioCtx = new AudioContext();
    await audioCtx.suspend();

    /* Import from the Web Audio Modules 2.0 SDK to initialize Wam Host.
    It initializes a unique ID for the current AudioContext. */
    const {default: initializeWamHost} = await import("../lib/sdk/src/initializeWamHost.js");
    const [hostGroupId] = await initializeWamHost(audioCtx);

    const {default: WAM1} = await import(plugin1Url);
    const {default: WAM2} = await import(plugin2Url);

    /**
     * Create the Instance of the WAM plugins.
     * @type {Promise<IWebAudioModule<*>>|Promise<WebAudioModule<WamNode>>|*}
     */
    let gain = audioCtx.createGain();
    /**
     * @type {WamNode}
     */
    let pianoRoll_Instance = await WAM1.createInstance(hostGroupId, audioCtx);
    let keyboardDom = await pianoRoll_Instance.createGui();
    /**
     * @type {WamNode} 
     */
    let obxdInstance = await WAM2.createInstance(hostGroupId, audioCtx);
    let pluginDom2 = await obxdInstance.createGui();

    await keyboardDom;


    obxdInstance.audioNode.connect(gain).connect(audioCtx.destination);
    obxdInstance.audioNode.connect(pianoRoll_Instance.audioNode);
    pianoRoll_Instance.audioNode.connectEvents(obxdInstance.instanceId);

    /**
     * Mount the plugins to the host.
     * @type {Element}
     */
    let mount1 = document.querySelector("#mount1");
    mount1.innerHTML = "";
    await mount1.appendChild(keyboardDom);

    let mount2 = document.querySelector("#mount2");
    mount2.innerHTML = "";
    await mount2.appendChild(pluginDom2);

    btnStart.onclick = () => {


        if (audioCtx.state === "running") {
            audioCtx.suspend();
            btnStart.textContent = "Start";
        } else {
            audioCtx.resume();
            btnStart.textContent = "Stop";
            
            pianoRoll_Instance.audioNode.scheduleEvents({
                type: 'wam-transport', data: {
                    playing: true,
                    timeSigDenominator: 4,
                    timeSigNumerator: 4,
                    currentBar: 0,
                    currentBarStarted: audioCtx.currentTime,
                    tempo: inputTempo.value
                }
            })            
        }
    }

    inputTempo.onchange = async () => {
        console.log(await pianoRoll_Instance.sequencer.getState());

        pianoRoll_Instance.audioNode.scheduleEvents({
            type: 'wam-transport', data: {
                playing: true,
                timeSigDenominator: 4,
                timeSigNumerator: 4,
                currentBar: 0,
                currentBarStarted: audioCtx.currentTime,
                tempo: inputTempo.value
            }
        })
    }



    loadingWheelDiv.style.display = "none";
    widgetLoadingDiv.style.display = "";
}
