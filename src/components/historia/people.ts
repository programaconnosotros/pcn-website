/**
 * Everyone /historia mentions by name, in order of appearance. Each name is the key an admin
 * links to a platform user (an `IdentityLink` with source "historia"), so every mention of the
 * person — "Agustín Sánchez", "Agus" — leads to the same profile.
 */
export const HISTORIA_PEOPLE = [
  'Agustín Sánchez',
  'Mauricio Sánchez',
  'Esteban Sánchez',
  'Germán Navarro',
  'Marcelo Núñez',
  'Iván Taddei',
  'Facu Gelatti',
  'Franco Mirada',
  'Augusto Nasrallah',
  'Jorge Buabud',
  'Victor Figueredo',
  'Tobías Paz Posse',
  'Jeremias Ivanoff',
  'Lucas Pérez',
  'Mauricio Chaile',
  'Matías Gutierrez',
  'Nicolas Fuentes',
  'Facundo Bazán',
  'Vicky Grillo',
  'Emiliano Grillo',
  'Carlos Spagnolo',
  'Alejo Boga',
  'Benjamin Cortes',
  'Franco Pérez',
  'Franco Jose Espinoza',
  'Fabio Ramos',
  'Salvador Juárez',
  'Yamil Cardozo',
  'Ismael Chávez',
  'Leo Apaza',
  'Facundo García Martoni',
] as const;

export type HistoriaPersonName = (typeof HISTORIA_PEOPLE)[number];
