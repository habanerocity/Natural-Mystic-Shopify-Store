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

// sort products 
if (document.getElementById('sort_by') != null) {
    document.querySelector('#sort_by').addEventListener('change', (e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', e.currentTarget.value);

        window.location = url.href;
    });
}

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

//product modal

let productModal;

if (document.getElementById('productInfoModal') != null) {
    productModal = new bootstrap.Modal(document.getElementById('productInfoModal'), {});
};

const productInfoAnchors = document.querySelectorAll("#productInfoAnchor");
const productPricing = document.getElementById("productInfoPrice");

if (productInfoAnchors.length > 0) {
    productInfoAnchors.forEach(item => {
        item.addEventListener('click', e => {

            const url = '/products/' + item.getAttribute('data-product-handle') + '.js';

            fetch(url).then((res) => res.json()).then((data) => {
                const compareDiv = document.getElementById("compareDiv");
                const modalNow = document.getElementById("modalNow");
                const addToCartBtn = document.getElementById("AddToCart");

                document.getElementById("productInfoImg").src = data.images[0];
                document.getElementById("productInfoTitle").innerHTML = data.title;
                document.getElementById("productInfoComparePrice").innerHTML = item.getAttribute('data-product-compare-at-price');
                document.getElementById("productInfoDescription").innerHTML = data.description;

                productPricing.innerHTML = item.getAttribute('data-product-price');

                const variants = data.variants;
                let variantSelect = document.getElementById("modalItemID");

                variantSelect.innerHTML = '';

                variants.forEach(function (variant, index) {
                    variantSelect.options[variantSelect.options.length] = new Option(variant.option1, variant.id);
                })

                //Render Compare at Price for Modal
                if (data.compare_at_price != null) {
                    compareDiv.classList.remove("d-none");
                    modalNow.classList.remove("d-none");

                    //add red font if compare_at_price exists
                    productPricing.classList.add('text-danger');
                }

                //RemoveCompare at Price for Modal
                if (data.compare_at_price === null) {
                    compareDiv.classList.add("d-none");
                    modalNow.classList.add("d-none");

                    //remove red font if there is no compare_at_price
                    if (productPricing.classList.contains('text-danger')) {
                        productPricing.classList.remove('text-danger');
                    }
                }

                //disable add to cart button if product is not available
                if (data.available === false) {
                    addToCartBtn.disabled = true;
                    addToCartBtn.innerHTML = 'Out of Stock';
                }

                if (data.available === true) {
                    addToCartBtn.disabled = false;
                    addToCartBtn.innerHTML = 'Add to Cart';
                }

                productModal.show();

            })
        })
    })
}

//modal add to cart functionality

const modalAddToCartForm = document.querySelector('#addToCartForm');

let modalItemID = document.querySelectorAll('#modalItemID');
let handle;

//add click event listener to access product handle
productInfoAnchors.forEach((item) => {
    item.addEventListener('click', (e) => {
        handle = item.getAttribute('data-product-handle');
    })
})

if (modalAddToCartForm != null) {

    //update modal variant price
    modalItemID.forEach((item) => {
        item.addEventListener('change', (e) => {

            const url = '/products/' + handle + '.js';

            fetch(url).then((res) => res.json()).then((data) => {

                for (let i = 0; i < data.variants.length; i++) {

                    const variantIdNumber = parseInt(e.target.value);
                    //match data variant id
                    if (data.variants[i].id === variantIdNumber) {
                        const price = (data.variants[i].price / 100).toFixed(2);
                        const priceComparison = (data.variants[i].compare_at_price / 100).toFixed(2);

                        productInfoComparePrice.innerHTML = `$${priceComparison}`;
                        productPricing.innerHTML = `$${price}`;
                    }
                }
            }
            ).catch((err) => {
                console.log(err);
            });
        })
    })

    //add to cart modal
    modalAddToCartForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let formData = {
            "items": [
                {
                    'id': document.getElementById("modalItemID").value,
                    'quantity': document.getElementById("modalItemQuantity").value
                }
            ]
        };

        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(formData)
        }).then((res) => {
            return res.json();
        }).then(() => {
            return update_cart();
        }).catch((err) => {
            console.error('Error: ' + err);
        })
    })
}

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

