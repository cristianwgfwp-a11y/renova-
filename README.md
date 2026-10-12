# RENOVA 360 · V3

Landing estática de RENÖVA+. Se conservan Tailwind CDN, el Pixel y los WebP de la V2. No requiere compilación ni nuevos servicios externos.

## Pedido y pago

- Todos los CTA de compra abren `#pedido`, sin registrar intención de checkout.
- El formulario HTML `pedido-renova` usa Netlify Forms, honeypot y POST URL-encoded a `/pedido-recibido.html`. Incluye nombre, apellido, contacto, dirección, entrega, consentimiento, producto, cantidad, precio, fecha UTC, referencia `RNV-` de 12 caracteres aleatorios y atribución de campaña.
- Solo después de una respuesta HTTP exitosa de Netlify se muestra la confirmación y el enlace exacto `https://mpago.la/1StdMG6`. Errores de red, HTTP o tiempo de espera no habilitan el pago. Se bloquean envíos simultáneos y nuevos envíos después de guardar.
- Los reintentos mantienen la referencia para facilitar revisión de eventuales duplicados si el servidor recibió el pedido pero se perdió la respuesta. Netlify Forms no ofrece idempotencia transaccional ni confirma pagos.
- La entrega local fija región Coquimbo y comuna La Serena o Coquimbo. El despacho nacional destaca WhatsApp y advierte que su costo/modalidad deben coordinarse antes de pagar; $49.990 corresponde solo al producto.
- La referencia se muestra en pantalla y se incorpora al mensaje de WhatsApp junto con nombre y comuna. No se incluyen teléfono, email, dirección ni comentario en la URL de WhatsApp.
- No se almacenan datos personales en localStorage/sessionStorage ni se envían como parámetros de eventos. Solo los valores de campaña se conservan durante la sesión. URL de origen y referrer excluyen query/hash. No se guardan datos financieros.
- El correo y la referencia ayudan a Cristian a conciliar manualmente el pago/comprobante y coordinar entrega. El link fijo de Mercado Pago no incorpora automáticamente la referencia.
- Sin JavaScript, el POST nativo lleva a la página de recepción con instrucciones para contactar a Cristian; no se genera referencia automática ni se habilita un link de pago sin revisión.

## Eventos Meta

Un solo init del Pixel `1616701470198212` y un PageView por carga de la landing. `Contact` una vez por clic WhatsApp; `Lead` una vez tras el POST aceptado; `InitiateCheckout` una vez por clic en el pago desde la confirmación. No hay evento de compra confirmada. Los bloqueadores de publicidad pueden impedir que Meta reciba los eventos sin interrumpir el pedido.

## Pruebas reproducibles

Con Node.js y npm, desde `tests/`:

```sh
npm install
npx playwright install chromium
npm test
```

Para usar Chrome instalado, definir `QA_BROWSER` con la ruta a su ejecutable. Si Playwright está en el runtime compartido, definir `NODE_PATH` a sus módulos y ejecutar `node tests/validate.cjs` desde la raíz. El servidor de pruebas usa `127.0.0.1:4173` y simula las respuestas de Netlify, sin enviar solicitudes comerciales reales. El navegador necesita acceso al CDN ya utilizado por la V2.

Cobertura: 320, 360, 390, 430, 768, 1024 y 1440 px; overflow en secciones y confirmación; CTA del hero visible; menú/teclado; FAQ; validación requerida/consentimiento/teléfono; entrega local y regiones; error/reintento; envíos duplicados; payload y atribución; pago; eventos del Pixel; enlaces/imágenes y errores JavaScript. Capturas en `.qa/`, excluidas de Git.

## Verificación en Deploy Preview antes de fusionar

1. Confirmar en Netlify que está habilitada la detección de formularios y que el despliegue detectó `pedido-renova`. No publicar ni fusionar automáticamente.
2. Enviar un pedido de prueba identificable en el Deploy Preview y comprobar su aparición real en Forms, incluyendo referencia, región/comuna, consentimiento, fecha y UTM. Una respuesta HTTP exitosa por sí sola no demuestra que una cuenta mal configurada conserve el pedido; revisar también entradas filtradas como spam.
3. Configurar notificaciones desde Netlify Forms si se desean avisos de nuevos pedidos. No se configuraron notificaciones ni envío de correos al comprador en código.
4. En Meta Test Events verificar PageView → Contact / Lead → InitiateCheckout, sin duplicados, y que no se registra compra confirmada. Las pruebas locales verifican las llamadas, no la recepción externa.
5. Abrir el link de pago sin completar una transacción y confirmar que sigue correspondiendo a 1 RENÖVA+ por $49.990. La conciliación de pago y la coordinación de despacho siguen siendo manuales por WhatsApp.
6. Revisar en un teléfono real la interacción con teclado, safe area y cualquier badge de Netlify. En el formulario se ocultan los controles flotantes para no cubrir campos.

Documentación de referencia: [Netlify Forms](https://docs.netlify.com/manage/forms/setup/).
