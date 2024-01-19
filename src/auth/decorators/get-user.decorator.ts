import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUserData = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    // para que se pueda extraer el user de la request
    // el usuario debe estar autenticado
    const user = req.user;
    if (!user)
      throw new InternalServerErrorException('User not found (request)');
    if (data) return extractProperties(user, data);
    return user;
  },
);

/**
 * Extrae propiedades específicas de un objeto JSON basado en un array o una cadena de nombres de propiedades.
 *
 * @param {Object} obj - El objeto JSON del cual extraer las propiedades.
 * @param {(string | string[])} propertyNames - Cadena o array de nombres de propiedades a extraer.
 * @returns {Object} - Objeto que contiene solo las propiedades especificadas.
 */
function extractProperties(
  obj: User,
  propertyNames: string | string[],
): Record<string, any> {
  const result: Partial<User> = {};

  const namesToExtract = Array.isArray(propertyNames)
    ? propertyNames
    : [propertyNames];

  namesToExtract.forEach((propertyName) => {
    if (obj.hasOwnProperty(propertyName)) {
      result[propertyName] = obj[propertyName];
    }
  });

  return result;
}
