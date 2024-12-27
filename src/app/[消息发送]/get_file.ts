import { getTranslate } from '@/hooks/i18n/useTranslation';

// 设置 API 基础 URL 和端口
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : process.env.NEXT_PUBLIC_LOCAL_API_URL;

// 获取文件参数类型
export interface GetFileParams {
    file_id: string;
    user_id: string;
    jwtToken: string;
    signal?: AbortSignal;
}

// 获取文件响应类型
export interface GetFileResponse {
    blob: Blob;
    url: string;
    file_type: string;
}

/**
 * 获取临时文件
 * @param params 获取文件参数
 * @returns 文件响应
 */
export const getTempFile = async (params: GetFileParams): Promise<GetFileResponse> => {
    const t = getTranslate();
    const { file_id, user_id, jwtToken, signal } = params;

    try {
        // 构建 URL，添加 user_id 作为查询参数
        const url = new URL(`${API_BASE_URL}/api/v1/files/temp/${file_id}`);
        url.searchParams.append('user_id', user_id);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
            signal
        });

        // 检查响应状态
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('身份验证失败'));
            }
            throw new Error(t('获取文件失败'));
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const file_type = response.headers.get('content-type') || 'application/octet-stream';

        return {
            blob,
            url: blobUrl,
            file_type
        };
    } catch (error: any) {
        console.error(t('获取文件失败:'), error);
        throw error;
    }
}; 