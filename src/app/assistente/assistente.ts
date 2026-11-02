import { afterRenderEffect, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { linkWhatsapp } from '../contato';

type Etapa = 'objetivo' | 'saude' | 'impedimento' | 'lesoes' | 'rotina' | 'fim';
type Respostas = Partial<Record<Etapa, string>>;
type Mensagem = { id: number; autor: 'assistente' | 'visitante'; texto: string };

const SEQUENCIA: Etapa[] = ['objetivo', 'saude', 'impedimento', 'lesoes', 'rotina', 'fim'];

const OPCOES: Record<Etapa, string[]> = {
  objetivo: ['Ganhar massa muscular', 'Reduzir gordura corporal', 'Melhorar a definição', 'Aumentar força e desempenho'],
  saude: ['Não tenho', 'Prefiro falar direto com o Diarlen'],
  impedimento: ['Falta de constância', 'Falta de planejamento', 'Dúvidas sobre a técnica', 'Falta de tempo'],
  lesoes: ['Não tenho', 'Prefiro falar direto com o Diarlen'],
  rotina: ['Constância nos treinos', 'Alimentação', 'Sono e descanso', 'Organização do tempo'],
  fim: [],
};

const CAMPO_TEXTO: Partial<Record<Etapa, string>> = {
  objetivo: 'Ou descreva o seu objetivo',
  saude: 'Ou conte qual é o problema',
  impedimento: 'Ou conte com suas palavras',
  lesoes: 'Ou conte qual foi a lesão',
  rotina: 'Ou conte com suas palavras',
};

const PERGUNTAS: Record<Exclude<Etapa, 'fim'>, string> = {
  objetivo: 'Olá! Sou a assistente virtual do Diarlen Dutra.\n\nVou fazer 5 perguntas rápidas para ele já saber como ajudar você.\n\nQual é o seu objetivo?',
  saude: 'Você tem algum problema de saúde?',
  impedimento: 'O que você acha que te impede de ter resultados?',
  lesoes: 'Você tem lesões passadas?',
  rotina: 'Última pergunta: o que você acha que deve mudar na sua rotina?',
};

@Component({
  selector: 'app-assistente',
  templateUrl: './assistente.html',
  styleUrl: './assistente.css',
  host: { '(document:keydown.escape)': 'aberto.set(false)' }
})
export class Assistente {
  protected readonly aberto = signal(false);
  protected readonly digitando = signal(false);
  protected readonly etapa = signal<Etapa>('objetivo');
  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly textoLivre = signal('');
  protected readonly respostas = signal<Respostas>({});

  protected readonly opcoes = computed(() => OPCOES[this.etapa()]);
  protected readonly placeholder = computed(() => CAMPO_TEXTO[this.etapa()]);
  protected readonly totalPerguntas = SEQUENCIA.length - 1;
  protected readonly numeroPergunta = computed(() => SEQUENCIA.indexOf(this.etapa()) + 1);
  protected readonly progresso = computed(() => {
    const respondidas = Object.keys(this.respostas()).length;
    return (respondidas / this.totalPerguntas) * 100;
  });
  protected readonly resumo = computed(() => {
    const { objetivo, saude, impedimento, lesoes, rotina } = this.respostas();
    return [
      { rotulo: 'Objetivo', valor: objetivo },
      { rotulo: 'Problema de saúde', valor: saude },
      { rotulo: 'O que impede os resultados', valor: impedimento },
      { rotulo: 'Lesões passadas', valor: lesoes },
      { rotulo: 'O que mudar na rotina', valor: rotina },
    ];
  });
  protected readonly linkFinal = computed(() => {
    const linhas = this.resumo().map(({ rotulo, valor }) => `${rotulo}: ${valor}`);
    return linkWhatsapp(
      `Olá, Diarlen! Falei com a assistente do site e quero começar no Método DD Performance.\n\n${linhas.join('\n')}`,
    );
  });

  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');
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
    });
  }

  protected alternar() {
    this.aberto.update((aberto) => !aberto);
    if (!this.iniciado) {
      this.iniciado = true;
      this.perguntar('objetivo');
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
    const proxima = SEQUENCIA[SEQUENCIA.indexOf(etapa) + 1];
    if (proxima === 'fim') {
      this.abrirWhatsapp();
    }
    this.perguntar(proxima);
  }

  protected enviarTexto(evento: Event) {
    evento.preventDefault();
    const texto = this.textoLivre().trim();
    if (texto) {
      this.responder(texto);
    }
  }

  protected recomecar() {
    if (this.digitando()) {
      return;
    }
    this.mensagens.set([]);
    this.respostas.set({});
    this.textoLivre.set('');
    this.perguntar('objetivo');
  }

  // Precisa rodar no próprio clique: depois disso o navegador bloqueia como pop-up.
  private abrirWhatsapp() {
    if (!window.open(this.linkFinal(), '_blank')) {
      window.location.href = this.linkFinal();
    }
  }

  private perguntar(etapa: Etapa) {
    this.etapa.set(etapa);
    return this.falar(
      etapa === 'fim'
        ? 'Obrigada! Suas respostas já estão prontas no WhatsApp. É só enviar para o Diarlen.'
        : PERGUNTAS[etapa],
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
