
export class Equipment {
    private idaparelho: number;
    private nome: string;
    private descricao: string;

    setId(id): void {
        if (id == undefined) {
            this.idaparelho = id;
        } else {
            if (isNaN(id)){
                throw 'Campo idaparelho deve ser numérico';
            }        
            this.idaparelho = +id;
        }
    }       

    getId(): number {
        return this.idaparelho;
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

    clone(clone): void {
        if (clone.idaparelho) {
            this.setId(clone.idaparelho);
        }
        if (clone.id) {
            this.setId(clone.id);
        }
        this.setName(clone.nome);
        this.setDescription(clone.descricao);
    }
    
    public validPostData() {
        if (this.getId() && this.getId() !== 0){
            throw new Error('ID do equipamento deve ser 0 ou nulo');
        }
        this.validateNotNullFields();
    }

    public validPutData() {
        if (!this.getId()){
            throw new Error('ID do equipamento deve estar preenchido');
        }
        this.validateNotNullFields();        
    }

    public validDeleteData() {
        if (!this.getId()){
            throw new Error('ID do equipamento deve estar preenchido');
        }
    }

    private validateNotNullFields() {
        if (!this.getName()) {
            throw new Error('Nome do equipamento deve estar preenchido');
        }
    }
}