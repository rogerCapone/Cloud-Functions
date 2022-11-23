export interface Score {
 color:           string;
 name:            string;
 score_out_of_10: number;
}
export interface ScoreData {
 scoreInfo:     Score[];
 summary  :     string;
}
