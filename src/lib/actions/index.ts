// Barrel export for the actions framework
export * from "./types";
export * from "./registry";
export * from "./intent-parser";
export * from "./queue";
export * from "./permissions";

// Side-effect imports — register service action handlers
import "@/lib/shopify-actions";
import "@/lib/calendar-actions";
