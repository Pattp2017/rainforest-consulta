// =====================================================
// INTERFACE DO USUÁRIO
// Atualização dos elementos visuais da página
// Projeto: Rainforest Consulta
// =====================================================

// -----------------------------------------------------
// ELEMENTOS DA TELA
// -----------------------------------------------------

const elementosUI = {
  campoCultura:
    document.getElementById("campoCultura"),

  campoProduto:
    document.getElementById("campoProduto"),

  listaSugestoes:
    document.getElementById("listaSugestoes"),

  mensagemCarregamento:
    document.getElementById("mensagemCarregamento"),

  mensagemErro:
    document.getElementById("mensagemErro")
};

// -----------------------------------------------------
// VALIDAR ELEMENTOS
// -----------------------------------------------------

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

// -----------------------------------------------------
// MOSTRAR CARREGAMENTO
// -----------------------------------------------------

function mostrarCarregamento(
  mensagem = "Consultando dados..."
) {
  elementosUI.mensagemCarregamento.textContent =
    mensagem;

  elementosUI.mensagemCarregamento.style.display =
    "block";
}

// -----------------------------------------------------
// OCULTAR CARREGAMENTO
// -----------------------------------------------------

function ocultarCarregamento() {
  elementosUI.mensagemCarregamento.style.display =
    "none";
}

// -----------------------------------------------------
// MOSTRAR ERRO
// -----------------------------------------------------

function mostrarErro(mensagem) {
  elementosUI.mensagemErro.textContent =
    mensagem || "Ocorreu um erro inesperado.";

  elementosUI.mensagemErro.style.display =
    "block";
}

// -----------------------------------------------------
// LIMPAR ERRO
// -----------------------------------------------------

function limparErro() {
  elementosUI.mensagemErro.textContent = "";

  elementosUI.mensagemErro.style.display =
    "none";
}

// -----------------------------------------------------
// POPULAR SELECT DE CULTURAS
// -----------------------------------------------------

function popularSelectCulturas(culturas) {
  if (!Array.isArray(culturas)) {
    throw new Error(
      "A lista de culturas informada é inválida."
    );
  }

  elementosUI.campoCultura.innerHTML = "";

  const opcaoInicial =
    document.createElement("option");

  opcaoInicial.value = "";
  opcaoInicial.textContent =
    "Selecione a cultura";

  elementosUI.campoCultura.appendChild(
    opcaoInicial
  );

  culturas.forEach((cultura) => {
    const opcao =
      document.createElement("option");

    opcao.value = cultura;
    opcao.textContent = cultura;

    elementosUI.campoCultura.appendChild(
      opcao
    );
  });

  elementosUI.campoCultura.disabled = false;
}

// -----------------------------------------------------
// MOSTRAR FALHA NO SELECT
// -----------------------------------------------------

function mostrarFalhaCulturas() {
  elementosUI.campoCultura.innerHTML = "";

  const opcaoErro =
    document.createElement("option");

  opcaoErro.value = "";
  opcaoErro.textContent =
    "Não foi possível carregar as culturas";

  elementosUI.campoCultura.appendChild(
    opcaoErro
  );

  elementosUI.campoCultura.disabled = true;
}

// -----------------------------------------------------
// HABILITAR CAMPO DE PRODUTO
// -----------------------------------------------------

function habilitarCampoProduto() {
  elementosUI.campoProduto.disabled = false;

  elementosUI.campoProduto.placeholder =
    "Digite ao menos 3 letras";

  elementosUI.campoProduto.focus();
}

// -----------------------------------------------------
// DESABILITAR CAMPO DE PRODUTO
// -----------------------------------------------------

function desabilitarCampoProduto() {
  elementosUI.campoProduto.value = "";

  elementosUI.campoProduto.disabled = true;

  elementosUI.campoProduto.placeholder =
    "Selecione primeiro a cultura";

  limparSugestoesProdutos();
}

// -----------------------------------------------------
// LIMPAR SUGESTÕES
// -----------------------------------------------------

function limparSugestoesProdutos() {
  elementosUI.listaSugestoes.innerHTML = "";

  elementosUI.listaSugestoes.style.display =
    "none";
}
