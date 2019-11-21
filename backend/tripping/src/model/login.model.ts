
export class Login {
    private iduser: number;
    private hash: string;
    private salt: string;
    private idfuncionario: number;

    setId(id): void {
        if (id == undefined) {
            this.iduser = id;
        } else {
            if (isNaN(id)){
                throw 'Campo iduser deve ser numérico';
            }        
            this.iduser = +id;
        }
    }       

    getId(): number {
        return this.iduser;
    }

    setHash(hash): void {
        this.hash = hash;
    }

    getHash(): string {
        return this.hash;
    }

    setSalt(salt): void {
        this.salt = salt;
    }

    getSalt(): string {
        return this.salt;
    }

    setFuncId(id): void {
        if (id == undefined) {
            this.idfuncionario = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idfuncionario deve ser numérico';
            }        
            this.idfuncionario = +id;
        }
    }       

    getFuncId(): number {
        return this.idfuncionario;
    }

    clone(clone): void {
        this.setId(clone.iduser);
        this.setHash(clone.hash);
        this.setSalt(clone.salt);
        this.setFuncId(clone.idfuncionario);
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
        if (!this.getHash()) {
            throw new Error('Hash da senha deve estar preenchido');
        }
        if (!this.getSalt()) {
            throw new Error('Salt da senha deve estar preenchido');
        }
        if (!this.getFuncId()) {
            throw new Error('O ID do funcionario deve estar associado');
        }
    }
}