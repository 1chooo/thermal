export type County =
  | "宜蘭"
  | "花蓮"
  | "台東"
  | "彰化"
  | "台中"
  | "雲林"
  | "嘉義"
  | "高雄"
  | "台南"
  | "桃園";

export type StationInfo = { county: County; stationName: string; stationCode: string };

/** County → CWB ag station (same mapping as the original Tkinter app). */
export const STATIONS: readonly StationInfo[] = [
  { county: "宜蘭", stationName: "蘭陽分場", stationCode: "72U480" },
  { county: "花蓮", stationName: "花蓮農改", stationCode: "72T250" },
  { county: "台東", stationName: "台東茶改", stationCode: "82S580" },
  { county: "彰化", stationName: "台中農改", stationCode: "72G600" },
  { county: "台中", stationName: "農業試驗所", stationCode: "G2F820" },
  { county: "雲林", stationName: "雲林分場", stationCode: "72K220" },
  { county: "嘉義", stationName: "義竹分場", stationCode: "72M360" },
  { county: "高雄", stationName: "旗南農改", stationCode: "72V140" },
  { county: "台南", stationName: "畜試所", stationCode: "B2N890" },
  { county: "桃園", stationName: "桃園農改", stationCode: "72C440" },
] as const;

const byCounty = Object.fromEntries(
  STATIONS.map((s) => [s.county, s])
) as Record<County, StationInfo>;

export function getStationByCounty(county: string): StationInfo | undefined {
  return byCounty[county as County];
}

export const COUNTY_OPTIONS: County[] = STATIONS.map((s) => s.county);
