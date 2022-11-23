// To parse this data:
//
//   import { Convert } from "./file";
//
//   const airport = Convert.toAirport(json);
export interface Airport {
    id?:            number;
    iata?:          string;
    icao?:          string;
    name?:          string;
    location?:      string;
    street_number?: string;
    street?:        string;
    city?:          string;
    county?:        string;
    state?:         string;
    country_iso?:   string;
    country?:       string;
    postal_code?:   string;
    phone?:         string;
    latitude?:      number;
    longitude?:     number;
    uct?:           number;
    website?:       string;
}
