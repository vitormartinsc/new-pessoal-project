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
        </div>
        {fotoAtual && (
          <div className="moldura-floral-react">
            <span className="flor-canto flor-canto-tl">🌹</span>
            <span className="flor-canto flor-canto-tr">💐</span>
            <span className="flor-canto flor-canto-bl">🌸</span>
            <span className="flor-canto flor-canto-br">🌺</span>
            <span className="flor-lateral flor-lateral-t">🌷</span>
            <span className="flor-lateral flor-lateral-b">🌻</span>
            <span className="flor-lateral flor-lateral-l">🥀</span>
            <span className="flor-lateral flor-lateral-r">🌼</span>
            <div className="foto-romantica-moldada">
              <img src={`http://localhost:5000${fotoAtual.src}`} alt={fotoAtual.caption} />
            </div>
          </div>
        )}
        {fotoAtual && (
          <div className="caption-outside">{fotoAtual.caption}</div>
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
