// DateLabel.tsx
"use client";

import React from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import useTranslation from "@/hooks/useTranslation";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface DateLabelProps {
    timestamp: number;
}

const DateLabel: React.FC<DateLabelProps> = ({ timestamp }) => {
    const { language, t } = useTranslation();
    const date = dayjs(timestamp);
    const now = dayjs();

    if (date.isSame(now, 'day')) {
        return <span>{t('今天')}</span>;
    } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
        return <span>{t('昨天')}</span>;
    } else if (date.isSame(now.subtract(2, 'day'), 'day')) {
        return <span>{t('前天')}</span>;
    } else if (date.isAfter(now.subtract(7, 'day'))) {
        return <span>{t('这个星期')}</span>;
    } else if (date.isAfter(now.subtract(1, 'month'))) {
        return <span>{t('这个月')}</span>;
    } else if (date.isAfter(now.subtract(3, 'month'))) {
        return <span>{t('最近3个月')}</span>;
    } else if (date.isAfter(now.subtract(1, 'year'))) {
        return <span>{t('今年')}</span>;
    } else {
        return <span>{date.format('YYYY')}&npsb;{t('年')}</span>;
    }
};

export default DateLabel;
