/****************************************************************************************
 *
 * @file mcps.js
 *
 * @brief Display AP5 MCPS
 *
 * Copyright (C) Ambiq Micro
 *
 *
 ****************************************************************************************
 */

/**
 * @brief Get random number
 */
function getRandomNum(min, max)
{
    let range = max - min;
    let rand  = Math.random();
    return (min + Math.round(rand * range));
}

/**
 * @brief Update MCPS chart.
 */
function updateMcpsChart()
{
    if (mcpsChartConfig.data.datasets.length > 0)
    {

        let last = parseInt(
            mcpsChartData.timeLables[mcpsChartData.timeLables.length - 1]);
        let label = last + 1;
        if (last >= 9)
        {
            label = 0;
        }
        label = label + 's';

        mcpsChartData.timeLables.push(label);
        mcpsChartData.aec.push(mcps.aec);
        mcpsChartData.ns.push(mcps.ns);
        mcpsChartData.peqUl.push(mcps.peqUl);
        mcpsChartData.peqDl.push(mcps.peqDl);
        mcpsChartData.mbdrc.push(mcps.mbdrc);

        mcpsChartData.timeLables.shift();
        mcpsChartData.aec.shift();
        mcpsChartData.ns.shift();
        mcpsChartData.peqUl.shift();
        mcpsChartData.peqDl.shift();
        mcpsChartData.mbdrc.shift();

        handleMcpsChart.update();
    }

    let aecValue   = "AEC : " + mcps.aec + "MCPS";
    let nsValue    = "NS : " + mcps.ns + "MCPS";
    let peqUlValue = "PEQ_UL : " + mcps.peqUl + "MCPS";
    let peqDlValue = "PEQ_DL : " + mcps.peqDl + "MCPS";
    let mbdrcValue = "MBDRC : " + mcps.mbdrc + "MCPS";

    document.getElementById("aec-mcps").textContent    = aecValue;
    document.getElementById("ns-mcps").textContent     = nsValue;
    document.getElementById("peq-ul-mcps").textContent = peqUlValue;
    document.getElementById("peq-dl-mcps").textContent = peqDlValue;
    document.getElementById("mbdrc-mcps").textContent  = mbdrcValue;
}
