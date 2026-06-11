// 다국어 SEO 메타데이터 중앙 설정

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bgremover.ai').replace(/\/$/, '');

export const SUPPORTED_LANGS = ['en', 'ko', 'ja', 'es', 'id'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

export interface PageMeta {
  title: string;
  description: string;
}

export type PageKey = 'home' | 'pricing' | 'editor' | 'batch';

export const SEO: Record<SupportedLang, Record<PageKey, PageMeta>> = {
  en: {
    home: {
      title: 'BGRemover — Free AI Background Remover | No Upload Required',
      description: 'Remove image backgrounds instantly in your browser. 100% local processing — images never leave your device. Free low-res forever, HD from $0.01/image.',
    },
    pricing: {
      title: 'Pricing — BGRemover | From $3.99/mo',
      description: 'Simple, transparent pricing. Low-res background removal is always free. HD downloads from $3.99/month. No credit expiry. Cancel anytime.',
    },
    editor: {
      title: 'Editor — BGRemover',
      description: 'Edit your background-removed image. Add custom backgrounds, gradients, shadows, and color adjustments.',
    },
    batch: {
      title: 'Bulk Background Remover — BGRemover',
      description: 'Remove backgrounds from multiple images at once. Bulk-process product photos for Shopify, Amazon, and Etsy. Cheaper than remove.bg by 16x.',
    },
  },
  ko: {
    home: {
      title: 'BGRemover — 무료 AI 배경 제거 | 서버 업로드 없음',
      description: '이미지 배경을 브라우저에서 즉시 제거. 서버에 업로드되지 않는 100% 로컬 처리. 저해상도 영구 무료, 고해상도 ₩19~.',
    },
    pricing: {
      title: '요금제 — BGRemover | 월 $3.99부터',
      description: '심플하고 투명한 요금제. 저해상도 배경 제거는 항상 무료. 고해상도 월 $3.99부터. 크레딧 만료 없음. 언제든 취소 가능.',
    },
    editor: {
      title: '에디터 — BGRemover',
      description: '배경이 제거된 이미지를 편집하세요. 커스텀 배경, 그래디언트, 그림자 효과를 적용할 수 있습니다.',
    },
    batch: {
      title: '일괄 배경 제거 — BGRemover',
      description: '여러 이미지의 배경을 한 번에 제거. 쇼핑몰 상품 이미지를 대량으로 처리하세요.',
    },
  },
  ja: {
    home: {
      title: 'BGRemover — 無料AI背景除去 | アップロード不要',
      description: '画像の背景をブラウザで瞬時に削除。画像はサーバーに送信されず完全プライベート。低解像度は永久無料。',
    },
    pricing: {
      title: '料金プラン — BGRemover | 月$3.99から',
      description: 'シンプルで透明な料金体系。低解像度は常に無料。高解像度は月$3.99から。クレジットの有効期限なし。',
    },
    editor: {
      title: 'エディター — BGRemover',
      description: '背景除去済み画像を編集。カスタム背景、グラデーション、シャドウを追加できます。',
    },
    batch: {
      title: '一括背景除去 — BGRemover',
      description: '複数の画像を一度に背景除去。Shopify・Amazonの商品画像を一括処理できます。',
    },
  },
  es: {
    home: {
      title: 'BGRemover — Eliminar Fondo IA Gratis | Sin Subida de Archivos',
      description: 'Elimina fondos de imágenes al instante en tu navegador. Procesamiento 100% local — tus fotos nunca se suben a ningún servidor. Gratis.',
    },
    pricing: {
      title: 'Precios — BGRemover | Desde $3.99/mes',
      description: 'Precios simples y transparentes. Baja resolución siempre gratis. Alta resolución desde $3.99/mes. Sin caducidad de créditos.',
    },
    editor: {
      title: 'Editor — BGRemover',
      description: 'Edita tus imágenes sin fondo. Añade fondos personalizados, degradados y efectos de sombra.',
    },
    batch: {
      title: 'Eliminador de Fondo en Lote — BGRemover',
      description: 'Elimina fondos de múltiples imágenes a la vez. Procesa fotos de productos para Shopify y Amazon en masa.',
    },
  },
  id: {
    home: {
      title: 'BGRemover — Hapus Background Gratis dengan AI | Tanpa Upload',
      description: 'Hapus background gambar langsung di browser. Pemrosesan 100% lokal — gambar tidak pernah dikirim ke server. Resolusi rendah gratis selamanya.',
    },
    pricing: {
      title: 'Harga — BGRemover | Mulai $3.99/bulan',
      description: 'Harga sederhana dan transparan. Resolusi rendah selalu gratis. Resolusi tinggi mulai $3.99/bulan. Kredit tidak kedaluwarsa.',
    },
    editor: {
      title: 'Editor — BGRemover',
      description: 'Edit gambar yang sudah dihapus backgroundnya. Tambahkan latar belakang kustom, gradien, dan bayangan.',
    },
    batch: {
      title: 'Hapus Background Massal — BGRemover',
      description: 'Hapus background dari banyak gambar sekaligus. Proses foto produk untuk Shopify dan Amazon secara massal.',
    },
  },
};

export function getHreflangAlternates(path = ''): Record<string, string> {
  return Object.fromEntries(
    SUPPORTED_LANGS.map(l => [l, `${SITE_URL}/${l}${path}`])
  );
}
