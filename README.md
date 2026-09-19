# Operación Cumpleaños

Experiencia para Ainhoa con introducción, sopa de letras táctil, código, espera de 20 minutos y dos rompecabezas fotográficos. HTML/CSS/JS, sin instalaciones, servicios externos ni backend.

## Probar

Abrir `index.html` en un navegador. Pulsar «Iniciar operación» para ver la primera misión y «Volver al expediente» para regresar. Recargar devuelve a la intro; no se guarda progreso.

## Estructura

- `index.html`: textos y pantallas. Las fotos sustituirán los marcadores de `#memories` y la misión real el contenido de `#mission`.
- `style.css`: diseño adaptable a móvil.
- `script.js`: navegación, guardado de progreso, sopa de letras, temporizador y rompecabezas.
- `images/`: fotografías de los dos rompecabezas.
- `videos/`: futuros `mision-1.mp4`, `mision-2.mp4` y `mision-3.mp4` (todavía no incluidos).

Usar rutas relativas, como `images/foto-1.jpg`. Para los vídeos, añadir `controls playsinline preload="none"` y evitar reproducción automática. Así solo se cargan cuando hagan falta.

## GitHub Pages

Repositorio privado: https://github.com/jpubli17-glitch/23

La web se prueba localmente abriendo `index.html`. No se ha activado GitHub Pages ni se ha publicado la web. Mantener las rutas relativas para una futura publicación, si se decide autorizarla.

«Bloqueados» forma parte del juego: esta versión no incluye control de acceso ni protección de archivos.
