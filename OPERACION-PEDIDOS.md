# Operación de solicitudes RENÖVA+ · 16 de octubre de 2026

## Configuración vigente

- Formulario: pedido-renova. Netlify Forms con detección habilitada, honeypot y clasificación antispam activa.
- Evento: New form submission, filtrado a pedido-renova.
- Destinatario oficial autorizado: cristianwgfwp@gmail.com.
- Asunto: RENÖVA+ — Nueva solicitud de pedido.
- La configuración del aviso está en el panel de Netlify, no en el HTML ni en variables públicas. No se creó un segundo aviso ni un correo al comprador.
- El aviso registra una solicitud: no confirma pago, venta, reserva de stock ni despacho.

## Condiciones comerciales confirmadas por el dueño

$49.990 CLP por doypack; envío gratis a todo Chile. El vendedor asume el costo del despacho. Sin fechas de entrega prometidas: modalidad y plazo se coordinan con el comprador.

Se actualizaron hero, pasos, entrega, resumen de pedido, FAQ, confirmación y mensaje de coordinación de WhatsApp. El formulario incluye precio_clp=49990, envio_clp=0 y total_clp=49990 para cantidad 1. No se agregó ningún evento Purchase.

## Qué verificar en cada solicitud

Nombre y apellido, teléfono, email, dirección y número, comuna, región, tipo de entrega, producto y cantidad, precio/envío/total, referencia, fecha, consentimiento y origen de campaña. La dirección completa queda en Netlify y en el aviso al vendedor; no se incorpora a parámetros de Meta ni a la URL de WhatsApp.

## Spam: límite y procedimiento

Las notificaciones nativas se envían para solicitudes verificadas. Un POST aceptado no garantiza que el filtro las clasifique como verificadas. Las pruebas con datos falsos o envíos repetidos pueden ir a spam; esto no demuestra que todos los pedidos legítimos se filtren igual.

1. Abrir Netlify → renova-360 → Forms → pedido-renova.
2. Revisar tanto Verified submissions como Spam submissions. Buscar la referencia que aparezca en la pantalla de confirmación.
3. Si una solicitud auténtica está en spam, verificar sus datos y marcar **solo esa solicitud** como Mark as verified. No validar en bloque entradas no comprobadas ni desactivar el filtro global.
4. Comprobar el correo del aviso, incluida la carpeta de spam de Gmail. Un aviso recuperado tras reclasificación no prueba que el clasificador lo aceptara automáticamente.
5. Para reportar falsos positivos recurrentes, conservar referencias y abrir soporte con Netlify. No prometer una tasa de falsos positivos de cero sin datos de pedidos reales.

Cualquier TEST manual conserva “TEST / NO ES PEDIDO REAL / NO CONTACTAR / NO DESPACHAR / SIN PAGO” en sus datos. Si se reclasifica como verificado para probar el aviso, sigue siendo un TEST, no una venta.

Referencias oficiales: [Notificaciones](https://docs.netlify.com/manage/forms/notifications/), [filtros de spam](https://docs.netlify.com/manage/forms/spam-filters/), [resolución de problemas con pruebas](https://docs.netlify.com/manage/forms/troubleshooting-tips/).

## Verificación y pendientes

La suite automatizada local comprueba los 17 contactos nativos (incluidas las 14 fuentes originales), navegación sin JS, formulario local/nacional, campos, atribución, importes de envío/total, reintentos/duplicados y eventos sin Purchase. Sus destinos son locales de prueba.

La prueba de almacenamiento, clasificación y correo en la nueva vista previa debe registrarse con su referencia y resultado. No basta con observar la confirmación de pantalla. Para afirmar entrega del aviso hay que verlo en Gmail o recibir confirmación expresa del dueño.

Se mantiene el PR #5 abierto para revisión; no fusionar el PR #4 por separado. No se modifica ni publica producción con estos cambios de interfaz.

## Resultado del TEST en la nueva vista previa

El 16/10/2026 a las 20:11 de Chile se registró el TEST identificado TEST-AVISO-20261016, referencia RNV-2E67D5353631. Netlify lo aceptó automáticamente en Verified submissions, sin intervención manual ni cambio de filtros. Se conservaron nombre/apellido, teléfono y correo oficiales de prueba, dirección expresamente de TEST sin entrega, comuna Santiago, región Metropolitana de Santiago, producto, cantidad, referencia, fecha y consentimiento. Se comprobaron precio_clp=49990, envio_clp=0, total_clp=49990 y UTM de QA.

En Spam submissions se observaron únicamente las cuatro pruebas técnicas anteriores; no se encontraron solicitudes de clientes ocultas en esa bandeja. Esta revisión y un TEST aceptado no garantizan ausencia futura de falsos positivos.

No se abrió Mercado Pago ni se generó pago, venta, mensaje WhatsApp o evento Purchase desde el código. El aviso quedó configurado para el correo oficial; la entrega del correo está pendiente de confirmación del dueño porque el Gmail conectado corresponde a otra cuenta.
