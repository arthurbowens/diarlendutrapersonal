import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Assistente } from './assistente';

describe('Assistente', () => {
  let fixture: ComponentFixture<Assistente>;
  let elemento: HTMLElement;

  const avancar = async () => {
    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();
  };

  const clicar = async (texto: string) => {
    const botoes = Array.from(elemento.querySelectorAll<HTMLButtonElement>('button'));
    botoes.find((botao) => botao.textContent?.trim() === texto)!.click();
    await avancar();
  };

  const digitar = async (texto: string) => {
    const campo = elemento.querySelector<HTMLInputElement>('input')!;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    elemento.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await avancar();
  };

  const responderTudo = async () => {
    elemento.querySelector<HTMLButtonElement>('.lancador')!.click();
    await avancar();
    await digitar('Ana');
    await clicar('Ganhar massa muscular');
    await clicar('Nunca treinei');
    await clicar('4 dias');
    await clicar('Treino sem um planejamento');
    await digitar('Dor no joelho');
  };

  const link = () => elemento.querySelector<HTMLAnchorElement>('a[href^="https://wa.me/"]');

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [Assistente] }).compileComponents();
    fixture = TestBed.createComponent(Assistente);
    elemento = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('leva nome e respostas, inclusive digitadas, para o link do WhatsApp', async () => {
    await responderTudo();

    const mensagem = decodeURIComponent(link()!.href);
    expect(mensagem).toContain('Meu nome é Ana');
    expect(mensagem).toContain('Objetivo: Ganhar massa muscular');
    expect(mensagem).toContain('Experiência: Nunca treinei');
    expect(mensagem).toContain('Dias por semana: 4 dias');
    expect(mensagem).toContain('Maior dificuldade: Treino sem um planejamento');
    expect(mensagem).toContain('Lesão ou limitação: Dor no joelho');
  });

  it('não aceita nome em branco', async () => {
    elemento.querySelector<HTMLButtonElement>('.lancador')!.click();
    await avancar();
    await digitar('   ');
    expect(elemento.textContent).toContain('como posso chamar você');
    expect(elemento.textContent).not.toContain('Prazer');
  });

  it('responde dúvidas no final sem perder o link', async () => {
    await responderTudo();
    await clicar('Qual é o investimento?');

    expect(elemento.textContent).toContain('R$ 250,00 por mês');
    expect(link()).not.toBeNull();
  });

  it('recomeçar limpa a conversa e volta à primeira pergunta', async () => {
    await responderTudo();
    elemento.querySelector<HTMLButtonElement>('[aria-label="Recomeçar conversa"]')!.click();
    await avancar();

    expect(elemento.textContent).not.toContain('Resumo para o Diarlen');
    expect(link()).toBeNull();
    expect(elemento.textContent).toContain('como posso chamar você');
  });
});
