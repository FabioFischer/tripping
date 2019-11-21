import { GenericPostgreSQLProvider } from './generic-sql-provider';
import { Customer } from '../../model/Customer.model'

export namespace PostgreSQL {

    export class DefaultCustomerSQLProvider extends GenericPostgreSQLProvider {

        public getAll(): string {
            return `SELECT *
                    FROM t_cliente
                    ORDER BY nome;`;
        }

        public get(model: Customer): string {
            return `SELECT *
                    FROM t_cliente
                    WHERE ${super.toQueryConditionFormat('idCliente', model.getId())}`;
        }

        public validationQuery(validation: Customer, model: Customer): string {
            if (validation) {
                return `SELECT * 
                        FROM t_cliente
                        ${super.toCompostQuery(validation)}
                        AND idCliente <> ${model.getId()}`;
            }
            return '';
        }

        public getCompost(model: Customer): string {
            return `SELECT * 
                    FROM t_cliente
                    ${super.toCompostQuery(model)}
                    ORDER BY nome`;
        }

        public post(model: Customer): string {
            return `INSERT INTO t_cliente (
                        nome,
                        cpf,
                        telefone
                    )
                    VALUES (
                        ${super.getQueryValueString(model.getName())},
                        ${super.getQueryValueString(model.getCpf())},
                        ${super.getQueryValueString(model.getTelephone())}
                    ) RETURNING idCliente`;
        }

        public put(model: Customer): string {
            return `UPDATE t_cliente 
                    SET nome = ${super.getQueryValueString(model.getName())},
                        cpf = ${super.getQueryValueString(model.getCpf())},
                        telefone = ${super.getQueryValueString(model.getTelephone())}
                    WHERE ${super.toQueryConditionFormat('idCliente', model.getId())};`;
        }
        
        public delete(model: Customer): string {
            return `DELETE FROM t_cliente
                     WHERE ${super.toQueryConditionFormat('idCliente', model.getId())}`;
        }

        public getServiceOrderDependency(model: Customer): string {
            return `SELECT *
                     FROM t_ordem_servico
                    WHERE ${super.toQueryConditionFormat('idCliente', model.getId())}`;
        }
    }
}