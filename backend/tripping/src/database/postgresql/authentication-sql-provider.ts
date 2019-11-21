import { GenericPostgreSQLProvider } from './generic-sql-provider';
import { Employee } from '../../model/employee.model'
import { Login } from '../../model/login.model';

export namespace PostgreSQL {

    export class DefaultAuthenticationSQLProvider extends GenericPostgreSQLProvider {

        public get(model: Employee): string {
            return `SELECT * 
                      FROM t_funcionario
                     WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())};`;
        }

        public getEquipments(model: Employee): string {
            return `SELECT apa.*
                     FROM t_aparelho_funcionario apf
                     INNER JOIN t_aparelho apa
                       ON apa.idAparelho = apf.idAparelho 
                    WHERE ${super.toQueryConditionFormat('apf.idFuncionario', model.getId())};`;
        }

        public getEmployeeLogin(model: Employee): string {
            return `SELECT flo.* 
                      FROM t_func_login flo
                      INNER JOIN t_funcionario fun
                        ON flo.idFuncionario = fun.idFuncionario
                    WHERE ${super.toQueryConditionFormat('fun.login', model.getLogin())};`;
        }

        public getEmployeeLoginByEmployeeId(model: Login): string {
            return `SELECT flo.* 
                      FROM t_func_login flo
                      INNER JOIN t_funcionario fun
                        ON flo.idFuncionario = fun.idFuncionario
                    WHERE ${super.toQueryConditionFormat('fun.idFuncionario', model.getFuncId())};`;
        }

        public putEmployeeLogin(model: Login): string {
            return `UPDATE t_func_login 
                    SET hash = ${super.getQueryValueString(model.getHash())},
                        salt = ${super.getQueryValueString(model.getSalt())},
                        idFuncionario = ${super.getQueryValueString(model.getFuncId())}
                    WHERE ${super.toQueryConditionFormat('idFuncionario', model.getFuncId())};`;
        }
    }
}