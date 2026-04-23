// netlify/functions/clientes.js
import { neon } from '@neondatabase/serverless';

// A connection string será lida de uma variável de ambiente
const sql = neon(process.env.DATABASE_URL);

export const handler = async (event, context) => {
  // Apenas para aceitar requisições GET, como o front-end vai chamar
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const clientes = await sql`SELECT * FROM clientes ORDER BY id DESC`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientes),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};