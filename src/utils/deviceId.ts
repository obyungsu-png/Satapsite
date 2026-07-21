// 브라우저(기기)별 고유 ID — 수강권을 "기기당 1개"로 제한하기 위한 식별자.
// 네이티브 기기 API가 없는 웹 환경이라 완벽한 기기 식별은 불가능하지만,
// localStorage에 UUID를 한 번 생성해 저장해두면 같은 브라우저/기기에서는
// 계속 동일한 값을 쓰게 되어 "이 브라우저 프로필" 단위의 실질적인 기기 구분이 된다.
// (브라우저 데이터 삭제, 시크릿 모드, 다른 브라우저 사용 시에는 새 기기로 인식됨)
const DEVICE_ID_KEY = 'device_id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
