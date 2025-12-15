# Docker 자동 시작 설정 완료

## ✅ 적용된 설정

### 1. Docker 재시작 정책
```bash
docker update --restart=unless-stopped jungle-postgres
```

**의미**:
- Docker Desktop 시작 시 자동 실행
- 수동으로 중지하지 않는 한 항상 재시작
- 컴퓨터 재부팅 후에도 자동 시작

### 2. npm 스크립트
```json
"prestart:dev": "docker start jungle-postgres || echo Docker already running"
```

**동작**:
- `npm run start:dev` 실행 전 자동으로 Docker 시작
- 이미 실행 중이면 에러 무시

---

## 🚀 사용법

```bash
# 서버 시작 (Docker 자동 시작)
npm run start:dev

# 서버만 종료: Ctrl+C
# Docker는 백그라운드에서 계속 실행됨
```

---

## 🔄 완전 종료

**Docker까지 완전히 종료하려면**:
```bash
docker stop jungle-postgres
```

**Docker 자동 시작 해제**:
```bash
docker update --restart=no jungle-postgres
```

---

## 📋 재시작 정책 옵션

| 정책 | 설명 |
|------|------|
| `no` | 자동 재시작 안 함 |
| `always` | 항상 재시작 |
| `unless-stopped` | 수동 중지 전까지 재시작 ✅ |
| `on-failure` | 에러 시에만 재시작 |

---

**이제 서버만 실행하면 PostgreSQL도 자동으로 시작됩니다!** 🎉
