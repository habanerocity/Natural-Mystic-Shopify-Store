//gsap animations
gsap.registerPlugin(ScrollTrigger);

//hero div animation
gsap.from(".hero-div", {
    opacity: 0,
    y: 100,
    duration: 1
});

//spicebanner div animation
gsap.from(".banner-new", {
    scrollTrigger: ".banner-new",
    opacity: 0,
    y: 100,
    duration: .5
})

gsap.from(".spice_banner-title", {
    scrollTrigger: ".spice_banner-title",
    opacity: 0,
    y: 100,
    duration: .5,
    delay: .5
})

gsap.from(".spice_banner-description", {
    scrollTrigger: ".spice_banner-description",
    opacity: 0,
    y: 100,
    duration: .5,
    delay: .5
})

gsap.from(".banner__button", {
    scrollTrigger: ".banner__button",
    opacity: 0,
    y: 100,
    duration: .5,
    delay: .5
})

//blog grid animation
gsap.from(".blog_grid_child-1", {
    scrollTrigger: ".blog_grid_child-1",
    opacity: 0,
    y: 100,
    duration: .5
})

gsap.from(".blog_grid_child-2", {
    scrollTrigger: ".blog_grid_child-2",
    opacity: 0,
    y: 100,
    duration: .5,
    delay: .75
})

gsap.from(".blog_grid_child-3", {
    scrollTrigger: ".blog_grid_child-3",
    opacity: 0,
    y: 100,
    duration: .5,
    delay: 1.5
})

//catalog card animation
// gsap.from(".product_card", {
//     scrollTrigger: ".product_card",
//     opacity: 0,
//     y: 100,
//     stagger: 0.4
// })

gsap.set(".product_card", { y: 100, opacity: 0 });

ScrollTrigger.batch(".product_card", {
    interval: 1, // time window (in seconds) for batching to occur. 
    batchMax: 4,   // maximum batch size (targets). Can be function-based for dynamic values
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: { each: 0.15, grid: [1, 4] }, overwrite: true }),
    onEnterBack: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
    // you can also define most normal ScrollTrigger values like start, end, etc.
    start: "20px bottom",
    end: "top top"
});

// when ScrollTrigger does a refresh(), it maps all the positioning data which 
// factors in transforms, but in this example we're initially setting all the ".box"
// elements to a "y" of 100 solely for the animation in which would throw off the normal 
// positioning, so we use a "refreshInit" listener to reset the y temporarily. When we 
// return a gsap.set() in the listener, it'll automatically revert it after the refresh()!
ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".product_card", { y: 0, opacity: 1 }));

//blog page card animation

gsap.from(".blog_card", {
    opacity: 0,
    y: 100,
    stagger: 0.75
})

// sort products (keeps active filters, goes back to page 1)
if (document.getElementById('sort_by') != null) {
    document.querySelector('#sort_by').addEventListener('change', (e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', e.currentTarget.value);
        url.searchParams.delete('page');

        window.location = url.href;
    });
}

// collection grid view toggle (large / compact), remembered per browser
(function () {
    const grid = document.getElementById('ProductGrid');
    const buttons = document.querySelectorAll('[data-grid-view]');
    if (!grid || !buttons.length) return;

    const apply = (view) => {
        grid.setAttribute('data-view', view);
        buttons.forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.gridView === view ? 'true' : 'false'));
    };

    apply(grid.getAttribute('data-view') || 'compact');

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            apply(btn.dataset.gridView);
            try { localStorage.setItem('collectionGridView', btn.dataset.gridView); } catch (e) {}
        });
    });
})();

// collection filters: leave empty price fields out of the URL so they don't count as filters
(function () {
    const form = document.querySelector('[data-collection-filters]');
    if (!form) return;
    form.addEventListener('submit', () => {
        form.querySelectorAll('input[type="number"]').forEach((input) => {
            if (input.value.trim() === '') input.disabled = true;
        });
    });
})();

//forgot password script

if (document.getElementById('forgotPassword') != null) {
    document.getElementById("forgotPassword").addEventListener("click", function (e) {
        const element = document.querySelector("#forgot_password_form");

        if (element.classList.contains('d-none')) {
            element.classList.remove("d-none");
            element.classList.add('d-block');
        }
    })
}

//product quick view modal (collection pages)

(function () {
    const modalEl = document.getElementById('productInfoModal');
    if (!modalEl || !window.bootstrap) return;

    const modal = new bootstrap.Modal(modalEl);
    const $ = (selector) => modalEl.querySelector(selector);

    // Lets the CSS give this modal's backdrop the frosted-glass look (set before Bootstrap draws the backdrop)
    modalEl.addEventListener('show.bs.modal', () => document.body.classList.add('quickview-open'));
    modalEl.addEventListener('hidden.bs.modal', () => document.body.classList.remove('quickview-open'));
    const main = $('[data-quickview-main]');
    const thumbsEl = $('[data-quickview-thumbs]');
    const counter = $('[data-quickview-counter]');
    const prevBtn = $('[data-quickview-step="-1"]');
    const nextBtn = $('[data-quickview-step="1"]');
    const titleEl = $('[data-quickview-title]');
    const priceEl = $('[data-quickview-price]');
    const compareEl = $('[data-quickview-compare]');
    const badgeEl = $('[data-quickview-badge]');
    const descEl = $('[data-quickview-description]');
    const optionsEl = $('[data-quickview-options]');
    const idInput = $('[data-quickview-variant-id]');
    const qtyInput = $('#modalItemQuantity');
    const addBtn = $('[data-quickview-add]');
    const statusEl = $('[data-quickview-status]');
    const linkEl = $('[data-quickview-link]');
    const form = $('#addToCartForm');
    const wishlistBtn = $('[data-quickview-wishlist]');
    const heart = wishlistBtn && wishlistBtn.querySelector('.swym-button');

    const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    const currency = window.Shopify && window.Shopify.currency && window.Shopify.currency.active;
    const cache = {};
    let product = null;
    let images = [];
    let current = 0;

    const escapeHTML = (value) => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const money = (cents) => {
        const amount = (cents || 0) / 100;
        try {
            if (currency) return new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency: currency }).format(amount);
        } catch (e) { /* fall through */ }
        return amount.toFixed(2);
    };

    const sized = (src, width) => src ? src + (src.includes('?') ? '&' : '?') + 'width=' + width : '';
    const baseSrc = (src) => (src || '').split('?')[0].replace(/^https?:/, '');

    // ----- gallery -----
    function showImage(index) {
        if (!images.length) return;
        current = (index + images.length) % images.length;
        main.querySelectorAll('.quickview__slide').forEach((slide, i) => {
            slide.classList.toggle('is-active', i === current);
            slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
        });
        thumbsEl.querySelectorAll('.quickview__thumb').forEach((thumb, i) => {
            if (i === current) {
                thumb.setAttribute('aria-current', 'true');
                thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            } else {
                thumb.removeAttribute('aria-current');
            }
        });
        counter.textContent = (current + 1) + ' / ' + images.length;
    }

    function renderGallery() {
        main.querySelectorAll('.quickview__slide').forEach((slide) => slide.remove());
        thumbsEl.innerHTML = '';

        const slidesHTML = images.length
            ? images.map((img, i) => `<div class="quickview__slide${i === 0 ? ' is-active' : ''}" aria-hidden="${i === 0 ? 'false' : 'true'}"><img src="${escapeHTML(sized(img.src, 900))}" alt="${escapeHTML(img.alt || product.title)}" ${i === 0 ? '' : 'loading="lazy"'}></div>`).join('')
            : '<div class="quickview__slide is-active"></div>';
        main.insertAdjacentHTML('afterbegin', slidesHTML);

        const multiple = images.length > 1;
        prevBtn.hidden = !multiple;
        nextBtn.hidden = !multiple;
        counter.hidden = !multiple;
        thumbsEl.hidden = !multiple;
        modalEl.querySelector('[data-quickview-gallery]').classList.toggle('has-thumbs', multiple);

        if (multiple) {
            thumbsEl.innerHTML = images.map((img, i) => `
                <button type="button" class="quickview__thumb" role="listitem" data-index="${i}" aria-label="Show image ${i + 1} of ${images.length}"${i === 0 ? ' aria-current="true"' : ''}>
                    <img src="${escapeHTML(sized(img.src, 160))}" alt="" loading="lazy">
                </button>`).join('');
        }
        current = 0;
        counter.textContent = '1 / ' + images.length;
    }

    thumbsEl.addEventListener('click', (e) => {
        const thumb = e.target.closest('.quickview__thumb');
        if (thumb) showImage(parseInt(thumb.dataset.index, 10));
    });
    prevBtn.addEventListener('click', () => showImage(current - 1));
    nextBtn.addEventListener('click', () => showImage(current + 1));
    modalEl.querySelector('[data-quickview-gallery]').addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); showImage(current + 1); }
    });

    let touchX = null;
    main.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) showImage(current + (dx < 0 ? 1 : -1));
        touchX = null;
    });

    // ----- variants -----
    const hasRealOptions = () => !(product.variants.length === 1 && product.options.length === 1 && product.options[0].values[0] === 'Default Title');

    function selectedOptions() {
        return Array.from(optionsEl.querySelectorAll('.pdp-option')).map((group) => {
            const checked = group.querySelector('input:checked');
            return checked ? checked.value : null;
        });
    }

    function findVariant(options) {
        return product.variants.find((v) => v.options.every((value, i) => options[i] == null || value === options[i]));
    }

    function currentVariant() {
        return hasRealOptions() ? findVariant(selectedOptions()) : product.variants[0];
    }

    function markAvailability() {
        const selected = selectedOptions();
        optionsEl.querySelectorAll('.pdp-option').forEach((group, index) => {
            group.querySelectorAll('input').forEach((input) => {
                const options = selected.slice();
                options[index] = input.value;
                const match = findVariant(options);
                input.nextElementSibling.classList.toggle('is-unavailable', !match || !match.available);
            });
        });
    }

    function renderOptions(initial) {
        if (!hasRealOptions()) {
            optionsEl.innerHTML = '';
            optionsEl.hidden = true;
            return;
        }
        optionsEl.hidden = false;
        optionsEl.innerHTML = product.options.map((option, oi) => `
            <fieldset class="pdp-option">
                <legend class="pdp-option__label">${escapeHTML(option.name)}</legend>
                <div class="pdp-option__values">
                    ${option.values.map((value, vi) => {
                        const id = `qv-option-${oi}-${vi}`;
                        return `<input class="pdp-option__input visually-hidden" type="radio" id="${id}" name="qv-option-${oi}" value="${escapeHTML(value)}"${initial.options[oi] === value ? ' checked' : ''}>
                                <label class="pdp-pill" for="${id}">${escapeHTML(value)}</label>`;
                    }).join('')}
                </div>
            </fieldset>`).join('');
    }

    function updateVariant(fromUser) {
        const variant = currentVariant();
        markAvailability();
        statusEl.textContent = '';

        if (!variant) {
            addBtn.disabled = true;
            addBtn.textContent = 'Unavailable';
            return;
        }

        idInput.value = variant.id;
        priceEl.textContent = money(variant.price);
        const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
        priceEl.classList.toggle('is-sale', !!onSale);
        compareEl.textContent = onSale ? money(variant.compare_at_price) : '';
        compareEl.hidden = !onSale;
        badgeEl.hidden = !onSale;

        addBtn.disabled = !variant.available;
        addBtn.textContent = variant.available ? 'Add to cart' : 'Sold out';

        if (heart) heart.setAttribute('data-variant-id', variant.id);
        linkEl.href = product.url + (hasRealOptions() ? '?variant=' + variant.id : '');

        // Jump to the variant's own photo when it has one
        if (fromUser && variant.featured_image) {
            const target = baseSrc(variant.featured_image.src);
            const index = images.findIndex((img) => baseSrc(img.src) === target);
            if (index > -1) showImage(index);
        }
    }

    optionsEl.addEventListener('change', () => updateVariant(true));

    // ----- quantity -----
    modalEl.querySelectorAll('[data-quickview-qty]').forEach((button) => {
        button.addEventListener('click', () => {
            const next = (parseInt(qtyInput.value, 10) || 1) + parseInt(button.dataset.quickviewQty, 10);
            qtyInput.value = Math.max(1, next);
        });
    });

    // ----- wishlist (Swym listens on the heart itself) -----
    if (wishlistBtn && heart) {
        wishlistBtn.addEventListener('click', (e) => {
            if (!heart.contains(e.target)) heart.click();
        });
        wishlistBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); heart.click(); }
        });
        new MutationObserver(() => {
            const liked = heart.classList.contains('liked');
            wishlistBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
            wishlistBtn.setAttribute('aria-label', liked ? 'Remove from wishlist' : 'Add to wishlist');
        }).observe(heart, { attributes: true, attributeFilter: ['class'] });
    }

    // ----- add to cart -----
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const label = addBtn.textContent;
        addBtn.disabled = true;
        addBtn.textContent = 'Adding…';

        fetch(root + 'cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ items: [{ id: idInput.value, quantity: Math.max(1, parseInt(qtyInput.value, 10) || 1) }] })
        })
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) throw new Error(data.description || data.message || 'Could not add to cart.');
                statusEl.textContent = 'Added to cart';
                addBtn.textContent = 'Added ✓';
                if (typeof update_cart === 'function') update_cart();
                setTimeout(() => { addBtn.disabled = false; addBtn.textContent = label; }, 1500);
            })
            .catch((err) => {
                statusEl.textContent = err.message;
                addBtn.disabled = false;
                addBtn.textContent = label;
            });
    });

    // ----- open -----
    function populate(data) {
        product = data;
        images = (data.media || []).filter((m) => m.media_type === 'image').map((m) => ({ src: m.src, alt: m.alt }));
        if (!images.length) images = (data.images || []).map((src) => ({ src: src, alt: '' }));

        titleEl.textContent = data.title;
        const text = (new DOMParser().parseFromString(data.description || '', 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim();
        descEl.textContent = text;
        descEl.hidden = !text;

        qtyInput.value = 1;
        statusEl.textContent = '';
        if (heart) {
            heart.classList.remove('liked');
            heart.setAttribute('data-product-id', data.id);
            heart.setAttribute('data-product-url', window.location.origin + data.url);
        }

        renderGallery();
        const initial = data.variants.find((v) => v.available) || data.variants[0];
        renderOptions(initial);
        updateVariant(false);
        if (initial.featured_image) {
            const index = images.findIndex((img) => baseSrc(img.src) === baseSrc(initial.featured_image.src));
            if (index > 0) showImage(index);
        }
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-quickview-handle]');
        if (!trigger) return;
        e.preventDefault();
        const handle = trigger.dataset.quickviewHandle;

        const open = (data) => { populate(data); modal.show(); };
        if (cache[handle]) return open(cache[handle]);

        fetch(root + 'products/' + encodeURIComponent(handle) + '.js')
            .then((res) => res.json())
            .then((data) => { cache[handle] = data; open(data); })
            .catch(() => { window.location.href = trigger.href; });
    });
})();

// product cards: add single-variant products to the cart without leaving the page
document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-card-add-form]');
    if (!form) return;
    e.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding…';

    const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    fetch(root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items: [{ id: form.querySelector('[name="id"]').value, quantity: 1 }] })
    })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            if (!ok) throw new Error(data.description || 'Unavailable');
            button.textContent = 'Added ✓';
            if (typeof update_cart === 'function') update_cart();
        })
        .catch(() => { button.textContent = 'Unavailable'; })
        .finally(() => {
            setTimeout(() => { button.disabled = false; button.textContent = label; }, 1600);
        });
});

// wishlist buttons that wrap the Swym heart: pass clicks/keys on the larger button through to the heart
document.addEventListener('click', (e) => {
    const proxy = e.target.closest('[data-wishlist-proxy]');
    if (!proxy) return;
    const heart = proxy.querySelector('.swym-button');
    if (heart && !heart.contains(e.target)) heart.click();
});
document.addEventListener('keydown', (e) => {
    const proxy = e.target.closest && e.target.closest('[data-wishlist-proxy]');
    if (!proxy || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    const heart = proxy.querySelector('.swym-button');
    if (heart) heart.click();
});

//update cart

document.addEventListener('DOMContentLoaded', function () {
    update_cart();
})

function update_cart() {
    fetch('/cart.js').then((res) => res.json()).then((data) => {
        const cartCount = document.getElementById('numberOfCartItems');
        if (cartCount) {
            cartCount.textContent = data.item_count;
            cartCount.hidden = data.item_count === 0;
        }
    }).catch((err) => console.err(err));
}

//predictive search: results drop down from the search bar

(function () {
    const container = document.querySelector('[data-predictive-search]');
    const input = document.getElementById('searchInputField');
    const panel = document.getElementById('predictiveSearchResults');
    if (!container || !input || !panel) return;

    const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    const currency = window.Shopify && window.Shopify.currency && window.Shopify.currency.active;
    const cache = {};
    let timer;
    let controller;
    let activeIndex = -1;

    const escapeHTML = (value) => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const formatPrice = (amount) => {
        const number = parseFloat(amount);
        if (isNaN(number)) return '';
        try {
            if (currency) {
                return new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency: currency }).format(number);
            }
        } catch (e) { /* fall through */ }
        return number.toFixed(2);
    };

    const searchUrl = (query) => root + 'search?type=product&q=' + encodeURIComponent(query);

    const options = () => Array.from(panel.querySelectorAll('[role="option"]'));

    function open() {
        panel.hidden = false;
        container.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
    }

    function close() {
        panel.hidden = true;
        container.classList.remove('is-open');
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        activeIndex = -1;
    }

    function setActive(index) {
        const items = options();
        if (!items.length) return;
        activeIndex = (index + items.length) % items.length;
        items.forEach((item, i) => item.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'));
        input.setAttribute('aria-activedescendant', items[activeIndex].id);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function render(query, products) {
        const safeQuery = escapeHTML(query);
        let html;

        if (!products.length) {
            html = `<p class="search-results__empty">No products found for &ldquo;${safeQuery}&rdquo;</p>`;
        } else {
            html = '<ul class="search-results__list" role="listbox" aria-label="Product suggestions">' + products.map((product, i) => {
                const image = product.featured_image && product.featured_image.url ? product.featured_image.url : product.image;
                const sized = image ? image + (image.includes('?') ? '&' : '?') + 'width=120' : '';
                const compare = parseFloat(product.compare_at_price_max) > parseFloat(product.price);
                return `
                    <li role="option" id="search-option-${i}" aria-selected="false">
                        <a class="search-result" href="${escapeHTML(product.url)}" tabindex="-1">
                            <span class="search-result__image">${sized ? `<img src="${escapeHTML(sized)}" alt="" loading="lazy" width="48" height="48">` : ''}</span>
                            <span class="search-result__text">
                                <span class="search-result__title">${escapeHTML(product.title)}</span>
                                <span class="search-result__price">
                                    ${compare ? `<s>${formatPrice(product.compare_at_price_max)}</s>` : ''}
                                    ${formatPrice(product.price)}
                                </span>
                            </span>
                        </a>
                    </li>`;
            }).join('') + '</ul>';
        }

        html += `<a class="search-results__all" href="${searchUrl(query)}">View all results for &ldquo;${safeQuery}&rdquo; <span aria-hidden="true">&rarr;</span></a>`;
        panel.innerHTML = html;
        activeIndex = -1;
        open();
    }

    function search(query) {
        if (cache[query]) {
            render(query, cache[query]);
            return;
        }

        if (controller) controller.abort();
        controller = new AbortController();

        panel.innerHTML = '<p class="search-results__status">Searching&hellip;</p>';
        open();

        const url = root + 'search/suggest.json?q=' + encodeURIComponent(query) +
            '&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last';

        fetch(url, { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => {
                const products = (data.resources && data.resources.results && data.resources.results.products) || [];
                cache[query] = products;
                if (input.value.trim() === query) render(query, products);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    panel.innerHTML = '<p class="search-results__status">Search is unavailable right now.</p>';
                }
            });
    }

    input.addEventListener('input', () => {
        clearTimeout(timer);
        const query = input.value.trim();
        if (query.length < 2) {
            if (controller) controller.abort();
            close();
            return;
        }
        timer = setTimeout(() => search(query), 250);
    });

    input.addEventListener('focus', () => {
        const query = input.value.trim();
        if (query.length >= 2 && cache[query]) render(query, cache[query]);
    });

    input.addEventListener('keydown', (e) => {
        if (panel.hidden) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(activeIndex + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(activeIndex - 1);
        } else if (e.key === 'Enter' && activeIndex > -1) {
            e.preventDefault();
            const link = options()[activeIndex].querySelector('a');
            if (link) window.location.href = link.href;
        } else if (e.key === 'Escape') {
            close();
        }
    });

    // Close when clicking or tabbing away from the search area
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) close();
    });
    container.addEventListener('focusout', (e) => {
        if (!container.contains(e.relatedTarget)) close();
    });
})();

//product recommendation

// let productRecommendationBody = document.getElementById("product_recommendation_body");

// fetch("/recommendations/products.json?product_id={{ product.id }}").then((res) => res.json()).then(({ products }) => {
//     console.log(products);

//     if (products.length > 0) {
//         products.forEach(function (product, index) {
//             let card;

//             card = "<div class=\"flex_container col-auto col-sm-12 col-md-3 g-3\">";
//             card += "<div class=\"card product_item\" style=\"width: 18rem;\">";
//             if (product.images.length > 0) {
//                 card += "<a class=\"dot text-decoration-none blog_link\" href=\"" + product.url + "\"><img class=\"card-img-top card-img-size\" src=\"" + product.images[0] + "\"></a>";
//             }
//             card += "<div class=\"card-body\">";
//             card += "<h3><a class=\"dot text-decoration-none blog_link\" href=\"" + product.url + "\">" + product.title + "</a>" + "</h3>";
//             card += "<p>" + `$${
//                 (product.price / 100).toFixed(2)
//                 }` + "</p>";
//             card += "</div></div>";

//             productRecommendationBody.innerHTML += card;
//         })
//     }
// });

//wishlist animation

const hearts = document.querySelectorAll('.heart__beat');

for (const heart of hearts) {
    heart.addEventListener("click", () => {
        if (heart.classList.contains("liked")) {
            heart.classList.remove("liked");
        } else {
            heart.classList.add("liked");
        }
    });

}

//update variant price on product page

const quantityNode = document.querySelectorAll('#Quantity');
const selectVariants = document.querySelectorAll('#productSelect');
const productPrice = document.getElementById("productPrice");
const productCompareAtPrice = document.getElementById("productCompareAtPrice");
const total = document.getElementById("totalPrice");

let quantity = 1;

selectVariants.forEach((item) => {
    item.addEventListener('change', (e) => {
        const url = '/products/' + item.getAttribute('data-product-handle') + '.js';

        fetch(url).then((res) => res.json()).then((data) => {

            for (let i = 0; i < data.variants.length; i++) {
                const variantIdNumber = parseInt(e.target.value);
                //match data variant id
                if (data.variants[i].id === variantIdNumber) {

                    //set compare at price
                    if (productCompareAtPrice) {
                        const compare_at_price = Number(data.variants[i].compare_at_price / 100).toFixed(2);
                        productCompareAtPrice.innerHTML = `$${compare_at_price}`;
                    }

                    //set product price
                    const price = Number(data.variants[i].price / 100).toFixed(2);
                    productPrice.innerHTML = `$${price}`;
                }
            }
        }
        ).catch((err) => {
            console.log(err);
        });
    })
});

