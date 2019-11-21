
export class Customer {
    private idcliente: number;
    private nome: string;
    private cpf: string;
    private telefone: string;

    setId(id): void {
        if (id == undefined) {
            this.idcliente = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idcliente deve ser numérico';
            }        
            this.idcliente = +id;
        }
    }       

    getId(): number {
        return this.idcliente;
    }

    setName(nome): void {
        this.nome = nome;
    }

    getName(): string {
        return this.nome;
    }

    setCpf(cpf): void {
        this.cpf = cpf;
    }

    getCpf(): string {
        return this.cpf;
    }

    setTelefone(telefone): void {
        this.telefone = telefone;
    }

    getTelephone(): string {
        return this.telefone;
    }

    clone(clone): void {
        this.setId(clone.idcliente);
        this.setName(clone.nome);
        this.setCpf(clone.cpf);
        this.setTelefone(clone.telefone);
    }
    
    public validPostData() {
        if (this.getId() && this.getId() !== 0){
            throw new Error('ID da cliente deve ser 0 ou nulo');
        }
        this.validateNotNullFields();
    }

    public validPutData() {
        if (!this.getId()){
            throw new Error('ID da cliente deve estar preenchido');
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
            throw new Error('Nome do cliente deve estar preenchido');
        }
        if (!this.getCpf()) {
            throw new Error('CPF do cliente deve estar preenchido');
        }
        if (!this.getTelephone()) {
            throw new Error('Telefone do cliente deve estar preenchido');
        }
    }
}