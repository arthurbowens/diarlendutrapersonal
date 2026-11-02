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

  const clicarOpcao = async (texto: string) => {
    const botoes = Array.from(elemento.querySelectorAll<HTMLButtonElement>('button'));
    botoes.find((botao) => botao.textContent?.trim() === texto)!.click();
    await avancar();
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [Assistente] }).compileComponents();
    fixture = TestBed.createComponent(Assistente);
    elemento = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('leva as respostas das três perguntas para o link do WhatsApp', async () => {
    elemento.querySelector<HTMLButtonElement>('.lancador')!.click();
    await avancar();
    expect(elemento.textContent).toContain('assistente virtual do Diarlen Dutra');

    await clicarOpcao('Ganhar massa muscular');
    await clicarOpcao('Estagnação nos resultados');
    await clicarOpcao('Treino em casa');

    const link = elemento.querySelector<HTMLAnchorElement>('a[href^="https://wa.me/"]')!;
    const mensagem = decodeURIComponent(link.href);
    expect(mensagem).toContain('Objetivo: Ganhar massa muscular');
    expect(mensagem).toContain('O que mais dificulta: Estagnação nos resultados');
    expect(mensagem).toContain('Onde treino: Treino em casa');
  });

  it('recomeçar limpa a conversa e volta à primeira pergunta', async () => {
    elemento.querySelector<HTMLButtonElement>('.lancador')!.click();
    await avancar();
    await clicarOpcao('Melhorar definição');
    await clicarOpcao('Estagnação nos resultados');
    await clicarOpcao('Treino em academia');
    await clicarOpcao('Recomeçar conversa');

    expect(elemento.textContent).not.toContain('Suas respostas já estão prontas');
    expect(elemento.querySelector('a[href^="https://wa.me/"]')).toBeNull();
    expect(elemento.textContent).toContain('Qual é o seu principal objetivo');
  });
});
