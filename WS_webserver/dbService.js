const mysql = require('mysql');
const https = require("https");

let instance = null;

const connection = mysql.createConnection({
user: "root",
database: "wetterstation",
port: "3306"
})

connection.connect((err) => {
    if (err) {
        console.log (err.message);
    }
    console.log('node -> sql ' + connection.state);
})

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async insertNewData(resp_data) {
        const {temperature, air_pressure, air_moisture, soil_moisture, 
               light_sensor, co2, windspeed, img_link, rain, timestamp} = resp_data;

        let anzahl = await this.check_for_new_data(temperature, timestamp);
        //wenn anzahl > 0 ist bereit ein eintrag mit dem identischen timestamp in der Datenbank

        if(!anzahl>0){
            const base64string = await this.convert_link_to_base64(img_link);

            this.write_to_database(temperature, air_pressure, air_moisture, soil_moisture, light_sensor, 
                                   co2, windspeed, img_link, rain, timestamp, base64string);
        }
    }

    async write_to_database(temperature, air_pressure, air_moisture, soil_moisture, light_sensor, co2,
                            windspeed, img_link, rain, timestamp, base64string){
        this.insertIntoTable("image", base64string, timestamp);
        this.insertIntoTable("temperature", temperature, timestamp);
        this.insertIntoTable("air_pressure", air_pressure, timestamp);
        this.insertIntoTable("air_moisture", air_moisture, timestamp);
        this.insertIntoTable("soil_moisture", soil_moisture, timestamp);
        this.insertIntoTable("light_sensor", light_sensor, timestamp);
        this.insertIntoTable("co2", co2, timestamp);
        this.insertIntoTable("rain", rain, timestamp);
        this.insertIntoTable("windspeed", windspeed, timestamp);
        this.insertIntoTable("img_link", img_link, timestamp);
    }

    async check_for_new_data(temperature, timestamp){
        try{
            const response = await new Promise((resolve, reject)=> {
                const query = `SELECT * FROM temperature WHERE data='${temperature}' AND mytimestamp='${timestamp}'`;
                connection.query(query, (err, results) =>{
                    if (err) reject(new Error(err.message));
                    resolve(results);
                }) 
            });
            return response.length;
        }
        catch(error){
            console.log(error);
        }
        return 999;
    }

    async convert_link_to_base64(url){
        return new Promise((resolve, reject) => {
            https.get(url, response => {
                let imageData = '';
                response.setEncoding('base64');
                response.on('data', chunk => {
                    imageData += chunk;
                })
                response.on('end', () => {
                    const base64String = `data:${response.headers['content-type']};base64,${imageData}`;
                    resolve(base64String)
                });
            }).on('error', error => {
                reject(error);
            })
        })
    }
    
    async insertIntoTable(tablename, data, timestamp){
        try {
            await new Promise((resolve, reject)=> {
                const query = `INSERT INTO ${tablename} (data, mytimestamp) VALUES ('${data}', '${timestamp}');`
                connection.query(query, (err, results) =>{
                    if (err) reject(new Error(err.message));
                    resolve(results);
                }) 
            });
        } catch (error) {
            console.log(error);
        }
    }

    async getStoria(){
        try{
            const result = await new Promise((resolve, reject) => {
                const query = `select data, mytimestamp from image ORDER BY ID DESC limit 8`
                connection.query(query, (err, results) =>{
                    if(err) reject("failure");
                    resolve(results);
                })
            })
            return this.convert_to_two_arrays(result);;
        }catch(error){
            console.log(error);
        }
    }

    convert_to_two_arrays(result){
        let data = [];
        let timestamps = [];
        for(let j=0; j<result.length; j++){
            data.push(result[j].data) //extract values
            timestamps.push(result[j].mytimestamp);
        }
        return [data, timestamps];
    }

    async get_last_24_datavalues_of_table(tablename){
        try{
            return await new Promise((resolve, reject) => {
                const req = `select data from (select * from ${tablename} ORDER BY ID DESC limit 24) as last ORDER BY ID ASC`;
                connection.query(req, (err, results) => {
                    if(err){
                        reject("broken");
                    }
                    else{
                        resolve(results);
                    }
                })
            })
        }
        catch(error){
            console.log(error);
        }
    }

    async get_last_24_timestamps_of_table(tablename){
        try{
            return await new Promise((resolve, reject) => {
                const req = `select DATE_FORMAT(mytimestamp, '%H:%i') from (select * from temperature ORDER BY ID DESC limit 24) as last ORDER BY ID ASC`;
                connection.query(req, (err, results) => {
                    if(err){
                        reject("broken");
                    }
                    else{
                        resolve(results);
                    }
                })
            })
        }
        catch(error){
            console.log(error);
        }    
    }

    async getTemperatureHistory(){
        return this.fetchData_float("temperature");
    }

    async getSoilMoistureHistory(){
        return this.fetchData_int("soil_moisture");
    }

    async getAirMoistureHistory(){
        return this.fetchData_int("air_moisture");        

    }

    async getWindSpeedHistory(){
        return this.fetchData_int("windspeed");
    }

    async getCO2History(){
        return this.fetchData_int("co2");
    }

    async getAirPressureHistory(){
        return this.fetchData_int("air_pressure");        
    }

    async getLightHistory(){
        return this.fetchData_int("light_sensor");         
    }

    async getRainHistory(){
        return this.fetchData_int("rain");    
    }

    async fetchData_float(table){
        let temperature_values = await this.get_last_24_datavalues_of_table(table);
        let timestamps = await this.get_last_24_timestamps_of_table(table);
        temperature_values = temperature_values.map(row => parseFloat(row.data));
        timestamps = timestamps.map(obj => obj["DATE_FORMAT(mytimestamp, '%H:%i')"]);
        return [temperature_values, timestamps];
    }

    async fetchData_int(table){
        let rains = await this.get_last_24_datavalues_of_table(table);
        let timestamps = await this.get_last_24_timestamps_of_table(table);
        rains = rains.map(row => parseInt(row.data));
        timestamps = timestamps.map(obj => obj["DATE_FORMAT(mytimestamp, '%H:%i')"]);
        return [rains, timestamps];  
    }
}

module.exports = DbService;