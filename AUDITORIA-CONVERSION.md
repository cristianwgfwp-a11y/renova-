# Auditoría de conversión RENÖVA+ — 16 de octubre de 2026

**Recomendación:** verificar recepción, condiciones de despacho y medición antes de volver a anunciar. No hay evidencia suficiente para atribuir los resultados de la campaña a una única causa.

## Qué funciona

- **Versión publicada confirmada:** Netlify muestra `main @159ba92`, deploy `6ac6f3e08913f100084daf5e` del 7 de octubre. Su HTML coincide con el repositorio normalizando LF/CRLF. El PR #4 (`mejora-landing-v3-checkout`, `2e45000`) sigue siendo otra versión, disponible solo en vista previa.
- **Precio y producto:** $49.990 CLP por 1 Doypack de 21 sobres, sabor berries. Categoría, ingredientes y advertencia de suplemento visibles. Precio y compra en primera pantalla móvil a 390×844 y 320×568, sin desbordamiento del body en esas medidas.
- **Pago:** los cinco enlaces Comprar de producción usan `https://mpago.la/1StdMG6`. Mercado Pago abre, muestra producto, vendedor Cristian rojas y $49.990; ofrece tarjeta sin cuenta, transferencia y cuenta/app. No se pagó ni se introdujeron datos financieros.
- **Contacto corregido:** 14 enlaces apuntan al número +56 9 9541 4090, confirmado por el dueño. En la vista previa del PR #5, un clic navega a WhatsApp, que muestra el perfil Cristian y el mensaje correcto. Falta verificar envío/recepción real de un mensaje desde un teléfono.
- Landing, imágenes WebP y biblioteca pública de Meta responden HTTP 200.

## Qué falla o queda incompleto

| Comprobación | Resultado y alcance | Impacto / dificultad |
|---|---|---|
| Formulario en producción | No existe: cero formularios, inputs de pedido o backend en `main`. El formulario pertenece al PR #4, todavía sin publicar. | Alto / media para integrar versión revisada |
| WhatsApp en producción | Los 14 controles eran botones sin enlace, dependían de JS y `window.open`. En el navegador integrado un clic no abrió pestaña. No demuestra fallo universal en móviles. | Alto / baja; resuelto en PR #5 |
| Recepción del formulario PR #4 | La prueba se guardó completa en Netlify, **en spam**, aunque la página confirmó recepción. Los datos ficticios pueden explicar el filtro; no se puede extrapolar a clientes reales. | Alto / baja-media; revisar bandeja y probar con dueño |
| Notificaciones del formulario | Netlify → Submission notifications: **No webhooks set up yet**, sin notificaciones configuradas. Guardar datos no acredita aviso al vendedor. | Alto / baja; falta elegir destinatario/canal |
| Compra confirmada y atribución | Sin Purchase ni confirmación de pago en código propio; no hay webhook/conciliación automática en este repositorio. | Alto / media-alta |
| Despacho en producción | Cobertura nacional anunciada, pero costo, plazo y cobertura exacta se consultan por WhatsApp antes de pagar; no hay total entregado ni fecha comprometida en landing. | Alto / baja en contenido, media en checkout |
| Insignia de Netlify | Se superpone al contacto en pantalla pequeña y a contenido al desplazarse. La inyecta el hosting. | Medio / baja si configuración/plan lo permite |
| Carga | Tailwind CDN ejecutado en navegador, con advertencia de producción en consola. WebP producto 524.996 bytes y retrato 1.523.384 bytes; retrato ya tiene lazy loading. | Medio / media para CSS, baja-media imágenes |

Se observó una vez un error `MutationObserver.observe` sin URL de origen; no se reprodujo al recargar y no existe MutationObserver en el código propio. Origen indeterminado: no se atribuye a la landing. Los scripts propios pasan revisión de sintaxis. No se midieron Core Web Vitals, tiempos 4G controlados ni pago completo.

## Prueba identificada de pedidos

Probada la vista previa del PR #4 en `https://6accebb731ecef4b70f2c89e--renova-360.netlify.app/`, no producción. Se envió un registro con nombre **PRUEBA AUDITORIA / NO ES PEDIDO 20261016**, correo del dominio reservado `example.invalid`, teléfono y dirección ficticios, comentario explícito **NO CONTACTAR NI DESPACHAR**.

Referencia **RNV-61FFB629DF64**, recibida el **16/10/2026 a las 19:33 de Chile**. Se verificaron en Netlify nombre, apellido, teléfono, email, dirección, región Coquimbo, comuna La Serena, producto, cantidad 1, precio 49990, origen, fecha y consentimiento. La región se conservó pese a estar deshabilitada en pantalla. Se guardó en spam; no se marcó como pedido válido ni se pagó. UTM vacíos corresponden a una visita de prueba sin parámetros de campaña. No se probó aquí la variante de despacho ni persistencia de UTM mediante un segundo envío.

Esta prueba demuestra almacenamiento, no notificación por email, entrega de WhatsApp, compra ni calidad del filtrado para datos reales. La confirmación de pantalla no informa que el registro fue clasificado como spam. Los dos registros previos visibles en spam también estaban identificados como pruebas.

## Meta Pixel y lo que falta

Pixel **1616701470198212**: una inicialización y una llamada **PageView**. **Contact** se solicita por clic de WhatsApp; **InitiateCheckout** por clic Comprar, con 49990/CLP. En PR #4, además, **Lead** se solicita cuando el POST recibe respuesta exitosa, incluso si luego Netlify lo clasifica como spam. Lead no equivale a pedido válido ni venta.

Biblioteca Meta disponible por HTTP; tests con tracking disponible, ausente y fallando. **No se verificó recepción de eventos en Meta.** Events Manager conduce a inicio de sesión. Hace falta sesión autenticada con permiso para ver/probar el conjunto **1616701470198212**, Diagnósticos y cuenta publicitaria. Para evaluar campaña: objetivo, período, gasto, clics salientes, visitas a landing y resultados atribuidos. No compartir contraseñas.

No disparar Purchase desde el botón ni desde un retorno no validado. Una futura integración debe validar pago aprobado, importe y moneda desde servidor, asociar pedido y transacción, deduplicar y conciliar con ventas. Requiere acceso del desarrollador a la integración y notificaciones de Mercado Pago; los secretos los configura el dueño en el hosting.

La auditoría pudo generar PageView, Contact, InitiateCheckout y un Lead de prueba. No usarlos como resultados comerciales.

## Hipótesis: clics sin consultas

- Bloqueos de ventana o fallos de carga de JS podrían cortar el contacto. La dependencia está comprobada; su incidencia en la campaña no.
- Pedir coordinación de despacho antes de pagar añade un segundo paso/canal.
- Objetivo, segmentación y promesa del anuncio podrían atraer visitas poco cualificadas. Sin Ads Manager no se puede concluir.
- Ausencia de Purchase puede producir atribución incompleta; no demuestra que existan ventas no registradas.
- Producto visualmente pequeño, página extensa y ofertas por volumen podrían distraer. Requieren datos o prueba controlada, no un rediseño general.

Las **12 unidades** son stock informado por el dueño; no se encontró inventario conectado al checkout. No se añadió contador fijo ni se cambió oferta alguna.

## Qué corregir antes de anunciar

1. **Alta prioridad / baja dificultad:** revisar y aprobar PR #5; probar WhatsApp en Android/iPhone e Instagram/Facebook y confirmar un mensaje “PRUEBA AUDITORÍA — NO ES PEDIDO”. Revisar también spam de Netlify y elegir canal/destinatario de notificaciones.
2. **Alta / media:** decidir la integración del PR #4, revisar sus condiciones comerciales y validar el recorrido de pedido con el dueño. No publicar el formulario suponiendo que ya está en producción ni fusionar ambos PR sin resolver sus cambios coincidentes en index.html.
3. **Alta / baja-media:** confirmar y publicar costos/plazos/cobertura reales de despacho; verificar datos y aviso recibidos al pagar en Mercado Pago.
4. **Alta / media-alta:** validar eventos recibidos en Meta y establecer conciliación de compras antes de evaluar rendimiento por ventas o escalar inversión.
5. **Media / baja-media:** resolver superposición de insignia desde Netlify y preparar imágenes más pequeñas; compilar Tailwind como CSS estático con validación visual.

## Entrega técnica

**PR borrador #5:** https://github.com/cristianwgfwp-a11y/renova-/pull/5

**Vista previa:** https://deploy-preview-5--renova-360.netlify.app/

Rama `audit/conversion-2026-10-16`, basada en main publicado. Los 14 contactos pasan a enlaces nativos en la misma pestaña, conservando mensajes, número y Contact protegido con try/catch. Ajustes de foco/alineación para conservar presentación. Cinco pagos y textos comerciales intactos.

`node --test tests/conversion.test.cjs`: **7 pruebas aprobadas**; `git diff --check`: sin errores. Se comprueban 14 contactos, 5 pagos, scripts, inicialización de Pixel y navegación con tracking disponible/ausente/fallando. Vista previa revisada en navegador y WhatsApp alcanza el destinatario correcto. No se publicó producción ni se fusionó ningún PR.
