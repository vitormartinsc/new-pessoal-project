require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const { uploadFotoToS3 } = require('./s3');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/fotos', express.static(path.join(__dirname, 'fotos')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Defina DATABASE_URL no Railway
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

const fotosDir = path.join(__dirname, 'fotos');

// Garante que a pasta de fotos existe
if (!fs.existsSync(fotosDir)) {
  fs.mkdirSync(fotosDir, { recursive: true });
}

// Configuração do multer para upload (memória para S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const gerarMensagemUpload = multer();

// Substituir leitura de fotos.json por consulta ao banco
async function getFotos() {
  const { rows } = await pool.query('SELECT * FROM fotos');
  return rows;
}

// Substituir escrita em fotos.json por inserção no banco
async function addFoto(src, caption) {
  const { rows } = await pool.query(
    'INSERT INTO fotos (src, caption) VALUES ($1, $2) RETURNING *',
    [src, caption]
  );
  return rows[0];
}

// Armazena mensagem/foto do dia em arquivo
async function getMensagemDoDia() {
  const hoje = getHojeString();
  const { rows } = await pool.query('SELECT * FROM mensagem_do_dia WHERE data_do_dia = $1', [hoje]);
  //return rows[0] || null; 
  return null ; // teste para não usar banco de dados
}

async function salvarMensagemDoDia(mensagem, foto) {
  const hoje = getHojeString();
  await pool.query(
    'INSERT INTO mensagem_do_dia (mensagem_do_dia, foto_do_dia, data_do_dia) VALUES ($1, $2, $3) ON CONFLICT (data_do_dia) DO UPDATE SET mensagem_do_dia = $1, foto_do_dia = $2',
    [mensagem, JSON.stringify(foto), hoje]
  );
}

function getHojeString() {
  const hoje = new Date();
  return hoje.toISOString().slice(0, 10); // yyyy-mm-dd
}

app.post('/api/upload', upload.single('foto'), async (req, res) => {
  if (!req.file || !req.body.caption) {
    return res.status(400).json({ error: 'Foto e legenda são obrigatórias.' });
  }
  try {
    // Upload para o S3
    const ext = path.extname(req.file.originalname);
    const base = path.basename(req.file.originalname, ext);
    const unique = `${base}-${Date.now()}${ext}`;
    const s3Result = await uploadFotoToS3(req.file.buffer, unique, req.file.mimetype);
    const fotoUrl = s3Result.Location;
    const newFoto = await addFoto(fotoUrl, req.body.caption);
    res.json({ success: true, foto: newFoto });
  } catch (err) {
    console.error('Erro ao salvar foto no S3:', err);
    res.status(500).json({ error: 'Erro ao salvar foto.' });
  }
});

app.post('/api/mensagem-romantica', async (req, res) => {
  try {
    const cache = await getMensagemDoDia();
    if (cache) {
      // Corrige erro de JSON.parse em objeto já serializado
      let foto;
      if (typeof cache.foto_do_dia === 'string') {
        try {
          foto = JSON.parse(cache.foto_do_dia);
        } catch {
          foto = cache.foto_do_dia;
        }
      } else {
        foto = cache.foto_do_dia;
      }
      return res.json({ mensagem: cache.mensagem_do_dia, foto });
    }
    const fotos = await getFotos();
    if (!fotos.length) return res.status(404).json({ error: 'Nenhuma foto encontrada.' });
    const foto = fotos[Math.floor(Math.random() * fotos.length)];
    const { gerar_mensagem } = require('./mensagem_gpt4_node');
    try {
      const mensagem = await gerar_mensagem(foto.caption);
      await salvarMensagemDoDia(mensagem.trim(), foto);
      res.json({ mensagem: mensagem.trim(), foto });
    } catch (err) {
      console.error('Erro ao gerar mensagem:', err);
      res.status(500).json({ error: 'Erro ao gerar mensagem.', details: err.message });
    }
  } catch (e) {
    console.error('Erro interno:', e);
    res.status(500).json({ error: 'Erro interno.', details: e.message });
  }
});

app.post('/api/gerar-mensagem', gerarMensagemUpload.none(), async (req, res) => {
  // Suporte para form-data (usado pelo frontend)
  const caption = req.body.caption;
  if (!caption) {
    return res.status(400).json({ error: 'Legenda (caption) é obrigatória.' });
  }
  try {
    const { gerar_mensagem } = require('./mensagem_gpt4_node');
    const mensagem = await gerar_mensagem(caption);
    res.json({ mensagem: mensagem.trim() });
  } catch (err) {
    console.error('Erro ao gerar mensagem:', err);
    res.status(500).json({ error: 'Erro ao gerar mensagem.', details: err.message });
  }
});

app.post('/api/salvar-exemplo', express.json(), async (req, res) => {
  const { caption, mensagem } = req.body;
  if (!caption || !mensagem) {
    return res.status(400).json({ error: 'Caption e mensagem são obrigatórios.' });
  }
  try {
    await pool.query(
      'INSERT INTO exemplos (caption, mensagem) VALUES ($1, $2)',
      [caption, mensagem]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar exemplo:', err);
    res.status(500).json({ error: 'Erro ao salvar exemplo.', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// O dia em que enviei violetas para Roberta. Foi para ela colocar na clínica dela e lembrar do quanto gosto dela toda vez que ver a violeta