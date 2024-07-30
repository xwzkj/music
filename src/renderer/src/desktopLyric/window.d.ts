interface Window {
    getLyric: (changeLyric: any) => void;
    getThemeColors: (changeThemeColors: any) => void;
    isLyricWindowLocked: () => Promise<boolean>;
    lyricWindowLock: (islock: boolean) => void;
  }