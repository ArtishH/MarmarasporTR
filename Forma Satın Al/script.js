document.addEventListener("DOMContentLoaded", () => {
    // Değişken Tanımlamaları
    const products = document.querySelectorAll(".jersey-container");
    const modal = document.getElementById("jersey-modal");
    const modalImage = document.getElementById("modal-jersey-image");
    const modalName = document.getElementById("modal-jersey-name");
    const modalPrice = document.getElementById("modal-jersey-price");
    const closeModal = document.querySelector(".close-modal");
    const sizeButtons = document.querySelectorAll(".size-btn");
    const sizeSelector = document.getElementById("size-selector");
    const quantityInput = document.getElementById("quantity-input");
    const selectedTotalPrice = document.getElementById("selected-total-price");
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const cartIcon = document.querySelector(".cart-icon");
    const cartSection = document.getElementById("cart-section");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const totalPriceElement = document.getElementById("total-price");
    const closeCart = document.querySelector(".close-cart");
    const checkoutBtn = document.getElementById("checkout-btn");
    const checkoutModal = document.getElementById("checkout-modal");
    const closeCheckout = document.querySelector(".close-checkout");
    const checkoutForm = document.getElementById("checkout-form");
    const loadingModal = document.getElementById("loading-modal");
    const successModal = document.getElementById("success-modal");
    const closeSuccessBtn = document.querySelector(".close-success-btn");

    let selectedProduct = null;
    let selectedSize = null;
    let cart = [];

    // Ürün kartına tıklandığında modalı aç
    products.forEach(product => {
        product.addEventListener("click", () => {
            selectedProduct = {
                id: product.getAttribute("data-id"),
                type: product.getAttribute("data-type"),
                image: product.querySelector(".jersey-image").src,
                name: product.querySelector(".jersey-name").textContent,
                price: product.querySelector(".current-price").textContent
            };
            modalImage.src = selectedProduct.image;
            modalName.textContent = selectedProduct.name;
            modalPrice.textContent = selectedProduct.price;
            quantityInput.value = 1;

            // Beden seçiciyi göster/gizle
            if (selectedProduct.type === "jersey") {
                sizeSelector.style.display = "block";
                selectedSize = null;
                sizeButtons.forEach(btn => btn.classList.remove("selected"));
            } else {
                sizeSelector.style.display = "none";
                selectedSize = null;
            }

            updateSelectedPrice();
            modal.style.display = "block";
        });
    });

    // Modal kapatma
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        selectedSize = null;
        sizeButtons.forEach(btn => btn.classList.remove("selected"));
        quantityInput.value = 1;
        updateSelectedPrice();
    });

    // Beden seçimi
    sizeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            sizeButtons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedSize = btn.getAttribute("data-size");
            updateSelectedPrice();
        });
    });

    // Adet değiştiğinde fiyatı güncelle
    quantityInput.addEventListener("input", () => {
        updateSelectedPrice();
    });

    // Toplam fiyatı güncelle
    function updateSelectedPrice() {
        if (!selectedProduct) return;
        const quantity = parseInt(quantityInput.value) || 1;
        const price = parseFloat(selectedProduct.price.replace(" ₺", "").replace(".", "").replace(",", "."));
        const total = price * quantity;
        selectedTotalPrice.textContent = total.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
    }

    // Sepetin toplam fiyatını hesapla
    function calculateTotalPrice() {
        let total = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(" ₺", "").replace(".", "").replace(",", "."));
            total += price * item.quantity;
        });
        return total.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
    }

    // Sepet içeriğini güncelle
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = "";
        let totalItems = 0;
        cart.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            const itemPrice = parseFloat(item.price.replace(" ₺", "").replace(".", "").replace(",", "."));
            const totalItemPrice = (itemPrice * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <span>${item.name}${item.size ? ` (${item.size})` : ""}</span>
                    <span class="quantity">${item.quantity > 1 ? `x${item.quantity}` : ""}</span>
                    <span class="price">${totalItemPrice}</span>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            totalItems += item.quantity;
        });
        cartCount.textContent = totalItems;
        totalPriceElement.textContent = calculateTotalPrice();
    }

    // Sepete ekle
    addToCartBtn.addEventListener("click", () => {
        if (selectedProduct.type === "jersey" && !selectedSize) {
            alert("Lütfen bir beden seçin!");
            return;
        }

        const quantity = parseInt(quantityInput.value);
        if (quantity < 1) {
            alert("Lütfen en az 1 adet seçin!");
            return;
        }

        const cartItemKey = selectedProduct.type === "jersey" ? `${selectedProduct.id}-${selectedSize}` : selectedProduct.id;
        const existingItem = cart.find(item => item.key === cartItemKey);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...selectedProduct,
                key: cartItemKey,
                size: selectedProduct.type === "jersey" ? selectedSize : null,
                quantity: quantity
            });
        }

        updateCartDisplay();
        modal.style.display = "none";
        selectedSize = null;
        sizeButtons.forEach(btn => btn.classList.remove("selected"));
        quantityInput.value = 1;
        updateSelectedPrice();
    });

    // Sepeti aç
    cartIcon.addEventListener("click", () => {
        updateCartDisplay();
        cartSection.style.display = "block";
    });

    // Sepeti kapat
    closeCart.addEventListener("click", () => {
        cartSection.style.display = "none";
    });

    // Ödeme modalını aç
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Sepetiniz boş!");
            return;
        }
        cartSection.style.display = "none";
        checkoutModal.style.display = "block";
    });

    // Ödeme modalını kapat
    closeCheckout.addEventListener("click", () => {
        checkoutModal.style.display = "none";
    });

    // Ödeme formu gönderimi
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const address = document.getElementById("address").value.trim();
        const cardNumber = document.getElementById("card-number").value.trim();
        const expiryDate = document.getElementById("expiry-date").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        // Alanların boş olup olmadığını kontrol et
        if (!address || !cardNumber || !expiryDate || !cvv) {
            alert("Lütfen tüm alanları doldurun!");
            return;
        }

        // Ödeme modalını kapat, yükleme modalını göster
        checkoutModal.style.display = "none";
        loadingModal.style.display = "block";

        // 2 saniye sonra yükleme ekranını kapatıp onay ekranını göster
        setTimeout(() => {
            loadingModal.style.display = "none";
            successModal.style.display = "block";
            cart = [];
            updateCartDisplay();
            checkoutForm.reset();
        }, 2000);
    });

    // Onay modalını kapat
    closeSuccessBtn.addEventListener("click", () => {
        successModal.style.display = "none";
    });
});