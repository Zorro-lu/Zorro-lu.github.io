(function() {
  'use strict';

  window.file = null;
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

    // Send the web configuration parameters out
    document.querySelector("#submit").onclick = () => {
        // Gain
        let gain_db = document.querySelector("#gain").value;
        setGain(gain_db, port);

        // Drc
        let drcAttackTime = document.querySelector("#DrcAttackTime").value;
        let drcDecayTime = document.querySelector("#DrcDecayTime").value;
        let drcKneeThreshold = document.querySelector("#DrcKneeThreshold").value;
        let drcNoiseGate = document.querySelector("#DrcNoiseGate").value;
        let drcSlope = document.querySelector("#DrcSlope").value;
        setDrc(port, drcAttackTime, drcDecayTime, drcKneeThreshold, drcNoiseGate, drcSlope);

        // Agc
        let agcAttackTime = document.querySelector("#AgcAttackTime").value;
        let agcDecayTime = document.querySelector("#AgcDecayTime").value;
        let agcTarget = document.querySelector("#AgcTarget").value;
        setAgc(port, agcAttackTime, agcDecayTime, agcTarget);

        // PEQ
        let dir = document.querySelector('input[name="direction"]:checked').value;
        let bandNumber = document.querySelector("#BandNumber").value;
        let bandCenterFreq = document.getElementsByName("band_center_freq");
        let bandQfactor = document.getElementsByName("band_qfactor");
        let bandGain = document.getElementsByName("band_gain");
        setPeq(port, dir, bandNumber, bandCenterFreq, bandQfactor, bandGain);

        // Sniffer Audio Data
        let audio = document.getElementsByName("audio");
        setSniffer(port, audio);
        }

    const saveAs = document.querySelector("#saveAs"),
        startRecordButton = document.querySelector("#startRecordButton"),
        stopRecordButton = document.querySelector("#stopRecordButton");

    // select the path of storage
    saveAs.addEventListener("click", (async()=>{
        const directoryHandle = await window.showDirectoryPicker();
        const fileHandle = await directoryHandle.getFileHandle("audio.pcm", { create: true });
        file = await fileHandle.createWritable();

        window.file = file;
        stopRecordButton.disabled = !1,
        log("Your microphone audio is being recorded locally.")
        }
    ))

    // record audio data to a file
    startRecordButton.addEventListener("click", (()=>{
            if (window.file) {
                snifferActive(port, true);
            }
        }
    ))

    // stop record
    stopRecordButton.addEventListener("click", (()=>{
        if (window.file)
        {
            window.file.close();
            window.file = null;
        }

        // stop sniffing data
        snifferActive(port, false);
        stopRecordButton.disabled = !0,
        log("Your microphone audio has been successfully recorded locally.")
        }
    ))

    // parse pcm file
    parsePcmFile.addEventListener("click", (async()=>{
        const pickerOpts = {
        types: [
            {
            description: "Pcm",
            accept: {
                "pcm/*": [".pcm"],
            },
            },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
        };

        const [pcmHandle] = await window.showOpenFilePicker(pickerOpts);
        const pcmFile = await pcmHandle.getFile();
        const reader = new FileReader();
        reader.onload = () => {
            console.log(reader.result);
        };
        reader.readAsArrayBuffer(pcmFile);
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
