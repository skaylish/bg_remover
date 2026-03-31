import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const rawDict = await getDictionary(lang);
  const dict = JSON.parse(JSON.stringify(rawDict));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} dict={dict} />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              개인정보처리방침
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              시행일: 2026년 3월 27일 &nbsp;|&nbsp; 다음세상 (bgremover.pics)
            </p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제1조 (총칙)</h2>
              <p>다음세상(이하 "회사")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수합니다. 본 방침은 회사가 제공하는 BGRemover 서비스(이하 "서비스") 이용 시 수집되는 개인정보의 처리에 관한 사항을 규정합니다.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제2조 (수집하는 개인정보 항목 및 수집 방법)</h2>
              <p className="mb-2">회사는 다음과 같은 개인정보를 수집합니다.</p>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--bg-border)' }}>
                <table className="w-full text-xs">
                  <thead style={{ background: 'var(--bg-raised)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>수집 시점</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>수집 항목</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>수집 목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Google 소셜 로그인', '이메일 주소, 이름, 프로필 사진(선택)', '회원 식별 및 서비스 제공'],
                      ['결제 시', '결제 수단 정보(포트원 처리), 결제 금액, 결제일시', '결제 처리 및 환불 대응'],
                      ['서비스 이용 시', '접속 IP, 브라우저 종류, 이용 일시', '서비스 안정성 확보 및 부정 이용 방지'],
                    ].map(([when, items, purpose], i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--bg-border)' }}>
                        <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{when}</td>
                        <td className="px-4 py-3">{items}</td>
                        <td className="px-4 py-3">{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                ※ 업로드하신 이미지는 서버로 전송되지 않으며, 모든 AI 처리는 이용자의 브라우저(로컬)에서만 이루어집니다. 회사는 이미지를 수집하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제3조 (개인정보의 보유 및 이용 기간)</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>회원 정보: 회원 탈퇴 시까지. 탈퇴 후 즉시 삭제.</li>
                <li>결제 기록: 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 <strong>5년</strong> 보관.</li>
                <li>접속 로그: <strong>3개월</strong> 보관 후 자동 삭제.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제4조 (개인정보의 제3자 제공)</h2>
              <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래 경우는 예외입니다.</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령에 의해 또는 수사기관의 적법한 요청이 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제5조 (개인정보 처리 위탁)</h2>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--bg-border)' }}>
                <table className="w-full text-xs">
                  <thead style={{ background: 'var(--bg-raised)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>수탁업체</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-primary)' }}>위탁 업무</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Google LLC', 'OAuth 소셜 로그인 인증 처리'],
                      ['(주)포트원', '결제 처리 및 결제 정보 관리'],
                      ['Vercel Inc.', '서비스 호스팅 및 서버 운영'],
                      ['Supabase Inc.', '데이터베이스 운영'],
                    ].map(([company, task], i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--bg-border)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{company}</td>
                        <td className="px-4 py-3">{task}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제6조 (이용자의 권리 및 행사 방법)</h2>
              <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>개인정보 열람 요구</li>
                <li>오류 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리 정지 요구</li>
              </ul>
              <p className="mt-2">권리 행사는 <strong>dcbvcd@gmail.com</strong>으로 서면, 이메일을 통해 요청하실 수 있으며, 지체 없이 조치하겠습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제7조 (개인정보 보호책임자)</h2>
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>성명:</strong> 박영구</p>
                <p className="mt-1"><strong style={{ color: 'var(--text-primary)' }}>직책:</strong> 대표</p>
                <p className="mt-1"><strong style={{ color: 'var(--text-primary)' }}>이메일:</strong> dcbvcd@gmail.com</p>
                <p className="mt-1"><strong style={{ color: 'var(--text-primary)' }}>전화:</strong> 010-2430-7309</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제8조 (쿠키의 사용)</h2>
              <p>서비스는 로그인 세션 유지 및 언어 설정 저장을 위해 쿠키와 브라우저 로컬스토리지를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 기능 등 일부 서비스 이용에 제한이 있을 수 있습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제9조 (개인정보처리방침의 변경)</h2>
              <p>본 방침이 변경될 경우 변경 사항을 서비스 내 공지사항 또는 이메일을 통해 사전 고지합니다.</p>
            </section>

            <p className="pt-4 text-xs" style={{ color: 'var(--text-subtle)', borderTop: '1px solid var(--bg-border)' }}>
              개인정보 분쟁 조정 및 피해 신고: 개인정보분쟁조정위원회 (www.kopico.go.kr / 1833-6972), 개인정보침해 신고센터 (privacy.kisa.or.kr / 국번없이 118)
            </p>
          </div>
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}
