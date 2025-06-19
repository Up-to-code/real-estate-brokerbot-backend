// Safe database query wrapper
const safeQuery = async <T>(query: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await query;
  } catch (error) {
    console.error("Database query failed:", error);
    return fallback;
  }
};

export default safeQuery;
