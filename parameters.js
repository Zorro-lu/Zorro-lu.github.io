/****************************************************************************************
 *
 * @file logs.js
 *
 * @brief Useful functions for debugging.
 *
 * Copyright (C) Ambiq Micro
 *
 *
 ****************************************************************************************
 */

/*global variables */

window.file = null;
let handleMcpsChart;
let playInterval     = {id : 0};
let mcpsInterval     = {id : 0};
let function_modules = AUDIO_TOOL.NULL;

/**
 * @brief The MCPS of algorithm.
 */
let mcps = {
    number : 0, // The number of MCPS that have been read.
    aec : 0,    // The MCPS of AEC.
    ns : 0,     // The MCPS of NS.
    peqUl : 0,  // The MCPS of PEQ UL
    peqDl : 0,  // The MCPS of PEQ DL
    mbdrc : 0,  // The MCPS of MBDRC
};

// MCPS Chart Data Tables
let mcpsChartData = {
    timeLables : [
        '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '0s'
    ],                                        // Time labels
    aec : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],   // AEC MCPS table
    ns : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],    // NS MCPS table
    peqUl : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // PEQ_UL MCPS table
    peqDl : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // PEQ_DL MCPS table
    mbdrc : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // MBDRC MCPS table
}

// MCPS chart configuration
let mcpsChartConfig = {
    type : 'line',
    data : {
        labels : mcpsChartData.timeLables,
        datasets : [
            {
                label : 'AEC',
                data : mcpsChartData.aec,
                backgroundColor : 'rgb(255, 99, 132)',
                borderColor : 'rgb(255, 99, 132)',
                fill : false,
            },
            {
                label : 'NS',
                data : mcpsChartData.ns,
                backgroundColor : 'rgb(75, 192, 192)',
                borderColor : 'rgb(75, 192, 192)',
                fill : false,
            },
            {
                label : 'PEQ_UL',
                data : mcpsChartData.peqUl,
                backgroundColor : 'rgb(207, 154, 38)',
                borderColor : 'rgb(207, 154, 38)',
                fill : false,
            },
            {
                label : 'PEQ_DL',
                data : mcpsChartData.peqDl,
                backgroundColor : 'rgb(13, 16, 219)',
                borderColor : 'rgb(13, 16, 219)',
                fill : false,
            },
            {
                label : 'MBDRC',
                data : mcpsChartData.mbdrc,
                backgroundColor : 'rgb(9, 212, 70)',
                borderColor : 'rgb(9, 212, 70)',
                fill : false,
            }
        ]
    },
    options : {
        responsive : true,
        animation : false,
        title : {display : true, text : 'MCPS Real Time Display'},
        scales : {
            y : {
                suggestedMin : 0,
                suggestedMax : 50,
            }
        },
    }
};

// Clean all status
function cleanStatus()
{
    // Stop all timing operations
    clearInterval(playInterval.id);
    clearInterval(mcpsInterval.id);
    playInterval.id = 0;
    mcpsInterval.id = 0;

    function_modules = AUDIO_TOOL.NULL;
    window.file      = null;
}
