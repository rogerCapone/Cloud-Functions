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
exports.paymentFiatCheck = functions.region('europe-west1').https.onCall(async (data, context) => {
  const supUid = data.uid;
  const dataa = data.data;
  // const id = data.id;
  const prod = data.data1;
  let arr = prod.split('||');
  // const id = arr[0]; //?ID
  const id = arr[0];
  const price = arr[1];
  const currency = arr[2];
  // if (dataa.purchaseState == "0") {
  //   console.log('Good Luck...  😿🍫👨🏻‍💻😊');
  //   console.log(dataa);
  // }
  // console.log(dataa);

  if (supUid == context.auth?.uid) {

    //?Eliminar fins UID î 
    if (dataa == 'PurchaseState.purchased' || dataa == 'TransactionState.purchased') { //! 0 S'HA DE TREURE (only TESTING)
      var startTS = new Date().getTime();
      let endTS;


      if (id == 'android.test.purchased') {
        console.log('PRODUCT: EJEMPLO');
        endTS = new Date().getTime() + (1 * 86400000);
      } else if (id == 'monthly') {
        console.log('6 MONTHS');
        endTS = new Date().getTime() + (183 * 86400000);
      } else if (id == 'year') {
        console.log('1 YEAR');
        endTS = new Date().getTime() + (365 * 86400000);
      } else {
        console.log('CAN NOT IDENTIFY PRODUCT 😿');
      }
      // try {
      await db.collection('AppData').doc('appGlobals').update({
        totalTransactionsInit: admin.firestore.FieldValue.increment(1),
      });
      //*Obtenir Global Data for Transactions
      let doc = await db.collection('AppData').doc('appGlobals').get();
      let token = doc.data()?.totalTransactionsInit;

      await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
        subcriptionStart: startTS,
        subcriptionEnd: endTS,
        amount: price,
        coin: currency,
        paymentDate: startTS,
        uid: supUid,
        txId: token,//? Aquesta es la que fem per nosaltres
        // subs: id
      });
      await db.collection('Invoices').doc(supUid).update({
        invoices: admin.firestore.FieldValue.arrayUnion({
          subcriptionStart: startTS,
          subcriptionEnd: endTS,
          amount: price,
          coin: currency,
          paymentDate: startTS,
          uid: supUid,
          txId: token
        })
      });
      //TODO: Crear el hide Hash ()
      if (id == 'monthly') {
        await db.collection('HideHash').doc((token.toString() + supUid + 'Hh' + supUid.substring(2, 3).toString()).toString()).set({
          invites1Month: invites1Month / 2,
          invites3Month: invites3Month / 2,
          invitesYear: invitesYear,
          uid: supUid,
          inviteCounter: totalInvites / 2,
          offered1Month: invites1Month / 2,
          offered3Month: invites3Month / 2,
          offeredYear: invitesYear,
          offeredCounter: totalInvites / 2
        });
      } else {
        await db.collection('HideHash').doc((token.toString() + supUid + 'Hh' + supUid.substring(2, 3).toString()).toString()).set({
          invites1Month: invites1Month,
          invites3Month: invites3Month,
          invitesYear: invitesYear,
          uid: supUid,
          inviteCounter: totalInvites,
          offered1Month: invites1Month,
          offered3Month: invites3Month,
          offeredYear: invitesYear,
          offeredCounter: totalInvites
        });
      }
      await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).set({
        inviteLink: (token.toString() + supUid + 'Hh' + supUid.substring(2, 3).toString()).toString(),
      }, { merge: true });
      //!GENERATE FACTURE Y AFILIADOS
      await db.collection('AppData').doc('appGlobals').update({
        totalTransactionsEnd: admin.firestore.FieldValue.increment(1),
      });
      return 'ok';
      // } catch (e) {
      //   console.log(e.toString());
      //   //TODO:Podria tornar a probar allo que a fallat..
      //   return 'sysError';
      // }
    } else {
      return 'notPurch';
    }
  } else {
    return 'faker';
  }
})
