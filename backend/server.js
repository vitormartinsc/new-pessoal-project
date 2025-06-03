const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/fotos', express.static(path.join(__dirname, 'fotos')));

const fotosJsonPath = path.join(__dirname, 'fotos.json');
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

// Endpoint para upload de foto
app.post('/api/upload', upload.single('foto'), (req, res) => {
  if (!req.file || !req.body.caption) {
    return res.status(400).json({ error: 'Foto e legenda são obrigatórias.' });
  }
  // Atualizar fotos.json
  fs.readFile(fotosJsonPath, 'utf-8', (err, data) => {
    let fotos = [];
    if (!err && data) {
      try {
        fotos = JSON.parse(data);
      } catch (e) {}
    }
    const newFoto = {
      src: `/fotos/${req.file.filename}`,
      caption: req.body.caption
    };
    fotos.push(newFoto);
    fs.writeFile(fotosJsonPath, JSON.stringify(fotos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar foto.' });
      res.json({ success: true, foto: newFoto });
    });
  });
});

const geminiRouter = require('./gemini');
app.use(geminiRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
