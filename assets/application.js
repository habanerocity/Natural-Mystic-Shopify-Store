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
gsap.from(".product_card", {
    scrollTrigger: ".product_card",
    opacity: 0,
    y: 100,
    stagger: 0.4
})

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
        document.getElementById('numberOfCartItems').innerHTML = data.item_count;
    }).catch((err) => console.err(err));
}

//initialize predictive search

let predictiveSearchInput = document.getElementById('searchInputField');
let timer;

const offcanvasSearch = document.getElementById('offCanvasSearchResult');
const bsOffcanvas = new bootstrap.Offcanvas(offcanvasSearch);
if (predictiveSearchInput != null) {
    predictiveSearchInput.addEventListener('input', function (e) {

        clearTimeout(timer);

        if (predictiveSearchInput.value) {
            timer = setTimeout(fetchPredictiveSearch, 3000);
        }

    })
}

function fetchPredictiveSearch() {
    fetch(`/search/suggest.json?q=${predictiveSearchInput.value}&resources[type]=product`)
        .then((res) => res.json())
        .then((data) => {

            let products = data.resources.results.products;

            document.getElementById('search_results_body').innerHTML = '';

            products.forEach(function (product, index) {
                document.getElementById('search_results_body').innerHTML += `
                    <div class="card my-5" style="width: 19rem;">
                    <a class="text-decoration-none" href="https://natural-mystic-foods.myshopify.com${product.url}"><img src="${product.image}" class="card-img-top"></a>
                        <div class="card-body ">
                            <a class="text-decoration-none" href="https://natural-mystic-foods.myshopify.com${product.url}"><h5 class="card-title dot">${product.title}</h5></a>
                            <p class="card-text">$${product.price}</p>
                        </div>
                    </div>
                `
            })

            bsOffcanvas.show();
        });

}

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

