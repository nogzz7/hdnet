const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Configurações
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // arquivos estáticos (CSS, JS, HTML)

// Conectar banco
const db = new sqlite3.Database('hdnet.db');

// ---------- ROTAS PARA CLIENTES ----------
app.get('/api/clientes', (req, res) => {
  db.all('SELECT * FROM clientes ORDER BY id DESC', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/clientes', (req, res) => {
  const { nome, telefone, endereco, plano, mac_roteador } = req.body;
  db.run(
    'INSERT INTO clientes (nome, telefone, endereco, plano, mac_roteador) VALUES (?,?,?,?,?)',
    [nome, telefone, endereco, plano, mac_roteador],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID });
    }
  );
});

app.put('/api/clientes/:id', (req, res) => {
  const { nome, telefone, endereco, plano, mac_roteador } = req.body;
  db.run(
    'UPDATE clientes SET nome=?, telefone=?, endereco=?, plano=?, mac_roteador=? WHERE id=?',
    [nome, telefone, endereco, plano, mac_roteador, req.params.id],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ updated: this.changes });
    }
  );
});

app.delete('/api/clientes/:id', (req, res) => {
  db.run('DELETE FROM clientes WHERE id=?', req.params.id, function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deleted: this.changes });
  });
});

// ---------- ROTAS PARA TÉCNICOS ----------
app.get('/api/tecnicos', (req, res) => {
  db.all('SELECT * FROM tecnicos ORDER BY id DESC', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/tecnicos', (req, res) => {
  const { nome, telefone, especialidade } = req.body;
  db.run(
    'INSERT INTO tecnicos (nome, telefone, especialidade) VALUES (?,?,?)',
    [nome, telefone, especialidade],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID });
    }
  );
});

app.put('/api/tecnicos/:id', (req, res) => {
  const { nome, telefone, especialidade } = req.body;
  db.run(
    'UPDATE tecnicos SET nome=?, telefone=?, especialidade=? WHERE id=?',
    [nome, telefone, especialidade, req.params.id],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ updated: this.changes });
    }
  );
});

app.delete('/api/tecnicos/:id', (req, res) => {
  db.run('DELETE FROM tecnicos WHERE id=?', req.params.id, function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deleted: this.changes });
  });
});

// ---------- ROTAS PARA ORDENS DE SERVIÇO ----------
app.get('/api/os', (req, res) => {
  db.all(`
    SELECT os.*, c.nome as cliente_nome, t.nome as tecnico_nome
    FROM ordens_servico os
    LEFT JOIN clientes c ON os.cliente_id = c.id
    LEFT JOIN tecnicos t ON os.tecnico_id = t.id
    ORDER BY os.id DESC
  `, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/os', (req, res) => {
  const { cliente_id, tecnico_id, tipo, problema } = req.body;
  db.run(
    'INSERT INTO ordens_servico (cliente_id, tecnico_id, tipo, problema) VALUES (?,?,?,?)',
    [cliente_id, tecnico_id, tipo, problema],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID });
    }
  );
});

app.put('/api/os/:id', (req, res) => {
  const { status, solucao, data_conclusao } = req.body;
  db.run(
    'UPDATE ordens_servico SET status=?, solucao=?, data_conclusao=? WHERE id=?',
    [status, solucao, data_conclusao || null, req.params.id],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ updated: this.changes });
    }
  );
});

// Dashboard endpoints
app.get('/api/dashboard', (req, res) => {
  db.get('SELECT COUNT(*) as os_abertas FROM ordens_servico WHERE status != "concluida"', (err, os) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT COUNT(*) as total_clientes FROM clientes', (err2, clientes) => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.get('SELECT COUNT(*) as total_tecnicos FROM tecnicos', (err3, tecnicos) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({
          os_abertas: os.os_abertas,
          total_clientes: clientes.total_clientes,
          total_tecnicos: tecnicos.total_tecnicos
        });
      });
    });
  });
});

// Servir o front-end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});