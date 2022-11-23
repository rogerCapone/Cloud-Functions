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
exports.welcome = functions.region('europe-west1').auth.user().onCreate(async (user) => {
  let dogeAddress: string;
  let creation = Date();
  // let date = Date.now();
  // // let emailVal = user.uid.substring(2, 3).toString() + 'r' + user.uid.substring(3, 5).toString() + user.uid.substring(7, 8);
  // //! Email val == 6 lenght;
  // // let ltcData:any;
  // // let btcData:any;
  // // decrypted[0]; //! (string) senderUID;
  // // decrypted[1]; //! (string) reciverUID;
  // // decrypted[2]; //! (bool)   image;
  // // decrypted[3]; //! (string)   imageUrl;
  // // decrypted[4]; //! (string)  msg;
  // // decrypted[5]; //! (string)  sendAt;
  // // decrypted[6]; //! (string)  sendByName;
  // // decrypted[7]; //! (string)  senderPic;
  // var bytes = Crypto.AES.encrypt(encryptMsg, "");


  await db.doc(`Users/${user.uid}`).create({
    uid: user.uid,
    buildNumber: 0,
    inbox: [],
    creationDate: creation

  });

  // //  ltcData = await ltc_io.get_new_address({label:user.uid});
  // //  const ltcWallet:NewWallet = NewWalletConversion.toNewWallet(JSON.stringify(ltcData));

  // //  btcData = await btc_io.get_new_address({label:user.uid});
  // //  const btcWallet:NewWallet = NewWalletConversion.toNewWallet(JSON.stringify(btcData));

  await doge_io.get_new_address({ label: user.uid }).then(async (data: any) => {
    const newWallet: NewWallet = NewWalletConversion.toNewWallet(JSON.stringify(data));
    if (newWallet.status == 'success') {
      //? Amb aquesta informació, treure'n l'adressa, encodificar-la i guardar-la a Firestore per a que el user la pugui veure
      dogeAddress = newWallet.data.address;
      // newWallet.data.label == USERUID
      //! Atenció per a poder accedir al document de user UID + length
      //? --> Second "Collection" (user.uid + user.uid.length.toString())
      await db.doc(`Users/${user.uid}`).collection('appData').doc(user.uid + user.uid.length.toString()).create({
        userEmail: user.email,
        createdAt: Date.now(),
        lastLogin: 0,
        tokenId: "",
        contacts: [{
          fav: true,
          photoUrl: '',
          uid: '',
          userName: 'Hide Talk'
        }],
        photoUrl: "",
        deleteOpt: 0,
        sendNotifications: true,
        hideContacts: [],
        activeSubscription: "",
        qrScanned: 0,
        qrLifes: 3,
        sendedMsg: 0,
        recivedMsgs: 0,
        dogeAddress: dogeAddress,
        oldEnough: false,
        // ltcAddress:ltcWallet.data.address,
        paid: false,
        // btcAddress:btcWallet.data.address,

      })

    } else {
      await doge_io.get_new_address({ label: user.uid }).then(async (data2: any) => {
        const newWallet: NewWallet = NewWalletConversion.toNewWallet(JSON.stringify(data2));
        if (newWallet.status == 'success') {
          //? Amb aquesta informació, treure'n l'adressa, encodificar-la i guardar-la a Firestore per a que el user la pugui veure
          dogeAddress = newWallet.data.address;
          // newWallet.data.label == USERUID
          //! Atenció per a poder accedir al document de user UID + length
          //? --> Second "Collection" (user.uid + user.uid.length.toString())
          await db.doc(`Users/${user.uid}`).collection('appData').doc(user.uid + user.uid.length.toString()).create({
            userEmail: user.email,
            createdAt: Date.now(),
            lastLogin: 0,
            tokenId: "",
            contacts: [],
            photoUrl: "",
            deleteOpt: 0,
            sendNotifications: true,
            hideContacts: [],
            activeSubscription: "",
            qrScanned: 0,
            qrLifes: 3,
            sendedMsg: 0,
            recivedMsgs: 0,
            dogeAddress: dogeAddress,
            oldEnough: false,
            // ltcAddress:ltcWallet.data.address,
            paid: false,
            // btcAddress:btcWallet.data.address,
            //paymentDate: (DateTime.milisecondsEPOCH)
            //payMode: (monthly --> yealy)
          })

        } else {
          console.log('Unable to get Address');
          await db.doc(`Users/${user.uid}`).collection('appData').doc(user.uid + user.uid.length.toString()).create({
            userEmail: user.email,
            createdAt: Date.now(),
            lastLogin: 0,
            tokenId: "",
            contacts: [],
            photoUrl: "",
            deleteOpt: 0,
            sendNotifications: true,
            hideContacts: [],
            activeSubscription: "",
            qrScanned: 0,
            qrLifes: 3,
            sendedMsg: 0,
            recivedMsgs: 0,
            dogeAddress: 'NO',
            // ltcAddress:ltcWallet.data.address??'NO',
            // btcAddress:btcWallet.data.address??'NO',
            paid: false,

          })

        }

      })

    }

    await db.doc(`AppData/appGlobals`).update({
      totalUsers: admin.firestore.FieldValue.increment(1)
    });
    await db.collection('Invoices').doc(user.uid).create({
      invoices: []
    });
    await db.doc(`Users/${user.uid}`).collection('appData').doc(user.uid + user.uid.length.toString()).collection('HideMember').doc('lastInvoice').create({});
  })
})

