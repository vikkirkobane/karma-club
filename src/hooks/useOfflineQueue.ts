import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useErrorHandler } from './useErrorHandler';

interface QueuedAction<T = unknown> {
  id: string;
  action: () => Promise<T>;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'offline_action_queue';

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { handleError } = useErrorHandler();

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (savedQueue) {
      try {
        const parsedQueue = JSON.parse(savedQueue);
        setQueue(Array.isArray(parsedQueue) ? parsedQueue : []);
      } catch (error) {
        console.error('Failed to parse saved queue:', error);
      }
    }
  }, []);

  // Save queue to localStorage when it changes
  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } else {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
    }
  }, [queue]);

  const addToQueue = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    if (navigator.onLine) {
      return await action();
    }

    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const newAction: QueuedAction = {
        id,
        action,
        timestamp: Date.now(),
        retryCount: 0,
      };

      setQueue(prev => [...prev, newAction]);
      
      // Reject after adding to queue
      reject(new Error('Action queued for offline processing'));
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0 || !navigator.onLine) return;

    setIsProcessing(true);
    const [current, ...remaining] = queue;

    try {
      await current.action();
      // Successfully processed, remove from queue
      setQueue(remaining);
      return true;
    } catch (error) {
      // Failed, update retry count or give up after max retries
      const maxRetries = 3;
      if (current.retryCount < maxRetries) {
        setQueue(prev => [
          ...remaining,
          { ...current, retryCount: current.retryCount + 1 }
        ]);
      } else {
        handleError(
          new Error(`Failed after ${maxRetries} attempts`),
          'processing queued action'
        );
        setQueue(remaining); // Remove failed action after max retries
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [queue, isProcessing, handleError]);

  // Auto-process queue when online
  useEffect(() => {
    const handleOnline = () => {
      if (queue.length > 0) {
        processQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queue, processQueue]);

  return {
    queue,
    addToQueue,
    processQueue,
    isProcessing,
    queueLength: queue.length,
  };
};