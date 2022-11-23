
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


exports.brokerTime = functions.https.onRequest(async (req, resp) => {

    const subsRef = await db.collection('Subscriptions');
    const snapshot = await subsRef.get(); 
    const affilId = 'rogerflightbroker';
    let topics = new Array();
    // let arr = new Array();


    snapshot.forEach( (doc )=> {

      topics.push(doc.id);
      });

    topics.forEach((top)=>console.log(top.toString()));



    await searchForTopicPrices(topics, affilId).then(()=>{
      resp.send({'taskExecution':'Started ;)'})
    });

    });


    async function searchForTopicPrices(topics:any, affilId:string) {


      await topics.map(async (topic:string) => {
        


        let docTitleArray = topic.split('-');
        console.log('treating '+ topic );
         const pene = await new Promise( async (resolve, reject)=>{
          const origen = docTitleArray[0].toUpperCase();
          const destino = docTitleArray[1].toUpperCase();
          // const price = docTitleArray[2];
          let currency;
          let locale;
  
          if(docTitleArray[3] == '€'){
            currency = 'EUR'
            locale = 'es'
          } else {
            currency = 'USD'
            locale = 'en'
          } 
          const dateFrom =`${docTitleArray[4]}/${docTitleArray[5]}/${docTitleArray[6]}`;    //'15/08/2020';
          const dateTo =`${docTitleArray[7]}/${docTitleArray[8]}/${docTitleArray[9]}`;    //'24/08/2020';
          
          const flight_type = 'oneway'; // 'round' --> with nights_in_dst of return date is given
          const direct_flights = 1; // 1 = YES, 0 = NO
          const adults = 1;
          const children = 0;
          const infants = 0;   
  
          const kiwiOption = {
            method: 'GET',
            url: `https://api.skypicker.com/flights?fly_from=${origen}&fly_to=${destino}&date_from=${dateFrom}&date_to=${dateTo}&partner=${affilId}&curr=${currency}&locale=${locale}&direct_flights=${direct_flights}&flight_type=${flight_type}&adults=${adults}&children=${children}&infants=${infants}`,
            headers: {
            'content-type': 'application/json'
          }
        };
      
        let kTicket:KiwiTicket;
        let kTickets:KiwiTicket[] = new Array();
        let lowPrice:number[];
      
          try{
  
            request.get(kiwiOption, async function(err:any, something:any, body:any){
              if(err){
                console.log(err.toString());
                reject(err)
              }else{
                console.log('No REQUEST error');
                console.log('kiwiData');
                const kiwiResponse = Convertir.toKiwiResponse(body);
                const myData = kiwiResponse.data;
      
      
      
                if(myData !== undefined){
                for (let index = 0; index < myData.length; index++) {
                  if(myData[index].availability?.seats !== null){
                  let flightId =`${myData[index].airlines![0]}${myData[index].route![0].flight_no}`;
                  if(myData[index].deep_link !== null){
                  kTicket = new KiwiTicket(myData[index].airlines![0], flightId, myData[index].cityCodeFrom!, myData[index].cityCodeTo!, myData[index].cityFrom!, myData[index].cityTo!, myData[index].countryFrom.code, myData[index].countryTo.code, new Date(myData[index].dTime * 1000), new Date(myData[index].aTime * 1000), dateFrom, myData[index].fly_duration, myData[index].distance, myData[index].price, myData[index].availability.seats, myData[index].booking_token, myData[index].deep_link);
                  kTickets.push({airline: kTicket.airline, flightId: kTicket.flightId, from: kTicket.from, to: kTicket.to, from_city: kTicket.from_city, to_city: kTicket.to_city, country_from: kTicket.country_from, country_to: kTicket.country_to, depTime: kTicket.depTime, arrTime: kTicket.arrTime, date: kTicket.date, duration: kTicket.duration, distance: kTicket.distance, price: kTicket.price, availability: kTicket.availability, bookingToken: kTicket.bookingToken, deep_link: kTicket.deep_link});
                  
                }else{
                  console.log('Deep link is null TT');
                  reject(false)
                }
              }
                  }
                  //Ara aqui hauriem de publicar el MSG per a que es notifiqui als users --
                  lowPrice = getLowestPrice(kTickets);
              
                  console.log('kTickets[lowPrice[1]].depTime.getDate()');
                  // console.log(kTickets[lowPrice[1]].depTime.getDate()); // RETURNS(only) DAY

                  console.log('LowPrice')
                  // lowPrice.forEach(elem=>{
                  //   console.log(elem.toString());
                  // })
                  console.log(lowPrice[0]);
                  const dayFound = parseInt(kTickets[lowPrice[1]].depTime.getDate().toString());
                  const monthFound =kTickets[lowPrice[1]].depTime.getUTCMonth() +1;
                  const yearFound =kTickets[lowPrice[1]].depTime.getUTCFullYear();

                  console.log(kTickets[lowPrice[1]].depTime)
                  
                  console.log(dayFound,monthFound,yearFound);
                  await publishMessage(origen, destino, lowPrice[0],docTitleArray[3], dayFound, monthFound, yearFound, kTickets[lowPrice[1]].deep_link).then(()=>{
                    console.log(docTitleArray[0].toUpperCase() + ' - ' + docTitleArray[1].toUpperCase() + ' Published (:')
                  })
              }else{
                console.log('my data is equal to UNDEFINED');
              }
              }
  
            })
      }catch(e){
        reject(false)
        console.log(e.toString());
      }
    }
      
      )

      console.log('Map 1');
      return pene;


      }
      
      
      );










    }
  
      function getLowestPrice(ticketInfo:KiwiTicket[]){
  
        let array:number[] = [];
        let position:number = 0;
        let response:number[]= [];
        // console.log(ticketInfo);
        for (let index = 0; index < ticketInfo.length; index++) {
            array.push(ticketInfo[index].price);
          }
  
        let min = array[0];
  
        for(let i = 0; i < array.length; i++){
          if(array[i] < min){
            min = array[i];
            position = i;
            // console.log(position);
          }
        }
        console.log('Inside getLowPrice');
        console.log(ticketInfo[position].date);
        // console.log(min);
        response.push(min,position);
        // console.log(response);
        return response;
      }
  
      async function publishMessage(orig:string, dest:string, price:number,currency:string, day:number, month:number, year:number, url:string){  //day:number, month:number, year:number
        //date te format == ( DD/MM/YYYY )
        console.log(url)
        console.log('url');
  
        await db.collection('Topics').get().then((docs)=>{
          if(!docs.empty){
            docs.forEach((doc)=>{
              let topic = doc.id; 
              // console.log(topic);
              //Si hi ha un missatge que ja existeix, aleshores no facis res, d'alguna manera hauriem de actualitzar la llista de missatges...
              let arrTopic = topic.split('-');
               let or = arrTopic[0];
               let des = arrTopic[1];
               let preu = parseFloat(arrTopic[2]);
               let curr = arrTopic[3];
               

               const start = new Date(parseInt(arrTopic[6]), parseInt(arrTopic[5]), parseInt(arrTopic[4]));
               const startEpoch = start.getTime()/1000.0;
               const end = new Date(parseInt(arrTopic[9]), parseInt(arrTopic[8]), parseInt(arrTopic[7]));
               const endEpoch = end.getTime()/1000.0;
               const anal = new Date(year, month, day);
               const analEpoch = anal.getTime()/1000.0;
               // console.log(or, des, preu, url);
               if(or === orig && des === dest && preu >= price && curr == currency && analEpoch >= startEpoch && analEpoch <= endEpoch){
                 console.log(topic,url)
                 return db.doc(`Topics/${topic}`).update({
                   messages: admin.firestore.FieldValue.arrayUnion(`${orig} - ${dest} || ${url} || ${price} ${curr} || ${day}/${month}/${year}`), //CHANGE
                   msg_count: admin.firestore.FieldValue.increment(+1)
                 }).then(()=>{
                   console.log('messageDelivered!');
                   return;
                 })
               }
               return;
            })
          }else{
            return;
          }
        })
        }
  
