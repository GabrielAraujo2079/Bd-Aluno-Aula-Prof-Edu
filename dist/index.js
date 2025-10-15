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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const materias = ['Matemática', 'Português', 'Geografia', 'História', 'Química'];
const boletim = [];
let nomeAluno;
let serie;
let totalFaltas;
let situacaoFinal;
const PASTA_BD = path.join(process.cwd(), 'bd');
const ARQUIVO_CSV = path.join(PASTA_BD, 'alunos.csv');
function pergunta(query) {
    return new Promise(resolve => rl.question(query, resolve));
}
function calcularMedia(notas) {
    const soma = notas.reduce((acc, nota) => acc + nota, 0);
    return soma / notas.length;
}
async function coletarNotas(materia) {
    const notas = [];
    console.log(`\n--- ${materia} ---`);
    for (let i = 1; i <= 8; i++) {
        let notaValida = false;
        while (!notaValida) {
            const input = await pergunta(`Digite a nota ${i}: `);
            const nota = parseFloat(input);
            if (!isNaN(nota) && nota >= 0 && nota <= 10) {
                notas.push(nota);
                notaValida = true;
            }
            else {
                console.log('Nota inválida! Digite um valor entre 0 e 10.');
            }
        }
    }
    return notas;
}
function criarPastaSeNaoExistir() {
    if (!fs.existsSync(PASTA_BD)) {
        fs.mkdirSync(PASTA_BD);
    }
}
function inicializarCSV() {
    criarPastaSeNaoExistir();
    if (!fs.existsSync(ARQUIVO_CSV)) {
        const cabecalho = 'ID,Nome,Serie,Data_Registro,Situacao_Final,Media_Geral,Total_Faltas,Frequencia\n';
        fs.writeFileSync(ARQUIVO_CSV, cabecalho, 'utf-8');
    }
}
function obterProximoID() {
    if (!fs.existsSync(ARQUIVO_CSV)) {
        return 1;
    }
    const conteudo = fs.readFileSync(ARQUIVO_CSV, 'utf-8');
    const linhas = conteudo.trim().split('\n');
    if (linhas.length <= 1) {
        return 1;
    }
    const ultimaLinha = linhas[linhas.length - 1];
    const primeiroValor = ultimaLinha.split(',')[0];
    return parseInt(primeiroValor) + 1;
}
function salvarAlunoNoCSV(alunoData) {
    const linha = `${alunoData.id},${alunoData.nome},${alunoData.serie},${alunoData.dataRegistro},${alunoData.situacaoFinal},${alunoData.mediaGeral.toFixed(2)},${alunoData.totalFaltas},${alunoData.frequencia.toFixed(1)}%\n`;
    fs.appendFileSync(ARQUIVO_CSV, linha, 'utf-8');
}
async function iniciarSistema() {
    console.log('=== SISTEMA DE BOLETIM ESCOLAR ===\n');
    // Inicializar CSV
    inicializarCSV();
    nomeAluno = await pergunta('Digite o nome do aluno: ');
    serie = await pergunta('Digite a série: ');
    // Coletar notas de todas as matérias
    for (const materia of materias) {
        const notas = await coletarNotas(materia);
        const media = calcularMedia(notas);
        const situacao = media >= 7 ? 'APROVADO' : 'REPROVADO';
        boletim.push({
            nome: materia,
            notas,
            media,
            situacao
        });
    }
    // Coletar faltas
    let faltasValidas = false;
    while (!faltasValidas) {
        const input = await pergunta('\nDigite o total de faltas do aluno: ');
        totalFaltas = parseInt(input);
        if (!isNaN(totalFaltas) && totalFaltas >= 0) {
            faltasValidas = true;
        }
        else {
            console.log('Número de faltas inválido!');
        }
    }
    // Calcular situação final (considerando 200 dias letivos = 100%)
    const diasLetivos = 200;
    const percentualFaltas = (totalFaltas / diasLetivos) * 100;
    const frequencia = 100 - percentualFaltas;
    const reprovadoPorFalta = percentualFaltas > 25; // Mais de 25% de faltas = reprovado
    // Verificar se foi reprovado em alguma matéria
    const reprovadoPorNota = boletim.some(m => m.situacao === 'REPROVADO');
    if (reprovadoPorFalta) {
        situacaoFinal = 'REPROVADO POR FALTAS';
    }
    else if (reprovadoPorNota) {
        situacaoFinal = 'REPROVADO';
    }
    else {
        situacaoFinal = 'APROVADO';
    }
    // Calcular média geral
    const mediaGeral = calcularMedia(boletim.map(m => m.media));
    // Exibir boletim na tela
    exibirBoletim(percentualFaltas);
    // Salvar em arquivo TXT
    await salvarBoletim(percentualFaltas);
    // Salvar no CSV
    const alunoData = {
        id: obterProximoID(),
        nome: nomeAluno,
        serie: serie,
        dataRegistro: new Date().toLocaleDateString('pt-BR'),
        situacaoFinal: situacaoFinal,
        mediaGeral: mediaGeral,
        totalFaltas: totalFaltas,
        frequencia: frequencia
    };
    salvarAlunoNoCSV(alunoData);
    console.log('\n✓ Boletim salvo com sucesso na pasta "bd"!');
    console.log(`✓ Dados do aluno registrados no arquivo CSV (ID: ${alunoData.id})`);
    rl.close();
}
function exibirBoletim(percentualFaltas) {
    console.log('\n\n' + '='.repeat(70));
    console.log('                        BOLETIM ESCOLAR');
    console.log('='.repeat(70));
    console.log(`Aluno: ${nomeAluno}`);
    console.log(`Série: ${serie}`);
    console.log('='.repeat(70));
    console.log('\nDESEMPENHO POR DISCIPLINA:\n');
    boletim.forEach(materia => {
        console.log(`${materia.nome}:`);
        console.log(`  Notas: ${materia.notas.map(n => n.toFixed(1)).join(' | ')}`);
        console.log(`  Média: ${materia.media.toFixed(2)}`);
        console.log(`  Situação: ${materia.situacao}`);
        console.log('-'.repeat(70));
    });
    const mediaGeral = calcularMedia(boletim.map(m => m.media));
    console.log(`\nMédia Geral: ${mediaGeral.toFixed(2)}`);
    console.log(`Total de Faltas: ${totalFaltas} (${percentualFaltas.toFixed(1)}%)`);
    console.log(`Frequência: ${(100 - percentualFaltas).toFixed(1)}%`);
    console.log('\n' + '='.repeat(70));
    console.log(`SITUAÇÃO FINAL: ${situacaoFinal}`);
    console.log('='.repeat(70));
}
async function salvarBoletim(percentualFaltas) {
    criarPastaSeNaoExistir();
    // Gerar nome do arquivo
    const dataHora = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const nomeArquivo = `boletim_${nomeAluno.replace(/\s+/g, '_')}_${dataHora}.txt`;
    const caminhoArquivo = path.join(PASTA_BD, nomeArquivo);
    // Montar conteúdo do arquivo
    let conteudo = '';
    conteudo += '='.repeat(70) + '\n';
    conteudo += '                        BOLETIM ESCOLAR\n';
    conteudo += '='.repeat(70) + '\n';
    conteudo += `Aluno: ${nomeAluno}\n`;
    conteudo += `Série: ${serie}\n`;
    conteudo += `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}\n`;
    conteudo += '='.repeat(70) + '\n\n';
    conteudo += 'DESEMPENHO POR DISCIPLINA:\n\n';
    boletim.forEach(materia => {
        conteudo += `${materia.nome}:\n`;
        conteudo += `  Notas: ${materia.notas.map(n => n.toFixed(1)).join(' | ')}\n`;
        conteudo += `  Média: ${materia.media.toFixed(2)}\n`;
        conteudo += `  Situação: ${materia.situacao}\n`;
        conteudo += '-'.repeat(70) + '\n';
    });
    const mediaGeral = calcularMedia(boletim.map(m => m.media));
    conteudo += `\nMédia Geral: ${mediaGeral.toFixed(2)}\n`;
    conteudo += `Total de Faltas: ${totalFaltas} (${percentualFaltas.toFixed(1)}%)\n`;
    conteudo += `Frequência: ${(100 - percentualFaltas).toFixed(1)}%\n`;
    conteudo += '\n' + '='.repeat(70) + '\n';
    conteudo += `SITUAÇÃO FINAL: ${situacaoFinal}\n`;
    conteudo += '='.repeat(70) + '\n';
    // Salvar arquivo
    fs.writeFileSync(caminhoArquivo, conteudo, 'utf-8');
}
// Iniciar o sistema
iniciarSistema().catch(err => {
    console.error('Erro:', err);
    rl.close();
});
