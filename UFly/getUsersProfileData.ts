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


exports.getUserProfileData = functions.https.onCall(async (data, context) => {

  const reqUser = data.uid;
  const getUid = data.getUid;

  return db.doc(`users/${getUid}`).get().then((userInfo)=>{
    const userData = userInfo.data();
    // if(userData?.followers.length == 0){
    //   return {
    //     nickName: userData?.nickName,
    //     imgUrl: userData?.imgUrl,
    //     backgroundColor: userData?.backgroundColor,
    //     frase: userData?.frase,
    //     followers: userData?.followers,
    //     following: userData?.following,
    //     friendOrNot: "false"
    //   };
    // }
    for (let index = 0; index < userData?.followers.length; index++) {
      if(userData?.followers[index] == reqUser){
        return {
          nickName: userData?.nickName,
          imgUrl: userData?.imgUrl,
          backgroundColor: userData?.backgroundColor,
          frase: userData?.frase,
          followers: userData?.followers,
          following: userData?.following,
          friendOrNot: "true"
        };
      }
    }
    for (let index = 0; index < userData?.pendingToAccept.length; index++) {
      if(userData?.pendingToAccept[index] == reqUser){
        return {
          nickName: userData?.nickName,
          imgUrl: userData?.imgUrl,
          backgroundColor: userData?.backgroundColor,
          frase: userData?.frase,
          followers: userData?.followers,
          following: userData?.following,
          friendOrNot: "pendent"
        };
      }
    }
      return {
        nickName: userData?.nickName,
        imgUrl: userData?.imgUrl,
        backgroundColor: userData?.backgroundColor,
        frase: userData?.frase,
        followers: userData?.followers,
        following: userData?.following,
        friendOrNot: "false"
      };
    })
})
