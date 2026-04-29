import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function handler(event) {
  const { httpMethod, body, queryStringParameters } = event;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    if (httpMethod === 'GET') {
      const result = await sql`
        SELECT o.*, c.nome as cliente_nome, t.nome as tecnico_nome
        FROM ordens o
        LEFT JOIN clientes c ON o.cliente_id = c.id
        LEFT JOIN tecnicos t ON o.tecnico_id = t.id
        ORDER BY o.id
      `;
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }
    // ... resto do código
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}