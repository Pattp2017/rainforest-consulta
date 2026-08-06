
document.addEventListener('DOMContentLoaded', iniciarSistema);

async function iniciarSistema() {
  try {
    const resultado = await testarConexaoSupabase();

    console.log('Supabase conectado com sucesso:', resultado);
  } catch (erro) {
    console.error('Erro ao conectar ao Supabase:', erro);
  }
}
