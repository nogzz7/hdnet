import { neon } from '@neondatabase/serverless';

export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL);
  const headers = { 
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // GET
    if (event.httpMethod === 'GET') {
      const result = await sql`SELECT * FROM clientes ORDER BY id`;
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }
    // POST
    if (event.httpMethod === 'POST') {
      const { nome, telefone, endereco, plano, mac_roteador } = JSON.parse(event.body);
      const result = await sql`
        INSERT INTO clientes (nome, telefone, endereco, plano, mac_roteador)
        VALUES (${nome}, ${telefone}, ${endereco}, ${plano}, ${mac_roteador})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }
    // PUT
    if (event.httpMethod === 'PUT') {
      const { id } = event.queryStringParameters;
      const { nome, telefone, endereco, plano, mac_roteador } = JSON.parse(event.body);
      const result = await sql`
        UPDATE clientes SET nome=${nome}, telefone=${telefone}, endereco=${endereco},
          plano=${plano}, mac_roteador=${mac_roteador}
        WHERE id=${id} RETURNING *
      `;
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }
    // DELETE
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters;
      await sql`DELETE FROM clientes WHERE id=${id}`;
      return { statusCode: 204, headers, body: '' };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
} 