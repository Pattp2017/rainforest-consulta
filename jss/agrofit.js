//=====================================================
// AGROFIT
//=====================================================

const TABELA_AGROFIT = "agrofit_raw";


//=====================================================
// CULTURAS
//=====================================================

async function carregarCulturas() {

    const registros = await buscarRegistros(

        TABELA_AGROFIT,

        {
            select: "cultura",
            order: "cultura"
        }

    );

    const culturas = [

        ...new Set(

            registros

                .map(item => item.cultura)

                .filter(Boolean)

        )

    ];

    culturas.sort((a, b) =>

        a.localeCompare(

            b,

            "pt-BR"

        )

    );

    return culturas;

}
