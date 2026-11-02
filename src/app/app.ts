import { Component, signal } from '@angular/core';
import { Assistente } from './assistente/assistente';
import { Carrossel } from './carrossel/carrossel';
import { CONTATO, linkWhatsapp } from './contato';

@Component({
  selector: 'app-root',
  imports: [Assistente, Carrossel],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly contato = CONTATO;
  protected readonly ano = new Date().getFullYear();
  protected readonly menuAberto = signal(false);

  protected readonly linkDuvida = linkWhatsapp('Olá! Vi o site e tenho uma dúvida sobre o Método DD Performance.');
  protected readonly linkContratar = linkWhatsapp('Olá! Quero começar no Método DD Performance.');

  protected readonly menu = [
    { rotulo: 'Diarlen Dutra', ancora: '#diarlen' },
    { rotulo: 'O Método', ancora: '#metodo' },
    { rotulo: 'Para quem é', ancora: '#para-quem' },
    { rotulo: 'Ebook', ancora: '#ebook' },
    { rotulo: 'Investimento', ancora: '#oferta' },
  ];

  protected readonly destaquesHero = [
    'Treinamento personalizado',
    'Acesso pelo aplicativo',
    'Suporte pelo aplicativo',
    'Acompanhamento da evolução',
    'Reunião on-line a cada 3 meses',
  ];

  protected readonly premiacoes = [
    { ano: '2023', titulos: ['Campeão Culturismo Clássico'] },
    { ano: '2024', titulos: ['Campeão Mr. Rio', 'Campeão Overall Champion'] },
    {
      ano: '2025',
      titulos: [
        'Campeão Classic Physique Mr. Rio',
        'Campeão Classic NPC Petrópolis',
        'Campeão Mr. Cabo Frio e Overall',
        'Campeão Classic Champion',
      ],
    },
    {
      ano: '2026',
      titulos: [
        'Campeão em Araruama Classic e Bodybuilder e Overall da Classic',
        'Campeão Mr. Búzios Classic e Bodybuilder',
      ],
    },
  ];

  protected readonly resultados = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  protected readonly entregas = [
    'Treinamento 100% personalizado',
    'Séries, repetições e intervalos definidos',
    'Acesso ao aplicativo de treinos',
    'Vídeos demonstrativos dos exercícios',
    'Suporte por meio do aplicativo',
    'Acompanhamento da sua evolução',
    'Ajustes periódicos no treinamento',
    'Reunião on-line a cada três meses',
    'Acesso à comunidade exclusiva*',
    'Condição especial nos e-books*',
  ];

  protected readonly objetivos = [
    'Ganhar massa muscular',
    'Reduzir gordura corporal',
    'Melhorar definição',
    'Aumentar força e desempenho',
    'Sair da estagnação',
    'Criar uma rotina de treino',
    'Treinar com mais técnica',
    'Ter um planejamento personalizado',
  ];

  protected readonly recursosApp = [
    'Lista organizada de exercícios',
    'Vídeos demonstrativos',
    'Registros de cargas e evolução',
    'Calendário de treinos',
    'Canal de suporte',
  ];

  protected readonly etapas = [
    { titulo: 'Contratação', texto: 'Você contrata o Método DD Performance pelo valor de R$ 250,00 mensais.' },
    { titulo: 'Avaliação inicial', texto: 'Você preenche um questionário sobre objetivo, rotina, experiência, disponibilidade e limitações.' },
    { titulo: 'Recebimento do treinamento', texto: 'O Diarlen desenvolve o protocolo personalizado e disponibiliza o treino pelo aplicativo.' },
    { titulo: 'Suporte pelo aplicativo', texto: 'Pelo aplicativo você acessa o treinamento, acompanha as orientações e envia suas dúvidas.' },
    { titulo: 'Reunião trimestral', texto: 'A cada três meses, uma reunião on-line com o Diarlen para analisar sua evolução, alinhar objetivos e definir os próximos passos.' },
    { titulo: 'Continuidade do acompanhamento', texto: 'O treinamento continua sendo acompanhado e ajustado conforme as condições previstas no plano.' },
  ];

  protected readonly depoimentos = [
    { arquivo: 1, largura: 591, altura: 695 },
    { arquivo: 3, largura: 591, altura: 557 },
    { arquivo: 2, largura: 591, altura: 652 },
    { arquivo: 4, largura: 591, altura: 345 },
    { arquivo: 5, largura: 677, altura: 315 },
  ];

  protected readonly pontosEbook = [
    { titulo: 'Hipertrofia', texto: 'foco no ganho de massa e no desenvolvimento muscular.' },
    { titulo: 'Bodybuilding', texto: 'dedicação à construção e à evolução do físico.' },
    { titulo: 'Estratégia', texto: 'objetivos claros para uma jornada de treino com propósito.' },
    { titulo: 'Disciplina e constância', texto: 'compromisso com o processo, não apenas com o resultado.' },
  ];

  protected readonly itensOferta = [
    'Treinamento personalizado',
    'Acesso pelo aplicativo',
    'Vídeos de exercícios',
    'Suporte pelo aplicativo',
    'Acompanhamento da evolução',
    'Ajustes nos treinamentos',
    'Reunião on-line a cada 3 meses',
    'Benefícios exclusivos nos e-books*',
  ];

  protected readonly perguntas = [
    {
      pergunta: 'O treino é personalizado?',
      resposta: 'Sim. O protocolo é desenvolvido a partir do questionário inicial, considerando seu objetivo, rotina, experiência, disponibilidade e limitações.',
    },
    {
      pergunta: 'O método é indicado para iniciantes?',
      resposta: 'Sua experiência com treino é uma das informações avaliadas no questionário inicial, e o protocolo é montado a partir dela.',
    },
    {
      pergunta: 'Como funciona o suporte pelo aplicativo?',
      resposta: 'Pelo aplicativo você acessa o treinamento, acompanha as orientações e envia suas dúvidas.',
    },
    {
      pergunta: 'Quando acontecem as reuniões on-line?',
      resposta: 'A cada três meses, para analisar sua evolução, alinhar objetivos e definir os próximos passos.',
    },
    {
      pergunta: 'O valor de R$ 250,00 é mensal?',
      resposta: 'Sim. O investimento no Método DD Performance é de R$ 250,00 por mês.',
    },
    {
      pergunta: 'O atendimento é feito pelo próprio Diarlen?',
      resposta: 'O Diarlen desenvolve o seu protocolo e conduz as reuniões trimestrais de acompanhamento.',
    },
  ];
}
