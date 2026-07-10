import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications(userId: string | undefined) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);
    setPermission(Notification.permission);
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported || !userId || !VAPID_PUBLIC_KEY) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      setSubscription(sub);
      setPermission("granted");

      const subscriptionJson = sub.toJSON();
      await supabase.from("push_subscriptions").upsert({
        user_id: userId,
        endpoint: subscriptionJson.endpoint,
        p256dh: JSON.stringify(subscriptionJson.keys?.p256dh),
        auth: JSON.stringify(subscriptionJson.keys?.auth),
      }, { onConflict: "user_id" });

      return sub;
    } catch (err) {
      console.error("Push subscribe error:", err);
      setPermission("denied");
      return null;
    }
  }, [supported, userId]);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      if (userId) {
        await supabase.from("push_subscriptions").delete().eq("user_id", userId);
      }
    }
    setPermission("default");
  }, [subscription, userId]);

  return { supported, permission, subscribe, unsubscribe, subscription };
}
