// =====================================================
// AUTOCOMPLETE
// Produtos por cultura
// Projeto: Rainforest Consulta
// =====================================================


// =====================================================
// ESTADO
// =====================================================

let timerAutocomplete = null;

let produtosAutocomplete = [];


// =====================================================
// CONFIGURAR AUTOCOMPLETE
// =====================================================

function configurarAutocompleteProdutos() {

  elementosUI.campoProduto.addEventListener(
    "input",
    tratarDigitacaoProduto
  );

  elementosUI.campoProduto.addEventListener(
    "keydown",
    tratarTeclaProduto
  );

  document.addEventListener(
    "click",
    tratarCliqueForaAutocomplete
  );

}


// =====================================================
// DIGITAÇÃO
// =====================================================

function tratarDigitacaoProduto() {

  limparErro();

  const termo =
    elementosUI.campoProduto.value.trim();

  limparSugestoesProdutos();

  if (termo.length < 3) {
    return;
  }

  clearTimeout(
    timerAutocomplete
  );

  timerAutocomplete =
    setTimeout(
      () => executarBuscaAutocomplete(termo),
      300
    );

}


// =====================================================
// CONSULTAR PRODUTOS
// =====================================================

async function executarBuscaAutocomplete(
  termo
) {

  const cultura =
    elementosUI.campoCultura.value.trim();

  if (!cultura) {
    return;
  }

  try {

    mostrarCarregamento(
      "Buscando produtos..."
    );

    produtosAutocomplete =
      await buscarProdutosAgrofit(
        cultura,
        termo
      );

    exibirSugestoesProdutos(
      produtosAutocomplete
    );

  } catch (erro) {

    console.error(
      "Erro ao buscar produtos:",
      erro
    );

    mostrarErro(
      erro.message ||
      "Não foi possível buscar os produtos."
    );

  } finally {

    ocultarCarregamento();

  }

}


// =====================================================
// EXIBIR SUGESTÕES
// =====================================================

function exibirSugestoesProdutos(
  produtos
) {

  limparSugestoesProdutos();

  if (
    !Array.isArray(produtos) ||
    produtos.length === 0
  ) {

    const item =
      document.createElement("div");

    item.textContent =
      "Nenhum produto encontrado";

    item.className =
      "suggestion-empty";

    elementosUI.listaSugestoes.appendChild(
      item
    );

    elementosUI.listaSugestoes.style.display =
      "block";

    return;

  }

  produtos.forEach(
    (produto) => {

      const item =
        document.createElement("div");

      item.className =
        "suggestion-item";

      item.textContent =
        produto.marca_comercial;

      item.addEventListener(
        "click",
        () =>
          selecionarProdutoAutocomplete(
            produto
          )
      );

      elementosUI.listaSugestoes.appendChild(
        item
      );

    }
  );

  elementosUI.listaSugestoes.style.display =
    "block";

}


// =====================================================
// SELECIONAR PRODUTO
// =====================================================

function selecionarProdutoAutocomplete(
  produto
) {

  elementosUI.campoProduto.value =
    produto.marca_comercial || "";

  limparSugestoesProdutos();

  console.log(
    "Produto selecionado:",
    produto
  );

  // Nesta próxima etapa
  // chamaremos a consulta completa
  // Agrofit + Rainforest.

  if (
    typeof tratarProdutoSelecionado ===
    "function"
  ) {

    tratarProdutoSelecionado(
      produto
    );

  }

}


// =====================================================
// TECLADO
// =====================================================

function tratarTeclaProduto(
  evento
) {

  if (
    evento.key === "Escape"
  ) {

    limparSugestoesProdutos();

  }

}


// =====================================================
// CLIQUE FORA
// =====================================================

function tratarCliqueForaAutocomplete(
  evento
) {

  if (
    evento.target ===
      elementosUI.campoProduto ||
    elementosUI.listaSugestoes.contains(
      evento.target
    )
  ) {
    return;
  }

  limparSugestoesProdutos();

}
