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


exports.deliverTopicMessage = functions.firestore.document('topics/{topicName}').onUpdate((change, context)=>{
  const topic = context.params.topicName;
  const newValue = change.after.data();
  const oldValue = change.before.data();
  const message = newValue?.messages;
  const oldCounter = oldValue?.msg_count;
  const newCounter = newValue?.msg_count;
  let uidList:[];
  if(newCounter > oldCounter){
  const messageRecived = message.pop();
  const arrMsg = messageRecived.split('||');
  const messageToSend = arrMsg[0];
  const link = arrMsg[1];
  console.log(arrMsg);

  const payload : admin.messaging.MessagingPayload ={
    notification: {
      title: 'Your Trip',
      body: messageToSend,
      icon: 'https://cdn.clipart.email/9d52b5a36143d2fd830cce1f67bf82bf_universal-holiday-travel-route-world-travel-vacation-travel-png-_650-651.jpeg',
      clickAction: 'FLUTTER_NOTIFICATION_CLICK'
    }
  }

  return db.doc(`subscriptions/${topic}`).get().then((data)=>{
    const docData = data.data();
    uidList  = docData?.subscribersUid;
    const tokenList = docData?.fcmTokens;
    for (let index = 0; index < tokenList.length; index++) {
      console.log(tokenList[index]);
    }
    console.log(payload);
    return fcm.sendToDevice(tokenList,payload);
  }).then(()=>{
    console.log('EY DONT WORRY 2MUCH')
    uidList.forEach((uid)=>{
      return db.doc(`users/${uid}`).update({
        notificationsCount: admin.firestore.FieldValue.increment(+1),
        notificationsRegister: admin.firestore.FieldValue.arrayUnion({
          msg: messageToSend,
          deep_link: link
        })
      })
    })
  })
}else{
  console.log('A message was deleted so no msg is send through FCMessaging (:');
  return;
}

})
