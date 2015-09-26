import { declareChildApplication } from "single-spa";

declareChildApplication('/apps/1.3.0/app.js', () => window.location.pathname.startsWith('/legacy'));
declareChildApplication('/apps/1.4.6/app.js', () => window.location.pathname.startsWith('/v2'));
