
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
    // Let Netlify automatically inject siteID, token & deploy context.
    // Do NOT pass siteID/token manually — the runtime provides them.
    const store = getStore('hospital-records');

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
            message: blobError.message,
            tip: "Ensure 'Netlify Blobs' is enabled in your site dashboard under 'Storage'."
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
            error: "BLOB_NOT_CONFIGURED", 
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
        message: criticalError.message || "Could not initialize blob store. Ensure you are running via 'netlify dev' or the site is deployed on Netlify."
      }) 
    };
  }
};

