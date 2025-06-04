import React, { useState } from 'react';
import './UploadFoto.css';
import { FaCloudUploadAlt } from 'react-icons/fa';

function UploadFoto({ onUpload }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('');

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
  };

  return (
    <form className="upload-foto-form centralizada" onSubmit={handleSubmit}>
      <h3>Enviar nova foto</h3>
      <label htmlFor="upload-foto-input" className="custom-file-label">
        Selecionar foto
        <input
          id="upload-foto-input"
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>
      <textarea
        className="input-legenda"
        placeholder="Legenda"
        value={caption}
        onChange={handleCaptionChange}
        rows={3}
        maxLength={300}
        style={{ resize: 'vertical', minHeight: 48 }}
      />
      <button type="submit" className="btn-upload-foto">
        <FaCloudUploadAlt style={{ marginRight: 8, fontSize: 20 }} /> Enviar
      </button>
      <div className="status">{status}</div>
    </form>
  );
}

export default UploadFoto;
