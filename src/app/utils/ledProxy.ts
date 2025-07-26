// LED Proxy utility with multiple fallback options
export interface LEDProxyOptions {
  primaryUrl: string;
  fallbackUrls?: string[];
  timeout?: number;
}

export class LEDProxy {
  private options: LEDProxyOptions;
  
  constructor(options: LEDProxyOptions) {
    this.options = {
      timeout: 5000,
      ...options
    };
  }
  
  async makeRequest(url: string): Promise<{ success: boolean; error?: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Request timeout' };
        }
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Unknown error' };
    }
  }
  
  async requestWithFallbacks(url: string): Promise<{ success: boolean; error?: string }> {
    // Try primary URL first
    const primaryResult = await this.makeRequest(url);
    if (primaryResult.success) {
      return primaryResult;
    }
    
    console.warn('Primary LED proxy failed, trying fallbacks...');
    
    // Try fallback URLs if available
    if (this.options.fallbackUrls) {
      for (const fallbackUrl of this.options.fallbackUrls) {
        const fallbackResult = await this.makeRequest(fallbackUrl);
        if (fallbackResult.success) {
          console.log('Fallback LED proxy succeeded');
          return fallbackResult;
        }
      }
    }
    
    return { 
      success: false, 
      error: `All LED proxy attempts failed. Last error: ${primaryResult.error}` 
    };
  }
}

// Create a default LED proxy instance
export const defaultLEDProxy = new LEDProxy({
  primaryUrl: 'https://dcclights.netlify.app/.netlify/functions/led-proxy',
  fallbackUrls: [
    // Add alternative proxy services here if needed
    // 'https://cors-anywhere.herokuapp.com/http://192.168.1.77',
  ],
  timeout: 5000
}); 