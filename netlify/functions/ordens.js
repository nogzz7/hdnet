import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    if (event.httpMethod === 'GET') {
      const result = await sql`
        SELECT o.*, c.nome as cliente_nome, t.nome as tecnico_nome
        FROM ordens o
        LEFT JOIN clientes c ON o.cliente_id = c.id
        LEFT JOIN tecnicos t ON o.tecnico_id = t.id
        ORDER BY o.id
      `;
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }
    if (event.httpMethod === 'POST') {
      const { cliente_id, tecnico_id, tipo, problema, status } = JSON.parse(event.body);
      const result = await sql`
        INSERT INTO ordens (cliente_id, tecnico_id, tipo, problema, status)
        VALUES (${cliente_id}, ${tecnico_id}, ${tipo}, ${problema}, ${status})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }
    if (event.httpMethod === 'PUT') {
      const { id } = event.queryStringParameters;
      const { cliente_id, tecnico_id, tipo, problema, status } = JSON.parse(event.body);
      const result = await sql`
        UPDATE ordens SET cliente_id=${cliente_id}, tecnico_id=${tecnico_id}, tipo=${tipo},
          problema=${problema}, status=${status}
        WHERE id=${id} RETURNING *
      `;
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters;
      await sql`DELETE FROM ordens WHERE id=${id}`;
      return { statusCode: 204, headers, body: '' };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
}