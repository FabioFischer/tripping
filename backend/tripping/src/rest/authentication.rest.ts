import { Request, Response, NextFunction } from 'express';

import { GenericRestResultCodes, GenericDBRest } from './generic.rest';
import { AuthenticationHelper } from '../core/authentication.helper';
import { Equipment } from '../model/equipment.model';
import { Employee } from '../model/employee.model';
import { Login } from '../model/login.model';

export class AuthenticationRouter extends GenericDBRest {

    private static RESULT_CODE_DATA_VALID_ERROR: string = '20';
 
    constructor() {
        super('authentication-sql-provider');
    }

    public init() {
        this.router.post('/login', this.login);
        this.router.post('/logout', this.logout);
        this.router.get('/token', this.encapsulatedAuthenticatior, this.token);
        this.router.put('/change_password', this.encapsulatedAuthenticatior, this.changePassword);
    }

    public encapsulatedAuthenticatior(req, res, next) {
        return AuthenticationRouter.authenticator(req, res, next);
    }

    public async setupSQLProvider(namespace){       
        this.setSQLProvider(new namespace.DefaultAuthenticationSQLProvider());
    }

    public getDBRequester() {
        return AuthenticationRouter.dbRequester;
    }

    public setDBRequester(dbRequester: any) {
        AuthenticationRouter.dbRequester = dbRequester;
    }

    public static getSQLProvider() {
        return AuthenticationRouter.dbRequester.sqlProvider;
    }

    public static getDBConnector() {
        return AuthenticationRouter.dbRequester.dbConnector;
    }

    public static async mergeDependencies(data): Promise<any> {
        let dbRes;
        let model = new Employee();
        try {
            model.clone(data);
        } catch (e) {
            throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
        }
        //get related objects
        try {
            dbRes = await AuthenticationRouter.getDBConnector().runSQL(AuthenticationRouter.getSQLProvider().getEquipments(model), 
            AuthenticationRouter.getDBConnector().returnAllRows);
        } catch(e) {
            throw {exception: e, errorCode: AuthenticationRouter.getDBConnector().getDBErrorCode(e)};
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
                model = AuthenticationRouter.appendIntoData(model, equipments, 'aparelhos');
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
        }
        return model;
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        await AuthenticationRouter.encapsulatedRequest(req, res, async () => {
            let authenticatedModel = new Login();
            let employee = new Employee();
            let reqBody = req.body.data;
            let dbRes = [];
            
            try {
                if (!reqBody) throw 'Dados da requisição não encontrados.'
                if (!reqBody.login) throw 'Dados da requisição devem conter uma propriedade "login".'
                if (!reqBody.senha) throw 'Dados da requisição devem conter uma propriedade "senha".'

                employee.setLogin(reqBody.login)
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_MODEL_ERROR};
            }
            try {
                dbRes = await AuthenticationRouter.getDBConnector().runSQL(AuthenticationRouter.getSQLProvider().getEmployeeLogin(employee), 
                AuthenticationRouter.getDBConnector().returnFirstRow);

                if (dbRes == null) {
                    throw 'Credenciais inválidas.';
                }

                authenticatedModel.clone(dbRes);
                if (!authenticatedModel.getFuncId() || authenticatedModel.getFuncId() === 0) {
                    throw 'Login de funcionário não encontrado.';
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_LOGIN_INVALID_CREDENTIALS};
            }

            try {
                employee.setId(authenticatedModel.getFuncId());

                dbRes = await AuthenticationRouter.getDBConnector().runSQL(AuthenticationRouter.getSQLProvider().get(employee), 
                AuthenticationRouter.getDBConnector().returnFirstRow);
                
                if (dbRes == null) {
                    throw 'Funcionário não encontrado.';
                }
                employee.clone(dbRes);
            } catch(e) {
                throw {exception: e, errorCode: AuthenticationRouter.getDBConnector().getDBErrorCode(e)};
            }

            try {
                /* 
                * Validate password
                */
                if (!AuthenticationHelper.verifyCredential(reqBody.senha, authenticatedModel.getHash(), authenticatedModel.getSalt())) {
                    throw 'Credenciais invalidas.';
                }
                /*
                * Merge employee dependencies and generate new signed token
                */
                let normalizedModel = await AuthenticationRouter.mergeDependencies(employee);
                AuthenticationRouter.appendResponseHeader(res, process.env.TOKEN_HEADER_DEFINITION, AuthenticationHelper.createToken(normalizedModel));
            } catch (e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_LOGIN_INVALID_CREDENTIALS};
            }

            /**
             * Set the requisition employee as the current login model
             */
            try {
                await AuthenticationRouter.setAuthenticatedEmployee(req, employee);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_LOGIN_UNAUTHENTICATED};
            }
        });
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        await AuthenticationRouter.encapsulatedRequest(req, res, async () => {
            /**
             * Does nothing right now
             */
            return;
        });
    }

    public async token(req: Request, res: Response, next: NextFunction) {
        await AuthenticationRouter.encapsulatedRequest(req, res, async () => {
            let model: Employee;
            try {
                /*
                * Generate new signed token
                */
                AuthenticationRouter.appendResponseHeader(res, process.env.TOKEN_HEADER_DEFINITION, AuthenticationHelper.createToken(model));
            } catch (e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_GENERIC_ERROR};
            }
            return AuthenticationRouter.mergeDependencies(model);
        });
    }

    public async changePassword(req: Request, res: Response, next: NextFunction) {
        await AuthenticationRouter.encapsulatedRequest(req, res, async () => {
            let dbRes;
            let model: Login;
            let rowCount: number;
            let reqBody = req.body.data;

            try {
                if (!reqBody) throw 'Dados da requisição não encontrados.'
                if (!reqBody.senha_anterior) throw 'Dados da requisição devem conter uma propriedade "senha_anterior".'
                if (!reqBody.nova_senha) throw 'Dados da requisição devem conter uma propriedade "nova_senha".'

                model = new Login();
                model.clone(reqBody);
                if (!model.getFuncId()){
                    throw 'Funcionário não encontrado.';
                }
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_LOGIN_INVALID_CREDENTIALS};
            }

            try {
                dbRes = await AuthenticationRouter.getDBConnector().runSQL(AuthenticationRouter.getSQLProvider().getEmployeeLoginByEmployeeId(model), 
                AuthenticationRouter.getDBConnector().returnFirstRow);

                if (dbRes == null) {
                    throw 'Credenciais inválidas';
                }
                model.clone(dbRes);
            } catch(e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_LOGIN_INVALID_CREDENTIALS};
            }

            /** Validate previous password */
            try {
                if (!AuthenticationHelper.verifyCredential(reqBody.senha_anterior, model.getHash(), model.getSalt())) {
                    throw 'Credenciais inválidas';
                }
            } catch (e) {
                throw {exception: e, errorCode: GenericRestResultCodes.RESULT_CODE_LOGIN_INVALID_CREDENTIALS};
            }

            /** Insert authentication data */
            try {
                let hashedPassword = AuthenticationHelper.segurifyCredential(reqBody.nova_senha);
                model.setHash(hashedPassword.hash);
                model.setSalt(hashedPassword.salt);
            } catch(e) {
                throw {exception: e, errorCode: AuthenticationRouter.RESULT_CODE_DATA_VALID_ERROR};
            }
            try {
                rowCount = await AuthenticationRouter.getDBConnector().runSQL(AuthenticationRouter.getSQLProvider().putEmployeeLogin(model), 
                AuthenticationRouter.getDBConnector().returnRowCount);
                rowCount = +rowCount;
            } catch(e) {
                throw {exception: e, errorCode: AuthenticationRouter.getDBConnector().getDBErrorCode(e)};
            }
        });
    }
}

const authenticationRoutes = new AuthenticationRouter();
export default authenticationRoutes.router;