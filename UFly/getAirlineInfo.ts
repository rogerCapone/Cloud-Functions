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


exports.getAirlineInfo = functions.https.onRequest(async (req, resp)=>{

  let airlineSearch:string = req.query.airline;

  //Change REQUEST 2 Firebase CLOUDSTORE query
  const optionAirline = {
      method: 'GET',
      url: `http://api.aviationstack.com/v1/airlines?access_key=${access_key}`,
      headers: {
      'content-type': 'application/json'
    }
  };

  try{
    await request(optionAirline, function(error:any, notShadow:any, body:any){
        const airlinesDoc = Converted.toAirlines(body);
        console.log(airlinesDoc);
        const airlinesList = airlinesDoc.data;
        let i = 0;
        let trobat = 0;
        while(i < airlinesList.length && trobat == 0){
          let anal = airlinesList[i].airline_name;
          console.log(anal + ' ' + i);
          if(anal.toLowerCase() == airlineSearch.toLowerCase()){
            console.log(airlinesList[i].toString());
            trobat = 1;
          }else{
            i++;
          }
        }
        if(trobat === 1){
          return resp.send({airlineData: airlinesList[i]});
        }else{
          return resp.send({airlineData: 'NO match found'});
        }
    })
  }catch(e){
    console.log(e.toString());
  }

})
