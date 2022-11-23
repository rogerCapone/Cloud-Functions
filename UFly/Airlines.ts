// To parse this data:
//
//   import { Convert, Airlines } from "./file";
//
//   const airlines = Convert.toAirlines(json);

export interface Airlines {
    pagination: Pagination;
    data:       Datum[];
}

export interface Datum {
    fleet_average_age:      string;
    callsign:               string;
    hub_code:               string;
    iata_code:              string;
    icao_code:              string;
    country_iso2:           string;
    date_founded:           string;
    iata_prefix_accounting: string;
    airline_name:           string;
    country_name:           string;
    fleet_size:             string;
    status:                 string;
    type:                   string;
}

export interface Pagination {
    offset: number;
    limit:  number;
    count:  number;
    total:  number;
}

// Converts JSON strings to/from your types
