
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

  exports.shouldDeleteTopicBasedOnSubs = functions.firestore.document('Subscriptions/{topicName}').onUpdate((change, context)=>{
    const topic = context.params.topicName;
    const newValue = change.after.data();    

    const fcmTokens = newValue?.fcmTokens;
    const subsUids = newValue?.subsUids;

    if(fcmTokens.length == 0 && subsUids == 0){
      return db.doc(`Topics/${topic}`).delete().then(()=>{
        return db.doc(`Subscriptions/${topic}`).delete();
      })
    }else{
      return;
    }
  })
