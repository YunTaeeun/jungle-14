// JWT 토큰 유효성 검사 유틸리티

interface DecodedToken {
    exp: number;
    iat: number;
    sub: number;
    username: string;
}

/**
 * JWT 토큰을 디코딩하여 payload를 반환
 * @param token JWT 토큰 문자열
 * @returns 디코딩된 토큰 payload 또는 null
 */
export function decodeToken(token: string): DecodedToken | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (error) {
        console.error('토큰 디코딩 실패:', error);
        return null;
    }
}

/**
 * JWT 토큰이 만료되었는지 확인
 * @param token JWT 토큰 문자열
 * @returns true if 만료됨, false if 유효함
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    // exp는 초 단위, Date.now()는 밀리초 단위
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    return currentTime >= expirationTime;
}

/**
 * localStorage에서 토큰을 가져와 유효성을 검사
 * @returns 유효한 토큰 또는 null
 */
export function getValidToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    if (isTokenExpired(token)) {
        console.log('토큰이 만료되었습니다. 자동 로그아웃합니다.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
    }

    return token;
}

/**
 * 토큰을 저장하고 자동 만료 타이머를 설정
 * @param token JWT 토큰 문자열
 */
export function setTokenWithExpiry(token: string): void {
    localStorage.setItem('token', token);

    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // 만료 시간이 되면 자동으로 토큰 삭제
        if (timeUntilExpiry > 0) {
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('auth-change'));
                console.log('토큰이 만료되어 자동 로그아웃되었습니다.');
            }, timeUntilExpiry);
        }
    }
}
