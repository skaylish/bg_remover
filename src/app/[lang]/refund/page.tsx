// 환불 정책 다국어 페이지 (ko/en/ja/es/id)
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

type Lang = 'ko' | 'en' | 'ja' | 'es' | 'id';

interface RefundContent {
  title: string;
  effective: string;
  intro: string;
  processor: string;
  sections: {
    full: { heading: string; items: string[] };
    partial: { heading: string; items: string[] };
    none: { heading: string; items: string[] };
    subscription: { heading: string; items: string[] };
    topup: { heading: string; items: string[] };
    enterprise: { heading: string; items: string[] };
    process: { heading: string; items: string[] };
  };
  note: string;
  footer: string;
}

const CONTENT: Record<Lang, RefundContent> = {
  ko: {
    title: '환불 정책',
    effective: '시행일: 2026년 3월 27일 | 다음세상 (bgremover.pics)',
    intro: '당사는 고객 만족을 최우선으로 합니다. 본 환불 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」을 준수하며, 결제 대행은 Paddle(paddle.com)을 통해 이루어집니다.',
    processor: 'BGRemover의 결제는 Merchant of Record(판매 주체)인 Paddle이 처리하며, 세금 및 환불 처리도 Paddle 정책에 따릅니다.',
    sections: {
      full: {
        heading: '✅ 전액 환불',
        items: [
          '결제일로부터 14일 이내이며 크레딧을 전혀 사용하지 않은 경우',
          '서비스 오류 또는 회사 귀책 사유로 정상 이용이 불가능한 경우',
          'Paddle 결제 시스템 오류로 중복 결제된 경우',
        ],
      },
      partial: {
        heading: '🔄 부분 환불',
        items: [
          '결제일로부터 14일 이내이며 일부 크레딧을 사용한 경우',
          '환불금액 = 결제금액 × (잔여 크레딧 / 총 크레딧)',
          '예시: $12.99 Business 플랜, 100/500 크레딧 사용 → $12.99 × 80% = $10.39 환불',
        ],
      },
      none: {
        heading: '❌ 환불 불가',
        items: [
          '결제일로부터 14일 초과된 경우',
          '당월 지급 크레딧을 모두 소진한 경우',
          '약관 위반으로 인한 계정 정지 또는 강제 해지된 경우',
          '구독 취소 후 잔여 기간에 대한 환불 (기간 말 취소 정책 적용)',
        ],
      },
      subscription: {
        heading: '구독(Starter / Business / Enterprise) 환불 세부 사항',
        items: [
          '구독은 매월 자동 갱신됩니다.',
          '취소 시 즉시 해지되지 않으며, 현재 결제 기간 말일까지 서비스가 유지됩니다.',
          '다음 달 크레딧은 갱신일에 지급되며, 취소 후에는 지급되지 않습니다.',
          '미사용 크레딧은 갱신 시 초기화되며 이월되지 않습니다.',
          '구독 관리(취소 포함)는 Paddle Customer Portal에서 직접 처리할 수 있습니다.',
        ],
      },
      topup: {
        heading: '1회 충전(Topup) 환불 세부 사항',
        items: [
          '1회 충전 크레딧은 만료일 없이 영구 유지됩니다.',
          '결제일로부터 14일 이내, 미사용 시 전액 환불 가능합니다.',
          '일부 사용 시 잔여 크레딧 비율에 따라 부분 환불됩니다.',
          '14일 경과 후에는 환불이 불가합니다.',
        ],
      },
      enterprise: {
        heading: 'Enterprise(무제한) 플랜 환불',
        items: [
          'Enterprise 플랜은 무제한 생성을 제공하므로 크레딧 소진 개념이 적용되지 않습니다.',
          '결제일로부터 7일 이내, 서비스를 실질적으로 이용하지 않은 경우 전액 환불 가능합니다.',
          '7일 초과 후에는 기간 말 취소만 가능하며 환불은 불가합니다.',
        ],
      },
      process: {
        heading: '환불 신청 방법',
        items: [
          '이메일: dcbvcd@gmail.com',
          '필수 기재사항: 결제 이메일, 결제일, Paddle 주문 번호(선택), 환불 사유',
          '처리 기간: 영업일 기준 3일 이내 검토 후 회신',
          '환불 처리 기간: Paddle 승인 후 카드사에 따라 5~10 영업일 소요',
        ],
      },
    },
    note: 'Paddle은 Merchant of Record로서 모든 거래의 법적 판매 주체입니다. 부가세·소비세 등 세금 처리는 Paddle이 자동으로 관리합니다. 환불 관련 추가 문의는 Paddle 고객센터(paddle.com/help)를 통해서도 가능합니다.',
    footer: '사업자: 다음세상 | 대표자: 박영구 | 이메일: dcbvcd@gmail.com | 결제 대행: Paddle (paddle.com)',
  },

  en: {
    title: 'Refund Policy',
    effective: 'Effective: March 27, 2026 | Daumseseang (bgremover.pics)',
    intro: 'Customer satisfaction is our top priority. This Refund Policy complies with applicable consumer protection law. All payments are processed by Paddle (paddle.com).',
    processor: 'BGRemover payments are handled by Paddle as the Merchant of Record. Taxes and refund processing are governed by Paddle\'s policies.',
    sections: {
      full: {
        heading: '✅ Full Refund',
        items: [
          'Within 14 days of payment and no credits have been used.',
          'Service is unavailable due to a Company-attributable error or outage.',
          'A duplicate charge occurred due to a Paddle payment system error.',
        ],
      },
      partial: {
        heading: '🔄 Partial Refund',
        items: [
          'Within 14 days of payment and some credits have been used.',
          'Refund amount = Amount paid × (Remaining credits / Total credits)',
          'Example: $12.99 Business plan, 100 of 500 credits used → $12.99 × 80% = $10.39 refund.',
        ],
      },
      none: {
        heading: '❌ No Refund',
        items: [
          'More than 14 days have passed since payment.',
          'All credits granted for the current period have been consumed.',
          'Account was suspended or terminated due to a Terms violation.',
          'Refunds for unused subscription time after cancellation (end-of-period cancellation policy applies).',
        ],
      },
      subscription: {
        heading: 'Subscription (Starter / Business / Enterprise) Details',
        items: [
          'Subscriptions renew automatically each month.',
          'Cancellation takes effect at the end of the current billing period; access continues until then.',
          'Credits for the next month are issued on renewal and will not be issued after cancellation.',
          'Unused credits reset at renewal and do not roll over.',
          'You can manage (including cancel) your subscription directly via the Paddle Customer Portal.',
        ],
      },
      topup: {
        heading: 'One-Time Topup Details',
        items: [
          'Topup credits never expire.',
          'Full refund available within 14 days of payment if no credits have been used.',
          'Partial refund available within 14 days if some credits have been used, prorated to remaining credits.',
          'No refund after 14 days.',
        ],
      },
      enterprise: {
        heading: 'Enterprise (Unlimited) Plan',
        items: [
          'Enterprise provides unlimited generations, so credit-consumption rules do not apply.',
          'Full refund available within 7 days of payment if the Service has not been materially used.',
          'After 7 days, only end-of-period cancellation is available; no monetary refund.',
        ],
      },
      process: {
        heading: 'How to Request a Refund',
        items: [
          'Email: dcbvcd@gmail.com',
          'Required information: payment email, payment date, Paddle order number (if available), reason for refund.',
          'Review time: we will respond within 3 business days.',
          'Processing time: 5–10 business days after Paddle approves, depending on your card issuer.',
        ],
      },
    },
    note: 'Paddle is the Merchant of Record and the legal seller for all transactions. Paddle automatically manages tax (VAT/GST) processing. For additional refund questions, you may also contact Paddle Support at paddle.com/help.',
    footer: 'Company: Daumseseang | CEO: Yeonggu Park | Email: dcbvcd@gmail.com | Payment processor: Paddle (paddle.com)',
  },

  ja: {
    title: '返金ポリシー',
    effective: '施行日: 2026年3月27日 | ダウムセサン (bgremover.pics)',
    intro: '当社はお客様の満足を最優先にしています。本返金ポリシーは適用される消費者保護法を遵守しており、すべての決済はPaddle（paddle.com）が処理します。',
    processor: 'BGRemoverの決済はMerchant of RecordであるPaddleが処理します。税金・返金処理はPaddleのポリシーに従います。',
    sections: {
      full: {
        heading: '✅ 全額返金',
        items: [
          '決済日から14日以内で、クレジットを一切使用していない場合',
          '会社の帰責事由によりサービスが利用不能な場合',
          'Paddle決済システムの不具合による二重請求が発生した場合',
        ],
      },
      partial: {
        heading: '🔄 部分返金',
        items: [
          '決済日から14日以内で、一部クレジットを使用した場合',
          '返金額 = 決済額 × (残余クレジット / 総クレジット)',
          '例: $12.99 Businessプラン、500クレジット中100使用 → $12.99 × 80% = $10.39返金',
        ],
      },
      none: {
        heading: '❌ 返金不可',
        items: [
          '決済日から14日超経過後',
          '当月付与クレジットをすべて使用した場合',
          '規約違反によるアカウント停止・強制解約の場合',
          'サブスクリプション解約後の残余期間に対する返金（期末解約ポリシー適用）',
        ],
      },
      subscription: {
        heading: 'サブスクリプション（Starter / Business / Enterprise）詳細',
        items: [
          'サブスクリプションは毎月自動更新されます。',
          '解約しても当月末まではサービスが継続されます。',
          '翌月のクレジットは更新日に付与され、解約後は付与されません。',
          '未使用クレジットは更新時にリセットされ、繰り越しはありません。',
          'サブスクリプション管理（解約を含む）はPaddle Customer Portalから直接行えます。',
        ],
      },
      topup: {
        heading: '1回チャージ（Topup）詳細',
        items: [
          'Topupクレジットに有効期限はありません。',
          '決済日から14日以内、未使用であれば全額返金可能です。',
          '一部使用済みの場合、14日以内であれば残余クレジット比率に応じた按分返金が可能です。',
          '14日経過後は返金不可です。',
        ],
      },
      enterprise: {
        heading: 'Enterprise（無制限）プラン',
        items: [
          'Enterpriseは無制限生成を提供するため、クレジット消費ルールは適用されません。',
          '決済日から7日以内、サービスを実質的に利用していない場合は全額返金可能です。',
          '7日経過後は期末解約のみ可能で、金銭的返金はありません。',
        ],
      },
      process: {
        heading: '返金申請方法',
        items: [
          'メール: dcbvcd@gmail.com',
          '必須記載事項: 決済メールアドレス、決済日、Paddle注文番号（任意）、返金理由',
          '審査期間: 3営業日以内にご返答します',
          '処理期間: Paddle承認後、カード会社によって5〜10営業日かかります',
        ],
      },
    },
    note: 'PaddleはMerchant of Recordとしてすべての取引における法的販売主体です。消費税・VAT等の税務処理はPaddleが自動管理します。返金に関するご質問はPaddleサポート（paddle.com/help）にもお問い合わせいただけます。',
    footer: '事業者: ダウムセサン | 代表: パク・ヨングク | メール: dcbvcd@gmail.com | 決済代行: Paddle (paddle.com)',
  },

  es: {
    title: 'Política de Reembolsos',
    effective: 'En vigor desde: 27 de marzo de 2026 | Daumseseang (bgremover.pics)',
    intro: 'La satisfacción del cliente es nuestra prioridad. Esta Política de Reembolsos cumple con la legislación de protección al consumidor aplicable. Todos los pagos son procesados por Paddle (paddle.com).',
    processor: 'Los pagos de BGRemover son gestionados por Paddle como Merchant of Record. El procesamiento de impuestos y reembolsos se rige por las políticas de Paddle.',
    sections: {
      full: {
        heading: '✅ Reembolso Total',
        items: [
          'Dentro de los 14 días posteriores al pago y sin créditos utilizados.',
          'El Servicio no está disponible por causas imputables a la Empresa.',
          'Se realizó un cobro duplicado por error del sistema de pago de Paddle.',
        ],
      },
      partial: {
        heading: '🔄 Reembolso Parcial',
        items: [
          'Dentro de los 14 días posteriores al pago y con algunos créditos usados.',
          'Importe del reembolso = Importe pagado × (Créditos restantes / Créditos totales)',
          'Ejemplo: plan Business $12.99, 100 de 500 créditos usados → $12.99 × 80% = $10.39 reembolsados.',
        ],
      },
      none: {
        heading: '❌ Sin Reembolso',
        items: [
          'Han transcurrido más de 14 días desde el pago.',
          'Se han consumido todos los créditos del período actual.',
          'La cuenta fue suspendida o cancelada por infracción de los Términos.',
          'Reembolsos por tiempo de suscripción no utilizado tras la cancelación (se aplica la política de cancelación al final del período).',
        ],
      },
      subscription: {
        heading: 'Detalles de Suscripción (Starter / Business / Enterprise)',
        items: [
          'Las suscripciones se renuevan automáticamente cada mes.',
          'La cancelación tiene efecto al final del período de facturación actual; el acceso continúa hasta entonces.',
          'Los créditos del mes siguiente se emiten en la renovación y no se emitirán tras la cancelación.',
          'Los créditos no utilizados se reinician en la renovación y no se acumulan.',
          'Puede gestionar (incluida la cancelación) su suscripción directamente en el Portal de Clientes de Paddle.',
        ],
      },
      topup: {
        heading: 'Detalles del Topup (Pago Único)',
        items: [
          'Los créditos Topup no caducan.',
          'Reembolso total disponible dentro de los 14 días si no se han usado créditos.',
          'Reembolso parcial disponible dentro de los 14 días si se han usado algunos créditos, proporcional a los créditos restantes.',
          'Sin reembolso después de 14 días.',
        ],
      },
      enterprise: {
        heading: 'Plan Enterprise (Ilimitado)',
        items: [
          'Enterprise ofrece generaciones ilimitadas, por lo que no aplican las reglas de consumo de créditos.',
          'Reembolso total disponible dentro de los 7 días si el Servicio no ha sido utilizado de forma sustancial.',
          'Después de 7 días, solo es posible la cancelación al final del período; no hay reembolso monetario.',
        ],
      },
      process: {
        heading: 'Cómo Solicitar un Reembolso',
        items: [
          'Email: dcbvcd@gmail.com',
          'Información requerida: correo de pago, fecha de pago, número de pedido de Paddle (si disponible), motivo del reembolso.',
          'Plazo de revisión: responderemos en un plazo de 3 días hábiles.',
          'Plazo de procesamiento: 5–10 días hábiles tras la aprobación de Paddle, según el emisor de su tarjeta.',
        ],
      },
    },
    note: 'Paddle es el Merchant of Record y el vendedor legal de todas las transacciones. Paddle gestiona automáticamente el procesamiento de impuestos (IVA/GST). Para consultas adicionales sobre reembolsos, también puede contactar con el soporte de Paddle en paddle.com/help.',
    footer: 'Empresa: Daumseseang | CEO: Yeonggu Park | Email: dcbvcd@gmail.com | Procesador de pagos: Paddle (paddle.com)',
  },

  id: {
    title: 'Kebijakan Pengembalian Dana',
    effective: 'Berlaku: 27 Maret 2026 | Daumseseang (bgremover.pics)',
    intro: 'Kepuasan pelanggan adalah prioritas utama kami. Kebijakan Pengembalian Dana ini mematuhi hukum perlindungan konsumen yang berlaku. Semua pembayaran diproses oleh Paddle (paddle.com).',
    processor: 'Pembayaran BGRemover ditangani oleh Paddle sebagai Merchant of Record. Pemrosesan pajak dan pengembalian dana diatur oleh kebijakan Paddle.',
    sections: {
      full: {
        heading: '✅ Pengembalian Dana Penuh',
        items: [
          'Dalam 14 hari setelah pembayaran dan tidak ada kredit yang digunakan.',
          'Layanan tidak tersedia karena kesalahan yang dapat diatribusikan kepada Perusahaan.',
          'Terjadi tagihan ganda akibat kesalahan sistem pembayaran Paddle.',
        ],
      },
      partial: {
        heading: '🔄 Pengembalian Dana Sebagian',
        items: [
          'Dalam 14 hari setelah pembayaran dan sebagian kredit telah digunakan.',
          'Jumlah pengembalian = Jumlah dibayar × (Kredit tersisa / Total kredit)',
          'Contoh: paket Business $12.99, 100 dari 500 kredit digunakan → $12.99 × 80% = $10.39 dikembalikan.',
        ],
      },
      none: {
        heading: '❌ Tidak Ada Pengembalian Dana',
        items: [
          'Lebih dari 14 hari telah berlalu sejak pembayaran.',
          'Semua kredit yang diberikan untuk periode saat ini telah digunakan.',
          'Akun ditangguhkan atau dihentikan karena pelanggaran Syarat.',
          'Pengembalian dana untuk sisa waktu berlangganan setelah pembatalan (kebijakan pembatalan akhir periode berlaku).',
        ],
      },
      subscription: {
        heading: 'Detail Langganan (Starter / Business / Enterprise)',
        items: [
          'Langganan diperbarui secara otomatis setiap bulan.',
          'Pembatalan berlaku pada akhir periode penagihan saat ini; akses tetap berlanjut hingga saat itu.',
          'Kredit untuk bulan berikutnya diterbitkan saat pembaruan dan tidak akan diterbitkan setelah pembatalan.',
          'Kredit yang tidak terpakai direset saat pembaruan dan tidak dapat diakumulasi.',
          'Anda dapat mengelola (termasuk membatalkan) langganan langsung melalui Paddle Customer Portal.',
        ],
      },
      topup: {
        heading: 'Detail Topup Sekali Bayar',
        items: [
          'Kredit Topup tidak memiliki masa kedaluwarsa.',
          'Pengembalian dana penuh tersedia dalam 14 hari jika tidak ada kredit yang digunakan.',
          'Pengembalian dana sebagian tersedia dalam 14 hari jika sebagian kredit telah digunakan, prorata berdasarkan kredit tersisa.',
          'Tidak ada pengembalian dana setelah 14 hari.',
        ],
      },
      enterprise: {
        heading: 'Paket Enterprise (Tak Terbatas)',
        items: [
          'Enterprise menyediakan pembuatan tak terbatas, sehingga aturan konsumsi kredit tidak berlaku.',
          'Pengembalian dana penuh tersedia dalam 7 hari jika Layanan belum digunakan secara substansial.',
          'Setelah 7 hari, hanya pembatalan akhir periode yang tersedia; tidak ada pengembalian dana tunai.',
        ],
      },
      process: {
        heading: 'Cara Mengajukan Pengembalian Dana',
        items: [
          'Email: dcbvcd@gmail.com',
          'Informasi yang diperlukan: email pembayaran, tanggal pembayaran, nomor pesanan Paddle (jika tersedia), alasan pengembalian dana.',
          'Waktu peninjauan: kami akan merespons dalam 3 hari kerja.',
          'Waktu pemrosesan: 5–10 hari kerja setelah persetujuan Paddle, tergantung penerbit kartu Anda.',
        ],
      },
    },
    note: 'Paddle adalah Merchant of Record dan penjual resmi untuk semua transaksi. Paddle secara otomatis mengelola pemrosesan pajak (PPN/GST). Untuk pertanyaan tambahan tentang pengembalian dana, Anda juga dapat menghubungi Dukungan Paddle di paddle.com/help.',
    footer: 'Perusahaan: Daumseseang | CEO: Yeonggu Park | Email: dcbvcd@gmail.com | Pemroses pembayaran: Paddle (paddle.com)',
  },
};

export default async function RefundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));
  const c = CONTENT[(lang as Lang)] ?? CONTENT.en;
  const s = c.sections;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} dict={dict} />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {c.title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.effective}</p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>

            <section>
              <p className="mb-3">{c.intro}</p>
              <p className="p-4 rounded-xl text-xs" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                {c.processor}
              </p>
            </section>

            {/* Refund eligibility boxes */}
            <section>
              <div className="space-y-4">
                {[s.full, s.partial, s.none].map((block) => (
                  <div key={block.heading} className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                    <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{block.heading}</h2>
                    <ul className="space-y-1.5 list-disc list-inside">
                      {block.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Plan-specific details */}
            {[s.subscription, s.topup, s.enterprise].map((block) => (
              <section key={block.heading}>
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{block.heading}</h2>
                <ul className="space-y-1.5 list-disc list-inside">
                  {block.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ))}

            {/* Process */}
            <section className="p-6 rounded-2xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{s.process.heading}</h2>
              <ul className="space-y-2 list-disc list-inside">
                {s.process.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            {/* Note */}
            <p className="text-xs p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', color: 'var(--text-muted)' }}>
              💡 {c.note}
            </p>

            <p className="pt-4 text-xs" style={{ color: 'var(--text-subtle)', borderTop: '1px solid var(--bg-border)' }}>
              {c.footer}
            </p>
          </div>
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}
