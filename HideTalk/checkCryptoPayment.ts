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
exports.paymentCheck = functions.region('europe-west1').https.onCall(async (data, context) => {
  //context --> auth User
  //* Possibilitat: Mirar totes les seves wallets?
  //? De moment es mira la wallet en la que fa el click
  const supUid = data.uid;
  const coin = data.coin;
  // const address = data.address;
  let wallet: any;
  console.log(supUid);
  console.log(coin);

  if (supUid == context.auth?.uid) {
    //?Es qui diu ser
    if (coin == 'doge') {
      wallet = await doge_io.get_address_balance({ label: supUid });  //!De qui surt la $$ (LA TE?)
    }
    // // else if(coin=='ltc'){
    // // wallet = await   ltc_io.get_address_balance({ label: supUid });  //!De qui surt la $$ (LA TE?)
    // // }else{
    // // wallet = await   btc_io.get_address_balance({ label: supUid });  //!De qui surt la $$ (LA TE?)
    // // }
    const walletData: AddressBalance = AddressBalanceConversion.toAddressBalance(JSON.stringify(wallet));
    console.log(walletData.toString());
    // // return AddressBalanceConversion.addressBalanceToJson(walletData);
    //!S'HA DE EVALUAR SI HA PAGAT O NO LA QTT INDICADA
    var result: any;
    var fee: any;
    var transResult: CollectMoney;
    if (coin == 'doge') {
      console.log('Wallet Amount');
      console.log(parseFloat((walletData.data.available_balance)).toString());
      console.log('tarif Amount');
      console.log(anualDoge.toString());
      if (parseFloat((walletData.data.available_balance)) >= anualDoge) {
        //TODO: PAGAMENT ANUAL AMB DOGE
        console.log('ANUAL PAYMENT');
        console.log('1');
        //? Enviar la pasta a la nostre wallet () -->
        let blockIoFee = parseFloat(walletData.data.available_balance) * 0.01;

        //*Calculem fee
        //! De pasar la pasta a la nostre wallet
        fee = await doge_io.get_network_fee_estimate({ amounts: (parseFloat(walletData.data.available_balance) - 2 - blockIoFee).toString(), to_addresses: hideDogeAddress }); //!!Canviar per REAL ADDRESS
        const suggFee: Fee = FeeConversion.toFee(JSON.stringify(fee));
        let feeFloat = parseFloat(suggFee.data.estimated_network_fee);
        let feeblock = parseFloat(suggFee.data.blockio_fee);
        console.log('network fee');
        console.log(feeFloat.toString());
        console.log('blockIo fee');
        console.log(feeblock.toString());
        let amountWiz = parseFloat(walletData.data.available_balance) - feeFloat - feeblock;
        console.log('AMOUNT WIZZ');
        console.log(amountWiz.toString());

        //*Fingim que es aquesta
        //! Ens passem la pasta a la nostre wallet
        if (parseFloat(suggFee.data.blockio_fee) + parseFloat(suggFee.data.estimated_network_fee) <= 1.5) {
          result = await doge_io.withdraw_from_addresses({
            amount: (Math.floor(parseFloat(walletData.data.available_balance.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee))).toString(),
            from_addresses: walletData.data.balances[0].address, //?User Wallet
            to_addresses: hideDogeAddress, //!!Canviar per REAL ADDRESS
            pin: pinCode
          });
          transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
          if (transResult.status == 'success') {
            //Todo: Crear Factura 
            //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
            console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
            var startTS = new Date().getTime();
            var endTS = new Date().getTime() + (365 * 86400000);

            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
              subcriptionStart: startTS,
              subcriptionEnd: endTS,
              amount: walletData.data.available_balance,
              coin: coin,
              paymentDate: startTS,
              uid: supUid,
              txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
            });
            await db.collection('Invoices').doc(supUid).update({
              invoices: admin.firestore.FieldValue.arrayUnion({
                subcriptionStart: startTS,
                subcriptionEnd: endTS,
                amount: walletData.data.available_balance,
                coin: coin,
                paymentDate: startTS,
                uid: supUid,
                txId: transResult.data.txid
              })
            });
            //TODO: Crear el hide Hash ()
            await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString()).set({
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
            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).set({
              inviteLink: (transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString(),
            }, { merge: true }
            );

            return 'ok';
          } else {
            console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
            //TODO: Return error
            return 'error';

          }
        } else {
          console.log('ANUAL PAYMENT');
          console.log('2');

          //* Fee superior a 1,5
          //! Ens passem la pasta a la nostre wallet
          let feeFloat = parseFloat(suggFee.data.estimated_network_fee);
          let feeblock = parseFloat(suggFee.data.blockio_fee);
          console.log('network fee');
          console.log(feeFloat.toString());
          console.log('blockIo fee');
          console.log(feeblock.toString());
          let amountWiz = parseFloat(walletData.data.available_balance) - feeFloat - feeblock;
          console.log('AMOUNT WIZZ');
          console.log(amountWiz.toString());
          result = await doge_io.withdraw_from_addresses({
            amount: (Math.floor(parseFloat(walletData.data.available_balance.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee))).toString(),
            from_addresses: walletData.data.balances[0].address, //?User Wallet
            to_addresses: hideDogeAddress, //!!Canviar per REAL ADDRESS
            pin: pinCode
          });
          transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
          if (transResult.status == 'success') {
            //Todo: Crear Factura 
            //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
            console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
            var startTS = new Date().getTime();
            var endTS = new Date().getTime() + (365 * 86400000);//! Check it

            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
              subcriptionStart: startTS,
              subcriptionEnd: endTS,
              subType: 'year',
              amount: walletData.data.available_balance,
              coin: coin,
              paymentDate: startTS,
              uid: supUid,
              txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
            });
            await db.collection('Invoices').doc(supUid).update({
              invoices: admin.firestore.FieldValue.arrayUnion({
                subcriptionStart: startTS,
                subcriptionEnd: endTS,
                amount: walletData.data.available_balance,
                coin: coin,
                paymentDate: startTS,
                uid: supUid,
                txId: transResult.data.txid
              })
            });
            //TODO: Crear el hide Hash ()
            await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString()).set({
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
            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).set({
              inviteLink: (transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString(),
            }, { merge: true }
            )
            return 'ok';
          } else {
            console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
            //TODO: Return error
            return 'error';
          }

        }
        // //! Evaluar si problem o no

        // //? Generar factura per l'usuari

        // //! Com ordenarles 🤔

        // //? Return 'String explicant que paso'



      } else if (parseFloat((walletData.data.available_balance)) >= monthDoge) {
        //TODO: PAGAMENT MENSUAL AMB DOGE
        //? Enviar la pasta a la nostre wallet () -->
        //*Calculem fee
        console.log('6 MONTH PAYMENT');
        let blockIoFee = parseFloat(walletData.data.available_balance) * 0.01;

        //! De pasar la pasta a la nostre wallet
        fee = await doge_io.get_network_fee_estimate({ amounts: (parseFloat(walletData.data.available_balance) - 2.0 - blockIoFee).toString(), to_addresses: hideDogeAddress }); //!!Canviar per REAL ADDRESS
        const suggFee: Fee = FeeConversion.toFee(JSON.stringify(fee));
        let feeFloat = parseFloat(suggFee.data.estimated_network_fee);
        let feeblock = parseFloat(suggFee.data.blockio_fee);
        console.log('network fee');
        console.log(feeFloat.toString());
        console.log('blockIo fee');
        console.log(feeblock.toString());
        let amountWiz = parseFloat(walletData.data.available_balance) - feeFloat - feeblock;
        console.log('AMOUNT WIZZ');
        console.log(amountWiz.toString());
        //*Fingim que es aquesta
        //! Ens passem la pasta a la nostre wallet
        if (parseFloat(suggFee.data.blockio_fee) + parseFloat(suggFee.data.estimated_network_fee) <= 1.5) {
          result = await doge_io.withdraw_from_addresses({
            amount: (Math.floor(parseFloat(walletData.data.available_balance.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee))).toString(),
            from_addresses: walletData.data.balances[0].address, //?User Wallet
            to_addresses: hideDogeAddress, //!!Canviar per REAL ADDRESS
            pin: pinCode
          });
          transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
          if (transResult.status == 'success') {
            //Todo: Crear Factura 
            //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
            console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
            var startTS = new Date().getTime();
            var endTS = new Date().getTime() + (180 * 86400000); //! Nº Days subscripció

            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
              subcriptionStart: startTS,
              subcriptionEnd: endTS,
              amount: walletData.data.available_balance,
              coin: coin,
              paymentDate: startTS,
              uid: supUid,
              txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
            });
            await db.collection('Invoices').doc(supUid).update({
              invoices: admin.firestore.FieldValue.arrayUnion({
                subcriptionStart: startTS,
                subcriptionEnd: endTS,
                amount: walletData.data.available_balance,
                coin: coin,
                paymentDate: startTS,
                uid: supUid,
                txId: transResult.data.txid
              })
            });
            await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString()).set({
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
            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).set({
              inviteLink: (transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString(),
            }, { merge: true }
            );
            return 'ok';
          } else {
            console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
            //TODO: Return error
            return 'error';

          }
        } else {
          console.log('6 MONTH PAYMENT');

          //* Fee superior a 1,5
          //! Ens passem la pasta a la nostre wallet
          let feeFloat = parseFloat(suggFee.data.estimated_network_fee);
          let feeblock = parseFloat(suggFee.data.blockio_fee);
          console.log('network fee');
          console.log(feeFloat.toString());
          console.log('blockIo fee');
          console.log(feeblock.toString());
          let amountWiz = parseFloat(walletData.data.available_balance) - feeFloat - feeblock;
          console.log('AMOUNT WIZZ');
          console.log(amountWiz.toString());
          result = await doge_io.withdraw_from_addresses({
            amount: (Math.floor(parseFloat(walletData.data.available_balance.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee))).toString(),
            from_addresses: walletData.data.balances[0].address, //?User Wallet
            to_addresses: hideDogeAddress, //!!Canviar per REAL ADDRESS
            pin: pinCode
          });
          transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
          if (transResult.status == 'success') {
            //Todo: Crear Factura 
            //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
            console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
            var startTS = new Date().getTime();
            var endTS = new Date().getTime() + (180 * 86400000);//! Check it Nº Days subscripció

            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
              subcriptionStart: startTS,
              subcriptionEnd: endTS,
              subType: 'month',
              amount: walletData.data.available_balance,
              coin: coin,
              paymentDate: startTS,
              uid: supUid,
              txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
            });
            await db.collection('Invoices').doc(supUid).update({
              invoices: admin.firestore.FieldValue.arrayUnion({
                subcriptionStart: startTS,
                subcriptionEnd: endTS,
                amount: walletData.data.available_balance,
                coin: coin,
                paymentDate: startTS,
                uid: supUid,
                txId: transResult.data.txid
              })
            });
            //TODO: Crear el hide Hash ()
            await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString()).set({
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
            await db.collection('Users').doc(supUid).collection('appData').doc(supUid + supUid.length.toString()).set({
              inviteLink: (transResult.data.txid.substring(7).toString() + supUid + 'Hh' + transResult.data.txid.substring(2, 3).toString()).toString(),
            }, { merge: true }
            )
            return 'ok';
          } else {
            console.log('Something went wrong line 528-560 when collecting money to HIDE ACCOUNT');
            //TODO: Return error
            return 'error';
          }

        }







        //! Evaluar si problem o no

        //? Generar factura per l'usuari

        //! Com ordenarles 🤔

        //? Return 'String explicant que paso'






      } else {
        //!Algo fue mal... 👋🏻
        console.log('!Algo fue mal... 👋🏻');
        return 'error';

      }

      // //       }else if(coin=='ltc'){
      // //         if(parseFloat((walletData.data.available_balance))>=anualLtc){
      // //           //TODO: PAGAMENT ANUAL AMB LTC
      // //         //? Enviar la pasta a la nostre wallet () -->


      // //         //*Calculem fee
      // //         //! De pasar la pasta a la nostre wallet
      // //         fee =  await ltc_io.get_network_fee_estimate({ amounts: (parseFloat(walletData.data.available_balance)-2.0).toString(), to_addresses: hideLtcAddress }); //!!Canviar per REAL ADDRESS
      // //         const suggFee:Fee = FeeConversion.toFee(JSON.stringify(fee));

      // //           //*Fingim que es aquesta
      // //           //! Ens passem la pasta a la nostre wallet
      // //       if(parseFloat(suggFee.data.blockio_fee)+parseFloat(suggFee.data.estimated_network_fee)<=1.5){
      // //             result = await  ltc_io.withdraw_from_addresses({
      // //                 amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //                 from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //                 to_addresses: hideLtcAddress, //!!Canviar per REAL ADDRESS
      // //                 pin: pinCode
      // //               });
      // //               transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //               if(transResult.status=='success'){
      // //                 //Todo: Crear Factura 
      // //                 //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //                 console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //                 var startTS =  new Date().getTime();
      // //                 var endTS = new Date().getTime() + (365*86400000);

      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //                   subcriptionStart: startTS,
      // //                   subcriptionEnd: endTS,
      // //                   amount: walletData.data.available_balance,
      // //                   coin: coin,
      // //                   paymentDate:startTS,
      // //                   uid:supUid,
      // //                   txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //                 });
      // //                 await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //                   iinvites1Month:invites1Month,
      // //                   invites3Month:invites3Month,
      // //                   invitesYear:invitesYear,
      // //                   uid:supUid,
      // //                   inviteCounter: totalInvites,
      // //                   offered1Month:invites1Month,
      // //                   offered3Month:invites3Month,
      // //                   offeredYear: invitesYear,
      // //                   offeredCounter: totalInvites

      // //                 });
      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //                   inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //                 },{merge:true}
      // //                 );
      // //                 return 'ok';
      // //               }else{
      // //                 console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
      // //                 //TODO: Return error
      // //                 return 'error';

      // //               }
      // //       }else{
      // //         //* Fee superior a 1,5
      // //           //! Ens passem la pasta a la nostre wallet
      // //         result = await  ltc_io.withdraw_from_addresses({
      // //           amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_max_custom_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //           from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //           to_addresses: hideLtcAddress , //!!Canviar per REAL ADDRESS
      // //           pin: pinCode
      // //         });
      // //         transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //         if(transResult.status=='success'){
      // //           //Todo: Crear Factura 
      // //           //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //           console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //           var startTS =  new Date().getTime();
      // //           var endTS = new Date().getTime() + (365*86400000);//! Check it

      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //             subcriptionStart: startTS,
      // //             subcriptionEnd: endTS,
      // //             subType: 'year',
      // //             amount: walletData.data.available_balance,
      // //             coin: coin,
      // //             paymentDate:startTS,
      // //             uid:supUid,
      // //             txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //           });
      // //           //TODO: Crear el hide Hash ()
      // //           await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //             invites1Month:invites1Month,
      // //             invites3Month:invites3Month,
      // //             invitesYear:invitesYear,
      // //             uid:supUid,
      // //             inviteCounter: totalInvites,
      // //             offered1Month:invites1Month,
      // //             offered3Month:invites3Month,
      // //             offeredYear: invitesYear,
      // //             offeredCounter: totalInvites
      // //           });
      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //             inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //           },{merge:true}
      // //           )
      // //           return 'ok';
      // //         }else{
      // //           console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
      // //           //TODO: Return error
      // //           return 'error';
      // //         }

      // //       }





      // //         }else if(parseFloat((walletData.data.available_balance))>=monthLtc){
      // //             //TODO: PAGAMENT MENSUAL AMB LTC
      // //                   //? Enviar la pasta a la nostre wallet () -->
      // //  //*Calculem fee
      // //         //! De pasar la pasta a la nostre wallet
      // //         fee =  await ltc_io.get_network_fee_estimate({ amounts: walletData.data.available_balance, to_addresses: hideLtcAddress }); //!!Canviar per REAL ADDRESS
      // //         const suggFee:Fee = FeeConversion.toFee(JSON.stringify(fee));

      // //           //*Fingim que es aquesta
      // //           //! Ens passem la pasta a la nostre wallet
      // //       if(parseFloat(suggFee.data.blockio_fee)+parseFloat(suggFee.data.estimated_network_fee)<=1.5){
      // //             result = await  ltc_io.withdraw_from_addresses({
      // //                 amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //                 from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //                 to_addresses: hideLtcAddress , //!!Canviar per REAL ADDRESS
      // //                 pin: pinCode
      // //               });
      // //               transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //               if(transResult.status=='success'){
      // //                 //Todo: Crear Factura 
      // //                 //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //                 console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //                 var startTS =  new Date().getTime();
      // //                 var endTS = new Date().getTime() + (180*86400000); //! Nº Days subscripció

      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //                   subcriptionStart: startTS,
      // //                   subcriptionEnd: endTS,
      // //                   amount: walletData.data.available_balance,
      // //                   coin: coin,
      // //                   paymentDate:startTS,
      // //                   uid:supUid,
      // //                   txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //                 });
      // //                 await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //                   invites1Month:invites1Month/2,
      // //                   invites3Month:invites3Month/2,
      // //                   invitesYear:invitesYear,
      // //                   uid:supUid,
      // //                   inviteCounter: totalInvites/2,
      // //                 offered1Month:invites1Month/2,
      // //                 offered3Month:invites3Month/2,
      // //                 offeredYear: invitesYear,
      // //                 offeredCounter: totalInvites/2
      // //                 });
      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //                   inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //                 },{merge:true}
      // //                 );
      // //                 return 'ok';
      // //               }else{
      // //                 console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
      // //                 //TODO: Return error
      // //                 return 'error';

      // //               }
      // //       }else{
      // //         //* Fee superior a 1,5
      // //           //! Ens passem la pasta a la nostre wallet
      // //         result = await  ltc_io.withdraw_from_addresses({
      // //           amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_max_custom_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //           from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //           to_addresses: hideLtcAddress , //!!Canviar per REAL ADDRESS
      // //           pin: pinCode
      // //         });
      // //         transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //         if(transResult.status=='success'){
      // //           //Todo: Crear Factura 
      // //           //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //           console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //           var startTS =  new Date().getTime();
      // //           var endTS = new Date().getTime() + (180*86400000);//! Check it Nº Days subscripció

      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //             subcriptionStart: startTS,
      // //             subcriptionEnd: endTS,
      // //             subType: 'month',
      // //             amount: walletData.data.available_balance,
      // //             coin: coin,
      // //             paymentDate:startTS,
      // //             uid:supUid,
      // //             txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //           });
      // //           //TODO: Crear el hide Hash ()
      // //           await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //             invites1Month:invites1Month/2,
      // //             invites3Month:invites3Month/2,
      // //             invitesYear:invitesYear,
      // //             uid:supUid,
      // //             inviteCounter: totalInvites/2,
      // //           offered1Month:invites1Month/2,
      // //           offered3Month:invites3Month/2,
      // //           offeredYear: invitesYear,
      // //           offeredCounter: totalInvites/2
      // //           });
      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //             inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //           },{merge:true}
      // //           )
      // //           return 'ok';
      // //         }else{
      // //           console.log('Something went wrong line 528-560 when collecting money to HIDE ACCOUNT');
      // //           //TODO: Return error
      // //           return 'error';
      // //         }

      // //       }







      // //         //! Evaluar si problem o no

      // //         //? Generar factura per l'usuari

      // //         //! Com ordenarles 🤔

      // //         //? Return 'String explicant que paso'



      // //         }else{
      // //           //!Algo fue mal... 👋🏻
      // //         console.log('!Algo fue mal... 👋🏻');
      // //         return 'error';

      // //         }
      // //       }else{
      // //         if(parseFloat((walletData.data.available_balance))>=anualBtc){
      // //           //TODO: PAGAMENT ANUAL AMB BTC

      // //            //? Enviar la pasta a la nostre wallet () -->


      // //         //*Calculem fee
      // //         //! De pasar la pasta a la nostre wallet
      // //         fee =  await btc_io.get_network_fee_estimate({ amounts: walletData.data.available_balance, to_addresses: hideBtcAddress }); //!!Canviar per REAL ADDRESS
      // //         const suggFee:Fee = FeeConversion.toFee(JSON.stringify(fee));

      // //           //*Fingim que es aquesta
      // //           //! Ens passem la pasta a la nostre wallet
      // //       if(parseFloat(suggFee.data.blockio_fee)+parseFloat(suggFee.data.estimated_network_fee)<=1.5){
      // //             result = await  btc_io.withdraw_from_addresses({
      // //                 amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //                 from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //                 to_addresses: hideBtcAddress , //!!Canviar per REAL ADDRESS
      // //                 pin: pinCode
      // //               });
      // //               transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //               if(transResult.status=='success'){
      // //                 //Todo: Crear Factura 
      // //                 //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //                 console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //                 var startTS =  new Date().getTime();
      // //                 var endTS = new Date().getTime() + (365*86400000);

      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //                   subcriptionStart: startTS,
      // //                   subcriptionEnd: endTS,
      // //                   amount: walletData.data.available_balance,
      // //                   coin: coin,
      // //                   paymentDate:startTS,
      // //                   uid:supUid,
      // //                   txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //                 });
      // //                 await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //                   invites1Month:invites1Month,
      // //                   invites3Month:invites3Month,
      // //                   invitesYear:invitesYear,
      // //                   uid:supUid,
      // //                   inviteCounter: totalInvites,
      // //                   offered1Month:invites1Month,
      // //                   offered3Month:invites3Month,
      // //                   offeredYear: invitesYear,
      // //                   offeredCounter: totalInvites
      // //                 });
      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //                   inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //                 },{merge:true}
      // //                 );
      // //                 return 'ok';
      // //               }else{
      // //                 console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
      // //                 //TODO: Return error
      // //                 return 'error';

      // //               }
      // //       }else{
      // //         //* Fee superior a 1,5
      // //           //! Ens passem la pasta a la nostre wallet
      // //         result = await  btc_io.withdraw_from_addresses({
      // //           amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_max_custom_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //           from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //           to_addresses: hideBtcAddress , //!!Canviar per REAL ADDRESS
      // //           pin: pinCode
      // //         });
      // //         transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //         if(transResult.status=='success'){
      // //           //Todo: Crear Factura 
      // //           //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //           console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //           var startTS =  new Date().getTime();
      // //           var endTS = new Date().getTime() + (365*86400000);//! Check it

      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //             subcriptionStart: startTS,
      // //             subcriptionEnd: endTS,
      // //             subType: 'year',
      // //             amount: walletData.data.available_balance,
      // //             coin: coin,
      // //             paymentDate:startTS,
      // //             uid:supUid,
      // //             txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //           });
      // //           //TODO: Crear el hide Hash ()
      // //           await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //             invites1Month:invites1Month,
      // //             invites3Month:invites3Month,
      // //             invitesYear:invitesYear,
      // //             uid:supUid,
      // //             inviteCounter: totalInvites,
      // //             offered1Month:invites1Month,
      // //             offered3Month:invites3Month,
      // //             offeredYear: invitesYear,
      // //             offeredCounter: totalInvites
      // //           });
      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //             inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //           },{merge:true}
      // //           )
      // //           return 'ok';
      // //         }else{
      // //           console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
      // //           //TODO: Return error
      // //           return 'error';
      // //         }

      // //       }


      // //         }else if(parseFloat((walletData.data.available_balance))>=monthBtc){
      // //             //TODO: PAGAMENT MENSUAL AMB BTC


      // //                           //? Enviar la pasta a la nostre wallet () -->
      // //  //*Calculem fee
      // //         //! De pasar la pasta a la nostre wallet
      // //         fee =  await btc_io.get_network_fee_estimate({ amounts: walletData.data.available_balance, to_addresses: hideBtcAddress }); //!!Canviar per REAL ADDRESS
      // //         const suggFee:Fee = FeeConversion.toFee(JSON.stringify(fee));

      // //           //*Fingim que es aquesta
      // //           //! Ens passem la pasta a la nostre wallet
      // //       if(parseFloat(suggFee.data.blockio_fee)+parseFloat(suggFee.data.estimated_network_fee)<=1.5){
      // //             result = await  btc_io.withdraw_from_addresses({
      // //                 amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //                 from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //                 to_addresses: hideBtcAddress , //!!Canviar per REAL ADDRESS
      // //                 pin: pinCode
      // //               });
      // //               transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //               if(transResult.status=='success'){
      // //                 //Todo: Crear Factura 
      // //                 //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //                 console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //                 var startTS =  new Date().getTime();
      // //                 var endTS = new Date().getTime() + (180*86400000); //! Nº Days subscripció

      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //                   subcriptionStart: startTS,
      // //                   subcriptionEnd: endTS,
      // //                   amount: walletData.data.available_balance,
      // //                   coin: coin,
      // //                   paymentDate:startTS,
      // //                   uid:supUid,
      // //                   txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //                 });
      // //                 await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //                   invites1Month:invites1Month/2,
      // //             invites3Month:invites3Month/2,
      // //             invitesYear:invitesYear,
      // //             uid:supUid,
      // //             inviteCounter: totalInvites/2,
      // //           offered1Month:invites1Month/2,
      // //           offered3Month:invites3Month/2,
      // //           offeredYear: invitesYear,
      // //           offeredCounter: totalInvites/2
      // //                 });
      // //                 await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //                   inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //                 },{merge:true}
      // //                 );
      // //                 return 'ok';
      // //               }else{
      // //                 console.log('Something went wrong line 318 when collecting money to HIDE ACCOUNT');
      // //                 //TODO: Return error
      // //                 return 'error';

      // //               }
      // //       }else{
      // //         //* Fee superior a 1,5
      // //           //! Ens passem la pasta a la nostre wallet
      // //         result = await  btc_io.withdraw_from_addresses({
      // //           amount: ((parseFloat(walletData.data.available_balance.toString())-parseFloat(suggFee.data.estimated_max_custom_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
      // //           from_addresses: walletData.data.balances[0].address, //?User Wallet
      // //           to_addresses: hideBtcAddress , //!!Canviar per REAL ADDRESS
      // //           pin: pinCode
      // //         });
      // //         transResult = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
      // //         if(transResult.status=='success'){
      // //           //Todo: Crear Factura 
      // //           //?Al crear la factura insertar la cantitat pagada (si hi han sobres --> si son superiors al 10% ??)
      // //           console.log('Money was successfully transfered to HIDE ACCOUNT 🤘🏻😏👨🏻‍💻');
      // //           var startTS =  new Date().getTime();
      // //           var endTS = new Date().getTime() + (180*86400000);//! Check it Nº Days subscripció

      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).collection('HideMember').doc('lastInvoice').set({
      // //             subcriptionStart: startTS,
      // //             subcriptionEnd: endTS,
      // //             subType: 'month',
      // //             amount: walletData.data.available_balance,
      // //             coin: coin,
      // //             paymentDate:startTS,
      // //             uid:supUid,
      // //             txId: transResult.data.txid//? Aquesta es la que fem per nosaltres
      // //           });
      // //           //TODO: Crear el hide Hash ()
      // //           await db.collection('HideHash').doc((transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString()).set({
      // //             invites1Month:invites1Month/2,
      // //             invites3Month:invites3Month/2,
      // //             invitesYear:invitesYear,
      // //             uid:supUid,
      // //             inviteCounter: totalInvites/2,
      // //           offered1Month:invites1Month/2,
      // //           offered3Month:invites3Month/2,
      // //           offeredYear: invitesYear,
      // //           offeredCounter: totalInvites/2
      // //           });
      // //           await db.collection('Users').doc(supUid).collection('appData').doc(supUid+supUid.length.toString()).set({
      // //             inviteLink:(transResult.data.txid.substring(7).toString()+supUid+'Hh'+transResult.data.txid.substring(2,3).toString()).toString(),
      // //           },{merge:true}
      // //           )
      // //           return 'ok';
      // //         }else{
      // //           console.log('Something went wrong line 528-560 when collecting money to HIDE ACCOUNT');
      // //           //TODO: Return error
      // //           return 'error';
      // //         }

      // //       }







      // //         //! Evaluar si problem o no

      // //         //? Generar factura per l'usuari

      // //         //! Com ordenarles 🤔

      // //         //? Return 'String explicant que paso'




    } else {
      //!Algo fue mal... 👋🏻
      console.log('!Algo fue mal... 👋🏻');
      return 'error';
    }
    //       


  } else {
    //?Impostor!
    return false; //!Es un fake user!!
  }


  //! return not response!!
});
