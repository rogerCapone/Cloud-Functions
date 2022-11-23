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


//Quan eliminem o l'usuari desitja eliminar la seva conta
exports.onUserGoodbye = functions.auth.user().onDelete((user, context)=>{
  const uid = user.uid;
  let followers:[];
  let following:[];
  let subscriptions:[];
  let tokenId:string;
  let imgUrl:string;
  let subscripcio:string;

  return db.doc(`users/${uid}`).get().then((userDoc)=>{
    const data = userDoc.data();
    followers = data?.followers;
    following = data?.following;
    subscriptions = data?.subscriptionsRegister;
    tokenId = data?.tokenId;
    imgUrl = data?.imgUrl;
  }).then(()=>{
    return db.doc(`users/${user.uid}`).delete().then(()=>{
      return db.doc('allUsers/usersDoc').get().then((list)=>{
        let img;
        let nickName;
        let found = false;
        const userList = list.data()?.userList;
        for (let index = 0; index < userList.length; index++) {
            if(userList[index].uid === uid){
               img = userList[index].img;
               nickName = userList[index].nickName;
              found = true;
            }
        }
        if(found == true){
          console.log(`DELETING USER: ${uid}`);
          return db.doc('allUsers/usersDoc').update({
            totalUsers: admin.firestore.FieldValue.increment(-1),
            userList: admin.firestore.FieldValue.arrayRemove({
              "img":img,
              "nickName":nickName,
              "uid":uid,
            })
          })
        }else{
          return;
        }
      }).then(()=>{
        followers.forEach((follower)=>{
          return db.doc(`users/${follower}`).update({
            following: admin.firestore.FieldValue.arrayRemove(uid)
          })
        })
        following.forEach((followed)=>{
          return db.doc(`users/${followed}`).update({
            followers: admin.firestore.FieldValue.arrayRemove(uid)
          })
        })
        }).then(()=>{
          console.log(subscriptions);
          if(subscriptions !== undefined){
          subscriptions.forEach((subscripcioElement:any)=>{
           subscripcio = `${subscripcioElement.orig}-${subscripcioElement.dest}-${subscripcioElement.price}-${subscripcioElement.dayInici}-${subscripcioElement.monthInici}-${subscripcioElement.yearInici}-${subscripcioElement.dayFinal}-${subscripcioElement.monthFinal}-${subscripcioElement.yearFinal}`;
           console.log(subscripcio);
            return db.doc(`subscriptions/${subscripcio}`).update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(tokenId),
              subscribersUid: admin.firestore.FieldValue.arrayRemove(uid)
            })
          })
        }else{
            return;
          }
        }).then(()=>{
          if(imgUrl !== 'https://cdn.pixabay.com/photo/2015/03/04/22/35/head-659651_1280.png'){
          const path = `users/${uid}/avatar.png`;

          const bucket = storage.bucket('never-lost-1e5c9.appspot.com');
          const file = bucket.file(path)
          return file.delete().then(()=>{
            console.log('Everything was fine 🤭🙈');
            return;
          })
        }else{
          return;
        }
        })
      })

  }).catch(console.error);

})
