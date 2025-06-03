import React, { useEffect, useState } from 'react';
import './MensagemRomantica.css';
import { FaHeart } from 'react-icons/fa';

function MensagemRomantica() {
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [fotoAtual, setFotoAtual] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarMensagem = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/mensagem-romantica', { method: 'POST' });
      const data = await res.json();
      setMensagemAtual(data.mensagem);
      setFotoAtual(data.foto);
    } catch (e) {
      setMensagemAtual('Erro ao buscar mensagem.');
      setFotoAtual(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    buscarMensagem();
  }, []);

  return (
    <div className="mensagem-romantica-bg">
      <div className="mensagem-romantica-container">
        <div className="logo-romantica">
          <span className="logo-heart">❤</span>
          <span className="logo-text">Roberta & Vitor</span>
          <span className="logo-heart">❤</span>
        </div>
        <div className="header-romantica">
          <FaHeart className="heart-icon" />
          <h2>Inspiração do Dia</h2>
          <FaHeart className="heart-icon" />
        </div>
        {fotoAtual && (
          <div className="foto-romantica">
            <img src={`http://localhost:5000${fotoAtual.src}`} alt={fotoAtual.caption} />
            <div className="caption">{fotoAtual.caption}</div>
          </div>
        )}
        <div className="mensagem-romantica">
          {loading ? 'Carregando...' : mensagemAtual.replace(/Imagem:[^\n]*\n?/g, '').replace(/Mensagem:/g, '').trim()}
        </div>
      </div>
      <div className="hearts-bg">
        {[...Array(18)].map((_, i) => (
          <FaHeart key={i} className={`bg-heart heart-${i % 6}`} />
        ))}
      </div>
    </div>
  );
}

export default MensagemRomantica;
