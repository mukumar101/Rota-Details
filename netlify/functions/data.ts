
import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

/**
 * MEDROTA CLOUD SYNC FUNCTION (Netlify Blobs Version)
 * This function uses Netlify's built-in Key-Value storage (Blobs) 
 * to persist hospital data without an external database.
 */

export const handler: Handler = async (event, context) => {
  const { httpMethod } = event;
  
  // Initialize the Netlify Blob store
  const store = getStore('hospital-records');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    if (httpMethod === 'GET') {
      // Fetch the data from the blob store
      const data = await store.get('rota-json', { type: 'json' });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || { 
          status: "empty", 
          message: "No cloud data found yet." 
        }),
      };
    }

    if (httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      
      // Save the payload to the blob store
      await store.setJSON('rota-json', payload);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          syncedAt: new Date().toISOString(),
          persistent: true,
          provider: "Netlify Blobs"
        }),
      };
    }

    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  } catch (error: any) {
    console.error('Server Error:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: 'Sync Error', details: error.message }) 
    };
  }
};
