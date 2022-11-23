import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';



const request = require("request");
const access_key = 'ACCESS_KEY';
import {ArrivalTimeTable} from './ArrivalTimeTable';
//import {Airport} from './Airport';


admin.initializeApp();
const db = admin.firestore();

export class Convertion {
    public static toArrivalTimeTable(json: string): ArrivalTimeTable {
        return JSON.parse(json);
    }
}

exports.getAirportInfo = functions.https.onRequest(async (req, resp)=>{
  const airport = req.query.airport;
  const optionCity = {
    method: 'GET',
    url: `https://cometari-airportsfinder-v1.p.rapidapi.com/api/cities/by-airports?code=${airport}`,
    headers: {
      'x-rapidapi-key': 'X-RAPID-API-KEY',
        'content-type': 'application/json',
    }
  };

  await request(optionCity, async function(error:any,something:any, body:any){
    console.log(body);
    const airportInfo = body;
    const arrivals = await getAirportArrivals(airport);
    const departures = await getAirportDepartures(airport);

    await Promise.all([arrivals, departures]).then(()=>{
      resp.send({airportInfo: airportInfo, airportDepartures: departures, airportArrivals: arrivals});

    })


  })
})

async function getAirportDepartures(airport:string){

  const limit = 50;
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
        console.log(body);
        const airportInfo:ArrivalTimeTable = Convertion.toArrivalTimeTable(body);
        const departures = airportInfo.data;

        resolve(departures);
      }
    })
  })

}



async function getAirportArrivals(airport:string){

  const limit = 50;
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
        console.log(body);
        const airportInfo:ArrivalTimeTable = Convertion.toArrivalTimeTable(body);
        const arrivals = airportInfo.data;

        resolve(arrivals);
      }
    })
  })

}
