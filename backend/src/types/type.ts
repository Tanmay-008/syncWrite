export type user = {
    userName: string,
    email: string,
    password: string,
    role?: string,
}

export type UserResponse = Omit<user, 'password'> & { id: string, role: string };