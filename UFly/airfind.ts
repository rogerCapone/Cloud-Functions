
export class Airfind {
  gmt:            string;
  iata_code:      string;
  city_iata_code: string;
  icao_code:      string;
  country_iso2:   string;
  geoname_id:     string;
  latitude:       string;
  longitude:      string;
  airport_name:   string;
  country_name:   string;
  phone_number:   null;
  timezone:       string;

 constructor(resultsResponse:any){
   this.gmt           = resultsResponse.gmt;
   this.iata_code     = resultsResponse.iata_code;
   this.city_iata_code= resultsResponse.city_iata_code;
   this.icao_code     = resultsResponse.icao_code;
   this.country_iso2  = resultsResponse.country_iso2;
   this.geoname_id    = resultsResponse.geoname_id;
   this.latitude      = resultsResponse.latitude;
   this.longitude     = resultsResponse.longitude;
   this.airport_name  = resultsResponse.airport_name;
   this.country_name  = resultsResponse.country_name;
   this.phone_number  = resultsResponse.phone_number;
   this.timezone      = resultsResponse.timezone;
 }}
