// To parse this data:
//
//   import { Convert, Ofertas } from "./file";
//

export class Ticket {
    airline?: string;
    airline_name?: string;
    airlineLogo?: string;
    From?:    string;
    To?:      string;
    DepTime?: Date;
    ArrTime?: Date;
    Date?:    Date;
    p_venta: PVenta[];
    constructor(airline:string, airName:string, airLogo:string, from:string,to:string,depTime:Date,arrTime:Date,date:Date, p_venta:PVenta[]){
      this.airline = airline;
      this.airline_name = airName;
      this.airlineLogo = airLogo;
      this.From = from;
      this.To = to;
      this.DepTime = depTime;
      this.ArrTime = arrTime;
      this.Date = date;
      this.p_venta = p_venta;
    }
}

export class PVenta {
    p_name?: string;
    price:  string;
    logo?:  string
    constructor(p_name:string, price:string, url:string) {
      this.p_name = p_name;
      this.price = price;
      this.logo = url;
    }
}



// Converts JSON strings to/from your types
