// To parse this data:
//
//   import { Convert } from "./file";
//
//   const airport = Convert.toAirport(json);

export interface Airport {
    cityId:      string;
    name:        string;
    country:     string;
    description: null;
    icon:        null;
    location:    Location;
    places:      any[];
    airports:    string[];
    images:      any[];
}

export interface Location {
    longitude: number;
    latitude:  number;
}
