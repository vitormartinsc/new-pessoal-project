import React, { useEffect, useState } from 'react';
import './MensagemRomantica.css';
import { FaHeart } from 'react-icons/fa';

// Google Fonts para fonte romântica
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

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
    // Gera corações, pétalas e patinhas animadas (mais corações, menos frequência)
    const elementos = [];
    const coracoes = ['❤️', '💖', '💕', '💘', '💞'];
    const petalasEmojis = ['🌸', '🌺', '🌷', '💮', '🥀'];
    const patinhas = ['🐾', '🐶'];
    const total = 12; // Menos elementos para menor frequência
    for (let i = 0; i < total; i++) {
      let emoji;
      if (i % 2 === 0) emoji = coracoes[Math.floor(Math.random() * coracoes.length)];
      else if (i % 4 === 1) emoji = patinhas[Math.floor(Math.random() * patinhas.length)];
      else emoji = petalasEmojis[Math.floor(Math.random() * petalasEmojis.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 12;
      elementos.push(`<span class='petala' style='left:${left}vw; animation-delay:${delay}s;'>${emoji}</span>`);
    }
    const bg = document.querySelector('.petalas-bg');
    if (bg) bg.innerHTML = elementos.join('');
  }, []);

  return (
    <div className="mensagem-romantica-bg">
      <div className="petalas-bg"></div>
      <div className="mensagem-romantica-container">
        <div className="logo-romantica fonte-romantica">
          <span className="logo-heart">❤</span>
          <span className="logo-text">Roberta & Vitor</span>
          <span className="logo-heart">❤</span>
        </div>
        <div className="header-romantica fonte-romantica">
          <FaHeart className="heart-icon" />
          <h2>{`Mensagem do Dia (${new Date().toLocaleDateString('pt-BR')})`}</h2>
          <FaHeart className="heart-icon" />
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
              <img src={fotoAtual.src} alt={fotoAtual.caption} />
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
