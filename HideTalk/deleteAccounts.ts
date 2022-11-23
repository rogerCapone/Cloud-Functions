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
exports.deleteAccount = functions.region('europe-west1').https.onCall(async (data, context) => {
  const supUid = data.uid;
  if (supUid == context.auth?.uid) {
    try {
      await admin.auth().deleteUser(supUid);
      return 'ok';

    } catch (error) {
      console.log(error.toString());
      return error.toString();
    }
  } else {
    console.log('This is a fake user trying to delete an other userAccount');
    return 'fake';
  }
})
