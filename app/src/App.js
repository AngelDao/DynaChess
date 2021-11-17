import logo from './logo.svg';
import './App.css';
import PlayVsPlay from './PlayVsPlay'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Fluence JS Dynamic Chess NFT
        </p>
        <PlayVsPlay boardWidth="500"/>
      </header>
    </div>
  );
}

export default App;
