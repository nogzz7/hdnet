// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
  carregarClientes();
  carregarTecnicos();
  carregarOS();
});

async function carregarDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();
  document.getElementById('osAbertas').innerText = data.os_abertas;
  document.getElementById('totalClientes').innerText = data.total_clientes;
  document.getElementById('totalTecnicos').innerText = data.total_tecnicos;
}

// ----- CLIENTES -----
async function carregarClientes() {
  const res = await fetch('/api/clientes');
  const clientes = await res.json();
  const tbody = document.querySelector('#tabelaClientes tbody');
  tbody.innerHTML = '';
  clientes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nome}</td>
      <td>${c.telefone || ''}</td>
      <td>${c.endereco || ''}</td>
      <td>${c.plano || ''}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarCliente(${c.id})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="excluirCliente(${c.id})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalCliente(id = null) {
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  if (id) {
    // Carregar dados do cliente para edição
    fetch(`/api/clientes`)
      .then(res => res.json())
      .then(clientes => {
        const cliente = clientes.find(c => c.id == id);
        if (cliente) {
          modalTitle.innerText = 'Editar Cliente';
          modalBody.innerHTML = `
            <form id="formCliente">
              <input type="hidden" id="clienteId" value="${cliente.id}">
              <input class="form-control mb-2" id="nome" value="${cliente.nome}" placeholder="Nome">
              <input class="form-control mb-2" id="telefone" value="${cliente.telefone || ''}" placeholder="Telefone">
              <textarea class="form-control mb-2" id="endereco" placeholder="Endereço">${cliente.endereco || ''}</textarea>
              <input class="form-control mb-2" id="plano" value="${cliente.plano || ''}" placeholder="Plano">
              <input class="form-control mb-2" id="mac" value="${cliente.mac_roteador || ''}" placeholder="MAC Roteador">
              <button type="submit" class="btn btn-primary">Salvar</button>
            </form>
          `;
          document.getElementById('formCliente').addEventListener('submit', (e) => {
            e.preventDefault();
            salvarCliente(id);
          });
        }
      });
  } else {
    modalTitle.innerText = 'Novo Cliente';
    modalBody.innerHTML = `
      <form id="formCliente">
        <input class="form-control mb-2" id="nome" placeholder="Nome">
        <input class="form-control mb-2" id="telefone" placeholder="Telefone">
        <textarea class="form-control mb-2" id="endereco" placeholder="Endereço"></textarea>
        <input class="form-control mb-2" id="plano" placeholder="Plano">
        <input class="form-control mb-2" id="mac" placeholder="MAC Roteador">
        <button type="submit" class="btn btn-primary">Salvar</button>
      </form>
    `;
    document.getElementById('formCliente').addEventListener('submit', (e) => {
      e.preventDefault();
      salvarCliente();
    });
  }
  new bootstrap.Modal(document.getElementById('formModal')).show();
}

async function salvarCliente(id = null) {
  const dados = {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    endereco: document.getElementById('endereco').value,
    plano: document.getElementById('plano').value,
    mac_roteador: document.getElementById('mac').value
  };
  let url = '/api/clientes';
  let method = 'POST';
  if (id) {
    url = `/api/clientes/${id}`;
    method = 'PUT';
  }
  const res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
    carregarClientes();
    carregarDashboard();
  } else alert('Erro ao salvar');
}

async function excluirCliente(id) {
  if (confirm('Excluir cliente?')) {
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    carregarClientes();
    carregarDashboard();
  }
}

// ----- TÉCNICOS (similar, resumido) -----
async function carregarTecnicos() { /* similar */ }
function abrirModalTecnico(id=null) { /* similar */ }
async function salvarTecnico(id=null) { /* similar */ }
async function excluirTecnico(id) { /* similar */ }

// ----- ORDENS DE SERVIÇO -----
async function carregarOS() { /* similar */ }
function abrirModalOS(id=null) { /* similar */ }
async function salvarOS(id=null) { /* similar */ }
async function concluirOS(id) { /* similar */ }

// (Os códigos completos de técnicos e OS seriam análogos aos clientes, adaptando campos)