import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import WhatsAppIntegration from '../components/WhatsAppIntegration';

export default function WhatsAppConnect() {
  return (
    <main className="foru-whatsapp-page">
      <header className="foru-personal-header">
        <Link to="/" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <div className="foru-personal-header-stats">
          <Link className="foru-header-quiet-button" to="/workspace">← Volver al tablero</Link>
        </div>
      </header>

      <WhatsAppIntegration />
    </main>
  );
}
