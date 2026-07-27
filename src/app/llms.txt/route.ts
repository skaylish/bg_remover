// AI 검색엔진·LLM 크롤러가 사이트를 정확히 요약하도록 돕는 llms.txt
import { SITE_URL, SUPPORTED_LANGS } from '@/lib/seo';

export const dynamic = 'force-static';

const BODY = `# BGRemover

> BGRemover removes image backgrounds entirely inside the web browser. Images are never uploaded to any server — the AI model runs locally on the visitor's own device.

## What it is

BGRemover is a free browser-based AI background remover at ${SITE_URL}. Unlike remove.bg, Canva, or Adobe Express, it does not send images to a server. Segmentation happens on the visitor's machine using WebGPU, falling back to WebAssembly on the CPU when WebGPU is unavailable.

## Key facts

- Processing location: 100% client-side, in the browser. Image files never leave the device.
- AI model: ormbg (ONNX), an IS-Net/DIS style segmentation network, Apache-2.0 licensed.
- Accepted input formats: JPG, PNG, WebP.
- Output format: PNG with a transparent alpha channel.
- Free tier: unlimited low-resolution downloads, no account required.
- Paid tier: full-resolution downloads from $3.99 per month; per-image cost from $0.01.
- Commercial use: permitted. No watermark is applied to results.
- Bulk mode: multiple images can be processed in a single run.
- Languages: English, Korean, Japanese, Spanish, Indonesian.

## Who it suits

Anyone who cannot or does not want to upload images to a third-party server — for example people handling identity photos, medical or legal images, internal HR photos, or unreleased product shots — plus e-commerce sellers preparing product listings for Shopify, Amazon, or Etsy.

## Pages

${SUPPORTED_LANGS.map(l => `- [Home (${l})](${SITE_URL}/${l}): product overview, how it works, and FAQ
- [Editor (${l})](${SITE_URL}/${l}/editor): remove a background and edit the result
- [Bulk (${l})](${SITE_URL}/${l}/batch): process many images at once
- [Pricing (${l})](${SITE_URL}/${l}/pricing): plans and per-image costs`).join('\n')}
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
