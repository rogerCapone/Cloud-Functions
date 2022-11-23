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


export const getAirportInfo = functions.https.onRequest(async (req, resp)=>{

  const airport = req.query.airport;
  const optionCity = {
    method: 'GET',
    url: 'https://airport-info.p.rapidapi.com/airport',
    qs: {iata: airport},
    headers: {
      'x-rapidapi-host': 'airport-info.p.rapidapi.com',
      'x-rapidapi-key': 'X_RAPID_API_KEY'
    }
  };

  await request(optionCity, async function(error:any,something:any, body:any){
    const airportInfo:Airport = Converting.toAirport(body);
    const myInfo = airportInfo;
    const arrivals = await getAirportArrivals(airport);
    const departures = await getAirportDepartures(airport);

    await Promise.all([arrivals, departures]).then(()=>{
      resp.send({airportInfo: myInfo, airportDepartures: departures, airportArrivals: arrivals});

    })
  })
})

  async function getAirportDepartures(airport:string){

    const limit = 20;
    const optionAirport = {
        method: 'GET',
        url: `http://api.aviationstack.com/v1/flights?access_key=${access_key}&limit=${limit}&dep_iata=${airport}&flight_status=active`, 
      }

    return new Promise(function(resolve, reject){
      request.get(optionAirport, airport, function(error:any,something:any, body:any){
        if(error){
          console.log(error.toString());
          reject(error);
        }else{
          const airportInfo:ArrivalTimeTable = Convertion.toArrivalTimeTable(body);
          let departures = airportInfo.data;
          console.log('DEPARTURES');
          console.log(departures);
          if(departures === undefined){
            console.log('I got departures === undefined');
            return;
          }else{
          departures.sort(function (a,b){
            let h1 = new Date(a.departure.estimated).getTime();
            let h2 = new Date(b.departure.estimated).getTime();
            if(h1 > h2){
              return 1;}
            if(h1 < h2){
            return -1;}
            return 0;
          });

          resolve(departures);
        }}
      })
    })

  }


  async function getAirportArrivals(airport:string){

    const limit = 20;
    const optionAirport = {
        method: 'GET',
        url: `http://api.aviationstack.com/v1/flights?access_key=${access_key}&limit=${limit}&arr_iata=${airport}&flight_status=active`, //AQUI VAN LES HORES PER ACOTAR-HO
      }

    return new Promise(function(resolve, reject){
      request.get(optionAirport, airport, function(error:any,something:any, body:any){
        if(error){
          console.log(error.toString());
          reject(error);
        }else{
          const airportInfo:ArrivalTimeTable = Convertion.toArrivalTimeTable(body);
          const arrivals = airportInfo.data;
          console.log('ARRIVALS');
          console.log(arrivals);

          if(arrivals === undefined){
            console.log('I got arrivals === undefined');
            return;
          }else{
          arrivals.sort(function (a,b){
            let h1 = new Date(a.arrival.estimated).getTime();
            let h2 = new Date(b.arrival.estimated).getTime();
            if(h1 > h2){
              return 1;}
            if(h1 < h2){
            return -1;}
            return 0;
          });

          resolve(arrivals);
        }}
      })
    })

  }
