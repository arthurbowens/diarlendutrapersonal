import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-carrossel',
  templateUrl: './carrossel.html',
  styleUrl: './carrossel.css'
})
export class Carrossel {
  readonly total = input.required<number>();
  readonly rotulo = input.required<string>();
  readonly unidade = input.required<string>();

  protected readonly indice = signal(0);
  protected readonly posicoes = computed(() => Array.from({ length: this.total() }, (_, i) => i));

  protected irPara(trilha: HTMLElement, indice: number) {
    trilha.scrollTo({ left: indice * trilha.clientWidth, behavior: 'smooth' });
  }

  protected acompanhar(trilha: HTMLElement) {
    this.indice.set(Math.round(trilha.scrollLeft / trilha.clientWidth));
  }
}
