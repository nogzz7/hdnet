import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const { httpMethod, body, queryStringParameters } = event;
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  if (!process.env.DATABASE_URL) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'DATABASE_URL não configurada' }) };
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (httpMethod === 'GET') {
      const result = await sql`SELECT * FROM tecnicos ORDER BY id`;
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }
    if (httpMethod === 'POST') {
      const { nome, telefone, especialidade } = JSON.parse(body);
      const result = await sql`
        INSERT INTO tecnicos (nome, telefone, especialidade)
        VALUES (${nome}, ${telefone}, ${especialidade}) RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }
    if (httpMethod === 'PUT') {
      const id = queryStringParameters.id;
      const { nome, telefone, especialidade } = JSON.parse(body);
      const result = await sql`
        UPDATE tecnicos SET nome=${nome}, telefone=${telefone}, especialidade=${especialidade}
        WHERE id=${id} RETURNING *
      `;
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }
    if (httpMethod === 'DELETE') {
      const id = queryStringParameters.id;
      await sql`DELETE FROM tecnicos WHERE id=${id}`;
      return { statusCode: 204, headers, body: '' };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (error) {
    console.error('Erro em tecnicos:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}