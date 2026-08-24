// =====================================================
// APLICAÇÃO
// Controle principal do sistema
// Projeto: Rainforest Consulta
// =====================================================


// =====================================================
// ESTADO DA APLICAÇÃO
// =====================================================

let produtoSelecionado = null;

let culturaSelecionada = null;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  iniciarSistema
);


// =====================================================
// INICIAR SISTEMA
// =====================================================

async function iniciarSistema() {

  console.clear();

  exibirCabecalhoConsole();

  try {

    validarElementosUI();

    configurarEstadoInicial();

    mostrarCarregamento(
      "Conectando ao banco de dados..."
    );

    await testarConexaoSupabase();

    configurarEventosDoSistema();

    console.log(
      "✔ Sistema iniciado."
    );

  } catch (erro) {

    console.error(
      "✖ Não foi possível iniciar o sistema.",
      erro
    );

    mostrarErro(
      obterMensagemErro(erro)
    );

  } finally {

    ocultarCarregamento();

  }

}


// =====================================================
// ESTADO INICIAL
// =====================================================

function configurarEstadoInicial() {

  limparErro();

  limparCulturasProduto();

  resetarResultadoConsulta();

  produtoSelecionado = null;

  culturaSelecionada = null;

  elementosUI.campoProduto.disabled = false;

  elementosUI.campoProduto.value = "";

  elementosUI.campoProduto.placeholder =
    "Digite ao menos 3 letras";

}


// =====================================================
// EVENTOS
// =====================================================

function configurarEventosDoSistema() {

  configurarAutocompleteProdutos();


  elementosUI.btnBuscar.addEventListener(
    "click",
    executarBuscaManual
  );

}


// =====================================================
// BUSCA MANUAL
// =====================================================

async function executarBuscaManual() {

  limparErro();

  const termo =
    String(
      elementosUI.campoProduto.value || ""
    ).trim();


  if (termo.length < 3) {

    mostrarErro(
      "Digite ao menos 3 letras do nome comercial."
    );

    elementosUI.campoProduto.focus();

    return;

  }


  try {

    mostrarCarregamento(
      "Buscando produto..."
    );


    const produtos =
      await buscarProdutosAgrofit(
        termo
      );


    if (
      !Array.isArray(produtos) ||
      produtos.length === 0
    ) {

      mostrarErro(
        "Nenhum produto encontrado com esse nome comercial."
      );

      return;

    }


    // -------------------------------------------------
    // SE HOUVER APENAS UM RESULTADO
    // -------------------------------------------------

    if (produtos.length === 1) {

      elementosUI.campoProduto.value =
        produtos[0].marca_comercial || "";

      await tratarProdutoSelecionado(
        produtos[0]
      );

      return;

    }


    // -------------------------------------------------
    // MAIS DE UM RESULTADO
    // -------------------------------------------------

    produtosAutocomplete =
      produtos;


    exibirSugestoesProdutos(
      produtos
    );


  } catch (erro) {

    console.error(
      "Erro na busca manual:",
      erro
    );


    mostrarErro(
      obterMensagemErro(erro)
    );


  } finally {

    ocultarCarregamento();

  }

}


// =====================================================
// PRODUTO SELECIONADO
// =====================================================

async function tratarProdutoSelecionado(
  produto
) {

  if (!produto) {
    return;
  }


  limparErro();


  produtoSelecionado =
    produto;


  culturaSelecionada =
    null;


  // ---------------------------------------------------
  // PREENCHE O QUE JÁ SABEMOS
  // ---------------------------------------------------

  preencherProdutoBasico(
    produto
  );


  // ---------------------------------------------------
  // LIMPA RESULTADO ANTERIOR
  // ---------------------------------------------------

  limparCulturasProduto();


  definirClassificacao(
    "SELECIONE A CULTURA",
    "aguardando"
  );


  definirPermissaoCultura(
    "",
    "AGUARDANDO",
    "aguardando"
  );


  definirDetalhamentoCondicoes(
    "Selecione uma cultura para concluir a consulta."
  );


  try {

    mostrarCarregamento(
      "Buscando culturas do produto..."
    );


    const culturas =
      await buscarCulturasProdutoAgrofit(
        produto
      );


    if (
      !Array.isArray(culturas) ||
      culturas.length === 0
    ) {

      mostrarErro(
        "Nenhuma cultura foi encontrada no Agrofit para este produto."
      );


      definirClassificacao(
        "SEM CULTURAS ENCONTRADAS",
        "aguardando"
      );


      return;

    }


    exibirCulturasProduto(
      culturas,
      tratarCulturaSelecionada
    );


    console.log(
      "✔ Culturas disponíveis:",
      culturas
    );


    // -------------------------------------------------
    // SE SÓ EXISTIR UMA CULTURA
    // -------------------------------------------------

    if (culturas.length === 1) {

      const botao =
        elementosUI.listaCulturas.querySelector(
          ".culture-button"
        );


      if (botao) {

        marcarCulturaSelecionada(
          botao
        );

      }


      await tratarCulturaSelecionada(
        culturas[0]
      );

    }


  } catch (erro) {

    console.error(
      "Erro ao buscar culturas:",
      erro
    );


    mostrarErro(
      obterMensagemErro(erro)
    );


  } finally {

    ocultarCarregamento();

  }

}


// =====================================================
// CULTURA SELECIONADA
// =====================================================

async function tratarCulturaSelecionada(
  cultura
) {

  if (
    !produtoSelecionado ||
    !cultura
  ) {

    return;

  }


  limparErro();


  culturaSelecionada =
    String(cultura).trim();


  console.log(
    "🌱 Cultura selecionada:",
    culturaSelecionada
  );


  definirClassificacao(
    "ANALISANDO...",
    "aguardando"
  );


  definirPermissaoCultura(
    culturaSelecionada,
    "ANALISANDO...",
    "aguardando"
  );


  definirDetalhamentoCondicoes(
    "Analisando as informações do produto e da cultura selecionada..."
  );


  try {

    mostrarCarregamento(
      "Consultando produto e cultura..."
    );


    // -------------------------------------------------
    // BUSCAR REGISTROS AGROFIT
    // -------------------------------------------------

    const registros =
      await buscarProdutoCulturaAgrofit(
        produtoSelecionado,
        culturaSelecionada
      );


    if (
      !Array.isArray(registros) ||
      registros.length === 0
    ) {

      mostrarErro(
        "Não foram encontrados registros para essa combinação de produto e cultura."
      );


      definirClassificacao(
        "SEM DADOS",
        "aguardando"
      );


      definirPermissaoCultura(
        culturaSelecionada,
        "NÃO FOI POSSÍVEL DETERMINAR",
        "aguardando"
      );


      return;

    }


    // -------------------------------------------------
    // CONSOLIDAR AGROFIT
    // -------------------------------------------------

    const produtoConsolidado =
      consolidarProdutoAgrofit(
        registros
      );


    // -------------------------------------------------
    // CONSULTAR RAINFOREST
    //
    // A consulta Rainforest cria:
    // produto.ingrediente_ativo_com_cas
    // -------------------------------------------------

    await processarClassificacaoRainforest(
      produtoConsolidado
    );


    // -------------------------------------------------
    // PREENCHER PRODUTO
    //
    // Só fazemos isso depois da Rainforest,
    // porque agora o CAS já pode existir.
    // -------------------------------------------------

    preencherProdutoConsolidado(
      produtoConsolidado
    );


    console.log(
      "🧪 Produto consolidado após Rainforest:",
      produtoConsolidado
    );


  } catch (erro) {

    console.error(
      "Erro ao processar cultura:",
      erro
    );


    mostrarErro(
      obterMensagemErro(erro)
    );


    definirClassificacao(
      "ERRO NA CONSULTA",
      "aguardando"
    );


    definirPermissaoCultura(
      culturaSelecionada,
      "NÃO FOI POSSÍVEL DETERMINAR",
      "aguardando"
    );


  } finally {

    ocultarCarregamento();

  }

}


// =====================================================
// CLASSIFICAÇÃO RAINFOREST
// =====================================================

async function processarClassificacaoRainforest(
  produto
) {

  let resultado = null;


  // ---------------------------------------------------
  // CONSULTAR CLASSIFICADOR RAINFOREST
  // ---------------------------------------------------

  if (
    typeof consultarClassificacaoRainforest ===
    "function"
  ) {

    resultado =
      await consultarClassificacaoRainforest(
        produto
      );

  }


  // ---------------------------------------------------
  // CASO NÃO TENHAMOS CLASSIFICADOR
  // ---------------------------------------------------

  if (!resultado) {

    definirClassificacao(
      "CLASSIFICAÇÃO NÃO DETERMINADA",
      "aguardando"
    );


    definirPermissaoCultura(
      culturaSelecionada,
      "CONSULTA RAINFOREST PENDENTE",
      "aguardando"
    );


    definirDetalhamentoCondicoes(
      "Os dados do Agrofit foram encontrados. A classificação Rainforest ainda não pôde ser determinada."
    );


    return;

  }


  aplicarResultadoRainforest(
    resultado
  );

}


// =====================================================
// APLICAR RESULTADO RAINFOREST
// =====================================================

function aplicarResultadoRainforest(
  resultado
) {

  const classificacao =
    String(
      resultado.classificacao || ""
    ).trim();


  const permissao =
    String(
      resultado.permissao || ""
    ).trim();


  const detalhamento =
    String(
      resultado.detalhamento ||
      resultado.condicoes ||
      ""
    ).trim();


  const classeVisual =
    obterClasseVisualRainforest(
      classificacao
    );


  definirClassificacao(
    classificacao ||
    "CLASSIFICAÇÃO NÃO DETERMINADA",
    classeVisual
  );


  definirPermissaoCultura(
    culturaSelecionada,
    permissao ||
    "NÃO FOI POSSÍVEL DETERMINAR",
    classeVisual
  );


  definirDetalhamentoCondicoes(
    detalhamento ||
    "Nenhuma condição adicional informada."
  );

}


// =====================================================
// CLASSE VISUAL
// =====================================================

function obterClasseVisualRainforest(
  classificacao
) {

  const texto =
    String(
      classificacao || ""
    )
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();


  if (
    texto.includes("proibid")
  ) {

    return "proibido";

  }


  if (
    texto.includes("excepc")
  ) {

    return "uso-excepcional";

  }


  if (
    texto.includes("mitig")
  ) {

    return "mitigacao";

  }


  if (
    texto.includes("sem restr") ||
    texto.includes("permit") ||
    texto.includes("liberad")
  ) {

    return "sem-restricao";

  }


  return "aguardando";

}


// =====================================================
// LIMPAR PRODUTO SELECIONADO
// =====================================================

function limparProdutoSelecionado() {

  produtoSelecionado = null;

  culturaSelecionada = null;

  limparCulturasProduto();

  resetarResultadoConsulta();

}


// =====================================================
// MENSAGEM DE ERRO
// =====================================================

function obterMensagemErro(
  erro
) {

  if (
    erro instanceof Error
  ) {

    return erro.message;

  }


  return String(
    erro ||
    "Erro inesperado."
  );

}


// =====================================================
// CABEÇALHO DO CONSOLE
// =====================================================

function exibirCabecalhoConsole() {

  console.log(
    "======================================"
  );

  console.log(
    " Rainforest Consulta"
  );

  console.log(
    " Produto → Cultura → Classificação"
  );

  console.log(
    "======================================"
  );

}
