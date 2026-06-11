// 앱 시작 시 배경제거 모델을 미리 다운로드·캐싱하는 클라이언트 컴포넌트
'use client';

import { useEffect } from 'react';

export function ModelPreloader() {
  useEffect(() => {
    import('@imgly/background-removal').then(({ preload }) => {
      const publicPath = `${window.location.origin}/bgmodel/`;
      preload({ model: 'isnet_quint8', device: 'cpu', publicPath, proxyToWorker: true }).catch(() => {});
    });
  }, []);

  return null;
}
