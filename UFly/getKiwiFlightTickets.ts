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


exports.getKiwiFlightTickets = functions.https.onRequest(async (req, resp) => {

  const origen = req.query.orig.toUpperCase();
  const destino = req.query.dest.toUpperCase();
  const date =`${req.query.day}/${req.query.month}/${req.query.year}`;    //'15/08/2020';
  console.log(date);
  const currency = 'EUR';
  const flight_type = 'oneway'; // 'round' --> with nights_in_dst of return date is given
  const direct_flights = 1; // 1 = YES, 0 = NO
  const adults = 1;
  const children = 0;
  const infants = 0;

  const kiwiOption = {
      method: 'GET',
      url: `https://api.skypicker.com/flights?fly_from=${origen}&fly_to=${destino}&date_from=${date}&partner=picky&curr=${currency}&direct_flights=${direct_flights}&flight_type=${flight_type}&adults=${adults}&children=${children}&infants=${infants}`,
      headers: {
      'content-type': 'application/json'
    }
  };

  let kTicket:KiwiTicket;
  let kTickets:KiwiTicket[] = new Array();
  let lowPrice:number[];

    try{
      await request(kiwiOption, async function(error:any, something:any, body:any){
          const kiwiResponse = Convertir.toKiwiResponse(body);
          const myData = kiwiResponse.data;



          if(myData !== undefined){
          for (let index = 0; index < myData.length; index++) {
            if(myData[index].availability?.seats !== null){
            let flightId =`${myData[index].airlines[0]}${myData[index].route[0].flight_no}`
            kTicket = new KiwiTicket(myData[index].airlines[0], flightId, myData[index].cityCodeFrom, myData[index].cityCodeTo, myData[index].cityFrom, myData[index].cityTo, myData[index].countryFrom.code, myData[index].countryTo.code, new Date(myData[index].dTime * 1000), new Date(myData[index].aTime * 1000), date, myData[index].fly_duration, myData[index].distance, myData[index].price, myData[index].availability.seats, myData[index].booking_token, myData[index].deep_link);
            kTickets.push({airline: kTicket.airline, flightId: kTicket.flightId, from: kTicket.from, to: kTicket.to, from_city: kTicket.from_city, to_city: kTicket.to_city, country_from: kTicket.country_from, country_to: kTicket.country_to, depTime: kTicket.depTime, arrTime: kTicket.arrTime, date: kTicket.date, duration: kTicket.duration, distance: kTicket.distance, price: kTicket.price, availability: kTicket.availability, bookingToken: kTicket.bookingToken, deep_link: kTicket.deep_link});
            }
            }
            //Ara aqui hauriem de publicar el MSG per a que es notifiqui als users --
            lowPrice = getLowestPrice(kTickets);
            console.log(lowPrice);
            await publishMessage(origen, destino, lowPrice[0], req.query.day, req.query.month, req.query.year, kTickets[lowPrice[1]].deep_link).then(()=>{
              console.log(kTickets)
              resp.send(kTickets);
            })
        }else{
          console.log('my data is equal to UNDEFINED');
          return;
        }
})
}catch(e){
  console.log(e.toString());
}})
