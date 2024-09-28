import type { LyricLine, LyricWord } from './types/lyric.d.ts';
export function parseYrc(yrc: string) {
    let lyric: LyricLine[] = [];
    yrc.split('\n').forEach((line) => {
        let lrcline: LyricLine;
        let regres = /\[(\d+),(\d+)\](.*)$/.exec(line);
        if (regres !== null) {
            lrcline = {
                time: regres?.[1],
                lrc: []
            };
            let lineText = regres?.[3];
            // 正则匹配模式：捕获 start, duration 和 data 部分，使用非贪婪匹配
            const regex = /\((\d+),(\d+),\d+\)(.*?)(?=\(|$)/g;
            while ((regres = regex.exec(lineText)) !== null) {
                lrcline.lrc.push({
                    time: regres[1],
                    duration: regres[2],
                    text: regres[3]
                });
            }
            lyric.push(lrcline);
        }
    })
    return lyric;
}

export function parseLrc(lrc: string) {
    let lyric: LyricLine[] = [];
    lrc.split('\n').forEach(line => {
        let linetext = lrcToLyric(line);
        let linetime = lrcToMS(line);
        if (linetime !== null) {
            lyric.push({
                time: linetime,
                lrc: [
                    {
                        time: linetime,
                        duration: '0',
                        text: linetext
                    }
                ]
            });
        }
    });
    return lyric;
}

export function parseSecondaryLrc(secondaryLrc: string, parsedLyric: LyricLine[], keyName: 'tran' | 'roma') {
    // console.log('secondaryLrc解析', keyName);

    let lyric = parsedLyric.map(item => ({ ...item }));
    secondaryLrc.split('\n').forEach(line => {
        let linetext = lrcToLyric(line);
        if (linetext) {
            let linetime = lrcToMS(line);
            let lineIndex = lyric.findIndex(item => item.time == linetime);
            if (lineIndex >= 0) {// 找到了
                lyric[lineIndex][keyName] = linetext;
            }
        }
    });
    return lyric;
}

/**
获取一行lrc的第一个时间标签，并转换为毫秒
@param lyricLine 一行歌词
*/
function lrcToMS(lyricLine: string) {
    let express = /\[(\d+)[:.](\d+)[:.](\d+)\]/
    let lineTime = express.exec(lyricLine);
    if (lineTime == null) {
        return null;
    }
    if (lineTime[3].length == 1) {
        lineTime[3] = '0' + lineTime[3];
    }
    return String((parseInt(lineTime[1]) * 60 + parseInt(lineTime[2])) * 1000 + parseInt(lineTime[3].slice(0, 2)) * 10);
}
/**
 * 获取一行lrc中的歌词文本
 * @param lyricLine 一行lrc
 */
function lrcToLyric(lyricLine: string) {
    let express = /\[\d+[:.]\d+[:.]\d+\](.*)/
    let lineTime = express.exec(lyricLine);
    if (lineTime == null) {
        return '';
    }
    return lineTime[1];
}
