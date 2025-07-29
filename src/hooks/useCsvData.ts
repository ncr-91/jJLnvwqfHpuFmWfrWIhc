import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

export function useCsvData(url?: string) {
  const [labels, setLabels] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [data2, setData2] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!url) {
      setLabels([]);
      setData([]);
      setData2([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    fetch(url, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        return response.text();
      })
      .then((text) => {
        if (!abortController.signal.aborted && !ignore) {
          const parsed = Papa.parse(text, { header: false });
          const labels: string[] = [];
          const data: number[] = [];
          const data2: (number | null)[] = [];
          for (const row of parsed.data as string[][]) {
            if (
              row.length >= 3 &&
              row[0] &&
              row[1] &&
              !isNaN(Number(row[1])) &&
              row[2] &&
              !isNaN(Number(row[2]))
            ) {
              labels.push(row[0]);
              data.push(Number(row[1]));
              data2.push(Number(row[2]));
            } else if (
              row.length >= 2 &&
              row[0] &&
              row[1] &&
              !isNaN(Number(row[1]))
            ) {
              labels.push(row[0]);
              data.push(Number(row[1]));
              data2.push(null);
            }
          }
          setLabels(labels);
          setData(data);
          setData2(data2);
        }
      })
      .catch((err) => {
        if (!abortController.signal.aborted && !ignore) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted && !ignore) {
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
      abortController.abort();
    };
  }, [url]);

  return { labels, data, data2, loading, error };
}
