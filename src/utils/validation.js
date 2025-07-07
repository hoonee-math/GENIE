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
        hasNumber
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
