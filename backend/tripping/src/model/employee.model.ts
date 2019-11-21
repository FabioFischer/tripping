import { GenericOption } from "./generic-option.model";
import { Equipment } from "./equipment.model";

export class Employee {
    private idfuncionario: number;
    private login: string;
    private nome: string;
    private tipo: EmployeeType;
    private aparelhos: Equipment[];

    setId(id): void {
        if (id == undefined) {
            this.idfuncionario = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idfuncionario deve ser numérico';
            }        
            this.idfuncionario = +id;
        }
    }       

    getId(): number {
        return this.idfuncionario;
    }

    setLogin(login): void {
        this.login = login;
    }

    getLogin(): string {
        return this.login;
    }

    setName(name): void {
        this.nome = name;
    }

    getName(): string {
        return this.nome;
    }

    setType(type): void {
        if (type == undefined) {
            this.tipo = type;
        } else {
            let model;
            if (type && type.value) {
                model = employeeTypes.find(userType => type.value == userType.value);
                if (!model) {
                    throw 'O tipo especificado não pertence ao conjunto de tipos válidos para funcionarios';
                }
            } else {
                model = employeeTypes.find(userType => type == userType.value);
                if (!model) {
                    throw 'O tipo especificado não pertence ao conjunto de tipos válidos para funcionarios';
                }
            }
            this.tipo = model;
        }
    }

    getType(): EmployeeType {
        return this.tipo;
    }

    setEquipments(equipments): void {
        if (!equipments) {
            this.aparelhos = [];
        } else {
            if (equipments instanceof Array) {
                this.aparelhos = equipments.map(obj => {
                    if (obj) {
                        let model = new Equipment();
                        model.clone(obj)
                        return model;
                    }
                    return undefined;
                });
            }
        }
    }

    getEquipments(): Equipment[] {
        return this.aparelhos;
    }

    clone(clone): void {
        this.setId(clone.idfuncionario);
        this.setLogin(clone.login);
        this.setName(clone.nome);
        this.setType(clone.tipo);
        this.setEquipments(clone.aparelhos);
    }
    
    public validPostData() {
        if (this.getId() && this.getId() !== 0){
            throw new Error('ID do funcionario deve ser 0 ou nulo');
        }
        this.validateNotNullFields();
    }

    public validPutData() {
        if (!this.getId()){
            throw new Error('ID do funcionario deve estar preenchido');
        }
        this.validateNotNullFields();        
    }

    public validDeleteData() {
        if (!this.getId()){
            throw new Error('ID do funcionario deve estar preenchido');
        }
    }

    private validateNotNullFields() {
        if (!this.getLogin()) {
            throw new Error('Login do funcionario deve estar preenchido');
        }
        if (!this.getType()) {
            throw new Error('Tipo do funcionario deve estar preenchido');
        }
        if (!this.getName()) {
            throw new Error('Nome do funcionario deve estar preenchido.');
        }
    }
}

export class EmployeeType extends GenericOption {
    public display: string;
    public value: string;

    constructor (display, value) {
        super();
        this.display = display;
        this.value = value;
    }

    public getValue() {
        return this.value;
    }
}

export class EmployeeEquipmentRelation {
    private idfuncionario: number;
    private idaparelho: number;

    public setEmployeeId(employee_id): void {
        if (employee_id == undefined) {
            this.idfuncionario = employee_id;
        } else {
            if (isNaN(employee_id)){
                throw 'Campo idfuncionario deve ser numérico.';
            }        
            this.idfuncionario = +employee_id;
        }
    }

    public getEmployeeId(): number {
        return this.idfuncionario;
    }

    public setEquipmentId(equipment_id): void {
        if (equipment_id == undefined) {
            this.idaparelho = equipment_id;
        } else {
            if (isNaN(equipment_id)){
                throw 'Campo idaparelho deve ser numérico.';
            }        
            this.idaparelho = +equipment_id;
        }
    }

    public getEquipmentId(): number {
        return this.idaparelho;
    }

    public clone(clone): void {
        this.setEmployeeId(clone.idfuncionario);
        this.setEquipmentId(clone.idaparelho);
    }

    public equals(other: EmployeeEquipmentRelation): boolean {
        return this.getEquipmentId() == other.getEquipmentId()
            && this.getEmployeeId() == other.getEmployeeId();
    }
}

export const employeeTypes: EmployeeType[] = [
    new EmployeeType(
        'Funcionário Padrão', 
        'DEFAULT'
    ),
    new EmployeeType(
        'Funcionário Administrador', 
        'ADMIN'
    )
];
