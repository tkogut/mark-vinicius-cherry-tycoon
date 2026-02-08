import ReactDOM from 'react-dom/client';
import { BackendProvider } from './providers/BackendProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BackendProvider>
        <App />
    </BackendProvider>
);
