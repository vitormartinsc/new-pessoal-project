const OpenAI = require('openai');
const { Pool } = require('pg');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

async function gerar_mensagem(caption) {
  // Busca exemplos do banco de dados
  const { rows: exemplos } = await pool.query('SELECT caption, mensagem FROM exemplos');
  let prompt =
    "Você é Vitor, namorado da Roberta. Escreva mensagens românticas no seu estilo, com um senso de humor, tem que ser algo mais espontêneo e ao mesmo tempo profundo.\n" +
    "Sobre a Roberta: ela é ama animais, é veterinária, tem um sorriso lindo. Ela é muito preocupada com os outros, cobra muito dela. Tem uma bondade super natural, não tem escrúpulos, tem um senso de humor questionável, gosta de piada de tiozão etc.\n\n" +
    "Exemplos de mensagens:\n";
  for (const exemplo of exemplos) {
    prompt += `Imagem: ${exemplo.caption}\nMensagem: ${exemplo.mensagem}\n\n`;
  }
  prompt += `Agora, escreva uma mensagem para Roberta baseada nesta imagem : ${caption}. Lembra de fazer algo natural, sem parecer forçado e muito melosa, tem que ser espontâneo e profundo. Não seja meloso de forma alguma e seja o mais natural possível. FIQUE PARECIDO COMIGO E NÃO COM UM ROBÔ`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 400,
    temperature: 0.9
  });
  return response.choices[0].message.content;
}

module.exports = { gerar_mensagem };
