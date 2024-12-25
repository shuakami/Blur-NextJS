import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import apiClient from '@/lib/api/config';
import { toast } from './ui/use-toast';

export interface Memory {
    id?: string;
    content: string;
    timestamp: string;
    type?: 'long_term' | 'short_term';
    tags?: string[];
}

export interface MemoryFilter {
    type?: 'long_term' | 'short_term' | 'all';
    search?: string;
    page: number;
    pageSize: number;
}

interface MemoryResponse {
    memories: Memory[];
    total: number;
    currentPage: number;
    totalPages: number;
}

interface UseMemoryOptions {
    filter: MemoryFilter;
    enabled?: boolean;
}

export function useMemory({ filter, enabled = true }: UseMemoryOptions) {
    const { userId } = useAuth();
    const queryClient = useQueryClient();

    // 构建查询参数
    const buildQueryParams = (filter: MemoryFilter) => {
        const params = new URLSearchParams();
        params.append('page', filter.page.toString());
        params.append('page_size', filter.pageSize.toString());
        
        if (filter.type && filter.type !== 'all') {
            params.append('type', filter.type);
        }
        
        if (filter.search) {
            params.append('search', filter.search);
        }

        return params;
    };

    // 获取记忆数据
    const { 
        data, 
        isLoading, 
        error,
        refetch,
        isFetching
    } = useQuery<MemoryResponse, Error>({
        queryKey: ['memories', userId, filter],
        queryFn: async () => {
            try {
                const params = buildQueryParams(filter);
                const response = await apiClient.get<Memory[]>(`/api/v1/memory/?${params.toString()}`);
                return {
                    memories: response.data,
                    total: response.data.length,
                    currentPage: filter.page,
                    totalPages: Math.ceil(response.data.length / filter.pageSize)
                };
            } catch (error) {
                console.error('获取记忆失败:', error);
                throw new Error('获取记忆失败');
            }
        },
        enabled: enabled && !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    // 预加载下一页
    const preloadNextPage = async () => {
        if (data && data.currentPage < data.totalPages) {
            const nextPageFilter = { ...filter, page: filter.page + 1 };
            const params = buildQueryParams(nextPageFilter);
            
            await queryClient.prefetchQuery<MemoryResponse>({
                queryKey: ['memories', userId, nextPageFilter],
                queryFn: async () => {
                    const response = await apiClient.get<Memory[]>(`/api/v1/memory/?${params.toString()}`);
                    return {
                        memories: response.data,
                        total: response.data.length,
                        currentPage: nextPageFilter.page,
                        totalPages: Math.ceil(response.data.length / nextPageFilter.pageSize)
                    };
                },
                staleTime: 1000 * 60 * 5,
            });
        }
    };

    // 删除单条记忆
    const deleteMemory = async (memoryId: string) => {
        try {
            console.log('开始删除记忆:', memoryId);
            await apiClient.delete(`/api/v1/memory/${memoryId}`);
            console.log('API 调用成功');
            toast({
                title: '记忆删除成功',
                variant: 'default',
            });
            // 使缓存失效，触发重新获取
            await queryClient.invalidateQueries({ queryKey: ['memories', userId] });
            console.log('缓存已更新');
        } catch (error) {
            console.error('删除记忆失败:', error);
            toast({
                title: '删除记忆失败',
                variant: 'destructive',
            });
            throw error;
        }
    };

    // 批量删除记忆
    const batchDeleteMemories = async (query?: string, tags?: string[]) => {
        try {
            if (!query && (!tags || tags.length === 0)) {
                throw new Error('必须提供搜索关键词或标签');
            }

            await apiClient.delete('/api/v1/memory/', {
                data: { query, tags }
            });
            
            toast({
                title: '批量删除成功',
                variant: 'default',
            });
            // 使缓存失效，触发重新获取
            await queryClient.invalidateQueries({ queryKey: ['memories', userId] });
        } catch (error) {
            console.error('批量删除失败:', error);
            toast({
                title: '批量删除失败',
                variant: 'destructive',
            });
            throw error;
        }
    };

    // 计算分页信息
    const pagination = {
        currentPage: data?.currentPage ?? filter.page,
        totalPages: data?.totalPages ?? 1,
        hasNextPage: data ? data.currentPage < data.totalPages : false,
        hasPreviousPage: data ? data.currentPage > 1 : false,
    };

    return {
        memories: data?.memories ?? [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        error,
        pagination,
        deleteMemory,
        batchDeleteMemories,
        preloadNextPage,
        refetch,
    };
}