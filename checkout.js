'use strict';

(() => {
    const form = document.querySelector('#order-form');
    const confirmation = document.querySelector('#order-confirmation');
    const status = document.querySelector('#order-status');
    const submit = document.querySelector('#submit-order');
    const delivery = form.elements.tipo_entrega;
    const region = form.elements.region;
    const city = form.elements.comuna;
    let pending = false;
    let savedOrder = null;
    let reference = '';
    let submittedAt = '';

    // Tracking contains only product information, never customer fields.
    function track(event, parameters = {}) {
        try {
            if (typeof window.fbq === 'function') window.fbq('track', event, parameters);
        } catch (_) { /* Analytics must not interrupt the order. */ }
    }

    const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid'];
    const query = new URLSearchParams(window.location.search);
    let attribution = {};
    try { attribution = JSON.parse(sessionStorage.getItem('renova-attribution') || '{}'); } catch (_) {}
    attributionKeys.forEach(key => {
        const value = query.get(key);
        if (value) attribution[key] = value.slice(0, 500);
        form.elements[key].value = typeof attribution[key] === 'string' ? attribution[key] : '';
    });
    // Store campaign values only, never a customer's contact or address.
    try { sessionStorage.setItem('renova-attribution', JSON.stringify(attribution)); } catch (_) {}
    form.elements.url_origen.value = window.location.origin + window.location.pathname;
    try {
        const referrer = new URL(document.referrer);
        form.elements.referrer_origen.value = referrer.origin + referrer.pathname;
    } catch (_) { form.elements.referrer_origen.value = ''; }

    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('#nav-links');
    function closeMenu() {
        menu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    menuToggle.addEventListener('click', () => {
        const open = menuToggle.getAttribute('aria-expanded') !== 'true';
        menu.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menu.classList.contains('is-open')) {
            closeMenu();
            menuToggle.focus();
        }
    });
    document.querySelectorAll('a[data-buy-source]').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
            // Opening the form is not checkout intent.
            (savedOrder ? document.querySelector('#confirmation-title') : document.querySelector('#order-title')).focus({ preventScroll: true });
        });
    });

    function updateDelivery() {
        const local = ['La Serena', 'Coquimbo'].includes(delivery.value);
        region.disabled = local;
        city.readOnly = local;
        if (local) {
            region.value = 'Coquimbo';
            city.value = delivery.value;
        } else {
            if (['La Serena', 'Coquimbo'].includes(city.value)) city.value = '';
        }
        document.querySelector('#delivery-note').textContent = local
            ? 'Entrega local sin costo en ' + delivery.value + ', sujeta a horario y disponibilidad. Coordinamos contigo.'
            : delivery.value === 'Despacho'
                ? 'Envío gratis a todo Chile. Total por 1 doypack: $49.990 CLP. Coordinamos contigo los detalles de entrega.'
                : 'Selecciona cómo deseas recibir tu pedido.';
    }
    delivery.addEventListener('change', updateDelivery);

    form.querySelectorAll('input:not([type=hidden]), textarea').forEach(field => {
        field.addEventListener('input', () => {
            field.setCustomValidity('');
            field.removeAttribute('aria-invalid');
        });
        field.addEventListener('invalid', () => field.setAttribute('aria-invalid', 'true'));
    });

    function makeReference() {
        const bytes = new Uint8Array(6);
        crypto.getRandomValues(bytes);
        return 'RNV-' + Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    function showConfirmation(data) {
        savedOrder = data;
        document.querySelector('#confirm-name').textContent = data.nombre + ' ' + data.apellido;
        document.querySelector('#confirm-city').textContent = data.comuna;
        document.querySelector('#confirm-delivery').textContent = data.tipo_entrega === 'Despacho' ? 'Despacho a otra comuna / región' : 'Entrega ' + data.tipo_entrega;
        document.querySelector('#confirm-reference').textContent = data.referencia;
        const dispatch = data.tipo_entrega === 'Despacho';
        confirmation.classList.toggle('is-dispatch', dispatch);
        document.querySelector('#dispatch-warning').hidden = !dispatch;
        document.querySelector('#coordinate-order').textContent = dispatch ? 'Coordinar despacho por WhatsApp' : 'Coordinar por WhatsApp';
        document.querySelector('#coordinate-order').dataset.waMsg =
            'Hola Cristian. Quiero coordinar mi pedido de RENÖVA+.\n\nReferencia: ' + data.referencia +
            '\nNombre: ' + data.nombre + '\nComuna: ' + data.comuna +
            '\nProducto: RENÖVA+\nPrecio producto: $49.990' +
            '\nEnvío gratis a todo Chile. Quisiera coordinar los detalles de entrega.';
        document.querySelector('#coordinate-order').href = 'https://wa.me/56995414090?text=' + encodeURIComponent(document.querySelector('#coordinate-order').dataset.waMsg);
        form.hidden = true;
        confirmation.hidden = false;
        document.querySelector('#confirmation-title').focus();
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (pending || savedOrder) return;
        for (const field of form.querySelectorAll('input[type=text], input[type=email], input[type=tel], textarea')) {
            field.value = field.value.trim();
            field.setCustomValidity(field.required && !field.value ? 'Completa este campo para coordinar tu pedido.' : '');
        }
        const phoneDigits = form.elements.telefono.value.replace(/\D/g, '');
        form.elements.telefono.setCustomValidity(
            /^[+\d\s().-]+$/.test(form.elements.telefono.value) && phoneDigits.length >= 8 && phoneDigits.length <= 15
                ? '' : 'Ingresa un teléfono válido con código de país, por ejemplo +56 9 1234 5678.'
        );
        if (!form.reportValidity()) return;
        pending = true;
        submit.disabled = true;
        submit.textContent = 'Guardando tus datos…';
        form.setAttribute('aria-busy', 'true');
        status.textContent = 'Estamos registrando tu pedido. Espera la confirmación antes de continuar.';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
            if (!reference) reference = makeReference();
            if (!submittedAt) submittedAt = new Date().toISOString();
            form.elements.referencia.value = reference;
            form.elements.fecha_hora.value = submittedAt;
            const data = new FormData(form);
            // Disabled local region is included explicitly in the submission.
            data.set('region', region.value);
            const response = await fetch(form.getAttribute('action'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString(),
                signal: controller.signal
            });
            if (!response.ok) throw new Error('Submission rejected');
            // Netlify must accept the POST before any payment controls are exposed.
            showConfirmation(Object.fromEntries(data.entries()));
            track('Lead', { content_name: 'Pedido RENÖVA+', value: 49990, currency: 'CLP' });
            status.textContent = '';
        } catch (_) {
            status.textContent = 'No pudimos confirmar que tus datos se guardaron. No continúes al pago todavía. Revisa tu conexión e intenta nuevamente, o consulta a Cristian por WhatsApp. Si ya enviaste el formulario, la referencia ' + reference + ' permite revisar tu solicitud.';
        } finally {
            clearTimeout(timeout);
            pending = false;
            submit.disabled = false;
            submit.textContent = 'Guardar mis datos y continuar';
            form.removeAttribute('aria-busy');
        }
    });

    // One listener per real contact action, including the dynamic confirmation CTA.
    document.querySelectorAll('.wa-btn').forEach(button => {
        button.addEventListener('click', () => {
            track('Contact', { content_name: 'WhatsApp Renova 360' });
            // Native href handles navigation even when JavaScript or tracking is unavailable.
        });
    });

    document.querySelector('#payment-link').addEventListener('click', event => {
        if (!savedOrder) { event.preventDefault(); return; }
        track('InitiateCheckout', { content_name: 'RENÖVA+ · 1 Doypack', value: 49990, currency: 'CLP', num_items: 1 });
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            document.body.classList.toggle('order-active', entries[0].isIntersecting);
        }, { threshold: 0 }).observe(document.querySelector('#pedido'));
        const visibleActions = new Set();
        const floating = document.querySelector('.whatsapp-floating');
        const buyBar = document.querySelector('.mobile-buy-bar');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= .75) visibleActions.add(entry.target);
                else visibleActions.delete(entry.target);
            });
            floating.classList.toggle('is-hidden', visibleActions.size > 0);
            buyBar.classList.toggle('is-hidden', Array.from(visibleActions).some(element => element.hasAttribute('data-buy-source')));
        }, { threshold: [0, .75], rootMargin: '-64px 0px -80px 0px' });
        document.querySelectorAll('main .wa-btn, main a[data-buy-source]').forEach(element => observer.observe(element));
    }
})();
