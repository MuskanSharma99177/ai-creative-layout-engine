import { toPng, toJpeg } from 'html-to-image';
import { DeviceType } from '../types/layout';

export async function exportCreativeImage(
  element: HTMLElement,
  productName: string,
  device: DeviceType,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  const sanitizedName = (productName || 'creative-ad')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const fileName = `flam-creative-${sanitizedName}-${device}.${format === 'jpeg' ? 'jpg' : 'png'}`;

  const options = {
    quality: 0.95,
    pixelRatio: 2, // 2x Retina resolution for crisp typography
    cacheBust: true,
    filter: (node: HTMLElement) => {
      // Exclude any interactive helper overlays if present
      return !node.classList?.contains('export-ignore');
    }
  };

  try {
    let dataUrl: string;
    if (format === 'jpeg') {
      dataUrl = await toJpeg(element, options);
    } else {
      dataUrl = await toPng(element, options);
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('[Export Engine] Error rendering creative canvas:', error);
    throw error;
  }
}
