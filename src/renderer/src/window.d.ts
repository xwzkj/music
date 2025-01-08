interface Window {
    isElectron: boolean,
    api: {
        sendLyric: (Lyric: any) => void,
        sendThemeColors: (themeColor: string) => void,
        setLyricWindowShow: (show: boolean) => void,
        netease: (url: string, data: string) => Promise<any>,
        openUrl: (url: string) => Promise<any>,
        appVersion: string,
        windowClose: () => void
    },
    $NMessageApi: import('naive-ui').MessageApi,
    $NNotificationApi: import('naive-ui').NotificationApi,
    $NModalApi: import('naive-ui').ModalApi,
    player: HTMLAudioElement
}
