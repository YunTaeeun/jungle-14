# PostgreSQL 설치 옵션

## ⚠️ 상황
Docker가 설치되어 있지만 **Docker Desktop이 실행되고 있지 않습니다!**

---

## 🔧 옵션 1: Docker Desktop 사용 (가장 쉬움)

### 1. Docker Desktop 실행
- Windows 검색 → "Docker Desktop" 실행
- 시작될 때까지 대기 (30초~1분)

### 2. Docker로 PostgreSQL 실행
```powershell
docker run --name jungle-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

### 3. 데이터베이스 생성
```powershell
docker exec -it jungle-postgres psql -U postgres -c "CREATE DATABASE jungle_board;"
```

### 4. 서버 재시작
```powershell
cd c:\my\jungle 14\server
# 현재 서버 중지 (Ctrl+C)
npm run start:dev
```

---

## 🔧 옵션 2: PostgreSQL 직접 설치

### 1. 다운로드
https://www.postgresql.org/download/windows/

### 2. 설치
- PostgreSQL 16 선택
- 비밀번호: `postgres`
- 포트: `5432`

### 3. pgAdmin 실행
- Servers → PostgreSQL 16
- 우클릭 → Create → Database
- Name: `jungle_board`

### 4. 서버 재시작
```powershell
cd c:\my\jungle 14\server
npm run start:dev
```

---

## 🔧 옵션 3: SQLite로 유지 (가장 간단)

PostgreSQL 설치가 번거롭다면 SQLite를 계속 사용할 수도 있습니다.

### 되돌리기:
```powershell
cd c:\my\jungle 14\server
npm uninstall pg
```

그리고 `app.module.ts`와 `.env`를 이전 상태로 되돌리면 됩니다.

---

## 💡 추천

**개발 단계**: SQLite (간편)  
**배포/프로덕션**: PostgreSQL (성능/확장성)

지금은 개발 중이라면 SQLite를 유지하고, 나중에 배포할 때 PostgreSQL로 전환하는 것도 좋습니다!
