const cache = new Map<string, any>();

export function getCache(key: string) {
    return cache.get(key);
}

export function setCache(key: string, value: any) {
    cache.set(key, value);
}

export function deleteCache(key: string) {
    cache.delete(key);
}

export const getUserKey = (proxyId: string, userEmail: string) => {
    return `assistant:${proxyId}:${userEmail}`;
}