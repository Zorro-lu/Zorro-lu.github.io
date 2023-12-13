// function writebuf(buf) {
//     if (window.file)
//     {
//         console.log("buf.byteLength " + buf.byteLength);
//         window.file.write(buf);
//     }
// };

function getMsg(msg, settings) {
    let offset = 0;
    for (let prop in settings) {
        let array = settings[prop];
        let size = array.BYTES_PER_ELEMENT * array.length;
        for (let i = 0; i < size; i++) {
            array[i] = msg[offset + i];
        }
        offset += size;
    }
}

async function binToPcm(buf, path) {
    let fileName = ["file1", "file2", "file3", "file4", "file5"];
    let fileHandle = [];
    const pcmFile = [];
    let fileNameNum = 0;
    let audio_msg = {
        pn_media: new Uint8Array(1),    /**< Media type (link-layer identifier) */
        pn_rdev: new Uint8Array(1),     /**< Receiver device ID */
        pn_sdev: new Uint8Array(1),     /**< Sender device ID */
        pn_res: new Uint8Array(1),      /**< Resource ID or function */
        pn_length: new Uint8Array(2),   /**< Big-endian message byte length (minus 6) */
        pn_robj: new Uint8Array(1),     /**< Receiver object ID */
        pn_sobj: new Uint8Array(1),     /**< Sender object ID */

        trans_id: new Uint8Array(1),    /**< Transaction id */
        msg_id: new Uint8Array(1),      /**< Message id */

        dir: new Uint8Array(1),         /**< Input data or output data */
        index: new Uint8Array(1),       /**< Node index */
        mode: new Uint8Array(1),        /**< Audio mode: stereo or mono */
        sample_rate: new Uint8Array(2), /**< Specific sample rate, bit field */
        length: new Uint8Array(2),      /**< Pcm data length */
    };

    // count audio_msg size
    let audio_msg_size = 0;
    for (let prop in audio_msg) {
        let array = audio_msg[prop];
        audio_msg_size += array.BYTES_PER_ELEMENT * array.length;
    }

    let frameStart  = 0;
    let frameEnd    = audio_msg_size;
    while (frameEnd <= buf.byteLength) {
        // Read audio message from the buffer
        // console.log("frame " + frameStart, frameEnd);
        let msg = new Uint8Array(buf.slice(frameStart, frameEnd));
        getMsg(msg, audio_msg);

        if ((audio_msg.pn_rdev[0] == MSG_EP_AGENT.DSP) && (audio_msg.pn_sdev[0] == MSG_EP_AGENT.DSP)) {
            if (audio_msg.msg_id[0] == HAL_Audio_Node_Data_Notify) {
                let strSobj = audio_msg.pn_sobj[0].toString();
                let strDir = audio_msg.dir[0].toString();
                let strIndex = audio_msg.index[0].toString();
                let strMode = audio_msg.mode[0].toString();

                let sampleRate = new Uint16Array(1);
                BSTREAM_TO_UINT16(audio_msg.sample_rate, sampleRate);
                let strSampleRate = sampleRate[0].toString();

                let string = strSobj + "_"+ strDir + "_"+ strIndex + "_"+ strMode + "_"+ strSampleRate + ".pcm";

                let fileFlag = 0;
                let audioDataLen = new Uint16Array(1);
                BSTREAM_TO_UINT16(audio_msg.length, audioDataLen);
                let audioData = new Uint8Array(buf.slice(frameEnd, frameEnd + audioDataLen[0]));

                for (let i = 0; i < fileName.length; i++) {
                    if (string == fileName[i]) {
                        if (pcmFile[i]) {
                            await pcmFile[i].write(audioData);
                            break;
                        }
                    }

                    // After poll, string isn't in the fileName
                    if (i == (fileName.length - 1)) {
                        fileFlag = 1;
                    }
                }

                // Creat one new file
                if (fileFlag) {
                    fileName[fileNameNum] = string;
                    fileHandle[fileNameNum] = await path.getFileHandle(fileName[fileNameNum], { create: true });
                    pcmFile[fileNameNum] = await fileHandle[fileNameNum].createWritable();
                    if (pcmFile[fileNameNum]) {
                        await pcmFile[fileNameNum].write(audioData);
                    }
                    fileNameNum ++;
                }
            }
        } else {
            log("audio.bin file has bad frame, the location in " + frameStart + " bytes.");
            break;
        }

        let len = new Uint16Array(1);
        BSTREAM_TO_UINT16(audio_msg.pn_length, len);
        frameStart += len[0];
        frameEnd   += len[0];
    }

    for (let i = 0; i < fileNameNum; i++) {
        if (pcmFile[i]) {
            await pcmFile[i].close();
            console.log("pcmFile close " + pcmFile[i]);
        }
    }

    log("Parsing ends.")
    console.log("buf.byteLength " + buf.byteLength);
};

function log(e) {
    document.querySelector("#logs").textContent += `${e}\r\n`
};
