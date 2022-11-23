

export interface AviationStack {
    pagination: Pagination;
    data:       Datum[];
}

export interface Datum {
    flight_date:   Date;
    flight_status: FlightStatus;
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

export enum FlightStatus {
    Scheduled = "scheduled",
}

export interface Pagination {
    limit:  number;
    offset: number;
    count:  number;
    total:  number;
}

// Converts JSON strings to/from your types
