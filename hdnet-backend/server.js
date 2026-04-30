import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();
app.use(cors());
app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

// ----- ROTAS CLIENTES -----
app.get('/api/clientes', async (req, res) => {
  const result = await sql`SELECT * FROM clientes ORDER BY id`;
  res.json(result);
});
app.post('/api/clientes', async (req, res) => {
  const { nome, telefone, endereco, plano, mac_roteador } = req.body;
  const result = await sql`
    INSERT INTO clientes (nome, telefone, endereco, plano, mac_roteador)
    VALUES (${nome}, ${telefone}, ${endereco}, ${plano}, ${mac_roteador})
    RETURNING *
  `;
  res.status(201).json(result[0]);
});
app.put('/api/clientes', async (req, res) => {
  const { id } = req.query;
  const { nome, telefone, endereco, plano, mac_roteador } = req.body;
  const result = await sql`
    UPDATE clientes SET nome=${nome}, telefone=${telefone}, endereco=${endereco},
      plano=${plano}, mac_roteador=${mac_roteador}
    WHERE id=${id} RETURNING *
  `;
  res.json(result[0]);
});
app.delete('/api/clientes', async (req, res) => {
  const { id } = req.query;
  await sql`DELETE FROM clientes WHERE id=${id}`;
  res.status(204).send();
});

// ----- ROTAS TÉCNICOS -----
app.get('/api/tecnicos', async (req, res) => {
  const result = await sql`SELECT * FROM tecnicos ORDER BY id`;
  res.json(result);
});
app.post('/api/tecnicos', async (req, res) => {
  const { nome, telefone, especialidade } = req.body;
  const result = await sql`
    INSERT INTO tecnicos (nome, telefone, especialidade)
    VALUES (${nome}, ${telefone}, ${especialidade})
    RETURNING *
  `;
  res.status(201).json(result[0]);
});
app.put('/api/tecnicos', async (req, res) => {
  const { id } = req.query;
  const { nome, telefone, especialidade } = req.body;
  const result = await sql`
    UPDATE tecnicos SET nome=${nome}, telefone=${telefone}, especialidade=${especialidade}
    WHERE id=${id} RETURNING *
  `;
  res.json(result[0]);
});
app.delete('/api/tecnicos', async (req, res) => {
  const { id } = req.query;
  await sql`DELETE FROM tecnicos WHERE id=${id}`;
  res.status(204).send();
});

// ----- ROTAS ORDENS -----
app.get('/api/ordens', async (req, res) => {
  const result = await sql`
    SELECT o.*, c.nome as cliente_nome, t.nome as tecnico_nome
    FROM ordens o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN tecnicos t ON o.tecnico_id = t.id
    ORDER BY o.id
  `;
  res.json(result);
});
app.post('/api/ordens', async (req, res) => {
  const { cliente_id, tecnico_id, tipo, problema, status } = req.body;
  const result = await sql`
    INSERT INTO ordens (cliente_id, tecnico_id, tipo, problema, status)
    VALUES (${cliente_id}, ${tecnico_id}, ${tipo}, ${problema}, ${status})
    RETURNING *
  `;
  res.status(201).json(result[0]);
});
app.put('/api/ordens', async (req, res) => {
  const { id } = req.query;
  const { cliente_id, tecnico_id, tipo, problema, status } = req.body;
  const result = await sql`
    UPDATE ordens SET cliente_id=${cliente_id}, tecnico_id=${tecnico_id}, tipo=${tipo},
      problema=${problema}, status=${status}
    WHERE id=${id} RETURNING *
  `;
  res.json(result[0]);
});
app.delete('/api/ordens', async (req, res) => {
  const { id } = req.query;
  await sql`DELETE FROM ordens WHERE id=${id}`;
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));s