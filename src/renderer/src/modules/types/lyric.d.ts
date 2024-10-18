export interface LyricWord {
    time: number,
    duration: number,
    text: string,
}
export interface LyricLine {
    time: number,
    lrc: LyricWord[],
    tran?: string,
    roma?: string,
}