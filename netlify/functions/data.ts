
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
    const store = getStore('hospital-records');

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
          body: JSON.stringify({ error: "BLOB_INIT", details: blobError.message })
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
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: 'SERVER_CRASH', message: error.message }) 
    };
  }
};
