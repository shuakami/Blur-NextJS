import { getTranslate } from '@/hooks/i18n/useTranslation';
import mime from 'mime-types';

// 设置 API 基础 URL 和端口
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : process.env.NEXT_PUBLIC_LOCAL_API_URL;

// 文件类型配置
const FILE_TYPE_CONFIG = {
    documents: [
        // 文档类型
        '.pdf', '.doc', '.docx', '.xls', '.xlsx',
        '.ppt', '.pptx', '.txt', '.rtf', '.odt',
        '.ods', '.odp', '.csv', '.md', '.mdx',
        '.json', '.xml', '.yaml', '.yml', '.toml',
         '.ini', '.conf', '.cfg', '.properties', '.env',
    ],
    images: [
        // 图片类型
        '.jpg', '.jpeg', '.png', '.gif', '.bmp',
        '.webp', '.svg', '.tiff', '.ico', '.heic', '.heif'
    ],
    archives: [
        // 压缩文件
        '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.iso', '.log',
        // 音视频类型
        '.mp3', '.wav', '.aac', '.flac', '.mp4', '.avi', '.mkv', '.mov', '.wmv'
    ],
    code: [
        // 代码文件
        '.json', '.xml', '.yaml', '.yml',
        '.js', '.ts', '.jsx', '.tsx', '.vue',
        '.html', '.css', '.scss', '.less', '.sass',
        '.py', '.java', '.c', '.cpp', '.h', '.hpp',
        '.go', '.php', '.rb', '.swift', '.kt',
        '.rs', '.dart', '.elixir', '.erlang', '.haskell',
        '.ocaml', '.pascal', '.perl', '.prolog', '.scala',
        '.sql', '.kotlin', '.groovy', '.rust', '.typescript',
        '.kotlin', '.groovy', '.rust', '.typescript',
        '.sql', '.kotlin', '.groovy', '.rust', '.typescript',
        '.sql', '.kotlin', '.groovy', '.rust', '.typescript',
    ]
} as const;

// 获取所有支持的 MIME 类型
const ALLOWED_TYPES = Object.values(FILE_TYPE_CONFIG)
    .flat()
    .map(ext => mime.lookup(ext))
    .filter((type): type is string => type !== false);

// 更新 FILE_LIMITS
const FILE_LIMITS = {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES,
    ALLOWED_IMAGE_TYPES: FILE_TYPE_CONFIG.images
        .map(ext => mime.lookup(ext))
        .filter((type): type is string => type !== false)
} as const;

// 上传错误类型
export class UploadError extends Error {
    constructor(
        message: string,
        public readonly code: number,
        public readonly detail?: string
    ) {
        super(message);
        this.name = 'UploadError';
    }
}

// 上传响应类型
export interface UploadResponse {
    message: string;
    file_id: string;
    filename: string;
    file_type: string;
    size: number;
    created_at: string;
    url?: string;
}

// 上传参数类型
export interface UploadParams {
    file: File;
    user_id: string;
    jwtToken: string;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
}

// 检查文件是否符合要求
const validateFile = (file: File): void => {
    const t = getTranslate();

    // 检查文件大小
    if (file.size > FILE_LIMITS.MAX_SIZE) {
        throw new UploadError(
            t('文件大小超出限制'),
            413,
            t('文件大小不能超过 {{size}}MB', { size: String(FILE_LIMITS.MAX_SIZE / 1024 / 1024) })
        );
    }

    // 检查是否为图片文件
    if (file.type.startsWith('image/')) {
        // 检查图片类型是否支持
        if (!FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
            throw new UploadError(
                t('不支持的图片类型'),
                415,
                t('仅支持以下图片格式: {{types}}', {
                    types: FILE_LIMITS.ALLOWED_IMAGE_TYPES
                        .map(type => type.split('/')[1].toUpperCase())
                        .join(', ')
                })
            );
        }
        return;
    }

    // 检查其他文件类型
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isAllowedExtension = Object.values(FILE_TYPE_CONFIG)
        .flat()
        .some(ext => ext.slice(1) === fileExtension);

    const isAllowedType = FILE_LIMITS.ALLOWED_TYPES.some(type => file.type.startsWith(type));
    if (!isAllowedType && !isAllowedExtension) {
        throw new UploadError(
            t('不支持的文件类型'),
            415,
            t('仅支持以下文件类型: {{types}}', {
                types: FILE_LIMITS.ALLOWED_TYPES
                    .map(type => type.replace('/', ''))
                    .join(', ')
            })
        );
    }
};

// 将文件转换为 base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            // 移除 data:image/jpeg;base64, 前缀
            resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * 上传文件到服务器
 * @param params 上传参数
 * @returns 上传响应
 */
export const uploadFile = async ({
    file,
    user_id,
    jwtToken,
    onProgress,
    signal
}: UploadParams): Promise<UploadResponse> => {
    const t = getTranslate();

    try {
        // 验证文件
        validateFile(file);

        // 构建 URL，添加 user_id 作为查询参数
        const url = new URL(`${API_BASE_URL}/api/v1/files/upload`);
        url.searchParams.append('user_id', user_id);

        // 检查是否为图片文��
        const isImage = file.type.startsWith('image/');
        let formData: FormData;

        if (isImage) {
            // 处理图片文件
            const base64Data = await fileToBase64(file);
            formData = new FormData();
            formData.append('base64_data', base64Data);
            formData.append('image_type', file.type.split('/')[1]);
            formData.append('filename', file.name);
        } else {
            // 处理普通文件
            formData = new FormData();
            formData.append('file', file);
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // 处理进度
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round((event.loaded * 100) / event.total);
                    onProgress(progress);
                }
            };

            // 处理完成
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject(new UploadError(t('响应解析失败'), xhr.status));
                    }
                } else {
                    let errorMessage: string;
                    let errorDetail: string | undefined;

                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        errorDetail = errorData.detail || errorData.message;
                        
                        if (xhr.status === 400 && errorDetail) {
                            errorMessage = errorDetail;
                        } else {
                            switch (xhr.status) {
                                case 400:
                                    errorMessage = t('请求参数错误');
                                    break;
                                case 401:
                                    errorMessage = t('身份验证失败');
                                    break;
                                case 413:
                                    errorMessage = t('文件大小超出限制');
                                    break;
                                case 415:
                                    errorMessage = t('不支持的文件类型');
                                    break;
                                case 429:
                                    errorMessage = t('请求过于频繁');
                                    break;
                                case 500:
                                    errorMessage = t('服务器内部错误');
                                    break;
                                default:
                                    errorMessage = t('文件上传失败');
                            }
                        }
                    } catch {
                        errorDetail = xhr.statusText;
                        errorMessage = t('文件上传失败');
                    }

                    reject(new UploadError(errorMessage, xhr.status, errorDetail));
                }
            };

            // 处理错误
            xhr.onerror = () => {
                reject(new UploadError(t('网络错误'), 0));
            };

            // 处理取消
            xhr.onabort = () => {
                reject(new Error('AbortError'));
            };

            // 发送请求
            xhr.open('POST', url.toString());
            xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`);

            // 设置取消信号
            if (signal) {
                signal.addEventListener('abort', () => xhr.abort());
            }

            xhr.send(formData);
        });

    } catch (error) {
        throw error;
    }
}; 