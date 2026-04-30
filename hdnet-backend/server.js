import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();

// CORS – permite qualquer origem (ou coloque especificamente seu Netlify)
app.use(cors({ origin: '*' }));
app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API HDNet online' });
});

// ==================== CLIENTES ====================
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM clientes ORDER BY id`;
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, telefone, endereco, plano, mac_roteador } = req.body;
    const result = await sql`
      INSERT INTO clientes (nome, telefone, endereco, plano, mac_roteador)
      VALUES (${nome}, ${telefone}, ${endereco}, ${plano}, ${mac_roteador})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/clientes', async (req, res) => {
  try {
    const { id } = req.query;
    const { nome, telefone, endereco, plano, mac_roteador } = req.body;
    const result = await sql`
      UPDATE clientes
      SET nome=${nome}, telefone=${telefone}, endereco=${endereco},
          plano=${plano}, mac_roteador=${mac_roteador}
      WHERE id=${id} RETURNING *
    `;
    res.json(result[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/clientes', async (req, res) => {
  try {
    const { id } = req.query;
    await sql`DELETE FROM clientes WHERE id=${id}`;
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== TÉCNICOS ====================
app.get('/api/tecnicos', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM tecnicos ORDER BY id`;
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/tecnicos', async (req, res) => {
  try {
    const { nome, telefone, especialidade } = req.body;
    const result = await sql`
      INSERT INTO tecnicos (nome, telefone, especialidade)
      VALUES (${nome}, ${telefone}, ${especialidade})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/tecnicos', async (req, res) => {
  try {
    const { id } = req.query;
    const { nome, telefone, especialidade } = req.body;
    const result = await sql`
      UPDATE tecnicos
      SET nome=${nome}, telefone=${telefone}, especialidade=${especialidade}
      WHERE id=${id} RETURNING *
    `;
    res.json(result[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/tecnicos', async (req, res) => {
  try {
    const { id } = req.query;
    await sql`DELETE FROM tecnicos WHERE id=${id}`;
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== ORDENS ====================
app.get('/api/ordens', async (req, res) => {
  try {
    const result = await sql`
      SELECT o.*, c.nome as cliente_nome, t.nome as tecnico_nome
      FROM ordens o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN tecnicos t ON o.tecnico_id = t.id
      ORDER BY o.id
    `;
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/ordens', async (req, res) => {
  try {
    const { cliente_id, tecnico_id, tipo, problema, status } = req.body;
    const result = await sql`
      INSERT INTO ordens (cliente_id, tecnico_id, tipo, problema, status)
      VALUES (${cliente_id}, ${tecnico_id}, ${tipo}, ${problema}, ${status})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/ordens', async (req, res) => {
  try {
    const { id } = req.query;
    const { cliente_id, tecnico_id, tipo, problema, status } = req.body;
    const result = await sql`
      UPDATE ordens
      SET cliente_id=${cliente_id}, tecnico_id=${tecnico_id}, tipo=${tipo},
          problema=${problema}, status=${status}
      WHERE id=${id} RETURNING *
    `;
    res.json(result[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/ordens', async (req, res) => {
  try {
    const { id } = req.query;
    await sql`DELETE FROM ordens WHERE id=${id}`;
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));