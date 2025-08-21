module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // 성능을 위한 최소한의 규칙만 적용
    "no-unused-vars": "warn",
    "no-console": "off", // 백엔드에서는 console.log 허용
    "no-undef": "error",
  },
  // 성능 최적화: node_modules 제외
  ignorePatterns: ["node_modules/", "dist/", "build/", "coverage/", "*.min.js"],
};
