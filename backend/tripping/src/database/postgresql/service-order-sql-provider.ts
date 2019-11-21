import { GenericPostgreSQLProvider } from "./generic-sql-provider";

import { ServiceOrder } from "../../model/service-order.model";
import { Customer } from "../../model/Customer.model";

export namespace PostgreSQL {

    export class DefaultServiceOrderSQLProvider extends GenericPostgreSQLProvider {

        public getAll(): string {
            return `SELECT *
                    FROM t_ordem_servico
                    ORDER BY idOs`;
        }

        public getAllEquipments(): string {
            return `SELECT * 
                    FROM t_aparelho
                    ORDER BY nome`;
        }

        public getAllBrands(): string {
            return `SELECT *
                    FROM t_marca
                    ORDER BY nome`;
        }

        public getAllCustomers(): string {
            return `SELECT *
                    FROM t_cliente
                    ORDER BY nome`;
        }

        public getAllEmployees(): string {
            return `SELECT * 
                    FROM t_funcionario
                    ORDER BY nome`
        }

        public get(model: ServiceOrder): string {
            return `SELECT *
                    FROM t_ordem_servico
                    WHERE ${super.toQueryConditionFormat('idOs', model.getId())}`;
        }

        // Ver quais status mostrar com o palestrinha 
        public getByCustomer(model: Customer): string {
            return `SELECT *
                    FROM t_ordem_servico ors
                    INNER JOIN t_cliente cnt
                      ON ors.idCliente = cnt.idCliente
                    WHERE ${super.toQueryConditionFormat('cnt.cpf', model.getCpf())}`;
        }

        public getCompost(model: ServiceOrder): string {
            return `SELECT * 
                    FROM t_ordem_servico
                    ${super.toCompostQuery(model)}
                    ORDER BY idOs`;
        }

        public getEquipment(model: ServiceOrder): string {
            return `SELECT * 
                    FROM t_aparelho
                    WHERE ${super.toQueryConditionFormat('idAparelho', model.getEquipmentId())};`;
        }

        public getBrand(model: ServiceOrder): string {
            return `SELECT * 
                    FROM t_marca
                    WHERE ${super.toQueryConditionFormat('idMarca', model.getBrandId())};`;
        }

        public getCustomer(model: ServiceOrder): string {
            return `SELECT * 
                    FROM t_cliente
                    WHERE ${super.toQueryConditionFormat('idCliente', model.getCustomerId())};`;
        }

        public getEmployee(model: ServiceOrder): string {
            return `SELECT * 
                    FROM t_funcionario
                    WHERE ${super.toQueryConditionFormat('idFuncionario', model.getEmployeeId())};`;
        }

        public post(model: ServiceOrder): string {
            return `INSERT INTO t_ordem_servico (		
						obs         
						,defeito		 
						,orcamento	
						,status		
						,data_ini	
						,data_prev	
						,idAparelho	
						,idMarca      
						,idCliente    
						,idFuncionario
                    )
                    VALUES (
                        ${super.getQueryValueString(model.getObs())},
                        ${super.getQueryValueString(model.getIssue())},
						${super.getQueryValueString(model.getTender())},
						${super.getQueryValueString(model.getStatus().getValue())},
						${super.getQueryValueString(model.getDataIni())},
						${super.getQueryValueString(model.getDataPrev())},
						${super.getQueryValueString(model.getEquipmentId())},
						${super.getQueryValueString(model.getBrandId())},
						${super.getQueryValueString(model.getCustomerId())},
						${super.getQueryValueString(model.getEmployeeId())}
                    ) RETURNING idOs`;
        }

        public put(model: ServiceOrder): string {
            return `UPDATE t_ordem_servico 
                    SET obs = ${super.getQueryValueString(model.getObs())},
                        defeito = ${super.getQueryValueString(model.getIssue())},
						orcamento = ${super.getQueryValueString(model.getTender())},
						status = ${super.getQueryValueString(model.getStatus().getValue())},
						data_ini = ${super.getQueryValueString(model.getDataIni())},
						data_prev = ${super.getQueryValueString(model.getDataPrev())},
						idAparelho = ${super.getQueryValueString(model.getEquipmentId())},
						idMarca = ${super.getQueryValueString(model.getBrandId())},
						idCliente = ${super.getQueryValueString(model.getCustomerId())},
						idFuncionario = ${super.getQueryValueString(model.getEmployeeId())}
                    WHERE ${super.toQueryConditionFormat('idOs', model.getId())};`;
        }
        
        public delete(model: ServiceOrder): string {
            return `DELETE FROM t_ordem_servico
                     WHERE ${super.toQueryConditionFormat('idOs', model.getId())}`;
        }
    }
}