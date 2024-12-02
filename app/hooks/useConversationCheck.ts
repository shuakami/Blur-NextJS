import { useState, useEffect } from 'react';
import { fetchHistory } from '@/app/[拉取历史]/fetch_history';

const MAX_RETRY_COUNT = 2;

interface UseConversationCheckResult {
  exists: boolean | null;
  isLoading: boolean;
}

export function useConversationCheck(conversation_id?: string, user_id?: string): UseConversationCheckResult {
    const [exists, setExists] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [retryCount, setRetryCount] = useState<number>(0);
  
    useEffect(() => {
      let mounted = true;
      console.log('useEffect triggered', { conversation_id, user_id });
      
      const checkConversationExists = async () => {
        // 关键改动: 如果参数不完整，保持loading状态
        if (!conversation_id || !user_id) {
          return;
        }

        try {
          const history = await fetchHistory({
            user_id,
            conversation_id,
            limit: 1,
          });
          
          if (mounted) {
            const exists = Boolean(history?.messages.length);
            console.log('Fetch success', { exists });
            setExists(exists);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Fetch error', error);
          if (mounted) {
            if (retryCount < MAX_RETRY_COUNT) {
              console.log('Retrying', { retryCount });
              setRetryCount(prev => prev + 1);
            } else {
              setExists(false);
              setIsLoading(false);
            }
          }
        }
      };
  
      checkConversationExists();
      
      return () => {
        mounted = false;
      };
    }, [conversation_id, user_id, retryCount]);
  
    return { exists, isLoading };
}