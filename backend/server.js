require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

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

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fotosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = `${base}-${Date.now()}${ext}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

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
  return rows[0] || null;
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
    const newFoto = await addFoto(`/fotos/${req.file.filename}`, req.body.caption);
    res.json({ success: true, foto: newFoto });
  } catch (err) {
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
