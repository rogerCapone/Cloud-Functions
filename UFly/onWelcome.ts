import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const request = require("request");

import {KiwiTicket} from './kiwiTickets';
import {KiwiResponse} from './kiwiResponse';




admin.initializeApp();
const db = admin.firestore();
const fcm = admin.messaging();



export class Convertir {
  public static toKiwiResponse(json: string): KiwiResponse {
      return JSON.parse(json);
  }}


exports.onUserWelcome = functions.auth.user().onCreate(async (user) => {
  

    return db.doc(`Users/${user.uid}`).create({
      uid: user.uid,
      userEmail: user.email,
      displayName: !user.displayName? user.displayName: user.email?.split('@')[0],
      tokenId: "",
      pendingToAccept:[],
      photoUrl: user.photoURL,
      myComms: [],
      planSubscription: 0,
      notificationsRegister: [],
      subscriptionsRegister: []
    }).then(()=>{
  
      return db.doc('allUsers/usersDoc').set({
        totalUsers : admin.firestore.FieldValue.increment(+1),
        userList : admin.firestore.FieldValue.arrayUnion({
          uid: user.uid,
          photoUrl: user.photoURL,
          displayName: user.displayName
        })
      }, {merge:true});
  
    }).catch(err=>{
        console.log(err)
      })
    })
