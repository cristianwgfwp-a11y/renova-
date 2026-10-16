# RENOVA 360 · versión integrada PR #4 + PR #5

Landing estática de RENÖVA+. Se conservan Tailwind CDN, el Pixel y los WebP de la V2. No requiere compilación ni nuevos servicios externos.

## Pedido y pago

- Todos los CTA de compra abren `#pedido`, sin registrar intención de checkout.
- El formulario HTML `pedido-renova` usa Netlify Forms, honeypot y POST URL-encoded a `/pedido-recibido.html`. Incluye nombre, apellido, contacto, dirección, entrega, consentimiento, producto, cantidad, precio, fecha UTC, referencia `RNV-` de 12 caracteres aleatorios y atribución de campaña.
- Solo después de una respuesta HTTP exitosa de Netlify se muestra la confirmación y el enlace exacto `https://mpago.la/1StdMG6`. Errores de red, HTTP o tiempo de espera no habilitan el pago. Se bloquean envíos simultáneos y nuevos envíos después de guardar.
- Los reintentos mantienen la referencia para facilitar revisión de eventuales duplicados si el servidor recibió el pedido pero se perdió la respuesta. Netlify Forms no ofrece idempotencia transaccional ni confirma pagos.
- Condiciones confirmadas por el dueño: $49.990 CLP por doypack, envío gratis a todo Chile y costo de despacho asumido por el vendedor. La entrega local fija región Coquimbo y comuna La Serena o Coquimbo. Se coordinan modalidad y plazo sin prometer fechas no confirmadas. El formulario guarda precio_clp=49990, envio_clp=0 y total_clp=49990 para cantidad 1.
- La referencia se muestra en pantalla y se incorpora al mensaje de WhatsApp junto con nombre y comuna. No se incluyen teléfono, email, dirección ni comentario en la URL de WhatsApp.
- No se almacenan datos personales en localStorage/sessionStorage ni se envían como parámetros de eventos. Solo los valores de campaña se conservan durante la sesión. Los campos `url_origen` y `referrer_origen` enviados por la aplicación excluyen query/hash. El nombre propio evita que Netlify sobrescriba el referrer sanitizado; Netlify agrega además sus metadatos de solicitud. No se guardan datos financieros.
- El correo y la referencia ayudan a Cristian a conciliar manualmente el pago/comprobante y coordinar entrega. El link fijo de Mercado Pago no incorpora automáticamente la referencia.
- Sin JavaScript, el POST nativo lleva a la página de recepción con instrucciones para contactar a Cristian; no se genera referencia automática ni se habilita un link de pago sin revisión.

## Eventos Meta

Un solo init del Pixel `1616701470198212` y un PageView por carga de la landing. `Contact` una vez por clic WhatsApp; `Lead` una vez tras el POST aceptado; `InitiateCheckout` una vez por clic en el pago desde la confirmación. No hay evento de compra confirmada. Los bloqueadores de publicidad pueden impedir que Meta reciba los eventos sin interrumpir el pedido.

## Pruebas reproducibles

Con Node.js y pnpm, desde `tests/`:

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
3. La notificación de nuevas solicitudes de pedido-renova está configurada en Netlify para cristianwgfwp@gmail.com. Ver OPERACION-PEDIDOS.md para pruebas, bandeja de spam y recuperación de falsos positivos. No hay correos automáticos al comprador en código.
4. En Meta Test Events verificar PageView → Contact / Lead → InitiateCheckout, sin duplicados, y que no se registra compra confirmada. Las pruebas locales verifican las llamadas, no la recepción externa.
5. Abrir el link de pago sin completar una transacción y confirmar que sigue correspondiendo a 1 RENÖVA+ por $49.990. La conciliación de pago y la coordinación de despacho siguen siendo manuales por WhatsApp.
6. Revisar en un teléfono real la interacción con teclado, safe area y cualquier badge de Netlify. En el formulario se ocultan los controles flotantes para no cubrir campos.

Documentación de referencia: [Netlify Forms](https://docs.netlify.com/manage/forms/setup/).

## Verificación realizada · 12 de octubre de 2026

PR #4 y [Deploy Preview](https://deploy-preview-4--renova-360.netlify.app/) creados, sin fusionar ni publicar producción. Se habilitó la detección de formularios que estaba desactivada en Netlify y se reconstruyó solo el preview. `pedido-renova` aparece como formulario activo.

Dos pedidos ficticios, sin pagos ni mensajes externos, fueron recibidos y revisados en Netlify Forms: `RNV-3A5C799D7833` (La Serena) y `RNV-FF2C663BF8F1` (despacho a Viña del Mar). Se comprobaron datos, dirección, consentimiento, precio, referencia y UTM/fbclid en el segundo caso. Netlify los clasificó como spam; siguen identificados como pruebas técnicas. La recepción real de eventos en Meta Test Events, el comprobante de pago y la entrega física requieren revisión manual. No se habilitaron notificaciones.

## Integración del 16 de octubre

Se conservaron las 14 fuentes originales de WhatsApp del PR #5 y las tres adicionales del PR #4: 17 enlaces nativos en total, sin ventanas emergentes ni dependencia de JavaScript. Las ocho consultas secundarias que V3 había eliminado están agrupadas en un bloque desplegable. El enlace dinámico de confirmación conserva la referencia del pedido mediante href.

Las pruebas verifican las 14 fuentes originales, los 17 enlaces, 16 navegaciones con JavaScript deshabilitado (el enlace de confirmación requiere primero guardar con JS), POST nativo sin JS, formulario completo con JS, eventos y distintos tamaños móviles. Los destinos WhatsApp y los POST de esta suite son simulados localmente, sin ventas.

Notificaciones y criterios de aprobación: ver REVISION-INTEGRADA.md. No fusionar el PR #4 por separado después de esta integración. AUDITORIA-CONVERSION.md conserva el diagnóstico de producción previo a la integración.

## Actualización comercial y notificaciones · 16 de octubre

Envío gratis a todo Chile confirmado por el dueño. No se requiere cotizar el despacho antes de pagar; se conservan la coordinación de entrega y conciliación manual del pago. Aviso de nuevas solicitudes de pedido-renova configurado al correo oficial; los registros en spam requieren revisión. Los resultados históricos de pruebas anteriores no equivalen a ventas.
