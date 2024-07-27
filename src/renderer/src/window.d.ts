interface Window {
    sendLyric: (Lyric: any) => void;
    sendThemeColors: (themeColor: string) => void;
    isElectron: boolean;
}