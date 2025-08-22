// Windows 성능 극대화 lint-staged 설정 (v13+ 호환)
module.exports = {
  // 성능 최적화: 극한 최적화 옵션
  '*.{js,ts,tsx,jsx,json,md}': [
    'prettier --write --cache --cache-location=.prettierCache --cache-strategy metadata --ignore-unknown --no-error-on-unmatched-pattern --log-level silent',
  ],
};
