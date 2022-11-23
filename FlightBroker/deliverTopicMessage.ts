
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

  exports.deliverTopicMessage = functions.firestore.document('Topics/{topicName}').onUpdate((change, context)=>{
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
    const messageToSend =messageRecived;
    const route = arrMsg[0];
    const priceCurr = arrMsg[2];
    const link = arrMsg[1].toString().replace(' ','');
    const date = arrMsg[3] //Date format day/month/year 
    const msgToDisplay = 'Found: ' + route + ' for ' + priceCurr + ' on ' + date;





    // const priceCurr = arrMsg[2];
  
    const payload : admin.messaging.MessagingPayload ={
      notification: {
        title: 'New Trip',
        body: msgToDisplay,
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
      data : {
        shData: messageRecived
      }
    }
  
    return db.doc(`Subscriptions/${topic}`).get().then((data)=>{
      const docData = data.data();
      uidList  = docData?.subsUid;
      const tokenList = docData?.fcmTokens;
      for (let index = 0; index < tokenList.length; index++) {
        console.log(tokenList[index]);
      }
      console.log(payload);
      return fcm.sendToDevice(tokenList,payload);
    }).then(()=>{
      console.log('EY DONT WORRY 2MUCH')
      uidList.forEach((uid)=>{
        return db.doc(`Users/${uid}`).update({
          notificationsRegister: admin.firestore.FieldValue.arrayUnion({
            msg: messageToSend,
            deep_link: link,
            flight_date: date //Date format day/month/year 
          })
        })
      })
    })
  }else{
    //podria fer que msg_count es restes 1 per que aixi aprofitem per quan eliminem un msg manualment, auto es redueix el counter
    console.log('A message was deleted so no msg is send through FCMessaging (:');
    return;
  }
  
  })
