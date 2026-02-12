
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
    // The user provided Site ID: b1d22fef-1fba-44d3-9de4-0e42c55242f3
    // We try to use the environment variables first (standard Netlify behavior)
    // and fall back to the provided ID if needed.
    const store = getStore({
      name: 'hospital-records',
      siteID: process.env.SITE_ID || 'b1d22fef-1fba-44d3-9de4-0e42c55242f3',
      token: process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN
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
            error: "BLOB_READ_FAILED", 
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
            error: "BLOB_WRITE_FAILED", 
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
        message: criticalError.message || "Credential error. Please ensure you are running via 'netlify dev' or have linked the site correctly.",
        siteID: 'b1d22fef-1fba-44d3-9de4-0e42c55242f3'
      }) 
    };
  }
};
