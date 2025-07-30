import { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";

interface CacheEntry {
  data: any;
  timestamp: number;
  loading: boolean;
}

interface FetchRequest {
  url: string;
  parserType: string;
  resolve: (data: any) => void;
  reject: (error: string) => void;
}

// Global cache and request queue
const dataCache = new Map<string, CacheEntry>();
const requestQueue = new Map<string, FetchRequest[]>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function useCentralizedDataFetching() {
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Process queued requests
  const processQueue = useCallback(async () => {
    if (isProcessing || requestQueue.size === 0) return;

    setIsProcessing(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Group requests by URL to batch fetch
      const urlGroups = new Map<string, FetchRequest[]>();

      for (const [key, requests] of requestQueue.entries()) {
        const [url, parserType] = key.split("|");
        if (!urlGroups.has(url)) {
          urlGroups.set(url, []);
        }
        urlGroups.get(url)!.push(...requests);
      }

      // Fetch each unique URL
      for (const [url, requests] of urlGroups) {
        if (controller.signal.aborted) break;

        try {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok)
            throw new Error(`Failed to fetch: ${response.statusText}`);

          const csvText = await response.text();
          const parsed = Papa.parse(csvText, { header: false });

          // Process each request with different parser types
          for (const request of requests) {
            try {
              const data = parseDataByType(
                parsed.data as string[][],
                request.parserType
              );
              request.resolve(data);
            } catch (error) {
              request.reject(
                error instanceof Error ? error.message : "Parsing error"
              );
            }
          }
        } catch (error) {
          // Reject all requests for this URL
          for (const request of requests) {
            request.reject(
              error instanceof Error ? error.message : "Network error"
            );
          }
        }
      }
    } finally {
      requestQueue.clear();
      setIsProcessing(false);
    }
  }, [isProcessing]);

  // Fetch data with intelligent caching and batching
  const fetchData = useCallback(
    (url: string, parserType: string): Promise<any> => {
      const cacheKey = `${url}|${parserType}`;
      const now = Date.now();

      // Check cache first
      const cached = dataCache.get(cacheKey);
      if (cached && now - cached.timestamp < CACHE_TTL && !cached.loading) {
        return Promise.resolve(cached.data);
      }

      // Mark as loading in cache
      dataCache.set(cacheKey, { data: null, timestamp: now, loading: true });

      return new Promise((resolve, reject) => {
        const request: FetchRequest = { url, parserType, resolve, reject };

        if (!requestQueue.has(cacheKey)) {
          requestQueue.set(cacheKey, []);
        }
        requestQueue.get(cacheKey)!.push(request);

        // Process queue if not already processing
        if (!isProcessing) {
          processQueue();
        }
      });
    },
    [isProcessing, processQueue]
  );

  // Cleanup expired cache entries
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      for (const [key, entry] of dataCache.entries()) {
        if (now - entry.timestamp > CACHE_TTL) {
          dataCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanup, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, []);

  return { fetchData, isProcessing };
}

// Simplified parser function - you can expand this based on your existing parsers
function parseDataByType(rows: string[][], parserType: string): any {
  // This is a simplified version - you should integrate your existing parser logic here
  switch (parserType) {
    case "table":
      return {
        tableData: {
          columns: rows[0] || [],
          rows: rows.slice(1) || [],
        },
      };
    case "pieChart":
      return {
        chartData: {
          labels: rows
            .slice(1)
            .map((row) => row[0])
            .filter(Boolean),
          datasets: [
            {
              data: rows
                .slice(1)
                .map((row) => parseFloat(row[1]) || 0)
                .filter((val) => !isNaN(val)),
            },
          ],
        },
      };
    default:
      return {
        chartData: {
          labels: rows
            .slice(1)
            .map((row) => row[0])
            .filter(Boolean),
          datasets: [
            {
              data: rows
                .slice(1)
                .map((row) => parseFloat(row[1]) || 0)
                .filter((val) => !isNaN(val)),
            },
          ],
        },
      };
  }
}
