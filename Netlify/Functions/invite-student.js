const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const body = JSON.parse(event.body);
    const email =
      body?.data?.object?.customer_details?.email ||
      body?.data?.object?.email ||
      body?.email;

    if (!email) return { statusCode: 400, body: JSON.stringify({ error: 'No email found' }) };

    const SITE_ID = process.env.NETLIFY_SITE_ID;
    const TOKEN   = process.env.NETLIFY_TOKEN;
    if (!SITE_ID || !TOKEN) return { statusCode: 500, body: JSON.stringify({ error: 'Missing env vars' }) };

    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/invite`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify({ invites: [{ email }] }),
      }
    );
    const result = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify(result) };
    return { statusCode: 200, body: JSON.stringify({ message: `Invite sent to ${email}` }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
