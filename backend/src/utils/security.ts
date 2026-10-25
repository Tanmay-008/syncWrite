import bcrypt from 'bcryptjs';

export const encryptData = async (data: string, saltRounds: number = 10): Promise<string> => {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(data, salt);
};

export const compareData = async (data: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(data, hash);
};
