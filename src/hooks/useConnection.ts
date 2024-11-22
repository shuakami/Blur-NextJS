// useConnection.ts

import { useState, useEffect, useRef, useMemo } from 'react';
import { ConnectionManager } from '@/lib/ConnectionManager';
import { ConnectionState } from '@/types/connection';
import useTranslation from '@/hooks/useTranslation';

export interface ConnectionInfo extends ConnectionState {
    isOnline: boolean;
    isUnstable: boolean;
    averageLatency: number;    // 平均总延迟
    networkLatency: number;    // 网络延迟
    processingLatency: number; // 服务器处理延迟
    networkQuality: 'good' | 'fair' | 'poor';
}

export const useConnection = (): ConnectionInfo => {
    const [state, setState] = useState<ConnectionState>({
        status: 'connecting',
        clientLatency: 0,
        serverLatency: 0,
        region: '',
        lastSyncId: null,
        lastUpdate: null,
        serverStatus: null,
        isHealthy: true
    });

    // 使用定长数组存储最近5次延迟数据
    const latencyHistoryRef = useRef<number[]>([]);
    const MAX_HISTORY_LENGTH = 5;

    const managerRef = useRef<ConnectionManager | null>(null);

    // 简化的延迟计算方法
    const calculateAverageLatency = (newLatency: number): number => {
        const history = latencyHistoryRef.current;

        if (history.length >= MAX_HISTORY_LENGTH) {
            history.shift();
        }
        history.push(newLatency);

        return Math.round(history.reduce((sum, val) => sum + val, 0) / history.length);
    };

    const evaluateNetworkQuality = (latency: number): 'good' | 'fair' | 'poor' => {
        if (latency <= 1500) return 'good';
        if (latency <= 3000) return 'fair';
        return 'poor';
    };

    useEffect(() => {
        if (!managerRef.current) {
            managerRef.current = new ConnectionManager();
            managerRef.current.on('stateChange', setState);
            managerRef.current.start();
        }

        return () => {
            managerRef.current?.stop();
            managerRef.current = null;
            latencyHistoryRef.current = [];
        };
    }, []);

    // 计算延迟和网络质量
    const totalLatency = state.clientLatency + state.serverLatency;
    const averageLatency = useMemo(() => calculateAverageLatency(totalLatency), [totalLatency]);

    const networkQuality = useMemo(() => evaluateNetworkQuality(averageLatency), [averageLatency]);

    return {
        ...state,
        isOnline: ['connected', 'degraded'].includes(state.status),
        isUnstable: state.status === 'degraded',
        averageLatency,
        networkLatency: state.clientLatency,
        processingLatency: state.serverLatency,
        networkQuality
    };
};
