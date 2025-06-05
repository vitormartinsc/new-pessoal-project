import React, { useEffect, useState, useRef } from 'react';
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
  const imgRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [editandoMensagem, setEditandoMensagem] = useState(false);
  const [mensagemEditada, setMensagemEditada] = useState('');

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

  useEffect(() => {
    if (imgRef.current) {
      setImgSize({ width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight });
    }
  }, [fotoAtual]);

  // Cálculo para manter proporção da imagem na moldura
  const maxMoldura = 380;
  let molduraWidth = maxMoldura;
  let molduraHeight = maxMoldura;
  if (imgSize.width > 0 && imgSize.height > 0) {
    const aspect = imgSize.width / imgSize.height;
    if (aspect > 1) {
      // Imagem mais larga que alta
      molduraWidth = maxMoldura;
      molduraHeight = Math.max(180, maxMoldura / aspect);
    } else {
      // Imagem mais alta que larga
      molduraHeight = maxMoldura;
      molduraWidth = Math.max(180, maxMoldura * aspect);
    }
  }

  // Feedback de joinha
  const handleFeedback = async (positivo) => {
    if (!fotoAtual || !mensagemAtual) return;
    if (positivo) {
      // Salva exemplo no backend
      await fetch('http://localhost:5000/api/salvar-exemplo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: fotoAtual.caption,
          mensagem: mensagemAtual.replace(/Imagem:[^\n]*\n?/g, '').replace(/Mensagem:/g, '').trim(),
        })
      });
      alert('Exemplo salvo! Obrigado pelo feedback.');
    } else {
      setMensagemEditada(mensagemAtual.replace(/Imagem:[^\n]*\n?/g, '').replace(/Mensagem:/g, '').trim());
      setEditandoMensagem(true);
    }
  };

  const handleEnviarEdicao = async () => {
    if (!fotoAtual || !mensagemEditada.trim()) return;
    await fetch('http://localhost:5000/api/salvar-exemplo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: fotoAtual.caption,
        mensagem: mensagemEditada.trim(),
      })
    });
    setEditandoMensagem(false);
    alert('Mensagem editada enviada! Obrigado pelo feedback.');
  };

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
          <div
            className="moldura-floral-react"
            style={{
              width: molduraWidth,
              height: molduraHeight,
              maxWidth: '98vw',
              maxHeight: '98vw',
              minWidth: 180,
              minHeight: 180,
            }}
          >
            <span className="flor-canto flor-canto-tl">🌹</span>
            <span className="flor-canto flor-canto-tr">💐</span>
            <span className="flor-canto flor-canto-bl">🌸</span>
            <span className="flor-canto flor-canto-br">🌺</span>
            <span className="flor-lateral flor-lateral-t">🌷</span>
            <span className="flor-lateral flor-lateral-b">🌻</span>
            <span className="flor-lateral flor-lateral-l">🥀</span>
            <span className="flor-lateral flor-lateral-r">🌼</span>
            <div className="foto-romantica-moldada" style={{ width: '100%', height: '100%' }}>
              <img
                ref={imgRef}
                src={fotoAtual.src}
                alt={fotoAtual.caption}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain', // Garante que a imagem fique inteira
                  borderRadius: 20,
                }}
                onLoad={e => setImgSize({ width: e.target.naturalWidth, height: e.target.naturalHeight })}
              />
            </div>
          </div>
        )}
        {fotoAtual && (
          <div className="caption-outside">{fotoAtual.caption}</div>
        )}
        <div className="mensagem_romantica">
          {loading ? 'Carregando...' : mensagemAtual.replace(/Imagem:[^\n]*\n?/g, '').replace(/Mensagem:/g, '').trim()}
        </div>
        {/* Botões de feedback */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20 }}>
          <button
            aria-label="Gostei da mensagem"
            className="feedback-btn feedback-btn-up"
            onClick={() => handleFeedback(true)}
            title="Gostei da mensagem"
          >
            <span role="img" aria-label="Coração com estrelas">💖</span>
          </button>
          <button
            aria-label="Não gostei da mensagem"
            className="feedback-btn feedback-btn-down"
            onClick={() => handleFeedback(false)}
            title="Não gostei da mensagem"
          >
            <span role="img" aria-label="Coração partido">💔</span>
          </button>
        </div>
        {editandoMensagem && (
          <div style={{ marginTop: 18, textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#e255a3', fontSize: 22, textAlign: 'left', width: '100%' }}>Quer editar a mensagem?</div>
            <textarea
              value={mensagemEditada}
              onChange={e => setMensagemEditada(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1.5px solid #e255a3',
                padding: 8,
                fontSize: '1.18rem',
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                marginBottom: 8,
                boxSizing: 'border-box',
                resize: 'vertical',
                display: 'block',
                marginTop: 28 // aumenta o espaçamento acima do campo
              }}
            />
            <div style={{ textAlign: 'right', width: '100%' }}>
              <button
                className="btn-romantica"
                style={{ background: '#e255a3', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 600, marginRight: 10, cursor: 'pointer' }}
                onClick={handleEnviarEdicao}
              >Enviar edição</button>
              <button
                className="btn-romantica"
                style={{ background: '#fff', color: '#e255a3', border: '1.5px solid #e255a3', borderRadius: 8, padding: '7px 18px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setEditandoMensagem(false)}
              >Cancelar</button>
            </div>
          </div>
        )}
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
