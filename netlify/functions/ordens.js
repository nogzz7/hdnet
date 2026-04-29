import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const { httpMethod, body, queryStringParameters } = event;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Verificação inicial da conexão
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não definida');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuração do banco ausente' }) };
  }

  const sql = neon(process.env.DATABASE_URL);

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

    if (httpMethod === 'POST') {
      const { cliente_id, tecnico_id, tipo, problema, status } = JSON.parse(body);
      const result = await sql`
        INSERT INTO ordens (cliente_id, tecnico_id, tipo, problema, status)
        VALUES (${cliente_id}, ${tecnico_id}, ${tipo}, ${problema}, ${status})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }

    if (httpMethod === 'PUT') {
      const id = queryStringParameters.id;
      const { cliente_id, tecnico_id, tipo, problema, status, concluida_em } = JSON.parse(body);
      const result = await sql`
        UPDATE ordens
        SET cliente_id = ${cliente_id}, tecnico_id = ${tecnico_id},
            tipo = ${tipo}, problema = ${problema}, status = ${status}, concluida_em = ${concluida_em || null}
        WHERE id = ${id}
        RETURNING *
      `;
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }

    if (httpMethod === 'DELETE') {
      const id = queryStringParameters.id;
      await sql`DELETE FROM ordens WHERE id = ${id}`;
      return { statusCode: 204, headers, body: '' };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (error) {
    console.error('Erro na função ordens:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}