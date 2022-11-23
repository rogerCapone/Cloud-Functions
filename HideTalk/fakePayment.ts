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
export const fakePayment = functions.https.onRequest(async (request, response) => {
  //! Fer una transferencia de crypto a la wallet que se'm passi per parámetre

  const senderLabel = request.query.senderLabel; //! De on surt la $$
  const reciverLabel = request.query.reciverLabel; //! De on surt la $$
  const coin = request.query.coin; //* 'doge', 'ltc', 'btc'
  let qtt = request.query.amount;
  console.log(qtt?.toString());   //! Qtt $$
  if (qtt != undefined) {
    const amount = parseFloat(qtt.toString());
    console.log(amount);


    console.log(senderLabel);
    // const coin = request.body.coin;            //! Moneda per escollir la API (Network)

    //? Init Variables
    // var payerWallet:any;
    var fee: any;
    var result: any;
    var result2: any;
    var reciverWallet: any;

    //! CAL PRESTAR ATENCIÓ A QUINA WALLET VOLEM PAGAR



    //! IMPLEMENTAR NETWORK ATTEMPS F(DOGE,BTC,LTC) --> REALITZAR LA PROVA

    try {
      if (coin == 'doge') {
        reciverWallet = await doge_io.get_address_balance({ label: reciverLabel });  //!De qui surt la $$ (LA TE?)
      }
      // else if(coin=='ltc'){
      //   reciverWallet = await   ltc_io.get_address_balance({ label: reciverLabel });  //!De qui surt la $$ (LA TE?)
      // }else{
      //   reciverWallet = await   btc_io.get_address_balance({ label: reciverLabel });  //!De qui surt la $$ (LA TE?)
      // }
      const reciverWalletData: AddressBalance = AddressBalanceConversion.toAddressBalance(JSON.stringify(reciverWallet));

      if (coin == 'doge') {
        fee = await doge_io.get_network_fee_estimate({ amounts: amount, to_addresses: reciverWalletData.data.balances[0].address }); //!!Arriba a (label:MAIN)
      }
      // else if(coin=='ltc'){
      //   fee =  await ltc_io.get_network_fee_estimate({ amounts: amount, to_addresses: reciverWalletData.data.balances[0].address }); //!!Arriba a (label:MAIN)
      //   }else{
      //     fee =  await btc_io.get_network_fee_estimate({ amounts: amount, to_addresses: reciverWalletData.data.balances[0].address }); //!!Arriba a (label:MAIN)
      //   }
      const suggFee: Fee = FeeConversion.toFee(JSON.stringify(fee));
      if (parseFloat(suggFee.data.blockio_fee) + parseFloat(suggFee.data.estimated_network_fee) <= 1.5) {
        if (coin == 'doge') {
          console.log((parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee)).toString());
          result = await doge_io.withdraw_from_labels({
            from_labels: senderLabel, //?User Wallet
            to_label: reciverLabel,  //?Hide Wallet
            amount: ((parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
            pin: pinCode
          });
        }
        // else if(coin=='ltc'){
        //   console.log((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toString());
        //   result = await ltc_io.withdraw_from_labels({
        //     from_labels: senderLabel, //?User Wallet
        //     to_label: reciverLabel,  //?Hide Wallet
        //     amount: ((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
        //     pin: pinCode
        //   });
        //   }else{
        //     console.log((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toString());
        //     result = await btc_io.withdraw_from_labels({
        //       from_labels: senderLabel, //?User Wallet
        //       to_label: reciverLabel,  //?Hide Wallet
        //       amount: ((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
        //       pin: pinCode
        //     });
        //   }

        const transaction: CollectMoney = CollectMoneyConversion.toCollectMoney(JSON.stringify(result));
        if (transaction.status == 'success') {
          response.send({
            status: 'Success 😎👌🏻',
            senderLabel: senderLabel,
            reciverLabel: reciverLabel,
            txId: transaction.data.txid,
            amountWithdraw: (parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee)).toString(),
            feeBlockIo: parseFloat(suggFee.data.blockio_fee).toString(),
            feeNetwork: parseFloat(suggFee.data.estimated_network_fee).toString(),
            amountRequested: parseFloat(amount.toString()).toString()
          })
        } else {
          console.log('Something went wrong, trying AGAIN ➰');

          if (coin == 'doge') {
            console.log((parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee)).toString());
            result2 = await doge_io.withdraw_from_labels({
              from_labels: senderLabel, //?User Wallet
              to_label: reciverLabel,  //?Hide Wallet
              amount: ((parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
              pin: pinCode
            });
          }
          // else if(coin=='ltc'){
          //   console.log((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toString());
          //   result2 = await ltc_io.withdraw_from_labels({
          //     from_labels: senderLabel, //?User Wallet
          //     to_label: reciverLabel,  //?Hide Wallet
          //     amount: ((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
          //     pin: pinCode
          //   });
          //   }else{
          //     console.log((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toString());
          //     result2 = await btc_io.withdraw_from_labels({
          //       from_labels: senderLabel, //?User Wallet
          //       to_label: reciverLabel,  //?Hide Wallet
          //       amount: ((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
          //       pin: pinCode
          //     });
          //   }
          const transaction2: CollectMoney = CollectMoneyConversion.toCollectMoney(JSON.stringify(result2));

          if (transaction2.status == 'success') {
            response.send({
              status: 'Success 😎👌🏻',
              senderLabel: senderLabel,
              reciverLabel: reciverLabel,
              txId: transaction2.data.txid,
              amountWithdraw: ((parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_max_custom_network_fee) - parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
              feeBlockIo: parseFloat(suggFee.data.blockio_fee).toString(),
              feeNetwork: parseFloat(suggFee.data.estimated_network_fee).toString(),
              amountRequested: parseFloat(amount.toString()).toString()
            });

          } else {
            response.send('Something went really wrong... 😿😿😿');
          }
        }
      } else {
        //TODO: MAX NETWORK FEE APPLIED

        if (coin == 'doge') {
          console.log((parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_network_fee) - parseFloat(suggFee.data.blockio_fee)).toString());

          result = await doge_io.withdraw_from_labels({
            from_labels: senderLabel, //?User Wallet
            to_label: reciverLabel,  //?Hide Wallet
            amount: ((parseFloat(amount.toString()) - parseFloat(suggFee.data.estimated_max_custom_network_fee) - parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
            pin: pinCode
          });
        }
        // else if(coin=='ltc'){
        //   console.log((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toString());

        //   result = await ltc_io.withdraw_from_labels({
        //     from_labels: senderLabel, //?User Wallet
        //     to_label: reciverLabel,  //?Hide Wallet
        //     amount: ((parseFloat(amount.toString())+parseFloat(suggFee.data.estimated_max_custom_network_fee)+parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
        //     pin: pinCode
        //   });
        //   }else{
        //   console.log((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_network_fee)-parseFloat(suggFee.data.blockio_fee)).toString());

        //     result = await btc_io.withdraw_from_labels({
        //       from_labels: senderLabel, //?User Wallet
        //       to_label: reciverLabel,  //?Hide Wallet
        //       amount: ((parseFloat(amount.toString())-parseFloat(suggFee.data.estimated_max_custom_network_fee)-parseFloat(suggFee.data.blockio_fee)).toFixed(6)).toString(),
        //       pin: pinCode
        //     });
        //   }
      }
    } catch (error) {
      console.log(error.toString());
      response.send(`Something went really wrong... 😿😿😿\n\n${error.toString()}`);

    }
  } else {
    response.send(`Qtt was bad Formated 😹🎉 ${qtt}`);
  }

})
