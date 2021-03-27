<h1 align="center">scraper.js</h1>

Un scraper que optiene la info de la pagina objetivo y lo almacena en un csv

## Inicialización 🚀

Para instalar las dependecias

```javascript
npm i
```

Por defecto se te abrira el navegador donde podras ver como se va corriendo todo el scrip de manera automatica, para desactivarlo y que el script corra
mas rapido, puedes setear `true` la propiedad `headless`, así:

```javascript
puppeteer.launch({ headless: true })
```

## Documentación 📜

* [Puppeteer](https://pptr.dev/): Esta es toda la documentacion oficial de puppeteer, hay mas opciones para hacer el scraping, la ventaja de puppeteer es
que nos permite que el scraping sea dinamico porque podemos interactuar con el DOM y hacer que se disparen eventos de JS, como clicks, escrbir en el teclado
y un gran etc.
