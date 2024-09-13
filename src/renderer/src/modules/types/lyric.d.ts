export interface LyricWord {
    time: string | number,
    duration: string | number,
    text: string,
}
export interface LyricLine {
    time: string,
    lrc: LyricWord[],
    tran?: string,
    roma?: string,
}