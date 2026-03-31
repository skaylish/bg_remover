import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/landing/Footer';
import { getDictionary } from '@/dictionaries';

export default async function TermsPage({
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
              이용약관
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              시행일: 2026년 3월 27일 &nbsp;|&nbsp; 다음세상 (bgremover.pics)
            </p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제1조 (목적)</h2>
              <p>이 약관은 다음세상(이하 "회사")이 운영하는 BGRemover 서비스(bgremover.pics, 이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제2조 (정의)</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong style={{ color: 'var(--text-primary)' }}>서비스</strong>: 회사가 제공하는 AI 기반 이미지 배경 제거 및 편집 서비스</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>이용자</strong>: 본 약관에 동의하고 서비스를 이용하는 자</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>회원</strong>: Google 계정으로 로그인하여 크레딧 등 서비스를 이용하는 자</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>크레딧</strong>: 고해상도 이미지 다운로드에 사용되는 서비스 내 가상 화폐</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제3조 (약관의 효력 및 변경)</h2>
              <p>본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경 시 7일 전 공지합니다. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제4조 (서비스의 내용)</h2>
              <ul className="space-y-1 list-disc list-inside">
                <li>AI 기반 이미지 배경 자동 제거 (브라우저 로컬 처리)</li>
                <li>배경 편집 및 합성 기능</li>
                <li>저해상도(미리보기) 다운로드: 무료, 로그인 불필요</li>
                <li>고해상도 다운로드: 크레딧 1개 차감</li>
                <li>일괄 처리(배치): 비즈니스 플랜 이상</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제5조 (크레딧 정책)</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>크레딧은 월 정기 구독으로 지급됩니다.</li>
                <li>미사용 크레딧은 다음 달로 이월됩니다.</li>
                <li>크레딧은 타인에게 양도할 수 없습니다.</li>
                <li>회원 탈퇴 시 잔여 크레딧은 소멸됩니다.</li>
                <li>엔터프라이즈 플랜은 월 무제한 생성이 가능합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제6조 (이용자의 의무)</h2>
              <p className="mb-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>타인의 정보 도용 또는 무단 사용</li>
                <li>서비스 운영을 방해하는 행위(크롤링, 자동화 요청 등)</li>
                <li>저작권·초상권 등 타인의 권리를 침해하는 이미지 처리</li>
                <li>음란물, 폭력적 콘텐츠 등 불법 이미지 처리</li>
                <li>서비스를 통해 처리한 결과물의 무단 상업적 재판매</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제7조 (지식재산권)</h2>
              <p>서비스 내 소프트웨어, UI, 브랜드 요소의 저작권은 회사에 귀속됩니다. 이용자가 업로드하고 처리한 이미지의 저작권은 이용자에게 귀속되며, 회사는 해당 이미지를 수집하거나 보관하지 않습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제8조 (서비스 중단)</h2>
              <p>회사는 설비 점검, 천재지변, 기술적 문제 등 불가피한 사유로 서비스를 일시 중단할 수 있습니다. 예정된 중단의 경우 사전 공지하며, 긴급한 경우 사후 공지할 수 있습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제9조 (책임 제한)</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>서비스는 AI 기반 처리 결과의 정확성을 보장하지 않습니다.</li>
                <li>이용자의 기기 성능·브라우저 환경으로 인한 문제에 대해 회사는 책임지지 않습니다.</li>
                <li>이용자가 업로드한 이미지 내용으로 발생한 법적 분쟁은 이용자 책임입니다.</li>
                <li>회사의 고의 또는 중과실이 없는 한, 서비스 이용으로 발생한 손해에 대한 책임은 구독료 납부액을 한도로 합니다.</li>
              </ul>
            </section>

            {/* 환불정책 */}
            <section className="p-6 rounded-2xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                제10조 (환불 정책)
              </h2>
              <p className="mb-4">회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에 따라 다음과 같이 환불 정책을 운영합니다.</p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>✅ 전액 환불 가능</h3>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>결제일로부터 <strong style={{ color: 'var(--text-primary)' }}>7일 이내</strong>, <strong style={{ color: 'var(--text-primary)' }}>크레딧을 전혀 사용하지 않은 경우</strong></li>
                    <li>서비스 오류로 인해 정상적인 이용이 불가능한 경우 (회사 귀책)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🔄 부분 환불</h3>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>결제일로부터 7일 이내, 일부 크레딧 사용 시: <strong style={{ color: 'var(--text-primary)' }}>잔여 크레딧 비율에 따라 비례 환불</strong></li>
                    <li>예: 100크레딧 중 30 사용 시 → 구독료의 70% 환불</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#f87171)' }}>❌ 환불 불가</h3>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>결제일로부터 <strong style={{ color: 'var(--text-primary)' }}>7일 초과</strong> 경과 후</li>
                    <li>당월 지급된 크레딧을 <strong style={{ color: 'var(--text-primary)' }}>전부 사용한 경우</strong></li>
                    <li>이용자의 약관 위반으로 인한 강제 해지</li>
                    <li>이월된 크레딧 (전월 미사용분)</li>
                  </ul>
                </div>
              </div>

              <p className="mt-4 text-xs p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>
                환불 요청: <strong>dcbvcd@gmail.com</strong>으로 결제 이메일, 결제일, 환불 사유를 기재하여 문의주시면 영업일 3일 이내 처리해 드립니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>제11조 (분쟁 해결)</h2>
              <p>서비스 이용과 관련하여 회사와 이용자 간 분쟁이 발생한 경우, 쌍방 합의를 우선으로 하며, 합의되지 않을 경우 「소비자기본법」에 따른 소비자분쟁조정위원회에 조정을 신청할 수 있습니다. 소송의 경우 민사소송법상의 관할 법원에 제소합니다.</p>
            </section>

            <p className="pt-4 text-xs" style={{ color: 'var(--text-subtle)', borderTop: '1px solid var(--bg-border)' }}>
              사업자: 다음세상 &nbsp;|&nbsp; 대표자: 박영구 &nbsp;|&nbsp; 주소: 인천광역시 서구 이음2로 29, 506동 1502호 &nbsp;|&nbsp; 이메일: dcbvcd@gmail.com
            </p>
          </div>
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}
