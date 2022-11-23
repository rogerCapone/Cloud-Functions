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
exports.newHideMember = functions.region('europe-west1').https.onCall(async (data, context) => {
  const supUid = data.uid;
  const hideHashy = data.hideHash;
  var bytes = Crypto.AES.decrypt(hideHashy, "someKey");

  var myCodedData = bytes.toString(Crypto.enc.Utf8);
  var decrypted = myCodedData.split('-|||-');
  const hideHash = decrypted[0];
  const subscription = decrypted[1];

  if (context.auth?.uid == supUid) {

    //?Evaluar si existeix, te invites de aquell tipus encara 
    let invitacio = await db.collection('HideHash').doc(hideHash).get();
    const n_inv1Month = invitacio.data()?.invites1Month;
    const n_inv3Month = invitacio.data()?.invites3Month;
    // const n_invYear  = invitacio.data()?.invitesYear;
    if (subscription == 1) {
      if (n_inv1Month > 0) {
        await db.collection('HideHash').doc(hideHash).update({
          invites1Month: admin.firestore.FieldValue.increment(-1),
          inviteCounter: admin.firestore.FieldValue.increment(-1)
        });
        let startTS = Math.floor(Date.now() / 1000);
        let endTS = new Date().getTime() + (5 * 86400000);
        await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
          subcriptionStart: startTS,
          subcriptionEnd: endTS,
          amount: 1,
          coin: '🍫',
          paymentDate: startTS,
          uid: supUid,
          txId: 'hideGift'//? Aquesta es la que fem per nosaltres
        });
        await db.collection('Invoices').doc(supUid).update({
          invoices: admin.firestore.FieldValue.arrayUnion({
            subcriptionStart: startTS,
            subcriptionEnd: endTS,
            amount: 1,
            coin: '🍫',
            paymentDate: startTS,
            uid: supUid,
            txId: 'hideGift'
          })
        });
        let myinviteLink = (supUid.substring(2, 7).toString() + 'HT' + supUid.substring(2, 3).toString() + 'Hh' + supUid.substring(1).toString()).replace('/', '');
        await db.collection('HideHash').doc(myinviteLink).set({
          invites1Month: freeInvites1Month,
          invites3Month: freeInvites3Month,
          invitesYear: freeInvitesYear,
          offered1Month: freeInvites1Month,
          offered3Month: freeInvites3Month,
          offeredYear: freeInvitesYear,
          uid: supUid,
          inviteCounter: freeTotalInvites,
          offeredCounter: freeTotalInvites
        });
        await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).set({
          inviteLink: myinviteLink,
        }, { merge: true }
        );
        return true;
      } else {
        return false;
      }
    } else if (subscription == 2) {
      if (n_inv3Month > 0) {
        await db.collection('HideHash').doc(hideHash).update({
          invites3Month: admin.firestore.FieldValue.increment(-1),
          inviteCounter: admin.firestore.FieldValue.increment(-1)

        });
        let startTS = Math.floor(Date.now() / 1000);
        let endTS = new Date().getTime() + (21 * 86400000);
        await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
          subcriptionStart: startTS,
          subcriptionEnd: endTS,
          amount: 2,
          coin: '🍫',
          paymentDate: startTS,
          uid: supUid,
          txId: 'hideGift'//? Aquesta es la que fem per nosaltres
        });
        await db.collection('Invoices').doc(supUid).update({
          invoices: admin.firestore.FieldValue.arrayUnion({
            subcriptionStart: startTS,
            subcriptionEnd: endTS,
            amount: 1,
            coin: '🍫',
            paymentDate: startTS,
            uid: supUid,
            txId: 'hideGift'
          })
        });
        let myinviteLink = (supUid.substring(2, 7).toString() + 'HT' + supUid.substring(2, 3).toString() + 'Hh' + supUid.substring(1).toString()).replace('/', '');
        await db.collection('HideHash').doc(myinviteLink).set({
          invites1Month: freeInvites1Month,
          invites3Month: freeInvites3Month,
          invitesYear: freeInvitesYear,
          offered1Month: freeInvites1Month,
          offered3Month: freeInvites3Month,
          offeredYear: freeInvitesYear,
          uid: supUid,
          inviteCounter: freeTotalInvites,
          offeredCounter: freeTotalInvites

        });
        await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).set({
          inviteLink: myinviteLink,
        }, { merge: true }
        );
        return true;
      } else {
        return false;
      }
      // }else if(subscription==3){
      //   if(n_invYear>0){
      //     await db.collection('HideHash').doc(hideHash).update({
      //       invitesYear: admin.firestore.FieldValue.increment(-1),
      //inviteCounter: admin.firestore.FieldValue.increment(-1)
      //     });
      //     let startTS =Math.floor(Date.now()/1000); 
      //     let endTS=new Date().getTime() + (365*86400000);
      //       await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      //                 subcriptionStart: startTS,
      //                 subcriptionEnd: endTS,
      //                 amount: 12,
      //                 coin: '🍫',
      //                 paymentDate:startTS,
      //                 uid:supUid,
      //                 txId: 'hideGift'//? Aquesta es la que fem per nosaltres
      //               });
      //       await db.collection('HideHash').doc((data.hideHash.substring(7).toString()+supUid+'Hh'+data.hideHash.substring(4,12).toString()).toString()).set({
      //                 invites1Month:freeInvites1Month,
      //                 invites3Month:freeInvites3Month,
      //                 invitesYear:freeInvitesYear,
      //                 uid:supUid,
      //                 inviteCounter: freeTotalInvites
      //               });
      //       await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      //                 inviteLink:((data.hideHash.substring(7).toString()+supUid+'Hh'+data.hideHash.substring(4,12).toString()).toString()).toString(),
      //               },{merge:true}
      //               );
      //     return true;
      //   }else{
      //     return false;
      //   }
    }
    // // Si te i pot decrementar (invites type >0)
    // // Crear Factura amb invitació


    return false


  } else {
    //*Fake user...
    return false;
  }
})
