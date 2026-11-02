import { afterRenderEffect, Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { linkWhatsapp } from '../contato';

type Etapa = 'objetivo' | 'dificuldade' | 'local' | 'fim';
type Mensagem = { id: number; autor: 'assistente' | 'visitante'; texto: string };

const OPCOES: Record<Etapa, string[]> = {
  objetivo: ['Ganhar massa muscular', 'Reduzir gordura corporal', 'Melhorar definição', 'Aumentar força e desempenho'],
  dificuldade: ['Estagnação nos resultados', 'Não consigo criar uma rotina', 'Quero treinar com mais técnica', 'Falta um planejamento personalizado'],
  local: ['Treino em academia', 'Treino em casa', 'Academia e em casa'],
  fim: [],
};

const PERGUNTAS: Record<Etapa, string> = {
  objetivo: 'Olá! Que bom ter você aqui. 👋\n\nSou o assistente virtual do Diarlen Dutra. Em 3 perguntas rápidas, preparo o seu contato com ele.\n\n1️⃣ Qual é o seu principal objetivo no momento?',
  dificuldade: 'Boa escolha! 👊\n\n2️⃣ O que mais está travando você hoje?',
  local: '3️⃣ Onde você treina hoje?',
  fim: 'Pronto! 🔥\n\nNo Método DD Performance, seu protocolo é individual, feito pelo Diarlen, com suporte pelo aplicativo, por R$ 250,00 mensais.\n\nSuas respostas já estão prontas: é só tocar abaixo e enviar para ele no WhatsApp.',
};

const PROXIMA: Record<Etapa, Etapa> = { objetivo: 'dificuldade', dificuldade: 'local', local: 'fim', fim: 'fim' };

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
  private readonly respostas = signal<Partial<Record<Etapa, string>>>({});

  protected readonly opcoes = computed(() => OPCOES[this.etapa()]);
  protected readonly aceitaTexto = computed(() => this.etapa() === 'objetivo' || this.etapa() === 'dificuldade');
  protected readonly linkFinal = computed(() => {
    const { objetivo, dificuldade, local } = this.respostas();
    return linkWhatsapp(
      `Olá, Diarlen! Falei com o assistente do site e quero saber mais sobre o Método DD Performance.\n\nObjetivo: ${objetivo}\nO que mais dificulta: ${dificuldade}\nOnde treino: ${local}`,
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
    this.perguntar(PROXIMA[etapa]);
  }

  protected enviarTexto(evento: Event) {
    evento.preventDefault();
    const texto = this.textoLivre().trim();
    if (texto) {
      this.responder(texto);
    }
  }

  protected recomecar() {
    this.mensagens.set([]);
    this.respostas.set({});
    this.perguntar('objetivo');
  }

  private async perguntar(etapa: Etapa) {
    this.etapa.set(etapa);
    this.digitando.set(true);
    await new Promise((resolver) => setTimeout(resolver, 700 + Math.min(PERGUNTAS[etapa].length * 8, 900)));
    this.digitando.set(false);
    this.adicionar('assistente', PERGUNTAS[etapa]);
  }

  private adicionar(autor: Mensagem['autor'], texto: string) {
    this.mensagens.update((mensagens) => [...mensagens, { id: this.proximoId++, autor, texto }]);
  }
}
