# Revisión integrada Renöva 360 · 16 de octubre de 2026

Versión unificada en la rama `audit/conversion-2026-10-16` y el PR #5. Se incorporó el contenido del PR #4 (`2e45000`) sobre la corrección del PR #5 (`7ff9711`), sin fusionar ningún PR ni modificar main.

## Conflictos resueltos

| Área | Resolución |
|---|---|
| index.html | Se conserva el recorrido de compra del PR #4: Comprar → datos → confirmación → Mercado Pago. Se conservan las 14 fuentes originales WhatsApp del PR #5. Las ocho consultas retiradas por V3 quedan dentro de un bloque desplegable secundario. |
| WhatsApp | Los 17 contactos (14 originales + vendedor, múltiples unidades y confirmación) son enlaces con href nativo. No se cancela la navegación ni se usa window.open. El contacto de confirmación actualiza href con la misma referencia mostrada. |
| Scripts | checkout.js es el único controlador del formulario y de los contactos; no se añadió el segundo listener de PR #5. Un solo init y PageView. Contact por clic, Lead tras POST aceptado e InitiateCheckout solo en el enlace real de pago. No hay Purchase. |
| Sin JavaScript | Contactos y bloque desplegable nativos; POST HTML con consentimiento y región. La página pedido-recibido.html ofrece contacto nativo para coordinar. No genera referencia automática sin JS, y no ofrece pago directo sin revisión. Se oculta el menú móvil que requiere JS. |
| Entrega | Se conserva cobertura y coordinación de la versión publicada. La promesa “sin costo” de PR #4 queda sustituida por consulta del costo antes de pagar, porque no está confirmada por el dueño. No se agregan tarifas ni plazos. |
| Pruebas | Se integran las pruebas del formulario del PR #4 con comprobaciones de contactos del PR #5 y navegación real sin JS en destinos locales de prueba. |

Precio: **$49.990 CLP / 1 Doypack / 21 sobres**. Stock informado: 12 unidades, sin inventario conectado. La referencia no se transmite automáticamente al enlace fijo de Mercado Pago; la conciliación sigue siendo manual.

## Recepción y notificaciones

Netlify tiene la detección de formularios habilitada y `pedido-renova` activo. La auditoría anterior comprobó que una prueba identificada se guardó completa, aunque fue clasificada como spam. Un POST aceptado acredita recepción técnica; no acredita clasificación como pedido válido, aviso al vendedor ni pago.

La integración mantiene nombre de formulario, action y campos, incluyendo región aunque el selector se deshabilite para entrega local. Incluye contacto, dirección, consentimiento, referencia y atribución. No se guardan datos personales en almacenamiento del navegador ni se envían como parámetros de Meta.

**Notificaciones configurables:** se verificó en el panel de Netlify que está disponible Email notification y HTTP POST request. No hay avisos configurados. Para configurar correo:

1. Abrir https://app.netlify.com/projects/renova-360/forms?tab=notifications.
2. Add notification → Email notification.
3. Event: New form submission; elegir **pedido-renova** en Form.
4. Completar Email to notify con el destinatario aprobado; asunto sugerido: “Nuevo pedido RENÖVA+”. Guardar y comprobar una notificación de prueba identificada, revisando también spam.

No se necesita cambiar código ni agregar secretos al HTML. No se habilitaron avisos porque falta elegir destinatario y autorizar el envío de datos de pedidos a ese correo. El formulario del sitio comparte bandeja entre vistas previas y producción: las pruebas deben indicar NO CONTACTAR / NO DESPACHAR. No se desactivaron filtros de spam.

## Pruebas automáticas

Ejecutar desde tests: `pnpm install --frozen-lockfile` y `pnpm test`. Chrome instalado puede seleccionarse con QA_BROWSER; alternativamente instalar Chromium con `pnpm exec playwright install chromium`.

Cobertura ejecutada: 5 pruebas estructurales y suite de navegador en 320, 360, 390, 430, 768, 1024 y 1440 px; CTA visible, menú/teclado, FAQ, validación, consentimiento, entrega local y nacional, error HTTP/reintento, bloqueo de duplicados, payload/UTM, referencia dinámica, URL de pago, conteo de eventos, imágenes, anclas y errores JS. Suite adicional de 16 navegaciones sin JS, POST nativo y tracking ausente/fallando. Los POST y destinos de la suite son locales; no simulan ventas ni emiten Purchase.

## Pruebas manuales pendientes antes de aprobar

- [ ] Revisar vista previa integrada en Android/iPhone y navegadores de Instagram/Facebook, con teclado y safe area. Verificar contacto, foco y que controles flotantes no cubran formulario.
- [ ] Confirmar recepción del mensaje WhatsApp de prueba que el dueño indicó que enviaría.
- [ ] Elegir correo de avisos, configurar y verificar entrega real de una notificación. Revisar spam de Netlify y correo.
- [ ] Verificar PageView, Contact, Lead e InitiateCheckout recibidos en Meta Test Events, sin duplicados y sin datos personales. Hace falta sesión autenticada con acceso al conjunto 1616701470198212.
- [ ] Con el dueño, validar costo de entrega local, cobertura/costos/plazos de despacho nacional y condiciones de consultas por volumen. El preview pide consultar el costo; no promete gratuidad.
- [ ] Comprobar con el siguiente pago real cómo se concilian referencia, correo y comprobante con Mercado Pago. Guardar datos o abrir pago no confirma una venta. No se creó medición Purchase sin confirmación del servidor.
- [ ] Revisar insignia de Netlify en el sitio de producción; configuración y posición pueden diferir del preview.

## Aprobaciones necesarias

**Comercial:** confirmar si la entrega en La Serena/Coquimbo es gratuita; tarifas/plazos/cobertura si se desea publicarlos. Hasta esa confirmación se utiliza el texto prudente de consulta previa.

**Operativa:** elegir destinatario/canal de notificaciones. Se prepara la configuración, pero no se enviarán datos de pedidos a un destinatario supuesto.

**Publicación:** solo después de revisar el PR #5 integrado y su Deploy Preview. El PR #4 queda abierto como referencia; no fusionarlo además del #5, pues reintroduciría la versión anterior de index.html y checkout.js.
