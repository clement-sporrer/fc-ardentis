import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from './lib/logger'
import { renderBootstrapError } from './components/BootstrapError'

// Capture toutes les erreurs avant le rendu
window.addEventListener('error', (event) => {
  logger.error('❌ Global error before render:', event.error, event.filename, event.lineno);
}, true);

window.addEventListener('unhandledrejection', (event) => {
  logger.error('❌ Unhandled promise rejection:', event.reason);
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  logger.error('❌ Root element not found');
  renderBootstrapError({
    title: 'Erreur: élément root introuvable',
    message: 'L\'élément #root n\'existe pas dans le DOM.',
  });
} else {
  try {
    logger.log('✅ Root element found, creating React root...');
    const root = createRoot(rootEl);
    logger.log('✅ React root created, rendering App...');
    root.render(<App />);
    logger.log('✅ App rendered successfully');
  } catch (error) {
    logger.error('❌ Failed to render app:', error);
    renderBootstrapError({
      title: '⚠️ Erreur de rendu React',
      message: 'Une erreur est survenue lors du chargement de l\'application.',
      error: error instanceof Error ? error : String(error),
    });
  }
}
