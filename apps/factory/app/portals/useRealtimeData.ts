"use client";

import { useEffect, useState, useRef } from "react";
import type { RefreshPayload } from "@luminbridge/db";

export function useRealtimeData<T>(
  userId: number,
  resourceName: RefreshPayload["resource"],
  fetchData: () => Promise<T>,
  initialData: T
): T {
  const [data, setData] = useState<T>(initialData);
  const loadingRef = useRef(false);
  const pendingRefreshRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    let es: EventSource | null = null;
    let pusherCleanup: (() => void) | null = null;

    const performRefresh = async () => {
      if (disposed) return;
      if (loadingRef.current) {
        pendingRefreshRef.current = true;
        return;
      }
      
      loadingRef.current = true;
      try {
        const newData = await fetchData();
        if (!disposed) {
          setData(newData);
        }
      } catch (err) {
        console.error(`Error refreshing ${resourceName}:`, err);
      } finally {
        loadingRef.current = false;
        if (pendingRefreshRef.current) {
          pendingRefreshRef.current = false;
          void performRefresh();
        }
      }
    };

    (async () => {
      try {
        // Dynamic import so Pusher doesn't bloat initial bundle
        const { getPusherClient, userChannelName } = await import("@luminbridge/db/client");
        const pusher = getPusherClient();
        
        if (pusher) {
          const channel = pusher.subscribe(userChannelName(userId));
          const handler = (payload: RefreshPayload) => {
            if (payload.resource === resourceName) {
              void performRefresh();
            }
          };
          
          channel.bind("refresh", handler);
          
          pusherCleanup = () => {
            try {
              channel.unbind("refresh", handler);
              pusher.unsubscribe(userChannelName(userId));
            } catch {
              // ignore
            }
          };
          return;
        }
      } catch {
        // ignore
      }

      // Fallback to SSE
      try {
        es = new EventSource(`/api/notifications/stream?userId=${userId}`);
        es.addEventListener("refresh", (e) => {
          try {
            const payload = JSON.parse(e.data) as RefreshPayload;
            if (payload.resource === resourceName) {
              void performRefresh();
            }
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      disposed = true;
      try { es?.close(); } catch { }
      try { pusherCleanup?.(); } catch { }
    };
  }, [userId, resourceName, fetchData]);

  return data;
}
