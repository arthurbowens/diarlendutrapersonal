import { afterRenderEffect, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { linkWhatsapp } from '../contato';

type Etapa = 'nome' | 'objetivo' | 'experiencia' | 'dias' | 'dificuldade' | 'limitacao' | 'fim';
type Respostas = Partial<Record<Etapa, string>>;
type Mensagem = { id: number; autor: 'assistente' | 'visitante'; texto: string };

const SEQUENCIA: Etapa[] = ['nome', 'objetivo', 'experiencia', 'dias', 'dificuldade', 'limitacao', 'fim'];

const OPCOES: Record<Etapa, string[]> = {
  nome: [],
  objetivo: ['Ganhar massa muscular', 'Reduzir gordura corporal', 'Melhorar a definição', 'Aumentar força e desempenho'],
  experiencia: ['Nunca treinei', 'Estou voltando depois de uma pausa', 'Treino há menos de 1 ano', 'Treino há mais de 1 ano'],
  dias: ['Até 3 dias', '4 dias', '5 dias', '6 dias ou mais'],
  dificuldade: ['Parei de ver evolução', 'Não consigo manter a constância', 'Tenho dúvidas sobre a técnica', 'Treino sem um planejamento'],
  limitacao: ['Não tenho', 'Prefiro falar direto com o Diarlen'],
  fim: [],
};

const CAMPO_TEXTO: Partial<Record<Etapa, string>> = {
  nome: 'Digite seu nome',
  objetivo: 'Ou descreva o seu objetivo',
  dificuldade: 'Ou conte com suas palavras',
  limitacao: 'Ou descreva a lesão ou limitação',
};

const PERGUNTAS: Record<Exclude<Etapa, 'fim'>, (respostas: Respostas) => string> = {
  nome: () =>
    'Olá! Sou a assistente virtual do Diarlen Dutra.\n\nVou fazer algumas perguntas rápidas para ele já saber como ajudar você. Leva menos de um minuto.\n\nPara começar, como posso chamar você?',
  objetivo: ({ nome }) => `Prazer, ${nome}!\n\nQual é o seu principal objetivo hoje?`,
  experiencia: () => 'Ótimo. E qual é a sua experiência com musculação?',
  dias: () => 'Entendido. Quantos dias por semana você consegue treinar, de forma realista?',
  dificuldade: () => 'Certo. O que mais tem atrapalhado a sua evolução até aqui?',
  limitacao: () => 'Última pergunta: você tem alguma lesão, dor ou limitação que o Diarlen deva considerar?',
};

const DUVIDAS = [
  {
    pergunta: 'Como funciona o acompanhamento?',
    resposta: 'Depois de contratar, você responde a um questionário e o Diarlen desenvolve o seu protocolo, liberado no aplicativo.\n\nPor lá você acessa o treino, assiste aos vídeos dos exercícios e envia suas dúvidas. A cada três meses, vocês fazem uma reunião on-line para analisar a evolução.',
  },
  {
    pergunta: 'O que está incluído?',
    resposta: 'Treinamento 100% personalizado, acesso ao aplicativo, vídeos dos exercícios, suporte, acompanhamento da evolução, ajustes periódicos e reunião on-line a cada três meses.',
  },
  {
    pergunta: 'Qual é o investimento?',
    resposta: 'O Método DD Performance custa R$ 250,00 por mês.',
  },
];

@Component({
  selector: 'app-assistente',
  templateUrl: './assistente.html',
  styleUrl: './assistente.css',
  host: { '(document:keydown.escape)': 'aberto.set(false)' }
})
export class Assistente {
  protected readonly aberto = signal(false);
  protected readonly digitando = signal(false);
  protected readonly etapa = signal<Etapa>('nome');
  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly textoLivre = signal('');
  protected readonly respostas = signal<Respostas>({});
  private readonly duvidasVistas = signal<string[]>([]);

  protected readonly opcoes = computed(() => OPCOES[this.etapa()]);
  protected readonly placeholder = computed(() => CAMPO_TEXTO[this.etapa()]);
  protected readonly duvidas = computed(() => DUVIDAS.filter((duvida) => !this.duvidasVistas().includes(duvida.pergunta)));
  protected readonly totalPerguntas = SEQUENCIA.length - 1;
  protected readonly numeroPergunta = computed(() => SEQUENCIA.indexOf(this.etapa()) + 1);
  protected readonly progresso = computed(() => {
    const respondidas = Object.keys(this.respostas()).length;
    return (respondidas / this.totalPerguntas) * 100;
  });
  protected readonly resumo = computed(() => {
    const { objetivo, experiencia, dias, dificuldade, limitacao } = this.respostas();
    return [
      { rotulo: 'Objetivo', valor: objetivo },
      { rotulo: 'Experiência', valor: experiencia },
      { rotulo: 'Dias por semana', valor: dias },
      { rotulo: 'Maior dificuldade', valor: dificuldade },
      { rotulo: 'Lesão ou limitação', valor: limitacao },
    ];
  });
  protected readonly linkFinal = computed(() => {
    const linhas = this.resumo().map(({ rotulo, valor }) => `${rotulo}: ${valor}`);
    return linkWhatsapp(
      `Olá, Diarlen! Meu nome é ${this.respostas().nome}. Falei com a assistente do site e quero começar no Método DD Performance.\n\n${linhas.join('\n')}`,
    );
  });

  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');
  private readonly campo = viewChild<ElementRef<HTMLInputElement>>('campo');
  private proximoId = 1;
  private iniciado = false;

  constructor() {
    afterRenderEffect(() => {
      this.mensagens();
      this.digitando();
      const elemento = this.rolagem()?.nativeElement;
      if (elemento) {
        elemento.scrollTop = elemento.scrollHeight;
      }
      if (this.etapa() === 'nome' && !this.digitando()) {
        this.campo()?.nativeElement.focus();
      }
    });
  }

  protected alternar() {
    this.aberto.update((aberto) => !aberto);
    if (!this.iniciado) {
      this.iniciado = true;
      this.perguntar('nome');
    }
  }

  protected responder(resposta: string) {
    if (this.digitando()) {
      return;
    }
    const etapa = this.etapa();
    this.adicionar('visitante', resposta);
    this.respostas.update((respostas) => ({ ...respostas, [etapa]: resposta }));
    this.textoLivre.set('');
    this.perguntar(SEQUENCIA[SEQUENCIA.indexOf(etapa) + 1]);
  }

  protected enviarTexto(evento: Event) {
    evento.preventDefault();
    const texto = this.textoLivre().trim();
    if (texto) {
      this.responder(texto);
    }
  }

  protected async tirarDuvida(duvida: (typeof DUVIDAS)[number]) {
    if (this.digitando()) {
      return;
    }
    this.adicionar('visitante', duvida.pergunta);
    this.duvidasVistas.update((vistas) => [...vistas, duvida.pergunta]);
    await this.falar(duvida.resposta);
  }

  protected recomecar() {
    if (this.digitando()) {
      return;
    }
    this.mensagens.set([]);
    this.respostas.set({});
    this.duvidasVistas.set([]);
    this.textoLivre.set('');
    this.perguntar('nome');
  }

  private perguntar(etapa: Etapa) {
    this.etapa.set(etapa);
    return this.falar(
      etapa === 'fim'
        ? `Obrigada, ${this.respostas().nome}! Já organizei suas respostas para o Diarlen.\n\nÉ só enviar pelo WhatsApp para falar com ele sobre o seu protocolo.`
        : PERGUNTAS[etapa](this.respostas()),
    );
  }

  private async falar(texto: string) {
    this.digitando.set(true);
    await new Promise((resolver) => setTimeout(resolver, 500 + Math.min(texto.length * 5, 900)));
    this.digitando.set(false);
    this.adicionar('assistente', texto);
  }

  private adicionar(autor: Mensagem['autor'], texto: string) {
    this.mensagens.update((mensagens) => [...mensagens, { id: this.proximoId++, autor, texto }]);
  }
}
