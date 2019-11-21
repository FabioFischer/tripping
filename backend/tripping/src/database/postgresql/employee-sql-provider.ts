import { GenericPostgreSQLProvider } from './generic-sql-provider';
import { Employee, EmployeeEquipmentRelation } from '../../model/employee.model'
import { Login } from '../../model/login.model';

export namespace PostgreSQL {

    export class DefaultEmployeeSQLProvider extends GenericPostgreSQLProvider {

        public getAll(): string {
            return `SELECT *
                    FROM t_funcionario
                    ORDER BY nome;`;
        }

        public getAllEquipments(): string {
            return `SELECT * 
                     FROM t_aparelho
                    ORDER BY nome`;
        }

        public getEquipments(model: Employee): string {
            return `SELECT apa.*
                     FROM t_aparelho_funcionario apf
                     INNER JOIN t_aparelho apa
                       ON apa.idAparelho = apf.idAparelho 
                    WHERE ${super.toQueryConditionFormat('apf.idFuncionario', model.getId())}`;
        }

        public get(model: Employee): string {
            return `SELECT *
                    FROM t_funcionario
                    WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())}`;
        }
        
        public getEmployeeEquipmentRelation(model: Employee) {
            return `SELECT * 
                      FROM t_aparelho_funcionario
                     WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())}`;
        }

        public validationQuery(validation: Employee, model: Employee): string {
            if (validation) {
                return `SELECT * 
                        FROM t_funcionario
                        ${super.toCompostQuery(validation)}
                        AND idFuncionario <> ${model.getId()}`;
            }
            return '';
        }

        public getCompost(model: Employee): string {
            console.log( `SELECT * 
            FROM t_funcionario
            ${super.toCompostQuery(model)}
            ORDER BY nome`)
            return `SELECT * 
                    FROM t_funcionario
                    ${super.toCompostQuery(model)}
                    ORDER BY nome`;
        }

        public post(model: Employee): string {
            return `INSERT INTO t_funcionario (
                        login,
                        nome,
                        tipo
                    )
                    VALUES (
                        ${super.getQueryValueString(model.getLogin())},
                        ${super.getQueryValueString(model.getName())},
                        ${super.getQueryValueString(model.getType().value)}
                    ) RETURNING idFuncionario`;
        }
        
        public postEmployeeLogin(model: Login): string {
            return `INSERT INTO t_func_login (hash, salt, idFuncionario)
                    VALUES (
                        ${super.getQueryValueString(model.getHash())},
                        ${super.getQueryValueString(model.getSalt())},
                        ${super.getQueryValueString(model.getFuncId())}
                    );`;
        }

        public postEmployeeEquipmentRelation(model: EmployeeEquipmentRelation): string {
            return `INSERT INTO t_aparelho_funcionario (idAparelho, idFuncionario) 
                    VALUES (${model.getEquipmentId()}, ${model.getEmployeeId()});`;
        }

        public put(model: Employee): string {
            return `UPDATE t_funcionario 
                    SET login = ${super.getQueryValueString(model.getLogin())},
                        nome = ${super.getQueryValueString(model.getName())},
                        tipo = ${super.getQueryValueString(model.getType().value)}
                    WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())};`;
        }
        
        public delete(model: Employee): string {
            return `DELETE FROM t_funcionario
                     WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())}`;
        }

        public deleteEmployeeAuthentication(model: Employee): string {
            return `DELETE FROM t_func_login
                     WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())}`;
        }

        public deleteEmployeeEquipmentRelation(model: EmployeeEquipmentRelation): string {
            return `DELETE FROM t_aparelho_funcionario 
                     WHERE ${super.toQueryConditionFormat('idFuncionario', model.getEmployeeId())}
                       AND ${super.toQueryConditionFormat('idAparelho', model.getEquipmentId())};`;
        }

        public deleteEmployeeEquipmentRelations(model: Employee): string {
            return `DELETE FROM t_aparelho_funcionario 
                     WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())}`;
        }

        public getServiceOrderDependency(model: Employee): string {
            return `SELECT *
                     FROM t_ordem_servico
                    WHERE ${super.toQueryConditionFormat('idFuncionario', model.getId())}`;
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