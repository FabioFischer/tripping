import { GenericPostgreSQLProvider } from './generic-sql-provider';
import { Equipment } from '../../model/equipment.model'

export namespace PostgreSQL {

    export class DefaultEquipmentSQLProvider extends GenericPostgreSQLProvider {

        public getAll(): string {
            return `SELECT *
                    FROM t_aparelho
                    ORDER BY nome;`;
        }

        public get(model: Equipment): string {
            return `SELECT *
                    FROM t_aparelho
                    WHERE ${super.toQueryConditionFormat('idAparelho', model.getId())}`;
        }

        public validationQuery(validation: Equipment, model: Equipment): string {
            if (validation) {
                return `SELECT * 
                        FROM t_aparelho
                        ${super.toCompostQuery(validation)}
                        AND idAparelho <> ${model.getId()}`;
            }
            return '';
        }

        public getCompost(model: Equipment): string {
            return `SELECT * 
                    FROM t_aparelho
                    ${super.toCompostQuery(model)}
                    ORDER BY nome`;
        }

        public post(model: Equipment): string {
            return `INSERT INTO t_aparelho (
                        nome,
                        descricao
                    )
                    VALUES (
                        ${super.getQueryValueString(model.getName())},
                        ${super.getQueryValueString(model.getDescription())}
                    ) RETURNING idAparelho`;
        }

        public put(model: Equipment): string {
            return `UPDATE t_aparelho 
                    SET nome = ${super.getQueryValueString(model.getName())},
                        descricao = ${super.getQueryValueString(model.getDescription())}
                    WHERE ${super.toQueryConditionFormat('idAparelho', model.getId())};`;
        }
        
        public delete(model: Equipment): string {
            return `DELETE FROM t_aparelho
                     WHERE ${super.toQueryConditionFormat('idAparelho', model.getId())}`;
        }

        public getServiceOrderDependency(model: Equipment): string {
            return `SELECT *
                     FROM t_ordem_servico
                    WHERE ${super.toQueryConditionFormat('idAparelho', model.getId())}`;
        }
    }
}