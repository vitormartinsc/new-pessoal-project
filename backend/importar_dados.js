require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

async function importarFotos() {
  const fotosPath = path.join(__dirname, 'fotos.json');
  if (!fs.existsSync(fotosPath)) {
    console.log('Arquivo fotos.json não encontrado.');
    return;
  }
  const fotos = JSON.parse(fs.readFileSync(fotosPath, 'utf-8'));
  for (const foto of fotos) {
    await pool.query(
      'INSERT INTO fotos (src, caption) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [foto.src, foto.caption]
    );
  }
  console.log('Fotos importadas com sucesso!');
}

async function importarMensagens() {
  const mensagensPath = path.join(__dirname, 'mensagem_do_dia.json');
  if (!fs.existsSync(mensagensPath)) {
    console.log('Arquivo mensagem_do_dia.json não encontrado.');
    return;
  }
  let mensagens = JSON.parse(fs.readFileSync(mensagensPath, 'utf-8'));
  // Se não for array, transforma em array
  if (!Array.isArray(mensagens)) {
    // Tenta detectar formato antigo (objeto com chaves ou único objeto)
    if (mensagens.mensagemDoDia && mensagens.fotoDoDia && mensagens.dataDoDia) {
      mensagens = [{
        mensagem_do_dia: mensagens.mensagemDoDia,
        foto_do_dia: mensagens.fotoDoDia,
        data_do_dia: mensagens.dataDoDia
      }];
    } else {
      // Caso seja um objeto com várias datas como chaves
      mensagens = Object.values(mensagens).map(msg => ({
        mensagem_do_dia: msg.mensagemDoDia,
        foto_do_dia: msg.fotoDoDia,
        data_do_dia: msg.dataDoDia
      }));
    }
  } else {
    // Se já for array, só normaliza os campos
    mensagens = mensagens.map(msg => ({
      mensagem_do_dia: msg.mensagem_do_dia || msg.mensagemDoDia,
      foto_do_dia: msg.foto_do_dia || msg.fotoDoDia,
      data_do_dia: msg.data_do_dia || msg.dataDoDia
    }));
  }
  for (const msg of mensagens) {
    await pool.query(
      'INSERT INTO mensagem_do_dia (mensagem_do_dia, foto_do_dia, data_do_dia) VALUES ($1, $2, $3) ON CONFLICT (data_do_dia) DO UPDATE SET mensagem_do_dia = $1, foto_do_dia = $2',
      [msg.mensagem_do_dia, JSON.stringify(msg.foto_do_dia), msg.data_do_dia]
    );
  }
  console.log('Mensagens do dia importadas com sucesso!');
}

async function main() {
  try {
    await importarFotos();
    await importarMensagens();
  } catch (e) {
    console.error('Erro ao importar dados:', e);
  } finally {
    await pool.end();
  }
}

main();
