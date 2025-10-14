"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
class Disciplina {
    constructor(nome) {
        this.nome = nome;
        this.notas = [];
        this.faltas = 0;
        this.media = 0;
        this.situacao = '';
    }
    adicionarNota(nota) {
        this.notas.push(nota);
    }
    setFaltas(faltas) {
        this.faltas = faltas;
    }
    calcularMedia() {
        const soma = this.notas.reduce((acc, nota) => acc + nota, 0);
        this.media = soma / this.notas.length;
    }
    determinarSituacao(totalAulas = 80) {
        const percentualFaltas = (this.faltas / totalAulas) * 100;
        if (percentualFaltas > 25) {
            this.situacao = 'REPROVADO POR FALTA';
        }
        else if (this.media >= 7) {
            this.situacao = 'APROVADO';
        }
        else if (this.media >= 5) {
            this.situacao = 'RECUPERAÇÃO';
        }
        else {
            this.situacao = 'REPROVADO';
        }
    }
    getNome() {
        return this.nome;
    }
    getNotas() {
        return this.notas;
    }
    getFaltas() {
        return this.faltas;
    }
    getMedia() {
        return this.media;
    }
    getSituacao() {
        return this.situacao;
    }
    exibirDetalhes() {
        console.log(`\nDisciplina: ${this.nome}`);
        console.log(`  Notas: ${this.notas.map(n => n.toFixed(1)).join(' | ')}`);
        console.log(`  Média: ${this.media.toFixed(2)}`);
        console.log(`  Faltas: ${this.faltas}`);
        console.log(`  Situação: ${this.situacao}`);
        console.log('─'.repeat(70));
    }
}
class Aluno {
    constructor(nome) {
        this.nome = nome;
        this.disciplinas = [];
    }
    adicionarDisciplina(disciplina) {
        this.disciplinas.push(disciplina);
    }
    getNome() {
        return this.nome;
    }
    getDisciplinas() {
        return this.disciplinas;
    }
    calcularMediaGeral() {
        const soma = this.disciplinas.reduce((acc, disc) => acc + disc.getMedia(), 0);
        return soma / this.disciplinas.length;
    }
    calcularTotalFaltas() {
        return this.disciplinas.reduce((acc, disc) => acc + disc.getFaltas(), 0);
    }
    contarReprovacoes() {
        return this.disciplinas.filter(disc => disc.getSituacao() === 'REPROVADO' ||
            disc.getSituacao() === 'REPROVADO POR FALTA').length;
    }
    temRecuperacao() {
        return this.disciplinas.some(disc => disc.getSituacao() === 'RECUPERAÇÃO');
    }
    processarNotas() {
        this.disciplinas.forEach(disciplina => {
            disciplina.calcularMedia();
            disciplina.determinarSituacao();
        });
    }
}
class Boletim {
    constructor(aluno) {
        this.aluno = aluno;
    }
    exibir() {
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
    exibirResultadoFinal() {
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                        RESULTADO FINAL                         ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log(`Média Geral: ${this.aluno.calcularMediaGeral().toFixed(2)}`);
        console.log(`Total de Faltas: ${this.aluno.calcularTotalFaltas()}`);
        const reprovacoes = this.aluno.contarReprovacoes();
        if (reprovacoes > 0) {
            console.log(`\n⚠️  SITUAÇÃO FINAL: REPROVADO (${reprovacoes} disciplina(s))`);
        }
        else if (this.aluno.temRecuperacao()) {
            console.log('\n📝 SITUAÇÃO FINAL: RECUPERAÇÃO');
        }
        else {
            console.log('\n✅ SITUAÇÃO FINAL: APROVADO');
        }
        console.log('\n' + '═'.repeat(70));
    }
}
class SistemaBoletim {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    pergunta(questao) {
        return new Promise((resolve) => {
            this.rl.question(questao, (resposta) => {
                resolve(resposta);
            });
        });
    }
    async coletarDadosDisciplina(nomeDisciplina) {
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
    async executar() {
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
//# sourceMappingURL=index.js.map