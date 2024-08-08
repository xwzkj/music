interface Window {
    sendLyric: (Lyric: any) => void;
    sendThemeColors: (themeColor: string) => void;
    setLyricWindowShow: (show: boolean) => void;
    isElectron: boolean;
}