var express = require('express')
var app = express()
var Stopwatch = require('timer-stopwatch')
var dataRate = 1000 //ms
var switchDataRate = 10000 //ms
var telemetryData, switchData
var stopwatch = new Stopwatch() // A new count up stopwatch. Starts at 0. 
var timer = new Stopwatch(36000000) // A new countdown timer with 60 seconds 
var counter = 0
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
 
initData()
runDataStream()
runSwitchStream()

app.get('/', (req, res) => res.json({ message: 'telemetry data stream demo' }) )
app.get('/api/telemetry/recent', (req, res) => res.json(telemetryData)) //numerical data from spacesuit sensors
app.get('/api/switch/recent', (req, res) => res.json(switchData)) //telemetry switches driven by numerical data points or other triggers
app.listen(port, ip)

console.log('Server running on http://%s:%s', ip, port)

function initData(){
    stopwatch.start()
    timer.start()
    
    telemetryData = { 
        _id : "5a8ed9a57eb95cd5d2855904", 
        heart_bpm: 88,
        p_suit : 0, 
        t_batt : "10:00:00",
        t_o2 : "10:00:00", 
        t_h2o : "10:00:00", 
        p_sub : 2, 
        t_sub : -148,
        v_fan : 9000, 
        t_eva : "00:00:00", 
        p_o2 : 750, 
        rate_o2 : 0.55, 
        cap_battery : 0, 
        p_h2o_g : 14, 
        p_h2o_l : 14, 
        p_sop : 550, 
        rate_sop : 0.75,
        t_suit: -148
    }

    switchData = { 
        _id : "5a8edafa7eb95cd5d2855905", 
        batt_amp_high : false,
        batt_vdc_low : false,
        suit_pressure_low : false,
        sop_on : false, 
        sspe : false, 
        suit_pressure_high : false,
        o2_use_high: false,
        sop_pressure_low: false,
        fan_error : false, 
        vent_error : false, 
        co2_high : false,
        vehicle_power : false, 
        h2o_off : false, 
        o2_off : false 
    }
}

function runDataStream(){
    //3.2.1 INTERNAL SUIT PRESSURE - [psid]
    //Description: The pressure inside the spacesuit needs to stay within certain limits. 
    //If the suit pressure gets too high, the movement of the astronaut will be heavily reduced if the pressure exceeds nominal limits. 
    //Expected range is from 2 to 4 psid.
    telemetryData["p_suit"] = generateSweep("p_suit", 0, 6, "int", 1)

    //3.2.2 TIME LIFE BATTERY - [time value]
    //Description: The remaining time until the battery of the spacesuit is completely discharged. 
    //Battery life is usually displayed in the format “hh:mm:ss”.
    //Expected range is from 0 to 10 hours.
    telemetryData["t_batt"] = getTime(timer.ms)

    //3.2.3 TIME LIFE OXYGEN - [time value]
    //Description: The remaining time until the available oxygen is depleated. 
    //Time life oxygen is usually displayed in the format “hh:mm:ss”.
    //Expected range is from 0 to 10 hours.
    telemetryData["t_o2"] = getTime(timer.ms)

    //3.2.4 TIME LIFE WATER - [time value]
    //Description: The remaining time until the water resources of the spacesuit are depleted. 
    //Time life water is usually displayed in the format “hh:mm:ss”.
    //Expected range is from 0 to 10 hours.
    telemetryData["t_h2o"] = getTime(timer.ms)

    //3.2.5 SUB PRESSURE - [psia]
    //Description: External Environment pressure. Expected range is from 2 to 4 psia.
    telemetryData["p_sub"] = generateSweep("p_sub", 0, 6, "int", 1)

    //3.2.6 SUB TEMPERATURE - [degrees Fahrenheit]
    //Description: External Environmental temperature measured in degrees Fahrenheit. Temperatures are expected to be standard low earth orbit Day/Night-cycles without anamolies.
    telemetryData["t_sub"] = generateSweep("t_sub", -148, 248, "int", 1)

    //3.2.7 FAN TACHOMETER- [RPM]
    //Description: Speed of the cooling fan. Expected range is from 10000 to 40000 RPM.
    telemetryData["v_fan"] = generateSweep("v_fan", 9000, 41000, "int", 1)

    //3.2.8 EXTRAVEHICULAR ACTIVITY TIME - [time value]
    //Description: Stopwatch for the current EVA. EVA’s usually do not exceed a time of 9 hours.
    telemetryData["t_eva"] = getTime(stopwatch.ms)

    //3.2.9 OXYGEN PRESSURE - [psia]
    //Description: Pressure inside the Primary Oxygen Pack. Expected range is from 750 to 950 psia.
    telemetryData["p_o2"] = generateSweep("p_o2", 600, 999, "int", 1)

    //3.2.10 OXYGEN RATE - [psi/min]
    //Description: Flowrate of the Primary Oxygen Pack. Expected range is from 0.5 to 1 psi/min.
    telemetryData["rate_o2"] = generateSweep("rate_o2", 0, 2, "dec", 0.01)

    //3.2.11 BATTERY CAPACITY - [amp-hr]
    //Description: Total capacity of the spacesuit’s battery. Expected range is from 0 to 30 amp-hr.
    telemetryData["cap_battery"] = generateSweep("cap_battery", 0, 40, "int", 1)

    //3.2.12 H2O GAS PRESSURE - [psia]
    //Description: Gas pressure from H2O system. Expected range is from 14 to 16 psia.
    telemetryData["p_h2o_g"] = generateSweep("p_h2o_g", 10, 20, "int", 1)

    //3.2.13 H2O LIQUID PRESSURE - [psia]
    //Description: Liquid pressure from H2O system. Expected range is from 14 to 16 psia.
    telemetryData["p_h2o_l"] = generateSweep("p_h2o_l", 10, 20, "int", 1)

    //3.2.14 SOP PRESSURE - [psia]
    //Description: Pressure inside the Secondary Oxygen Pack. Expected range is from 750 to 950 psia.
    telemetryData["p_sop"] = generateSweep("p_sop", 600, 999, "int", 1)

    //3.2.15 SOP RATE - [psi/min]
    //Description: Flowrate of the Secondary Oxygen Pack. Expected range is from 0.5 to 1 psi/min.
    telemetryData["rate_sop"] = generateSweep("rate_sop", 0, 2, "dec", 0.01)
    
    telemetryData["t_suit"] = generateSweep("t_suit", -148, 248, "int", 1)
    
    setTimeout(runDataStream, dataRate)
}

function runSwitchStream(){    
    var randomSwitch = getRandomIntInclusive(0, 13)

    switchData["batt_amp_high"] = false
    switchData["batt_vdc_low"] = false
    switchData["sop_on"] = false
    switchData["sspe"] = false
    switchData["o2_use_high"] = false
    switchData["vent_error"] = false
    switchData["co2_high"] = false
    switchData["vehicle_power"] = false
    switchData["h2o_off"] = false
    switchData["o2_off"] = false

    switch (randomSwitch){
        case 0:
            //Battery amp high
            //Current of the battery is above maximum levels. Amps
            //Trigger: >4 amp
            switchData["batt_amp_high"] = true
            break;
        case 1:
            //Battery vdc low
            //Voltage of the battery is below minimum levels. Volts
            //Trigger: <15 V
            switchData["batt_vdc_low"] = true
            break;
        case 2:
            //SOP on
            //Secondary Oxygen Pack is active
            switchData["sop_on"] = true
            break;
        case 3:
            //Spacesuit pressure emergency
            //Spacesuit pressure
            switchData["sspe"] = true
            break;
        case 4:
            //O2 use high
            //Oxygen usage exceeds normal use. Psi/min
            //Trigger: >1 psi/min
            switchData["o2_use_high"] = true
            break;
        case 5:
            //No vent flow
            //No ventilation flow is detected
            switchData["vent_error"] = true
            break;
        case 6:
            //CO2 high
            //Carbon dioxide levels are above maximum levels. PPM
            //Trigger: >500 ppm
            switchData["co2_high"] = true
            break;
        case 7:
            // Vehicle power present
            //Spacesuit is receiving power through spacecraft
            switchData["vehicle_power"] = true 
            break;
        case 8:
            //H2O is off
            //H2O system is offline
            switchData["h2o_off"] = true
            break;
        case 9:
            //O2 is off
            //O2 system is offline
            switchData["o2_off"] = true
            break;
        default:
            //defualt
            break;

    }
    
    //telemetry dependant switches    

    //Suit pressure low
    //Spacesuit pressure is below minimum levels. Psid
    //Trigger: <2
    switchData["suit_pressure_low"] = (telemetryData["p_suit"] < 2) ? true : false

    //Spacesuit pressure high
    //Spacesuit pressure is above maximum levels. Psid
    //Trigger: >5 psid
    switchData["suit_pressure_high"] = (telemetryData["p_suit"] > 5) ? true : false

    //SOP pressure low
    //Secondary Oxygen Pressure is below minimum levels. Psia
    //Trigger: <700 psia
    switchData["sop_pressure_low"] = (telemetryData["p_sop"] < 750) ? true : false

    //Fan failure
    //Cooling fan of the spacesuit has a failure
    switchData["fan_error"] = (telemetryData["v_fan"] < 10000) ? true : false

    setTimeout(runSwitchStream, switchDataRate)
}

//sweep from min to max to min +/- 10%
function generateSweep(key, min, max, type, step){
    var currentValue = telemetryData[key]
    
    switch (type){
        case "int":
            currentValue = (currentValue < max ) ? (currentValue + step) : (min)
            break
        case "dec":
            currentValue = (currentValue < max ) ? (currentValue + step) : (min)
            currentValue = Math.round(currentValue * 100 ) / 100
            console.log(currentValue)
            break
        default:
            currentValue = -777777
    }
    return currentValue
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive 
}

function getTime(ms){
    var hours = Math.floor(ms / 3600000) // 1 Hour = 36000 Milliseconds
    var minutes = Math.floor((ms % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    var seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

    hours = (hours < 10) ? "0"+hours : hours
    minutes = (minutes < 10) ? "0"+minutes : minutes
    seconds = (seconds < 10) ? "0"+seconds : seconds

    return hours + ":" + minutes + ":" + seconds
}

module.exports = app 
