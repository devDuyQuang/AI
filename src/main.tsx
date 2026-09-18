import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState } from 'react';
import { Header, Brand } from './components/Header';
import { Hero } from './components/Hero';
import { AiReceptionistDemo } from './components/AiReceptionistDemo';
import { ProductVision } from './components/ProductVision';
import { clearDemo } from './lib/storage';
import './styles.css';
function App() { const [version,setVersion] = useState(0); return <><div className="ambient"/><div className="page"><Header onReset={() => {clearDemo();setVersion(v => v + 1);}}/><main><Hero/><AiReceptionistDemo key={version}/><ProductVision/></main><footer className="site-footer"><Brand/><p>Human connection. Intelligently supported.</p><span>© {new Date().getFullYear()} KhaiFrost <i/> KhaiFrost AI Core</span></footer></div></>; }
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
