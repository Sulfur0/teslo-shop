<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Levantar la base de datos

2. `npm install` o `yarn install`

3. Clonar el archivo `.env.template` y renombrarlo a `.env`

4. Cambiar las variables de entorno

5. levantar la base de datos con este comando:

```
docker-compose up -d
```

6. Ejecutar seed

```
http://localhost:4000/api/seed
```

7. Levantar el proyecto en local: `npm run start:dev` o `yarn start:dev`

Este proyecto tomo conceptos desde la seccion 10, leccion 121 hasta...
{insertar cada concepto estudiado en lista aca}

- Para ver las imagenes estaticas publicas ir a:
  http://localhost:4000/products/{image_name}{image_extension}
  Por ejemplo, http://localhost:4000/products/1473809-00-A_1_2000.jpg

8. Leer la documentación completa de los endpoints abriendo en el navegador:

```
http://localhost:4000/api
```

9. Production build is served at: https://teslo-shop-production-ae40.up.railway.app

## Bonus

### Nest.js File Upload to AWS S3 + Rate Limiting

https://www.youtube.com/watch?v=tEZERHLge-U
