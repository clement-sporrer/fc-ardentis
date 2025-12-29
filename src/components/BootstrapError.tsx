import { createRoot } from 'react-dom/client';
import { AlertCircle } from 'lucide-react';

interface BootstrapErrorProps {
  title: string;
  message: string;
  error?: Error | string;
}

/**
 * Component to safely render bootstrap errors (before React is fully mounted)
 * This replaces dangerous innerHTML usage
 */
export function renderBootstrapError(props: BootstrapErrorProps) {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    // Last resort: create root element if it doesn't exist
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    const root = createRoot(newRoot);
    root.render(<BootstrapErrorComponent {...props} />);
    return;
  }

  const root = createRoot(rootEl);
  root.render(<BootstrapErrorComponent {...props} />);
}

function BootstrapErrorComponent({ title, message, error }: BootstrapErrorProps) {
  const errorText = error instanceof Error ? error.message : String(error || '');
  const errorStack = error instanceof Error ? error.stack : null;
  const isDev = import.meta.env.DEV;

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#fee2e2',
        marginBottom: '24px',
      }}>
        <AlertCircle style={{ width: '40px', height: '40px', color: '#dc2626' }} />
      </div>
      
      <h1 style={{
        color: '#dc2626',
        marginBottom: '16px',
        fontSize: '24px',
        fontWeight: 'bold',
      }}>
        {title}
      </h1>
      
      <p style={{
        color: '#6b7280',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        {message}
      </p>

      {isDev && errorStack && (
        <details style={{
          marginTop: '24px',
          width: '100%',
          textAlign: 'left',
        }}>
          <summary style={{
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '8px',
          }}>
            Détails techniques (dev uniquement)
          </summary>
          <pre style={{
            background: '#f3f4f6',
            padding: '20px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px',
            color: '#1f2937',
            marginTop: '8px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {errorText}
            {errorStack && `\n\n${errorStack}`}
          </pre>
        </details>
      )}

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#505287',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
        }}
      >
        Recharger la page
      </button>
    </div>
  );
}

