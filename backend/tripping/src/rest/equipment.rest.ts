import { Request, Response, NextFunction } from 'express';

import { GenericRestResultCodes, GenericDBRest } from './generic.rest';
import { Equipment } from '../model/equipment.model';

export class EquipmentRouter extends GenericDBRest {

    private static RESULT_CODE_DATA_VALID_ERROR: string = '20';
 
    constructor() {
        super('equipment-sql-provider');
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
        return EquipmentRouter.authenticator(req, res, next);
    }

    public async setupSQLProvider(namespace){       
        this.setSQLProvider(new namespace.DefaultEquipmentSQLProvider());
    }

    public getDBRequester() {
        return EquipmentRouter.dbRequester;
    }

    public setDBRequester(dbRequester: any) {
        EquipmentRouter.dbRequester = dbRequester;
    }

    public static getSQLProvider() {
        return EquipmentRouter.dbRequester.sqlProvider;
    }

    public static getDBConnector() {
        return EquipmentRouter.dbRequester.dbConnector;
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        // Verify if there is any optional parameters on req
        if (Object.keys(req.query).length > 0) {
            await EquipmentRouter.encapsulatedRequest(req, res, async () => {
                let model: Equipment;
                let dbRes;

                // parse requisition query to a object
                try {
                    model = new Equipment();
                    await model.clone(req.query);
                } catch(e) {
                    throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
                }         
                // returns data from table based on optional parameters
                try {
                    dbRes = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().getCompost(model), 
                    EquipmentRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
                }                

                return dbRes;
            });
        } else {
            await EquipmentRouter.encapsulatedRequest(req, res, async () => {
                let dbRes;
                // returns all the data from table
                try {
                    dbRes = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().getAll(), 
                    EquipmentRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
                }
                     
                return dbRes;
            });
        }
    }

    public async get(req: Request, res: Response, next: NextFunction) {      
        await EquipmentRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Equipment;
            
            //get object
            try {
                model = new Equipment();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            //query
            try {
                dbRes = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().get(model), 
                EquipmentRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
            }
            
            return dbRes;
        });     
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        await EquipmentRouter.encapsulatedRequest(req, res, async () => {
            let model: Equipment;
            let rowCount: number;
            //get object
            try {
                model = new Equipment();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate UK's
            let validationModels = [];

            let valModel01 = new Equipment();

            valModel01.setName(model.getName())

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().getCompost(model), 
                    EquipmentRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                EquipmentRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                rowCount = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().post(model), 
                EquipmentRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EquipmentRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EquipmentRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
        }); 
    }

    public async postReturningObject(req: Request, res: Response, next: NextFunction) {
        await EquipmentRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Equipment;
            let rowCount: number;
            let inserted = [];
            let insertedModel: Equipment;
            //get object
            try {
                model = new Equipment();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Equipment();

            valModel01.setName(model.getName());

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().getCompost(model), 
                    EquipmentRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                EquipmentRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                inserted = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().post(model), 
                EquipmentRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EquipmentRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EquipmentRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            // Get inserted object
            try {
                let insertedId = inserted[0].idaparelho;
                insertedModel = new Equipment()
                insertedModel.setId(insertedId);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            // query
            try {
                dbRes = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().get(insertedModel), 
                EquipmentRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
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
        await EquipmentRouter.encapsulatedRequest(req, res, async () => {
            let model: Equipment;
            let rowCount: number;

            //get object
            try {
                model = new Equipment();
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
                throw {exception: e, errorCode: EquipmentRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Equipment();

            valModel01.setName(model.getName())
            validationModels.push(valModel01);

            for(let validation of validationModels) {
                try {
                    rowCount = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().validationQuery(validation, model), 
                    EquipmentRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                EquipmentRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                rowCount = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().put(model), 
                EquipmentRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EquipmentRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EquipmentRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

        });  
    }
    
    public async delete(req: Request, res: Response, next: NextFunction) {
        await EquipmentRouter.encapsulatedRequest(req, res, async () => {
            let model: Equipment;
            let rowCount: number;

            //get object
            try {
                model = new Equipment();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            try {
                rowCount = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().getServiceOrderDependency(model),
                EquipmentRouter.getDBConnector().returnRowCount);
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
            }
            EquipmentRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_SERVICE_ORDER_PENDING_DEPENDENCIES);

            //query
            try {
                rowCount = await EquipmentRouter.getDBConnector().runSQL(EquipmentRouter.getSQLProvider().delete(model), 
                EquipmentRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EquipmentRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EquipmentRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EquipmentRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

        });  
    }
  }

const equipmentRoutes = new EquipmentRouter();
export default equipmentRoutes.router;
