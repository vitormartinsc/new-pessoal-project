import React, { useState } from 'react';
import './UploadFoto.css';
import { FaCloudUploadAlt } from 'react-icons/fa';

function UploadFoto({ onUpload }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('');
  const [modo, setModo] = useState('enviar'); // 'enviar' ou 'treinar'
  const [mensagemGerada, setMensagemGerada] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !caption) {
      setStatus('Selecione uma foto e escreva uma legenda.');
      return;
    }
    if (modo === 'enviar') {
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('caption', caption);
      setStatus('Enviando...');
      try {
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          setStatus('Foto enviada com sucesso!');
          setFile(null);
          setCaption('');
          if (onUpload) onUpload();
        } else {
          setStatus('Erro ao enviar a foto.');
        }
      } catch (err) {
        setStatus('Erro ao enviar a foto.');
      }
    } else if (modo === 'treinar') {
      setStatus('Gerando mensagem...');
      setLoadingAI(true);
      setMensagemGerada('');
      try {
        const formData = new FormData();
        formData.append('caption', caption);
        // Envia apenas a legenda para o endpoint de geração
        const res = await fetch('http://localhost:5000/api/gerar-mensagem', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setMensagemGerada(data.mensagem);
          setStatus('Mensagem gerada! Você pode editar antes de salvar.');
        } else {
          setStatus('Erro ao gerar mensagem.');
        }
      } catch (err) {
        setStatus('Erro ao gerar mensagem.');
      }
      setLoadingAI(false);
    }
  };

  return (
    <div className="upload-foto-wrapper">
      <div className="modo-toggle">
        <button
          type="button"
          className={modo === 'enviar' ? 'modo-btn ativo' : 'modo-btn'}
          onClick={() => setModo('enviar')}
        >
          Enviar Foto
        </button>
        <button
          type="button"
          className={modo === 'treinar' ? 'modo-btn ativo' : 'modo-btn'}
          onClick={() => setModo('treinar')}
        >
          Treinar AI
        </button>
      </div>
      <form className="upload-foto-form centralizada" onSubmit={handleSubmit}>
        <h3>{modo === 'enviar' ? 'Enviar nova foto' : 'Treinar AI (exemplo)'}</h3>
        <label htmlFor="upload-foto-input" className="custom-file-label">
          {file ? 'Trocar foto' : 'Selecionar foto'}
          <input
            id="upload-foto-input"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            multiple={false}
          />
        </label>
        {file && (
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <button type="button" className="remove-file-btn" onClick={() => setFile(null)} title="Remover arquivo">×</button>
          </div>
        )}
        <textarea
          className="input-legenda"
          placeholder="Legenda"
          value={caption}
          onChange={handleCaptionChange}
          rows={3}
          maxLength={300}
          style={{ resize: 'vertical', minHeight: 48 }}
        />
        {modo === 'treinar' && mensagemGerada && (
          <textarea
            className="mensagem-ai-editavel"
            value={mensagemGerada}
            onChange={e => setMensagemGerada(e.target.value)}
            rows={5}
            style={{ width: '100%', margin: '16px 0', minHeight: 80 }}
          />
        )}
        <button type="submit" className="btn-upload-foto" disabled={loadingAI}>
          <FaCloudUploadAlt style={{ marginRight: 8, fontSize: 20 }} />
          {modo === 'enviar' ? 'Enviar' : loadingAI ? 'Gerando...' : (mensagemGerada ? 'Salvar exemplo' : 'Gerar mensagem')}
        </button>
        <div className="status">{status}</div>
      </form>
    </div>
  );
}

export default UploadFoto;
