// =====================================================
// APLICAÇÃO
// Inicialização e controle principal do sistema
// Projeto: Rainforest Consulta
// =====================================================

// -----------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  iniciarSistema
);

// -----------------------------------------------------
// INICIAR SISTEMA
// -----------------------------------------------------

async function iniciarSistema() {
  console.clear();

  exibirCabecalhoConsole();

  try {
    validarElementosUI();

    configurarEstadoInicial();

    mostrarCarregamento(
      "Conectando ao banco de dados..."
    );

    console.log(
      "Conectando ao Supabase..."
    );

    await testarConexaoSupabase();

    console.log(
      "✔ Conexão realizada com sucesso."
    );

    mostrarCarregamento(
      "Carregando culturas..."
    );

    console.log(
      "Carregando culturas..."
    );

    const culturas =
      await carregarCulturas();

    popularSelectCulturas(culturas);

    configurarEventosDoSistema();

    console.log(
      `✔ ${culturas.length} culturas carregadas.`
    );

    console.table(culturas);
  } catch (erro) {
    console.error(
      "✖ Não foi possível iniciar o sistema.",
      erro
    );

    mostrarFalhaCulturas();

    mostrarErro(
      obterMensagemErro(erro)
    );
  } finally {
    ocultarCarregamento();
  }
}

// -----------------------------------------------------
// CONFIGURAR ESTADO INICIAL
// -----------------------------------------------------

function configurarEstadoInicial() {
  limparErro();

  elementosUI.campoCultura.disabled = true;

  desabilitarCampoProduto();
}

// -----------------------------------------------------
// CONFIGURAR EVENTOS
// -----------------------------------------------------

function configurarEventosDoSistema() {
  elementosUI.campoCultura.addEventListener(
    "change",
    tratarAlteracaoCultura
  );
}

// -----------------------------------------------------
// ALTERAÇÃO DA CULTURA
// -----------------------------------------------------

function tratarAlteracaoCultura() {
  limparErro();

  const culturaSelecionada =
    elementosUI.campoCultura.value.trim();

  if (!culturaSelecionada) {
    desabilitarCampoProduto();

    return;
  }

  habilitarCampoProduto();

  console.log(
    "Cultura selecionada:",
    culturaSelecionada
  );
}

// -----------------------------------------------------
// MENSAGEM DE ERRO
// -----------------------------------------------------

function obterMensagemErro(erro) {
  if (erro instanceof Error) {
    return erro.message;
  }

  return String(
    erro || "Erro inesperado."
  );
}

// -----------------------------------------------------
// CABEÇALHO DO CONSOLE
// -----------------------------------------------------

function exibirCabecalhoConsole() {
  console.log(
    "======================================"
  );

  console.log(
    " Rainforest Consulta"
  );

  console.log(
    "======================================"
  );

  console.log("");
}
