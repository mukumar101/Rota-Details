
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
    // Attempting to initialize with explicit check
    // Note: On local, this requires running via `netlify dev`
    const store = getStore({
      name: 'hospital-records',
      // siteID and token are automatically injected by Netlify in production
      // or by 'netlify dev' locally.
    });

    if (event.httpMethod === 'GET') {
      try {
        const data = await store.get('rota-json', { type: 'json' });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || { status: "empty", message: "No data in store yet." }),
        };
      } catch (blobError: any) {
        console.error('Blob Get Error:', blobError);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            error: "BLOB_NOT_CONFIGURED", 
            message: blobError.message 
          })
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
          body: JSON.stringify({ success: true, timestamp: new Date().toISOString() }),
        };
      } catch (postError: any) {
        console.error('Blob Post Error:', postError);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            error: "SYNC_SAVE_FAILED", 
            message: postError.message 
          })
        };
      }
    }

    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  } catch (criticalError: any) {
    console.error('Critical Function Error:', criticalError);
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        error: 'SERVER_UNAVAILABLE', 
        message: "The cloud storage environment is not configured. Please link your site to Netlify or run via 'netlify dev'." 
      }) 
    };
  }
};
