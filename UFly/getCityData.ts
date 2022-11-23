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


exports.getCityData = functions.https.onRequest(async (req,resp)=>{
  let t0 = now();
  const cityName = req.query.city;
  const optionCity = {
      method: 'GET',
      url: `https://api.teleport.org/api/cities/?search=${cityName}&embed=city:search-results/city:item/city:country&embed=city_search-results[0]/city:item`,
      headers: {
        "templated": true
      }};

    try{
      await request(optionCity,  async function(error:any,something:any, body:any){
       const jsonDoc = JSON.parse(body);
       let t1 = now()
       console.log('Time to get Teleport Data: '+ (t0-t1).toFixed(3));
       const vari = jsonDoc._embedded["city:search-results"];
       const vari2 = vari[0]._embedded["city:item"];
       const scoreUrl = vari2._links["city:urban_area"].href;

        const scoreData = await getCityScores(scoreUrl);
        const images = await getCityImages(cityName);

      await Promise.all([scoreData, images]).then(()=>{
        let t2 = now()
        console.log('Time to get send resp: ' + (t2-t0).toFixed(3));
        resp.send({
          cityName: vari2.name,
          cityPopulation: vari2.population,
          cityGeoname_id: vari2.geoname_id,
          countryName: vari2._embedded["city:country"].name,
          countryIso3: vari2._embedded["city:country"].iso_alpha3,
          countryPopulation: vari2._embedded["city:country"].population,
          countryCurrency: vari2._embedded["city:country"].currency_code,
          countryGeoname_id: vari2._embedded["city:country"].geoname_id,
          scoreData: scoreData,
          images: images
          })
        })
      })
  }catch(e){
    console.log(e.toString());
  }
})

  async function getCityScores(url:string):Promise<ScoreData>{
    let t3 = now();
    const cityUrl = {
      method: 'GET',
      url: url + 'scores', 
    }

    return new Promise(function(resolve, reject){
      request.get(cityUrl, function(error:any,something:any, body:any){
        if(error){
          console.log(error.toString());
          reject(error);
        }else{
          const data = JSON.parse(body);
          let summ = data.summary.replace(/<\/?[^>]+(>|$)/g,'');
          summ = summ.replace(/[\n\r]/g,'');
          summ = summ.replace('   ','');
          const jsonCat = Conversion.scoreToJson(data.categories);
          const cat = Conversion.toScore(jsonCat);
          const resolving = {
            scoreInfo : cat,
            summary   : summ
          }
          let t4 = now()
          console.log('Time to resolve City Scores: '+ (t4-t3).toFixed(3));
          resolve(resolving);
        }
      })
    })
  }

  async function getCityImages(cityName:string){
    let t5 = now()
    const imgNum = 7;
    const imgUrl = {
        method: 'GET',
        url: `https://api.pexels.com/v1/search?query=${cityName}&per_page=${imgNum}&page=1`,
        headers: {
          'Authorization': 'AUTH_KEY',
        }
      }

    return new Promise(function(resolve, reject){
      request.get(imgUrl, function(error:any,something:any, body:any){
        if(error){
          console.log(error.toString());
          reject(error);
        }else{
          const data = JSON.parse(body);
          let picsArr:string[] = [];
          for (let i = 0; i < data.photos.length; i++) {
            if(i == 6 || data.photos[i] == null || data.photos[i] == undefined){
              break;
            }
            picsArr.push(data.photos[i].src.portrait);
          }
          let t6 = now()
          console.log('Time to resolve Pexel Images: '+ (t6-t5).toFixed(3));
          resolve(picsArr);
        }
      })
    })
  }
