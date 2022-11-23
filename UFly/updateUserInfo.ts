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


exports.updateUserInfo = functions.https.onCall(async (data, context:any)=> {
  const userId = context.auth.uid.toString();
  const reqUser = data.uid.toString(); //ON REQUEST: req.query.uid;
  const nickName = data.nickName;      //ON REQUEST: req.query.nickName;
  const userName = data.userName;//req.query.userName;
  const frase = data.frase;//req.query.frase;
  const phoneNumber = data.phoneNumber;//req.query.phoneNumber;
  const userWeb = data.userWeb;//req.query.userWeb;
  let notFound = true; //si el trobo aleshores --> FALSE
  console.log(userId, reqUser, nickName, userWeb, userName, phoneNumber, frase);

  if(userId === reqUser){

    return new Promise((resolve, reject)=>{
      return db.doc('allUsers/usersDoc').get()
     .then((usersDoc) => {
       const usersList =  usersDoc.data()?.userList;
       for (let i = 0; i < usersList.length; i++) {
           if(usersList[i].nickName === nickName && usersList[i].uid !== reqUser){
             console.log(`${usersList[i].nickName} == ${nickName} (?)`)
             notFound = false;
           }
            console.log(i);
       }
       if(notFound == true){
         console.log('not Found == TRUE');
         return notFound;
       }else{
         return notFound;
       }
     }).then(async(found)=>{
       console.log(found);
       if(found === true){
         console.log('going toChangeList');
         const p1 = await changeFromList(reqUser, nickName);
         console.log('going toChangeUser');
         const p2 = await changeFromUser(reqUser, nickName);
         return Promise.all([p1,p2]).then(async()=>{
           console.log(userWeb, userName, phoneNumber, frase);
           await db.doc(`users/${reqUser}`).update({
             userWeb: userWeb.toString(),
             userName: userName.toString(),
             phoneNumber: phoneNumber.toString(),
             frase: frase.toString()
           }).then(()=>{
             console.log('TOT A ANAT PERFECTE');
             resolve(true);
             });
         })
       }else{
         console.log('EUREKA arribo aqui (:');
         resolve(false);
       }

     });

   }).then((val)=>{
     console.log(val);
     return val;
   })
}else{
  return 'GLMF';
}})
         
 async function changeFromList(uid:string, newNickName:string){
    let img:any;
    let oldNickName:string;
    // let counter=0;
    return db.doc('allUsers/usersDoc').get().then((list)=>{

      const mylist = list.data()?.userList;
      for (let index = 0; index < mylist.length; index++) {
        if(mylist[index].uid == uid){
          img = mylist[index].img;
          oldNickName = mylist[index].nickName;
        }
        // counter++;
      }

      return db.doc('allUsers/usersDoc').update({
        userList : admin.firestore.FieldValue.arrayRemove({
          "img":img,
          "nickName": oldNickName,
          "uid":uid,
        })
      }).then(()=>{
        return db.doc('allUsers/usersDoc').update({
          userList: admin.firestore.FieldValue.arrayUnion({
            "img":img,
            "nickName": newNickName == null? oldNickName : newNickName,
            "uid":uid,
          })
        })

      })

    });

  }

  async function changeFromUser(uid:string, newNickName:string){
    if(newNickName !== null){
    return db.doc(`users/${uid}`).update({
      nickName: newNickName
    });
  }else{
      return;
    }
  }
