import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));

  const info = [
    { label: '상호', value: '다음세상' },
    { label: '대표자성명', value: '박영구' },
    { label: '사업장 소재지', value: '인천광역시 서구 이음2로 29, 506동 1502호' },
    { label: '유선번호', value: '010-2430-7309' },
    { label: '이메일', value: 'dcbvcd@gmail.com' },
    { label: '사업자등록번호', value: '확인 중 (등록 후 업데이트 예정)' },
    { label: '통신판매업 신고번호', value: '신고 후 업데이트 예정' },
    { label: '서비스 URL', value: 'https://bgremover.pics' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} dict={dict} />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              사업자 정보
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              전자상거래 등에서의 소비자보호에 관한 법률 제10조에 따른 통신판매업자 정보입니다.
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--bg-border)', background: 'var(--bg-surface)' }}
          >
            {info.map(({ label, value }, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center px-6 py-4"
                style={{
                  borderBottom: i < info.length - 1 ? '1px solid var(--bg-border)' : 'none',
                }}
              >
                <span
                  className="text-xs font-semibold w-40 shrink-0 mb-1 sm:mb-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {label}
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-6 p-5 rounded-2xl text-sm space-y-3"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>공정거래위원회 사이버몰 신고 확인</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              통신판매업 신고 확인은 공정거래위원회 사이버몰 사이트에서 조회하실 수 있습니다.
            </p>
            <a
              href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent-gradient)', color: '#fff' }}
            >
              공정거래위원회 사업자 신원 확인 →
            </a>
          </div>

          <div
            className="mt-4 p-5 rounded-2xl text-sm"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}
          >
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>고객센터</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              서비스 이용 문의, 환불 요청, 개인정보 관련 문의는 아래로 연락해 주세요.
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              이메일: <strong style={{ color: 'var(--text-primary)' }}>dcbvcd@gmail.com</strong>
              &nbsp;(영업일 기준 1~3일 내 응답)
            </p>
          </div>
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}
