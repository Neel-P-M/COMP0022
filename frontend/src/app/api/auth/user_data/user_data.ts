//Define User type
export type User = {
    id: string;
    username: string;
    password: string;
}

export const users: User[] = [];

export const JWT_secret = process.env.JWT_SECRET || 'your-secret-key';