// =====================================================
// AUTOCOMPLETE
// Busca de produtos pelo nome comercial
// Projeto: Rainforest Consulta
// =====================================================


// =====================================================
// ESTADO
// =====================================================

let timerAutocomplete = null;

let produtosAutocomplete = [];

let indiceSugestaoAtiva = -1;


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const TEMPO_AUTOCOMPLETE = 400;

const MINIMO_CARACTERES_AUTOCOMPLETE = 3;


// =====================================================
// CONFIGURAR AUTOCOMPLETE
// =====================================================

function configurarAutocompleteProdutos() {

  if (
    !elementosUI ||
    !elementosUI.campoProduto ||
    !elementosUI.listaSugestoes
  ) {

    console.warn(
      "Elementos do autocomplete não encontrados."
    );

    return;

  }


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
    String(
      elementosUI.campoProduto.value || ""
    ).trim();


  /*
    Ao alterar o texto, qualquer produto
    anteriormente selecionado deixa de ser válido.
  */

  if (
    typeof limparProdutoSelecionado ===
    "function"
  ) {

    limparProdutoSelecionado();

  }


  limparSugestoesProdutos();


  if (
    termo.length <
    MINIMO_CARACTERES_AUTOCOMPLETE
  ) {

    ocultarCarregamento();

    return;

  }


  clearTimeout(
    timerAutocomplete
  );


  timerAutocomplete =
    setTimeout(
      () =>
        executarBuscaAutocomplete(
          termo
        ),
      TEMPO_AUTOCOMPLETE
    );

}


// =====================================================
// CONSULTAR PRODUTOS
// =====================================================

async function executarBuscaAutocomplete(
  termo
) {

  const termoAtual =
    String(
      elementosUI.campoProduto.value || ""
    ).trim();


  if (
    termoAtual !== termo ||
    termoAtual.length <
      MINIMO_CARACTERES_AUTOCOMPLETE
  ) {

    return;

  }


  try {

    mostrarCarregamento(
      "Buscando produtos..."
    );


    produtosAutocomplete =
      await buscarProdutosAgrofit(
        termoAtual
      );


    /*
      Se o usuário continuou digitando,
      descarta o resultado anterior.
    */

    if (
      String(
        elementosUI.campoProduto.value || ""
      ).trim() !== termoAtual
    ) {

      return;

    }


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


    limparSugestoesProdutos();


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
      document.createElement(
        "div"
      );


    item.className =
      "suggestion-empty";


    item.textContent =
      "Nenhum produto encontrado";


    elementosUI.listaSugestoes.appendChild(
      item
    );


    abrirListaSugestoes();

    return;

  }


  produtos
    .slice(0, 20)
    .forEach(
      (produto, indice) => {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "suggestion-item";


        item.dataset.indice =
          String(indice);


        // ===============================================
        // NOME COMERCIAL
        // ===============================================

        const nomeProduto =
          document.createElement(
            "span"
          );


        nomeProduto.className =
          "suggestion-name";


        nomeProduto.textContent =
          produto.marca_comercial ||
          "Produto sem nome";


        // ===============================================
        // MAPA
        // ===============================================

        const mapaProduto =
          document.createElement(
            "span"
          );


        mapaProduto.className =
          "suggestion-mapa";


        mapaProduto.textContent =
          produto.nr_registro
            ? `MAPA ${produto.nr_registro}`
            : "";


        // ===============================================
        // INSERIR CONTEÚDO
        // ===============================================

        item.appendChild(
          nomeProduto
        );


        item.appendChild(
          mapaProduto
        );


        // ===============================================
        // CLIQUE
        // ===============================================

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


  indiceSugestaoAtiva = -1;


  abrirListaSugestoes();

}


// =====================================================
// ABRIR LISTA
// =====================================================

function abrirListaSugestoes() {

  elementosUI.listaSugestoes.style.display =
    "block";


  elementosUI.listaSugestoes.classList.add(
    "show"
  );

}


// =====================================================
// LIMPAR / FECHAR LISTA
// =====================================================

function limparSugestoesProdutos() {

  if (
    !elementosUI ||
    !elementosUI.listaSugestoes
  ) {

    return;

  }


  elementosUI.listaSugestoes.innerHTML =
    "";


  elementosUI.listaSugestoes.style.display =
    "none";


  elementosUI.listaSugestoes.classList.remove(
    "show"
  );


  indiceSugestaoAtiva = -1;

}


// =====================================================
// SELECIONAR PRODUTO
// =====================================================

function selecionarProdutoAutocomplete(
  produto
) {

  if (!produto) {
    return;
  }


  elementosUI.campoProduto.value =
    produto.marca_comercial ||
    "";


  limparSugestoesProdutos();


  console.log(
    "✔ Produto selecionado:",
    produto
  );


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

  const itens =
    obterItensSugestoes();


  // ---------------------------------------------------
  // ESC
  // ---------------------------------------------------

  if (
    evento.key ===
    "Escape"
  ) {

    limparSugestoesProdutos();

    return;

  }


  // ---------------------------------------------------
  // SETA PARA BAIXO
  // ---------------------------------------------------

  if (
    evento.key ===
    "ArrowDown"
  ) {

    if (
      itens.length === 0
    ) {
      return;
    }


    evento.preventDefault();


    indiceSugestaoAtiva += 1;


    if (
      indiceSugestaoAtiva >=
      itens.length
    ) {

      indiceSugestaoAtiva =
        0;

    }


    atualizarSugestaoAtiva(
      itens
    );

    return;

  }


  // ---------------------------------------------------
  // SETA PARA CIMA
  // ---------------------------------------------------

  if (
    evento.key ===
    "ArrowUp"
  ) {

    if (
      itens.length === 0
    ) {
      return;
    }


    evento.preventDefault();


    indiceSugestaoAtiva -= 1;


    if (
      indiceSugestaoAtiva < 0
    ) {

      indiceSugestaoAtiva =
        itens.length - 1;

    }


    atualizarSugestaoAtiva(
      itens
    );

    return;

  }


  // ---------------------------------------------------
  // ENTER
  // ---------------------------------------------------

  if (
    evento.key ===
    "Enter"
  ) {

    if (
      indiceSugestaoAtiva >= 0 &&
      itens[indiceSugestaoAtiva]
    ) {

      evento.preventDefault();


      const indice =
        Number(
          itens[
            indiceSugestaoAtiva
          ].dataset.indice
        );


      const produto =
        produtosAutocomplete[
          indice
        ];


      selecionarProdutoAutocomplete(
        produto
      );

      return;

    }


    /*
      Sem sugestão destacada,
      executa busca manual.
    */

    if (
      typeof executarBuscaManual ===
      "function"
    ) {

      evento.preventDefault();

      executarBuscaManual();

    }

  }

}


// =====================================================
// OBTER ITENS
// =====================================================

function obterItensSugestoes() {

  if (
    !elementosUI ||
    !elementosUI.listaSugestoes
  ) {

    return [];

  }


  return Array.from(
    elementosUI.listaSugestoes.querySelectorAll(
      ".suggestion-item"
    )
  );

}


// =====================================================
// ITEM ATIVO
// =====================================================

function atualizarSugestaoAtiva(
  itens
) {

  itens.forEach(
    (item, indice) => {

      if (
        indice ===
        indiceSugestaoAtiva
      ) {

        item.classList.add(
          "active"
        );


        item.scrollIntoView(
          {
            block: "nearest"
          }
        );

      } else {

        item.classList.remove(
          "active"
        );

      }

    }
  );

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
