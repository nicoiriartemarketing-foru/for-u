import { contentSizes, type ContentDraft } from './contentModel';
export async function exportContentImage(draft: ContentDraft, imageUrl: string): Promise<Blob> {
  const { width, height } = contentSizes[draft.format];
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('El navegador no pudo crear la imagen.');
  ctx.fillStyle = draft.background; ctx.fillRect(0, 0, width, height);
  if (imageUrl) {
    const image = new Image(); image.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('No se pudo exportar la imagen seleccionada. Abre la biblioteca y selecciónala otra vez.')); image.src = imageUrl; });
    const imageHeight = height * 0.52;
    const scale = Math.max(width / image.width, imageHeight / image.height);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, width, imageHeight); ctx.clip();
    ctx.drawImage(image, (width - image.width * scale) / 2, (imageHeight - image.height * scale) / 2, image.width * scale, image.height * scale); ctx.restore();
  }
  function lines(text: string, fontSize: number) {
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    const result: string[] = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > width - 144) { result.push(line); line = word; }
        else line = candidate;
      }
      result.push(line);
    }
    return result;
  }
  let fontSize = 72;
  let title = lines(draft.title, fontSize);
  const space = imageUrl ? height * 0.48 - 160 : height - 240;
  while (fontSize > 24 && title.length * fontSize * 1.2 > space * 0.65) { fontSize -= 4; title = lines(draft.title, fontSize); }
  ctx.fillStyle = draft.foreground; ctx.textBaseline = 'top';
  let y = imageUrl ? height * 0.52 + 56 : height * 0.28;
  ctx.font = `600 ${fontSize}px Arial, sans-serif`;
  title.forEach(line => { ctx.fillText(line, 72, y, width - 144); y += fontSize * 1.2; });
  y += 28; const subtitle = lines(draft.subtitle, 32); ctx.font = '400 32px Arial, sans-serif';
  subtitle.forEach(line => { ctx.fillText(line, 72, y, width - 144); y += 42; });
  if (y > height - 32) throw new Error('El texto no cabe completo. Acórtalo o cambia al formato Historia antes de exportar.');
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo exportar la imagen.')), 'image/png'));
}
