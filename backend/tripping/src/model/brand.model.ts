import { Equipment } from "./equipment.model";

export class Brand {
    private idmarca: number;
    private nome: string;
    private descricao: string;
    private aparelhos: Equipment[];

    setId(id): void {
        if (id == undefined) {
            this.idmarca = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idmarca deve ser numérico';
            }        
            this.idmarca = +id;
        }
    }       

    getId(): number {
        return this.idmarca;
    }

    setName(name): void {
        this.nome = name;
    }

    getName(): string {
        return this.nome;
    }

    setDescription(description): void {
        this.descricao = description;
    }

    getDescription(): string {
        return this.descricao;
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
        this.setId(clone.idmarca);
        this.setName(clone.nome);
        this.setDescription(clone.descricao);
        this.setEquipments(clone.aparelhos);
    }
    
    public validPostData() {
        if (this.getId() && this.getId() !== 0){
            throw new Error('ID da marca deve ser 0 ou nulo');
        }
        this.validateNotNullFields();
    }

    public validPutData() {
        if (!this.getId()){
            throw new Error('ID da marca deve estar preenchido');
        }
        this.validateNotNullFields();        
    }

    public validDeleteData() {
        if (!this.getId()){
            throw new Error('ID da marca deve estar preenchido');
        }
    }

    private validateNotNullFields() {
        if (!this.getName()) {
            throw new Error('Nome da marca deve estar preenchido');
        }
    }
}

export class BrandEquipmentRelation {
    private idmarca: number;
    private idaparelho: number;

    public setBrandId(brand_id): void {
        if (brand_id == undefined) {
            this.idmarca = brand_id;
        } else {
            if (isNaN(brand_id)){
                throw 'Campo idmarca deve ser numérico.';
            }        
            this.idmarca = +brand_id;
        }
    }

    public getBrandId(): number {
        return this.idmarca;
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
        this.setBrandId(clone.idmarca);
        this.setEquipmentId(clone.idaparelho);
    }

    public equals(other: BrandEquipmentRelation): boolean {
        return this.getEquipmentId() == other.getEquipmentId()
            && this.getBrandId() == other.getBrandId();
    }
}