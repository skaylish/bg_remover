// 앱 시작 시 배경제거 모델을 미리 다운로드·캐싱하는 클라이언트 컴포넌트
'use client';

import { useEffect } from 'react';

export function ModelPreloader() {
  useEffect(() => {
    import('@imgly/background-removal').then(({ preload }) => {
      preload({ model: 'isnet', device: 'gpu', proxyToWorker: true }).catch(() => {
        // GPU 실패 시 CPU fallback으로 재시도
        preload({ model: 'isnet', device: 'cpu', proxyToWorker: true }).catch(() => {});
      });
    });
  }, []);

  return null;
}
