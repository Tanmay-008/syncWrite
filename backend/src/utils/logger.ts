import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'http',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    (info) => {
                        const moduleTag = info.module ? ` [${info.module}]` : '';
                        return `${info.timestamp} ${info.level}${moduleTag}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`;
                    }
                )
            ),
        }),
    ],
});

export const getChildLogger = (moduleName: string) => {
    return logger.child({ module: moduleName });
};
