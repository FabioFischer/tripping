import { Request, Response, NextFunction } from 'express';

import { GenericRestResultCodes, GenericDBRest } from './generic.rest';
import { Brand, BrandEquipmentRelation } from '../model/brand.model';
import { Equipment } from '../model/equipment.model';

export class BrandRouter extends GenericDBRest {

    private static RESULT_CODE_DATA_VALID_ERROR: string = '20';
 
    constructor() {
        super('brand-sql-provider');
    }

    public init() {
        this.router.get('/', this.encapsulatedAuthenticatior, this.getAll);
        this.router.get('/equipment/', this.encapsulatedAuthenticatior, this.getAllEquipments);
        this.router.get('/:id', this.encapsulatedAuthenticatior, this.get);
        this.router.post('/', this.encapsulatedAuthenticatior, this.post);
        this.router.post('/returning_object', this.encapsulatedAuthenticatior, this.postReturningObject);
        this.router.put('/', this.encapsulatedAuthenticatior, this.put);
        this.router.delete('/:id', this.encapsulatedAuthenticatior, this.delete);
    }

    public encapsulatedAuthenticatior(req, res, next) {
        return BrandRouter.authenticator(req, res, next);
    }

    public async setupSQLProvider(namespace){       
        this.setSQLProvider(new namespace.DefaultBrandSQLProvider());
    }

    public getDBRequester() {
        return BrandRouter.dbRequester;
    }

    public setDBRequester(dbRequester: any) {
        BrandRouter.dbRequester = dbRequester;
    }

    public static getSQLProvider() {
        return BrandRouter.dbRequester.sqlProvider;
    }

    public static getDBConnector() {
        return BrandRouter.dbRequester.dbConnector;
    }

    public static async mergeDependencies(data): Promise<any> {
        let model = new Brand();
        let dbRes;
        try {
            model.clone(data);
        } catch (e) {
            throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
        }

        //get related objects
        try {
            dbRes = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getEquipments(model), 
            BrandRouter.getDBConnector().returnAllRows);
        } catch(e) {
            throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
        }
        if (dbRes) {
            // 1(x) to n(x) relation
            let equipments: Equipment[] = []
            // merge data into related object array
            try {
                for (let obj of dbRes) {
                    if (obj) {
                        let related = new Equipment();
                        related.clone(obj);
                        equipments.push(related);
                    }
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }          
            // add related data into database return
            try {
                model = BrandRouter.appendIntoData(model, equipments, 'aparelhos');
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        }
        return model;
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        // Verify if there is any optional parameters on req
        if (Object.keys(req.query).length > 0) {
            await BrandRouter.encapsulatedRequest(req, res, async () => {
                let model: Brand;
                let dbRes;
                let data = [];

                // parse requisition query to a object
                try {
                    model = new Brand();
                    await model.clone(req.query);
                } catch(e) {
                    throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
                }         
                // returns data from table based on optional parameters
                try {
                    dbRes = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getCompost(model), 
                    BrandRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                }
                // Merge all dependencies of object into returning data
                if (dbRes instanceof Array) {
                    for (let obj of dbRes) {
                        let model = await BrandRouter.mergeDependencies(obj);
                        data.push(model);
                    }
                } else {
                    data = await BrandRouter.mergeDependencies(dbRes);
                }
                return data;
            });
        } else {
            await BrandRouter.encapsulatedRequest(req, res, async () => {
                let dbRes;
                let data = [];
                // returns all the data from table
                try {
                    dbRes = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getAll(), 
                    BrandRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                }
                // Merge all dependencies of object into returning data
                if (dbRes instanceof Array) {
                    for (let obj of dbRes) {
                        let model = await BrandRouter.mergeDependencies(obj);
                        data.push(model);
                    }
                } else {
                    data = await BrandRouter.mergeDependencies(dbRes);
                }
                return data;
            });
        }
    }

    public async get(req: Request, res: Response, next: NextFunction) {      
        await BrandRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Brand;
            
            //get object
            try {
                model = new Brand();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            //query
            try {
                dbRes = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().get(model), 
                BrandRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            // Merge all dependencies of object into returning data
            return await BrandRouter.mergeDependencies(dbRes);
        });     
    }

    public async getAllEquipments(req: Request, res: Response, next: NextFunction) {
        await BrandRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            try {
                dbRes = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getAllEquipments(), 
                BrandRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            return dbRes;
        });
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        await BrandRouter.encapsulatedRequest(req, res, async () => {
            let model: Brand;
            let rowCount: number;
            let inserted = [];
            //get object
            try {
                model = new Brand();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate UK's
            let validationModels = [];

            let valModel01 = new Brand();
            valModel01.setName(model.getName())

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getCompost(model), 
                    BrandRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                BrandRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                inserted = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().post(model), 
                BrandRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            BrandRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            BrandRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            let insertedId = inserted[0].idmarca;

            //insert related objects
            for (let obj of model.getEquipments()) {
                if (obj) {
                    //validate object
                    try {
                        if (!obj.getId() || obj.getId() == 0){
                            throw 'O campo idaparelho deve estar preenchido ao adicionar um relacionamento entre Marca x Aparelho.';
                        }
                    } catch(e) {
                        throw {exception: e, errorCode: BrandRouter.RESULT_CODE_DATA_VALID_ERROR};
                    }
                    let relation = new BrandEquipmentRelation();
                    relation.clone({
                        idmarca: insertedId,
                        idaparelho: obj.getId()
                    });
                    //query
                    try {
                        rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().postBrandEquipmentRelation(relation), 
                        BrandRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    BrandRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    BrandRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                }
            }
        }); 
    }

    public async postReturningObject(req: Request, res: Response, next: NextFunction) {
        await BrandRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Brand;
            let rowCount: number;
            let inserted = [];
            let insertedModel: Brand;
            //get object
            try {
                model = new Brand();
                model.clone(req.body.data);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Brand();
            valModel01.setName(model.getName());

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getCompost(model), 
                    BrandRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                BrandRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                inserted = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().post(model), 
                BrandRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            BrandRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            BrandRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            let insertedId = inserted[0].idmarca;

            //insert related objects
            for (let obj of model.getEquipments()) {
                if (obj) {
                    //validate object
                    try {
                        if (!obj.getId() || obj.getId() == 0){
                            throw 'O campo idaparelho deve estar preenchido ao adicionar um relacionamento entre Marca x Aparelho.';
                        }
                    } catch(e) {
                        throw {exception: e, errorCode: BrandRouter.RESULT_CODE_DATA_VALID_ERROR};
                    }
                    let relation = new BrandEquipmentRelation();
                    relation.clone({
                        idmarca: insertedId,
                        idaparelho: obj.getId()
                    });
                    
                    //query
                    try {
                        rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().postBrandEquipmentRelation(relation), 
                        BrandRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    BrandRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    BrandRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                }
            }

            // Get inserted object
            try {
                insertedModel = new Brand()
                insertedModel.setId(insertedId);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            // query
            try {
                dbRes = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().get(insertedModel), 
                BrandRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            // Merge all dependencies of object into returning data
            return await BrandRouter.mergeDependencies(dbRes);
        }); 
    }

    public async put(req: Request, res: Response, next: NextFunction) {
        await BrandRouter.encapsulatedRequest(req, res, async () => {
            let model: Brand;
            let equipments = [];
            let rowCount: number;
            let dbRes;

            //get object
            try {
                model = new Brand();
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
                throw {exception: e, errorCode: BrandRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Brand();

            valModel01.setName(model.getName())
            validationModels.push(valModel01);

            for(let validation of validationModels) {
                try {
                    rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().validationQuery(validation, model), 
                    BrandRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                BrandRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().put(model), 
                BrandRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            BrandRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            BrandRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
            
            //get related object
            try {
                dbRes = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getBrandEquipmentRelation(model), 
                BrandRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }

            // merge data into related object array
            try {
                for (let obj of dbRes) {
                    let related = new BrandEquipmentRelation();
                    related.clone(obj);
                    equipments.push(related);
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            try {
                // Get the already existent relation of brand with equipments
                let actualRelation: BrandEquipmentRelation[] = model.getEquipments().map(obj => {
                    let relation = new BrandEquipmentRelation();
                    relation.clone({
                        idmarca: model.getId(),
                        idaparelho: obj.getId()
                    });
                    return relation;
                })
                
                // Iterate over body's data
                // if there are object on the body req that don't exist on database, insert it 
                let toInsert = actualRelation
                    .filter(relation => equipments.findIndex(obj => obj.equals(relation)) == -1);
                // if there are remaing object on database that weren't specified on the body req, delete them
                let toDelete = equipments
                    .filter(relation => actualRelation.findIndex(obj => obj.equals(relation)) == -1);
                                    
                for (let obj of toInsert) {  
                    // insert new object
                    try {
                        rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().postBrandEquipmentRelation(obj), 
                        BrandRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    BrandRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    BrandRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                }
                                
                for (let obj of toDelete) {
                    // delete related objects
                    try {
                        rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().deleteBrandEquipmentRelation(obj), 
                        BrandRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    BrandRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    BrandRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);                 
                }
                
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        });  
    }
    
    public async delete(req: Request, res: Response, next: NextFunction) {
        await BrandRouter.encapsulatedRequest(req, res, async () => {
            let model: Brand;
            let rowCount: number;

            //get object
            try {
                model = new Brand();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            try {
                rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().getServiceOrderDependency(model),
                BrandRouter.getDBConnector().returnRowCount);
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            BrandRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_SERVICE_ORDER_PENDING_DEPENDENCIES);

            // delete pending relations
            try {
                rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().deleteBrandEquipmentRelations(model), 
                BrandRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            //query
            try {
                rowCount = await BrandRouter.getDBConnector().runSQL(BrandRouter.getSQLProvider().delete(model), 
                BrandRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: BrandRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            BrandRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            BrandRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

        });  
    }
}

const brandRoutes = new BrandRouter();
export default brandRoutes.router;
