// Put your application javascript here
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

let productModal;

if (document.getElementById('productInfoModal') != null) {
    productModal = new bootstrap.Modal(document.getElementById('productInfoModal'), {});
};

if (productInfoAnchors.length > 0) {
    productInfoAnchors.forEach(item => {
        item.addEventListener('click', e => {
            const url = '/products/' + item.getAttribute('product-handle') + '.js';

            fetch(url).then((res) => res.json()).then((data) => {
                document.getElementById("productInfoImg").src = data.images[0];
                document.getElementById("productInfoTitle").innerHTML = data.title;
                document.getElementById("productInfoPrice").innerHTML = item.getAttribute('product-price');
                document.getElementById("productInfoDescription").innerHTML = data.description;

                const variants = data.variants;
                let variantSelect = document.getElementById("modalItemID");

                variantSelect.innerHTML = '';

                variants.forEach(function (variant, index) {
                    console.log(variant);

                    variantSelect.options[variantSelect.options.length] = new Option(variant.option1, variant.id);
                })
                productModal.show();
            })
        })
    })
}

const modalAddToCartForm = document.querySelector('#addToCartForm');

if (modalAddToCartForm != null) {
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
        }).then(() => update_cart()).catch((err) => {
            console.error('Error: ' + err);
        })
    })
}

document.addEventListener('DOMContentLoaded', function () {
    update_cart();
})

function update_cart() {
    fetch('/cart.js').then((res) => res.json()).then((data) => {
        document.getElementById('numberOfCartItems').innerHTML = data.item_count;
    }).catch((err) => console.err(err));
}

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
                    <div class="card" style="width: 19rem;">
                        <img src="${product.image}" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">$${product.price}</p>
                        </div>
                    </div>
                `
            })

            bsOffcanvas.show();
        });

}

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
