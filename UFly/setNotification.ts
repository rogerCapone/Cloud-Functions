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


exports.setNotification = functions.https.onRequest(async (req, resp)=>{

  //Per a simplificar podríem introduir aquests parametres directament a la creació del TOPIC
  const uid = req.query.uid;

  const newTopic = `${req.query.orig.toUpperCase()}-${req.query.dest.toUpperCase()}-${parseFloat(req.query.price)}-${req.query.dayInici}-${req.query.monthInici}-${req.query.yearInici}-${req.query.dayFinal}-${req.query.monthFinal}-${req.query.yearFinal}`;

  // if(uid == reqUid){

  const userData = await db.doc(`users/${uid}`).get();

  Promise.all([userData]).then(()=>{
    const tokenId = userData.data()?.tokenId;

    return db.doc(`topics/${newTopic}`).get().then((doc)=>{
      if (!doc.exists) {
       console.log('No topics, so lets CREATE IT!');
       return db.doc(`topics/${newTopic}`).create({
         messages: [],
         msg_count: 0
       }).then(()=>{
         return db.doc(`subscriptions/${newTopic}`).create({
           subscribersUid: [uid],
           fcmTokens: [tokenId]
         }).then(()=>{
           return db.doc(`users/${uid}`).update({
             subscriptionsRegister: admin.firestore.FieldValue.arrayUnion({
               orig: req.query.orig.toUpperCase(),
               dest: req.query.dest.toUpperCase(),
               price: parseFloat(req.query.price),
               dayInici: parseInt(req.query.dayInici),
               monthInici: parseInt(req.query.monthInici),
               yearInici: parseInt(req.query.yearInici),
               dayFinal: parseInt(req.query.dayFinal),
               monthFinal: parseInt(req.query.monthFinal),
               yearFinal: parseInt(req.query.yearFinal)
             })
           }).then(()=>{
              resp.send('TOPIC CREATED, USER SUBSCRIBE IT & user has recorded (:');
           })
         })
       })

     } else {
       console.log('We found the document, so lets SUBSCRIBE to TOPIC');
       return db.doc(`subscriptions/${newTopic}`).update({
         subscribersUid: admin.firestore.FieldValue.arrayUnion(uid),
         fcmTokens: admin.firestore.FieldValue.arrayUnion(tokenId)
       }).then(()=>{
         return db.doc(`users/${uid}`).update({
           subscriptionsRegister: admin.firestore.FieldValue.arrayUnion({
             orig: req.query.orig.toUpperCase(),
             dest: req.query.dest.toUpperCase(),
             price: parseFloat(req.query.price),
             dayInici: req.query.dayInici,
             monthInici: req.query.monthInici,
             yearInici: req.query.yearInici,
             dayFinal: req.query.dayFinal,
             monthFinal: req.query.monthFinal,
             yearFinal: req.query.yearFinal
           })
         }).then(()=>{
           resp.send('USER WAS SUBSCRIBED, TOPIC WAS ALREADY CREATED (:')
         })
       })

     }
    });

  }).catch(console.error);


// }else{
//   resp.send('GLMF');
// }

})
