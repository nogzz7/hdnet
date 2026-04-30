import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    if (event.httpMethod === 'GET') {
      const result = await sql`SELECT * FROM tecnicos ORDER BY id`;
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }
    if (event.httpMethod === 'POST') {
      const { nome, telefone, especialidade } = JSON.parse(event.body);
      const result = await sql`
        INSERT INTO tecnicos (nome, telefone, especialidade)
        VALUES (${nome}, ${telefone}, ${especialidade})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }
    if (event.httpMethod === 'PUT') {
      const { id } = event.queryStringParameters;
      const { nome, telefone, especialidade } = JSON.parse(event.body);
      const result = await sql`
        UPDATE tecnicos SET nome=${nome}, telefone=${telefone}, especialidade=${especialidade}
        WHERE id=${id} RETURNING *
      `;
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters;
      await sql`DELETE FROM tecnicos WHERE id=${id}`;
      return { statusCode: 204, headers, body: '' };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
}