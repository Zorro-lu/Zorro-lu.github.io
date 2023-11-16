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

let DIRECTION = {
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

function UINT16_TO_BSTREAM(n, p) {
    p[0] = (n >> 8) & 0xFF;
    p[1] = n & 0xFF;
}

function BSTREAM_TO_UINT16(p, n) {
    n[0] = p[0] << 8;
    n[0] = p[1] | n[0];
}

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

let FRAME_TYPE = {
    INVALID:            0,
    ACORE_MESSAGE:      1,
    AUDIO_DATA:         2,
}
/**
 * @brief Message IDs
 */
let HAL_Audio_HW_Control_Request        = 0x1B;
let HAL_Audio_HW_Control_Response       = 0x1C;
let HAL_Audio_Buffers_Request           = 0x30;
let HAL_Audio_Buffers_Response          = 0x31;
let HAL_Audio_Config_Request            = 0x32;
let HAL_Audio_Config_Response           = 0x33;
let HAL_Audio_Playback_Data_Request     = 0x34;
let HAL_Audio_Playback_Data_Response    = 0x35;
let HAL_Audio_Record_Data_Request       = 0x36;
let HAL_Audio_Record_Data_Response      = 0x37;
let HAL_Audio_Node_Data_Notify          = 0x38;
let HAL_Audio_Tone_Generate_Request     = 0x00;

/**
 * Audio Sub-Block IDs
 */
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
let HAL_Audio_SB_UL_PEQ_Center_Freq     = 0x0019;
let HAL_Audio_SB_UL_PEQ_Qfactor         = 0x001a;
let HAL_Audio_SB_UL_PEQ_Gain            = 0x001b;
let HAL_Audio_SB_Sniffer_Enable         = 0x0034;
let HAL_Audio_SB_Sniffer_Activate       = 0x0035;

// Copy setting parameters to message
function setMsg(sbMsg, settings) {
    let offset = 0;
    for (let prop in settings) {
        let array = settings[prop];
        sbMsg.set(array, offset);
        offset += array.BYTES_PER_ELEMENT * array.length;
    }
}

function setGain(string, port) {
    // console.log("sending to serial:" + string.length);
    if (string.length === 0)
        return;
    console.log("set gain: [" + string +"]\n");

    let temp  = parseInt(string, 10);
    let temp1 = Math.pow(10, temp * 0.05) * (1 << 7) + 0.5;
    let gain = Math.floor(temp1);
    let frameTypeSize   = 1;
    let numOfSubblocks  = 1;

    let frameType = new Uint8Array(frameTypeSize);

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
    };

    let prim_spk_settings = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        ep_mode: new Uint8Array(1),
        ep_id: new Uint8Array(1),
        logic_vol: new Uint8Array(2),
        ctl_obj: new Uint8Array(2),
        gain_left: new Uint8Array(2),
        gain_right: new Uint8Array(2),
        filter1: new Uint8Array(2),
        sidetone: new Uint8Array(2),
        filter2: new Uint8Array(2),
    };

    // count acore_msg size
    let acore_msg_size = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        acore_msg_size += array.BYTES_PER_ELEMENT * array.length;
    }

    // count prim_spk_settings size
    let prim_spk_settings_size = 0;
    for (let prop in prim_spk_settings) {
        let array = prim_spk_settings[prop];
        prim_spk_settings_size += array.BYTES_PER_ELEMENT * array.length;
    }

    let pnLength    = acore_msg_size + prim_spk_settings_size;
    let totalBytes  = acore_msg_size + prim_spk_settings_size + frameTypeSize;

    frameType[0] = FRAME_TYPE.ACORE_MESSAGE;

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(pnLength, acore_msg.pn_length);
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_GAIN;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSubblocks, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_Primary_Spkr_Settings, prim_spk_settings.block_id);
    UINT16_TO_BSTREAM(prim_spk_settings_size, prim_spk_settings.block_len);
    UINT16_TO_BSTREAM(gain, prim_spk_settings.gain_left);
    UINT16_TO_BSTREAM(gain, prim_spk_settings.gain_right);

    // copy acore_msg data to acoreMsg
    let acoreMsg = new Uint8Array(acore_msg_size);
    let offset = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        acoreMsg.set(array, offset);
        offset += array.BYTES_PER_ELEMENT * array.length;
    }

    // copy prim_spk_settings data to primSpkSettingsMsg
    let primSpkSettingsMsg = new Uint8Array(prim_spk_settings_size);
    offset = 0;
    for (let prop in prim_spk_settings) {
        let array = prim_spk_settings[prop];
        primSpkSettingsMsg.set(array, offset);
        offset += array.BYTES_PER_ELEMENT * array.length;
    }

    let gainMsg = new Uint8Array(totalBytes);
    gainMsg.set(frameType, 0);
    gainMsg.set(acoreMsg, frameType.length);
    gainMsg.set(primSpkSettingsMsg, frameType.length + acoreMsg.length);

    console.log(gainMsg);
    if (port) {
        port.send(gainMsg);
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

    // Coverts the string to a decimal int
    let attack_time     = parseInt(attack_time_str, 10);
    let decay_time      = parseInt(decay_time_str, 10);
    let knee_threshold  = parseInt(knee_threshold_str, 10);
    let noise_gate      = parseInt(noise_gate_str, 10);

    let slope_temp      = parseFloat(slope_str);
    slope_temp = slope_temp * (1 << 10);
    let slope  = Math.floor(slope_temp);

    let frameTypeSize   = 1;
    let numOfSubblocks  = 5;
    let frameType = new Uint8Array(frameTypeSize);

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
    };

    let drc_attack_time = {
        attack_time_block_id: new Uint8Array(2),
        attack_time_block_len: new Uint8Array(2),
        attack_time: new Int8Array(2),
    };

    let drc_decay_time = {
        decay_time_block_id: new Uint8Array(2),
        decay_time_block_len: new Uint8Array(2),
        decay_time: new Int8Array(2),
    };

    let drc_knee_threshold = {
        knee_threshold_block_id: new Uint8Array(2),
        knee_threshold_block_len: new Uint8Array(2),
        knee_threshold: new Int8Array(2),
    };

    let drc_noise_gate = {
        noise_gate_block_id: new Uint8Array(2),
        noise_gate_block_len: new Uint8Array(2),
        noise_gate: new Int8Array(2),
    };

    let drc_slope = {
        slope_block_id: new Uint8Array(2),
        slope_block_len: new Uint8Array(2),
        slope: new Int8Array(2),
    };

    // count drc_attack_time size
    let drc_attack_time_size = 0;
    for (let prop in drc_attack_time) {
        let array = drc_attack_time[prop];
        drc_attack_time_size += array.BYTES_PER_ELEMENT * array.length;
    }
    let drc_decay_time_size      = drc_attack_time_size;
    let drc_knee_threshold_size  = drc_attack_time_size;
    let drc_noise_gate_size      = drc_attack_time_size;
    let drc_slope_size           = drc_attack_time_size;

    // count acore_msg size
    let acore_msg_size = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        acore_msg_size += array.BYTES_PER_ELEMENT * array.length;
    }

    let pnLength = acore_msg_size + drc_attack_time_size + drc_decay_time_size
            + drc_knee_threshold_size + drc_noise_gate_size + drc_slope_size;

    let totalBytes = acore_msg_size + drc_attack_time_size + drc_decay_time_size
                + drc_knee_threshold_size + drc_noise_gate_size + drc_slope_size + frameTypeSize;

    frameType[0] = FRAME_TYPE.ACORE_MESSAGE;

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(pnLength, acore_msg.pn_length);
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_DRC;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSubblocks, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Attack_Time_ms, drc_attack_time.attack_time_block_id);
    UINT16_TO_BSTREAM(drc_attack_time_size, drc_attack_time.attack_time_block_len);
    UINT16_TO_BSTREAM(attack_time, drc_attack_time.attack_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Decay_Time_ms, drc_decay_time.decay_time_block_id);
    UINT16_TO_BSTREAM(drc_decay_time_size, drc_decay_time.decay_time_block_len);
    UINT16_TO_BSTREAM(decay_time, drc_decay_time.decay_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Knee_Threshold, drc_knee_threshold.knee_threshold_block_id);
    UINT16_TO_BSTREAM(drc_knee_threshold_size, drc_knee_threshold.knee_threshold_block_len);
    UINT16_TO_BSTREAM(knee_threshold, drc_knee_threshold.knee_threshold);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Noise_Gate, drc_noise_gate.noise_gate_block_id);
    UINT16_TO_BSTREAM(drc_noise_gate_size, drc_noise_gate.noise_gate_block_len);
    UINT16_TO_BSTREAM(noise_gate, drc_noise_gate.noise_gate);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_DRC_Slope, drc_slope.slope_block_id);
    UINT16_TO_BSTREAM(drc_slope_size, drc_slope.slope_block_len);
    UINT16_TO_BSTREAM(slope, drc_slope.slope);

    // copy acore_msg data to acoreMsg
    let acoreMsg = new Uint8Array(acore_msg_size);
    setMsg(acoreMsg, acore_msg);

    // copy drc_attack_time data to drcAttackTimeMsg
    let drcAttackTimeMsg = new Uint8Array(drc_attack_time_size);
    setMsg(drcAttackTimeMsg, drc_attack_time);

    // copy drc_decay_time data to drcDecayTimeMsg
    let drcDecayTimeMsg = new Uint8Array(drc_decay_time_size);
    setMsg(drcDecayTimeMsg, drc_decay_time);

    // copy drc_knee_threshold data to drcKneeThresholdMsg
    let drcKneeThresholdMsg = new Uint8Array(drc_knee_threshold_size);
    setMsg(drcKneeThresholdMsg, drc_knee_threshold);

    // copy drc_noise_gate data to drcNoiseGateMsg
    let drcNoiseGateMsg = new Uint8Array(drc_noise_gate_size);
    setMsg(drcNoiseGateMsg, drc_noise_gate);

    // copy drc_slope data to drcSlopeMsg
    let drcSlopeMsg = new Uint8Array(drc_slope_size);
    setMsg(drcSlopeMsg, drc_slope);

    // Combine several message into one message
    let drcMsg = new Uint8Array(totalBytes);
    drcMsg.set(frameType, 0);
    drcMsg.set(acoreMsg, frameType.length);
    drcMsg.set(drcAttackTimeMsg, frameType.length + acoreMsg.length);
    drcMsg.set(drcDecayTimeMsg, frameType.length + acoreMsg.length + drcAttackTimeMsg.length);
    drcMsg.set(drcKneeThresholdMsg, frameType.length + acoreMsg.length + drcAttackTimeMsg.length + drcDecayTimeMsg.length);
    drcMsg.set(drcNoiseGateMsg, frameType.length + acoreMsg.length + drcAttackTimeMsg.length + drcDecayTimeMsg.length + drcKneeThresholdMsg.length);
    drcMsg.set(drcSlopeMsg, frameType.length + acoreMsg.length + drcAttackTimeMsg.length + drcDecayTimeMsg.length + drcKneeThresholdMsg.length + drcNoiseGateMsg.length);

    console.log(drcMsg);
    if (port) {
        port.send(drcMsg);
    }
}

// The AGC parameters are written to message and sent via the port
function setAgc(port, attack_time_str, decay_time_str, target_str) {
    if (attack_time_str.length === 0)
        return;
    console.log("set Agc Attack Time: [" + attack_time_str +"]\n");
    console.log("set Agc Decay Time: [" + decay_time_str +"]\n");
    console.log("set Agc Target: [" + target_str +"]\n");

    // Coverts the string to a decimal int
    let attack_time = parseInt(attack_time_str, 10);
    let decay_time  = parseInt(decay_time_str, 10);
    let target      = parseInt(target_str, 10);

    let frameTypeSize   = 1;
    let numOfSubblocks  = 3;
    let frameType = new Uint8Array(frameTypeSize);

    let acore_msg = {
        pn_media: new Uint8Array([0]),
        pn_rdev: new Uint8Array([0]),
        pn_sdev: new Uint8Array([0]),
        pn_res: new Uint8Array([0]),
        pn_length: new Uint8Array(2),
        pn_robj: new Uint8Array([0]),
        pn_sobj: new Uint8Array([0]),
        trans_id: new Uint8Array([0]),
        msg_id: new Uint8Array([0]),
        num_of_subblocks: new Uint8Array(2),
    };

    let agc_attack_time = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        attack_time: new Uint8Array(2),
    };

    let agc_decay_time = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        decay_time: new Int8Array(2),
    };

    let agc_target = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        target: new Int8Array(2),
    };

    // count agc_attack_time size
    let agc_attack_time_size = 0;
    for (let prop in agc_attack_time) {
        let array = agc_attack_time[prop];
        agc_attack_time_size += array.BYTES_PER_ELEMENT * array.length;
    }
    let agc_decay_time_size = agc_attack_time_size;
    let agc_target_size     = agc_attack_time_size;

    // count acore_msg size
    let acore_msg_size = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        acore_msg_size += array.BYTES_PER_ELEMENT * array.length;
    }

    let pnLength = acore_msg_size + agc_attack_time_size + agc_decay_time_size
            + agc_target_size;

    let totalBytes = acore_msg_size + agc_attack_time_size + agc_decay_time_size
            + agc_target_size + frameTypeSize;

    frameType[0] = FRAME_TYPE.ACORE_MESSAGE;

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(pnLength, acore_msg.pn_length);
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_AGC;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSubblocks, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_AGC_Attack_Time_ms, agc_attack_time.block_id);
    UINT16_TO_BSTREAM(agc_attack_time_size, agc_attack_time.block_len);
    UINT16_TO_BSTREAM(attack_time, agc_attack_time.attack_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_AGC_Decay_Time_ms, agc_decay_time.block_id);
    UINT16_TO_BSTREAM(agc_decay_time_size, agc_decay_time.block_len);
    UINT16_TO_BSTREAM(decay_time, agc_decay_time.decay_time);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_AGC_Target, agc_target.block_id);
    UINT16_TO_BSTREAM(agc_target_size, agc_target.block_len);
    UINT16_TO_BSTREAM(target, agc_target.target);

    // copy acore_msg data to acoreMsg
    let acoreMsg = new Uint8Array(acore_msg_size);
    setMsg(acoreMsg, acore_msg);

    // copy agc_attack_time data to agcAttackTimeMsg
    let agcAttackTimeMsg = new Uint8Array(agc_attack_time_size);
    setMsg(agcAttackTimeMsg, agc_attack_time);

    // copy agc_decay_time data to agcDecayTimeMsg
    let agcDecayTimeMsg = new Uint8Array(agc_decay_time_size);
    setMsg(agcDecayTimeMsg, agc_decay_time);

    // copy agc_decay_time data to agcDecayTimeMsg
    let agcTargetMsg = new Uint8Array(agc_target_size);
    setMsg(agcTargetMsg, agc_target);

    // Combine several message into one message
    let agcMsg = new Uint8Array(totalBytes);
    agcMsg.set(frameType, 0);
    agcMsg.set(acoreMsg, frameType.length);
    agcMsg.set(agcAttackTimeMsg, frameType.length + acoreMsg.length);
    agcMsg.set(agcDecayTimeMsg, frameType.length + acoreMsg.length + agcAttackTimeMsg.length);
    agcMsg.set(agcTargetMsg, frameType.length + acoreMsg.length + agcAttackTimeMsg.length + agcDecayTimeMsg.length);

    console.log(agcMsg);
    if (port) {
        port.send(agcMsg);
    }
}

// The PEQ parameters are written to message and sent via the port
function setPeq(port, dir, band_num_str, band_center_freq_str, band_qfactor_str, band_gain_str) {
    if (band_num_str.length === 0)
        return;

    // Coverts the string to a decimal int
    let band_num    = parseInt(band_num_str, 10);

    let frameTypeSize   = 1;
    let numOfSubblocks  = 3;
    let frameType = new Uint8Array(frameTypeSize);

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
    };

    let peq_band_center_freq = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        number: new Uint8Array(2),
        // band_num * sizeof(float)
        band_center_freq: new Int8Array(36),
    };

    let peq_band_qfactor = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        number: new Uint8Array(2),
        // band_num * sizeof(float)
        band_qfactor: new Int8Array(36),
    };

    let peq_band_gain = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        number: new Uint8Array(2),
        // band_num * sizeof(float)
        band_gain: new Int8Array(36),
    };

    // count band_center_freq size
    let peq_band_center_freq_size = 0;
    for (let prop in peq_band_center_freq) {
        let array = peq_band_center_freq[prop];
        peq_band_center_freq_size += array.BYTES_PER_ELEMENT * array.length;
    }
    let peq_band_qfactor_size = peq_band_center_freq_size;
    let peq_band_gain_size = peq_band_center_freq_size;

    // count acore_msg size
    let acore_msg_size = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        acore_msg_size += array.BYTES_PER_ELEMENT * array.length;
    }

    let pnLength = acore_msg_size + peq_band_center_freq_size + peq_band_qfactor_size
            + peq_band_gain_size;

    let totalBytes = acore_msg_size + peq_band_center_freq_size + peq_band_qfactor_size
            + peq_band_gain_size + frameTypeSize;

    frameType[0] = FRAME_TYPE.ACORE_MESSAGE;

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(pnLength, acore_msg.pn_length);

    if (dir === "in") {
        acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_PEQ_UL;
    } else if (dir === "out") {
        acore_msg.pn_robj[0]  = OBJ.ACORE_DSP_PEQ_DL;
    }

    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSubblocks, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_PEQ_Center_Freq, peq_band_center_freq.block_id);
    UINT16_TO_BSTREAM(peq_band_center_freq_size, peq_band_center_freq.block_len);
    UINT16_TO_BSTREAM(band_num, peq_band_center_freq.number);
    for (let i = 0; i < band_center_freq_str.length; i++) {
        console.log(band_center_freq_str[i].value);
        let band_center_freq  = parseInt(band_center_freq_str[i].value, 10);
        // 4 = sizeof(int)
        let temp_buf = new Int8Array(4);
        UINT32_TO_BSTREAM(band_center_freq, temp_buf);
        peq_band_center_freq.band_center_freq.set(temp_buf, i * temp_buf.length);
    }

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_PEQ_Qfactor, peq_band_qfactor.block_id);
    UINT16_TO_BSTREAM(peq_band_qfactor_size, peq_band_qfactor.block_len);
    UINT16_TO_BSTREAM(band_num, peq_band_qfactor.number);
    for (let i = 0; i < band_qfactor_str.length; i++) {
        let band_qfactor  = parseFloat(band_qfactor_str[i].value);
        let band_qfactor_buf = Float32Array.from([band_qfactor]).buffer;
        let temp_buf = new Int8Array(band_qfactor_buf);
        peq_band_qfactor.band_qfactor.set(temp_buf, i * temp_buf.length);
    }

    UINT16_TO_BSTREAM(HAL_Audio_SB_UL_PEQ_Gain, peq_band_gain.block_id);
    UINT16_TO_BSTREAM(peq_band_gain_size, peq_band_gain.block_len);
    UINT16_TO_BSTREAM(band_num, peq_band_gain.number);
    for (let i = 0; i < band_gain_str.length; i++) {
        console.log(band_gain_str[i].value);
        let band_gain  = parseInt(band_gain_str[i].value, 10);
        // 4 = sizeof(int)
        let temp_buf = new Int8Array(4);
        UINT32_TO_BSTREAM(band_gain, temp_buf);
        peq_band_gain.band_gain.set(temp_buf, i * temp_buf.length);
    }

    // copy acore_msg data to acoreMsg
    let acoreMsg = new Uint8Array(acore_msg_size);
    setMsg(acoreMsg, acore_msg);

    // copy peq_band_center_freq data to peqBandCenterFreqMsg
    let peqBandCenterFreqMsg = new Uint8Array(peq_band_center_freq_size);
    setMsg(peqBandCenterFreqMsg, peq_band_center_freq);

    // copy peq_band_qfactor data to peqBandQfactorMsg
    let peqBandQfactorMsg = new Uint8Array(peq_band_qfactor_size);
    setMsg(peqBandQfactorMsg, peq_band_qfactor);

    // copy peq_band_gain data to peqBandGainMsg
    let peqBandGainMsg = new Uint8Array(peq_band_gain_size);
    setMsg(peqBandGainMsg, peq_band_gain);

    // Combine several message into one message
    let peqMsg = new Uint8Array(totalBytes);
    peqMsg.set(frameType, 0);
    peqMsg.set(acoreMsg, frameType.length);
    peqMsg.set(peqBandCenterFreqMsg, frameType.length + acoreMsg.length);
    peqMsg.set(peqBandQfactorMsg, frameType.length + acoreMsg.length + peqBandCenterFreqMsg.length);
    peqMsg.set(peqBandGainMsg, frameType.length + acoreMsg.length + peqBandCenterFreqMsg.length + peqBandQfactorMsg.length);
    console.log(peqMsg);

    if (port) {
        port.send(peqMsg);
    }
}

function snifferEnable(port, obj, enable, value) {
    // It only has one subblock in the audio core message
    let numOfSub         = 1;
    let frameTypeSize   = 1;
    let frameType = new Uint8Array(frameTypeSize);
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
    };

    let sniffer_enable = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        state: new Uint8Array(1),
        index: new Uint8Array(1),
    };

    // count sniffer_enable size
    let sniffer_enable_size = 0;
    for (let prop in sniffer_enable) {
        let array = sniffer_enable[prop];
        sniffer_enable_size += array.BYTES_PER_ELEMENT * array.length;
    }

    // count acore_msg size
    let acore_msg_size = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        acore_msg_size += array.BYTES_PER_ELEMENT * array.length;
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
            sniffer_enable.index[0] = SNIFFER_INDEX.PAD_1;
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
        sniffer_enable.state[0] = (sniffer_enable.state[0] & SNIFFER_ENBALE_MASK) | true;
    }
    else if (enable === false) {
        sniffer_enable.state[0] = (sniffer_enable.state[0] & SNIFFER_ENBALE_MASK) | false;
    }

    if (value === "in") {
        sniffer_enable.state[0] = (sniffer_enable.state[0] & SNIFFER_DIRECTION_MASK) | (DIRECTION.IN << 1);
    } else if (value === "out") {
        sniffer_enable.state[0] = (sniffer_enable.state[0] & SNIFFER_DIRECTION_MASK) | (DIRECTION.OUT << 1);
    }

    let pnLength = acore_msg_size + sniffer_enable_size;
    let totalBytes = acore_msg_size + sniffer_enable_size + frameTypeSize;

    frameType[0] = FRAME_TYPE.ACORE_MESSAGE;

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(pnLength, acore_msg.pn_length);
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSub, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_Sniffer_Enable, sniffer_enable.block_id);
    UINT16_TO_BSTREAM(sniffer_enable_size, sniffer_enable.block_len);

    // copy acore_msg data to acoreMsg
    let acoreMsg = new Uint8Array(acore_msg_size);
    setMsg(acoreMsg, acore_msg);

    // copy sniffer_enable data to snifferEnableMsg
    let snifferEnableMsg = new Uint8Array(sniffer_enable_size);
    setMsg(snifferEnableMsg, sniffer_enable);

    // Combine several message into one message
    let snifferMsg = new Uint8Array(totalBytes);
    snifferMsg.set(frameType, 0);
    snifferMsg.set(acoreMsg, frameType.length);
    snifferMsg.set(snifferEnableMsg, frameType.length + acoreMsg.length);

    console.log(snifferMsg);
    if (port) {
        port.send(snifferMsg);
    }
};

function snifferActive(port, active) {
    let snifferState = 0;
    let frameTypeSize   = 1;
    let frameType = new Uint8Array(frameTypeSize);
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
    };

    let sniffer_active = {
        block_id: new Uint8Array(2),
        block_len: new Uint8Array(2),
        active: new Uint8Array(2),
    };

    // count sniffer_active size
    let sniffer_active_size = 0;
    for (let prop in sniffer_active) {
        let array = sniffer_active[prop];
        sniffer_active_size += array.BYTES_PER_ELEMENT * array.length;
    }

    // count acore_msg size
    let acore_msg_size = 0;
    for (let prop in acore_msg) {
        let array = acore_msg[prop];
        acore_msg_size += array.BYTES_PER_ELEMENT * array.length;
    }

    let pnLength = acore_msg_size + sniffer_active_size;
    let totalBytes = acore_msg_size + sniffer_active_size + frameTypeSize;

    frameType[0] = FRAME_TYPE.ACORE_MESSAGE;

    acore_msg.pn_rdev[0]  = MSG_EP_AGENT.DSP;
    acore_msg.pn_sdev[0]  = MSG_EP_AGENT.DSP;
    UINT16_TO_BSTREAM(pnLength, acore_msg.pn_length);
    acore_msg.pn_robj[0]  = OBJ.ACORE_DSP;
    acore_msg.pn_sobj[0]  = OBJ.ACORE_TOOL;
    acore_msg.msg_id[0]   = HAL_Audio_HW_Control_Request;
    UINT16_TO_BSTREAM(numOfSub, acore_msg.num_of_subblocks);

    UINT16_TO_BSTREAM(HAL_Audio_SB_Sniffer_Activate, sniffer_active.block_id);
    UINT16_TO_BSTREAM(sniffer_active_size, sniffer_active.block_len);
    UINT16_TO_BSTREAM(snifferState, sniffer_active.active);

    // copy acore_msg data to acoreMsg
    let acoreMsg = new Uint8Array(acore_msg_size);
    setMsg(acoreMsg, acore_msg);

    // copy sniffer_active data to snifferEnableMsg
    let snifferActiveMsg = new Uint8Array(sniffer_active_size);
    setMsg(snifferActiveMsg, sniffer_active);

    // Combine several message into one message
    let snifferMsg = new Uint8Array(totalBytes);
    snifferMsg.set(frameType, 0);
    snifferMsg.set(acoreMsg, frameType.length);
    snifferMsg.set(snifferActiveMsg, frameType.length + acoreMsg.length);

    console.log(snifferMsg);
    if (port) {
        port.send(snifferMsg);
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
