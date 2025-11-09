// najprostszy event bus bez zależności
type Handler = () => void;
const map = new Map<string, Set<Handler>>();

export const EventBus = {
  on(event: string, cb: Handler) {
    if (!map.has(event)) map.set(event, new Set());
    map.get(event)!.add(cb);
    return () => EventBus.off(event, cb);
  },
  off(event: string, cb: Handler) {
    map.get(event)?.delete(cb);
  },
  emit(event: string) {
    map.get(event)?.forEach((cb) => cb());
  },
};

// nazwy zdarzeń w jednym miejscu:
export const EVENTS = {
  WARDROBE_PHOTO_ADDED: "WARDROBE_PHOTO_ADDED",
} as const;
