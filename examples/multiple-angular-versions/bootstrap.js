import { declareChildApplication, getCurrentlyRelevantAppLocation } from "single-spa";

declareChildApplication('/apps/1.2.0/1.2.0-app.js', () => window.location.pathname.startsWith('/legacy'));
declareChildApplication('/apps/1.4.5/1.4.5-app.js', () => window.location.pathname.startsWith('/v2'));
