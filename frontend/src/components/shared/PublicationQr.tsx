import { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import { downloadBlob } from '../../toolkit/api';

export default function PublicationQr({ url }: { url: string }) {
  const svg = useMemo(() => {
    const code = qrcode(0, 'M');
    code.addData(new URL(url).href, 'Byte');
    code.make();
    return code.createSvgTag({ cellSize: 6, margin: 24, scalable: true });
  }, [url]);
  return <figure className="publication-qr">
    <img width="220" height="220" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt="Código QR de tu carta publicada" />
    <figcaption>Escanea para abrir tu carta.</figcaption>
    <button type="button" onClick={() => downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'qr-mi-carta.svg')}>Descargar QR</button>
  </figure>;
}
