const express = require('express');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Substitua pela sua API KEY Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'SUA_API_KEY_AQUI';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Função para extrair mensagens do arquivo txt
function extrairMensagensWhatsApp(filePath, max = null) {
  const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),? (\d{2}:\d{2}) - ([^:]+): (.*)$/;
  const linhas = fs.readFileSync(filePath, 'utf-8').split('\n');
  const mensagens = [];
  for (const line of linhas) {
    const match = regex.exec(line);
    if (match) {
      const texto = match[4].trim();
      if (texto && !texto.toLowerCase().startsWith('mensagem apagada')) {
        mensagens.push(texto);
      }
    }
    if (max && mensagens.length >= max) break;
  }
  return mensagens;
}

// Endpoint para gerar mensagem com Gemini
router.post('/api/gemini-mensagem', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'Conversa do WhatsApp com Roberta.txt');
    // Lê todas as mensagens do arquivo
    const exemplos = extrairMensagensWhatsApp(filePath, null);
    // Limita o tamanho do prompt para não exceder o limite da API
    const exemplosLimitados = exemplos.slice(-30); // últimos 30 exemplos
    const prompt = `Aqui estão exemplos de mensagens que costumo enviar para minha namorada Roberta:\n\n${exemplosLimitados.map(m => '- ' + m).join('\n')}\n\nCom base nesse estilo, escreva uma nova mensagem romântica/motivacional para ela.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const resposta = result.response.text();
    res.json({ mensagem: resposta });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar mensagem', details: err.message });
  }
});

module.exports = router;
