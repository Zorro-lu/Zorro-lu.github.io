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
let DIRECTION =  {
    IN:     0,
    OUT:    1,
};

// The port of algorithm element pad
let SNIFFER_INDEX = {
    PAD_0:  0,  // default port
    PAD_1:  1,
    PAD_2:  2,
};

let SNIFFER_ENBALE_MASK     = 0xFE;
let SNIFFER_DIRECTION_MASK  = 0xFD;

// Big endian to little endian
function UINT16_TO_BSTREAM(n, p) {

    p[0] = (n >> 8) & 0xFF;
    p[1] = n & 0xFF;
}

// Big endian to little endian
function UINT32_TO_BSTREAM(n, p) {

    p[0] = (n >> 24) & 0xFF;
    p[1] = (n >> 16) & 0xFF;
    p[2] = (n >> 8) & 0xFF;
    p[3] = n & 0xFF;
}

let MSG_EP_AGENT = {
    DSP: 0x01 << 2,
    MCU: 0x02 << 2,
    PC: 0x03 << 2,
};

let HAL_Audio_HW_Control_Request        = 0x1B;
let HAL_Audio_SB_Primary_Spkr_Settings  = 0x0002;

let HAL_Audio_SB_Sniffer_Enable         = 0x0034;
let HAL_Audio_SB_Sniffer_Activate       = 0x0035;
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
let HAL_Audio_SB_UL_PEQ_Center_Freq     = 0x0019;
let HAL_Audio_SB_UL_PEQ_Qfactor         = 0x001a;
let HAL_Audio_SB_UL_PEQ_Gain            = 0x001b;

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

// The PEQ parameters are written to message and sent via the port
function setPeq(port, dir, band_num_str, band_center_freq_str, band_qfactor_str, band_gain_str) {
    if (band_num_str.length === 0)
        return;

    let band_num    = parseInt(band_num_str, 10);

    let acore_msg = {
        pn_media: new Uint8Array(1),
        pn_rdev: new Uint8Array(1),
        pn_sdev: new Uint8Array(1),
        pn_res: new Uint8Array(1),
        pn_length: new Uint8Array(2),
        pn_robj: new Uint8Array(1),
        pn_sobj: new Uint8Array(1),

        trans_id: new Uint8Array(1),
        msg_id: new Uint8Array(1),

        num_of_subblocks: new Uint8Array(2),

        band_center_freq_id: new Uint8Array(2),
        band_center_freq_len: new Uint8Array(2),
        band_center_freq_num: new Uint8Array(2),
        // band_num * sizeof(float)
        band_center_freq: new Int8Array(36),

        band_qfactor_id: new Uint8Array(2),
        band_qfactor_len: new Uint8Array(2),
        band_qfactor_num: new Uint8Array(2),
        // band_num * sizeof(float)
        band_qfactor: new Int8Array(36),

        band_gain_id: new Uint8Array(2),
        band_gain_len: new Uint8Array(2),
        band_gain_num: new Uint8Array(2),
        // band_num * sizeof(float)
        band_gain: new Int8Array(36),
    };

    let sb_band_center_freq = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        block_num: new Uint8Array(2),
        band_center_freq: new Uint8Array(36),
    };

    // count sb_band_center_freq size
    let sb_band_center_freq_size = 0;
    for (let prop in sb_band_center_freq) {
        let array = sb_band_center_freq[prop];
        sb_band_center_freq_size += array.BYTES_PER_ELEMENT * array.length;
    }
    let sb_band_qfactor_size = sb_band_center_freq_size;
    let sb_band_gain_size = sb_band_center_freq_size;

    // count acore_msg size
    let totalBytes = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        totalBytes += array.BYTES_PER_ELEMENT * array.length;
    }

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(totalBytes, acore_msg.pn_length);

    if (dir === "in") {
        acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_PEQ_UL;
    } else if (dir === "out") {
        acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_PEQ_DL;
    }

    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(3, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_PEQ_Center_Freq, acore_msg.band_center_freq_id);
    UINT16_TO_BSTREAM(sb_band_center_freq_size, acore_msg.band_center_freq_len);
    UINT16_TO_BSTREAM(band_num, acore_msg.band_center_freq_num);
    for (let i = 0; i < band_center_freq_str.length; i++) {
        console.log(band_center_freq_str[i].value);
        let band_center_freq  = parseInt(band_center_freq_str[i].value, 10);
        // 4 = sizeof(int)
        let temp_buf = new Int8Array(4);
        UINT32_TO_BSTREAM(band_center_freq, temp_buf);
        acore_msg.band_center_freq.set(temp_buf, i * temp_buf.length);
    }

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_PEQ_Qfactor, acore_msg.band_qfactor_id);
    UINT16_TO_BSTREAM(sb_band_qfactor_size, acore_msg.band_qfactor_len);
    UINT16_TO_BSTREAM(band_num, acore_msg.band_qfactor_num);
    for (let i = 0; i < band_qfactor_str.length; i++) {
        let band_qfactor  = parseFloat(band_qfactor_str[i].value);
        let band_qfactor_buf = Float32Array.from([band_qfactor]).buffer;
        let temp_buf = new Int8Array(band_qfactor_buf);
        acore_msg.band_qfactor.set(temp_buf, i * temp_buf.length);
    }

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_PEQ_Gain, acore_msg.band_gain_id);
    UINT16_TO_BSTREAM(sb_band_gain_size, acore_msg.band_gain_len);
    UINT16_TO_BSTREAM(band_num, acore_msg.band_gain_num);
    for (let i = 0; i < band_gain_str.length; i++) {
        console.log(band_gain_str[i].value);
        let band_gain  = parseInt(band_gain_str[i].value, 10);
        // 4 = sizeof(int)
        let temp_buf = new Int8Array(4);
        UINT32_TO_BSTREAM(band_gain, temp_buf);
        acore_msg.band_gain.set(temp_buf, i * temp_buf.length);
    }

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

function snifferEnable(port, obj, enable, value) {
    // It only has one subblock in the audio core message
    let numOfSub         = 1;

    if (obj.length === 0) {
        return;
    }

    let acore_msg = {
        pn_media: new Uint8Array(1),
        pn_rdev: new Uint8Array(1),
        pn_sdev: new Uint8Array(1),
        pn_res: new Uint8Array(1),
        pn_length: new Uint8Array(2),
        pn_robj: new Uint8Array(1),
        pn_sobj: new Uint8Array(1),

        trans_id: new Uint8Array(1),
        msg_id: new Uint8Array(1),

        num_of_subblocks: new Uint8Array(2),

        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        state: new Uint8Array(1),
        index: new Uint8Array(1),
    };

    let sniffer_enable = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        state: new Uint8Array(1),
        index: new Uint8Array(1),
    };

    // count prim_spk_settings size
    let sniffer_enable_size = 0;
    for (let prop in sniffer_enable) {
        let array = sniffer_enable[prop];
        sniffer_enable_size += array.BYTES_PER_ELEMENT * array.length;
    }

    // count acore_msg size
    let totalBytes = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        totalBytes += array.BYTES_PER_ELEMENT * array.length;
    }

    switch (obj) {
        case "ACORE_DSP_GAIN_IN":
        case "ACORE_DSP_GAIN_OUT":
            acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_GAIN;
            break;

        case "ACORE_DSP_AGC_IN":
        case "ACORE_DSP_AGC_OUT":
            acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_AGC;
            break;

        case "ACORE_DSP_DRC_IN":
        case "ACORE_DSP_DRC_OUT":
            acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_DRC;
            break;

        case "ACORE_DSP_PEQ_UL_IN":
        case "ACORE_DSP_PEQ_UL_OUT":
            acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_PEQ_UL;
            break;

        case "ACORE_DSP_PEQ_DL_IN":
        case "ACORE_DSP_PEQ_DL_OUT":
            acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_PEQ_DL;
            break;

        case "ACORE_DSP_AEC_MIC_IN":
            acore_msg.pn_robj[0]    = OBJ.ACORE_DSP_AEC;
            break;

        case "ACORE_DSP_AEC_REF_IN":
            acore_msg.pn_robj[0]    = OBJ.ACORE_DSP_AEC;
            acore_msg.index[0]      = SNIFFER_INDEX.PAD_1;
            break;

        case "ACORE_DSP_AEC_OUT":
            acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_AEC;
            break;

        case "ACORE_DSP_NS_IN":
        case "ACORE_DSP_NS_OUT":
            acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_NS;
            break;

        default:
            return;
    }

    // acore_msg.state[0] bit definition
    // {
    //     uint8_t  enable    : 1; /**< Sniffer enable flag */
    //     uint8_t  direction : 1; /**< Sniffer input/output flag */
    //     uint8_t  reserved  : 6; /**< Reserved */
    // }
    if (enable === true) {
        acore_msg.state[0] = (acore_msg.state[0] & SNIFFER_ENBALE_MASK) | true;
    }
    else if (enable === false) {
        acore_msg.state[0] = (acore_msg.state[0] & SNIFFER_ENBALE_MASK) | false;
    }

    if (value === "in") {
        acore_msg.state[0] = (acore_msg.state[0] & SNIFFER_DIRECTION_MASK) | (DIRECTION.IN << 1);
    } else if (value === "out") {
        acore_msg.state[0] = (acore_msg.state[0] & SNIFFER_DIRECTION_MASK) | (DIRECTION.OUT << 1);
    }

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(totalBytes, acore_msg.pn_length);
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSub, acore_msg.num_of_subblocks);
    UINT16_TO_BSTREAM(HAL_Audio_SB_Sniffer_Enable, acore_msg.block_id);
    UINT16_TO_BSTREAM(sniffer_enable_size, acore_msg.block_len);

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
};

function snifferActive(port, active) {
    let snifferState = 0;
    // It only has one subblock in the audio core message
    let numOfSub = 1;

    if (active.length === 0) {
        return;
    }

    if (active === true) {
        snifferState = 1;
    }
    else if (active === false) {
        snifferState = 0;
    }

    let acore_msg = {
        pn_media: new Uint8Array(1),
        pn_rdev: new Uint8Array(1),
        pn_sdev: new Uint8Array(1),
        pn_res: new Uint8Array(1),
        pn_length: new Uint8Array(2),
        pn_robj: new Uint8Array(1),
        pn_sobj: new Uint8Array(1),

        trans_id: new Uint8Array(1),
        msg_id: new Uint8Array(1),

        num_of_subblocks: new Uint8Array(2),

        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        active: new Uint8Array(2),
    };

    let sniffer_active = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        active: new Uint8Array(2),
    };

    // count prim_spk_settings size
    let sniffer_active_size = 0;
    for (let prop in sniffer_active) {
        let array = sniffer_active[prop];
        sniffer_active_size += array.BYTES_PER_ELEMENT * array.length;
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
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSub, acore_msg.num_of_subblocks);
    UINT16_TO_BSTREAM(HAL_Audio_SB_Sniffer_Activate, acore_msg.block_id);
    UINT16_TO_BSTREAM(sniffer_active_size, acore_msg.block_len);
    UINT16_TO_BSTREAM(snifferState, acore_msg.active);

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
};

function setSniffer(port, obj_str)
{
    for (let i = 0; i < obj_str.length; i++) {
        snifferEnable(port, obj_str[i].id, obj_str[i].checked, obj_str[i].value)
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
