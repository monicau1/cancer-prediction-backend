const postPredictHandler  = require('../server/handler');

const routes = [
    {
        method: 'POST',
        path: '/predict',
        handler: postPredictHandler,
        options: {
            payload: {
                multipart: true,
                allow: 'multipart/form-data'
            }
        }
    }
]

module.exports = routes;