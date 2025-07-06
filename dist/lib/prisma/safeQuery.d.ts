declare const safeQuery: <T>(query: Promise<T>, fallback: T) => Promise<T>;
export default safeQuery;
