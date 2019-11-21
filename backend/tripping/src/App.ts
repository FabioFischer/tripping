import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as boolParser  from 'express-query-boolean';
import * as cors from "cors";

import AuthenticationRouter from './rest/authentication.rest';
import EquipmentRouter from './rest/equipment.rest';
import BrandRouter from './rest/brand.rest';
import CustomerRouter from './rest/customer.rest';
import EmployeeRouter from './rest/employee.rest';
import ServiceOrderRouter from './rest/service-order.rest';

// Creates and configures an ExpressJS web server.
class App {

    // ref to Express instance
    public express: express.Application;

    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    // Configure Express middleware.
    private middleware(): void {
        if (process.env.DEV_ENV == 'true') {
            this.express.use(logger('dev'));
        }
        this.express.use(bodyParser.json({limit: '50mb'}));
        this.express.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        this.express.use(boolParser({limit: '50mb'}));
    }
    // Configure API endpoints.
    private routes(): void {
        /* This is just to get up and running, and to make sure what we've got is
        * working so far. This function will change when we start to add more
        * API endpoints */
        let router = express.Router();

        // options for cors middleware
        const options: cors.CorsOptions = {
            allowedHeaders: ["Content-Type", "Accept", "Access-Token"],
            exposedHeaders: ["Content-Type", "Accept", "Access-Token"],
            credentials: true,
            methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
            origin: process.env.CO_ORIGIN || "http://localhost:4201",
            preflightContinue: false
        }
        
        router.use(cors(options));

        // placeholder route handler
        router.get('/', (req, res, next) => {
            res.json({
                message: 'tripping - backend'
            });
        });
        this.express.use('/', router);
        this.express.use('/authentication', AuthenticationRouter);
        this.express.use('/equipment', EquipmentRouter);
        this.express.use('/brand', BrandRouter);
        this.express.use('/customer', CustomerRouter);
        this.express.use('/employee', EmployeeRouter);
        this.express.use('/service_order', ServiceOrderRouter);
    }
}

export default new App().express;
