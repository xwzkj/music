interface Window {
    sendLyric: (Lyric: any) => void;
    sendThemeColor: (themeColor: string) => void;
    isElectron: boolean;
}