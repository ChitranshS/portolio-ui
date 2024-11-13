export const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    appName: import.meta.env.VITE_APP_NAME,
    appVersion: import.meta.env.VITE_APP_VERSION,
    mode: import.meta.env.VITE_MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  } as const
  
  // Type-safe function to get environment variables
  export function getEnvVar(key: keyof ImportMetaEnv): string {
    const value = import.meta.env[key]
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not defined`)
    }
    return value
  }
  
  // Example usage:
  // const apiUrl = getEnvVar('VITE_API_URL')