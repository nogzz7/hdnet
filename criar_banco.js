const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('hdnet.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      endereco TEXT,
      plano TEXT,
      mac_roteador TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tecnicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      especialidade TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ordens_servico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      tecnico_id INTEGER,
      data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_conclusao DATETIME,
      tipo TEXT CHECK(tipo IN ('instalacao','reparo','troca')) NOT NULL,
      problema TEXT,
      solucao TEXT,
      status TEXT DEFAULT 'aberta' CHECK(status IN ('aberta','em_andamento','aguardando_peca','concluida','cancelada')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
      FOREIGN KEY(tecnico_id) REFERENCES tecnicos(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      tipo TEXT,
      modelo TEXT,
      numero_serie TEXT,
      data_instalacao DATE,
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
    )
  `);
});

db.close();
console.log('Banco de dados criado/atualizado!');