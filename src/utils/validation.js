// utils/validation.js - 검증 유틸리티
/**
 * 이메일 형식 검증
 */
export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 강도 검증
 */
export function validatePassword(password) {
  // 최소 8자, 영문, 숫자 포함
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return {
    isValid: minLength && hasLetter && hasNumber,
    minLength,
    hasLetter,
    hasNumber,
  };
}

/**
 * 한국 이름 검증 (2-8자 한글)
 */
export function validateKoreanName(name) {
  const koreanRegex = /^[가-힣]{2,8}$/;
  return koreanRegex.test(name);
}

/**
 * 전화번호 검증
 */
export function validatePhoneNumber(phone) {
  const phoneRegex = /^010-?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 데이터가 유효한지 검사하는 유틸 함수
 * - 문자열: trim() 후 빈 문자열이 아닌지 검사
 * - 배열: 모든 요소가 유효한지 재귀적으로 검사
 * - 객체: 모든 값이 유효한지 재귀적으로 검사
 * - null, undefined: false 반환
 * 
 * @param {any} data - 검사할 데이터
 * @returns {boolean} - 유효하면 true, 그렇지 않으면 false
 */
export function isNonEmpty(data) {
    // null이나 undefined인 경우
    if (data === null || data === undefined) {
        return false;
    }
    
    // 문자열인 경우
    if (typeof data === 'string') {
        return data.trim() !== '';
    }
    
    // 배열인 경우
    if (Array.isArray(data)) {
        // 빈 배열은 false로 처리
        if (data.length === 0) {
            return false;
        }
        // 모든 요소가 유효한지 검사
        return data.every(item => isNonEmpty(item));
    }
    
    // 객체인 경우 (Date, RegExp 등 특수 객체는 제외)
    if (typeof data === 'object' && data.constructor === Object) {
        const values = Object.values(data);
        // 빈 객체는 false로 처리
        if (values.length === 0) {
            return false;
        }
        // 모든 값이 유효한지 검사
        return values.every(value => isNonEmpty(value));
    }
    
    // 숫자, 불린 등 기타 primitive 타입은 유효한 것으로 처리
    return true;
}