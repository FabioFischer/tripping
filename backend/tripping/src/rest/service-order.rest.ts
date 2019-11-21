import { Request, Response, NextFunction } from 'express';

import { GenericRestResultCodes, GenericDBRest } from './generic.rest';
import { serviceOrderStatuses } from '../model/service-order.model';
import { ServiceOrder } from '../model/service-order.model';
import { Customer } from '../model/Customer.model';

export class ServiceOrderRouter extends GenericDBRest {

    private static RESULT_CODE_DATA_VALID_ERROR: string = '20';
 
    constructor() {
        super('service-order-sql-provider');
    }

    public init() {
        this.router.get('/', this.encapsulatedAuthenticatior, this.getAll);
        this.router.get('/status/', this.encapsulatedAuthenticatior, this.getAllStatuses);
        this.router.get('/equipment/', this.encapsulatedAuthenticatior, this.getAllEquipments);
        this.router.get('/brand/', this.encapsulatedAuthenticatior, this.getAllBrands);
        this.router.get('/customer/', this.encapsulatedAuthenticatior, this.getAllCustomers);
        this.router.get('/employee/', this.encapsulatedAuthenticatior, this.getAllEmployees);
        this.router.get('/by_customer/', this.getByCustomer);
        this.router.get('/:id', this.encapsulatedAuthenticatior, this.get);
        this.router.post('/', this.encapsulatedAuthenticatior, this.post);
        this.router.post('/returning_object', this.encapsulatedAuthenticatior, this.postReturningObject);
        this.router.put('/', this.encapsulatedAuthenticatior, this.put);
        this.router.delete('/:id', this.encapsulatedAuthenticatior, this.delete);
    }

    public encapsulatedAuthenticatior(req, res, next) {
        return ServiceOrderRouter.authenticator(req, res, next);
    }

    public async setupSQLProvider(namespace){       
        this.setSQLProvider(new namespace.DefaultServiceOrderSQLProvider());
    }

    public getDBRequester() {
        return ServiceOrderRouter.dbRequester;
    }

    public setDBRequester(dbRequester: any) {
        ServiceOrderRouter.dbRequester = dbRequester;
    }

    public static getSQLProvider() {
        return ServiceOrderRouter.dbRequester.sqlProvider;
    }

    public static getDBConnector() {
        return ServiceOrderRouter.dbRequester.dbConnector;
    }

    public static async mergeDependencies(data): Promise<any> {
        let model = new ServiceOrder();
        let dbRes;
        try {
            model.clone(data);
        } catch (e) {
            throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
        }

        if (model.getEquipmentId()) {
            //query
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getEquipment(model),
                ServiceOrderRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //append data
            try {
                model = ServiceOrderRouter.appendIntoData(model, dbRes, 'aparelho');
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        }

        if (model.getBrandId()) {
            //query
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getBrand(model),
                ServiceOrderRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //append data
            try {
                model = ServiceOrderRouter.appendIntoData(model, dbRes, 'marca');
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        }

        if (model.getCustomerId()) {
            //query
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getCustomer(model),
                ServiceOrderRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //append data
            try {
                model = ServiceOrderRouter.appendIntoData(model, dbRes, 'cliente');
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        }

        if (model.getEmployeeId()) {
            //query
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getEmployee(model),
                ServiceOrderRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //append data
            try {
                model = ServiceOrderRouter.appendIntoData(model, dbRes, 'funcionario');
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        }
        return model;
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        // Verify if there is any optional parameters on req
        if (Object.keys(req.query).length > 0) {
            await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
                let model: ServiceOrder;
                let dbRes;
                let data = [];

                // parse requisition query to a object
                try {
                    model = new ServiceOrder();
                    await model.clone(req.query);
                } catch(e) {
                    throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
                }         
                // returns data from table based on optional parameters
                try {
                    dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getCompost(model), 
                    ServiceOrderRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
                }
                // Merge all dependencies of object into returning data
                if (dbRes instanceof Array) {
                    for (let obj of dbRes) {
                        let model = await ServiceOrderRouter.mergeDependencies(obj);
                        data.push(model);
                    }
                } else {
                    data = await ServiceOrderRouter.mergeDependencies(dbRes);
                }
                return data;
            });
        } else {
            await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
                let dbRes;
                let data = [];
                // returns all the data from table
                try {
                    dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getAll(), 
                    ServiceOrderRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
                }
                // Merge all dependencies of object into returning data
                if (dbRes instanceof Array) {
                    for (let obj of dbRes) {
                        let model = await ServiceOrderRouter.mergeDependencies(obj);
                        data.push(model);
                    }
                } else {
                    data = await ServiceOrderRouter.mergeDependencies(dbRes);
                }
                return data;
            });
        }
    }

    public async get(req: Request, res: Response, next: NextFunction) {      
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: ServiceOrder;
            
            //get object
            try {
                model = new ServiceOrder();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            //query
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().get(model), 
                ServiceOrderRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            // Merge all dependencies of object into returning data
            return dbRes ? await ServiceOrderRouter.mergeDependencies(dbRes) : dbRes;
        });     
    }

    public async getByCustomer(req: Request, res: Response, next: NextFunction) {      
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let data = [];
            let model: Customer;
            //get object
            try {
                if (!req.query.cpf) throw 'Dados da requisição devem conter uma propriedade "cpf".'

                model = new Customer();
                model.setCpf(req.query.cpf);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            //query
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getByCustomer(model), 
                ServiceOrderRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            // Merge all dependencies of object into returning data
            if (dbRes instanceof Array) {
                for (let obj of dbRes) {
                    let model = await ServiceOrderRouter.mergeDependencies(obj);
                    data.push(model);
                }
            } else {
                data = await ServiceOrderRouter.mergeDependencies(dbRes);
            }
            return data;
        });     
    }

    public async getAllStatuses(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            return serviceOrderStatuses;
        });
    }

    public async getAllEquipments(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getAllEquipments(), 
                ServiceOrderRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            return dbRes;
        });
    }

    public async getAllBrands(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getAllBrands(), 
                ServiceOrderRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            return dbRes;
        });
    }

    public async getAllCustomers(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getAllCustomers(), 
                ServiceOrderRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            return dbRes;
        });
    }

    public async getAllEmployees(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().getAllEmployees(), 
                ServiceOrderRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            return dbRes;
        });
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let model: ServiceOrder;
            let inserted = [];
            //get object
            try {
                model = new ServiceOrder();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.RESULT_CODE_DATA_VALID_ERROR};
            }

            //query
            try {
                inserted = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().post(model), 
                ServiceOrderRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            ServiceOrderRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            ServiceOrderRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
        }); 
    }

    public async postReturningObject(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: ServiceOrder;
            let rowCount: number;
            let inserted = [];
            let insertedModel: ServiceOrder;
            //get object
            try {
                model = new ServiceOrder();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.RESULT_CODE_DATA_VALID_ERROR};
            }

            //query
            try {
                inserted = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().post(model), 
                ServiceOrderRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            ServiceOrderRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            ServiceOrderRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            // Get inserted object
            try {
                insertedModel = new ServiceOrder()
                insertedModel.setId(inserted[0].idos);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            // query
            try {
                dbRes = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().get(insertedModel), 
                ServiceOrderRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            // Merge all dependencies of object into returning data
            return await ServiceOrderRouter.mergeDependencies(dbRes);
        }); 
    }

    public async put(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let model: ServiceOrder;
            let rowCount: number;

            //get object
            try {
                model = new ServiceOrder();
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
                throw {exception: e, errorCode: ServiceOrderRouter.RESULT_CODE_DATA_VALID_ERROR};
            }

            //query
            try {
                rowCount = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().put(model), 
                ServiceOrderRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            ServiceOrderRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            ServiceOrderRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
        });  
    }
    
    public async delete(req: Request, res: Response, next: NextFunction) {
        await ServiceOrderRouter.encapsulatedRequest(req, res, async () => {
            let model: ServiceOrder;
            let rowCount: number;

            //get object
            try {
                model = new ServiceOrder();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //query
            try {
                rowCount = await ServiceOrderRouter.getDBConnector().runSQL(ServiceOrderRouter.getSQLProvider().delete(model), 
                ServiceOrderRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: ServiceOrderRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            ServiceOrderRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            ServiceOrderRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
        });  
    }
}

const ServiceOrderRoutes = new ServiceOrderRouter();
export default ServiceOrderRoutes.router;
