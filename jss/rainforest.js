// =====================================================
// RAINFOREST
// Classificação dos componentes e validação de PUE
// Projeto: Rainforest Consulta
// =====================================================


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const TABELA_RAINFOREST_COMPONENTES =
  "rainforest_componentes";

const TABELA_RAINFOREST_USO_EXCEPCIONAL =
  "rainforest_uso_excepcional_novo";


// =====================================================
// CACHE
//
// As tabelas Rainforest são pequenas.
// Carregamos uma vez e reutilizamos durante a sessão.
// =====================================================

let cacheRainforestComponentes = null;
let cacheRainforestUsoExcepcional = null;


// =====================================================
// CONSULTA PRINCIPAL
// =====================================================

async function consultarClassificacaoRainforest(
  produto
) {

  if (!produto) {
    return null;
  }

  const ingredienteAtivo =
    String(
      produto.ingrediente_ativo || ""
    ).trim();

  const cultura =
    String(
      produto.cultura || ""
    ).trim();

  const pragas =
    String(
      produto.pragas_alvos || ""
    ).trim();


  if (!ingredienteAtivo) {

    return {
      classificacao:
        "CLASSIFICAÇÃO NÃO DETERMINADA",

      permissao:
        "INGREDIENTE ATIVO NÃO IDENTIFICADO",

      detalhamento:
        "O Agrofit não informou ingrediente ativo suficiente para realizar o cruzamento com a base Rainforest."
    };

  }


  // ---------------------------------------------------
  // CARREGAR BASES
  // ---------------------------------------------------

  const componentes =
    await carregarRainforestComponentes();

  const excecoes =
    await carregarRainforestUsoExcepcional();


  // ---------------------------------------------------
  // LOCALIZAR COMPONENTES DO PRODUTO
  // ---------------------------------------------------

  const correspondencias =
    localizarComponentesRainforest(
      ingredienteAtivo,
      componentes
    );


  console.log(
    "🌳 Correspondências Rainforest:",
    correspondencias
  );


  // ---------------------------------------------------
  // NÃO ENCONTROU RESTRIÇÃO
  // ---------------------------------------------------

  if (
    correspondencias.length === 0
  ) {

    return {
      classificacao:
        "SEM RESTRIÇÃO IDENTIFICADA",

      permissao:
        "SEM RESTRIÇÃO IDENTIFICADA NA BASE CONSULTADA",

      detalhamento:
        "Nenhuma correspondência foi encontrada entre o(s) ingrediente(s) ativo(s) do produto e os componentes atualmente cadastrados na base Rainforest."
    };

  }


  // ---------------------------------------------------
  // ORDENAR PELA CLASSIFICAÇÃO MAIS RESTRITIVA
  // ---------------------------------------------------

  const correspondenciasOrdenadas =
    [...correspondencias].sort(
      (a, b) =>
        obterPesoClassificacao(
          b.classificacao
        ) -
        obterPesoClassificacao(
          a.classificacao
        )
    );


  const principal =
    correspondenciasOrdenadas[0];


  const tipo =
    identificarTipoClassificacao(
      principal.classificacao
    );


  // ===================================================
  // PROIBIDO
  // ===================================================

  if (tipo === "PROIBIDO") {

    return montarResultadoProibidoComContextoPue(
      correspondenciasOrdenadas,
      excecoes,
      cultura
    );

  }


  // ===================================================
  // USO EXCEPCIONAL
  // ===================================================

  if (
    tipo === "USO_EXCEPCIONAL"
  ) {

    return montarResultadoUsoExcepcional(
      correspondenciasOrdenadas,
      excecoes,
      cultura,
      pragas
    );

  }


  // ===================================================
  // MITIGAÇÃO
  // ===================================================

  if (
    tipo === "MITIGACAO"
  ) {

    return montarResultadoMitigacao(
      correspondenciasOrdenadas
    );

  }


  // ===================================================
  // OUTRA CLASSIFICAÇÃO CADASTRADA
  // ===================================================

  return {

    classificacao:
      formatarClassificacaoRainforest(
        principal.classificacao
      ),

    permissao:
      "CONSULTE AS CONDIÇÕES APLICÁVEIS",

    detalhamento:
      montarDetalhamentoComponentes(
        correspondenciasOrdenadas
      )

  };

}


// =====================================================
// CARREGAR COMPONENTES
// =====================================================

async function carregarRainforestComponentes() {

  if (
    Array.isArray(
      cacheRainforestComponentes
    )
  ) {

    return cacheRainforestComponentes;

  }


  const registros =
    await buscarRegistros(
      TABELA_RAINFOREST_COMPONENTES,
      {
        select:
          "id,componente,nr_cas,classificacao,classificacao_toxicidade,grupo,praga,cultura,paises,data_fim,condicoes_uso,base_legal,fonte,pagina",

        order:
          "componente.asc",

        limit: 1000
      }
    );


  if (!Array.isArray(registros)) {

    throw new Error(
      "Não foi possível carregar a base de componentes Rainforest."
    );

  }


  cacheRainforestComponentes =
    registros;


  return registros;

}


// =====================================================
// CARREGAR PUE
// =====================================================

async function carregarRainforestUsoExcepcional() {

  if (
    Array.isArray(
      cacheRainforestUsoExcepcional
    )
  ) {

    return cacheRainforestUsoExcepcional;

  }


  const registros =
    await buscarRegistros(
      TABELA_RAINFOREST_USO_EXCEPCIONAL,
      {
        select:
          "id,componente,nr_cas,classificacao,classificacao_toxicidade,grupo,praga,cultura,paises,data_fim,condicoes_uso,base_legal,fonte,pagina",

        order:
          "componente.asc",

        limit: 1000
      }
    );


  if (!Array.isArray(registros)) {

    throw new Error(
      "Não foi possível carregar a base de uso excepcional Rainforest."
    );

  }


  cacheRainforestUsoExcepcional =
    registros;


  return registros;

}


// =====================================================
// LOCALIZAR COMPONENTES
// =====================================================

function localizarComponentesRainforest(
  ingredienteAtivo,
  componentes
) {

  const textoProduto =
    normalizarTextoRainforest(
      ingredienteAtivo
    );

  if (!textoProduto) {
    return [];
  }

  return componentes.filter(
    (registro) => {

      const aliases =
        obterAliasesComponente(
          registro.componente
        );

      return aliases.some(
        (alias) =>
          textosCompativeisRainforest(
            ingredienteAtivo,
            alias
          )
      );

    }
  );

}


// =====================================================
// COMPARAR TEXTOS NORMALIZADOS
// =====================================================

function textosCompativeisRainforest(
  textoA,
  textoB
) {

  const a =
    normalizarTextoRainforest(
      textoA
    );

  const b =
    normalizarTextoRainforest(
      textoB
    );

  if (!a || !b) {
    return false;
  }

  if (
    a.includes(b) ||
    b.includes(a)
  ) {
    return true;
  }

  const tokensA =
    a
      .split(" ")
      .filter(
        token =>
          token.length >= 4
      );

  const tokensB =
    b
      .split(" ")
      .filter(
        token =>
          token.length >= 4
      );

  if (
    tokensA.length === 0 ||
    tokensB.length === 0
  ) {
    return false;
  }

  const comuns =
    tokensA.filter(
      token =>
        tokensB.includes(token)
    );

  const minimo =
    Math.min(
      tokensA.length,
      tokensB.length
    );

  return (
    comuns.length >= 2 &&
    comuns.length >=
      Math.ceil(minimo * 0.6)
  );

}


// =====================================================
// ALIASES DO COMPONENTE
//
// Exemplo:
// "Bórax; Boratos"
// =====================================================

function obterAliasesComponente(
  componente
) {

  return String(
    componente || ""
  )
    .split(";")
    .map(
      item =>
        item.trim()
    )
    .filter(Boolean);

}


// =====================================================
// RESULTADO PROIBIDO
// =====================================================

function montarResultadoProibido(
  correspondencias
) {

  const componentes =
    obterNomesComponentes(
      correspondencias
    );


  const condicoes =
    obterTextosUnicos(
      correspondencias,
      "condicoes_uso"
    );


  let detalhamento =
    `Componente(s) restritivo(s): ${componentes}.`;


  if (condicoes.length > 0) {

    detalhamento +=
      ` ${condicoes.join(" ")}`;

  }


  return {

    classificacao:
      "PROIBIDO",

    permissao:
      "NÃO UTILIZAR",

    detalhamento:
      detalhamento

  };

}


// =====================================================
// RESULTADO PROIBIDO COM CONTEXTO DE PUE
//
// Se houver PUE para o mesmo componente e cultura,
// mas não aplicável ao Brasil, explicamos isso sem
// exibir condições como se fossem válidas para o país.
// =====================================================

function montarResultadoProibidoComContextoPue(
  correspondencias,
  excecoes,
  cultura
) {

  const componentes =
    obterNomesComponentes(
      correspondencias
    );


  const excecoesCorrespondentes =
    localizarExcecoesComponentes(
      correspondencias,
      excecoes
    );


  const excecoesMesmaCultura =
    excecoesCorrespondentes.filter(
      excecao =>
        excecaoDentroDaValidade(
          excecao
        ) &&
        excecaoAplicavelCultura(
          excecao,
          cultura
        )
    );


  const excecoesBrasil =
    excecoesMesmaCultura.filter(
      excecao =>
        excecaoAplicavelAoBrasil(
          excecao
        )
    );


  // Se houver exceção válida para a cultura, mas nenhuma
  // delas for aplicável ao Brasil, explicamos claramente.
  if (
    excecoesMesmaCultura.length > 0 &&
    excecoesBrasil.length === 0
  ) {

    const paises =
      obterTextosUnicos(
        excecoesMesmaCultura,
        "paises"
      );


    const partes = [
      `Componente restritivo: ${componentes}.`,
      `Existe PUE para a cultura ${cultura || "consultada"}, porém a exceção identificada não é aplicável ao Brasil.`
    ];


    if (paises.length > 0) {

      partes.push(
        `País(es) contemplado(s) pela PUE: ${paises.join("; ")}.`
      );

    }


    partes.push(
      "Não foi identificada autorização de uso excepcional aplicável ao uso consultado no Brasil."
    );


    return {

      classificacao:
        "PROIBIDO",

      permissao:
        "NÃO UTILIZAR",

      detalhamento:
        partes.join(" ")

    };

  }


  // Caso padrão: proibido sem PUE aplicável/relevante.
  return {

    classificacao:
      "PROIBIDO",

    permissao:
      "NÃO UTILIZAR",

    detalhamento:
      `Componente(s) restritivo(s): ${componentes}. Não foi identificada PUE aplicável à combinação consultada.`

  };

}


// =====================================================
// RESULTADO USO EXCEPCIONAL
// =====================================================

function montarResultadoUsoExcepcional(
  correspondencias,
  excecoes,
  cultura,
  pragas
) {

  const componentesRestritivos =
    correspondencias.filter(
      item =>
        identificarTipoClassificacao(
          item.classificacao
        ) ===
        "USO_EXCEPCIONAL"
    );


  const excecoesCorrespondentes =
    localizarExcecoesComponentes(
      componentesRestritivos,
      excecoes
    );


  const excecoesValidas =
    excecoesCorrespondentes.filter(
      excecao =>
        excecaoAplicavel(
          excecao,
          cultura,
          pragas
        )
    );


  // ---------------------------------------------------
  // EXISTE PUE APLICÁVEL
  // ---------------------------------------------------

  if (
    excecoesValidas.length > 0
  ) {

    const componentes =
      obterNomesComponentes(
        excecoesValidas
      );


    const condicoes =
      obterTextosUnicos(
        excecoesValidas,
        "condicoes_uso"
      );


    const validade =
      obterValidadesExcecao(
        excecoesValidas
      );


    const partes = [];


    partes.push(
      `Componente(s): ${componentes}.`
    );


    if (condicoes.length > 0) {

      partes.push(
        condicoes.join(" ")
      );

    }


    if (validade) {

      partes.push(
        `Validade informada: ${validade}.`
      );

    }


    return {

      classificacao:
        "USO EXCEPCIONAL",

      permissao:
        "SOMENTE NAS CONDIÇÕES DA PUE",

      detalhamento:
        partes.join(" ")

    };

  }


  // ---------------------------------------------------
  // COMPONENTE É DE USO EXCEPCIONAL,
  // MAS NÃO HÁ EXCEÇÃO COMPATÍVEL
  // ---------------------------------------------------

  return {

    classificacao:
      "USO EXCEPCIONAL",

    permissao:
      "NÃO HÁ PUE APLICÁVEL IDENTIFICADA",

    detalhamento:
      "O ingrediente ativo possui classificação de uso excepcional, porém não foi localizada na base consultada uma condição de uso excepcional compatível com a cultura e os alvos selecionados."

  };

}


// =====================================================
// RESULTADO MITIGAÇÃO
// =====================================================

function montarResultadoMitigacao(
  correspondencias
) {

  const componentes =
    obterNomesComponentes(
      correspondencias
    );


  const condicoes =
    obterTextosUnicos(
      correspondencias,
      "condicoes_uso"
    );


  let detalhamento =
    `Componente(s): ${componentes}.`;


  if (condicoes.length > 0) {

    detalhamento +=
      ` ${condicoes.join(" ")}`;

  }


  return {

    classificacao:
      "MITIGAÇÃO DE RISCO",

    permissao:
      "UTILIZAÇÃO CONDICIONADA ÀS MEDIDAS DE MITIGAÇÃO",

    detalhamento:
      detalhamento

  };

}


// =====================================================
// LOCALIZAR EXCEÇÕES DOS COMPONENTES
// =====================================================

function localizarExcecoesComponentes(
  componentes,
  excecoes
) {

  return excecoes.filter(
    excecao => {

      const aliasesExcecao =
        obterAliasesComponente(
          excecao.componente
        )
          .map(
            normalizarTextoRainforest
          );


      return componentes.some(
        componente => {

          const aliasesComponente =
            obterAliasesComponente(
              componente.componente
            )
              .map(
                normalizarTextoRainforest
              );


          return aliasesComponente.some(
            alias =>
              aliasesExcecao.includes(
                alias
              )
          );

        }
      );

    }
  );

}


// =====================================================
// VALIDAR EXCEÇÃO
// =====================================================

function excecaoAplicavel(
  excecao,
  culturaSelecionada,
  pragasProduto
) {

  if (
    !excecaoDentroDaValidade(
      excecao
    )
  ) {

    return false;

  }


  if (
    !excecaoAplicavelAoBrasil(
      excecao
    )
  ) {

    return false;

  }


  if (
    !excecaoAplicavelCultura(
      excecao,
      culturaSelecionada
    )
  ) {

    return false;

  }


  if (
    !excecaoAplicavelPraga(
      excecao,
      pragasProduto
    )
  ) {

    return false;

  }


  return true;

}


// =====================================================
// VALIDADE
// =====================================================

function excecaoDentroDaValidade(
  excecao
) {

  if (!excecao.data_fim) {
    return true;
  }


  const hoje =
    new Date();


  hoje.setHours(
    0,
    0,
    0,
    0
  );


  const dataFim =
    new Date(
      `${excecao.data_fim}T00:00:00`
    );


  return (
    !Number.isNaN(
      dataFim.getTime()
    ) &&
    dataFim >= hoje
  );

}


// =====================================================
// PAÍS
// =====================================================

function excecaoAplicavelAoBrasil(
  excecao
) {

  const paises =
    normalizarTextoRainforest(
      excecao.paises
    );


  if (!paises) {
    return true;
  }


  return (
    paises.includes(
      "todos os paises"
    ) ||
    paises.includes(
      "todos"
    ) ||
    paises.includes(
      "brasil"
    )
  );

}


// =====================================================
// CULTURA
// =====================================================

function excecaoAplicavelCultura(
  excecao,
  culturaSelecionada
) {

  const culturaExcecao =
    normalizarTextoRainforest(
      excecao.cultura
    );


  const cultura =
    normalizarTextoRainforest(
      culturaSelecionada
    );


  if (!culturaExcecao) {
    return true;
  }


  if (
    culturaExcecao.includes(
      "todos os cultivos"
    ) ||
    culturaExcecao.includes(
      "todas as culturas"
    ) ||
    culturaExcecao ===
      "todos"
  ) {

    return true;

  }


  if (!cultura) {
    return false;
  }


  return (
    culturaExcecao.includes(
      cultura
    ) ||
    cultura.includes(
      culturaExcecao
    )
  );

}


// =====================================================
// PRAGA / ALVO
// =====================================================

function excecaoAplicavelPraga(
  excecao,
  pragasProduto
) {

  const pragaExcecao =
    normalizarTextoRainforest(
      excecao.praga
    );


  if (
    !pragaExcecao ||
    pragaExcecao.includes(
      "nao aplicavel"
    ) ||
    pragaExcecao.includes(
      "todos"
    )
  ) {

    return true;

  }


  const pragas =
    normalizarTextoRainforest(
      pragasProduto
    );


  if (!pragas) {
    return false;
  }


  /*
    Como o campo Agrofit pode reunir vários alvos,
    fazemos uma comparação textual conservadora.
  */

  const termos =
    String(
      excecao.praga || ""
    )
      .split(/[;,]/)
      .map(
        termo =>
          normalizarTextoRainforest(
            termo
          )
      )
      .filter(
        termo =>
          termo.length >= 4
      );


  return termos.some(
    termo =>
      pragas.includes(
        termo
      )
  );

}


// =====================================================
// PESO DA CLASSIFICAÇÃO
// =====================================================

function obterPesoClassificacao(
  classificacao
) {

  const tipo =
    identificarTipoClassificacao(
      classificacao
    );


  switch (tipo) {

    case "PROIBIDO":
      return 400;

    case "USO_EXCEPCIONAL":
      return 300;

    case "MITIGACAO":
      return 200;

    default:
      return 100;

  }

}


// =====================================================
// IDENTIFICAR CLASSIFICAÇÃO
// =====================================================

function identificarTipoClassificacao(
  classificacao
) {

  const texto =
    normalizarTextoRainforest(
      classificacao
    );


  if (
    texto.includes(
      "proibid"
    )
  ) {

    return "PROIBIDO";

  }


  if (
    texto.includes(
      "uso_excepcional"
    ) ||
    texto.includes(
      "uso excepcional"
    ) ||
    texto.includes(
      "excepcional"
    )
  ) {

    return "USO_EXCEPCIONAL";

  }


  if (
    texto.includes(
      "mitig"
    )
  ) {

    return "MITIGACAO";

  }


  return "OUTRO";

}


// =====================================================
// FORMATAR CLASSIFICAÇÃO
// =====================================================

function formatarClassificacaoRainforest(
  classificacao
) {

  return String(
    classificacao || ""
  )
    .replace(/_/g, " ")
    .trim()
    .toUpperCase();

}


// =====================================================
// NORMALIZAÇÃO
// =====================================================

function normalizarTextoRainforest(valor) {

  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

    // Remove informações auxiliares entre parênteses,
    // como grupo químico e concentração.
    .replace(/\([^)]*\)/g, " ")

    // Padroniza formas como
    // "sal de amônio" e "de amônio".
    .replace(/\bsal de\b/g, " ")
    .replace(/\bsal\b/g, " ")
    .replace(/\be isomeros\b/g, " ")
    .replace(/\bisomeros\b/g, " ")
    .replace(/\bde\b/g, " ")

    // Remove separadores que não agregam valor
    // à comparação textual.
    .replace(/[-_,;:+/]/g, " ")

    // Equivalência de nomenclatura Agrofit x Rainforest
    .replace(/\bimidacloprido\b/g, "imidacloprida")

    .replace(/\s+/g, " ")
    .trim();

}


// =====================================================
// COMPONENTES ÚNICOS
// =====================================================

function obterNomesComponentes(
  registros
) {

  const valores =
    new Map();


  registros.forEach(
    registro => {

      const valor =
        String(
          registro.componente || ""
        ).trim();


      if (!valor) {
        return;
      }


      const chave =
        normalizarTextoRainforest(
          valor
        );


      if (
        !valores.has(chave)
      ) {

        valores.set(
          chave,
          valor
        );

      }

    }
  );


  return Array.from(
    valores.values()
  ).join("; ");

}


// =====================================================
// TEXTOS ÚNICOS
// =====================================================

function obterTextosUnicos(
  registros,
  campo
) {

  const valores =
    new Map();


  registros.forEach(
    registro => {

      const valor =
        String(
          registro?.[campo] || ""
        ).trim();


      if (!valor) {
        return;
      }


      const chave =
        normalizarTextoRainforest(
          valor
        );


      if (
        !valores.has(chave)
      ) {

        valores.set(
          chave,
          valor
        );

      }

    }
  );


  return Array.from(
    valores.values()
  );

}


// =====================================================
// VALIDADE DAS EXCEÇÕES
// =====================================================

function obterValidadesExcecao(
  registros
) {

  const datas =
    registros
      .map(
        item =>
          item.data_fim
      )
      .filter(Boolean);


  if (
    datas.length === 0
  ) {

    return "";

  }


  const datasFormatadas =
    Array.from(
      new Set(datas)
    ).map(
      formatarDataRainforest
    );


  return datasFormatadas.join(
    ", "
  );

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarDataRainforest(
  data
) {

  if (!data) {
    return "";
  }


  const partes =
    String(data).split("-");


  if (
    partes.length !== 3
  ) {

    return String(data);

  }


  return (
    `${partes[2]}/${partes[1]}/${partes[0]}`
  );

}


// =====================================================
// DETALHAMENTO GENÉRICO
// =====================================================

function montarDetalhamentoComponentes(
  registros
) {

  const componentes =
    obterNomesComponentes(
      registros
    );


  const condicoes =
    obterTextosUnicos(
      registros,
      "condicoes_uso"
    );


  const partes = [];


  if (componentes) {

    partes.push(
      `Componente(s): ${componentes}.`
    );

  }


  if (
    condicoes.length > 0
  ) {

    partes.push(
      condicoes.join(" ")
    );

  }


  return (
    partes.join(" ") ||
    "Consulte as condições aplicáveis à classificação encontrada."
  );

}
