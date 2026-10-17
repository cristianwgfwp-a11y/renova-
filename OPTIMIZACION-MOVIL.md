# Revisión móvil final del PR #5

16 de octubre de 2026. Solo rama audit/conversion-2026-10-16 y Deploy Preview; sin fusión ni publicación de producción.

## Cambios

- Primera pantalla: ENVÍO GRATIS A TODO CHILE destacado, precio $49.990, imagen original y compra visibles. Se elimina de la interfaz la explicación del costo asumido por el vendedor.
- Confianza: seis tarjetas se sustituyen por tres mensajes compactos: Mercado Pago, envío gratis y atención personalizada por WhatsApp.
- Formulario móvil: menor espaciado; nombre/apellido y región/comuna comparten fila. Teléfono, email y dirección mantienen ancho completo. Referencia opcional desplegable nativa, utilizable sin JavaScript. No se elimina ningún campo ni el consentimiento.
- En checkout.js solo se simplifica el texto de envío. Sin cambios de lógica, destinos de pago, imágenes, esquema de Netlify ni notificaciones.

## Pruebas

Seis pruebas estructurales y suite de navegador aprobadas en 320, 360, 390, 430, 768, 1024 y 1440 px. Se comprueban campos, consentimiento, errores/reintentos, duplicados, atribución, envío 0/total 49990, enlaces e imágenes, ausencia de errores JavaScript, 17 Contact únicos, PageView/Lead/InitiateCheckout y ausencia de Purchase. Dieciséis navegaciones nativas sin JavaScript y POST nativo. La referencia opcional se conserva al cerrar el desplegable tanto con JavaScript como sin él.

Alturas locales con viewport de 844 px, misma página antes/después:

| Ancho | Confianza antes/después | Formulario antes/después |
|---|---|---|
| 320 px | 660 / 216 px | 1532 / 1144 px |
| 390 px | 618 / 216 px | 1447 / 1022 px |

A 390 px, formulario aproximadamente 29% más corto. El botón principal termina a 430 px desde el inicio, también visible en la prueba de pantalla 320 × 568. Son medidas de disposición, no evidencia de aumento de conversiones.

Los POST automáticos están interceptados localmente. La prueba real previa RNV-2E67D5353631 fue aceptada automáticamente como Verified en Netlify y el destinatario confirmó el aviso en Recibidos de cristianwgfwp@gmail.com. Este ajuste visual conserva formulario y configuración; no genera otra solicitud, pago ni venta ficticia.

## Netlify y pendientes

La producción revisada no contiene la barra Netlify Drawer de revisión de previews. Sí muestra una insignia existente Powered by Netlify (iframe nl-badge-frame): no es la barra de revisión y no se ha retirado ni cambiado ninguna configuración de producción. No se añade código de Netlify a la landing.

Pendiente manual: revisar esta vista previa en teléfonos iOS/Android con teclado real y navegador de Instagram; verificar entrega de eventos en Events Manager con acceso a Meta; revisar ambos buzones de Netlify periódicamente. Compra y Purchase requieren un pago real confirmado; no se simulan.

Vista previa: https://deploy-preview-5--renova-360.netlify.app/

PR: https://github.com/cristianwgfwp-a11y/renova-/pull/5
