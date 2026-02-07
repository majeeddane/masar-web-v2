export const isAdmin = (email?: string | null) => {
    if (!email) return false;
    return email === 'majeed.dane@gmail.com';
};
