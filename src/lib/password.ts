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

/**
 * Hash de una contraseña al azar que nadie conoce, con el costo actual. El login lo compara cuando
 * el email no existe, así esa respuesta tarda lo mismo que una contraseña incorrecta y el tiempo
 * no revela qué emails están registrados.
 */
export const DUMMY_PASSWORD_HASH = '$2b$12$U1ux6Vc2Pq/ait9wIAd8/ug494iyeJcDjWUCA0z4S2GjJCbo/cyBC';
