// 이용약관 다국어 페이지 (ko/en/ja/es/id)
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

type Lang = 'ko' | 'en' | 'ja' | 'es' | 'id';

interface TermsContent {
  title: string;
  effective: string;
  sections: { heading: string; body: string | string[] }[];
  creditPolicy: {
    heading: string;
    items: string[];
  };
  refundPolicy: {
    heading: string;
    intro: string;
    full: { label: string; items: string[] };
    partial: { label: string; items: string[] };
    none: { label: string; items: string[] };
    contact: string;
  };
  dispute: { heading: string; body: string };
  footer: string;
}

const CONTENT: Record<Lang, TermsContent> = {
  ko: {
    title: '이용약관',
    effective: '시행일: 2026년 3월 27일 | 다음세상 (bgremover.pics)',
    sections: [
      {
        heading: '제1조 (목적)',
        body: '이 약관은 다음세상(이하 "회사")이 운영하는 BGRemover 서비스(bgremover.pics, 이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.',
      },
      {
        heading: '제2조 (정의)',
        body: [
          '서비스: 회사가 제공하는 AI 기반 이미지 배경 제거 및 편집 서비스',
          '이용자: 본 약관에 동의하고 서비스를 이용하는 자',
          '회원: Google 계정으로 로그인하여 크레딧 등 서비스를 이용하는 자',
          '크레딧: 고해상도 이미지 다운로드에 사용되는 서비스 내 가상 화폐',
        ],
      },
      {
        heading: '제3조 (약관의 효력 및 변경)',
        body: '본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경 시 7일 전 공지합니다. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.',
      },
      {
        heading: '제4조 (서비스의 내용)',
        body: [
          'AI 기반 이미지 배경 자동 제거 (브라우저 로컬 처리)',
          '배경 편집 및 합성 기능',
          '저해상도(미리보기) 다운로드: 무료, 로그인 불필요',
          '고해상도 다운로드: 크레딧 1개 차감',
          '일괄 처리(배치): Business 플랜 이상',
        ],
      },
      {
        heading: '제6조 (이용자의 의무)',
        body: [
          '타인의 정보 도용 또는 무단 사용',
          '서비스 운영을 방해하는 행위(크롤링, 자동화 요청 등)',
          '저작권·초상권 등 타인의 권리를 침해하는 이미지 처리',
          '음란물, 폭력적 콘텐츠 등 불법 이미지 처리',
          '서비스를 통해 처리한 결과물의 무단 상업적 재판매',
        ],
      },
      {
        heading: '제7조 (지식재산권)',
        body: '서비스 내 소프트웨어, UI, 브랜드 요소의 저작권은 회사에 귀속됩니다. 이용자가 업로드하고 처리한 이미지의 저작권은 이용자에게 귀속되며, 회사는 해당 이미지를 수집하거나 보관하지 않습니다.',
      },
      {
        heading: '제8조 (서비스 중단)',
        body: '회사는 설비 점검, 천재지변, 기술적 문제 등 불가피한 사유로 서비스를 일시 중단할 수 있습니다. 예정된 중단의 경우 사전 공지하며, 긴급한 경우 사후 공지할 수 있습니다.',
      },
      {
        heading: '제9조 (책임 제한)',
        body: [
          '서비스는 AI 기반 처리 결과의 정확성을 보장하지 않습니다.',
          '이용자의 기기 성능·브라우저 환경으로 인한 문제에 대해 회사는 책임지지 않습니다.',
          '이용자가 업로드한 이미지 내용으로 발생한 법적 분쟁은 이용자 책임입니다.',
          '회사의 고의 또는 중과실이 없는 한, 서비스 이용으로 발생한 손해에 대한 책임은 구독료 납부액을 한도로 합니다.',
        ],
      },
    ],
    creditPolicy: {
      heading: '제5조 (크레딧 정책)',
      items: [
        '크레딧은 월 정기 구독으로 지급됩니다.',
        '미사용 크레딧은 매월 갱신 시 초기화됩니다 (이월 없음).',
        '크레딧은 타인에게 양도할 수 없습니다.',
        '회원 탈퇴 시 잔여 크레딧은 소멸됩니다.',
        '엔터프라이즈 플랜은 월 무제한 생성이 가능합니다.',
        '1회 충전(Topup) 크레딧은 만료일 없이 유지됩니다.',
      ],
    },
    refundPolicy: {
      heading: '제10조 (환불 정책)',
      intro: '회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에 따라 다음과 같이 환불 정책을 운영합니다.',
      full: {
        label: '✅ 전액 환불 가능',
        items: [
          '결제일로부터 14일 이내, 크레딧을 전혀 사용하지 않은 경우',
          '서비스 오류로 인해 정상적인 이용이 불가능한 경우 (회사 귀책)',
        ],
      },
      partial: {
        label: '🔄 부분 환불',
        items: [
          '결제일로부터 14일 이내, 일부 크레딧 사용 시: 잔여 크레딧 비율에 따라 비례 환불',
          '예: 100크레딧 중 30 사용 시 → 구독료의 70% 환불',
        ],
      },
      none: {
        label: '❌ 환불 불가',
        items: [
          '결제일로부터 14일 초과 경과 후',
          '당월 지급된 크레딧을 전부 사용한 경우',
          '이용자의 약관 위반으로 인한 강제 해지',
        ],
      },
      contact: '환불 요청: dcbvcd@gmail.com으로 결제 이메일, 결제일, 환불 사유를 기재하여 문의주시면 영업일 3일 이내 처리해 드립니다.',
    },
    dispute: {
      heading: '제11조 (분쟁 해결)',
      body: '서비스 이용과 관련하여 회사와 이용자 간 분쟁이 발생한 경우, 쌍방 합의를 우선으로 하며, 합의되지 않을 경우 「소비자기본법」에 따른 소비자분쟁조정위원회에 조정을 신청할 수 있습니다.',
    },
    footer: '사업자: 다음세상 | 대표자: 박영구 | 주소: 인천광역시 서구 이음2로 29, 506동 1502호 | 이메일: dcbvcd@gmail.com',
  },

  en: {
    title: 'Terms of Service',
    effective: 'Effective: March 27, 2026 | Daumseseang (bgremover.pics)',
    sections: [
      {
        heading: 'Article 1 (Purpose)',
        body: 'These Terms of Service govern the rights, obligations, and responsibilities between Daumseseang ("Company") and users of the BGRemover service (bgremover.pics, the "Service").',
      },
      {
        heading: 'Article 2 (Definitions)',
        body: [
          'Service: The AI-powered image background removal and editing service provided by the Company.',
          'User: Any person who agrees to these Terms and uses the Service.',
          'Member: A registered user who logs in via Google and uses credits and other Service features.',
          'Credit: Virtual currency within the Service used for HD image downloads.',
        ],
      },
      {
        heading: 'Article 3 (Effectiveness and Amendment)',
        body: 'These Terms take effect upon publication on the Service. The Company may amend these Terms with at least 7 days\' advance notice. Users who do not agree to amendments may discontinue use and request account deletion.',
      },
      {
        heading: 'Article 4 (Service Description)',
        body: [
          'AI-based automatic background removal (processed locally in your browser)',
          'Background editing and compositing tools',
          'Low-resolution preview downloads: free, no login required',
          'High-resolution downloads: 1 credit per image',
          'Batch processing: Business plan and above',
        ],
      },
      {
        heading: 'Article 6 (User Obligations)',
        body: [
          'Do not impersonate or misuse another person\'s information.',
          'Do not interfere with Service operations (e.g., scraping, automated requests).',
          'Do not process images that infringe copyrights, portrait rights, or other third-party rights.',
          'Do not process illegal images such as obscene or violent content.',
          'Do not commercially resell processed results without authorization.',
        ],
      },
      {
        heading: 'Article 7 (Intellectual Property)',
        body: 'All software, UI, and brand elements of the Service are owned by the Company. Copyright of images uploaded and processed by users belongs to the respective user. The Company does not collect or store user images.',
      },
      {
        heading: 'Article 8 (Service Interruption)',
        body: 'The Company may temporarily suspend the Service for maintenance, force majeure, or technical issues. Planned interruptions will be announced in advance; emergency interruptions may be announced afterward.',
      },
      {
        heading: 'Article 9 (Limitation of Liability)',
        body: [
          'The Company does not guarantee the accuracy of AI-based processing results.',
          'The Company is not responsible for issues caused by the user\'s device or browser environment.',
          'Users are solely responsible for any legal disputes arising from the content of images they upload.',
          'Absent gross negligence or willful misconduct by the Company, liability is capped at the amount paid for the current subscription period.',
        ],
      },
    ],
    creditPolicy: {
      heading: 'Article 5 (Credit Policy)',
      items: [
        'Credits are granted monthly through an active subscription.',
        'Unused credits are reset at the start of each renewal period (no rollover).',
        'Credits are non-transferable.',
        'Remaining credits are forfeited upon account deletion.',
        'The Enterprise plan provides unlimited monthly generations.',
        'One-time Topup credits do not expire.',
      ],
    },
    refundPolicy: {
      heading: 'Article 10 (Refund Policy)',
      intro: 'The Company operates the following refund policy in accordance with applicable consumer protection law.',
      full: {
        label: '✅ Full Refund',
        items: [
          'Within 14 days of payment, if no credits have been used.',
          'Service is unavailable due to a Company-attributable error.',
        ],
      },
      partial: {
        label: '🔄 Partial Refund',
        items: [
          'Within 14 days of payment, if some credits have been used: prorated refund based on remaining credits.',
          'Example: 30 of 100 credits used → 70% of subscription fee refunded.',
        ],
      },
      none: {
        label: '❌ No Refund',
        items: [
          'More than 14 days have passed since payment.',
          'All credits granted for the current period have been used.',
          'Account terminated due to violation of these Terms.',
        ],
      },
      contact: 'To request a refund, email dcbvcd@gmail.com with your payment email, payment date, and reason. We process requests within 3 business days.',
    },
    dispute: {
      heading: 'Article 11 (Dispute Resolution)',
      body: 'In the event of a dispute, the parties shall first seek resolution through mutual agreement. If unresolved, either party may seek mediation or bring the matter before a court of competent jurisdiction.',
    },
    footer: 'Company: Daumseseang | CEO: Yeonggu Park | Address: 506-1502, 29 Ieum 2-ro, Seo-gu, Incheon, Republic of Korea | Email: dcbvcd@gmail.com',
  },

  ja: {
    title: '利用規約',
    effective: '施行日: 2026年3月27日 | ダウムセサン (bgremover.pics)',
    sections: [
      {
        heading: '第1条（目的）',
        body: '本規約は、ダウムセサン（以下「会社」）が運営するBGRemoverサービス（bgremover.pics、以下「サービス」）の利用に関して、会社とユーザー間の権利・義務・責任事項を定めることを目的とします。',
      },
      {
        heading: '第2条（定義）',
        body: [
          'サービス: 会社が提供するAI技術を用いた画像背景除去・編集サービス',
          'ユーザー: 本規約に同意しサービスを利用する方',
          '会員: Googleアカウントでログインし、クレジット等を利用する方',
          'クレジット: 高解像度画像のダウンロードに使用するサービス内仮想通貨',
        ],
      },
      {
        heading: '第3条（規約の効力および変更）',
        body: '本規約はサービス上に掲示することで効力を生じます。会社は必要に応じて規約を変更でき、変更の7日前に告知します。変更後の規約に同意しない場合、サービスの利用を停止し退会を申請できます。',
      },
      {
        heading: '第4条（サービスの内容）',
        body: [
          'AI技術による画像背景自動除去（ブラウザでローカル処理）',
          '背景編集・合成機能',
          '低解像度（プレビュー）ダウンロード: 無料・ログイン不要',
          '高解像度ダウンロード: 1クレジット消費',
          'バッチ処理: Businessプラン以上',
        ],
      },
      {
        heading: '第6条（ユーザーの義務）',
        body: [
          '他人の情報の盗用または無断使用の禁止',
          'クロール・自動リクエスト等、サービス運営を妨害する行為の禁止',
          '著作権・肖像権等の他者の権利を侵害する画像処理の禁止',
          'わいせつ・暴力等の違法コンテンツの処理禁止',
          'サービスで処理した結果物の無断商業的再販の禁止',
        ],
      },
      {
        heading: '第7条（知的財産権）',
        body: 'サービス内のソフトウェア、UI、ブランド要素の著作権は会社に帰属します。ユーザーがアップロード・処理した画像の著作権はユーザーに帰属し、会社は当該画像を収集・保管しません。',
      },
      {
        heading: '第8条（サービスの中断）',
        body: '会社は設備点検、天変地異、技術的問題等やむを得ない事情によりサービスを一時中断することがあります。予定された中断は事前告知し、緊急の場合は事後告知することがあります。',
      },
      {
        heading: '第9条（責任制限）',
        body: [
          'AI処理結果の正確性を保証しません。',
          'ユーザーのデバイスやブラウザ環境に起因する問題について会社は責任を負いません。',
          'ユーザーがアップロードした画像内容に起因する法的紛争はユーザーの責任です。',
          '会社の故意または重過失がない限り、損害賠償責任は当該期間の利用料金を上限とします。',
        ],
      },
    ],
    creditPolicy: {
      heading: '第5条（クレジットポリシー）',
      items: [
        'クレジットは月次サブスクリプションにより付与されます。',
        '未使用クレジットは毎月の更新時にリセットされます（繰り越しなし）。',
        'クレジットは他者に譲渡できません。',
        '退会時に残余クレジットは消滅します。',
        'Enterpriseプランは月間無制限生成が可能です。',
        '1回チャージ（Topup）クレジットに有効期限はありません。',
      ],
    },
    refundPolicy: {
      heading: '第10条（返金ポリシー）',
      intro: '会社は消費者保護法に基づき、以下の返金ポリシーを運営します。',
      full: {
        label: '✅ 全額返金',
        items: [
          '決済日から14日以内、かつクレジットを一切使用していない場合',
          '会社の帰責事由によりサービスが正常に利用できない場合',
        ],
      },
      partial: {
        label: '🔄 部分返金',
        items: [
          '決済日から14日以内、一部クレジットを使用した場合: 残余クレジット比率に応じた按分返金',
          '例: 100クレジット中30使用 → 購読料の70%を返金',
        ],
      },
      none: {
        label: '❌ 返金不可',
        items: [
          '決済日から14日超経過後',
          '当月付与クレジットをすべて使用した場合',
          '規約違反による強制解約の場合',
        ],
      },
      contact: '返金申請: dcbvcd@gmail.comに決済メールアドレス・決済日・理由をご記載ください。3営業日以内に対応いたします。',
    },
    dispute: {
      heading: '第11条（紛争解決）',
      body: 'サービス利用に関して紛争が生じた場合、まず双方の合意による解決を試みます。解決しない場合、管轄裁判所に提訴することができます。',
    },
    footer: '事業者: ダウムセサン | 代表: パク・ヨングク | 住所: 仁川広域市 西区 イウム2路29, 506棟1502号 | メール: dcbvcd@gmail.com',
  },

  es: {
    title: 'Términos de Servicio',
    effective: 'En vigor desde: 27 de marzo de 2026 | Daumseseang (bgremover.pics)',
    sections: [
      {
        heading: 'Artículo 1 (Objeto)',
        body: 'Estos Términos de Servicio regulan los derechos, obligaciones y responsabilidades entre Daumseseang ("Empresa") y los usuarios del servicio BGRemover (bgremover.pics, el "Servicio").',
      },
      {
        heading: 'Artículo 2 (Definiciones)',
        body: [
          'Servicio: Servicio de eliminación y edición de fondos de imágenes mediante IA proporcionado por la Empresa.',
          'Usuario: Cualquier persona que acepte estos Términos y use el Servicio.',
          'Miembro: Usuario registrado que inicia sesión con Google y usa créditos y otras funciones del Servicio.',
          'Crédito: Moneda virtual dentro del Servicio usada para descargar imágenes en alta resolución.',
        ],
      },
      {
        heading: 'Artículo 3 (Vigencia y Modificación)',
        body: 'Estos Términos entran en vigor al publicarse en el Servicio. La Empresa puede modificarlos con al menos 7 días de aviso previo. Si no acepta los cambios, puede dejar de usar el Servicio y solicitar la eliminación de su cuenta.',
      },
      {
        heading: 'Artículo 4 (Descripción del Servicio)',
        body: [
          'Eliminación automática de fondos con IA (procesado localmente en el navegador)',
          'Herramientas de edición y composición de fondos',
          'Descargas en baja resolución (vista previa): gratuitas, sin necesidad de registro',
          'Descargas en alta resolución: 1 crédito por imagen',
          'Procesamiento por lotes: Plan Business o superior',
        ],
      },
      {
        heading: 'Artículo 6 (Obligaciones del Usuario)',
        body: [
          'No usurpar ni usar sin autorización la información de terceros.',
          'No interferir con las operaciones del Servicio (p.ej., scraping, solicitudes automatizadas).',
          'No procesar imágenes que infrinjan derechos de autor, derechos de imagen u otros derechos de terceros.',
          'No procesar contenido ilegal, obsceno o violento.',
          'No revender comercialmente los resultados procesados sin autorización.',
        ],
      },
      {
        heading: 'Artículo 7 (Propiedad Intelectual)',
        body: 'El software, la interfaz y los elementos de marca del Servicio son propiedad de la Empresa. Los derechos de autor de las imágenes cargadas y procesadas por los usuarios pertenecen a dichos usuarios. La Empresa no recopila ni almacena imágenes de usuarios.',
      },
      {
        heading: 'Artículo 8 (Interrupción del Servicio)',
        body: 'La Empresa puede suspender temporalmente el Servicio por mantenimiento, fuerza mayor o problemas técnicos. Las interrupciones planificadas se anunciarán con antelación; las de emergencia podrán notificarse con posterioridad.',
      },
      {
        heading: 'Artículo 9 (Limitación de Responsabilidad)',
        body: [
          'La Empresa no garantiza la exactitud de los resultados del procesamiento con IA.',
          'La Empresa no es responsable de problemas derivados del dispositivo o navegador del usuario.',
          'Los usuarios son exclusivamente responsables de las disputas legales derivadas del contenido de las imágenes que suben.',
          'Salvo negligencia grave o dolo de la Empresa, la responsabilidad se limita al importe abonado en el período de suscripción vigente.',
        ],
      },
    ],
    creditPolicy: {
      heading: 'Artículo 5 (Política de Créditos)',
      items: [
        'Los créditos se otorgan mensualmente con una suscripción activa.',
        'Los créditos no utilizados se reinician al comienzo de cada período de renovación (sin acumulación).',
        'Los créditos no son transferibles.',
        'Los créditos restantes se perderán al eliminar la cuenta.',
        'El plan Enterprise incluye generaciones ilimitadas al mes.',
        'Los créditos Topup de pago único no caducan.',
      ],
    },
    refundPolicy: {
      heading: 'Artículo 10 (Política de Reembolsos)',
      intro: 'La Empresa aplica la siguiente política de reembolsos conforme a la legislación de protección al consumidor aplicable.',
      full: {
        label: '✅ Reembolso Total',
        items: [
          'Dentro de los 14 días posteriores al pago, si no se ha utilizado ningún crédito.',
          'El Servicio no está disponible por causas imputables a la Empresa.',
        ],
      },
      partial: {
        label: '🔄 Reembolso Parcial',
        items: [
          'Dentro de los 14 días posteriores al pago, si se han utilizado algunos créditos: reembolso proporcional según los créditos restantes.',
          'Ejemplo: 30 de 100 créditos usados → reembolso del 70% de la cuota.',
        ],
      },
      none: {
        label: '❌ Sin Reembolso',
        items: [
          'Han transcurrido más de 14 días desde el pago.',
          'Se han consumido todos los créditos del período actual.',
          'La cuenta fue cancelada por infracción de estos Términos.',
        ],
      },
      contact: 'Para solicitar un reembolso, envíe un correo a dcbvcd@gmail.com indicando su correo de pago, fecha de pago y motivo. Tramitaremos su solicitud en un plazo de 3 días hábiles.',
    },
    dispute: {
      heading: 'Artículo 11 (Resolución de Conflictos)',
      body: 'Ante cualquier disputa, las partes intentarán resolverla mediante acuerdo mutuo. En caso de no lograrlo, cualquiera de las partes podrá acudir a mediación o a la jurisdicción competente.',
    },
    footer: 'Empresa: Daumseseang | CEO: Yeonggu Park | Dirección: 506-1502, 29 Ieum 2-ro, Seo-gu, Incheon, República de Corea | Email: dcbvcd@gmail.com',
  },

  id: {
    title: 'Syarat Layanan',
    effective: 'Berlaku: 27 Maret 2026 | Daumseseang (bgremover.pics)',
    sections: [
      {
        heading: 'Pasal 1 (Tujuan)',
        body: 'Syarat Layanan ini mengatur hak, kewajiban, dan tanggung jawab antara Daumseseang ("Perusahaan") dan pengguna layanan BGRemover (bgremover.pics, "Layanan").',
      },
      {
        heading: 'Pasal 2 (Definisi)',
        body: [
          'Layanan: Layanan penghapusan dan pengeditan latar belakang gambar berbasis AI yang disediakan Perusahaan.',
          'Pengguna: Siapa pun yang menyetujui Syarat ini dan menggunakan Layanan.',
          'Anggota: Pengguna terdaftar yang masuk dengan Google dan menggunakan kredit serta fitur Layanan lainnya.',
          'Kredit: Mata uang virtual dalam Layanan yang digunakan untuk mengunduh gambar resolusi tinggi.',
        ],
      },
      {
        heading: 'Pasal 3 (Pemberlakuan dan Perubahan)',
        body: 'Syarat ini berlaku sejak dipublikasikan di Layanan. Perusahaan dapat mengubah Syarat ini dengan pemberitahuan minimal 7 hari sebelumnya. Jika Anda tidak menyetujui perubahan, Anda dapat berhenti menggunakan Layanan dan meminta penghapusan akun.',
      },
      {
        heading: 'Pasal 4 (Deskripsi Layanan)',
        body: [
          'Penghapusan latar belakang otomatis berbasis AI (diproses secara lokal di browser)',
          'Alat pengeditan dan komposisi latar belakang',
          'Unduhan resolusi rendah (pratinjau): gratis, tanpa login',
          'Unduhan resolusi tinggi: 1 kredit per gambar',
          'Pemrosesan massal: Paket Business ke atas',
        ],
      },
      {
        heading: 'Pasal 6 (Kewajiban Pengguna)',
        body: [
          'Dilarang menyamar atau menggunakan informasi orang lain tanpa izin.',
          'Dilarang mengganggu operasional Layanan (mis. scraping, permintaan otomatis).',
          'Dilarang memproses gambar yang melanggar hak cipta, hak potret, atau hak pihak ketiga lainnya.',
          'Dilarang memproses konten ilegal, cabul, atau mengandung kekerasan.',
          'Dilarang menjual kembali hasil pemrosesan secara komersial tanpa izin.',
        ],
      },
      {
        heading: 'Pasal 7 (Kekayaan Intelektual)',
        body: 'Perangkat lunak, antarmuka, dan elemen merek Layanan adalah milik Perusahaan. Hak cipta atas gambar yang diunggah dan diproses oleh pengguna tetap menjadi milik pengguna. Perusahaan tidak mengumpulkan atau menyimpan gambar pengguna.',
      },
      {
        heading: 'Pasal 8 (Gangguan Layanan)',
        body: 'Perusahaan dapat menangguhkan Layanan sementara karena pemeliharaan, force majeure, atau masalah teknis. Gangguan terjadwal akan diumumkan sebelumnya; gangguan darurat dapat diumumkan setelahnya.',
      },
      {
        heading: 'Pasal 9 (Batasan Tanggung Jawab)',
        body: [
          'Perusahaan tidak menjamin keakuratan hasil pemrosesan berbasis AI.',
          'Perusahaan tidak bertanggung jawab atas masalah yang disebabkan oleh perangkat atau browser pengguna.',
          'Pengguna sepenuhnya bertanggung jawab atas sengketa hukum yang timbul dari konten gambar yang mereka unggah.',
          'Kecuali karena kelalaian berat atau kesengajaan Perusahaan, kewajiban ganti rugi dibatasi hingga jumlah yang dibayar untuk periode berlangganan yang berlaku.',
        ],
      },
    ],
    creditPolicy: {
      heading: 'Pasal 5 (Kebijakan Kredit)',
      items: [
        'Kredit diberikan setiap bulan melalui langganan aktif.',
        'Kredit yang tidak terpakai akan direset pada awal setiap periode pembaruan (tidak ada rollover).',
        'Kredit tidak dapat dipindahtangankan.',
        'Kredit yang tersisa akan hangus saat akun dihapus.',
        'Paket Enterprise menyediakan pembuatan tak terbatas per bulan.',
        'Kredit Topup sekali bayar tidak memiliki masa kedaluwarsa.',
      ],
    },
    refundPolicy: {
      heading: 'Pasal 10 (Kebijakan Pengembalian Dana)',
      intro: 'Perusahaan menerapkan kebijakan pengembalian dana berikut sesuai dengan hukum perlindungan konsumen yang berlaku.',
      full: {
        label: '✅ Pengembalian Dana Penuh',
        items: [
          'Dalam 14 hari setelah pembayaran, jika tidak ada kredit yang digunakan.',
          'Layanan tidak tersedia karena kesalahan yang dapat diatribusikan kepada Perusahaan.',
        ],
      },
      partial: {
        label: '🔄 Pengembalian Dana Sebagian',
        items: [
          'Dalam 14 hari setelah pembayaran, jika sebagian kredit telah digunakan: pengembalian dana prorata berdasarkan kredit yang tersisa.',
          'Contoh: 30 dari 100 kredit digunakan → 70% biaya langganan dikembalikan.',
        ],
      },
      none: {
        label: '❌ Tidak Ada Pengembalian Dana',
        items: [
          'Lebih dari 14 hari telah berlalu sejak pembayaran.',
          'Semua kredit yang diberikan untuk periode saat ini telah digunakan.',
          'Akun dihentikan karena pelanggaran Syarat ini.',
        ],
      },
      contact: 'Untuk mengajukan pengembalian dana, kirim email ke dcbvcd@gmail.com dengan mencantumkan email pembayaran, tanggal pembayaran, dan alasan. Kami memproses permintaan dalam 3 hari kerja.',
    },
    dispute: {
      heading: 'Pasal 11 (Penyelesaian Sengketa)',
      body: 'Jika terjadi sengketa, para pihak terlebih dahulu berupaya menyelesaikannya melalui kesepakatan bersama. Jika tidak terselesaikan, salah satu pihak dapat mengajukan mediasi atau membawa perkara ke pengadilan yang berwenang.',
    },
    footer: 'Perusahaan: Daumseseang | CEO: Yeonggu Park | Alamat: 506-1502, 29 Ieum 2-ro, Seo-gu, Incheon, Republik Korea | Email: dcbvcd@gmail.com',
  },
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));
  const c = CONTENT[(lang as Lang)] ?? CONTENT.en;

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

            {/* Sections before credit policy */}
            {c.sections.slice(0, 4).map((s) => (
              <section key={s.heading}>
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{s.heading}</h2>
                {Array.isArray(s.body) ? (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {s.body.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p>{s.body}</p>
                )}
              </section>
            ))}

            {/* Credit policy */}
            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.creditPolicy.heading}</h2>
              <ul className="space-y-1.5 list-disc list-inside">
                {c.creditPolicy.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            {/* Remaining sections */}
            {c.sections.slice(4).map((s) => (
              <section key={s.heading}>
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{s.heading}</h2>
                {Array.isArray(s.body) ? (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {s.body.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p>{s.body}</p>
                )}
              </section>
            ))}

            {/* Refund policy */}
            <section className="p-6 rounded-2xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {c.refundPolicy.heading}
              </h2>
              <p className="mb-4">{c.refundPolicy.intro}</p>

              <div className="space-y-4">
                {[c.refundPolicy.full, c.refundPolicy.partial, c.refundPolicy.none].map((block) => (
                  <div key={block.label} className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{block.label}</h3>
                    <ul className="space-y-1 list-disc list-inside text-xs">
                      {block.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>
                {c.refundPolicy.contact}
              </p>
            </section>

            {/* Dispute */}
            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.dispute.heading}</h2>
              <p>{c.dispute.body}</p>
            </section>

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
