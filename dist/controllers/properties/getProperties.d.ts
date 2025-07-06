declare const getProperties: (filters: any, page: number, limit: number) => Promise<{
    properties: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
        pages: number;
    };
}>;
export default getProperties;
