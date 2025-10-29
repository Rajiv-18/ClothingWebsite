let currentUser = null;
let cart = [];
let currentProduct = null;
let currentSlide = 0;
let slideInterval;
let searchOpen = false;
let currentDetailImageIndex = 0;

// Updated product data with proper image handling
const products = [
    {
        id: 1,
        name: "Flower Pedal Crew Neck",
        price: 60,
        description: "Soft crew neck sweatshirt featuring delicate floral petal designs. Made from premium cotton blend for comfort and style.",
        images: ["crewneck.jpg", "crewneckback.jpg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "crewnecks",
        reviews: []
    },
    {
        id: 2,
        name: "Japan Views Hoodie",
        price: 85,
        description: "Oversized hoodie inspired by traditional Japanese landscapes. Features scenic mountain and temple artwork with premium comfort.",
        images: ["japanfront.jpg", "japanback.jpg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "hoodies",
        reviews: []
    },
    {
        id: 3,
        name: "Sun and Moon Hoodie",
        price: 90,
        description: "Celestial-themed hoodie with sun and moon imagery. Perfect blend of comfort and artistic design in premium materials.",
        images: ["sunfront.jpg", "sunback.jpg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "hoodies",
        reviews: []
    },
    {
        id: 4,
        name: "Van Gogh Starry Hoodie",
        price: 95,
        description: "Art-inspired hoodie featuring Van Gogh's iconic starry night aesthetic. High-quality print on comfortable heavyweight cotton.",
        images: ["vangohfront.jpg", "vangohback.jpg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "hoodies",
        reviews: []
    }
];

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    showPage('home');
    loadProducts();
    setupEventListeners();
    updateCartCount();
    updateAccountLink();
    initializeSlideshow();
    setupSearch();
});

function showPage(pageId) {
    console.log('Showing page:', pageId);
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = pageId === 'home' ? 'flex' : 'block';
        
        if (pageId === 'catalog') {
            loadProducts();
        } else if (pageId === 'cart') {
            loadCart();
        } else if (pageId === 'account') {
            updateAccountPage();
        }
        
        window.scrollTo(0, 0);
    }
}

function loadProducts() {
    console.log('Loading products...');
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('Products grid not found');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach((product, index) => {
        console.log('Creating product:', product.name, 'ID:', product.id);
        
        const productElement = document.createElement('div');
        productElement.className = 'product-item fade-in';
        productElement.style.animationDelay = `${index * 0.1}s`;
        productElement.style.cursor = 'pointer';
        
        // Create placeholder fallback for missing images
        const imageHTML = product.images.map((img, imgIndex) => 
            `<img src="${img}" alt="${product.name}" class="product-img ${imgIndex === 0 ? 'active' : ''}" data-index="${imgIndex}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+'">`
        ).join('');
        
        productElement.innerHTML = `
            <div class="product-image" data-product-id="${product.id}">
                <div class="product-image-container">
                    ${imageHTML}
                </div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price}.00</div>
                <button class="quick-add-btn" data-product-id="${product.id}">Quick Add</button>
            </div>
        `;
        
        productsGrid.appendChild(productElement);
        
        // CRITICAL FIX: Add proper click event listeners
        // Click handler for the entire product (except quick add button)
        productElement.addEventListener('click', function(e) {
            // Prevent if clicked on quick add button
            if (e.target.classList.contains('quick-add-btn')) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            console.log('Product clicked! ID:', product.id, 'Name:', product.name);
            viewProduct(product.id);
        });
        
        // Separate click handler for quick add button
        const quickAddBtn = productElement.querySelector('.quick-add-btn');
        quickAddBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Quick add clicked for product:', product.id);
            quickAddToCart(product.id);
        });
    });
    
    console.log('Products loaded successfully');
}

// CRITICAL FIX: Ensure viewProduct function works properly
function viewProduct(productId) {
    console.log('viewProduct called with ID:', productId);
    
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
        console.error('Product not found with ID:', productId);
        alert('Product not found!');
        return;
    }
    
    console.log('Found product:', product.name);
    currentProduct = product;
    currentDetailImageIndex = 0;
    
    // Update product detail elements
    const nameElement = document.getElementById('productDetailName');
    const priceElement = document.getElementById('productDetailPrice');
    const descElement = document.getElementById('productDetailDescription');
    
    if (nameElement) nameElement.textContent = product.name;
    if (priceElement) priceElement.textContent = `$${product.price}.00`;
    if (descElement) descElement.textContent = product.description;
    
    // Update product images
    const productDetailImage = document.getElementById('productDetailImage');
    if (productDetailImage && product.images && product.images.length > 0) {
        const imageHTML = product.images.map((img, imgIndex) => 
            `<img src="${img}" alt="${product.name}" class="product-img ${imgIndex === 0 ? 'active' : ''}" style="cursor: pointer;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+'">`
        ).join('');
        
        productDetailImage.innerHTML = imageHTML;
        
        // Add image indicators
        const indicatorsContainer = document.getElementById('imageIndicators');
        if (indicatorsContainer && product.images.length > 1) {
            const indicatorsHTML = product.images.map((_, index) => 
                `<div class="image-indicator ${index === 0 ? 'active' : ''}" onclick="switchDetailImage(${index})"></div>`
            ).join('');
            indicatorsContainer.innerHTML = indicatorsHTML;
            indicatorsContainer.style.display = 'flex';
        } else if (indicatorsContainer) {
            indicatorsContainer.style.display = 'none';
        }
    }
    
    // Update size selector
    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect) {
        sizeSelect.innerHTML = '';
        product.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            if (size === 'M' && product.sizes.includes('M')) {
                option.selected = true;
            }
            sizeSelect.appendChild(option);
        });
    }
    
    // Reset quantity
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.value = 1;
    }
    
    // Update reviews
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (reviewsContainer) {
        if (product.reviews && product.reviews.length > 0) {
            reviewsContainer.innerHTML = product.reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-name">${review.name}</span>
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                    </div>
                    <p class="review-comment">${review.comment}</p>
                </div>
            `).join('');
        } else {
            reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review this product!</p>';
        }
    }
    
    // Show the product detail page
    console.log('Switching to product detail page...');
    showPage('productDetail');
}

// Image switching functions for product detail page
function switchDetailImage(imageIndex) {
    if (!currentProduct || !currentProduct.images) return;
    
    currentDetailImageIndex = imageIndex;
    const images = document.querySelectorAll('#productDetailImage .product-img');
    const indicators = document.querySelectorAll('.image-indicator');
    
    images.forEach((img, index) => {
        img.classList.toggle('active', index === imageIndex);
    });
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === imageIndex);
    });
}

function nextDetailImage() {
    if (!currentProduct || !currentProduct.images || currentProduct.images.length <= 1) return;
    
    const nextIndex = (currentDetailImageIndex + 1) % currentProduct.images.length;
    switchDetailImage(nextIndex);
}

// Quick add to cart function
function quickAddToCart(productId) {
    console.log('Quick add to cart:', productId);
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
        console.error('Product not found for quick add:', productId);
        return;
    }
    
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        size: 'M',
        quantity: 1,
        image: product.images[0]
    };
    
    addItemToCart(cartItem);
    showToast(`${product.name} added to cart!`);
}

// Add to cart function from product detail page
function addToCart() {
    if (!currentProduct) {
        console.error('No current product selected');
        return;
    }
    
    const sizeSelect = document.getElementById('sizeSelect');
    const quantityInput = document.getElementById('quantityInput');
    
    const size = sizeSelect ? sizeSelect.value : 'M';
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        size: size,
        quantity: quantity,
        image: currentProduct.images[0]
    };
    
    addItemToCart(cartItem);
    showToast(`${currentProduct.name} added to cart!`);
}

function addItemToCart(newItem) {
    const existingItem = cart.find(item => 
        item.id === newItem.id && item.size === newItem.size
    );
    
    if (existingItem) {
        existingItem.quantity += newItem.quantity;
    } else {
        cart.push(newItem);
    }
    
    updateCartCount();
    console.log('Cart updated:', cart);
}

function removeFromCart(itemId, size) {
    cart = cart.filter(item => !(item.id === itemId && item.size === size));
    updateCartCount();
    loadCart();
    showToast('Item removed from cart');
}

function updateCartQuantity(itemId, size, newQuantity) {
    const item = cart.find(item => item.id === itemId && item.size === size);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemId, size);
        } else {
            item.quantity = newQuantity;
            updateCartCount();
            loadCart();
        }
    }
}

function loadCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.length === 0) {
        if (cartItems) cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    if (cartItems) {
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD4KPC9zdmc+'">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size}</p>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateCartQuantity(${item.id}, '${item.size}', ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, '${item.size}', parseInt(this.value))">
                    <button onclick="updateCartQuantity(${item.id}, '${item.size}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-price">$${itemTotal}.00</div>
                <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.size}')">Remove</button>
            `;
            
            cartItems.appendChild(cartItemElement);
        });
        
        const shipping = 10;
        const total = subtotal + shipping;
        
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartSubtotal) cartSubtotal.textContent = `$${subtotal}.00`;
        if (cartTotal) cartTotal.textContent = `$${total}.00`;
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    
    if (!currentUser) {
        showToast('Please login to checkout');
        showPage('account');
        return;
    }
    
    showToast('Order placed successfully!');
    cart = [];
    updateCartCount();
    loadCart();
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (input) {
        const currentValue = parseInt(input.value);
        if (currentValue < 10) {
            input.value = currentValue + 1;
        }
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (input) {
        const currentValue = parseInt(input.value);
        if (currentValue > 1) {
            input.value = currentValue - 1;
        }
    }
}

// Filter functions
function filterByCategory(category) {
    console.log('Filtering by category:', category);
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = Array.from(filterButtons).find(btn => 
        btn.textContent.toLowerCase().replace(' ', '') === category ||
        (category === 'all' && btn.textContent === 'All')
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    showPage('catalog');
    
    let filteredProducts;
    if (category === 'all') {
        filteredProducts = products;
        showToast(`Showing all ${products.length} products`);
    } else {
        filteredProducts = products.filter(product => product.category === category);
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        showToast(`Showing ${filteredProducts.length} ${categoryName}`);
    }
    
    filterProducts(filteredProducts);
}

function filterProducts(filteredProducts) {
    console.log('Filtering products:', filteredProducts);
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    filteredProducts.forEach((product, index) => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item fade-in';
        productElement.style.animationDelay = `${index * 0.1}s`;
        productElement.style.cursor = 'pointer';
        
        const imageHTML = product.images.map((img, imgIndex) => 
            `<img src="${img}" alt="${product.name}" class="product-img ${imgIndex === 0 ? 'active' : ''}" data-index="${imgIndex}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+'">`
        ).join('');
        
        productElement.innerHTML = `
            <div class="product-image" data-product-id="${product.id}">
                <div class="product-image-container">
                    ${imageHTML}
                </div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price}.00</div>
                <button class="quick-add-btn" data-product-id="${product.id}">Quick Add</button>
            </div>
        `;
        
        productsGrid.appendChild(productElement);
        
        // Add click event listeners
        productElement.addEventListener('click', function(e) {
            if (e.target.classList.contains('quick-add-btn')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            console.log('Filtered product clicked! ID:', product.id);
            viewProduct(product.id);
        });
        
        const quickAddBtn = productElement.querySelector('.quick-add-btn');
        quickAddBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            quickAddToCart(product.id);
        });
    });
}

// Search functions
function toggleSearch() {
    const searchContainer = document.getElementById('searchBarContainer');
    const searchInput = document.getElementById('searchInput');
    
    searchOpen = !searchOpen;
    
    if (searchOpen) {
        searchContainer.classList.add('active');
        setTimeout(() => {
            searchInput.focus();
        }, 300);
    } else {
        searchContainer.classList.remove('active');
        searchInput.value = '';
        document.getElementById('searchResults').style.display = 'none';
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        const results = products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        
        displaySearchResults(results);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
            if (searchOpen) {
                toggleSearch();
            }
        }
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="selectSearchResult(${product.id})">
            <div class="search-result-image"></div>
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>$${product.price}.00</p>
            </div>
        </div>
    `).join('');
    
    searchResults.style.display = 'block';
}

function selectSearchResult(productId) {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    
    searchResults.style.display = 'none';
    searchInput.value = '';
    toggleSearch();
    
    viewProduct(productId);
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) return;
    
    const results = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    
    if (results.length > 0) {
        showPage('catalog');
        filterProducts(results);
        showToast(`Found ${results.length} product(s)`);
    } else {
        showToast('No products found');
    }
    
    document.getElementById('searchResults').style.display = 'none';
    searchInput.value = '';
    toggleSearch();
}

// Authentication functions
function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                currentUser = { name: email.split('@')[0], email: email };
                updateAccountPage();
                updateAccountLink();
                showToast('Login successful!');
            } else {
                showToast('Please enter email and password');
            }
        });
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match');
                return;
            }
            
            currentUser = { name, email };
            updateAccountPage();
            updateAccountLink();
            showToast('Account created successfully!');
        });
    }
}

function showAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[onclick="showAuthTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}Form`).classList.add('active');
}

function updateAccountPage() {
    const authForms = document.getElementById('authForms');
    const userDashboard = document.getElementById('userDashboard');
    
    if (currentUser) {
        authForms.style.display = 'none';
        userDashboard.style.display = 'block';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
    } else {
        authForms.style.display = 'block';
        userDashboard.style.display = 'none';
    }
}

function updateAccountLink() {
    const accountLink = document.getElementById('accountLink');
    if (accountLink) {
        if (currentUser) {
            accountLink.textContent = currentUser.name;
        } else {
            accountLink.textContent = 'Account';
        }
    }
}

function logout() {
    currentUser = null;
    updateAccountPage();
    updateAccountLink();
    showToast('Logged out successfully');
    showPage('home');
}

// Utility functions
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function subscribeNewsletter() {
    const emailInput = document.querySelector('.newsletter-input');
    const email = emailInput.value.trim();
    
    if (email && email.includes('@')) {
        showToast('Successfully subscribed to newsletter!');
        emailInput.value = '';
    } else {
        showToast('Please enter a valid email address');
    }
}

// Image cycling functionality (for hover effects)
let imageCycleIntervals = {};

function startImageCycle(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.images.length <= 1) return;
    
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productElement) return;
    
    const images = productElement.querySelectorAll('.product-img');
    let currentIndex = 0;
    
    imageCycleIntervals[productId] = setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }, 800);
}

function stopImageCycle(productId) {
    if (imageCycleIntervals[productId]) {
        clearInterval(imageCycleIntervals[productId]);
        delete imageCycleIntervals[productId];
        
        const productElement = document.querySelector(`[data-product-id="${productId}"]`);
        if (productElement) {
            const images = productElement.querySelectorAll('.product-img');
            images.forEach((img, index) => {
                img.classList.toggle('active', index === 0);
            });
        }
    }
}

// Slideshow functions
function initializeSlideshow() {
    const slides = document.querySelectorAll('.background-slide');
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === 0);
    });
    
    startSlideshow();
    
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.addEventListener('mouseenter', pauseSlideshow);
        homeSection.addEventListener('mouseleave', startSlideshow);
    }
}

function startSlideshow() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 4000);
}

function pauseSlideshow() {
    clearInterval(slideInterval);
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % 3;
    updateSlide();
}

function updateSlide() {
    const slides = document.querySelectorAll('.background-slide');
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
}

// Event listeners
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    }
});

function handleMobileMenu() {
    if (window.innerWidth <= 768) {
        const navLeft = document.querySelector('.nav-left');
        if (navLeft) navLeft.style.display = 'none';
    } else {
        const navLeft = document.querySelector('.nav-left');
        if (navLeft) navLeft.style.display = 'flex';
    }
}

window.addEventListener('resize', handleMobileMenu);

document.addEventListener('keydown', function(event) {
    const activeElement = document.activeElement;
    const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
    );
    
    if (isTyping) {
        return;
    }
    
    if (event.key === 'Escape') {
        if (searchOpen) {
            toggleSearch();
        } else {
            showPage('home');
        }
    }
    
    if (event.key === '1') {
        showPage('home');
    } else if (event.key === '2') {
        showPage('catalog');
    } else if (event.key === '3') {
        showPage('contact');
    } else if (event.key === '4') {
        showPage('account');
    } else if (event.key === '5') {
        showPage('cart');
    }
});

// Initialize mobile menu on load
handleMobileMenu();