import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import webgazerContext from './webgazerContext';
import webgazer from './webgazer/index.mjs';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Root />
);

function Root () {
  const [webgazerState, setWebgazerState] = useState(null);
  
  useEffect(() => {
    setWebgazerState(webgazer);
  }, []);
  
  return (
    <React.StrictMode>
      <webgazerContext.Provider value={webgazerState}>
        <App />
      </webgazerContext.Provider>
    </React.StrictMode>
  )
}