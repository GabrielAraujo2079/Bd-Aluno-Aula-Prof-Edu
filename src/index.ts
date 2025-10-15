import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

interface Materia {
  nome: string;
  notas: number[];
  media: number;
  situacao: string;
}

const materias = ['Matemática', 'Português', 'Geografia', 'História', 'Química'];
const boletim: Materia[] = [];
let nomeAluno: string;
let serie: string;
let totalFaltas: number;
let situacaoFinal: string;

function pergunta(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

function calcularMedia(notas: number[]): number {
  const soma = notas.reduce((acc, nota) => acc + nota, 0);
  return soma / notas.length;
}

async function coletarNotas(materia: string): Promise<number[]> {
  const notas: number[] = [];
  console.log(`\n--- ${materia} ---`);
  
  for (let i = 1; i <= 8; i++) {
    let notaValida = false;
    while (!notaValida) {
      const input = await pergunta(`Digite a nota ${i}: `);
      const nota = parseFloat(input);
      
      if (!isNaN(nota) && nota >= 0 && nota <= 10) {
        notas.push(nota);
        notaValida = true;
      } else {
        console.log('Nota inválida! Digite um valor entre 0 e 10.');
      }
    }
  }
  
  return notas;
}

async function iniciarSistema() {
  console.log('=== SISTEMA DE BOLETIM ESCOLAR ===\n');
  
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
    } else {
      console.log('Número de faltas inválido!');
    }
  }
  
  // Calcular situação final (considerando 200 dias letivos = 100%)
  const diasLetivos = 200;
  const percentualFaltas = (totalFaltas / diasLetivos) * 100;
  const reprovadoPorFalta = percentualFaltas > 25; // Mais de 25% de faltas = reprovado
  
  // Verificar se foi reprovado em alguma matéria
  const reprovadoPorNota = boletim.some(m => m.situacao === 'REPROVADO');
  
  if (reprovadoPorFalta) {
    situacaoFinal = 'REPROVADO POR FALTAS';
  } else if (reprovadoPorNota) {
    situacaoFinal = 'REPROVADO';
  } else {
    situacaoFinal = 'APROVADO';
  }
  
  // Exibir boletim na tela
  exibirBoletim(percentualFaltas);
  
  // Salvar em arquivo
  await salvarBoletim(percentualFaltas);
  
  console.log('\n✓ Boletim salvo com sucesso na pasta "bd"!');
  rl.close();
}

function exibirBoletim(percentualFaltas: number) {
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
  
  console.log(`\nTotal de Faltas: ${totalFaltas} (${percentualFaltas.toFixed(1)}%)`);
  console.log(`Frequência: ${(100 - percentualFaltas).toFixed(1)}%`);
  console.log('\n' + '='.repeat(70));
  console.log(`SITUAÇÃO FINAL: ${situacaoFinal}`);
  console.log('='.repeat(70));
}

async function salvarBoletim(percentualFaltas: number) {
  const pastabd = path.join(process.cwd(), 'bd');
  
  // Criar pasta bd se não existir
  if (!fs.existsSync(pastabd)) {
    fs.mkdirSync(pastabd);
  }
  
  // Gerar nome do arquivo
  const dataHora = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const nomeArquivo = `boletim_${nomeAluno.replace(/\s+/g, '_')}_${dataHora}.txt`;
  const caminhoArquivo = path.join(pastabd, nomeArquivo);
  
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
  
  conteudo += `\nTotal de Faltas: ${totalFaltas} (${percentualFaltas.toFixed(1)}%)\n`;
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