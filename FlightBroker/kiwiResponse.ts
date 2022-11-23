// To parse this data:
//
//   import { Convert, KiwiResponse } from "./file";
//
//   const kiwiResponse = Convert.toKiwiResponse(json);

export interface KiwiResponse {
    search_id?:             string;
    data:                  Datum[];
    connections?:           any[];
    time?:                  number;
    currency?:              string;
    currency_rate?:         number;
    fx_rate?:               number;
    refresh?:               any[];
    del?:                   string;
    ref_tasks?:             any[];
    search_params?:         SearchParams;
    all_stopover_airports?: any[];
    all_airlines?:          any[];
}

export interface Datum {
    id:                            string;
    dTime:                         number;
    dTimeUTC?:                      number;
    aTime:                         number;
    aTimeUTC?:                      number;
    nightsInDest?:                  number;
    duration?:                      Duration;
    fly_duration:                  string;
    flyFrom?:                       string;
    cityFrom?:                      string;
    cityCodeFrom?:                  string;
    countryFrom:                   Country;
    mapIdfrom?:                     string;
    flyTo?:                         string;
    cityTo?:                        string;
    cityCodeTo?:                    string;
    countryTo:                    Country;
    mapIdto?:                       string;
    distance:                      number;
    routes?:                        Array<string[]>;
    airlines?:                      string[];
    pnr_count?:                     number;
    has_airport_change?:            boolean;
    technical_stops?:               number;
    price:                         number;
    bags_price?:                    { [key: string]: number };
    baglimit?:                      Baglimit;
    availability:                  Availability;
    facilitated_booking_available?: boolean;
    conversion?:                    number;
    quality?:                       number;
    booking_token:                 string;
    deep_link:                     string;
    tracking_pixel?:                string;
    p1?:                            number;
    p2?:                            number;
    p3?:                            number;
    transfers?:                     any[];
    type_flights?:                  string[];
    virtual_interlining?:           boolean;
    found_on?:                      string[];
    route?:                         Route[];
}


export interface Availability {
    seats: number;
}

export interface Baglimit {
    hand_width?:          number;
    hand_height?:         number;
    hand_length?:         number;
    hand_weight?:         number;
    hold_width?:          number;
    hold_height?:         number;
    hold_length?:         number;
    hold_dimensions_sum?: number;
    hold_weight?:         number;
}



export interface Country {
    code: string;
    name: string;
}




export interface Duration {
    departure?: number;
    return?:    number;
    total?:     number;
}




export interface Route {
    fare_basis?:            string;
    fare_category?:         string;
    fare_classes?:          string;
    price:                 number;
    fare_family?:           string;
    found_on?:              string;
    last_seen?:             number;
    refresh_timestamp?:     number;
    source?:                string;
    return?:                number;
    bags_recheck_required?: boolean;
    guarantee?:             boolean;
    id?:                    string;
    combination_id?:        string;
    original_return?:       number;
    aTime:                 number;
    dTime:                 number;
    aTimeUTC?:              number;
    dTimeUTC?:              number;
    mapIdfrom?:             string;
    mapIdto?:               string;
    cityTo?:                string;
    cityFrom?:              string;
    cityCodeFrom?:          string;
    cityCodeTo?:            string;
    flyTo?:                 string;
    flyFrom?:               string;
    airline?:               string;
    operating_carrier?:     string;
    equipment?:             string;
    latFrom?:               number;
    lngFrom?:               number;
    latTo?:                 number;
    lngTo?:                 number;
    flight_no?:             number;
    vehicle_type?:          string;
    operating_flight_no?:   string;
}



export interface SearchParams {
    flyFrom_type?: string;
    to_type?:      string;
    seats?:        Seats;
}

export interface Seats {
    passengers?: number;
    adults?:     number;
    children?:   number;
    infants?:    number;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toKiwiResponse(json: string): KiwiResponse {
        return JSON.parse(json);
    }

    public static kiwiResponseToJson(value: KiwiResponse): string {
        return JSON.stringify(value);
    }
}
