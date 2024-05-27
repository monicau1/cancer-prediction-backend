require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');


const init = async () => {
    const server = Hapi.Server({
        host: '0.0.0.0',
        port: 3000,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

            // Handling payload too large error
        if (response.output && response.output.statusCode === 413) {
            const newResponse = h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000'
            });
            newResponse.code(413);
            return newResponse;
        }
 
        // Handling input error during prediction
        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `Terjadi kesalahan dalam melakukan prediksi`
            })
            newResponse.code(response.statusCode)
            return newResponse;
        }
 
        // Handling other Boom errors
        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}, BOOM BOOM`
            })
            newResponse.code(response.output.statusCode)
            return newResponse;
        }
 
        return h.continue;
    });

    await server.start();
    console.log(`Server started on: ${server.info.uri}`);
};

init();