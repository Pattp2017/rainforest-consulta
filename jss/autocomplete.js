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

const TEMPO_AUTOCOMPLETE =400;

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


  // ---------------------------------------------------
  // Sempre que o usuário altera o texto,
  // o produto anteriormente selecionado deixa
  // de ser considerado válido.
  // ---------------------------------------------------

  if (
    typeof limparProdutoSelecionado === "function"
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


  // ---------------------------------------------------
  // Evita executar consulta antiga caso o usuário
  // continue digitando durante o debounce.
  // ---------------------------------------------------

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
      Confere novamente se o texto do campo
      continua igual ao termo que originou
      esta consulta.

      Isso evita mostrar sugestões antigas
      depois que o usuário já digitou outra coisa.
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


  produtos.slice(0, 20).forEach(
    (produto, indice) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "suggestion-item";


      item.dataset.indice =
        String(indice);


      // -------------------------------------------------
      // NOME COMERCIAL
      // -------------------------------------------------

      const nome =
        document.createElement(
          "div"
        );


      nome.className =
        "suggestion-name";


      nome.textContent =
        produto.marca_comercial ||
        "Produto sem nome";


      item.appendChild(
        nome
      );


      // -------------------------------------------------
      // REGISTRO MAPA
      // -------------------------------------------------

      if (
        produto.nr_registro
      ) {

        const registro =
          document.createElement(
            "div"
          );


        registro.className =
          "suggestion-meta";


        registro.textContent =
          `Registro MAPA: ${produto.nr_registro}`;


        item.appendChild(
          registro
        );

      }


      // -------------------------------------------------
      // CLIQUE
      // -------------------------------------------------

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
// FECHAR LISTA
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


  /*
    A partir daqui começa a nova etapa:

    Produto
        ↓
    Culturas do produto
        ↓
    Usuário seleciona cultura
        ↓
    Classificação Rainforest
  */

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

    /*
      Se há uma sugestão destacada,
      seleciona aquela sugestão.
    */

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
      Se não existe sugestão destacada,
      o botão BUSCAR pode assumir a consulta.
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
// ATUALIZAR ITEM ATIVO
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
