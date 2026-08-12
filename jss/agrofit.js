// =====================================================
// AGROFIT
// Consultas relacionadas à tabela agrofit_raw
// Projeto: Rainforest Consulta
//
// NOVA LÓGICA:
//
// 1. Usuário pesquisa pelo nome comercial
// 2. Sistema encontra o produto
// 3. Sistema lista as culturas existentes no Agrofit
//    para aquele produto
// 4. Usuário seleciona a cultura
// 5. Sistema busca os registros específicos
//    produto + cultura
// =====================================================


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const TABELA_AGROFIT = "agrofit_raw";


// =====================================================
// NORMALIZAÇÃO INTERNA
// =====================================================

function normalizarTextoAgrofit(valor) {

  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

}


// =====================================================
// ESCAPAR TERMO PARA CONSULTA
// =====================================================

function limparTermoConsultaAgrofit(valor) {

  return String(valor || "")
    .trim()
    .replace(/[%*]/g, "");

}


// =====================================================
// BUSCAR PRODUTOS PELO NOME COMERCIAL
// =====================================================

async function buscarProdutosAgrofit(termo) {

  const termoLimpo =
    limparTermoConsultaAgrofit(termo);

  if (termoLimpo.length < 3) {
    return [];
  }

  console.log(
    "🔎 Buscando produtos Agrofit:",
    termoLimpo
  );

  const registros =
    await buscarRegistros(
      TABELA_AGROFIT,
      {
        select:
          "nr_registro,marca_comercial,ingrediente_ativo,classe,situacao",

        marca_comercial:
          `ilike.*${termoLimpo}*`,

        order:
          "marca_comercial.asc",

        limit: 100
      }
    );

  if (!Array.isArray(registros)) {

    throw new Error(
      "A consulta de produtos não retornou uma lista válida."
    );

  }

  // ---------------------------------------------------
  // REMOVER REPETIÇÕES
  //
  // O Agrofit possui várias linhas do mesmo produto
  // porque cada combinação pode representar cultura,
  // praga ou alvo diferente.
  // ---------------------------------------------------

  const produtosUnicos =
    new Map();

  registros.forEach((registro) => {

    const nome =
      String(
        registro.marca_comercial || ""
      ).trim();

    if (!nome) {
      return;
    }

    const numeroRegistro =
      String(
        registro.nr_registro || ""
      ).trim();

    /*
      Usamos nome + registro porque pode existir
      nome comercial semelhante associado a registros
      diferentes.
    */

    const chave =
      `${normalizarTextoAgrofit(nome)}|${numeroRegistro}`;

    if (!produtosUnicos.has(chave)) {

      produtosUnicos.set(
        chave,
        {
          nr_registro:
            registro.nr_registro,

          marca_comercial:
            nome,

          ingrediente_ativo:
            registro.ingrediente_ativo,

          classe:
            registro.classe,

          situacao:
            registro.situacao
        }
      );

    }

  });

  const produtos =
    Array.from(
      produtosUnicos.values()
    );

  console.log(
    "✔ Produtos encontrados:",
    produtos
  );

  return produtos;

}


// =====================================================
// BUSCAR CULTURAS DO PRODUTO
// =====================================================

async function buscarCulturasProdutoAgrofit(
  produto
) {

  if (!produto) {
    return [];
  }

  const nomeComercial =
    String(
      produto.marca_comercial || ""
    ).trim();

  const registroMapa =
    String(
      produto.nr_registro || ""
    ).trim();

  if (!nomeComercial) {
    return [];
  }

  console.log(
    "🌱 Buscando culturas do produto:",
    nomeComercial
  );

  const parametros = {

    select:
      "cultura",

    marca_comercial:
      `eq.${nomeComercial}`,

    cultura:
      "not.is.null",

    order:
      "cultura.asc",

    limit: 1000
  };


  /*
    Quando temos o número de registro,
    usamos também esse filtro.

    Isso evita misturar produtos que
    eventualmente tenham nomes semelhantes.
  */

  if (registroMapa) {

    parametros.nr_registro =
      `eq.${registroMapa}`;

  }


  const registros =
    await buscarRegistros(
      TABELA_AGROFIT,
      parametros
    );


  if (!Array.isArray(registros)) {

    throw new Error(
      "A consulta de culturas não retornou uma lista válida."
    );

  }


  const culturasUnicas =
    new Map();


  registros.forEach((registro) => {

    const cultura =
      String(
        registro.cultura || ""
      ).trim();

    if (!cultura) {
      return;
    }


    const chave =
      normalizarTextoAgrofit(cultura);


    if (!culturasUnicas.has(chave)) {

      culturasUnicas.set(
        chave,
        cultura
      );

    }

  });


  const culturas =
    Array.from(
      culturasUnicas.values()
    ).sort(
      (a, b) =>
        a.localeCompare(
          b,
          "pt-BR",
          {
            sensitivity: "base"
          }
        )
    );


  console.log(
    "✔ Culturas encontradas:",
    culturas
  );


  return culturas;

}


// =====================================================
// BUSCAR DADOS DO PRODUTO + CULTURA
// =====================================================

async function buscarProdutoCulturaAgrofit(
  produto,
  cultura
) {

  if (!produto) {

    throw new Error(
      "Produto não informado."
    );

  }


  const culturaLimpa =
    String(cultura || "").trim();


  if (!culturaLimpa) {

    throw new Error(
      "Cultura não informada."
    );

  }


  const nomeComercial =
    String(
      produto.marca_comercial || ""
    ).trim();


  const registroMapa =
    String(
      produto.nr_registro || ""
    ).trim();


  if (!nomeComercial) {

    throw new Error(
      "Nome comercial não informado."
    );

  }


  console.log(
    "🔎 Buscando combinação:",
    nomeComercial,
    "+",
    culturaLimpa
  );


  const parametros = {

    select:
      [
        "nr_registro",
        "marca_comercial",
        "formulacao",
        "ingrediente_ativo",
        "titular_de_registro",
        "classe",
        "modo_de_acao",
        "cultura",
        "praga_nome_cientifico",
        "praga_nome_comum",
        "classe_toxicologica",
        "classe_ambiental",
        "organicos",
        "situacao"
      ].join(","),

    marca_comercial:
      `eq.${nomeComercial}`,

    cultura:
      `eq.${culturaLimpa}`,

    limit: 1000
  };


  if (registroMapa) {

    parametros.nr_registro =
      `eq.${registroMapa}`;

  }


  const registros =
    await buscarRegistros(
      TABELA_AGROFIT,
      parametros
    );


  if (!Array.isArray(registros)) {

    throw new Error(
      "A consulta produto + cultura não retornou uma lista válida."
    );

  }


  console.log(
    "✔ Registros produto/cultura:",
    registros
  );


  return registros;

}


// =====================================================
// CONSOLIDAR DADOS DO PRODUTO
// =====================================================

function consolidarProdutoAgrofit(
  registros
) {

  if (
    !Array.isArray(registros) ||
    registros.length === 0
  ) {
    return null;
  }


  const primeiro =
    registros[0];


  // ---------------------------------------------------
  // INGREDIENTES ATIVOS
  // ---------------------------------------------------

  const ingredientes =
    valoresUnicosAgrofit(
      registros,
      "ingrediente_ativo"
    );


  // ---------------------------------------------------
  // CLASSES AGRONÔMICAS
  // ---------------------------------------------------

  const classes =
    valoresUnicosAgrofit(
      registros,
      "classe"
    );


  // ---------------------------------------------------
  // PRAGAS / ALVOS
  // ---------------------------------------------------

  const pragas =
    new Map();


  registros.forEach((registro) => {

    const nomeComum =
      String(
        registro.praga_nome_comum || ""
      ).trim();


    const nomeCientifico =
      String(
        registro.praga_nome_cientifico || ""
      ).trim();


    if (
      !nomeComum &&
      !nomeCientifico
    ) {
      return;
    }


    let descricao = "";


    if (
      nomeComum &&
      nomeCientifico
    ) {

      descricao =
        `${nomeComum} (${nomeCientifico})`;

    } else {

      descricao =
        nomeComum ||
        nomeCientifico;

    }


    const chave =
      normalizarTextoAgrofit(
        descricao
      );


    if (!pragas.has(chave)) {

      pragas.set(
        chave,
        descricao
      );

    }

  });


  return {

    nr_registro:
      primeiro.nr_registro || "",

    marca_comercial:
      primeiro.marca_comercial || "",

    cultura:
      primeiro.cultura || "",

    ingrediente_ativo:
      ingredientes.join("; "),

    classe:
      classes.join("; "),

    pragas_alvos:
      Array.from(
        pragas.values()
      ).join("; "),

    situacao:
      primeiro.situacao || "",

    registros:
      registros

  };

}


// =====================================================
// OBTER VALORES ÚNICOS DE UMA COLUNA
// =====================================================

function valoresUnicosAgrofit(
  registros,
  campo
) {

  const valores =
    new Map();


  registros.forEach((registro) => {

    const valor =
      String(
        registro?.[campo] || ""
      ).trim();


    if (!valor) {
      return;
    }


    const chave =
      normalizarTextoAgrofit(
        valor
      );


    if (!valores.has(chave)) {

      valores.set(
        chave,
        valor
      );

    }

  });


  return Array.from(
    valores.values()
  );

}
