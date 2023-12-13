(function() {
  'use strict';

    // Static or global value
    window.file = null;
    let intervalId;

    document.addEventListener('DOMContentLoaded', event => {
        let connectButton = document.querySelector("#connect");
        let statusDisplay = document.querySelector('#status');
        let port;

    function connect() {
      port.connect().then(() => {
        statusDisplay.textContent = '';
        connectButton.textContent = 'Disconnect';

        port.onReceive = data => {
            writebuf(data);
        };
        port.onReceiveError = error => {
          console.error(error);
        };
      }, error => {
        statusDisplay.textContent = error;
      });
    }

    connectButton.addEventListener('click', function() {
      if (port) {
        port.disconnect();
        connectButton.textContent = 'Connect';
        statusDisplay.textContent = '';
        port = null;
      } else {
        serial.requestPort().then(selectedPort => {
          port = selectedPort;
          connect();
        }).catch(error => {
          statusDisplay.textContent = error;
        });
      }
    });

    serial.getPorts().then(ports => {
      if (ports.length === 0) {
        statusDisplay.textContent = 'No device found.';
      } else {
        statusDisplay.textContent = 'Connecting...';
        port = ports[0];
        connect();
      }
    });

    // Send the Gain message to mcu
    document.querySelector("#gain_submit").onclick = () => {
        // Gain
        let gain_db = document.querySelector("#gain").value;
        setGain(gain_db, port);
    }

    // // Send the Drc message to mcu
    document.querySelector("#drc_submit").onclick = () => {
        // Drc
        let drcAttackTime = document.querySelector("#DrcAttackTime").value;
        let drcDecayTime = document.querySelector("#DrcDecayTime").value;
        let drcKneeThreshold = document.querySelector("#DrcKneeThreshold").value;
        let drcNoiseGate = document.querySelector("#DrcNoiseGate").value;
        let drcSlope = document.querySelector("#DrcSlope").value;
        setDrc(port, drcAttackTime, drcDecayTime, drcKneeThreshold, drcNoiseGate, drcSlope);
    }

    // Send the Agc message to mcu
    document.querySelector("#agc_submit").onclick = () => {
        // Agc
        let agcAttackTime = document.querySelector("#AgcAttackTime").value;
        let agcDecayTime = document.querySelector("#AgcDecayTime").value;
        let agcTarget = document.querySelector("#AgcTarget").value;
        setAgc(port, agcAttackTime, agcDecayTime, agcTarget);
    }

    // Send the PEQ message to mcu
    document.querySelector("#peq_submit").onclick = () => {
        // PEQ
        let dir = document.querySelector('input[name="direction"]:checked').value;
        let bandNumber = document.querySelector("#BandNumber").value;
        let bandCenterFreq = document.getElementsByName("band_center_freq");
        let bandQfactor = document.getElementsByName("band_qfactor");
        let bandGain = document.getElementsByName("band_gain");
        setPeq(port, dir, bandNumber, bandCenterFreq, bandQfactor, bandGain);
    }

    // Send the Sniffer message to mcu
    document.querySelector("#sniffer_submit").onclick = () => {
        // Sniffer Audio Data
        let audio = document.getElementsByName("audio");
        setSniffer(port, audio);
    }

    const selectPath = document.querySelector("#selectPath"),
        startSniffButton = document.querySelector("#startSniffButton"),
        stopSniffButton = document.querySelector("#stopSniffButton"),
        parseBinFile = document.querySelector("#parse_bin_file"),
        startPlay = document.querySelector("#start_play"),
        stopPlay = document.querySelector("#stop_play");

        startSniffButton.disabled = !0;
        stopSniffButton.disabled = !0;

    // select the path of storage
    selectPath.addEventListener("click", (async()=>{
        const directoryHandle = await window.showDirectoryPicker();
        const fileHandle = await directoryHandle.getFileHandle("audio.bin", { create: true });
        file = await fileHandle.createWritable();

        window.file = file;
        startSniffButton.disabled = !1;
        log("The path of audio data has been selected.")
        }
    ))

    // Sniff audio data to a file
    startSniffButton.addEventListener("click", (()=>{
            if (window.file) {
                snifferActive(port, true);
                stopSniffButton.disabled = !1;
            }
        }
    ))

    // stop sniffing
    stopSniffButton.addEventListener("click", (()=>{
        if (window.file)
        {
            window.file.close();
            window.file = null;
        }

        // stop sniffing data
        snifferActive(port, false);
        stopSniffButton.disabled = !0,
        log("Your microphone audio has been successfully sniffed locally.")
        }
    ))

    // Parse bin file
    parseBinFile.addEventListener("click", (async()=> {
        const binFile = document.getElementById('bin_file');
        const pathHandle = await window.showDirectoryPicker();

        const file = binFile.files[0];
        const reader = new FileReader();

        if (!file) {
            console.log("Please add bin file");
            return;
        }
        reader.onload = () => {
            console.log(reader.result);
            binToPcm(reader.result, pathHandle);
        };
        reader.readAsArrayBuffer(file);
        }
    ))

    startPlay.addEventListener("click", (()=> {
            let intervalTime    = 16; // ms
            let frameTypeSize   = 2;
            let audioDataSize   = 512 - frameTypeSize;
            let frameSize       = audioDataSize + frameTypeSize; // The max size of frame is 512.
            let frameType = new Uint8Array(frameTypeSize);
            UINT16_TO_BSTREAM(FRAME_TYPE.AUDIO_DATA, frameType);
            let frame     = new Uint8Array(frameSize);

            const binFile = document.getElementById('pcm_file');
            console.log(binFile);
            const file = binFile.files[0];
            if (!file) {
                console.log("Please add pcm file");
                return;
            }

            let audioDataStar  = 0;
            let audioDataEnd   = audioDataSize;
            const reader = new FileReader();
            reader.onload = () => {
                console.log(reader.result);
                intervalId = setInterval(function() {
                    if (port) {
                        let data        = reader.result.slice(audioDataStar, audioDataEnd);

                        // Add frame head for audio data
                        let tempData    = new Uint8Array(data);
                        frame.set(frameType, 0);
                        frame.set(tempData, frameType.length);
                        console.log(frame);
                        port.send(frame);
                        if (data.byteLength < audioDataSize) {
                            clearInterval(intervalId);
                            console.log("Play end");
                            log("Audio playback ends.")
                        }
                    }

                    audioDataStar += audioDataSize;
                    audioDataEnd  += audioDataSize;
                }, intervalTime);
            };
            reader.readAsArrayBuffer(file);
        }
    ))

    stopPlay.addEventListener("click", (()=> {
        clearInterval(intervalId);
        }
    ))

    window.onunhandledrejection = e=>{
        log(`> ${e.reason}`)
    }

    window.onerror = e=>{
        log(`> ${e}`)
    }

  });
})();
