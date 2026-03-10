// client/src/config.js
console.log("🚀 Config loaded at:", new Date().toISOString());
console.log("📌 All import.meta.env:", import.meta.env);
console.log("📌 VITE_API_URL value:", import.meta.env.VITE_API_URL);

export const API_URL = import.meta.env.VITE_API_URL || "/api";

console.log("📌 Final API_URL being exported:", API_URL);
