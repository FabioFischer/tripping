import { Request, Response, NextFunction } from 'express';

import { GenericRestResultCodes, GenericDBRest } from './generic.rest';
import { Customer } from '../model/Customer.model';

export class CustomerRouter extends GenericDBRest {

    private static RESULT_CODE_DATA_VALID_ERROR: string = '20';
 
    constructor() {
        super('customer-sql-provider');
    }

    public init() {
        this.router.get('/', this.encapsulatedAuthenticatior, this.getAll);
        this.router.get('/:id', this.encapsulatedAuthenticatior, this.get);
        this.router.post('/', this.encapsulatedAuthenticatior, this.post);
        this.router.post('/returning_object', this.encapsulatedAuthenticatior, this.postReturningObject);
        this.router.put('/', this.encapsulatedAuthenticatior, this.put);
        this.router.delete('/:id', this.encapsulatedAuthenticatior, this.delete);
    }

    public encapsulatedAuthenticatior(req, res, next) {
        return CustomerRouter.authenticator(req, res, next);
    }

    public async setupSQLProvider(namespace){       
        this.setSQLProvider(new namespace.DefaultCustomerSQLProvider());
    }

    public getDBRequester() {
        return CustomerRouter.dbRequester;
    }

    public setDBRequester(dbRequester: any) {
        CustomerRouter.dbRequester = dbRequester;
    }

    public static getSQLProvider() {
        return CustomerRouter.dbRequester.sqlProvider;
    }

    public static getDBConnector() {
        return CustomerRouter.dbRequester.dbConnector;
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        // Verify if there is any optional parameters on req
        if (Object.keys(req.query).length > 0) {
            await CustomerRouter.encapsulatedRequest(req, res, async () => {
                let model: Customer;
                let dbRes;

                // parse requisition query to a object
                try {
                    model = new Customer();
                    await model.clone(req.query);
                } catch(e) {
                    throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
                }         
                // returns data from table based on optional parameters
                try {
                    dbRes = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().getCompost(model), 
                    CustomerRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
                }                

                return dbRes;
            });
        } else {
            await CustomerRouter.encapsulatedRequest(req, res, async () => {
                let dbRes;
                // returns all the data from table
                try {
                    dbRes = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().getAll(), 
                    CustomerRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
                }
                     
                return dbRes;
            });
        }
    }

    public async get(req: Request, res: Response, next: NextFunction) {      
        await CustomerRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Customer;
            
            //get object
            try {
                model = new Customer();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            //query
            try {
                dbRes = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().get(model), 
                CustomerRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
            }
            
            return dbRes;
        });     
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        await CustomerRouter.encapsulatedRequest(req, res, async () => {
            let model: Customer;
            let rowCount: number;
            //get object
            try {
                model = new Customer();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate UK's
            let validationModels = [];

            let valModel01 = new Customer();

            valModel01.setName(model.getName())

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().getCompost(model), 
                    CustomerRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                CustomerRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                rowCount = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().post(model), 
                CustomerRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            CustomerRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            CustomerRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
        }); 
    }

    public async postReturningObject(req: Request, res: Response, next: NextFunction) {
        await CustomerRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Customer;
            let rowCount: number;
            let inserted = [];
            let insertedModel: Customer;
            //get object
            try {
                model = new Customer();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Customer();

            valModel01.setName(model.getName());

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().getCompost(model), 
                    CustomerRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                CustomerRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                inserted = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().post(model), 
                CustomerRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            CustomerRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            CustomerRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            // Get inserted object
            try {
                let insertedId = inserted[0].idcliente;
                insertedModel = new Customer()
                insertedModel.setId(insertedId);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            // query
            try {
                dbRes = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().get(insertedModel), 
                CustomerRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
            } 
            // Merge all dependencies of object into returning data
            try {
                insertedModel.clone(dbRes);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            return insertedModel;
        }); 
    }

    public async put(req: Request, res: Response, next: NextFunction) {
        await CustomerRouter.encapsulatedRequest(req, res, async () => {
            let model: Customer;
            let rowCount: number;

            //get object
            try {
                model = new Customer();
                model.clone(req.body.data);
                if (!model){
                    throw 'company object not found.';
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPutData();
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Customer();

            valModel01.setName(model.getName())
            validationModels.push(valModel01);

            for(let validation of validationModels) {
                try {
                    rowCount = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().validationQuery(validation, model), 
                    CustomerRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                CustomerRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                rowCount = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().put(model), 
                CustomerRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            CustomerRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            CustomerRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

        });  
    }
    
    public async delete(req: Request, res: Response, next: NextFunction) {
        await CustomerRouter.encapsulatedRequest(req, res, async () => {
            let model: Customer;
            let rowCount: number;

            //get object
            try {
                model = new Customer();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            try {
                rowCount = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().getServiceOrderDependency(model),
                CustomerRouter.getDBConnector().returnRowCount);
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
            }
            CustomerRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_SERVICE_ORDER_PENDING_DEPENDENCIES);

            //query
            try {
                rowCount = await CustomerRouter.getDBConnector().runSQL(CustomerRouter.getSQLProvider().delete(model), 
                CustomerRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: CustomerRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            CustomerRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            CustomerRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

        });  
    }
}

const customerRoutes = new CustomerRouter();
export default customerRoutes.router;
