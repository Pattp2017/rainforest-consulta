//=====================================================
// APP
//=====================================================

document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema

);


//=====================================================

async function iniciarSistema() {

    try {

        console.clear();

        console.log("");

        console.log("======================================");

        console.log(" Rainforest Consulta");

        console.log("======================================");

        console.log("");

        console.log("Conectando ao Supabase...");

        await testarConexaoSupabase();

        console.log("✔ Conexão realizada.");

        console.log("");

        console.log("Carregando culturas...");

        const culturas = await carregarCulturas();

        console.table(culturas);

        console.log("");

        console.log(

            "Total de culturas:",

            culturas.length

        );

    }

    catch (erro) {

        console.error(erro);

    }

}
