// sort products 
if (document.getElementById('sort_by') != null) {
    document.querySelector('#sort_by').addEventListener('change', (e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', e.currentTarget.value);

        window.location = url.href;
    });
}

if (document.getElementById('AddressCountryNew') != null) {
    document.getElementById('AddressCountryNew').addEventListener('change', function (e) {
        const provinces = this.options[this.selectedIndex].getAttribute('data-provinces');
        const provinceSelector = document.getElementById('AddressProvinceNew');
        const provinceArray = JSON.parse(provinces);

        if (provinceArray.length < 1) {
            provinceSelector.setAttribute('disabled', 'disabled');
        } else {
            provinceSelector.removeAttribute('disabled');
        }

        provinceSelector.innerHTML = '';
        let options = '';

        for (let i = 0; i < provinceArray.length; i++) {
            options += '<option value="' + provinceArray[i][0] + '>' + provinceArray[i][0] + '</option>'
        }

        provinceSelector.innerHTML = options;
    });
}

if (document.getElementById('forgotPassword') != null) {
    document.getElementById("forgotPassword").addEventListener("click", function (e) {
        const element = document.querySelector("#forgot_password_form");
        if (element.classList.contains('d-none')) {
            element.classList.remove("d-none");
            element.classList.add('d-block');
        }
    })
}

const productInfoAnchors = document.querySelectorAll("#productInfoAnchor");

//item added to cart modal

// let addedToCartModal;

// if (document.getElementById('addedToCartModal') != null) {
//     itemAddedModal = new bootstrap.Modal(document.getElementById('addedToCartModal'), {});
// };

//product modal

let productModal;

if (document.getElementById('productInfoModal') != null) {
    productModal = new bootstrap.Modal(document.getElementById('productInfoModal'), {});
};

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
                document.getElementById("productInfoPrice").innerHTML = item.getAttribute('data-product-price');
                document.getElementById("productInfoDescription").innerHTML = data.description;

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
                    document.getElementById("productInfoPrice").classList.add('text-danger');
                }

                //RemoveCompare at Price for Modal
                if (data.compare_at_price === null) {
                    compareDiv.classList.add("d-none");
                    modalNow.classList.add("d-none");

                    //remove red font if there is no compare_at_price
                    if (document.getElementById("productInfoPrice").classList.contains('text-danger')) {
                        document.getElementById("productInfoPrice").classList.remove('text-danger');
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
// const prevPriceComparisonDiv = document.querySelectorAll('.prevPriceComparison');
let modalItemID = document.querySelectorAll('#modalItemID');
let handle;

//add click event listener to access product handle
productInfoAnchors.forEach((item) => {
    item.addEventListener('click', (e) => {
        handle = item.getAttribute('data-product-handle');
    })
})

if (modalAddToCartForm != null) {
    let productInfoPrice = document.querySelector('#productInfoPrice');

    //update modal variant price
    modalItemID.forEach((item) => {
        item.addEventListener('change', (e) => {

            const url = '/products/' + handle + '.js';

            fetch(url).then((res) => res.json()).then((data) => {
                console.log(data);
                for (let i = 0; i < data.variants.length; i++) {

                    const variantIdNumber = parseInt(e.target.value);
                    //match data variant id
                    if (data.variants[i].id === variantIdNumber) {
                        const price = (data.variants[i].price / 100).toFixed(2);
                        const priceComparison = (data.variants[i].compare_at_price / 100).toFixed(2);

                        productInfoComparePrice.innerHTML = `$${priceComparison}`;
                        productInfoPrice.innerHTML = `$${price}`;
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
            console.log(data);

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

// quantityNode.forEach((item) => {
//     item.addEventListener('change', (e) => {
//         quantity = parseInt(e.target.value);
//         let sliced = productPrice.innerHTML.slice(1);

//         console.log(quantity);
//         console.log(sliced);

//         total.innerHTML = `Total price before tax and shipping is: <br> $${Number((sliced) * quantity).toFixed(2)}`;
//     })
// })

selectVariants.forEach((item) => {
    item.addEventListener('change', (e) => {
        const url = '/products/' + item.getAttribute('data-product-handle') + '.js';

        fetch(url).then((res) => res.json()).then((data) => {
            console.log(data);
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

                    //set total price before shipping and tax
                    // total.innerHTML = `Total price before tax and shipping: <br> $${(Number(price) * quantity).toFixed(2)}`;
                }
            }
        }
        ).catch((err) => {
            console.log(err);
        });
    })
});

