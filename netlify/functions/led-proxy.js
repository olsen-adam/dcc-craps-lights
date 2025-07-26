const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

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