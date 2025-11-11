// src/core/Logger.ts
export const Logger = {
  warn(ctx: string, payload?: unknown, note?: string) {
    // tu ewentualnie rozbudujesz o Sentry/bugsnag itd.
    console.warn(`[${ctx}]`, payload ?? "", note ?? "");
  },
  error(ctx: string, payload?: unknown, note?: string) {
    console.error(`[${ctx}]`, payload ?? "", note ?? "");
  },
  info(ctx: string, payload?: unknown, note?: string) {
    console.info(`[${ctx}]`, payload ?? "", note ?? "");
  },
};
