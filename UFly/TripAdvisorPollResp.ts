// To parse this data:
//
//   import { Convert, TripAdvisorPollResp } from "./file";
//
//   const tripAdvisorPollResp = Convert.toTripAdvisorPollResp(json);

export interface TripAdvisorPollResp {
    summary?:           Summary;
    itineraries:       Itinerary[];
    equipment?:         Equipment[];
    amenities?:         Amenity[];
    carriers:          Carrier[];
    providers:         Provider[];
    airports?:          Airport[];
    air_watch_info?:    AirWatchInfo;
    disclaimers?:       Disclaimer[];
    fly_score_info?:    FlyScoreInfo;
    recommended_itins?: RecommendedItins;
    search_params?:     SearchParams;
}

export interface AirWatchInfo {
    sw?: boolean;
    ws?: boolean;
}

export interface Airport {
    d?:  string;
    tz?: string;
    c?:  string;
    i?:  number;
    g?:  G;
    cc?: string;
    cn?: string;
    n?:  string;
    st?: string;
}

export interface G {
    lat?: number;
    lon?: number;
}

export interface Amenity {
    c?: C;
    t?: string;
    l?: string;
}

export enum C {
    Power = "POWER",
    RegularSeat = "REGULAR_SEAT",
    Tv = "TV",
    Wifi = "WIFI",
}

export interface Carrier {
    i?: number;
    c: string;
    l: string;
    n: string;
}

export interface Disclaimer {
    st?: string;
    lt?: string;
    dt?: string;
    ct?: string;
    lk?: string;
}

export interface Equipment {
    i?: string;
    n?: string;
    t?: string;
}

export interface FlyScoreInfo {
    TERRIBLE?:  string;
    AVERAGE?:   string;
    POOR?:      string;
    EXCELLENT?: string;
    VERY_GOOD?: string;
}

export interface Itinerary {
    key?: string;
    ac?:  string;
    l:   ItineraryL[];
    f:   FElement[];
    fsl?: string;
    fs?:  number;
    od?:  string;
}

export interface FElement {
    l:  FL[];
    lo?: any[];
    od?: any[];
}

export interface FL {
    da:  string;
    aa:  string;
    c?:   number;
    m?:   string;
    o:   string;
    e?:   string;
    f?:   string;
    si?:  number;
    n?:   number;
    dd:  Date;
    ad:  Date;
    ac?:  C[];
    tt?:  string;
    stf?: boolean;
    di?:  number;
}



export interface ItineraryL {
    pr: PR;
    id?: string;
    m?:  string;
    s:  string;
    pl?: any[];
}



export interface PR {
    p?:  number;
    f?:  number;
    dp: string;
    df?: string;
}

export interface Provider {
    l: string;
    n?: string;
    i: string;
}

export interface RecommendedItins {
    BEST_VALUE_2?: Itinerary;
    BEST_VALUE_1?: Itinerary;
    BEST_VALUE_3?: Itinerary;
}

export interface SearchParams {
    et?:   number;
    pvid?: string;
    it?:   string;
    o?:    number;
    st?:   Date;
    so?:   string;
    t?:    T;
    s?:    Route[];
    sid?:  string;
    c?:    number;
    n?:    number;
    f?:    SearchParamsF;
}

export interface SearchParamsF {
    ss?:  any[];
    mc?:  any[];
    ns?:  string[];
    oc?:  any[];
    da?:  any[];
    aa?:  any[];
    ca?:  any[];
    plp?: any[];
    al?:  any[];
    tt?:  any[];
    am?:  any[];
}

export interface Route {
    dd?: Date;
    o?:  string;
    d?:  string;
    no?: boolean;
    nd?: boolean;
}

export interface T {
    a?: number;
    s?: number;
    c?: number[];
}

export interface Summary {
    cu?:  string;
    et?:  number;
    fi?:  number;
    pd?:  string;
    dp?:  Ap[];
    ap?:  Ap[];
    sd?:  Sa[];
    sa?:  Sa[];
    su?:  Su[];
    a?:   A[];
    cp?:  Ap[];
    ocp?: Ap[];
    pp?:  Ap[];
    sp?:  Ap[];
    dn?:  number;
    dx?:  number;
    da?:  number;
    nr?:  number;
    so?:  So[];
    c?:   boolean;
    f?:   boolean;
    p?:   number;
    sh?:  string;
    op?:  Ap[];
}

export interface A {
    l?: string;
    k?: C;
    t?: string;
}

export interface Ap {
    k?: string;
    t?: string;
    p?: string;
}

export interface Sa {
    k?:   string;
    min?: Date;
    max?: Date;
    tz?:  string;
}

export interface So {
    st?: string;
    n?:  string;
    k?:  string;
    dc?: string;
}

export interface Su {
    k?:   string;
    min?: number;
    max?: number;
}

// Converts JSON strings to/from your types
