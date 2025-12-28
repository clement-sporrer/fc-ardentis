import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Capture toutes les erreurs avant le rendu
window.addEventListener('error', (event) => {
  console.error('❌ Global error before render:', event.error, event.filename, event.lineno);
}, true);

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error('❌ Root element not found');
  document.body.innerHTML = '<div style="padding:40px;font-family:system-ui;max-width:600px;margin:0 auto"><h1 style="color:#dc2626">Erreur: élément root introuvable</h1><p>L\'élément #root n\'existe pas dans le DOM.</p></div>';
} else {
  try {
    console.log('✅ Root element found, creating React root...');
    const root = createRoot(rootEl);
    console.log('✅ React root created, rendering App...');
    root.render(<App />);
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    rootEl.innerHTML = `
      <div style="padding:40px;font-family:system-ui;max-width:600px;margin:0 auto">
        <h1 style="color:#dc2626;margin-bottom:20px">⚠️ Erreur de rendu React</h1>
        <pre style="background:#f3f4f6;padding:20px;border-radius:8px;overflow:auto;font-size:12px">${error instanceof Error ? error.stack : String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top:20px;padding:10px 20px;background:#505287;color:white;border:none;border-radius:8px;cursor:pointer">Recharger la page</button>
      </div>
    `;
  }
}
