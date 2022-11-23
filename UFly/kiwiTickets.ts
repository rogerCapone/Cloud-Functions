// To parse this data:
//
//   import { Convert, Ofertas } from "./file";
//

export class KiwiTicket {
    airline:      string;
    flightId:     string;
    from:         string;
    to:           string;
    from_city:    string;
    to_city:      string;
    country_from: string;
    country_to:   string;
    depTime:      Date;
    arrTime:      Date;
    date:         string;
    duration:      string;
    distance:      number;
    price:         number;
    availability:  number;
    bookingToken:  string;
    deep_link:     string;
    constructor(airline:string, flightId:string, from:string, to:string, from_city:string, to_city:string, country_to:string, country_from:string, depTime:Date, arrTime:Date, date:string, duration:string, distance:number,
                  price:number, availability:number, bookingToken:string, deep_link:string){

      this.airline = airline;
      this.flightId = flightId
      this.from = from;
      this.to = to;
      this.from_city = from_city;
      this.to_city = to_city;
      this.country_from = country_from;
      this.country_to = country_to;
      this.depTime = depTime;
      this.arrTime = arrTime;
      this.date = date;
      this.duration = duration;
      this.distance = distance;
      this.price = price;
      this.availability = availability;
      this.bookingToken = bookingToken;
      this.deep_link = deep_link;

    }
}
