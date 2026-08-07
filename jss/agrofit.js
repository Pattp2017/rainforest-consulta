// =====================================================
// AGROFIT
// Consultas relacionadas à tabela agrofit_raw
// Projeto: Rainforest Consulta
// =====================================================

// -----------------------------------------------------
// CONFIGURAÇÃO
// -----------------------------------------------------

const TABELA_AGROFIT = "agrofit_raw";

const TAMANHO_PAGINA_AGROFIT = 1000;

// -----------------------------------------------------
// CARREGAR CULTURAS
// -----------------------------------------------------

async function carregarCulturas() {
  const culturasUnicas = new Map();

  let pagina = 0;
  let continuarConsulta = true;

  while (continuarConsulta) {
    const registros = await buscarRegistros(
      TABELA_AGROFIT,
      {
        select: "cultura",
        cultura: "not.is.null",
        order: "cultura.asc",
        limit: TAMANHO_PAGINA_AGROFIT,
        offset: pagina * TAMANHO_PAGINA_AGROFIT
      }
    );

    if (!Array.isArray(registros)) {
      throw new Error(
        "A consulta de culturas não retornou uma lista válida."
      );
    }

    registros.forEach((registro) => {
      const cultura = String(
        registro.cultura || ""
      ).trim();

      if (!cultura) {
        return;
      }

      const chave = normalizarTextoAgrofit(cultura);

      if (!culturasUnicas.has(chave)) {
        culturasUnicas.set(chave, cultura);
      }
    });

    continuarConsulta =
      registros.length === TAMANHO_PAGINA_AGROFIT;

    pagina += 1;
  }

  return Array.from(
    culturasUnicas.values()
  ).sort((culturaA, culturaB) =>
    culturaA.localeCompare(
      culturaB,
      "pt-BR",
      {
        sensitivity: "base"
      }
    )
  );
}

// -----------------------------------------------------
// NORMALIZAÇÃO INTERNA
// -----------------------------------------------------

function normalizarTextoAgrofit(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


// =====================================================
// BUSCAR PRODUTOS POR CULTURA E TERMO
// =====================================================

async function buscarProdutosAgrofit(
  cultura,
  termo
) {

  const culturaLimpa =
    String(cultura || "").trim();

  const termoLimpo =
    String(termo || "").trim();

  if (!culturaLimpa) {
    return [];
  }

  if (termoLimpo.length < 3) {
    return [];
  }

  console.log(
    "Buscando produto:",
    termoLimpo,
    "Cultura:",
    culturaLimpa
  );

  const registros =
    await buscarRegistros(
      TABELA_AGROFIT,
      {
        select:
          "nr_registro,marca_comercial,cultura,ingrediente_ativo,situacao",

        cultura:
          `ilike.*${culturaLimpa}*`,

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

  console.log(
    "Produtos encontrados:",
    registros
  );

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

    const chave =
      normalizarTextoAgrofit(nome);

    if (!produtosUnicos.has(chave)) {

      produtosUnicos.set(
        chave,
        {
          ...registro,
          marca_comercial: nome
        }
      );

    }

  });

  return Array.from(
    produtosUnicos.values()
  );

}
