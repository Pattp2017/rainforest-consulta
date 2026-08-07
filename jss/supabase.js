// =====================================================
// SUPABASE
// Comunicação com o banco de dados
// Projeto: Rainforest Consulta
// =====================================================


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const SUPABASE_URL =
  "https://kdjigqkyqymitdcoczwm.supabase.co";

const SUPABASE_API_KEY =
  "sb_publishable_UU1id7jF7zQ2s3SMYXdbdQ_DWdzw0iD";


// =====================================================
// VALIDAÇÃO DA CONFIGURAÇÃO
// =====================================================

function validarConfiguracaoSupabase() {

  if (!SUPABASE_URL) {
    throw new Error(
      "A URL do Supabase não foi configurada."
    );
  }

  if (
    !SUPABASE_API_KEY ||
    SUPABASE_API_KEY.includes("COLE_AQUI")
  ) {
    throw new Error(
      "A chave pública do Supabase não foi configurada."
    );
  }

}


// =====================================================
// CABEÇALHOS PADRÃO
// =====================================================

function obterCabecalhosSupabase() {

  validarConfiguracaoSupabase();

  return {
    apikey: SUPABASE_API_KEY,
    Authorization: `Bearer ${SUPABASE_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };

}


// =====================================================
// MONTAR URL
// =====================================================

function montarUrlSupabase(
  tabela,
  parametros = {}
) {

  validarConfiguracaoSupabase();

  if (!tabela) {
    throw new Error(
      "O nome da tabela do Supabase não foi informado."
    );
  }

  const url = new URL(
    `${SUPABASE_URL}/rest/v1/${tabela}`
  );

  Object.entries(parametros).forEach(
    ([chave, valor]) => {

      if (
        valor !== undefined &&
        valor !== null &&
        valor !== ""
      ) {
        url.searchParams.set(
          chave,
          String(valor)
        );
      }

    }
  );

  return url.toString();

}


// =====================================================
// TRATAR RESPOSTA
// =====================================================

async function tratarRespostaSupabase(
  resposta
) {

  const texto =
    await resposta.text();

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

async function buscarRegistros(
  tabela,
  parametros = {}
) {

  const url =
    montarUrlSupabase(
      tabela,
      parametros
    );

  const resposta =
    await fetch(
      url,
      {
        method: "GET",
        headers:
          obterCabecalhosSupabase()
      }
    );

  return await tratarRespostaSupabase(
    resposta
  );

}


// =====================================================
// INSERIR REGISTRO
// =====================================================

async function inserirRegistro(
  tabela,
  dados
) {

  if (!dados) {
    throw new Error(
      "Nenhum dado foi informado para inserção."
    );
  }

  const url =
    montarUrlSupabase(tabela);

  const resposta =
    await fetch(
      url,
      {
        method: "POST",

        headers: {
          ...obterCabecalhosSupabase(),
          Prefer: "return=representation"
        },

        body:
          JSON.stringify(dados)
      }
    );

  return await tratarRespostaSupabase(
    resposta
  );

}


// =====================================================
// ATUALIZAR REGISTRO
// =====================================================

async function atualizarRegistro(
  tabela,
  filtros,
  dados
) {

  if (
    !filtros ||
    Object.keys(filtros).length === 0
  ) {
    throw new Error(
      "Informe ao menos um filtro para atualização."
    );
  }

  if (!dados) {
    throw new Error(
      "Nenhum dado foi informado para atualização."
    );
  }

  const url =
    montarUrlSupabase(
      tabela,
      filtros
    );

  const resposta =
    await fetch(
      url,
      {
        method: "PATCH",

        headers: {
          ...obterCabecalhosSupabase(),
          Prefer: "return=representation"
        },

        body:
          JSON.stringify(dados)
      }
    );

  return await tratarRespostaSupabase(
    resposta
  );

}


// =====================================================
// EXCLUIR REGISTRO
// =====================================================

async function excluirRegistro(
  tabela,
  filtros
) {

  if (
    !filtros ||
    Object.keys(filtros).length === 0
  ) {
    throw new Error(
      "Informe ao menos um filtro para exclusão."
    );
  }

  const url =
    montarUrlSupabase(
      tabela,
      filtros
    );

  const resposta =
    await fetch(
      url,
      {
        method: "DELETE",

        headers: {
          ...obterCabecalhosSupabase(),
          Prefer: "return=representation"
        }
      }
    );

  return await tratarRespostaSupabase(
    resposta
  );

}


// =====================================================
// TESTAR CONEXÃO
// =====================================================

async function testarConexaoSupabase() {

  console.log(
    "Testando conexão com o Supabase..."
  );

  const dados =
    await buscarRegistros(
      "agrofit_raw",
      {
        select: "nr_registro",
        limit: 1
      }
    );

  console.log(
    "✔ Supabase conectado.",
    dados
  );

  return true;

}
