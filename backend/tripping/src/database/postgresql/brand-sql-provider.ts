import { GenericPostgreSQLProvider } from './generic-sql-provider';
import { Brand, BrandEquipmentRelation } from '../../model/brand.model'

export namespace PostgreSQL {

    export class DefaultBrandSQLProvider extends GenericPostgreSQLProvider {

        public getAll(): string {
            return `SELECT *
                    FROM t_marca
                    ORDER BY nome;`;
        }

        public getAllEquipments(): string {
            return `SELECT * 
                     FROM t_aparelho
                    ORDER BY nome`;
        }

        public getEquipments(model: Brand): string {
            return `SELECT apa.*
                     FROM t_aparelho_marca apm
                     INNER JOIN t_aparelho apa
                       ON apa.idAparelho = apm.idAparelho 
                    WHERE ${super.toQueryConditionFormat('apm.idMarca', model.getId())}`;
        }

        public get(model: Brand): string {
            return `SELECT *
                    FROM t_marca
                    WHERE ${super.toQueryConditionFormat('idMarca', model.getId())}`;
        }

        public validationQuery(validation: Brand, model: Brand): string {
            if (validation) {
                return `SELECT * 
                        FROM t_marca
                        ${super.toCompostQuery(validation)}
                        AND idMarca <> ${model.getId()}`;
            }
            return '';
        }

        public getCompost(model: Brand): string {
            return `SELECT * 
                    FROM t_marca
                    ${super.toCompostQuery(model)}
                    ORDER BY nome`;
        }

        public getBrandEquipmentRelation(model: Brand) {
            return `SELECT * 
                      FROM t_aparelho_marca
                     WHERE ${super.toQueryConditionFormat('idMarca', model.getId())}`;
        }

        public post(model: Brand): string {
            return `INSERT INTO t_marca (
                        nome,
                        descricao
                    )
                    VALUES (
                        ${super.getQueryValueString(model.getName())},
                        ${super.getQueryValueString(model.getDescription())}
                    ) RETURNING idMarca`;
        }

        public postBrandEquipmentRelation(model: BrandEquipmentRelation): string {
            return `INSERT INTO t_aparelho_marca (idAparelho, idMarca) 
                    VALUES (${model.getEquipmentId()}, ${model.getBrandId()});`;
        }

        public put(model: Brand): string {
            return `UPDATE t_marca 
                    SET nome = ${super.getQueryValueString(model.getName())},
                        descricao = ${super.getQueryValueString(model.getDescription())}
                    WHERE ${super.toQueryConditionFormat('idMarca', model.getId())};`;
        }
        
        public delete(model: Brand): string {
            return `DELETE FROM t_marca
                     WHERE ${super.toQueryConditionFormat('idMarca', model.getId())}`;
        }

        public deleteBrandEquipmentRelation(model: BrandEquipmentRelation): string {
            return `DELETE FROM t_aparelho_marca 
                     WHERE ${super.toQueryConditionFormat('idMarca', model.getBrandId())}
                       AND ${super.toQueryConditionFormat('idAparelho', model.getEquipmentId())};`;
        }

        public deleteBrandEquipmentRelations(model: Brand): string {
            return `DELETE FROM t_aparelho_marca 
                     WHERE ${super.toQueryConditionFormat('idMarca', model.getId())}`;
        }

        public getServiceOrderDependency(model: Brand): string {
            return `SELECT *
                     FROM t_ordem_servico
                    WHERE ${super.toQueryConditionFormat('idMarca', model.getId())}`;
        }
    }
}