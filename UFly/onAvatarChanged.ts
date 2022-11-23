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


exports.onAvatarChanged = functions.storage.object().onFinalize((event) =>{

  const object = event;
  const filePath = object.name;
  let userUid = filePath?.split('/')[1];
  console.log(`userUID 1st parse:   ${userUid}`);
  userUid = userUid?.split('/')[0];
  console.log(`userUID 2nd parse:   ${userUid}`);

  return db.doc(`users/${userUid}`).get().then((doc)=>{
    const docData = doc.data();
    const imgURL = docData?.imgUrl;
    console.log(`this is the new imgURL --> ${imgURL}`);
    return db.doc('allUsers/usersDoc').get().then((userDoc)=>{
      const usersData = userDoc.data();
      const userList = usersData?.userList;
      let userNickName:string='';
      let oldImg;
      for (let index = 0; index < userList.length; index++) {
        if(userList[index].uid === userUid){
           userNickName = userList[index].nickName;
           oldImg = userList[index].img;
        }
      }
      return db.doc('allUsers/usersDoc').update({
        userList : admin.firestore.FieldValue.arrayRemove({
          "img":oldImg,
          "nickName": userNickName,
          "uid":userUid,
        })
      }).then(()=>{
        console.log('USER IS GOING TO BE SAVED WITH NEW IMGURL ((:')
        return db.doc('allUsers/usersDoc').update({
          userList: admin.firestore.FieldValue.arrayUnion({
            "img":imgURL,
            "nickName": userNickName,
            "uid":userUid,
          })
        })

      })

    })
  }).catch(console.error)

})
