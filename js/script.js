let currentUser = null;
let currentProduct = null;
let searchOpen = false;
let currentDetailImageIndex = 0;
let detailSlideshowInterval = null;
let isSlideshowPlaying = true;
let currentCategory = 'all';

const products = [
    {
        id: 2,
        name: "Japan Views Hoodie",
        price: 85,
        description: "Oversized hoodie inspired by traditional Japanese landscapes. Features scenic mountain and temple artwork with premium comfort.",
        images: ["assets/images/products/japanfront.jpg", "assets/images/products/japanback.jpg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "hoodies",
        reviews: []
    },
    {
        id: 4,
        name: "Van Gogh Starry Hoodie",
        price: 95,
        description: "Art-inspired hoodie featuring Van Gogh's iconic starry night aesthetic. High-quality print on comfortable heavyweight cotton.",
        images: ["assets/images/products/vangohfront.jpg", "assets/images/products/vangohback.jpg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "hoodies",
        reviews: []
    },
    {
        id: 5,
        name: "Roses",
        price: 60,
        description: "1:1 Tapestry hoodie featuring beautiful rose designs. Handmade with premium woven tapestry fabric for a unique and artistic look.",
        images: ["assets/images/tapestry/Roses.jpeg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "tapestry",
        reviews: []
    },
    {
        id: 6,
        name: "Dalmatians",
        price: 60,
        description: "1:1 Tapestry hoodie featuring playful dalmatian patterns. Handmade with premium woven tapestry fabric for a unique and artistic look.",
        images: ["assets/images/tapestry/Dalmatians .jpeg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "tapestry",
        reviews: []
    },
    {
        id: 7,
        name: "Skull Head",
        price: 60,
        description: "1:1 Tapestry hoodie featuring striking skull head design. Handmade with premium woven tapestry fabric for a unique and artistic look.",
        images: ["assets/images/tapestry/Skull Head.jpeg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "tapestry",
        reviews: []
    },
    {
        id: 8,
        name: "Angel Trumpet",
        price: 60,
        description: "1:1 Tapestry hoodie featuring elegant angel trumpet flowers. Handmade with premium woven tapestry fabric for a unique and artistic look.",
        images: ["assets/images/tapestry/Angel Trumpet.jpeg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "tapestry",
        reviews: []
    },
    {
        id: 9,
        name: "Mickey Mouse",
        price: 60,
        description: "1:1 Tapestry hoodie featuring classic Mickey Mouse design. Handmade with premium woven tapestry fabric for a unique and artistic look.",
        images: ["assets/images/tapestry/Mickey Mouse.jpeg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "tapestry",
        reviews: []
    },
    {
        id: 10,
        name: "Teddy Bear",
        price: 60,
        description: "1:1 Tapestry hoodie featuring adorable teddy bear design. Handmade with premium woven tapestry fabric for a unique and artistic look.",
        images: ["assets/images/tapestry/Teddy Bear.jpeg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "tapestry",
        reviews: []
    },
    {
        id: 11,
        name: "Pluto",
        price: 60,
        description: "1:1 Tapestry hoodie featuring lovable Pluto character design. Handmade with premium woven tapestry fabric for a unique and artistic look.",
        images: ["assets/images/tapestry/Pluto.jpeg"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        category: "tapestry",
        reviews: []
    }
];

async function loadProductReviewsFromFirebase() {
    try {
        const reviewsSnapshot = await db.collection('reviews').get();

        reviewsSnapshot.forEach(doc => {
            const reviewData = doc.data();
            const product = products.find(p => p.id === reviewData.productId);
            if (product) {
                if (!product.reviews) product.reviews = [];
                product.reviews.push({
                    name: reviewData.userName,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    timestamp: reviewData.timestamp
                });
            }
        });

        products.forEach(product => { // Sort reviews by timestamp (newest first)
            if (product.reviews) {
                product.reviews.sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
                    const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
                    return timeB - timeA;
                });
            }
        });

        console.log('Reviews loaded from Firebase');
    } catch (error) {
        console.error('Error loading reviews from Firebase:', error);
    }
}

async function saveReviewToFirebase(productId, userName, rating, comment) {
    try {
        await db.collection('reviews').add({
            productId: productId,
            userName: userName,
            rating: rating,
            comment: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Review saved to Firebase');
    } catch (error) {
        console.error('Error saving review to Firebase:', error);
        throw error;
    }
}

async function saveNewsletterEmail(email) {
    try {
        await db.collection('newsletter').add({
            email: email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Newsletter email saved to Firebase');
    } catch (error) {
        console.error('Error saving newsletter email:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing...');

    auth.onAuthStateChanged(async (user) => { // Check if user is already logged in
        if (user) {
            currentUser = {
                uid: user.uid,
                name: user.displayName || user.email.split('@')[0],
                email: user.email
            };
            console.log('User is logged in:', currentUser);
            updateAccountPage();
            updateAccountLink();
        } else {
            currentUser = null;
            updateAccountPage();
            updateAccountLink();
        }
    });

    await loadProductReviewsFromFirebase();

    showPage('home');
    loadProducts();
    setupEventListeners();
    setupSearch();
});

function showPage(pageId) {
    console.log('Showing page:', pageId);

    if (typeof stopDetailSlideshow === 'function') stopDetailSlideshow();

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = pageId === 'home' ? 'flex' : 'block';

        if (pageId === 'account') updateAccountPage();
        else if (pageId === 'home') restartTextSlider();

        window.scrollTo(0, 0);
    }
}

function restartTextSlider() {
    const textSliders = document.querySelectorAll('.text-slider');
    textSliders.forEach(slider => {
        slider.style.animation = 'none';
        slider.offsetHeight; // Trigger reflow
        slider.style.animation = null;
    });
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
            </div>
        `;

        productsGrid.appendChild(productElement);

        if (product.images.length > 1) { // Add hover image cycling for multiple images
            const productImage = productElement.querySelector('.product-image');
            let hoverInterval = null;
            let currentImageIndex = 0;

            productElement.addEventListener('mouseenter', function() {
                hoverInterval = setInterval(() => {
                    const images = productImage.querySelectorAll('.product-img');
                    images[currentImageIndex].classList.remove('active');
                    currentImageIndex = (currentImageIndex + 1) % images.length;
                    images[currentImageIndex].classList.add('active');
                }, 2500);
            });

            productElement.addEventListener('mouseleave', function() {
                clearInterval(hoverInterval);
                const images = productImage.querySelectorAll('.product-img');
                images.forEach((img, idx) => img.classList.toggle('active', idx === 0));
                currentImageIndex = 0;
            });
        }

        productElement.addEventListener('click', function(e) { // Click handler for entire product
            e.preventDefault();
            e.stopPropagation();
            console.log('Product clicked! ID:', product.id, 'Name:', product.name);
            viewProduct(product.id);
        });
    });

    console.log('Products loaded successfully');
}

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

    const nameElement = document.getElementById('productDetailName');
    const priceElement = document.getElementById('productDetailPrice');
    const descElement = document.getElementById('productDetailDescription');

    if (nameElement) nameElement.textContent = product.name;
    if (priceElement) priceElement.textContent = `$${product.price}.00`;
    if (descElement) descElement.textContent = product.description;

    const productDetailImage = document.getElementById('productDetailImage');
    if (productDetailImage && product.images && product.images.length > 0) {
        const existingImages = productDetailImage.querySelectorAll('.product-img');
        existingImages.forEach(img => img.remove());

        product.images.forEach((img, imgIndex) => {
            const imgElement = document.createElement('img');
            imgElement.src = img;
            imgElement.alt = product.name;
            imgElement.className = `product-img ${imgIndex === 0 ? 'active' : ''}`;
            imgElement.style.cursor = 'pointer';
            imgElement.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
            };
            const firstButton = productDetailImage.querySelector('.image-nav-btn'); // Insert images before buttons
            if (firstButton) productDetailImage.insertBefore(imgElement, firstButton);
            else productDetailImage.appendChild(imgElement);
        });

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

        const navButtons = productDetailImage.querySelectorAll('.image-nav-btn, .slideshow-toggle-btn');
        navButtons.forEach(btn => {
            btn.style.display = product.images.length > 1 ? 'flex' : 'none';
        });
    }

    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect) {
        sizeSelect.innerHTML = '';
        product.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            if (size === 'M' && product.sizes.includes('M')) option.selected = true;
            sizeSelect.appendChild(option);
        });
    }

    // Show color selector only for tapestry items
    const colorSelector = document.getElementById('colorSelector');
    if (colorSelector) {
        if (product.category === 'tapestry') {
            colorSelector.style.display = 'block';
        } else {
            colorSelector.style.display = 'none';
        }
    }

    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) quantityInput.value = 1;

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

    updateReviewFormVisibility();

    console.log('Switching to product detail page...');
    showPage('productDetail');

    isSlideshowPlaying = true;
    startDetailSlideshow();
}

function updateReviewFormVisibility() {
    const reviewForm = document.getElementById('reviewForm');
    const loginPrompt = document.getElementById('loginPrompt');

    if (currentUser) {
        if (reviewForm) reviewForm.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
    } else {
        if (reviewForm) reviewForm.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }
}

async function submitReview(event) {
    event.preventDefault();

    if (!currentUser) {
        showToast('Please login to submit a review');
        showPage('account');
        return;
    }

    if (!currentProduct) {
        showToast('No product selected');
        return;
    }

    const rating = document.querySelector('input[name="rating"]:checked');
    const comment = document.getElementById('reviewComment');

    if (!rating || !comment.value.trim()) {
        showToast('Please provide a rating and comment');
        return;
    }

    try {
        await saveReviewToFirebase(currentProduct.id, currentUser.name, parseInt(rating.value), comment.value.trim());

        const newReview = {
            name: currentUser.name,
            rating: parseInt(rating.value),
            comment: comment.value.trim(),
            timestamp: new Date()
        };

        if (!currentProduct.reviews) currentProduct.reviews = [];
        currentProduct.reviews.unshift(newReview);

        const reviewsContainer = document.getElementById('reviewsContainer');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = currentProduct.reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-name">${review.name}</span>
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                    </div>
                    <p class="review-comment">${review.comment}</p>
                </div>
            `).join('');
        }

        document.getElementById('reviewForm').reset();
        showToast('Review submitted successfully!');
    } catch (error) {
        console.error('Error submitting review:', error);
        showToast('Failed to submit review. Please try again.');
    }
}

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

    startDetailSlideshow(); // Restart slideshow on manual switch
}

function nextDetailImage(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!currentProduct || !currentProduct.images || currentProduct.images.length <= 1) return;

    const nextIndex = (currentDetailImageIndex + 1) % currentProduct.images.length;
    switchDetailImage(nextIndex);
}

function previousDetailImage(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!currentProduct || !currentProduct.images || currentProduct.images.length <= 1) return;

    const prevIndex = (currentDetailImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
    switchDetailImage(prevIndex);
}

function startDetailSlideshow() {
    stopDetailSlideshow();

    if (!currentProduct || !currentProduct.images || currentProduct.images.length <= 1) return;
    if (!isSlideshowPlaying) return;

    detailSlideshowInterval = setInterval(() => {
        nextDetailImage();
    }, 5000);

    updateSlideshowButton();
}

function stopDetailSlideshow() {
    if (detailSlideshowInterval) {
        clearInterval(detailSlideshowInterval);
        detailSlideshowInterval = null;
    }
}

function toggleSlideshow(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    isSlideshowPlaying = !isSlideshowPlaying;

    if (isSlideshowPlaying) {
        startDetailSlideshow();
    } else {
        stopDetailSlideshow();
    }

    updateSlideshowButton();
}

function updateSlideshowButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');

    if (playIcon && pauseIcon) {
        if (isSlideshowPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
        } else {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
    }
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

function returnToCatalog() {
    // Return to catalog page with the saved category filter
    filterByCategory(currentCategory);
}

function filterByCategory(category) {
    console.log('Filtering by category:', category);
    currentCategory = category; // Save the current category
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));

    const activeButton = Array.from(filterButtons).find(btn =>
        btn.textContent.toLowerCase().replace(/\s+/g, '').replace(/:/g, '') === category.toLowerCase().replace(/\s+/g, '').replace(/:/g, '') ||
        (category === 'all' && btn.textContent === 'All') ||
        (category === 'tapestry' && btn.textContent === '1:1 Tapestry')
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
        let categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        if (category === 'tapestry') {
            categoryName = '1:1 Tapestry';
        }
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
            </div>
        `;

        productsGrid.appendChild(productElement);

        // Add hover image cycling for products with multiple images
        if (product.images.length > 1) {
            const productImage = productElement.querySelector('.product-image');
            let hoverInterval = null;
            let currentImageIndex = 0;

            // Attach hover to entire product card, not just image
            productElement.addEventListener('mouseenter', function() {
                hoverInterval = setInterval(() => {
                    const images = productImage.querySelectorAll('.product-img');
                    images[currentImageIndex].classList.remove('active');
                    currentImageIndex = (currentImageIndex + 1) % images.length;
                    images[currentImageIndex].classList.add('active');
                }, 2500); // Change image every 2500ms
            });

            productElement.addEventListener('mouseleave', function() {
                clearInterval(hoverInterval);
                const images = productImage.querySelectorAll('.product-img');
                images.forEach((img, idx) => {
                    img.classList.toggle('active', idx === 0);
                });
                currentImageIndex = 0;
            });
        }

        // Add click event listeners
        productElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Filtered product clicked! ID:', product.id);
            viewProduct(product.id);
        });
    });
}

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
            <div class="search-result-image">
                <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='">
            </div>
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

function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showToast('Please enter email and password');
                return;
            }

            try {
                await auth.signInWithEmailAndPassword(email, password);
                showToast('Login successful!');
                loginForm.reset();
            } catch (error) {
                console.error('Login error:', error);
                if (error.code === 'auth/user-not-found') {
                    showToast('These credentials don\'t exist. Please sign up first.');
                } else if (error.code === 'auth/wrong-password') {
                    showToast('Wrong password. Please try again.');
                } else if (error.code === 'auth/invalid-email') {
                    showToast('Invalid email format.');
                } else if (error.code === 'auth/invalid-credential') {
                    showToast('These credentials don\'t exist. Please check your email and password.');
                } else if (error.code === 'auth/too-many-requests') {
                    showToast('Too many failed attempts. Please try again later.');
                } else {
                    showToast('Login failed. Please check your credentials.');
                }
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (!name || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters');
                return;
            }

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                await userCredential.user.updateProfile({ displayName: name });

                showToast('Account created successfully!');
                signupForm.reset();
                showAuthTab('login');
            } catch (error) {
                console.error('Signup error:', error);
                if (error.code === 'auth/email-already-in-use') {
                    showToast('This email is already registered. Please login instead.');
                } else if (error.code === 'auth/invalid-email') {
                    showToast('Invalid email format.');
                } else if (error.code === 'auth/weak-password') {
                    showToast('Password must be at least 6 characters.');
                } else if (error.code === 'auth/operation-not-allowed') {
                    showToast('Email/password accounts are not enabled. Please contact support.');
                } else {
                    showToast('Signup failed. Please try again.');
                }
            }
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

async function logout() {
    try {
        await auth.signOut();
        currentUser = null;
        updateAccountPage();
        updateAccountLink();
        showToast('Logged out successfully');
        showPage('home');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed. Please try again.');
    }
}

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

async function subscribeNewsletter() {
    const emailInput = document.querySelector('.newsletter-input');
    const email = emailInput.value.trim();

    if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address');
        return;
    }

    try {
        await saveNewsletterEmail(email);
        showToast('Successfully subscribed to newsletter!');
        emailInput.value = '';
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showToast('Subscription failed. Please try again.');
    }


}

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
    }, 2500);
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
        showPage('about');
    } else if (event.key === '4') {
        showPage('account');
    }
});

// Initialize mobile menu on load
handleMobileMenu();