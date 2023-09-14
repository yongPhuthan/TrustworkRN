// Replace the variable names and types with your actual environment variables
declare module '@env' {
    export const API_KEY: string;
    export const API_URL: string;
    export const HOST_URL: string;
    export const DEV_API_URL: string;
    export const PROD_API_URL: string;
    export const PROJECT_NAME: string;
    export const PROJECT_FIREBASE:string
    export const CLOUDFLARE_API_TOKEN:string;
    export const CLOUDFLARE_DIRECT_UPLOAD_URL:string;
    export const CLOUDFLARE_UPLOAD_URL:string
    export const CLOUDFLARE_R2_BUCKET_BASE_URL:string
    export const CLOUDFLARE_WORKER : string
    export const CLOUDFLARE_WORKER_DEV:string
    export const CLOUDFLARE_WORKER_GALLERY:string
    export const R2_ACCESS_KEY:string
    export  const R2_ACCOUNT_ID:string
    export const R2_SECRET_KEY :string
    export const CLOUDFLARE_R2_PUBLIC_URL:string
    // Add more environment variables if needed
  }
  