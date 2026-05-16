// 언어별 개인정보처리방침 페이지
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

const CONTACT = 'dcbvcd@gmail.com';
const EFFECTIVE = { ko: '2026년 3월 27일', en: 'March 27, 2026', ja: '2026年3月27日', es: '27 de marzo de 2026', id: '27 Maret 2026' };

const CONTENT: Record<string, {
  title: string; subtitle: string;
  sections: { heading: string; body: string | string[] | { cols: string[]; rows: string[][] } }[];
  note: string; footer: string;
}> = {
  ko: {
    title: '개인정보처리방침',
    subtitle: `시행일: ${EFFECTIVE.ko} | 다음세상 (bgremover.pics)`,
    sections: [
      { heading: '제1조 (총칙)', body: '다음세상(이하 "회사")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 BGRemover 서비스 이용 시 수집되는 개인정보의 처리에 관한 사항을 규정합니다.' },
      { heading: '제2조 (수집하는 개인정보)', body: { cols: ['수집 시점', '수집 항목', '수집 목적'], rows: [['Google 소셜 로그인', '이메일, 이름, 프로필 사진(선택)', '회원 식별 및 서비스 제공'], ['결제 시', '결제 처리 정보(Paddle 처리)', '결제 처리 및 환불 대응'], ['서비스 이용 시', '접속 IP, 브라우저, 이용 일시', '서비스 안정성 및 부정 이용 방지']] } },
      { heading: '제3조 (보유 및 이용 기간)', body: ['회원 정보: 탈퇴 시 즉시 삭제', '결제 기록: 전자상거래법에 따라 5년 보관', '접속 로그: 3개월 후 자동 삭제'] },
      { heading: '제4조 (제3자 제공)', body: '원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 이용자가 동의한 경우 또는 법령에 의한 경우는 예외입니다.' },
      { heading: '제5조 (처리 위탁)', body: { cols: ['수탁업체', '위탁 업무'], rows: [['Google LLC', 'OAuth 소셜 로그인 인증'], ['Paddle.com Market Ltd.', '결제 처리 및 결제 정보 관리'], ['Vercel Inc.', '서비스 호스팅'], ['Supabase Inc.', '데이터베이스 운영']] } },
      { heading: '제6조 (이용자 권리)', body: ['개인정보 열람·정정·삭제·처리정지 요구 가능', `권리 행사: ${CONTACT}으로 이메일 요청 → 지체 없이 조치`] },
      { heading: '제7조 (개인정보 보호책임자)', body: ['성명: 박영구', '직책: 대표', `이메일: ${CONTACT}`, '전화: 010-2430-7309'] },
      { heading: '제8조 (쿠키 사용)', body: '로그인 세션 유지 및 언어 설정 저장을 위해 쿠키와 로컬스토리지를 사용합니다. 브라우저 설정에서 거부 가능하나 일부 기능이 제한될 수 있습니다.' },
      { heading: '제9조 (방침 변경)', body: '방침 변경 시 변경 7일 전 서비스 내 공지 또는 이메일로 사전 고지합니다.' },
    ],
    note: '※ 업로드된 이미지는 서버로 전송되지 않으며, 모든 AI 처리는 이용자의 브라우저(로컬)에서만 이루어집니다.',
    footer: '개인정보 분쟁 조정: 개인정보분쟁조정위원회 (www.kopico.go.kr / 1833-6972) | 침해 신고: privacy.kisa.or.kr / 118',
  },
  en: {
    title: 'Privacy Policy',
    subtitle: `Effective: ${EFFECTIVE.en} | Daumseseang (bgremover.pics)`,
    sections: [
      { heading: '1. Overview', body: 'Daumseseang ("Company") values your privacy and complies with applicable data protection laws. This policy describes how we collect and process personal data when you use BGRemover.' },
      { heading: '2. Data We Collect', body: { cols: ['When', 'Data', 'Purpose'], rows: [['Google Sign-In', 'Email, name, profile photo (optional)', 'Account identification & service'], ['Payment', 'Payment processing info (handled by Paddle)', 'Payment & refund processing'], ['Service use', 'IP address, browser type, timestamps', 'Security & abuse prevention']] } },
      { heading: '3. Retention', body: ['Account data: deleted immediately upon account closure', 'Payment records: retained 5 years per applicable law', 'Access logs: auto-deleted after 3 months'] },
      { heading: '4. Third-Party Sharing', body: 'We do not sell or share your personal data with third parties, except as required by law or with your explicit consent.' },
      { heading: '5. Sub-Processors', body: { cols: ['Vendor', 'Purpose'], rows: [['Google LLC', 'OAuth authentication'], ['Paddle.com Market Ltd.', 'Payment processing'], ['Vercel Inc.', 'Service hosting'], ['Supabase Inc.', 'Database']] } },
      { heading: '6. Your Rights', body: [`You may request access, correction, deletion, or restriction of your data at any time by emailing ${CONTACT}. We will respond within 3 business days.`] },
      { heading: '7. Data Protection Contact', body: ['Name: Yeonggu Park', 'Role: CEO', `Email: ${CONTACT}`] },
      { heading: '8. Cookies', body: 'We use cookies and local storage for session management and language preferences. You may disable cookies in your browser settings, but some features may be affected.' },
      { heading: '9. Policy Updates', body: 'We will notify you of material changes at least 7 days in advance via in-service notice or email.' },
    ],
    note: '※ Images you upload are never sent to our servers. All AI processing happens locally in your browser.',
    footer: `Questions? Contact us at ${CONTACT}`,
  },
  ja: {
    title: 'プライバシーポリシー',
    subtitle: `施行日: ${EFFECTIVE.ja} | Daumseseang (bgremover.pics)`,
    sections: [
      { heading: '第1条（総則）', body: 'Daumseseang（以下「会社」）は、ユーザーの個人情報を重視し、適用される個人情報保護法令を遵守します。本ポリシーは、BGRemoverサービス利用時に収集される個人情報の取り扱いについて規定します。' },
      { heading: '第2条（収集する個人情報）', body: { cols: ['収集時点', '収集項目', '収集目的'], rows: [['Googleログイン', 'メール、氏名、プロフィール写真（任意）', '会員識別・サービス提供'], ['決済時', '決済処理情報（Paddle処理）', '決済・返金処理'], ['サービス利用時', 'IPアドレス、ブラウザ、利用日時', 'セキュリティ・不正利用防止']] } },
      { heading: '第3条（保有期間）', body: ['会員情報: 退会時に即時削除', '決済記録: 関連法令に基づき5年保管', 'アクセスログ: 3ヶ月後に自動削除'] },
      { heading: '第4条（第三者提供）', body: '原則として、ユーザーの個人情報を外部に提供しません。ただし、ユーザーの同意がある場合または法令による場合は例外です。' },
      { heading: '第5条（委託先）', body: { cols: ['委託先', '委託業務'], rows: [['Google LLC', 'OAuth認証'], ['Paddle.com Market Ltd.', '決済処理'], ['Vercel Inc.', 'サービスホスティング'], ['Supabase Inc.', 'データベース']] } },
      { heading: '第6条（ユーザーの権利）', body: [`個人情報の閲覧・訂正・削除・処理停止を${CONTACT}へメールにてご要請いただけます。3営業日以内に対応いたします。`] },
      { heading: '第7条（個人情報保護責任者）', body: ['氏名: Yeonggu Park', '役職: 代表', `メール: ${CONTACT}`] },
      { heading: '第8条（Cookie）', body: 'ログインセッション維持と言語設定保存のためにCookieとローカルストレージを使用します。ブラウザ設定で無効化できますが、一部機能が制限される場合があります。' },
      { heading: '第9条（ポリシー変更）', body: '重要な変更がある場合、7日前にサービス内通知またはメールにてお知らせします。' },
    ],
    note: '※ アップロードされた画像はサーバーに送信されません。すべてのAI処理はブラウザ（ローカル）内で行われます。',
    footer: `お問い合わせ: ${CONTACT}`,
  },
  es: {
    title: 'Política de Privacidad',
    subtitle: `Vigencia: ${EFFECTIVE.es} | Daumseseang (bgremover.pics)`,
    sections: [
      { heading: '1. Introducción', body: 'Daumseseang ("Empresa") valora tu privacidad y cumple con las leyes de protección de datos aplicables. Esta política describe cómo recopilamos y procesamos datos personales al usar BGRemover.' },
      { heading: '2. Datos que Recopilamos', body: { cols: ['Cuándo', 'Datos', 'Propósito'], rows: [['Inicio con Google', 'Email, nombre, foto de perfil (opcional)', 'Identificación y servicio'], ['Pago', 'Info de pago (procesado por Paddle)', 'Procesamiento y reembolsos'], ['Uso del servicio', 'IP, navegador, marcas de tiempo', 'Seguridad y prevención de abuso']] } },
      { heading: '3. Retención', body: ['Datos de cuenta: eliminados al cerrar la cuenta', 'Registros de pago: 5 años según la ley', 'Registros de acceso: eliminados automáticamente en 3 meses'] },
      { heading: '4. Compartir con Terceros', body: 'No vendemos ni compartimos tus datos con terceros, salvo por requerimiento legal o con tu consentimiento explícito.' },
      { heading: '5. Sub-procesadores', body: { cols: ['Proveedor', 'Propósito'], rows: [['Google LLC', 'Autenticación OAuth'], ['Paddle.com Market Ltd.', 'Procesamiento de pagos'], ['Vercel Inc.', 'Hosting'], ['Supabase Inc.', 'Base de datos']] } },
      { heading: '6. Tus Derechos', body: [`Puedes solicitar acceso, corrección, eliminación o restricción de tus datos escribiendo a ${CONTACT}. Respondemos en 3 días hábiles.`] },
      { heading: '7. Contacto de Privacidad', body: ['Nombre: Yeonggu Park', 'Cargo: CEO', `Email: ${CONTACT}`] },
      { heading: '8. Cookies', body: 'Usamos cookies y almacenamiento local para gestión de sesiones y preferencias de idioma. Puedes desactivarlos en tu navegador, aunque algunas funciones pueden verse afectadas.' },
      { heading: '9. Actualizaciones', body: 'Te notificaremos cambios importantes con al menos 7 días de anticipación por aviso en el servicio o email.' },
    ],
    note: '※ Las imágenes que subes nunca se envían a nuestros servidores. Todo el procesamiento de IA ocurre localmente en tu navegador.',
    footer: `¿Preguntas? Contáctanos en ${CONTACT}`,
  },
  id: {
    title: 'Kebijakan Privasi',
    subtitle: `Berlaku: ${EFFECTIVE.id} | Daumseseang (bgremover.pics)`,
    sections: [
      { heading: '1. Ikhtisar', body: 'Daumseseang ("Perusahaan") menghargai privasi Anda dan mematuhi hukum perlindungan data yang berlaku. Kebijakan ini menjelaskan cara kami mengumpulkan dan memproses data pribadi saat Anda menggunakan BGRemover.' },
      { heading: '2. Data yang Kami Kumpulkan', body: { cols: ['Kapan', 'Data', 'Tujuan'], rows: [['Login Google', 'Email, nama, foto profil (opsional)', 'Identifikasi akun & layanan'], ['Pembayaran', 'Info pembayaran (diproses Paddle)', 'Pembayaran & pengembalian dana'], ['Penggunaan layanan', 'IP, browser, timestamp', 'Keamanan & pencegahan penyalahgunaan']] } },
      { heading: '3. Penyimpanan', body: ['Data akun: dihapus segera setelah penutupan akun', 'Catatan pembayaran: disimpan 5 tahun sesuai hukum', 'Log akses: dihapus otomatis setelah 3 bulan'] },
      { heading: '4. Berbagi dengan Pihak Ketiga', body: 'Kami tidak menjual atau berbagi data pribadi Anda kepada pihak ketiga, kecuali diwajibkan hukum atau dengan persetujuan Anda.' },
      { heading: '5. Sub-prosesor', body: { cols: ['Vendor', 'Tujuan'], rows: [['Google LLC', 'Autentikasi OAuth'], ['Paddle.com Market Ltd.', 'Pemrosesan pembayaran'], ['Vercel Inc.', 'Hosting layanan'], ['Supabase Inc.', 'Database']] } },
      { heading: '6. Hak Anda', body: [`Anda dapat meminta akses, koreksi, penghapusan, atau pembatasan data Anda kapan saja dengan menghubungi ${CONTACT}. Kami akan merespons dalam 3 hari kerja.`] },
      { heading: '7. Kontak Perlindungan Data', body: ['Nama: Yeonggu Park', 'Jabatan: CEO', `Email: ${CONTACT}`] },
      { heading: '8. Cookie', body: 'Kami menggunakan cookie dan penyimpanan lokal untuk manajemen sesi dan preferensi bahasa. Anda dapat menonaktifkannya di pengaturan browser, meskipun beberapa fitur mungkin terpengaruh.' },
      { heading: '9. Pembaruan Kebijakan', body: 'Kami akan memberi tahu Anda tentang perubahan penting setidaknya 7 hari sebelumnya melalui pemberitahuan layanan atau email.' },
    ],
    note: '※ Gambar yang Anda unggah tidak pernah dikirim ke server kami. Semua pemrosesan AI terjadi secara lokal di browser Anda.',
    footer: `Pertanyaan? Hubungi kami di ${CONTACT}`,
  },
};

function TableBlock({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--bg-border)' }}>
      <table className="w-full text-xs">
        <thead style={{ background: 'var(--bg-raised)' }}>
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--bg-border)' }}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-medium' : ''}`} style={{ color: j === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));
  const c = CONTENT[lang] ?? CONTENT.en;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} dict={dict} />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{c.title}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.subtitle}</p>
          </div>

          <div
            className="mb-8 p-3 rounded-lg text-xs"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
          >
            {c.note}
          </div>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {c.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{s.heading}</h2>
                {typeof s.body === 'string' && <p>{s.body}</p>}
                {Array.isArray(s.body) && (
                  <ul className="space-y-1 list-disc list-inside">
                    {s.body.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
                {typeof s.body === 'object' && !Array.isArray(s.body) && 'cols' in s.body && <TableBlock cols={(s.body as any).cols} rows={(s.body as any).rows} />}
              </section>
            ))}

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
