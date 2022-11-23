import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

//?My imports
// import { testDOGEAPI, testLTCAPI, testBTCAPI, pinCode } from './keys/keys';
import { pinCode, fakeDOGEAPI } from './keys/keys';

import { AddressBalanceConversion, AddressBalance } from './models/addressBalance';
import { FeeConversion, Fee } from "./models/fee";
import { CollectMoney, CollectMoneyConversion } from './models/collectMoney';
import { NewWalletConversion, NewWallet } from "./models/newWallet";
import { anualDoge, monthDoge } from "./tariffs/tariff";
import { invites1Month, invites3Month, invitesYear, totalInvites } from './config/invites';
import { freeInvites1Month, freeInvites3Month, freeInvitesYear, freeTotalInvites } from './config/invites';
// import { ConvertToFiat, FiatPayment } from "./models/app/fiatPayment";


// import { testDogeAddress, hideDogeAddress} from './hideWallets/hideWallets'; //!TESTING --> REAL
import { testDogeAddress } from './hideWallets/hideWallets'; //!TESTING --> REAL
// import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
// // import { firebaseConfig } from 'firebase-functions';
//?End -- My imports

const Crypto = require("crypto-js");

//?CryptoManagement
const BlockIo = require('block_io');
//TODO: APIKEY real
// const doge_io = new BlockIo(finalDOGEAPI);
//! Canviar testDogeAddress --> hideDogeAddress
//! Recepció de pagaments
//*  APIKEY Test
const doge_io = new BlockIo(fakeDOGEAPI);


// const ltc_io = new BlockIo(finalLTCAPI);
// const btc_io = new BlockIo(finalBTCAPI);
//?End -- CryptoManagement

admin.initializeApp();
const db = admin.firestore();
const fcm = admin.messaging();

//!! NOTES
//* Payment change --> Review the creation of user wallets
//* Payment change --> Change the subscription days (6 Months and 12 Months)
//* Payment change --> Change crypto Networks API-KEYS
//* Payment change --> Change the QTTs of the currency to be collected
//* Payment change --> Change the address of the HIDE WALLET


//? already Uploaded
exports.deliverHide = functions.region('europe-west1').firestore.document('HotInbox/{docId}').onCreate(async snapshot => {
  const message = snapshot.data();
  let hasIt = false;
  console.log(message.toString());
  //? Per tornar a encryptar::: var encrypted = Crypto.AES.encrypt("Message", "CuulEncryption").toString();
  //?Encrypt
  //? var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();

  if (message.payload != null) {
    console.log('message PreDecrypted');
    var bytes = Crypto.AES.decrypt(message.payload, "someKey");
    var myCodedData = bytes.toString(Crypto.enc.Utf8);
    var body;

    console.log(myCodedData);
    console.log('message Decrypted');

    var decrypted = myCodedData.split('|||');
    // decrypted[0]; //! (string) senderUID;
    // decrypted[1]; //! (string) reciverUID;
    // decrypted[2]; //! (bool)   image;
    // decrypted[3]; //! (string)   imageUrl;
    // decrypted[4]; //! (string)  msg;
    // decrypted[5]; //! (string)  sendAt;
    // decrypted[6]; //! (string)  sendByName;
    // decrypted[7]; //! (string)  senderPic;



    const reciverInboxRef = db.doc(`Users/${decrypted[1]}`).path;
    const reciverDoc = await db.doc(`Users/${decrypted[1]}`).collection('appData').doc(decrypted[1] + decrypted[1].length.toString()).get();
    const reciverInbox = (await (db.doc(`Users/${decrypted[1]}`).get())).data();
    const tokenId = reciverDoc.data()?.tokenId;
    let contactList = [];
    let contactName;
    let contactPic;
    contactList = reciverDoc.data()?.contacts;
    for (let index = 0; index < contactList.length; index++) {
      if (contactList[index].uid == decrypted[0]) {
        contactName = contactList[index].userName;
        contactPic = contactList[index].photoUrl;
        hasIt = true;
      }
    }

    if (hasIt == false) {
      //*El user no el te agregat a contactos
      await db.doc(reciverInboxRef).update({
        inbox: admin.firestore.FieldValue.arrayUnion(message.payload),
      });
    } else {
      //*El user el te agregat a contactos
      let newPayload = decrypted[0].toString() + '|||' + decrypted[1].toString() + '|||' + decrypted[2].toString() + '|||' + decrypted[3].toString() + '|||' + decrypted[4].toString() + '|||' + decrypted[5].toString() + '|||' + contactName.toString() + '|||' + contactPic.toString();
      const encryptedNewPayload = Crypto.AES.encrypt(newPayload, 'someKey').toString();
      await db.doc(reciverInboxRef).update({
        inbox: admin.firestore.FieldValue.arrayUnion(encryptedNewPayload),
      });
    }

    await db.doc(`Users/${decrypted[1]}`).collection('appData').doc(decrypted[1] + decrypted[1].length.toString()).update({
      recivedMsgs: admin.firestore.FieldValue.increment(1)
    });

    if (reciverDoc != null) {


      if (reciverDoc.data()?.sendNotifications == true) {
        if (reciverInbox?.inbox.length == 0) {
          body = `${reciverDoc.data()?.userName}, 1 Hide`;
        } else {
          body = `${reciverDoc.data()?.userName}, ${reciverInbox?.inbox.length} new Hiddes`;
        }
        const payload: admin.messaging.MessagingPayload = {
          notification: {
            title: `Hide Informa`,
            body: body,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            tag: "Hide", //?Change to 'NewMessage'
          }
        }
        await db.doc(snapshot.ref.path).delete();
        await db.doc('AppData/appGlobals').update({
          totalHidesDelivered: admin.firestore.FieldValue.increment(1)
        });
        return fcm.sendToDevice([tokenId], payload);

      } else {
        console.log(reciverDoc.data()?.userName);
        console.log(decrypted[1]);
        console.log('Prefers to take things quitely 🤫🔇');
        await db.doc(snapshot.ref.path).delete();
        await db.doc('AppData/appGlobals').update({
          totalHidesDelivered: admin.firestore.FieldValue.increment(1)
        });
        return;
      }

    } else {
      console.log('Reciver Doc == NULL?!');
      return;
    }

  } else {
    console.log('Message Payload == NULL?!')
    return;

  }

})
