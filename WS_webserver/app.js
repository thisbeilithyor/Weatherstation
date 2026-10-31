const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

const dbService = require('./dbService')

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let pantry_key = "PANTRY_API_KEY";
const imgbb_key = "IMGBB_API_KEY";
let counter = 0;

let temperature = 0.0;
let air_pressure = "";
let air_moisture = "";
let soil_moisture = "";
let light = "";
let co2 = "";
let windspeed = "";
let img_link = "";
let rain = "";
let timestamp = "";
let images;
let timestamps_storia;

getStoria();
checkPantry();
setInterval(checkPantry, 30000);
setInterval(getStoria, 30000);

async function checkPantry(){
    const db = dbService.getDbServiceInstance(); 
    console.log("program is",(counter*30)/60,"minutes alive");
    try{
        const resp = await get_data_from_pantry();
        update_global_vars(resp);
        await db.insertNewData(resp.data);
    }catch (error){
        console.log(error);
    }
    counter++;
}

async function getStoria(){
    const db = dbService.getDbServiceInstance();
    try{
        update_storia_vars(await db.getStoria());
    }
    catch(error){
        console.log(error);
    }
}

async function get_data_from_pantry(){
    const req = 'https://getpantry.cloud/apiv1/pantry/PANTRY_API_KEY/basket/wetterstation';
    return await axios.get(req);
}

function update_storia_vars(result){
    images = result[0];
    timestamps_storia = result[1];
}

function update_global_vars(resp){
    temperature = resp.data.temperature;
    air_pressure = resp.data.air_pressure;
    air_moisture = resp.data.air_moisture;
    soil_moisture = resp.data.soil_moisture;
    light = resp.data.light_sensor;
    co2 = resp.data.co2;
    windspeed = resp.data.windspeed;
    img_link = resp.data.img_link;
    rain = resp.data.rain;
    timestamp = resp.data.timestamp;
}

app.get('/getStoria', async(req, res) => {
    res.json({data: images, timestamp: timestamps_storia})
})

app.get('/getAll', async (req, res) => {
    try{
        res.json({data: {temperature: temperature, air_pressure: air_pressure, air_moisture: air_moisture, soil_moisture: soil_moisture, light_sensor: light, co2: co2, windspeed: windspeed, img_link: img_link, rain: rain, timestamp: timestamp}});
    }catch (error){
        console.log(error);
    }
})

app.get('/getTemperatureHistory', async (req, res) => {
    const db = dbService.getDbServiceInstance(); 
    try{
        const [temperatures, timestamps] = await db.getTemperatureHistory();
        res.json({data: {temperatures: temperatures, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }
})

app.get('/getSoilMoistureHistory', async (req, res) => {
    const db = dbService.getDbServiceInstance(); 
    try{
        const [soil_moistures, timestamps] = await db.getSoilMoistureHistory();
        res.json({data: {soil_moistures: soil_moistures, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }
})

app.get('/getAirMoistureHistory', async (req, res) => {
    const db = dbService.getDbServiceInstance(); 
    try{
        const [air_moistures, timestamps] = await db.getAirMoistureHistory();
        res.json({data: {air_moistures: air_moistures, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }
})

app.get('/getWindSpeedHistory', async (req, res) => {
    const db = dbService.getDbServiceInstance(); 
    try{
        const [windspeeds, timestamps] = await db.getWindSpeedHistory();
        res.json({data: {windspeeds: windspeeds, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }
})

app.get('/getCO2History', async (req, res) => {
    const db = dbService.getDbServiceInstance(); 
    try{
        const [co2s, timestamps] = await db.getCO2History();
        res.json({data: {co2: co2s, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }
})

app.get('/getAirPressureHistory', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try{
        const [air_pressures, timestamps] = await db.getAirPressureHistory();
        res.json({data: {air_pressures: air_pressures, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }
})

app.get('/getLightHistory', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try{
        const [lights, timestamps] = await db.getLightHistory();
        res.json({data: {lights: lights, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }  
})

app.get('/getRainHistory', async (req, res) => {
    const db = dbService.getDbServiceInstance();
    try{
        const [rains, timestamps] = await db.getRainHistory();
        res.json({data: {rains: rains, timestamps: timestamps}});
    }
    catch(error){
        console.log(error);
    }      
})

app.get('/getImgLink', async (req, res) => {
    res.json({img_link: img_link, timestamp: timestamp})
})

app.listen(443, () => {
    console.log("node -> frontend connected");
})