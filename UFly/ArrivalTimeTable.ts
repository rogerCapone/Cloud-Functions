// To parse this data:
//
//   import { Convert, ArrivalTimeTable } from "./file";
//
//   const arrivalTimeTable = Convert.toArrivalTimeTable(json);

export interface ArrivalTimeTable {
    pagination: Pagination;
    data:       Datum[];
}

export interface Datum {
    flight_date:   Date;
    flight_status: string;
    departure:     Arrival;
    arrival:       Arrival;
    airline:       Airline;
    flight:        Flight;
    aircraft:      Aircraft | null;
    live:          Live | null;
}

export interface Aircraft {
    registration: string;
    iata:         string;
    icao:         string;
    icao24:       string;
}

export interface Airline {
    name: string;
    iata: string;
    icao: string;
}

export interface Arrival {
    airport:          string;
    timezone:         string;
    iata:             string;
    icao:             string;
    terminal:         null | string;
    gate:             null | string;
    baggage?:         string;
    delay:            number | null;
    scheduled:        Date;
    estimated:        Date;
    actual:           Date | null;
    estimated_runway: Date | null;
    actual_runway:    Date | null;
}

export interface Flight {
    number:     string;
    iata:       string;
    icao:       string;
    codeshared: Codeshared | null;
}

export interface Codeshared {
    airline_name:  string;
    airline_iata:  string;
    airline_icao:  string;
    flight_number: string;
    flight_iata:   string;
    flight_icao:   string;
}

export interface Live {
    updated:          Date;
    latitude:         number;
    longitude:        number;
    altitude:         number;
    direction:        number;
    speed_horizontal: number;
    speed_vertical:   number;
    is_ground:        boolean;
}

export interface Pagination {
    limit:  number;
    offset: number;
    count:  number;
    total:  number;
}

// Converts JSON strings to/from your types
