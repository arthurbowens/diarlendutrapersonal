import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockInstance, vi } from 'vitest';
import { Assistente } from './assistente';

describe('Assistente', () => {
  let fixture: ComponentFixture<Assistente>;
  let elemento: HTMLElement;
  let abrir: MockInstance<typeof window.open>;

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
    await clicar('Ganhar massa muscular');
    await digitar('Pressão alta');
    await clicar('Falta de constância');
    await digitar('Cirurgia no joelho');
    await clicar('Alimentação');
  };

  const link = () => elemento.querySelector<HTMLAnchorElement>('a[href^="https://wa.me/"]');

  beforeEach(async () => {
    vi.useFakeTimers();
    abrir = vi.spyOn(window, 'open').mockReturnValue({} as Window);
    await TestBed.configureTestingModule({ imports: [Assistente] }).compileComponents();
    fixture = TestBed.createComponent(Assistente);
    elemento = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('abre o WhatsApp com as 5 respostas logo após a última pergunta', async () => {
    await responderTudo();

    expect(abrir).toHaveBeenCalledTimes(1);
    const mensagem = decodeURIComponent(abrir.mock.calls[0][0] as string);
    expect(mensagem).toContain('Objetivo: Ganhar massa muscular');
    expect(mensagem).toContain('Problema de saúde: Pressão alta');
    expect(mensagem).toContain('O que impede os resultados: Falta de constância');
    expect(mensagem).toContain('Lesões passadas: Cirurgia no joelho');
    expect(mensagem).toContain('O que mudar na rotina: Alimentação');
  });

  it('não aceita resposta em branco', async () => {
    elemento.querySelector<HTMLButtonElement>('.lancador')!.click();
    await avancar();
    await digitar('   ');
    expect(elemento.textContent).toContain('Qual é o seu objetivo?');
    expect(elemento.textContent).not.toContain('Você tem algum problema de saúde?');
  });

  it('não abre o WhatsApp antes da última resposta', async () => {
    elemento.querySelector<HTMLButtonElement>('.lancador')!.click();
    await avancar();
    await clicar('Ganhar massa muscular');
    expect(abrir).not.toHaveBeenCalled();
  });

  it('mantém um link manual caso o WhatsApp não abra', async () => {
    await responderTudo();
    expect(link()).not.toBeNull();
  });

  it('recomeçar limpa a conversa e volta à primeira pergunta', async () => {
    await responderTudo();
    elemento.querySelector<HTMLButtonElement>('[aria-label="Recomeçar conversa"]')!.click();
    await avancar();

    expect(link()).toBeNull();
    expect(elemento.textContent).toContain('Qual é o seu objetivo?');
  });
});
