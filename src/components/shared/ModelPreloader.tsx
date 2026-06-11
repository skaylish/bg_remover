// 앱 시작 시 배경제거 모델(RMBG-1.4)을 미리 다운로드·초기화하는 클라이언트 컴포넌트
'use client';

import { useEffect } from 'react';
import { preloadBgModel } from '@/lib/bgRemoval';

export function ModelPreloader() {
  useEffect(() => {
    preloadBgModel();
  }, []);

  return null;
}
