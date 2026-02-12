
import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // Attempt to initialize the store inside the handler to catch config errors
    let store;
    try {
      store = getStore('hospital-records');
    } catch (configError: any) {
      console.warn('Netlify Blobs not configured:', configError.message);
      return {
        statusCode: 200, // Return 200 so the frontend can read the error payload gracefully
        headers,
        body: JSON.stringify({ 
          error: "BLOB_NOT_CONFIGURED", 
          message: "Netlify Blobs requires a linked site and proper environment. Defaulting to local storage." 
        })
      };
    }

    if (event.httpMethod === 'GET') {
      try {
        const data = await store.get('rota-json', { type: 'json' });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || { status: "empty" }),
        };
      } catch (blobError: any) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ error: "BLOB_READ_ERROR", details: blobError.message })
        };
      }
    }

    if (event.httpMethod === 'POST') {
      try {
        const payload = JSON.parse(event.body || '{}');
        await store.setJSON('rota-json', payload);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      } catch (postError: any) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "BAD_REQUEST", details: postError.message })
        };
      }
    }

    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  } catch (error: any) {
    console.error('Critical Function Failure:', error);
    return { 
      statusCode: 200, // Return 200 even on crash to allow frontend to handle the JSON error
      headers, 
      body: JSON.stringify({ 
        error: 'SERVER_CRASH', 
        message: error.message || 'Unknown internal error' 
      }) 
    };
  }
};
