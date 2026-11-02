// Dados de contato: troque aqui para atualizar o site inteiro.
// whatsapp: só números, com país e DDD (ex.: 5511999999999).
export const CONTATO = {
  whatsapp: '5522988145498',
  instagram: 'diarlendutra',
  cref: '066009-RJ',
  crn: 'CRN4: 22100871',
  ebook: 'https://go.hotmart.com/V106982004K?dp=1',
};

export const linkWhatsapp = (mensagem: string) =>
  `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`;
