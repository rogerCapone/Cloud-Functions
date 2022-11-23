// To parse this data:
//
//   import { Convert, AviationStack2 } from "./file";
//
//   const aviationStack2 = Convert.toAviationStack2(json);

export interface AviationStack2 {
    pagination: Pagination;
    data:       Datum[];
}

export interface Datum {
    flight_date:   Date;
    flight_status: string;
    departure:     { [key: string]: null | string };
    arrival:       { [key: string]: null | string };
    airline:       Airline;
    flight:        Flight;
    aircraft:      null;
    live:          null;
}

export interface Airline {
    name: string;
    iata: string;
    icao: string;
}

export interface Flight {
    number:     string;
    iata:       string;
    icao:       string;
    codeshared: null;
}

export interface Pagination {
    limit:  number;
    offset: number;
    count:  number;
    total:  number;
}

// Converts JSON strings to/from your types
