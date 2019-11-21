import { Request, Response, NextFunction } from 'express';

import { GenericRestResultCodes, GenericDBRest } from './generic.rest';
import { Employee, EmployeeEquipmentRelation, employeeTypes } from '../model/employee.model';
import { Equipment } from '../model/equipment.model';
import { AuthenticationHelper } from '../core/authentication.helper';
import { Login } from '../model/login.model';

export class EmployeeRouter extends GenericDBRest {

    private static RESULT_CODE_DATA_VALID_ERROR: string = '20';
 
    constructor() {
        super('employee-sql-provider');
    }

    public init() {
        this.router.get('/', this.encapsulatedAuthenticatior, this.getAll);
        this.router.get('/equipment/', this.encapsulatedAuthenticatior, this.getAllEquipments);
        this.router.get('/employee_types/', this.encapsulatedAuthenticatior, this.getAllEmployeeTypes);
        this.router.get('/:id', this.encapsulatedAuthenticatior, this.get);
        this.router.post('/', this.encapsulatedAuthenticatior, this.post);
        this.router.post('/returning_object', this.encapsulatedAuthenticatior, this.postReturningObject);
        this.router.put('/', this.encapsulatedAuthenticatior, this.put);
        this.router.delete('/:id', this.encapsulatedAuthenticatior, this.delete);
    }

    public encapsulatedAuthenticatior(req, res, next) {
        return EmployeeRouter.authenticator(req, res, next);
    }

    public async setupSQLProvider(namespace){       
        this.setSQLProvider(new namespace.DefaultEmployeeSQLProvider());
    }

    public getDBRequester() {
        return EmployeeRouter.dbRequester;
    }

    public setDBRequester(dbRequester: any) {
        EmployeeRouter.dbRequester = dbRequester;
    }

    public static getSQLProvider() {
        return EmployeeRouter.dbRequester.sqlProvider;
    }

    public static getDBConnector() {
        return EmployeeRouter.dbRequester.dbConnector;
    }

    public static async mergeDependencies(data): Promise<any> {
        let model = new Employee();
        let dbRes;
        try {
            model.clone(data);
        } catch (e) {
            throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
        }

        //get related objects
        try {
            dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getEquipments(model), 
            EmployeeRouter.getDBConnector().returnAllRows);
        } catch(e) {
            throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
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
                model = EmployeeRouter.appendIntoData(model, equipments, 'aparelhos');
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        }
        return model;
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        // Verify if there is any optional parameters on req
        if (Object.keys(req.query).length > 0) {
            await EmployeeRouter.encapsulatedRequest(req, res, async () => {
                let model: Employee;
                let dbRes;
                let data = [];

                // parse requisition query to a object
                try {
                    model = new Employee();
                    await model.clone(req.query);
                } catch(e) {
                    throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
                }         
                // returns data from table based on optional parameters
                try {
                    dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getCompost(model), 
                    EmployeeRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                }
                // Merge all dependencies of object into returning data
                if (dbRes instanceof Array) {
                    for (let obj of dbRes) {
                        let model = await EmployeeRouter.mergeDependencies(obj);
                        data.push(model);
                    }
                } else {
                    data = await EmployeeRouter.mergeDependencies(dbRes);
                }
                return data;
            });
        } else {
            await EmployeeRouter.encapsulatedRequest(req, res, async () => {
                let dbRes;
                let data = [];
                // returns all the data from table
                try {
                    dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getAll(), 
                    EmployeeRouter.getDBConnector().returnAllRows);
                } catch(e) {
                    throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                }
                // Merge all dependencies of object into returning data
                if (dbRes instanceof Array) {
                    for (let obj of dbRes) {
                        let model = await EmployeeRouter.mergeDependencies(obj);
                        data.push(model);
                    }
                } else {
                    data = await EmployeeRouter.mergeDependencies(dbRes);
                }
                return data;
            });
        }
    }

    public async get(req: Request, res: Response, next: NextFunction) {      
        await EmployeeRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Employee;
            
            //get object
            try {
                model = new Employee();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            //query
            try {
                dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().get(model), 
                EmployeeRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            // Merge all dependencies of object into returning data
            return await EmployeeRouter.mergeDependencies(dbRes);
        });     
    }

    public async getAllEquipments(req: Request, res: Response, next: NextFunction) {
        await EmployeeRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            try {
                dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getAllEquipments(), 
                EmployeeRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            return dbRes;
        });
    }

    public async getAllEmployeeTypes(req: Request, res: Response, next: NextFunction) {
        await EmployeeRouter.encapsulatedRequest(req, res, async () => {
            return employeeTypes;
        });
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        await EmployeeRouter.encapsulatedRequest(req, res, async () => {
            let model: Employee;
            let rowCount: number;
            let inserted = [];
            let reqBody = req.body.data;
            //get object
            try {
                model = new Employee();
                model.clone(reqBody);
                if(!model.getType()) {
                    model.setType('DEFAULT');
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate UK's
            let validationModels = [];

            let valModel01 = new Employee();
            valModel01.setLogin(model.getLogin());

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getCompost(model), 
                    EmployeeRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                EmployeeRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                inserted = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().post(model), 
                EmployeeRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EmployeeRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EmployeeRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            let insertedId = inserted[0].idfuncionario;
            try {
                if (!reqBody.senha || reqBody.senha == '') throw 'Dados da requisição devem conter uma propriedade "senha".'
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            /** Insert authentication data */
            let authenticationModel = new Login();
            try {
                let hashedPassword = AuthenticationHelper.segurifyCredential(reqBody.senha);
                authenticationModel.clone({
                    hash: hashedPassword.hash,
                    salt: hashedPassword.salt,
                    idfuncionario: insertedId
                });
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            try {
                rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().postEmployeeLogin(authenticationModel), 
                EmployeeRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            //insert related objects
            for (let obj of model.getEquipments()) {
                if (obj) {
                    //validate object
                    try {
                        if (!obj.getId() || obj.getId() == 0){
                            throw 'O campo idfuncionario deve estar preenchido ao adicionar um relacionamento entre Funcionario x Aparelho.';
                        }
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
                    }
                    let relation = new EmployeeEquipmentRelation();
                    relation.clone({
                        idfuncionario: insertedId,
                        idaparelho: obj.getId()
                    });
                    //query
                    try {
                        rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().postEmployeeEquipmentRelation(relation), 
                        EmployeeRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                }
            }
        }); 
    }

    public async postReturningObject(req: Request, res: Response, next: NextFunction) {
        await EmployeeRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Employee;
            let rowCount: number;
            let inserted = [];
            let insertedModel: Employee;

            let reqBody = req.body.data;
            //get object
            try {
                model = new Employee();
                model.clone(reqBody);
                if(!model.getType()) {
                    model.setType('DEFAULT');
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPostData();
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Employee();
            valModel01.setLogin(model.getLogin());

            validationModels.push(valModel01);

            for(let model of validationModels) {
                try {
                    rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getCompost(model), 
                    EmployeeRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                EmployeeRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                inserted = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().post(model), 
                EmployeeRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EmployeeRouter.validateRowCount(inserted.length > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EmployeeRouter.validateRowCount(inserted.length <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            let insertedId = inserted[0].idfuncionario;
            try {
                if (!reqBody.senha || reqBody.senha == '') throw 'Dados da requisição devem conter uma propriedade "senha".'
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            /** Insert authentication data */
            let authenticationModel = new Login();
            try {
                let hashedPassword = AuthenticationHelper.segurifyCredential(reqBody.senha);
                authenticationModel.clone({
                    hash: hashedPassword.hash,
                    salt: hashedPassword.salt,
                    idfuncionario: insertedId
                });
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            try {
                rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().postEmployeeLogin(authenticationModel), 
                EmployeeRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);

            //insert related objects
            for (let obj of model.getEquipments()) {
                if (obj) {
                    //validate object
                    try {
                        if (!obj.getId() || obj.getId() == 0){
                            throw 'O campo idfuncionario deve estar preenchido ao adicionar um relacionamento entre Funcionario x Aparelho.';
                        }
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
                    }
                    let relation = new EmployeeEquipmentRelation();
                    relation.clone({
                        idfuncionario: insertedId,
                        idaparelho: obj.getId()
                    });
                    
                    //query
                    try {
                        rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().postEmployeeEquipmentRelation(relation), 
                        EmployeeRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                }
            }

            // Get inserted object
            try {
                insertedModel = new Employee()
                insertedModel.setId(insertedId);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            // query
            try {
                dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().get(insertedModel), 
                EmployeeRouter.getDBConnector().returnFirstRow);
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            // Merge all dependencies of object into returning data
            return await EmployeeRouter.mergeDependencies(dbRes);
        }); 
    }

    public async put(req: Request, res: Response, next: NextFunction) {
        await EmployeeRouter.encapsulatedRequest(req, res, async () => {
            let model: Employee;
            let equipments = [];
            let rowCount: number;
            let dbRes;

            let reqBody = req.body.data;

            //get object
            try {
                model = new Employee();
                model.clone(reqBody);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            //validate object
            try {
                model.validPutData();
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            // validate PK's
            let validationModels = [];

            let valModel01 = new Employee();

            valModel01.setLogin(model.getLogin())
            validationModels.push(valModel01);

            for(let validation of validationModels) {
                try {
                    rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().validationQuery(validation, model), 
                    EmployeeRouter.getDBConnector().returnRowCount);
                    rowCount = +rowCount;
                } catch(e) {
                    throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                }
                //validate return - rowCount > 0
                EmployeeRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_OBJECT_ALREADY_EXISTS);                
            }

            //query
            try {
                rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().put(model), 
                EmployeeRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
            

            if (reqBody.senha && reqBody.senha != '') {
                let authenticationModel = new Login();
                /** 
                 * Check if user already have a authentication profile
                 */
                try {
                    dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getEmployeeLoginByEmployeeId(model), 
                    EmployeeRouter.getDBConnector().returnFirstRow);
                } catch(e) {
                    throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                } 

                let hashedPassword = AuthenticationHelper.segurifyCredential(reqBody.senha);
                if (dbRes) {
                    authenticationModel.clone(dbRes);
                    /** Insert authentication data */
                    try {
                        authenticationModel.setHash(hashedPassword.hash);
                        authenticationModel.setSalt(hashedPassword.salt);
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
                    }
                    try {
                        rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().putEmployeeLogin(authenticationModel), 
                        EmployeeRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                } else {
                    /** Insert authentication data */
                    try {
                        authenticationModel.clone({
                            hash: hashedPassword.hash,
                            salt: hashedPassword.salt,
                            idfuncionario: model.getId()
                        });
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.RESULT_CODE_DATA_VALID_ERROR};
                    }
                    try {
                        rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().postEmployeeLogin(authenticationModel), 
                        EmployeeRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                }
            }

            //get related object
            try {
                dbRes = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getEmployeeEquipmentRelation(model), 
                EmployeeRouter.getDBConnector().returnAllRows);
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }

            // merge data into related object array
            try {
                for (let obj of dbRes) {
                    let related = new EmployeeEquipmentRelation();
                    related.clone(obj);
                    equipments.push(related);
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            try {
                // Get the already existent relation of Employee with equipments
                let actualRelation: EmployeeEquipmentRelation[] = model.getEquipments().map(obj => {
                    let relation = new EmployeeEquipmentRelation();
                    relation.clone({
                        idfuncionario: model.getId(),
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
                        rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().postEmployeeEquipmentRelation(obj), 
                        EmployeeRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
                }
                                
                for (let obj of toDelete) {
                    // delete related objects
                    try {
                        rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().deleteEmployeeEquipmentRelation(obj), 
                        EmployeeRouter.getDBConnector().returnRowCount);
                        rowCount = +rowCount;
                    } catch(e) {
                        throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
                    }
                    //validate return - rowCount > 1
                    EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
                    //validate return - rowCount <= 0
                    EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);                 
                }
                
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        });  
    }
    
    public async delete(req: Request, res: Response, next: NextFunction) {
        await EmployeeRouter.encapsulatedRequest(req, res, async () => {
            let model: Employee;
            let rowCount: number;

            //get object
            try {
                model = new Employee();
                model.setId(req.params.id);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }

            try {
                rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().getServiceOrderDependency(model),
                EmployeeRouter.getDBConnector().returnRowCount);
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            EmployeeRouter.validateRowCount(rowCount > 0, GenericRestResultCodes.RESULT_CODE_DB_SERVICE_ORDER_PENDING_DEPENDENCIES);

            // delete pending relations
            try {
                rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().deleteEmployeeEquipmentRelations(model), 
                EmployeeRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }

            // delete pending relations
            try {
                rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().deleteEmployeeAuthentication(model), 
                EmployeeRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            //query
            try {
                rowCount = await EmployeeRouter.getDBConnector().runSQL(EmployeeRouter.getSQLProvider().delete(model), 
                EmployeeRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: EmployeeRouter.getDBConnector().getDBErrorCode(e)};
            }
            //validate return - rowCount > 1
            EmployeeRouter.validateRowCount(rowCount > 1, GenericRestResultCodes.RESULT_CODE_DB_MORE_THAN_ONE_ROW);
            //validate return - rowCount <= 0
            EmployeeRouter.validateRowCount(rowCount <= 0, GenericRestResultCodes.RESULT_CODE_DB_LESS_EQUAL_ZERO_ROW);
        });  
    }
}

const employeeRoutes = new EmployeeRouter();
export default employeeRoutes.router;
