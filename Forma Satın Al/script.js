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
    const successMessage = document.getElementById("success-message");
    const closeSuccessBtn = document.querySelector(".close-success-btn");
    const favoritesIcon = document.querySelector(".favorites-icon");
    const favoritesSection = document.getElementById("favorites-section");
    const favoritesItemsContainer = document.getElementById("favorites-items");
    const favoritesCount = document.getElementById("favorites-count");
    const closeFavorites = document.querySelector(".close-favorites");
    const favoriteButtons = document.querySelectorAll(".favorite-btn");
    const orderStatusPanel = document.getElementById("order-status-panel");
    const orderStatusText = document.getElementById("order-status-text");
    const progressBar = document.getElementById("progress-bar");
    const completeBtn = document.getElementById("complete-btn");
    const notification = document.getElementById("notification");
    const registerBtn = document.getElementById("register-btn");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const userGreeting = document.getElementById("user-greeting");
    const registerModal = document.getElementById("register-modal");
    const loginModal = document.getElementById("login-modal");
    const closeRegister = document.querySelector(".close-register");
    const closeLogin = document.querySelector(".close-login");
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    let selectedProduct = null;
    let selectedSize = null;
    let cart = [];
    let favorites = [];
    let currentUser = null;
    let orderStatusInterval = null;

    // Sipariş durumu mesajları
    const orderStatuses = [
        "Siparişiniz kargoya veriliyor...",
        "Siparişiniz kargoya verildi.",
        "Kargonuz yolda.",
        "Kargonuz evinize ulaşmıştır Marmaraspor ailesi."
    ];

    // Bildirim göster
    function showNotification(message, openLogin = false) {
        if (!notification) {
            console.error("Notification elementi bulunamadı!");
            return;
        }
        notification.textContent = message;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
            if (openLogin && loginModal) {
                loginModal.style.display = "block";
            }
        }, 2000);
    }

    // Kullanıcı durumunu kontrol et ve UI'yı güncelle
    function updateUserUI() {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
            loginBtn.style.display = "none";
            registerBtn.style.display = "none";
            logoutBtn.style.display = "block";
            userGreeting.style.display = "inline";
            userGreeting.textContent = `Merhaba, ${currentUser.username}`;
        } else {
            loginBtn.style.display = "block";
            registerBtn.style.display = "block";
            logoutBtn.style.display = "none";
            userGreeting.style.display = "none";
        }
    }

    // Ürün kartına tıklandığında modalı aç
    products.forEach(product => {
        product.addEventListener("click", (e) => {
            if (e.target.classList.contains("favorite-btn")) return;
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
            console.log("Ürün modalı açıldı:", selectedProduct);
        });
    });

    // Modal kapatma
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        selectedSize = null;
        sizeButtons.forEach(btn => btn.classList.remove("selected"));
        quantityInput.value = 1;
        updateSelectedPrice();
        console.log("Modal kapatıldı");
    });

    // Beden seçimi
    sizeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            sizeButtons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedSize = btn.getAttribute("data-size");
            updateSelectedPrice();
            console.log("Beden seçildi:", selectedSize);
        });
    });

    // Adet değiştiğinde fiyatı güncelle
    quantityInput.addEventListener("input", () => {
        updateSelectedPrice();
        console.log("Adet güncellendi:", quantityInput.value);
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
        cart.forEach((item, index) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            const itemPrice = parseFloat(item.price.replace(" ₺", "").replace(".", "").replace(",", "."));
            const totalItemPrice = (itemPrice * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <span>${item.name}${item.size ? ` (${item.size})` : ""}</span>
                    <span class="price">${totalItemPrice}</span>
                    <div class="quantity-control">
                        <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            totalItems += item.quantity;
        });
        cartCount.textContent = totalItems;
        totalPriceElement.textContent = calculateTotalPrice();

        // Artı ve eksi butonları için olay dinleyicileri
        document.querySelectorAll(".plus-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = parseInt(e.target.getAttribute("data-index"));
                cart[index].quantity += 1;
                updateCartDisplay();
                showNotification("Ürün adedi artırıldı");
                console.log("Ürün adedi artırıldı, index:", index);
            });
        });

        document.querySelectorAll(".minus-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = parseInt(e.target.getAttribute("data-index"));
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                    showNotification("Ürün sepetten kaldırıldı");
                } else {
                    showNotification("Ürün adedi azaltıldı");
                }
                updateCartDisplay();
                console.log("Ürün adedi azaltıldı veya kaldırıldı, index:", index);
            });
        });

        console.log("Sepet güncellendi:", cart);
    }

    // Favoriler içeriğini güncelle
    function updateFavoritesDisplay() {
        favoritesItemsContainer.innerHTML = "";
        favorites.forEach(item => {
            const favoriteItem = document.createElement("div");
            favoriteItem.classList.add("favorite-item");
            favoriteItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="favorite-item-details">
                    <span>${item.name}</span>
                    <span>${item.price}</span>
                </div>
            `;
            favoritesItemsContainer.appendChild(favoriteItem);
        });
        favoritesCount.textContent = favorites.length;
        favoriteButtons.forEach(btn => {
            const id = btn.getAttribute("data-id");
            if (favorites.find(item => item.id === id)) {
                btn.textContent = "♥";
                btn.classList.add("favorited");
            } else {
                btn.textContent = "♡";
                btn.classList.remove("favorited");
            }
        });
        console.log("Favoriler güncellendi:", favorites);
    }

    // Sepete ekle
    addToCartBtn.addEventListener("click", () => {
        if (!currentUser) {
            showNotification("Lütfen giriş yapın!", true);
            console.log("Giriş yapılmadı, sepete ekleme engellendi");
            return;
        }

        if (selectedProduct.type === "jersey" && !selectedSize) {
            showNotification("Lütfen bir beden seçin!");
            console.log("Beden seçilmedi");
            return;
        }

        const quantity = parseInt(quantityInput.value) || 1;
        if (quantity < 1) {
            showNotification("Lütfen en az 1 adet seçin!");
            console.log("Geçersiz adet:", quantity);
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
        showNotification("Ürün sepete eklendi");
        console.log("Ürün sepete eklendi:", selectedProduct);
    });

    // Favorilere ekle/kaldır
    favoriteButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            const product = Array.from(products).find(p => p.getAttribute("data-id") === id);
            const productData = {
                id: id,
                image: product.querySelector(".jersey-image").src,
                name: product.querySelector(".jersey-name").textContent,
                price: product.querySelector(".current-price").textContent
            };

            const index = favorites.findIndex(item => item.id === id);
            if (index === -1) {
                favorites.push(productData);
                showNotification("Ürün favoriye alındı");
            } else {
                favorites.splice(index, 1);
                showNotification("Ürün favorilerden çıkarıldı");
            }
            updateFavoritesDisplay();
            console.log("Favori durumu güncellendi:", id);
        });
    });

    // Sepeti aç
    cartIcon.addEventListener("click", () => {
        updateCartDisplay();
        cartSection.style.display = "block";
        console.log("Sepet açıldı");
    });

    // Sepeti kapat
    closeCart.addEventListener("click", () => {
        cartSection.style.display = "none";
        console.log("Sepet kapatıldı");
    });

    // Favorileri aç
    favoritesIcon.addEventListener("click", () => {
        updateFavoritesDisplay();
        favoritesSection.style.display = "block";
        console.log("Favoriler açıldı");
    });

    // Favorileri kapat
    closeFavorites.addEventListener("click", () => {
        favoritesSection.style.display = "none";
        console.log("Favoriler kapatıldı");
    });

    // Kayıt ol modalını aç
    registerBtn.addEventListener("click", () => {
        registerModal.style.display = "block";
        console.log("Kayıt ol modalı açıldı");
    });

    // Giriş yap modalını aç
    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "block";
        console.log("Giriş yap modalı açıldı");
    });

    // Kayıt ol modalını kapat
    closeRegister.addEventListener("click", () => {
        registerModal.style.display = "none";
        registerForm.reset();
        console.log("Kayıt ol modalı kapatıldı");
    });

    // Giriş yap modalını kapat
    closeLogin.addEventListener("click", () => {
        loginModal.style.display = "none";
        loginForm.reset();
        console.log("Giriş yap modalı kapatıldı");
    });

    // Kayıt olma işlemi
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("register-username").value.trim();
        const password = document.getElementById("register-password").value.trim();

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(user => user.username === username)) {
            showNotification("Bu kullanıcı adı zaten alınmış!");
            console.log("Kayıt başarısız: Kullanıcı adı alınmış");
            return;
        }

        users.push({ username, password });
        localStorage.setItem("users", JSON.stringify(users));
        showNotification("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        registerModal.style.display = "none";
        registerForm.reset();
        console.log("Kayıt işlemi başarılı:", username);
    });

    // Giriş yapma işlemi
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(user => user.username === username && user.password === password);

        if (!user) {
            showNotification("Kullanıcı adı veya şifre yanlıştır!");
            console.log("Giriş başarısız: Yanlış kullanıcı adı veya şifre");
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        updateUserUI();
        showNotification("Giriş başarılı!");
        loginModal.style.display = "none";
        loginForm.reset();
        console.log("Giriş başarılı:", username);
    });

    // Çıkış yap
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        updateUserUI();
        showNotification("Çıkış yapıldı.");
        console.log("Çıkış yapıldı");
    });

    // Ödeme modalını aç
    checkoutBtn.addEventListener("click", () => {
        if (!currentUser) {
            showNotification("Sipariş vermek için lütfen giriş yapın!", true);
            console.log("Giriş yapılmadı, ödeme engellendi");
            return;
        }
        if (cart.length === 0) {
            showNotification("Sepetiniz boş!");
            console.log("Sepet boş");
            return;
        }
        cartSection.style.display = "none";
        checkoutModal.style.display = "block";
        console.log("Ödeme modalı açıldı");
    });

    // Ödeme modalını kapat
    closeCheckout.addEventListener("click", () => {
        checkoutModal.style.display = "none";
        console.log("Ödeme modalı kapatıldı");
    });

    // Sipariş durumu güncelleme
    function startOrderStatusUpdates() {
        let statusIndex = 0;
        const progressSteps = [25, 50, 75, 100];
        orderStatusText.textContent = orderStatuses[statusIndex];
        progressBar.style.width = `${progressSteps[statusIndex]}%`;
        orderStatusPanel.style.display = "block";
        completeBtn.style.display = "none";

        orderStatusInterval = setInterval(() => {
            statusIndex++;
            if (statusIndex < orderStatuses.length) {
                orderStatusText.textContent = orderStatuses[statusIndex];
                progressBar.style.width = `${progressSteps[statusIndex]}%`;
            }
            if (statusIndex === orderStatuses.length - 1) {
                clearInterval(orderStatusInterval);
                completeBtn.style.display = "block";
            }
        }, 6000);
        console.log("Sipariş durumu güncelleme başladı");
    }

    // "Tamam" butonuna tıklayınca paneli kapat
    completeBtn.addEventListener("click", () => {
        orderStatusPanel.style.display = "none";
        if (orderStatusInterval) {
            clearInterval(orderStatusInterval);
        }
        console.log("Sipariş durumu paneli kapatıldı");
    });

    // Ödeme formu gönderimi
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const address = document.getElementById("address").value.trim();
        const cardNumber = document.getElementById("card-number").value.trim();
        const expiryDate = document.getElementById("expiry-date").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        if (!address || !cardNumber || !expiryDate || !cvv) {
            showNotification("Lütfen tüm alanları doldurun!");
            console.log("Ödeme formu eksik");
            return;
        }

        checkoutModal.style.display = "none";
        loadingModal.style.display = "block";

        setTimeout(() => {
            loadingModal.style.display = "none";
            successMessage.textContent = `Sevgili ${currentUser.username}, siparişiniz alındı!`;
            successModal.style.display = "block";
            cart = [];
            updateCartDisplay();
            checkoutForm.reset();
            startOrderStatusUpdates();
        }, 2000);
        console.log("Ödeme formu gönderildi");
    });

    // Onay modalını kapat
    closeSuccessBtn.addEventListener("click", () => {
        successModal.style.display = "none";
        console.log("Onay modalı kapatıldı");
    });

    // Sayfa yüklendiğinde favori durumlarını ve kullanıcı UI'yı güncelle
    updateFavoritesDisplay();
    updateUserUI();
    console.log("Sayfa yüklendi, tüm olay dinleyicileri bağlandı");
});
