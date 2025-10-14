import * as readline from 'readline';

class Disciplina {
  private nome: string;
  private notas: number[];
  private faltas: number;
  private media: number;
  private situacao: string;

  constructor(nome: string) {
    this.nome = nome;
    this.notas = [];
    this.faltas = 0;
    this.media = 0;
    this.situacao = '';
  }

  public adicionarNota(nota: number): void {
    this.notas.push(nota);
  }

  public setFaltas(faltas: number): void {
    this.faltas = faltas;
  }

  public calcularMedia(): void {
    const soma = this.notas.reduce((acc, nota) => acc + nota, 0);
    this.media = soma / this.notas.length;
  }

  public determinarSituacao(totalAulas: number = 80): void {
    const percentualFaltas = (this.faltas / totalAulas) * 100;

    if (percentualFaltas > 25) {
      this.situacao = 'REPROVADO POR FALTA';
    } else if (this.media >= 7) {
      this.situacao = 'APROVADO';
    } else if (this.media >= 5) {
      this.situacao = 'RECUPERAÇÃO';
    } else {
      this.situacao = 'REPROVADO';
    }
  }

  public getNome(): string {
    return this.nome;
  }

  public getNotas(): number[] {
    return this.notas;
  }

  public getFaltas(): number {
    return this.faltas;
  }

  public getMedia(): number {
    return this.media;
  }

  public getSituacao(): string {
    return this.situacao;
  }

  public exibirDetalhes(): void {
    console.log(`\nDisciplina: ${this.nome}`);
    console.log(`  Notas: ${this.notas.map(n => n.toFixed(1)).join(' | ')}`);
    console.log(`  Média: ${this.media.toFixed(2)}`);
    console.log(`  Faltas: ${this.faltas}`);
    console.log(`  Situação: ${this.situacao}`);
    console.log('─'.repeat(70));
  }
}

class Aluno {
  private nome: string;
  private disciplinas: Disciplina[];

  constructor(nome: string) {
    this.nome = nome;
    this.disciplinas = [];
  }

  public adicionarDisciplina(disciplina: Disciplina): void {
    this.disciplinas.push(disciplina);
  }

  public getNome(): string {
    return this.nome;
  }

  public getDisciplinas(): Disciplina[] {
    return this.disciplinas;
  }

  public calcularMediaGeral(): number {
    const soma = this.disciplinas.reduce((acc, disc) => acc + disc.getMedia(), 0);
    return soma / this.disciplinas.length;
  }

  public calcularTotalFaltas(): number {
    return this.disciplinas.reduce((acc, disc) => acc + disc.getFaltas(), 0);
  }

  public contarReprovacoes(): number {
    return this.disciplinas.filter(disc => 
      disc.getSituacao() === 'REPROVADO' || 
      disc.getSituacao() === 'REPROVADO POR FALTA'
    ).length;
  }

  public temRecuperacao(): boolean {
    return this.disciplinas.some(disc => disc.getSituacao() === 'RECUPERAÇÃO');
  }

  public processarNotas(): void {
    this.disciplinas.forEach(disciplina => {
      disciplina.calcularMedia();
      disciplina.determinarSituacao();
    });
  }
}

class Boletim {
  private aluno: Aluno;

  constructor(aluno: Aluno) {
    this.aluno = aluno;
  }

  public exibir(): void {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    BOLETIM ESCOLAR 2025                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\nAluno: ${this.aluno.getNome()}`);
    console.log('─'.repeat(70));

    this.aluno.getDisciplinas().forEach(disciplina => {
      disciplina.exibirDetalhes();
    });

    this.exibirResultadoFinal();
  }

  private exibirResultadoFinal(): void {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        RESULTADO FINAL                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`Média Geral: ${this.aluno.calcularMediaGeral().toFixed(2)}`);
    console.log(`Total de Faltas: ${this.aluno.calcularTotalFaltas()}`);

    const reprovacoes = this.aluno.contarReprovacoes();

    if (reprovacoes > 0) {
      console.log(`\n⚠️  SITUAÇÃO FINAL: REPROVADO (${reprovacoes} disciplina(s))`);
    } else if (this.aluno.temRecuperacao()) {
      console.log('\n📝 SITUAÇÃO FINAL: RECUPERAÇÃO');
    } else {
      console.log('\n✅ SITUAÇÃO FINAL: APROVADO');
    }

    console.log('\n' + '═'.repeat(70));
  }
}

class SistemaBoletim {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private pergunta(questao: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(questao, (resposta) => {
        resolve(resposta);
      });
    });
  }

  private async coletarDadosDisciplina(nomeDisciplina: string): Promise<Disciplina> {
    console.log(`\n--- ${nomeDisciplina} ---`);

    const disciplina = new Disciplina(nomeDisciplina);

    const nota1 = parseFloat(await this.pergunta('Nota do 1º bimestre: '));
    const nota2 = parseFloat(await this.pergunta('Nota do 2º bimestre: '));
    const nota3 = parseFloat(await this.pergunta('Nota do 3º bimestre: '));
    const nota4 = parseFloat(await this.pergunta('Nota do 4º bimestre: '));
    const faltas = parseInt(await this.pergunta('Número de faltas: '));

    disciplina.adicionarNota(nota1);
    disciplina.adicionarNota(nota2);
    disciplina.adicionarNota(nota3);
    disciplina.adicionarNota(nota4);
    disciplina.setFaltas(faltas);

    return disciplina;
  }

  public async executar(): Promise<void> {
    console.log('═'.repeat(70));
    console.log('          SISTEMA DE BOLETIM ESCOLAR');
    console.log('═'.repeat(70));

    const nomeAluno = await this.pergunta('\nNome do aluno: ');
    const aluno = new Aluno(nomeAluno);

    const numDisciplinas = parseInt(await this.pergunta('Quantas disciplinas? '));

    for (let i = 0; i < numDisciplinas; i++) {
      const nomeDisciplina = await this.pergunta(`\nNome da disciplina ${i + 1}: `);
      const disciplina = await this.coletarDadosDisciplina(nomeDisciplina);
      aluno.adicionarDisciplina(disciplina);
    }

    aluno.processarNotas();

    const boletim = new Boletim(aluno);
    boletim.exibir();

    this.rl.close();
  }
}

// Execução do programa
const sistema = new SistemaBoletim();
sistema.executar();