import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

export class TimeUtils {
    static init() {
        dayjs.extend(relativeTime);
        dayjs.locale('zh-cn');
    }
    
    static getRelativeTime(timestamp?: number | string): string {
        if (!timestamp) {
            return '未编辑';
        }
        
        try {
            let time: number;
            if (typeof timestamp === 'string') {
                time = dayjs(timestamp).unix();
            } else {
                time = timestamp;
            }
            
            return dayjs.unix(time).fromNow();
        } catch (err) {
            console.error('[TimeUtils] 时间转换失败:', err);
            return '未编辑';
        }
    }

    static toISOString(timestamp: number | string): string | undefined {
        try {
            if (typeof timestamp === 'number') {
                return dayjs.unix(timestamp).toISOString();
            }
            return dayjs(timestamp).toISOString();
        } catch (err) {
            console.error('[TimeUtils] ISO时间转换失败:', err);
            return undefined;
        }
    }
}

// 初始化时间工具
TimeUtils.init(); 