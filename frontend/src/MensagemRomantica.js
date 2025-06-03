import React, { useEffect, useState } from 'react';
import './MensagemRomantica.css';

function MensagemRomantica() {
  const [mensagens, setMensagens] = useState([]);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [fotos, setFotos] = useState([]);
  const [fotoAtual, setFotoAtual] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/fotos.json')
      .then((res) => res.json())
      .then((data) => {
        setFotos(data);
        if (data.length > 0) {
          setFotoAtual(data[Math.floor(Math.random() * data.length)]);
        }
      });
    fetch('http://localhost:5000/mensagens.json')
      .then((res) => res.json())
      .then((data) => {
        setMensagens(data);
        if (data.length > 0) {
          setMensagemAtual(data[Math.floor(Math.random() * data.length)]);
        }
      });
  }, []);

  const novaMensagem = () => {
    if (mensagens.length > 0) {
      let nova;
      do {
        nova = mensagens[Math.floor(Math.random() * mensagens.length)];
      } while (nova === mensagemAtual && mensagens.length > 1);
      setMensagemAtual(nova);
    }
    if (fotos.length > 0) {
      let novaFoto;
      do {
        novaFoto = fotos[Math.floor(Math.random() * fotos.length)];
      } while (novaFoto === fotoAtual && fotos.length > 1);
      setFotoAtual(novaFoto);
    }
  };

  return (
    <div className="mensagem-romantica-container">
      <h2>Mensagem do Dia dos Namorados</h2>
      <div className="mensagem-romantica">
        {mensagemAtual}
      </div>
      {fotoAtual && (
        <div className="foto-romantica">
          <img src={`http://localhost:5000${fotoAtual.src}`} alt={fotoAtual.caption} />
          <div className="caption">{fotoAtual.caption}</div>
        </div>
      )}
      <button onClick={novaMensagem}>Ver outra mensagem e foto</button>
    </div>
  );
}

export default MensagemRomantica;
