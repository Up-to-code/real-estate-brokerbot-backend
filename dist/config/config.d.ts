export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly isDevelopment: boolean;
    readonly isProduction: boolean;
    readonly database: {
        readonly url: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
    };
    readonly cors: {
        readonly origin: string[];
        readonly credentials: true;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: 100;
    };
};
