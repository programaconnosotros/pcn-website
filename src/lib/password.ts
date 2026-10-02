import bcrypt from 'bcryptjs';

/**
 * Costo de bcrypt para las contraseñas nuevas. Cada punto duplica el tiempo de cálculo: 12 tarda
 * unos 250 ms con bcryptjs, imperceptible al iniciar sesión pero 4 veces más caro de atacar por
 * fuerza bruta que el 10 que se usaba antes.
 */
export const BCRYPT_COST = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);

/**
 * Si el hash se generó con un costo menor al actual. Cada hash guarda su propio costo, así que
 * los viejos se siguen validando y se regeneran al iniciar sesión, cuando tenemos la contraseña.
 */
export const needsRehash = (hash: string) => bcrypt.getRounds(hash) < BCRYPT_COST;
