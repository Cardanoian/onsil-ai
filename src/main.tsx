import './utils/lamejs-globals'; // lamejs 전역 상수들을 먼저 로드
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
