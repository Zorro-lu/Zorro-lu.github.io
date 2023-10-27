let OBJ =  {
    INVALID: 0,
    USER: 1,
    ACORE_TOOL: 2,
    ACORE_CODER_SRC: 3,
    ACORE_CODER_SINK: 4,
    ACORE_DSP_SRC: 5,
    ACORE_DSP_SINK: 6,
    ACORE_DSP_GAIN: 7,
    ACORE_DSP_AGC: 8,
    ACORE_DSP_DRC: 9,
    ACORE_DSP_PEQ_UL: 10,
    ACORE_DSP_PEQ_DL: 11,
    ACORE_DSP_AEC: 12,
    ACORE_DSP_NS: 13,
    ACORE_DSP: 14,
};

function UINT16_TO_BSTREAM(n, p) {

    p[0] = (n >> 8) & 0xFF;
    p[1] = n & 0xFF;
}

let MSG_EP_AGENT = {
    DSP: 0x01 << 2,
    MCU: 0x02 << 2,
    PC: 0x03 << 2,
};

let HAL_Audio_HW_Control_Request        = 0x1B;
let HAL_Audio_SB_Primary_Spkr_Settings  = 0x0002;

let HAL_Audio_SB_UL_AGC_Flag            = 0x0009;
let HAL_Audio_SB_UL_AGC_Attack_Time_ms  = 0x0010;
let HAL_Audio_SB_UL_AGC_Decay_Time_ms   = 0x0011;
let HAL_Audio_SB_UL_AGC_Target          = 0x0012;
let HAL_Audio_SB_UL_DRC_Attack_Time_ms  = 0x0013;
let HAL_Audio_SB_UL_DRC_Decay_Time_ms   = 0x0014;
let HAL_Audio_SB_UL_DRC_Gain            = 0x0015;
let HAL_Audio_SB_UL_DRC_Knee_Threshold  = 0x0016;
let HAL_Audio_SB_UL_DRC_Noise_Gate      = 0x0017;
let HAL_Audio_SB_UL_DRC_Slope           = 0x0018;

function setGain(string, port) {
    // console.log("sending to serial:" + string.length);
    if (string.length === 0)
        return;
    console.log("set gain: [" + string +"]\n");

    let temp  = parseInt(string, 10);
    let temp1 = Math.pow(10, temp * 0.05) * (1 << 7) + 0.5;
    let gain = Math.floor(temp1);

    let acore_msg = {
        pn_media: new Uint8Array([0]),
        pn_rdev: new Uint8Array([0]),
        pn_sdev: new Uint8Array([0]),
        pn_res: new Uint8Array([0]),
        pn_length: new Uint8Array([0, 0]),
        pn_robj: new Uint8Array([0]),
        pn_sobj: new Uint8Array([0]),

        trans_id: new Uint8Array([0]),
        msg_id: new Uint8Array([0]),

        num_of_subblocks: new Uint8Array([0, 0]),

        block_id: new Uint8Array([0, 0]),
        block_len: new Uint8Array([0, 0]),
        ep_mode: new Uint8Array([0]),
        ep_id: new Uint8Array([0]),
        logic_vol: new Uint8Array([0, 0]),
        ctl_obj: new Uint8Array([0, 0]),
        gain_left: new Uint8Array([0, 0]),
        gain_right: new Uint8Array([0, 0]),
        filter1: new Uint8Array([0, 0]),
        sidetone: new Uint8Array([0, 0]),
        filter2: new Uint8Array([0, 0]),
    };

    let prim_spk_settings = {
        block_id: new Uint8Array([0, 0]),
        block_len: new Uint8Array([0, 0]),
        ep_mode: new Uint8Array([0]),
        ep_id: new Uint8Array([0]),
        logic_vol: new Uint8Array([0, 0]),
        ctl_obj: new Uint8Array([0, 0]),
        gain_left: new Uint8Array([0, 0]),
        gain_right: new Uint8Array([0, 0]),
        filter1: new Uint8Array([0, 0]),
        sidetone: new Uint8Array([0, 0]),
        filter2: new Uint8Array([0, 0]),
    };

    // count prim_spk_settings size
    let prim_spk_settings_size = 0;
    for (let prop in prim_spk_settings) {
        let array = prim_spk_settings[prop];
        prim_spk_settings_size += array.BYTES_PER_ELEMENT * array.length;
    }


    // count acore_msg size
    let totalBytes = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        totalBytes += array.BYTES_PER_ELEMENT * array.length;
    }

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(totalBytes, acore_msg.pn_length);
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_GAIN;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(1, acore_msg.num_of_subblocks);
    UINT16_TO_BSTREAM(HAL_Audio_SB_Primary_Spkr_Settings, acore_msg.block_id);
    UINT16_TO_BSTREAM(prim_spk_settings_size, acore_msg.block_len);
    UINT16_TO_BSTREAM(gain, acore_msg.gain_left);
    UINT16_TO_BSTREAM(gain, acore_msg.gain_right);

    // copy acore_msg data to vol
    let vol = new Uint8Array(totalBytes);
    let offset = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        vol.set(array, offset);
        offset += array.BYTES_PER_ELEMENT * array.length;
    }

    if (port) {
        port.send(vol);
    }
};

// The DRC parameters are written to message and sent via the port
function setDrc(port, attack_time_str, decay_time_str,
         knee_threshold_str, noise_gate_str, slope_str) {
    if (attack_time_str.length === 0)
        return;
    console.log("set Drc Attack Time: [" + attack_time_str +"]\n");
    console.log("set Drc Decay Time: [" + decay_time_str +"]\n");
    console.log("set Drc Knee Threshold: [" + knee_threshold_str +"]\n");
    console.log("set Drc Noise Gate: [" + noise_gate_str +"]\n");
    console.log("set Drc Slope: [" + slope_str +"]\n");

    let attack_time     = parseInt(attack_time_str, 10);
    let decay_time      = parseInt(decay_time_str, 10);
    let knee_threshold  = parseInt(knee_threshold_str, 10);
    let noise_gate      = parseInt(noise_gate_str, 10);

    let slope_temp      = parseFloat(slope_str);
    slope_temp = slope_temp * (1 << 10);
    let slope  = Math.floor(slope_temp);

    let acore_msg = {
        pn_media: new Uint8Array([0]),
        pn_rdev: new Uint8Array([0]),
        pn_sdev: new Uint8Array([0]),
        pn_res: new Uint8Array([0]),
        pn_length: new Uint8Array([0, 0]),
        pn_robj: new Uint8Array([0]),
        pn_sobj: new Uint8Array([0]),

        trans_id: new Uint8Array([0]),
        msg_id: new Uint8Array([0]),

        num_of_subblocks: new Uint8Array([0, 0]),

        attack_time_block_id: new Uint8Array([0, 0]),
        attack_time_block_len: new Uint8Array([0, 0]),
        attack_time: new Int8Array([0, 0]),

        decay_time_block_id: new Uint8Array([0, 0]),
        decay_time_block_len: new Uint8Array([0, 0]),
        decay_time: new Int8Array([0, 0]),

        knee_threshold_block_id: new Uint8Array([0, 0]),
        knee_threshold_block_len: new Uint8Array([0, 0]),
        knee_threshold: new Int8Array([0, 0]),

        noise_gate_block_id: new Uint8Array([0, 0]),
        noise_gate_block_len: new Uint8Array([0, 0]),
        noise_gate: new Int8Array([0, 0]),

        slope_block_id: new Uint8Array([0, 0]),
        slope_block_len: new Uint8Array([0, 0]),
        slope: new Int8Array([0, 0]),
    };

    let sb_drc_attack_time = {
        block_id: new Uint8Array([0, 0]),
        block_len: new Uint8Array([0, 0]),
        attack_time: new Uint8Array([0, 0]),
    };

    // count sb_drc_attack_time size
    let sb_drc_attack_time_size = 0;
    for (let prop in sb_drc_attack_time) {
        let array = sb_drc_attack_time[prop];
        sb_drc_attack_time_size += array.BYTES_PER_ELEMENT * array.length;
    }
    let sb_drc_decay_time_size      = sb_drc_attack_time_size;
    let sb_drc_knee_threshold_size  = sb_drc_attack_time_size;
    let sb_drc_noise_gate_size      = sb_drc_attack_time_size;
    let sb_drc_slope_size           = sb_drc_attack_time_size;

    // count acore_msg size
    let totalBytes = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        totalBytes += array.BYTES_PER_ELEMENT * array.length;
    }

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(totalBytes, acore_msg.pn_length);
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_DRC;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(5, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Attack_Time_ms, acore_msg.attack_time_block_id);
    UINT16_TO_BSTREAM(sb_drc_attack_time_size, acore_msg.attack_time_block_len);
    UINT16_TO_BSTREAM(attack_time, acore_msg.attack_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Decay_Time_ms, acore_msg.decay_time_block_id);
    UINT16_TO_BSTREAM(sb_drc_decay_time_size, acore_msg.decay_time_block_len);
    UINT16_TO_BSTREAM(decay_time, acore_msg.decay_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Knee_Threshold, acore_msg.knee_threshold_block_id);
    UINT16_TO_BSTREAM(sb_drc_knee_threshold_size, acore_msg.knee_threshold_block_len);
    UINT16_TO_BSTREAM(knee_threshold, acore_msg.knee_threshold);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Noise_Gate, acore_msg.noise_gate_block_id);
    UINT16_TO_BSTREAM(sb_drc_noise_gate_size, acore_msg.noise_gate_block_len);
    UINT16_TO_BSTREAM(noise_gate, acore_msg.noise_gate);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Slope, acore_msg.slope_block_id);
    UINT16_TO_BSTREAM(sb_drc_slope_size, acore_msg.slope_block_len);
    UINT16_TO_BSTREAM(slope, acore_msg.slope);

    // copy acore_msg data to drc_msg
    let drc_msg = new Uint8Array(totalBytes);
    let offset = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        drc_msg.set(array, offset);
        offset += array.BYTES_PER_ELEMENT * array.length;
    }

    console.log(drc_msg);
    if (port) {
        port.send(drc_msg);
    }
}

    // The DRC parameters are written to message and sent via the port
function setAgc(port, attack_time_str, decay_time_str, target_str) {
    if (attack_time_str.length === 0)
        return;
    console.log("set Agc Attack Time: [" + attack_time_str +"]\n");
    console.log("set Agc Decay Time: [" + decay_time_str +"]\n");
    console.log("set Agc Target: [" + target_str +"]\n");

    let attack_time = parseInt(attack_time_str, 10);
    let decay_time  = parseInt(decay_time_str, 10);
    let target      = parseInt(target_str, 10);

    let acore_msg = {
        pn_media: new Uint8Array([0]),
        pn_rdev: new Uint8Array([0]),
        pn_sdev: new Uint8Array([0]),
        pn_res: new Uint8Array([0]),
        pn_length: new Uint8Array([0, 0]),
        pn_robj: new Uint8Array([0]),
        pn_sobj: new Uint8Array([0]),

        trans_id: new Uint8Array([0]),
        msg_id: new Uint8Array([0]),

        num_of_subblocks: new Uint8Array([0, 0]),

        attack_time_block_id: new Uint8Array([0, 0]),
        attack_time_block_len: new Uint8Array([0, 0]),
        attack_time: new Int8Array([0, 0]),

        decay_time_block_id: new Uint8Array([0, 0]),
        decay_time_block_len: new Uint8Array([0, 0]),
        decay_time: new Int8Array([0, 0]),

        target_block_id: new Uint8Array([0, 0]),
        target_block_len: new Uint8Array([0, 0]),
        target: new Int8Array([0, 0]),
    };

    let sb_agc_attack_time = {
        block_id: new Uint8Array([0, 0]),
        block_len: new Uint8Array([0, 0]),
        attack_time: new Uint8Array([0, 0]),
    };

    // count sb_agc_attack_time size
    let sb_agc_attack_time_size = 0;
    for (let prop in sb_agc_attack_time) {
        let array = sb_agc_attack_time[prop];
        sb_agc_attack_time_size += array.BYTES_PER_ELEMENT * array.length;
    }
    let sb_agc_decay_time_size = sb_agc_attack_time_size;
    let sb_agc_target_size = sb_agc_attack_time_size;

    // count acore_msg size
    let totalBytes = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        totalBytes += array.BYTES_PER_ELEMENT * array.length;
    }

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(totalBytes, acore_msg.pn_length);
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_AGC;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(3, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_AGC_Attack_Time_ms, acore_msg.attack_time_block_id);
    UINT16_TO_BSTREAM(sb_agc_attack_time_size, acore_msg.attack_time_block_len);
    UINT16_TO_BSTREAM(attack_time, acore_msg.attack_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_AGC_Decay_Time_ms, acore_msg.decay_time_block_id);
    UINT16_TO_BSTREAM(sb_agc_decay_time_size, acore_msg.decay_time_block_len);
    UINT16_TO_BSTREAM(decay_time, acore_msg.decay_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_AGC_Target, acore_msg.target_block_id);
    UINT16_TO_BSTREAM(sb_agc_target_size, acore_msg.target_block_len);
    UINT16_TO_BSTREAM(target, acore_msg.target);

    // copy acore_msg data to agc_msg
    let agc_msg = new Uint8Array(totalBytes);
    let offset = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        agc_msg.set(array, offset);
        offset += array.BYTES_PER_ELEMENT * array.length;
    }

    console.log(agc_msg);
    if (port) {
        port.send(agc_msg);
    }
}

function writebuf(buf) {
    if (window.file)
    {
        console.log("buf.byteLength " + buf.byteLength);
        window.file.write(buf);
    }
};

function log(e) {
    document.querySelector("#logs").textContent += `${e}\r\n`
};
