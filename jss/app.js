// =====================================================
// INTERFACE DO USUÁRIO
// Atualização dos elementos visuais da página
// Projeto: Rainforest Consulta
// =====================================================


// =====================================================
// ELEMENTOS DA TELA
// =====================================================

const elementosUI = {

  campoProduto:
    document.getElementById("campoProduto"),

  btnBuscar:
    document.getElementById("btnBuscar"),

  listaSugestoes:
    document.getElementById("listaSugestoes"),

  blocoCulturas:
    document.getElementById("blocoCulturas"),

  listaCulturas:
    document.getElementById("listaCulturas"),

  mensagemCarregamento:
    document.getElementById("mensagemCarregamento"),

  mensagemErro:
    document.getElementById("mensagemErro"),

  respostaPrincipal:
    document.getElementById("respostaPrincipal"),

  nomeComercial:
    document.getElementById("nomeComercial"),

  registroMapa:
    document.getElementById("registroMapa"),

  ingredienteAtivo:
    document.getElementById("ingredienteAtivo"),

  classeAgronomica:
    document.getElementById("classeAgronomica"),

  pragasAlvos:
    document.getElementById("pragasAlvos"),

  perguntaCultura:
    document.getElementById("perguntaCultura"),

  respostaCultura:
    document.getElementById("respostaCultura"),

  detalhamentoCondicoes:
    document.getElementById("detalhamentoCondicoes")
};


// =====================================================
// VALIDAR ELEMENTOS
// =====================================================

function validarElementosUI() {

  const elementosAusentes = [];

  Object.entries(elementosUI).forEach(
    ([nome, elemento]) => {

      if (!elemento) {
        elementosAusentes.push(nome);
      }

    }
  );

  if (elementosAusentes.length > 0) {

    throw new Error(
      "Elementos não encontrados no index.html: " +
      elementosAusentes.join(", ")
    );

  }

}


// =====================================================
// CARREGAMENTO
// =====================================================

function mostrarCarregamento(
  mensagem = "Consultando dados..."
) {

  elementosUI.mensagemCarregamento.textContent =
    mensagem;

  elementosUI.mensagemCarregamento.classList.remove(
    "hidden"
  );

  elementosUI.mensagemCarregamento.style.display =
    "block";

}


function ocultarCarregamento() {

  elementosUI.mensagemCarregamento.classList.add(
    "hidden"
  );

  elementosUI.mensagemCarregamento.style.display =
    "none";

}


// =====================================================
// ERRO
// =====================================================

function mostrarErro(mensagem) {

  elementosUI.mensagemErro.textContent =
    mensagem ||
    "Ocorreu um erro inesperado.";

  elementosUI.mensagemErro.classList.remove(
    "hidden"
  );

  elementosUI.mensagemErro.style.display =
    "block";

}


function limparErro() {

  elementosUI.mensagemErro.textContent = "";

  elementosUI.mensagemErro.classList.add(
    "hidden"
  );

  elementosUI.mensagemErro.style.display =
    "none";

}


// =====================================================
// PRODUTO SELECIONADO
// =====================================================

function preencherProdutoBasico(produto) {

  elementosUI.nomeComercial.textContent =
    produto?.marca_comercial || "-";

  elementosUI.registroMapa.textContent =
    produto?.nr_registro || "-";

  elementosUI.ingredienteAtivo.textContent =
    produto?.ingrediente_ativo || "-";

  elementosUI.classeAgronomica.textContent =
    produto?.classe || "-";

}


// =====================================================
// PRODUTO CONSOLIDADO
// =====================================================

function preencherProdutoConsolidado(produto) {

  if (!produto) {
    limparDadosProduto();
    return;
  }

  elementosUI.nomeComercial.textContent =
    produto.marca_comercial || "-";

  elementosUI.registroMapa.textContent =
    produto.nr_registro || "-";

  elementosUI.ingredienteAtivo.textContent =
    produto.ingrediente_ativo || "-";

  elementosUI.classeAgronomica.textContent =
    produto.classe || "-";

  elementosUI.pragasAlvos.textContent =
    produto.pragas_alvos || "-";

}


// =====================================================
// LIMPAR PRODUTO
// =====================================================

function limparDadosProduto() {

  elementosUI.nomeComercial.textContent = "-";
  elementosUI.registroMapa.textContent = "-";
  elementosUI.ingredienteAtivo.textContent = "-";
  elementosUI.classeAgronomica.textContent = "-";
  elementosUI.pragasAlvos.textContent = "-";

}


// =====================================================
// CULTURAS
// =====================================================

function exibirCulturasProduto(
  culturas,
  callbackSelecao
) {

  elementosUI.listaCulturas.innerHTML = "";

  if (
    !Array.isArray(culturas) ||
    culturas.length === 0
  ) {

    elementosUI.blocoCulturas.classList.add(
      "hidden"
    );

    return;

  }

  culturas.forEach((cultura) => {

    const botao =
      document.createElement("button");

    botao.type = "button";

    botao.className =
      "culture-button";

    botao.textContent =
      cultura;

    botao.dataset.cultura =
      cultura;

    botao.addEventListener(
      "click",
      () => {

        marcarCulturaSelecionada(
          botao
        );

        if (
          typeof callbackSelecao ===
          "function"
        ) {

          callbackSelecao(
            cultura
          );

        }

      }
    );

    elementosUI.listaCulturas.appendChild(
      botao
    );

  });

  elementosUI.blocoCulturas.classList.remove(
    "hidden"
  );

}


// =====================================================
// MARCAR CULTURA SELECIONADA
// =====================================================

function marcarCulturaSelecionada(
  botaoSelecionado
) {

  const botoes =
    elementosUI.listaCulturas.querySelectorAll(
      ".culture-button"
    );

  botoes.forEach((botao) => {

    botao.classList.remove(
      "active",
      "selecionada"
    );

  });

  botaoSelecionado.classList.add(
    "active",
    "selecionada"
  );

}


// =====================================================
// LIMPAR CULTURAS
// =====================================================

function limparCulturasProduto() {

  elementosUI.listaCulturas.innerHTML = "";

  elementosUI.blocoCulturas.classList.add(
    "hidden"
  );

}


// =====================================================
// CLASSIFICAÇÃO
// =====================================================

function definirClassificacao(
  texto,
  classeEstado = "aguardando"
) {

  const elemento =
    elementosUI.respostaPrincipal;

  elemento.textContent =
    texto || "AGUARDANDO CONSULTA";

  elemento.className =
    "classificacao-resultado";

  elemento.classList.add(
    classeEstado
  );

}


// =====================================================
// PODE UTILIZAR?
// =====================================================

function definirPermissaoCultura(
  cultura,
  resposta,
  classeEstado = "aguardando"
) {

  const nomeCultura =
    String(cultura || "").trim();

  if (nomeCultura) {

    elementosUI.perguntaCultura.textContent =
      `Pode utilizar para ${nomeCultura}?`;

  } else {

    elementosUI.perguntaCultura.textContent =
      "Pode utilizar para a cultura selecionada?";

  }

  elementosUI.respostaCultura.textContent =
    resposta || "AGUARDANDO";

  elementosUI.respostaCultura.className =
    "permissao-resposta";

  elementosUI.respostaCultura.classList.add(
    classeEstado
  );

}


// =====================================================
// DETALHAMENTO / CONDIÇÕES
// =====================================================

function definirDetalhamentoCondicoes(
  texto
) {

  elementosUI.detalhamentoCondicoes.textContent =
    texto ||
    "Nenhuma condição adicional informada.";

}


// =====================================================
// RESET DO RESULTADO
// =====================================================

function resetarResultadoConsulta() {

  definirClassificacao(
    "AGUARDANDO CONSULTA",
    "aguardando"
  );

  definirPermissaoCultura(
    "",
    "AGUARDANDO",
    "aguardando"
  );

  definirDetalhamentoCondicoes(
    "Selecione um produto e uma cultura para visualizar as condições aplicáveis."
  );

  limparDadosProduto();

}


// =====================================================
// LIMPAR PRODUTO SELECIONADO
// =====================================================

function limparProdutoSelecionado() {

  limparCulturasProduto();

  resetarResultadoConsulta();

}
