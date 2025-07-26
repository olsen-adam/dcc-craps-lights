const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('Function called with event:', JSON.stringify(event, null, 2));
  
  // Enable CORS - allow all Netlify domains and local development
  const origin = event.headers.origin || event.headers.Origin;
  console.log('Request origin:', origin);
  
  // Allow any Netlify domain (including preview deployments) and localhost
  const isAllowedOrigin = origin && (
    origin.includes('netlify.app') || 
    origin.includes('localhost') || 
    origin.includes('127.0.0.1')
  );
  
  console.log('Is allowed origin:', isAllowedOrigin);
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'https://dcclights.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
  
  console.log('Response headers:', headers);

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extract the path from the request
    const path = event.path.replace('/.netlify/functions/led-proxy', '');
    
    // Construct the URL for the LED controller
    const ledControllerUrl = `http://192.168.1.77${path}`;
    
    console.log(`Proxying request to: ${ledControllerUrl}`);
    
    // Make the request to the LED controller
    const response = await fetch(ledControllerUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.httpMethod !== 'GET' ? event.body : undefined,
    });

    // Get the response text
    const responseText = await response.text();
    
    console.log(`LED controller responded with status: ${response.status}`);

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('content-type') || 'text/plain',
      },
      body: responseText
    };
  } catch (error) {
    console.error('Proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to connect to LED controller',
        message: error.message 
      })
    };
  }
}; 