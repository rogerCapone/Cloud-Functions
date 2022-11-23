
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



//Quan es registra un nou usuari Autentificat
exports.onUserWelcome = functions.auth.user().onCreate(async (user) => {

  let userName4Display:string;
  let userName:string;
  let userUID = user.uid;
  if(user.displayName !== null){
    if(user.displayName !== undefined){
    userName = user.displayName;
    userName4Display = userName;
    }else{
      userName4Display = 'Guest';
    }}else{
      userName4Display = 'Guest';
    }
    userUID.split('');
    userName = `${userName4Display.replace(/ /g,"")}${userUID[0]}${userUID[1]}${userUID[2]}${userUID[3]}`;
  return db.doc(`users/${user.uid}`).create({
    uid: userUID,
    userEmail: user.email,
    userName: user.displayName == null? 'Guest': user.displayName,
    nickName: `${userName4Display.replace(/ /g,"")}${userUID[0]}${userUID[1]}${userUID[2]}${userUID[3]}`,
    imgUrl: user.photoURL == null? 'https://cdn.pixabay.com/photo/2015/03/04/22/35/head-659651_1280.png': user.photoURL,
    frase: "I 🧡 🛫✈️ Travelling",
    backgroundColor: "Colors.blue",
    tokenId: "TOKEN_ID",
    following: [],
    followers: [],
    pendingToAccept:[],
    userWeb: "",
    phoneNumber: "",
    notificationsCount: 0,
    notificationsRegister: [],
    subscriptionsRegister: []
    //possibilitat d'afegir informació inicial al registre BD del usuari registrat
  }).then(()=>{
    if(user.email !== null){
    return db.doc('allUsers/usersDoc').set({
      totalUsers : admin.firestore.FieldValue.increment(+1),
      userList : admin.firestore.FieldValue.arrayUnion({
        uid: user.uid,
          img: user.photoURL == null? 'https://cdn.pixabay.com/photo/2015/03/04/22/35/head-659651_1280.png': user.photoURL,
        nickName: userName
      })
    }, {merge:true});
  }else{
    console.log('Anonimous users like u dont fit in our UserSystemList');
    return;
  }
  }).catch(err=>{
      console.log(err)
    })
  })
