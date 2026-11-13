import React, { useState, useEffect } from 'react';
import {
  FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaShoppingCart,
  FaUser, FaChevronLeft, FaChevronRight, FaFilter,
  FaQuestionCircle, FaKeyboard
} from 'react-icons/fa';

// URL da API: local durante o desenvolvimento e Render em produção.
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://sobmdidaadmin.onrender.com');

// Obtém o token JWT salvo durante o login.
const obterToken = () => localStorage.getItem('token');

// Monta os cabeçalhos das requisições administrativas.
const obterHeadersAutenticados = (incluirJson = true) => {
  const token = obterToken();

  const headers = {
    Authorization: 'Bearer ' + token
  };

  if (incluirJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

// Extrai uma mensagem de erro retornada pelo backend.
const obterMensagemErro = async (res) => {
  try {
    const data = await res.json();
    return data.error || data.message || `Erro HTTP ${res.status}`;
  } catch {
    return `Erro HTTP ${res.status}`;
  }
};

// Aceita respostas que venham como array ou dentro de uma propriedade.
const extrairLista = (data, propriedades = []) => {
  if (Array.isArray(data)) return data;

  for (const propriedade of propriedades) {
    if (Array.isArray(data?.[propriedade])) {
      return data[propriedade];
    }
  }

  return [];
};

// Converte o status exibido na interface para o valor aceito pelo Prisma.
const converterStatusParaAPI = (status) => {
  if (status === 'PEDIDO FEITO') return 'PENDENTE';
  return status;
};

// Converte o status do banco para o texto utilizado na interface.
const converterStatusParaTela = (status) => {
  if (status === 'PENDENTE') return 'PEDIDO FEITO';
  return status || 'PEDIDO FEITO';
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('PENDENTES');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [pedidoEditandoId, setPedidoEditandoId] = useState(null);
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  // Formulário do pedido
  const [clienteId, setClienteId] = useState('');
  const [buscaClienteTexto, setBuscaClienteTexto] = useState('');
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);

  const [origem, setOrigem] = useState('BALCAO');
  const [status, setStatus] = useState('PEDIDO FEITO');
  const [observacoes, setObservacoes] = useState('');
  const [itensPedido, setItensPedido] = useState([]);

  // Seleção de produto
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [buscaProdutoTexto, setBuscaProdutoTexto] = useState('');
  const [mostrarDropdownProduto, setMostrarDropdownProduto] = useState(false);
  const [quantidadeTemp, setQuantidadeTemp] = useState(1);

  // Cadastro rápido de cliente
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');

  // Atalho de teclado H
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName?.toLowerCase();

      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setModalAjudaAberto(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Carrega pedidos, clientes e produtos.
  const carregarDados = async () => {
    const token = obterToken();

    if (!token) {
      alert('Sua sessão não foi encontrada. Faça login novamente.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [resPedidos, resClientes, resProdutos] = await Promise.all([
        fetch(`${API_URL}/orders`, {
          headers: obterHeadersAutenticados(false)
        }).catch(err => {
          console.error('Erro de conexão ao buscar pedidos:', err);
          return null;
        }),

        fetch(`${API_URL}/clients`, {
          headers: obterHeadersAutenticados(false)
        }).catch(err => {
          console.error('Erro de conexão ao buscar clientes:', err);
          return null;
        }),

        // Produtos continuam públicos no backend.
        fetch(`${API_URL}/products`).catch(err => {
          console.error('Erro de conexão ao buscar produtos:', err);
          return null;
        })
      ]);

      if (resPedidos?.ok) {
        const data = await resPedidos.json();
        setPedidos(extrairLista(data, ['orders', 'pedidos']));
      } else if (resPedidos) {
        const mensagem = await obterMensagemErro(resPedidos);
        console.error('Erro ao carregar pedidos:', mensagem);

        if (resPedidos.status === 401 || resPedidos.status === 403) {
          alert('Sua sessão expirou ou você não tem permissão. Faça login novamente.');
        }

        setPedidos([]);
      } else {
        setPedidos([]);
      }

      if (resClientes?.ok) {
        const data = await resClientes.json();
        setClientes(extrairLista(data, ['clients', 'clientes', 'users']));
      } else if (resClientes) {
        const mensagem = await obterMensagemErro(resClientes);
        console.error('Erro ao carregar clientes:', mensagem);

        if (resClientes.status === 401 || resClientes.status === 403) {
          alert('Não foi possível acessar os clientes. Verifique sua sessão.');
        }

        setClientes([]);
      } else {
        setClientes([]);
      }

      if (resProdutos?.ok) {
        const data = await resProdutos.json();
        setProdutos(extrairLista(data, ['products', 'produtos']));
      } else if (resProdutos) {
        console.error(
          'Erro ao carregar produtos:',
          await obterMensagemErro(resProdutos)
        );
        setProdutos([]);
      } else {
        setProdutos([]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      alert('Não foi possível carregar os dados. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus]);

  const limparFormulario = () => {
    setPedidoEditandoId(null);
    setClienteId('');
    setBuscaClienteTexto('');
    setMostrarDropdownCliente(false);
    setOrigem('BALCAO');
    setStatus('PEDIDO FEITO');
    setObservacoes('');
    setItensPedido([]);
    setProdutoSelecionadoId('');
    setBuscaProdutoTexto('');
    setMostrarDropdownProduto(false);
    setQuantidadeTemp(1);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalEdicao = (p) => {
    setPedidoEditandoId(p.id);

    const cId = p.clienteId
      ? String(p.clienteId)
      : (p.cliente?.id ? String(p.cliente.id) : '');

    setClienteId(cId);

    const clienteEncontrado = clientes.find(
      c => String(c.id) === String(cId)
    );

    setBuscaClienteTexto(
      clienteEncontrado
        ? `${clienteEncontrado.nome} ${clienteEncontrado.telefone ? `(${clienteEncontrado.telefone})` : ''}`
        : (p.cliente?.nome || '')
    );

    setOrigem(p.origem || 'BALCAO');
    setStatus(converterStatusParaTela(p.status));
    setObservacoes(p.observacoes || '');

    if (Array.isArray(p.itens) && p.itens.length > 0) {
      const itensMapeados = p.itens.map(item => {
        const precoUnit = parseFloat(
          item.precoUnit ??
          item.preco ??
          item.produto?.preco ??
          0
        );

        const qtd = parseInt(item.quantidade || 1, 10);

        return {
          produtoId: item.produtoId || item.produto?.id,
          nome: item.produto?.nome || item.nome || 'Produto',
          preco: precoUnit,
          quantidade: qtd,
          subtotal: precoUnit * qtd
        };
      });

      setItensPedido(itensMapeados);
    } else {
      setItensPedido([]);
    }

    setModalAberto(true);
  };

  // Cadastro rápido de cliente pelo painel administrativo.
  const salvarNovoClienteRapido = async (e) => {
    e.preventDefault();

    if (!novoClienteNome.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }

    const token = obterToken();

    if (!token) {
      alert('Sua sessão expirou. Faça login novamente.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: obterHeadersAutenticados(),
        body: JSON.stringify({
          nome: novoClienteNome.trim(),
          telefone: novoClienteTelefone.trim() || null,
          origem: 'BALCAO'
        })
      });

      if (!res.ok) {
        const mensagem = await obterMensagemErro(res);
        alert(`Erro ao cadastrar cliente (${res.status}): ${mensagem}`);

        if (res.status === 401 || res.status === 403) {
          alert('Verifique se você está conectado como administrador.');
        }

        return;
      }

      const data = await res.json();

      const idCriado = data.id || data.cliente?.id || data.client?.id;

      const nomeCliente = novoClienteNome.trim();
      const telefoneCliente = novoClienteTelefone.trim();

      setNovoClienteNome('');
      setNovoClienteTelefone('');
      setModalClienteAberto(false);

      if (idCriado) {
        setClienteId(String(idCriado));
        setBuscaClienteTexto(
          `${nomeCliente}${telefoneCliente ? ` (${telefoneCliente})` : ''}`
        );
        setMostrarDropdownCliente(false);
      }

      await carregarDados();

      alert('Cliente cadastrado com sucesso!');
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err);
      alert('Erro de conexão ao cadastrar cliente.');
    }
  };

  // Adiciona produto ao pedido.
  const adicionarProdutoAoPedido = () => {
    if (!produtoSelecionadoId) {
      alert('Selecione um produto.');
      return;
    }

    const prod = produtos.find(
      p => String(p.id) === String(produtoSelecionadoId)
    );

    if (!prod) {
      alert('Produto não encontrado. Atualize a lista e tente novamente.');
      return;
    }

    const qtd = Math.max(1, parseInt(quantidadeTemp, 10) || 1);
    const precoUnitario = parseFloat(prod.preco || 0);

    const indexExistente = itensPedido.findIndex(
      i => String(i.produtoId) === String(prod.id)
    );

    if (indexExistente >= 0) {
      const novosItens = [...itensPedido];

      novosItens[indexExistente] = {
        ...novosItens[indexExistente],
        quantidade: novosItens[indexExistente].quantidade + qtd,
        subtotal: (novosItens[indexExistente].quantidade + qtd) * precoUnitario
      };

      setItensPedido(novosItens);
    } else {
      setItensPedido([
        ...itensPedido,
        {
          produtoId: prod.id,
          nome: prod.nome,
          preco: precoUnitario,
          quantidade: qtd,
          subtotal: precoUnitario * qtd
        }
      ]);
    }

    setProdutoSelecionadoId('');
    setBuscaProdutoTexto('');
    setMostrarDropdownProduto(false);
    setQuantidadeTemp(1);
  };

  const removerItemPedido = (index) => {
    setItensPedido(itensPedido.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return itensPedido.reduce(
      (acc, item) => acc + (Number(item.subtotal) || 0),
      0
    );
  };

  // Salva ou atualiza pedido.
  const salvarPedido = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      alert('Selecione um cliente válido da lista.');
      return;
    }

    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }

    const token = obterToken();

    if (!token) {
      alert('Sua sessão expirou. Faça login novamente.');
      return;
    }

    const isEdicao = pedidoEditandoId !== null;
    const statusAPI = converterStatusParaAPI(status);

    const payload = {
      clienteId: parseInt(clienteId, 10),
      origem,
      status: statusAPI,
      observacoes: observacoes || null,
      total: calcularTotal(),
      itens: itensPedido.map(item => ({
        produtoId: parseInt(item.produtoId, 10),
        quantidade: parseInt(item.quantidade, 10)
      }))
    };

    try {
      let res;

      if (isEdicao) {
        res = await fetch(`${API_URL}/orders/${pedidoEditandoId}`, {
          method: 'PUT',
          headers: obterHeadersAutenticados(),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: obterHeadersAutenticados(),
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const mensagem = await obterMensagemErro(res);
        alert(`Erro ao salvar pedido (${res.status}): ${mensagem}`);

        if (res.status === 401 || res.status === 403) {
          alert('Verifique sua sessão e suas permissões de administrador.');
        }

        return;
      }

      // A rota POST /orders cria inicialmente como PENDENTE.
      // Se outro status foi selecionado, atualizamos em seguida.
      if (!isEdicao && statusAPI !== 'PENDENTE') {
        const pedidoCriado = await res.json();
        const idCriado = pedidoCriado.id || pedidoCriado.pedido?.id;

        if (!idCriado) {
          alert('Pedido criado, mas não foi possível identificar seu ID para atualizar o status.');
          setModalAberto(false);
          limparFormulario();
          await carregarDados();
          return;
        }

        const resStatus = await fetch(
          `${API_URL}/orders/${idCriado}/status`,
          {
            method: 'PATCH',
            headers: obterHeadersAutenticados(),
            body: JSON.stringify({ status: statusAPI })
          }
        );

        if (!resStatus.ok) {
          const mensagem = await obterMensagemErro(resStatus);
          alert(
            `O pedido foi criado, mas não foi possível atualizar o status: ${mensagem}`
          );

          setModalAberto(false);
          limparFormulario();
          await carregarDados();
          return;
        }
      }

      alert(
        isEdicao
          ? 'Pedido atualizado com sucesso!'
          : 'Pedido registrado com sucesso!'
      );

      setModalAberto(false);
      limparFormulario();
      await carregarDados();
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      alert('Erro de conexão ao salvar pedido.');
    }
  };

  // Atualiza somente o status do pedido.
  const atualizarStatusPedido = async (id, novoStatus) => {
    const token = obterToken();

    if (!token) {
      alert('Sua sessão expirou. Faça login novamente.');
      return;
    }

    const statusAPI = converterStatusParaAPI(novoStatus);

    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: obterHeadersAutenticados(),
        body: JSON.stringify({ status: statusAPI })
      });

      if (!res.ok) {
        const mensagem = await obterMensagemErro(res);
        alert(`Erro ao atualizar status (${res.status}): ${mensagem}`);
        return;
      }

      setPedidos(prev =>
        prev.map(p =>
          String(p.id) === String(id)
            ? { ...p, status: statusAPI }
            : p
        )
      );
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro de conexão ao atualizar status.');
    }
  };

  // Exclui pedido.
  const excluirPedido = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) {
      return;
    }

    const token = obterToken();

    if (!token) {
      alert('Sua sessão expirou. Faça login novamente.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: obterHeadersAutenticados(false)
      });

      if (!res.ok) {
        const mensagem = await obterMensagemErro(res);
        alert(`Erro ao excluir pedido (${res.status}): ${mensagem}`);
        return;
      }

      alert('Pedido excluído com sucesso!');

      setPedidos(prev =>
        prev.filter(p => String(p.id) !== String(id))
      );
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      alert('Erro de conexão ao excluir pedido.');
    }
  };

  // Filtragem de pedidos.
  const pedidosFiltrados = pedidos.filter(p => {
    const nomeCliente = p.cliente?.nome?.toLowerCase() || '';
    const termo = busca.toLowerCase();

    const passaTexto =
      nomeCliente.includes(termo) ||
      String(p.id).includes(termo);

    const stAtual = converterStatusParaTela(p.status).toUpperCase();

    let passaStatus = true;

    if (filtroStatus === 'PENDENTES') {
      passaStatus = stAtual === 'PEDIDO FEITO';
    } else if (filtroStatus !== 'TODOS') {
      passaStatus = p.status === filtroStatus;
    }

    return passaTexto && passaStatus;
  });

  // Ordenação e busca de clientes.
  const clientesOrdenados = [...clientes].sort((a, b) =>
    (a.nome || '').localeCompare(
      b.nome || '',
      'pt-BR',
      { sensitivity: 'base' }
    )
  );

  const clientesFiltradosDropdown = clientesOrdenados.filter(c => {
    const termo = buscaClienteTexto.toLowerCase();
    const nome = (c.nome || '').toLowerCase();
    const telefone = (c.telefone || '').toLowerCase();

    return nome.includes(termo) || telefone.includes(termo);
  });

  // Ordenação e busca de produtos.
  const produtosOrdenados = [...produtos].sort((a, b) =>
    (a.nome || '').localeCompare(
      b.nome || '',
      'pt-BR',
      { sensitivity: 'base' }
    )
  );

  const produtosFiltradosDropdown = produtosOrdenados.filter(p => {
    const termo = buscaProdutoTexto.toLowerCase();
    const nome = (p.nome || '').toLowerCase();

    return nome.includes(termo);
  });

  // Paginação.
  const totalPaginas =
    Math.ceil(pedidosFiltrados.length / itensPorPagina) || 1;

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;

  const pedidosPaginados = pedidosFiltrados.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  );

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px'
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0
          }}>
            Gestão de Pedidos
          </h2>

          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: '4px 0 0 0'
          }}>
            Acompanhe e gerencie as vendas realizadas ({pedidosFiltrados.length} exibidos).
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setModalAjudaAberto(true)}
            title="Pressione a tecla H para abrir o Guia de Ajuda"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <FaQuestionCircle style={{ color: '#2563eb' }} /> Ajuda [H]
          </button>

          <button
            onClick={abrirModalNovo}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaPlus style={{ fontSize: '12px' }} /> Novo Pedido
          </button>
        </div>
      </div>

      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        {/* Busca e filtros */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: 2,
            minWidth: '240px',
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '10px 14px',
            borderRadius: '8px'
          }}>
            <FaSearch style={{
              color: '#94a3b8',
              marginRight: '10px'
            }} />

            <input
              type="text"
              placeholder="Buscar pedido por cliente ou número..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '0 14px',
            borderRadius: '8px'
          }}>
            <FaFilter style={{
              color: '#94a3b8',
              marginRight: '8px',
              fontSize: '12px'
            }} />

            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer',
                padding: '10px 0'
              }}
            >
              <option value="PENDENTES">Apenas Pendentes (Pedido Feito)</option>
              <option value="TODOS">Todos os Status</option>
              <option value="PAGO">Pagos</option>
              <option value="EM_PREPARACAO">Em Preparação</option>
              <option value="ENVIADO">Enviados</option>
              <option value="ENTREGUE">Entregues</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '20px'
          }}>
            Carregando pedidos...
          </p>
        ) : (
          <>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #f1f5f9',
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>PEDIDO</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>CLIENTE</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>ORIGEM</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>TOTAL</th>
                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'right'
                  }}>
                    AÇÕES
                  </th>
                </tr>
              </thead>

              <tbody>
                {pedidosPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        padding: '30px'
                      }}
                    >
                      Nenhum pedido encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  pedidosPaginados.map(p => {
                    const statusAtual = converterStatusParaTela(p.status);

                    return (
                      <tr
                        key={p.id}
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                      >
                        <td style={{
                          padding: '14px 16px',
                          fontWeight: '700',
                          color: '#475569',
                          fontSize: '14px'
                        }}>
                          #{p.id}
                        </td>

                        <td style={{
                          padding: '14px 16px',
                          fontWeight: '600',
                          color: '#0f172a',
                          fontSize: '14px'
                        }}>
                          {p.cliente?.nome || 'Cliente Não Identificado'}
                        </td>

                        <td style={{
                          padding: '14px 16px',
                          color: '#475569',
                          fontSize: '13px'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {p.origem || 'BALCAO'}
                          </span>
                        </td>

                        <td style={{
                          padding: '14px 16px',
                          fontSize: '13px'
                        }}>
                          <select
                            value={statusAtual}
                            onChange={e =>
                              atualizarStatusPedido(p.id, e.target.value)
                            }
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '1px solid #cbd5e1',
                              background: statusAtual === 'ENTREGUE'
                                ? '#dcfce7'
                                : statusAtual === 'CANCELADO'
                                  ? '#fee2e2'
                                  : '#fef3c7',
                              color: statusAtual === 'ENTREGUE'
                                ? '#166534'
                                : statusAtual === 'CANCELADO'
                                  ? '#991b1b'
                                  : '#92400e',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PEDIDO FEITO">PEDIDO FEITO</option>
                            <option value="PAGO">PAGO</option>
                            <option value="EM_PREPARACAO">EM_PREPARACAO</option>
                            <option value="ENVIADO">ENVIADO</option>
                            <option value="ENTREGUE">ENTREGUE</option>
                            <option value="CANCELADO">CANCELADO</option>
                          </select>
                        </td>

                        <td style={{
                          padding: '14px 16px',
                          fontWeight: '700',
                          color: '#0f172a',
                          fontSize: '14px'
                        }}>
                          R$ {parseFloat(p.total || 0).toFixed(2)}
                        </td>

                        <td style={{
                          padding: '14px 16px',
                          textAlign: 'right'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px'
                          }}>
                            <button
                              onClick={() => abrirModalEdicao(p)}
                              title="Editar Pedido"
                              style={{
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() => excluirPedido(p.id)}
                              title="Excluir Pedido"
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Paginação */}
            {pedidosFiltrados.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <span style={{
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  Mostrando <b>{indiceInicial + 1}</b> a{' '}
                  <b>{Math.min(
                    indiceInicial + itensPorPagina,
                    pedidosFiltrados.length
                  )}</b>{' '}
                  de <b>{pedidosFiltrados.length}</b> pedidos
                </span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <button
                    onClick={() =>
                      setPaginaAtual(prev => Math.max(prev - 1, 1))
                    }
                    disabled={paginaAtual === 1}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                      opacity: paginaAtual === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#334155'
                    }}
                  >
                    <FaChevronLeft style={{ fontSize: '10px' }} /> Anterior
                  </button>

                  {Array.from(
                    { length: totalPaginas },
                    (_, index) => index + 1
                  ).map(num => (
                    <button
                      key={num}
                      onClick={() => setPaginaAtual(num)}
                      style={{
                        background: paginaAtual === num ? '#2563eb' : '#fff',
                        color: paginaAtual === num ? '#fff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 11px',
                        fontWeight: paginaAtual === num ? '700' : '400',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))
                    }
                    disabled={paginaAtual === totalPaginas}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: paginaAtual === totalPaginas
                        ? 'not-allowed'
                        : 'pointer',
                      opacity: paginaAtual === totalPaginas ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#334155'
                    }}
                  >
                    Próximo <FaChevronRight style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal criar / editar pedido */}
      {modalAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '14px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                {pedidoEditandoId
                  ? `Editar Pedido #${pedidoEditandoId}`
                  : 'Novo Pedido'}
              </h3>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '18px'
                }}
                onClick={() => setModalAberto(false)}
              />
            </div>

            <form
              onSubmit={salvarPedido}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Busca de cliente */}
              <div>
                <label style={labelStyle}>Nome do Cliente *</label>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  position: 'relative'
                }}>
                  <div style={{
                    flex: 1,
                    position: 'relative'
                  }}>
                    <input
                      type="text"
                      placeholder="Digite o nome ou telefone do cliente..."
                      value={buscaClienteTexto}
                      onChange={e => {
                        setBuscaClienteTexto(e.target.value);
                        setClienteId('');
                        setMostrarDropdownCliente(true);
                      }}
                      onFocus={() => setMostrarDropdownCliente(true)}
                      required={!clienteId}
                      style={inputStyle}
                    />

                    {mostrarDropdownCliente && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}>
                        {clientesFiltradosDropdown.length === 0 ? (
                          <div style={{
                            padding: '10px 14px',
                            color: '#94a3b8',
                            fontSize: '13px'
                          }}>
                            Nenhum cliente encontrado.
                          </div>
                        ) : (
                          clientesFiltradosDropdown.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setClienteId(String(c.id));
                                setBuscaClienteTexto(
                                  `${c.nome} ${c.telefone ? `(${c.telefone})` : ''}`
                                );
                                setMostrarDropdownCliente(false);
                              }}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#0f172a',
                                borderBottom: '1px solid #f1f5f9',
                                background:
                                  String(c.id) === String(clienteId)
                                    ? '#eff6ff'
                                    : '#fff'
                              }}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <strong>{c.nome}</strong>{' '}
                              {c.telefone && (
                                <span style={{ color: '#64748b' }}>
                                  ({c.telefone})
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalClienteAberto(true)}
                    style={{
                      background: '#e2e8f0',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaUser style={{ fontSize: '12px' }} /> + Novo
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Origem</label>

                  <select
                    value={origem}
                    onChange={e => setOrigem(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="BALCAO">BALCAO</option>
                    <option value="SITE">SITE</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status Inicial</label>

                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="PEDIDO FEITO">PEDIDO FEITO</option>
                    <option value="PAGO">PAGO</option>
                    <option value="EM_PREPARACAO">EM_PREPARACAO</option>
                    <option value="ENVIADO">ENVIADO</option>
                    <option value="ENTREGUE">ENTREGUE</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Observações</label>

                <input
                  type="text"
                  placeholder="Ex: Entregar após as 14h, sem cebola..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <hr style={{
                border: 'none',
                borderTop: '1px solid #e2e8f0',
                margin: '4px 0'
              }} />

              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaShoppingCart style={{ color: '#2563eb' }} />
                Adicionar Produtos ao Pedido
              </div>

              {/* Busca de produto */}
              <div style={{
                display: 'flex',
                gap: '8px',
                position: 'relative'
              }}>
                <div style={{
                  flex: 1,
                  position: 'relative'
                }}>
                  <input
                    type="text"
                    placeholder="Buscar produto por nome..."
                    value={buscaProdutoTexto}
                    onChange={e => {
                      setBuscaProdutoTexto(e.target.value);
                      setProdutoSelecionadoId('');
                      setMostrarDropdownProduto(true);
                    }}
                    onFocus={() => setMostrarDropdownProduto(true)}
                    style={inputStyle}
                  />

                  {mostrarDropdownProduto && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '180px',
                      overflowY: 'auto',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      marginTop: '4px'
                    }}>
                      {produtosFiltradosDropdown.length === 0 ? (
                        <div style={{
                          padding: '10px 14px',
                          color: '#94a3b8',
                          fontSize: '13px'
                        }}>
                          Nenhum produto encontrado.
                        </div>
                      ) : (
                        produtosFiltradosDropdown.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setProdutoSelecionadoId(String(p.id));
                              setBuscaProdutoTexto(
                                `${p.nome} - R$ ${parseFloat(p.preco || 0).toFixed(2)}`
                              );
                              setMostrarDropdownProduto(false);
                            }}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: '#0f172a',
                              borderBottom: '1px solid #f1f5f9',
                              background:
                                String(p.id) === String(produtoSelecionadoId)
                                  ? '#eff6ff'
                                  : '#fff'
                            }}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <strong>{p.nome}</strong> -{' '}
                            <span style={{
                              color: '#16a34a',
                              fontWeight: '600'
                            }}>
                              R$ {parseFloat(p.preco || 0).toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  min="1"
                  value={quantidadeTemp}
                  onChange={e => setQuantidadeTemp(e.target.value)}
                  style={{
                    width: '70px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'center'
                  }}
                />

                <button
                  type="button"
                  onClick={adicionarProdutoAoPedido}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Add
                </button>
              </div>

              {/* Itens adicionados */}
              {itensPedido.length > 0 && (
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  background: '#f8fafc'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}>
                    <thead>
                      <tr style={{
                        borderBottom: '1px solid #cbd5e1',
                        textAlign: 'left',
                        color: '#64748b'
                      }}>
                        <th style={{ padding: '6px' }}>PRODUTO</th>
                        <th style={{ padding: '6px', textAlign: 'center' }}>QTD</th>
                        <th style={{ padding: '6px', textAlign: 'right' }}>SUBTOTAL</th>
                        <th style={{ padding: '6px', textAlign: 'right' }}>AÇÃO</th>
                      </tr>
                    </thead>

                    <tbody>
                      {itensPedido.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: '1px solid #e2e8f0' }}
                        >
                          <td style={{
                            padding: '6px',
                            fontWeight: '600',
                            color: '#0f172a'
                          }}>
                            {item.nome}
                          </td>

                          <td style={{
                            padding: '6px',
                            textAlign: 'center'
                          }}>
                            {item.quantidade}
                          </td>

                          <td style={{
                            padding: '6px',
                            textAlign: 'right',
                            fontWeight: '600'
                          }}>
                            R$ {item.subtotal.toFixed(2)}
                          </td>

                          <td style={{
                            padding: '6px',
                            textAlign: 'right'
                          }}>
                            <button
                              type="button"
                              onClick={() => removerItemPedido(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{
                    marginTop: '12px',
                    textAlign: 'right',
                    fontSize: '15px',
                    fontWeight: '800',
                    color: '#0f172a'
                  }}>
                    TOTAL: R$ {calcularTotal().toFixed(2)}
                  </div>
                </div>
              )}

              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '10px',
                  fontSize: '15px'
                }}
              >
                {pedidoEditandoId
                  ? 'Atualizar Pedido'
                  : 'Finalizar Pedido'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal cadastro rápido de cliente */}
      {modalClienteAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#0f172a'
              }}>
                Cadastro Rápido de Cliente
              </h3>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onClick={() => setModalClienteAberto(false)}
              />
            </div>

            <form
              onSubmit={salvarNovoClienteRapido}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div>
                <label style={labelStyle}>Nome Completo *</label>

                <input
                  type="text"
                  required
                  value={novoClienteNome}
                  onChange={e => setNovoClienteNome(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Telefone / WhatsApp</label>

                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={novoClienteTelefone}
                  onChange={e => setNovoClienteTelefone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                Salvar e Selecionar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de ajuda */}
      {modalAjudaAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            background: '#fff',
            padding: '28px',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaKeyboard style={{ color: '#2563eb' }} />
                Atalhos e Dicas de Uso
              </h3>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onClick={() => setModalAjudaAberto(false)}
              />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '14px',
              color: '#334155'
            }}>
              <div>
                <strong>[H]</strong> - Abre / fecha este menu de ajuda rápido em qualquer momento.
              </div>

              <div>
                <strong>Busca Rápida</strong> - Digite o nome do cliente ou o número do pedido na barra superior para filtrar instantaneamente.
              </div>

              <div>
                <strong>Autocomplete de Clientes</strong> - Ao criar um pedido, digite parte do nome para buscar ou clique em <em>+ Novo</em> para cadastrar na hora.
              </div>

              <div>
                <strong>Filtro de Status</strong> - Escolha exibir apenas pendentes para agilizar o atendimento no balcão.
              </div>
            </div>

            <button
              onClick={() => setModalAjudaAberto(false)}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                width: '100%',
                marginTop: '20px'
              }}
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}