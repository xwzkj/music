import { LyricLine } from "./lyric.js";

export interface song {
    id: string;
    name: string;
    artist: string;
    picurl: string;
    url?: string;
    tns?: string;
    fee?: string;
    album?: string;
    lyric?: LyricLine[];
}