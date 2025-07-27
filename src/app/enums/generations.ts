enum Generations {
  KANTO = 'Kanto',
  JOHTO = 'Johto',
  HOENN = 'Hoenn',
  SINNOH = 'Sinnoh',
  UNOVA = 'Unova',
  KALOS = 'Kalos',
  ALOLA = 'Alola',
  GALAR = 'Galar',
  PALDEA = 'Paldea',
}

export const getGenerationName = (length: number): string => {
  if (length <= 151) return Generations.KANTO;
  if (length <= 251) return Generations.JOHTO;
  if (length <= 386) return Generations.HOENN;
  if (length <= 493) return Generations.SINNOH;
  if (length <= 649) return Generations.UNOVA;
  if (length <= 721) return Generations.KALOS;
  if (length <= 809) return Generations.ALOLA;
  if (length <= 905) return Generations.GALAR;
  if (length <= 1025) return Generations.PALDEA;
  return '';
}