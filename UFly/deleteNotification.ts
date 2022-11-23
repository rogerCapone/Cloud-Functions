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


exports.deleteNotification = functions.https.onRequest(async (req, resp) => {
  const uid = req.query.uid;
  const topic = `${req.query.org.toUpperCase()}-${req.query.dest.toUpperCase()}-${parseFloat(req.query.price)}-${req.query.dayInici}-${req.query.monthInici}-${req.query.yearInici}-${req.query.dayFinal}-${req.query.monthFinal}-${req.query.yearFinal}`
  let userToken:string;
  let elementToDelete = {
    dayFinal: parseInt(req.query.dayFinal),
    dayInici: parseInt(req.query.dayInici),
    dest: req.query.dest.toUpperCase(),
    monthFinal: parseInt(req.query.monthFinal),
    monthInici: parseInt(req.query.monthInici),
    orig: req.query.org.toUpperCase(),
    price: parseFloat(req.query.price),
    yearFinal: parseInt(req.query.yearFinal),
    yearInici: parseInt(req.query.yearInici),
  }
  console.log(elementToDelete);
  return db.doc(`users/${uid}`).get().then((user)=>{
    const userData = user.data();
    userToken = userData?.tokenId;
    console.log(userToken);
  }).then(()=>{
    return db.doc(`subscriptions/${topic}`).update({
      fcmTokens: admin.firestore.FieldValue.arrayRemove(userToken),
      subscribersUid: admin.firestore.FieldValue.arrayRemove(uid)
    }).then(()=>{
      return db.doc(`subscriptions/${topic}`).get().then((topicData)=>{
        const topicInfo = topicData.data();
        if(topicInfo?.fcmTokens.length === 0 && topicInfo.subscribersUid.length === 0){
          return db.doc(`topics/${topic}`).delete().then(()=>{
            return db.doc(`subscriptions/${topic}`).delete().then(()=>{
              return db.doc(`users/${uid}`).get().then((userData)=>{
                const userInfo = userData.data();
                const myTopics = userInfo?.subscriptionsRegister;
                console.log('MYTOPICS:', myTopics)
                for (let index = 0; index < myTopics.length; index++) {
                  console.log(myTopics[index].dayFinal, parseInt(req.query.dayFinal), myTopics[index].dayInici, parseInt(req.query.dayInici) , myTopics[index].dest, req.query.dest.toUpperCase(), myTopics[index].monthFinal,parseInt(req.query.monthFinal), myTopics[index].monthInici,parseInt(req.query.monthInici), myTopics[index].orig,req.query.org.toUpperCase(),parseFloat(myTopics[index].price),parseFloat(req.query.price), myTopics[index].yearFinal,parseInt(req.query.yearFinal), myTopics[index].yearInici,parseInt(req.query.yearInici))
                  if(myTopics[index].dayFinal == parseInt(req.query.dayFinal) && myTopics[index].dayInici== parseInt(req.query.dayInici) && myTopics[index].dest == req.query.dest.toUpperCase() && myTopics[index].monthFinal==parseInt(req.query.monthFinal) && myTopics[index].monthInici==parseInt(req.query.monthInici) && myTopics[index].orig==req.query.org.toUpperCase() && parseFloat(myTopics[index].price) == parseFloat(req.query.price) && myTopics[index].yearFinal==parseInt(req.query.yearFinal) && myTopics[index].yearInici==parseInt(req.query.yearInici)){
                    console.log('IM IN THE RIGHT ITERATION (:)');
                    return db.doc(`users/${uid}`).update({
                      subscriptionsRegister: admin.firestore.FieldValue.arrayRemove(myTopics[index])
                    }).then(()=>{
                      resp.send('User subscription was deleted ;)');
                    })
                  }
                }
                return;
              })

            })
          })
        }else{
           console.log('Still having subscriptions');
           return db.doc(`users/${uid}`).get().then((userData)=>{
             const userInfo = userData.data();
             const myTopics = userInfo?.subscriptionsRegister;
             console.log('MYTOPICS:', myTopics)
             for (let index = 0; index < myTopics.length; index++) {
               console.log(myTopics[index].dayFinal, parseInt(req.query.dayFinal), myTopics[index].dayInici, parseInt(req.query.dayInici) , myTopics[index].dest, req.query.dest.toUpperCase(), myTopics[index].monthFinal,parseInt(req.query.monthFinal), myTopics[index].monthInici,parseInt(req.query.monthInici), myTopics[index].orig,req.query.org.toUpperCase(),parseFloat(myTopics[index].price),parseFloat(req.query.price), myTopics[index].yearFinal,parseInt(req.query.yearFinal), myTopics[index].yearInici,parseInt(req.query.yearInici))
               if(myTopics[index].dayFinal == parseInt(req.query.dayFinal) && myTopics[index].dayInici== parseInt(req.query.dayInici) && myTopics[index].dest == req.query.dest.toUpperCase() && myTopics[index].monthFinal==parseInt(req.query.monthFinal) && myTopics[index].monthInici==parseInt(req.query.monthInici) && myTopics[index].orig==req.query.org.toUpperCase() && parseFloat(myTopics[index].price) == parseFloat(req.query.price) && myTopics[index].yearFinal==parseInt(req.query.yearFinal) && myTopics[index].yearInici==parseInt(req.query.yearInici)){
                 console.log('IM IN THE RIGHT ITERATION (:)');
                 return db.doc(`users/${uid}`).update({
                   subscriptionsRegister: admin.firestore.FieldValue.arrayRemove(myTopics[index])
                 }).then(()=>{
                   resp.send('User subscription was deleted ;)');
                 })
               }else{console.log('sorry')}
             }
             return;
           })
        }

      })
    })
  }).catch(console.error)

})
