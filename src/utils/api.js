// src/utils/api.js - 보안 우선 API 요청 시스템
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

/**
 * 보안 우선 API 요청 함수
 * - 자동 토큰 갱신 (401 에러 시)
 * - Authorization 헤더 자동 설정
 * - httpOnly 쿠키 자동 포함
 * - 중복 토큰 갱신 방지
 * - 에러 처리 통합
 */

// ========== 커스텀 에러 클래스 (@/utils/http.js 로 이동) ==========
// export class APIError extends Error {

// ========== 기본 API 요청 함수 ==========
// export async function apiRequest(url, options = {}) {

// ========== HTTP 메서드별 편의 함수 (@/utils/http.js 로 이동) ==========
// export async function apiGet(url, options = {}) {
// export async function apiPost(url, data = null, options = {}) {
// export async function apiPut(url, data = null, options = {}) {
// export async function apiPatch(url, data = null, options = {}) {
// export async function apiDelete(url, options = {}) {

// ========== 인증 관련 특수 API (@/api/auth.js 로 이동)==========
// export async function loginAPI(email, password) {
// export async function refreshTokenAPI() {
// export async function logoutAPI() {

// ========== 사용자 정보 API (@/api/user.js 로 이동) ==========
// export async function getUserInfoAPI() {
// export async function getUserTicketAPI() {
// export async function updateUserNameAPI(newName) {
// export async function updateUserTypeAPI(newType) {
// export async function updatePasswordAPI(currentPassword, newPassword, confirmPassword) {

// ========== 회원가입 및 계정 관련 API (@/api/auth.js 로 이동) ==========
// export async function signUpAPI(userData) {
// export async function checkEmailAPI(email) {
// export async function resetPasswordAPI(email, tempPassword) {
// export async function withdrawAPI(email) {

// ========== 유틸리티 함수 (@/utils/http.js 로 이동) ==========
// export function getErrorMessage(error) {

/**
 * 디버그 모드에서만 API 로그 출력
 */
export function debugLog(message, data = null) {
  if (import.meta.env.DEV) {
    console.log(`[API Debug] ${message}`, data);
  }
}

// ========== 타입 검증 유틸리티 (@/utils/validation.js 로 이동) ==========
// export function validateEmail(email) {
// export function validatePassword(password) {
