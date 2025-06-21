
export const API_CONFIG = {
  // Fraud API
  FRAUD_API_URL: import.meta.env.VITE_FRAUD_API_URL,
  FRAUD_API_KEY: import.meta.env.VITE_FRAUD_API_KEY,

  // Steadfast API
  STEADFAST_API_URL: import.meta.env.VITE_STEADFAST_API_URL,
  STEADFAST_API_KEY: import.meta.env.VITE_STEADFAST_API_KEY,
  STEADFAST_SECRET_KEY: import.meta.env.VITE_STEADFAST_SECRET_KEY,
} as const;
