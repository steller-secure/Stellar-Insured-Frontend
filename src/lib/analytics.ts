export type EventType = "PAGE_VIEW" | "ACTION" | "ERROR";
export type EventCategory = "AUTH" | "POLICY" | "CLAIM" | "NAVIGATION" | "SYSTEM";

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  category: EventCategory;
  name: string;
  data?: Record<string, any>;
  userId?: string; // Optional, to tie to a session
  timestamp: number;
  path: string;
}

const STORAGE_KEY = "stellar_insured_analytics";

class AnalyticsService {
  private getEvents(): AnalyticsEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveEvents(events: AnalyticsEvent[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error("Failed to save analytics event", e);
    }
  }

  public trackEvent(
    type: EventType,
    category: EventCategory,
    name: string,
    data?: Record<string, any>,
    userId?: string
  ) {
    if (typeof window === "undefined") return;

    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      type,
      category,
      name,
      data,
      userId,
      timestamp: Date.now(),
      path: window.location.pathname,
    };

    const events = this.getEvents();
    events.push(event);
    this.saveEvents(events);
    
    // In a real app, you might debounce and send these to a backend
    console.debug("[Analytics] Tracked:", event);
  }

  public trackPageView(path: string, userId?: string) {
    this.trackEvent("PAGE_VIEW", "NAVIGATION", "page_view", { path }, userId);
  }

  public trackAction(category: EventCategory, name: string, data?: Record<string, any>, userId?: string) {
    this.trackEvent("ACTION", category, name, data, userId);
  }

  public trackError(error: Error | string, context?: Record<string, any>, userId?: string) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.trackEvent(
      "ERROR",
      "SYSTEM",
      "application_error",
      { message: errorMessage, stack: errorStack, ...context },
      userId
    );
  }

  public getAnalyticsData(): AnalyticsEvent[] {
    return this.getEvents();
  }

  public clearData() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const analytics = new AnalyticsService();
