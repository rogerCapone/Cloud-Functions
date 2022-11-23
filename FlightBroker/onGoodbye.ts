
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


exports.onUserGoodbye = functions.auth.user().onDelete((user, context)=>{
      return db.doc(`Users/${user.uid}`).delete();
  })
