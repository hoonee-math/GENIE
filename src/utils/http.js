// utils/http.js - 순수 HTTP 유틸리티
import { useAuthStore } from "@/stores/auth";

/**
 * 커스텀 에러 클래스
 */
export class APIError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

/**
 * 기본 API 요청 함수
 * - 자동 토큰 갱신 (401 에러 시)
 * - Authorization 헤더 자동 설정
 * - httpOnly 쿠키 자동 포함
 */
export async function apiRequest(url, options = {}) {
  const authStore = useAuthStore();

  // 기본 설정
  const defaultOptions = {
    credentials: "include", // httpOnly 쿠키 자동 포함
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Authorization 헤더 자동 설정
  if (authStore.accessToken) {
    defaultOptions.headers.Authorization = authStore.authHeader;
  }

  try {
    const response = await fetch(url, defaultOptions);

    // 401 에러 처리 (토큰 만료)
    if (response.status === 401) {
      console.log("401 에러 발생 - 토큰 갱신 시도");

      // 토큰 갱신 시도
      const refreshSuccess = await authStore.refreshToken();

      if (refreshSuccess) {
        console.log("토큰 갱신 성공 - API 재시도");

        // 새로운 토큰으로 헤더 업데이트
        defaultOptions.headers.Authorization = authStore.authHeader;

        // API 재시도
        const retryResponse = await fetch(url, defaultOptions);
        console.log(`API 재시도 완료: ${retryResponse.status}`);

        // 재시도도 401이면 에러 처리
        if (retryResponse.status === 401) {
          console.error("재시도도 401 에러 - 백엔드 JWT 필터 문제 의심");
          throw new APIError("인증 토큰이 유효하지 않습니다.", 401);
        }

        return retryResponse;
      } else {
        console.log("토큰 갱신 실패");
        // router.push('/login');
        throw new APIError("인증이 만료되었습니다. 다시 로그인해주세요.", 401);
      }
    }

    // 정상 응답 반환
    return response;
  } catch (error) {
    console.error(`API 요청 오류 (${url}):`, error);

    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(`네트워크 오류가 발생했습니다: ${error.message}`, 0);
  }
}

/**
 * GET 요청
 */
export async function apiGet(url, options = {}) {
  // params가 있으면 URL에 쿼리 스트링으로 추가
  let requestUrl = url;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.keys(options.params).forEach(key => {
      if (options.params[key] !== undefined && options.params[key] !== null) {
        searchParams.append(key, options.params[key]);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      requestUrl += (url.includes('?') ? '&' : '?') + queryString;
    }
    // params를 options에서 제거 (fetch에 전달되지 않도록)
    delete options.params;
  }

  const response = await apiRequest(requestUrl, {
    method: "GET",
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new APIError(`GET ${url} 실패: ${errorData}`, response.status);
  }

  // // JSON 파싱 with 타임아웃
  // const responseClone = response.clone();

  try {
    // // Response가 이미 사용되었다면 clone을 사용
    // const responseToUse = response.bodyUsed ? responseClone : response;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("JSON 파싱 타임아웃")), 10000)
    );

    const jsonPromise = response.json();
    // // Response가 이미 사용되었다면 clone을 사용
    // const jsonPromise = responseToUse.json();
    const jsonData = await Promise.race([jsonPromise, timeoutPromise]);
    console.log(`apiGet JSON 파싱 성공:`, { url, data: jsonData });

    return jsonData;
  } catch (jsonError) {
    console.error(`JSON 파싱 실패:`, { url, error: jsonError.message });
    throw new APIError(`JSON 파싱 실패: ${jsonError.message}`, response.status);
  }
}

/**
 * POST 요청
 */
export async function apiPost(url, data = null, options = {}) {
  const response = await apiRequest(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new APIError(`POST ${url} 실패: ${errorData}`, response.status);
  }

  return await response.json();
}

/**
 * PUT 요청
 */
export async function apiPut(url, data = null, options = {}) {
  const response = await apiRequest(url, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new APIError(`PUT ${url} 실패: ${errorData}`, response.status);
  }

  return await response.json();
}

/**
 * PATCH 요청
 */
export async function apiPatch(url, data = null, options = {}) {
  const response = await apiRequest(url, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new APIError(`PATCH ${url} 실패: ${errorData}`, response.status);
  }

  return await response.json();
}

/**
 * DELETE 요청
 */
export async function apiDelete(url, options = {}) {
  const response = await apiRequest(url, {
    method: "DELETE",
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new APIError(`DELETE ${url} 실패: ${errorData}`, response.status);
  }

  return await response.json();
}

/**
 * API 에러를 사용자 친화적 메시지로 변환
 */
export function getErrorMessage(error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        return "잘못된 요청입니다. 입력 정보를 확인해주세요.";
      case 401:
        return "인증이 만료되었습니다. 다시 로그인해주세요.";
      case 403:
        return "접근 권한이 없습니다.";
      case 404:
        return "요청한 정보를 찾을 수 없습니다.";
      case 409:
        return "중복된 정보입니다.";
      case 500:
        return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      default:
        return error.message || "알 수 없는 오류가 발생했습니다.";
    }
  }

  return "네트워크 연결을 확인해주세요.";
}
