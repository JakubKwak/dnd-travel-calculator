import { Routes, Route, HashRouter } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import MapViewer from './components/MapViewer';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/viewer/" element={<MapViewer />} />
      </Routes>
    </HashRouter>
  );
}

export default App;