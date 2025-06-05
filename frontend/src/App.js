import './App.css';
import MensagemRomantica from './MensagemRomantica';
import UploadFoto from './UploadFoto';
import './UploadFoto.css';

function App() {
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'none' }}>
      <MensagemRomantica />
      <UploadFoto />
    </div>
  );
}

export default App;
