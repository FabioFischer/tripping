import { GenericOption } from "./generic-option.model";

export class ServiceOrder {
    private idos: number;
    private obs: string;
    private defeito: string;
    private orcamento: number;
	private status: ServiceOrderStatus;
	private data_ini: Date;
	private data_prev: Date;
	private idaparelho: number;
	private idmarca: number;
	private idcliente: number;
	private idfuncionario: number;
	
    setId(id): void {
        if (id == undefined) {
            this.idos = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idos deve ser numérico';
            }        
            this.idos = +id;
        }
    }       

    getId(): number {
        return this.idos;
    }

    setObs(obs): void {
        this.obs = obs;
    }

    getObs(): string {
        return this.obs;
    }
	
	setIssue(issue): void {
        this.defeito = issue;
    }

    getIssue(): string {
        return this.defeito;
    }
	
	setTender(tender): void {
        this.orcamento = tender;
    }

    getTender(): number{
        return this.orcamento;
    }
    
	setStatus(status): void {
        if (status == undefined) {
            this.status = status;
        } else {
            let model;
            if (status && status.value) {
                model = serviceOrderStatuses.find(serviceOrderStatus => status.value == serviceOrderStatus.value);
                if (!model) {
                    throw 'O tipo especificado não pertence ao conjunto de tipos válidos para funcionarios';
                }
            } else {
                model = serviceOrderStatuses.find(serviceOrderStatus => status == serviceOrderStatus.value);
                if (!model) {
                    throw 'O tipo especificado não pertence ao conjunto de tipos válidos para funcionarios';
                }
            }
            this.status = model;
        }
    }

    getStatus(): ServiceOrderStatus {
        return this.status;
    }
	
	setDataIni(data_ini): void {
        this.data_ini = new Date (data_ini);
    }

    getDataIni(): string {
        return this.data_ini ? this.data_ini.toISOString() : undefined;
    }

	setDataPrev(data_prev): void {
        this.data_prev = new Date (data_prev);
    }

    getDataPrev(): string {
        return this.data_prev? this.data_prev.toISOString() : undefined;
    }
    
	setEquipmentId(id): void {
        if (id == undefined) {
            this.idaparelho = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idaparelho deve ser numérico';
            }        
            this.idaparelho = +id;
        }
    }       

    getEquipmentId(): number {
        return this.idaparelho;
    }
	
	setBrandId(id): void {
        if (id == undefined) {
            this.idmarca = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idmarca deve ser numérico';
            }        
            this.idmarca = +id;
        }
    }       

    getBrandId(): number {
        return this.idmarca;
    }
	
	setCustomerId(id): void {
        if (id == undefined) {
            this.idcliente = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idcliente deve ser numérico';
            }        
            this.idcliente = +id;
        }
    }       

    getCustomerId(): number {
        return this.idcliente;
    }
	
	setEmployeeId(id): void {
        if (id == undefined) {
            this.idfuncionario = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idfuncionario deve ser numérico';
            }        
            this.idfuncionario = +id;
        }
    }       

    getEmployeeId(): number {
        return this.idfuncionario;
    }
	
    clone(clone): void {
        this.setId(clone.idos);
		this.setObs(clone.obs);
		this.setIssue(clone.defeito);
		this.setTender(clone.orcamento);
		this.setStatus(clone.status);
		this.setDataIni(clone.data_ini);
		this.setDataPrev(clone.data_prev);
		this.setEquipmentId(clone.idaparelho);
		this.setBrandId(clone.idmarca);
		this.setCustomerId(clone.idcliente);
		this.setEmployeeId(clone.idfuncionario);
    }
    
    public validPostData() {
        if (this.getId() && this.getId() !== 0){
            throw new Error('ID da OS deve ser 0 ou nulo');
        }
        this.validateNotNullFields();
    }

    public validPutData() {
        if (!this.getId()){
            throw new Error('ID da OS deve estar preenchido');
        }
        this.validateNotNullFields();        
    }

    public validDeleteData() {
        if (!this.getId()){
            throw new Error('ID da OS deve estar preenchido');
        }
    }

    private validateNotNullFields() {
        if (!this.getIssue()) {
            throw new Error('Defeito da OS deve estar preenchido');
        }
        if (!this.getDataIni()) {
            throw new Error('Data de inicio da OS deve estar preenchido.');
        }
		if (!this.getDataPrev()) {
            throw new Error('Data de previsão da OS deve estar preenchido.');
        }
		if (!this.getEquipmentId()) {
            throw new Error('Aparelho da OS deve estar preenchido.');
        }
		if (!this.getBrandId()) {
            throw new Error('Marca do Aparelho da OS deve estar preenchido.');
        }
		if (!this.getCustomerId()) {
            throw new Error('Cliente da OS deve estar preenchido.');
        }
		if (!this.getEmployeeId()) {
            throw new Error('Funcionario da OS deve estar preenchido.');
        }
    }
}


export class ServiceOrderStatus extends GenericOption {
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

export const serviceOrderStatuses: ServiceOrderStatus[] = [
    new ServiceOrderStatus(
        'Pendente Orçamento', 
        'PENDING TENDER'
    ),
    new ServiceOrderStatus(
        'Aguardando Aprovação', 
        'APPROVAL PENDING'
    ),
	new ServiceOrderStatus(
        'Aprovado', 
        'APPROVED'
    ),
	new ServiceOrderStatus(
        'Reprovado', 
        'REPPROVED'
    ),
	new ServiceOrderStatus(
        'Em Conserto', 
        'IN REPAIR'
    ),
	new ServiceOrderStatus(
        'Pronto', 
        'FINISHED'
    ),
	new ServiceOrderStatus(
        'Sem Ônus', 
        'NO ONUS'
    )
];
