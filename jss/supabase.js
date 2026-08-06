// =====================================================
// CONFIGURAÇÃO DO SUPABASE
// =====================================================

const SUPABASE_URL = 'COLE_AQUI_A_URL_DO_PROJETO';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_CHAVE_ANON';

// =====================================================
// VALIDAÇÃO DA CONFIGURAÇÃO
// =====================================================

function validarConfiguracaoSupabase() {
  if (
    !SUPABASE_URL ||
    SUPABASE_URL.includes('COLE_AQUI') ||
    !SUPABASE_ANON_KEY ||
    SUPABASE_ANON_KEY.includes('COLE_AQUI')
  ) {
    throw new Error(
      'Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo js/supabase.js.'
    );
  }
}

// =====================================================
// CABEÇALHOS PADRÃO
// =====================================================

function obterCabecalhosSupabase() {
  validarConfiguracaoSupabase();

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
}

// =====================================================
// MONTAGEM DA URL
// =====================================================

function montarUrlSupabase(tabela, parametros = {}) {
  validarConfiguracaoSupabase();

  if (!tabela) {
    throw new Error('O nome da tabela não foi informado.');
  }

  const url = new URL(`${SUPABASE_URL}/rest/v1/${tabela}`);

  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      url.searchParams.set(chave, String(valor));
    }
  });

  return url.toString();
}

// =====================================================
// TRATAMENTO DE RESPOSTA
// =====================================================

async function tratarRespostaSupabase(resposta) {
  const texto = await resposta.text();

  let dados = null;

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    const mensagem =
      dados?.message ||
      dados?.details ||
      dados?.hint ||
      texto ||
      `Erro HTTP ${resposta.status}`;

    throw new Error(mensagem);
  }

  return dados;
}

// =====================================================
// CONSULTA GENÉRICA
// =====================================================

async function buscarRegistros(tabela, parametros = {}) {
  const url = montarUrlSupabase(tabela, parametros);

  const resposta = await fetch(url, {
    method: 'GET',
    headers: obterCabecalhosSupabase()
  });

  return tratarRespostaSupabase(resposta);
}

// =====================================================
// INSERÇÃO GENÉRICA
// =====================================================

async function inserirRegistros(tabela, dados) {
  if (!dados) {
    throw new Error('Nenhum dado foi informado para inserção.');
  }

  const url = montarUrlSupabase(tabela);

  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      ...obterCabecalhosSupabase(),
      Prefer: 'return=representation'
    },
    body: JSON.stringify(dados)
  });

  return tratarRespostaSupabase(resposta);
}

// =====================================================
// ATUALIZAÇÃO GENÉRICA
// =====================================================

async function atualizarRegistros(tabela, filtros, dados) {
  if (!filtros || Object.keys(filtros).length === 0) {
    throw new Error('Informe ao menos um filtro para atualização.');
  }

  if (!dados) {
    throw new Error('Nenhum dado foi informado para atualização.');
  }

  const url = montarUrlSupabase(tabela, filtros);

  const resposta = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...obterCabecalhosSupabase(),
      Prefer: 'return=representation'
    },
    body: JSON.stringify(dados)
  });

  return tratarRespostaSupabase(resposta);
}

// =====================================================
// EXCLUSÃO GENÉRICA
// =====================================================

async function excluirRegistros(tabela, filtros) {
  if (!filtros || Object.keys(filtros).length === 0) {
    throw new Error('Informe ao menos um filtro para exclusão.');
  }

  const url = montarUrlSupabase(tabela, filtros);

  const resposta = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...obterCabecalhosSupabase(),
      Prefer: 'return=representation'
    }
  });

  return tratarRespostaSupabase(resposta);
}

// =====================================================
// TESTE DE CONEXÃO
// =====================================================

async function testarConexaoSupabase() {
  return buscarRegistros('agrofit_raw', {
    select: 'nr_registro',
    limit: 1
  });
}
