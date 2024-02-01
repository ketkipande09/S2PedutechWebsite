const Sentry = require('@sentry/node');

global.customErrorLogger = (err) => {
    if(!(err instanceof Error)){
        err =  new Error(err);
    }
    console.error(err);
    Sentry.captureException(err);
};
