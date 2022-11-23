import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

//const https = require('https');
const  now = require("performance-now")
const request = require("request");
// const {PubSub} = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
// const puppeteer = require('puppeteer');
// const pubSubClient = new PubSub();

//const d = new Date();
//const curr_month = d.getMonth() + 1; //Months are zero based
//const curr_year = d.getFullYear();
//const date = (curr_year + '-' + curr_month + '-' + curr_date);

//myImports
//import {AviationStack} from './AviationStack';
import {AviationStack2} from './AviationStack2';
import {Airport} from './Airport';
import {ArrivalTimeTable} from './ArrivalTimeTable';
import {Airlines} from './Airlines';
import {Score, ScoreData} from './ScoreData';
import {TripAdvisorPollResp} from './TripAdvisorPollResp';
// import {Ticket, PVenta} from './Tickets';
import {User} from './UserList';
import {KiwiResponse} from './kiwiResponse';
import {KiwiTicket} from './kiwiTickets';
//end myimport

export class Convert {
    public static toAviationStack2(json: string): AviationStack2 {
        return JSON.parse(json);
    }
}
export class Converted {
    public static toAirlines(json: string): Airlines {
        return JSON.parse(json);
    }
}
export class Convertion {
    public static toArrivalTimeTable(json: string): ArrivalTimeTable {
        return JSON.parse(json);
    }
}
export class Converting {
    public static toAirport(json: string): Airport {
        return JSON.parse(json);
    }
}
export class Conversion {
 public static toScore(json: string): Score[] {
     return JSON.parse(json);
 }
 public static scoreToJson(value: Score[]): string {
       return JSON.stringify(value);
   }
}
export class ConvertTransf {
    public static toTripAdvisorPollResp(json: string): TripAdvisorPollResp {
        return JSON.parse(json);
    }}
export class Convertir {
    public static toKiwiResponse(json: string): KiwiResponse {
        return JSON.parse(json);
    }}

admin.initializeApp();
const db = admin.firestore();
const fcm = admin.messaging();
const access_key = 'API_KEY'; 


exports.getFlightInfo = functions.https.onRequest(async (req, resp)=>{
  let respostaFuncio:any;
  const flightId = req.query.flightId;
  // let vols:number = 0;
  let depCity:any;
  let arrCity:any;
  const optionAviationStack = {
    method: 'GET',
    url: `http://api.aviationstack.com/v1/flights?access_key=${access_key}&flight_iata=${flightId}`,
  };

  try{
     await request(optionAviationStack, async function(error:any,algo:any, body:any){
       console.log(body);
      const flightAS:AviationStack2 = Convert.toAviationStack2(body);
      console.log(flightAS);
        respostaFuncio = flightAS.data[0];
        depCity = respostaFuncio.departure.iata;
        arrCity = respostaFuncio.arrival.iata;
        depCity = await getCityName(depCity);
        arrCity = await getCityName(arrCity);

      await Promise.all([depCity, arrCity]).then(()=>{
        return resp.send({flightInfo:respostaFuncio , depCity: depCity, arrCity: arrCity});
      });
});

}catch(e){
  console.log(e.toString());
}
})

  async function getCityName(iataAirport:string){
   let cityName = iataAirport;
   const optionCity = {
     method: 'GET',
     url: 'https://airport-info.p.rapidapi.com/airport',
     qs: {iata: iataAirport},
     headers: {
       'x-rapidapi-host': 'airport-info.p.rapidapi.com',
       'x-rapidapi-key': 'X_RAPID_API_KEY'
     }
     };

   return new Promise(function(resolve, reject){
     request.get(optionCity, cityName, function(error:any,something:any, body:any){
       if(error){
         console.log(error.toString());
         reject(error);
       }else{
         console.log(body);
         const airportInfo:Airport = Converting.toAirport(body);
         const cityInfo = {
           airportName: airportInfo.name,
           latitude: airportInfo.latitude,
           longitude: airportInfo.longitude,
         };

         resolve(cityInfo);
       }
     })
   })

 }
