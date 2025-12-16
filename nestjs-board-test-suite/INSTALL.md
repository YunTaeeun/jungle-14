# NPM 패키지 배포 가이드

## ✅ 현재 상태

패키지 구조가 완성되었습니다!

```
nestjs-board-test-suite/
├── package.json
├── README.md
├── INSTALL.md (이 파일)
└── tests/
    ├── auth/
    │   ├── auth.service.spec.ts
    │   └── auth.controller.spec.ts
    ├── users/
    │   ├── users.service.spec.ts
    │   └── users.controller.spec.ts
    ├── posts/
    │   ├── posts.service.spec.ts
    │   └── posts.controller.spec.ts
    └── comments/
        ├── comments.service.spec.ts
        └── comments.controller.spec.ts
```

---

## 🚀 npm에 배포하는 방법

### 1. npm 계정 생성 (처음 한 번만)

```bash
# npmjs.com에서 계정생성
https://www.npmjs.com/signup

# 또는 터미널에서
npm adduser
```

### 2. npm 로그인

```bash
npm login
```

아이디, 비밀번호, 이메일 입력

### 3. package.json 수정

`package.json`에서 다음을 수정:

```json
{
  "name": "@your-username/nestjs-board-test-suite",
  // ↑ your-username을 npm 계정명으로 변경
  
  "author": "Your Name",
  // ↑ 본인 이름으로 변경
  
  "repository": {
    "url": "https://github.com/your-username/nestjs-board-test-suite.git"
  }
  // ↑ GitHub 주소로 변경 (선택사항)
}
```

### 4. 패키지 배포

```bash
cd nestjs-board-test-suite
npm publish --access public
```

**주의**: `@your-username` 형태의 scoped package는 `--access public` 필수!

---

## 📦 배포 후 사용 방법

### 다른 사람이 설치하는 방법

```bash
npm install --save-dev @your-username/nestjs-board-test-suite
```

### 테스트 파일 복사

#### Windows (PowerShell)
```powershell
# 전체 복사
Copy-Item -Recurse "node_modules/@your-username/nestjs-board-test-suite/tests/*" "src/"

# 개별 모듈 복사
Copy-Item "node_modules/@your-username/nestjs-board-test-suite/tests/auth/*" "src/auth/"
```

#### Linux/Mac
```bash
# 전체 복사
cp -r node_modules/@your-username/nestjs-board-test-suite/tests/* src/

# 개별 모듈 복사  
cp node_modules/@your-username/nestjs-board-test-suite/tests/auth/* src/auth/
```

### 테스트 실행

```bash
npm test
```

---

## 🔄 패키지 업데이트

### 버전 업데이트

```bash
# patch 업데이트 (1.0.0 → 1.0.1)
npm version patch

# minor 업데이트 (1.0.0 → 1.1.0)
npm version minor

# major 업데이트 (1.0.0 → 2.0.0)
npm version major
```

### 재배포

```bash
npm publish
```

---

## 💡 사용 팁

### 1. postinstall 스크립트로 자동 복사

사용자의 `package.json`에 추가:

```json
{
  "scripts": {
    "postinstall": "node copy-tests.js"
  }
}
```

`copy-tests.js`:
```javascript
const fs = require('fs');
const path = require('path');

const source = 'node_modules/@your-username/nestjs-board-test-suite/tests';
const dest = 'src';

// 복사 로직
// ...
```

### 2. CLI 도구 제공

```json
{
  "bin": {
    "copy-board-tests": "./bin/copy-tests.js"
  }
}
```

사용자가 편하게:
```bash
npx copy-board-tests
```

---

## 📊 패키지 확인

### 배포 전 체크

```bash
# 패키지에 포함될 파일 확인
npm pack --dry-run

# package.json 검증
npm pkg fix
```

### 배포 후 확인

```bash
# npmjs.com에서 확인
https://www.npmjs.com/package/@your-username/nestjs-board-test-suite

# 설치 테스트
mkdir test-install
cd test-install
npm init -y
npm install @your-username/nestjs-board-test-suite
```

---

## 🔒 비공개 패키지 (선택사항)

무료 계정은 public만 가능하지만, 유료 계정이라면:

```bash
npm publish --access restricted
```

---

## 🐛 문제 해결

### "403 Forbidden" 에러

```bash
npm login
npm publish --access public
```

### "Package name already exists"

`package.json`의 `name` 변경:
```json
{
  "name": "@your-username/nestjs-board-test-suite-v2"
}
```

### 파일이 패키지에 포함 안 됨

`package.json`의 `files` 확인:
```json
{
  "files": [
    "tests/",
    "README.md",
    "INSTALL.md"
  ]
}
```

---

## ✅ 완료 체크리스트

- [ ] npm 계정 생성
- [ ] `package.json`에서 `name`, `author` 수정
- [ ] `npm login` 완료
- [ ] `npm publish --access public` 실행
- [ ] npmjs.com에서 패키지 확인
- [ ] 테스트 설치 확인

---

## 🎉 완성!

패키지가 배포되면 전 세계 누구나:

```bash
npm install @your-username/nestjs-board-test-suite
```

로 사용할 수 있습니다!

---

## 📞 도움말

- [npm 공식 문서](https://docs.npmjs.com/)
- [패키지 배포 가이드](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
