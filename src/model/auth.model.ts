// src/model/auth.model.ts
/**
 * Interface untuk request register user
 * @property username - Nama pengguna (3-20 karakter)
 * @property email - Email valid pengguna
 * @property password - Password minimal 8 karakter
 */
export interface RegisterAuthRequest {
    username: string;
    email: string;
    password: string;
}

/**
 * Interface untuk request login user 
 * @property username - Nama pengguna yang terdaftar
 * @property password - Password yang sesuai
 */
export interface LoginAuthRequest {
    username: string;
    password: string;
}

/**
 * Interface untuk response auth
 * @property id - ID unik user
 * @property username - Nama pengguna
 * @property email - Email pengguna
 * @property token - Token session (opsional)
 * @property isActive - Status aktif user
 * @property createdAt - Waktu pembuatan akun
 */
export interface AuthResponse {
    id: string;
    username: string;
    email: string;
    token?: string;
    isActive?: boolean;
    createdAt?: string;
}