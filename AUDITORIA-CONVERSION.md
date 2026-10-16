# Auditoría de conversión RENÖVA+ — 16 de octubre de 2026

**Decisión:** corregir y verificar contacto, despacho y atribución antes de invertir más. No hay evidencia suficiente para atribuir la ausencia de consultas a una causa única.

## Qué funciona

- El HTML de https://renova-360.netlify.app/ coincide con `main` / `159ba925f92bc405e05d400666f9f9b132005e92` (merge PR #3), normalizando LF/CRLF. Esto identifica el contenido; falta el registro de Netlify para certificar el deploy y su commit de origen.
- Precio de 1 Doypack: **$49.990 CLP**; 21 sobres, sabor berries, categoría e ingredientes visibles. El checkout muestra “Renöva+ - Suplemento Alimentario”, vendedor “Cristian rojas” y $49.990.
- Los cinco enlaces Comprar apuntan a `https://mpago.la/1StdMG6`; abre Mercado Pago y ofrece tarjeta sin cuenta, transferencia y acceso con cuenta/app. No se introdujeron datos financieros ni se pagó.
- Número de las 14 rutas WhatsApp: **+56 9 9541 4090**, confirmado por el dueño. Mensajes codificados y rutas revisados; apertura y recepción efectiva del chat requieren la prueba descrita abajo.
- HTTP 200 en landing, imágenes WebP y biblioteca pública de Meta. Precio, compra y contacto visibles en primera pantalla móvil a 390×844; a 320×568 el contacto queda cerca del borde inferior. No se observó desbordamiento horizontal del body en esas medidas.

## Problemas comprobados y límites

| Hallazgo | Evidencia / consecuencia | Prioridad / dificultad |
|---|---|---|
| No existe formulario de pedidos | Cero `<form>`; no inputs de pedido, endpoint, Netlify Forms ni servidor en el repositorio. No se puede probar entrega de datos de un formulario inexistente. | Alta / media si se decide crearlo |
| Contacto dependía de JS y `window.open` | Los 14 controles eran botones sin `href`. Con JS deshabilitado no navegan. En el navegador integrado, un clic en Consultar no abrió otra pestaña; no prueba que falle en todos los teléfonos. | Alta / baja; corregido en PR |
| Falta medición confirmada de compras | El código tiene PageView, Contact e InitiateCheckout; no Purchase, confirmación de pago, webhook ni conciliación de transacciones. Un clic de compra nunca acredita una venta. | Alta / media-alta |
| Despacho incompleto para pagar directamente | Se anuncia cobertura nacional, pero costo, plazo y cobertura por dirección se consultan por WhatsApp antes del pago. No hay total entregado ni fecha comprometida en landing. | Alta / baja en contenido, media en checkout |
| Insignia flotante Netlify superpuesta | Se observó encima del contacto inferior en pantalla pequeña y encima de contenido al desplazarse. La inyecta el hosting; no está en index.html. | Media / baja si configuración/plan lo permite |
| Estilos dependen de Tailwind CDN en tiempo de ejecución | Advertencia explícita de consola; recurso externo bloqueante para configuración y presentación. No se comprobó una caída real del CDN. | Media / media; compilar CSS y verificar visualmente |
| Imágenes grandes | Producto WebP 524.996 bytes; retrato WebP 1.523.384 bytes (retrato ya usa lazy). No hay medidas de Core Web Vitals ni prueba 4G controlada. | Media / baja-media |

Se observó una vez `MutationObserver.observe: parameter 1 is not of type Node` sin URL de origen. No se reprodujo en recarga posterior y no hay MutationObserver en el código propio: origen sin determinar, no se atribuye a la landing. No se encontraron errores de sintaxis en los scripts propios. La disponibilidad HTTP no garantiza ausencia de fallos intermitentes ni valida el pago completo.

## Medición Meta: qué está realmente auditado

Pixel **1616701470198212** inicializado una vez, con una llamada PageView. Contact se solicita en cada clic WhatsApp, protegido con try/catch. InitiateCheckout se solicita en cada clic Comprar con valor 49990 y moneda CLP. La biblioteca de Meta responde HTTP 200. Los tests locales simulan tracking disponible, ausente y fallando para las 19 rutas.

**No verificado:** recepción/duplicación en Events Manager, propiedad del conjunto de datos, restricciones/diagnósticos, configuración de campaña, atribución, coincidencia avanzada o integraciones fuera del repositorio. Contact significa clic saliente, no mensaje enviado o recibido. InitiateCheckout significa clic hacia pago, no checkout completado. GTM y dataLayer tienen comentarios de ejemplo, no medición operativa adicional.

La navegación de auditoría en producción pudo generar PageView y clics de prueba Contact/InitiateCheckout; no ventas. No usar esos eventos como resultados de campaña. No se enviaron mensajes ni pedidos ficticios a clientes.

## Hipótesis que podrían explicar clics sin consultas

1. Fallos de apertura de ventana o carga de JS podrían cortar WhatsApp; la dependencia está comprobada, su incidencia en la campaña no.
2. Tener que consultar despacho antes de un pago directo añade una decisión y un segundo canal. Falta medir abandono entre clic, visita efectiva y contacto.
3. Objetivo de campaña, segmentación, anuncio y promesa podrían atraer clics poco cualificados. Sin exportación de Ads Manager no se puede evaluarlo.
4. La lectura de cero ventas atribuidas puede reflejar falta de Purchase y conciliación. Tampoco demuestra que haya ventas ocultas.
5. Producto pequeño en la primera pantalla, contenido extenso y alternativas por volumen pueden restar claridad al comprador nuevo. Son hipótesis de diseño; no justifican rediseñar ni cambiar afirmaciones sin datos.

Las **12 unidades** son stock informado por el dueño, no inventario conectado a checkout. No se añadió contador fijo ni se cambió ninguna oferta.

## Antes de volver a anunciar

1. Revisar y aprobar el PR; verificar los contactos en Android/iPhone y en navegadores integrados de Instagram/Facebook, además de navegador normal. Enviar al número confirmado un mensaje **“PRUEBA AUDITORÍA RENÖVA — NO ES UN PEDIDO — [fecha/hora]”** y confirmar recepción con Cristian. El navegador de auditoría no dispone de una sesión WhatsApp para enviar y comprobar recepción.
2. Confirmar condiciones reales de despacho por comuna/región y cómo se cobran; publicarlas solo con aprobación comercial. Verificar que Mercado Pago capture datos suficientes para coordinar cada pedido y que exista confirmación al comprador y aviso al vendedor.
3. Abrir Events Manager → conjunto 1616701470198212 → Probar eventos/Diagnósticos, y verificar PageView, Contact e InitiateCheckout. Hace falta acceso de lectura/prueba a ese conjunto de datos y a la cuenta publicitaria para revisar campaña y atribución, mediante sesión autenticada o invitación con permisos mínimos; nunca contraseñas.
4. Con acceso de desarrollador a la integración Mercado Pago, diseñar confirmación de pago desde servidor: validar estado aprobado, importe y moneda; asociar identificador de pedido; deduplicar; registrar Purchase/conciliar ventas. No disparar Purchase desde el botón ni desde un retorno no validado. Hace falta acceso a pagos/notificaciones de la cuenta vendedora; las credenciales deben configurarse en secretos del hosting por el dueño.
5. En Netlify, comprobar historial de despliegue, conexión con GitHub y Deploy Previews. Hace falta acceso al sitio exacto y permisos de configuración para resolver vista previa e insignia. No publicar cambios en producción durante esta auditoría.

## Corrección incluida y pruebas

- Los 14 botones de contacto pasan a enlaces nativos en la misma pestaña con sus mensajes originales. Navegan sin JS y evitan depender de ventanas emergentes. Se conserva Contact, precios y todo texto comercial. Los cinco enlaces Mercado Pago quedan intactos.
- Ajuste de foco de teclado para enlaces y alineación de las opciones de packs.
- `node --test tests/conversion.test.cjs`: **7 pruebas pasan** (scripts, 14 contactos, 5 pagos, tracking disponible/ausente/fallando, inicialización de Pixel). `git diff --check`: sin errores.
- No hay formulario que pueda recibir una prueba identificada. No se inventó un backend ni un buzón de recepción. Quedan explícitamente pendientes la recepción en WhatsApp, datos entregados por Mercado Pago y recepción de eventos en Meta.
