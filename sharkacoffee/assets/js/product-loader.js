/**
 * Product Loader
 * Dynamically loads product data from JSON based on URL parameters
 * Sharka Coffee - Product Management System
 */

(function() {
  'use strict';
  
  const PRODUCTS_DATA_URL = 'assets/data/products.json';
  
  class ProductLoader {
    constructor() {
      this.products = null;
      this.currentProductId = null;
      this.currentLang = 'en';
      this.init();
    }
    
    /**
     * Initialize the product loader
     */
    async init() {
      try {
        // Get product ID from URL parameter
        this.currentProductId = this.getProductIdFromUrl();
        
        // Get current language from localStorage or browser
        this.currentLang = localStorage.getItem('sharkacoffee_lang') || this.detectBrowserLanguage();
        
        // Load products data
        await this.loadProductsData();
        
        // Load the specific product
        if (this.currentProductId && this.products) {
          this.loadProduct(this.currentProductId);
        } else {
          this.showError('Product not found');
        }
        
        // Listen for language change events
        document.addEventListener('languageChanged', (e) => {
          this.currentLang = e.detail.language;
          if (this.currentProductId) {
            this.loadProduct(this.currentProductId);
          }
          // Reload product menu when language changes
          this.loadProductMenu();
        });
        
        // Load product menu
        this.loadProductMenu();
        
      } catch (error) {
        console.error('Error initializing product loader:', error);
        this.showError('Failed to load product data');
      }
    }
    
    /**
     * Get product ID from URL parameter
     */
    getProductIdFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id');
    }
    
    /**
     * Detect browser language
     */
    detectBrowserLanguage() {
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang) {
        const langCode = browserLang.toLowerCase().split('-')[0];
        return langCode === 'zh' ? 'zh' : 'en';
      }
      return 'en';
    }
    
    /**
     * Load products data from JSON
     */
    async loadProductsData() {
      try {
        const response = await fetch(PRODUCTS_DATA_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch products data');
        }
        const data = await response.json();
        this.products = data.products;
      } catch (error) {
        console.error('Error loading products data:', error);
        throw error;
      }
    }
    
    /**
     * Load specific product
     */
    loadProduct(productId) {
      const product = this.products[productId];
      
      if (!product) {
        this.showError('Product not found');
        return;
      }
      
      const productData = product[this.currentLang];
      
      if (!productData) {
        console.error('Product data not found for language:', this.currentLang);
        return;
      }
      
      // Update page title
      document.title = productData.name + ' - Sharka Coffee';
      document.getElementById('page-title').textContent = productData.name;
      
      // Load product images
      this.loadProductImages(productData.images);
      
      // Load product details
      document.getElementById('product-name').textContent = productData.name;
      document.getElementById('product-tagline').textContent = productData.tagline;
      document.getElementById('product-price').textContent = productData.price;
      document.getElementById('product-description').innerHTML = productData.description;
      
      // Load detail images if available
      if (productData.detailImages && productData.detailImages.length > 0) {
        this.loadDetailImages(productData.detailImages);
      }
      
      // Load package list
      this.loadPackageList(productData.package);
      
      // Load note
      if (productData.note) {
        document.getElementById('note-text').textContent = productData.note;
        document.getElementById('product-note').style.display = 'block';
      } else {
        document.getElementById('product-note').style.display = 'none';
      }
      
      // Load specifications
      this.loadSpecifications(productData.specifications);
      
      // Load shipping info
      document.getElementById('shipping-info').textContent = productData.shipping;
      
      // Load warranty info
      this.loadWarrantyInfo(productData.warranty);
      
      // Initialize image popup for description images
      this.initImagePopup();
    }
    
    /**
     * Initialize magnific popup for images in description
     */
    initImagePopup() {
      // Use setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        if (typeof jQuery !== 'undefined' && jQuery.fn.magnificPopup) {
          jQuery('.image-popup').magnificPopup({
            type: 'image',
            gallery: {
              enabled: true
            },
            image: {
              titleSrc: 'title'
            }
          });
        }
      }, 100);
    }
    
    /**
     * Load detail images into description area
     */
    loadDetailImages(detailImages) {
      const descriptionEl = document.getElementById('product-description');
      let imagesHtml = '<br><br>';
      
      // Group images: 2 per row
      for (let i = 0; i < detailImages.length; i += 2) {
        imagesHtml += "<div style='text-align:center;'>";
        
        // First image in row
        imagesHtml += `<a href='${detailImages[i]}' class='image-popup'>`;
        imagesHtml += `<img src='${detailImages[i]}' style='width:400px; max-width:100%; margin:10px 5px; cursor:pointer; display:inline-block;' />`;
        imagesHtml += `</a>`;
        
        // Second image in row (if exists)
        if (i + 1 < detailImages.length) {
          imagesHtml += `<a href='${detailImages[i + 1]}' class='image-popup'>`;
          imagesHtml += `<img src='${detailImages[i + 1]}' style='width:400px; max-width:100%; margin:10px 5px; cursor:pointer; display:inline-block;' />`;
          imagesHtml += `</a>`;
        }
        
        imagesHtml += "</div>";
      }
      
      descriptionEl.innerHTML += imagesHtml;
    }
    
    /**
     * Load product images
     */
    loadProductImages(images) {
      const imageTabs = document.getElementById('image-tabs');
      const imageContent = document.getElementById('image-content');
      
      // Clear existing content
      imageTabs.innerHTML = '';
      imageContent.innerHTML = '';
      
      images.forEach((image, index) => {
        const isActive = index === 0;
        
        // Create tab button
        const tabLi = document.createElement('li');
        const tabButton = document.createElement('button');
        tabButton.className = isActive ? 'active' : '';
        tabButton.setAttribute('data-bs-toggle', 'tab');
        tabButton.setAttribute('data-bs-target', `#dt_image_${index + 1}`);
        tabButton.setAttribute('type', 'button');
        tabButton.setAttribute('role', 'tab');
        tabButton.setAttribute('aria-controls', `dt_image_${index + 1}`);
        tabButton.setAttribute('aria-selected', isActive ? 'true' : 'false');
        
        const thumbImg = document.createElement('img');
        thumbImg.src = image.thumb;
        thumbImg.alt = 'Product image';
        
        tabButton.appendChild(thumbImg);
        tabLi.appendChild(tabButton);
        imageTabs.appendChild(tabLi);
        
        // Create tab content
        const tabPane = document.createElement('div');
        tabPane.className = isActive ? 'tab-pane fade show active' : 'tab-pane fade';
        tabPane.id = `dt_image_${index + 1}`;
        tabPane.setAttribute('role', 'tabpanel');
        
        const fullImg = document.createElement('img');
        fullImg.src = image.full;
        fullImg.alt = 'Product image';
        
        tabPane.appendChild(fullImg);
        imageContent.appendChild(tabPane);
      });
    }
    
    /**
     * Load package list
     */
    loadPackageList(packageItems) {
      const packageList = document.getElementById('package-list');
      packageList.innerHTML = '';
      
      packageItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        packageList.appendChild(li);
      });
    }
    
    /**
     * Load specifications table
     */
    loadSpecifications(specifications) {
      const specsTable = document.getElementById('specifications-table');
      specsTable.innerHTML = '';
      
      for (const [key, value] of Object.entries(specifications)) {
        const tr = document.createElement('tr');
        tr.className = '>Title';
        
        const th = document.createElement('th');
        const strong = document.createElement('strong');
        strong.textContent = key;
        th.appendChild(strong);
        
        const td = document.createElement('td');
        td.textContent = value;
        
        tr.appendChild(th);
        tr.appendChild(td);
        specsTable.appendChild(tr);
      }
    }
    
    /**
     * Load warranty information
     */
    loadWarrantyInfo(warranty) {
      const warrantyInfo = document.getElementById('warranty-info');
      warrantyInfo.innerHTML = '';
      
      // Home Use
      if (warranty.homeUse) {
        const homeP = document.createElement('p');
        homeP.className = 'mb-0';
        homeP.innerHTML = `<b>${this.currentLang === 'zh' ? '家用：' : 'Home Use: '}</b> ${warranty.homeUse}`;
        warrantyInfo.appendChild(homeP);
      }
      
      // Commercial Use
      if (warranty.commercialUse) {
        const commercialP = document.createElement('p');
        commercialP.className = 'mb-0';
        commercialP.innerHTML = `<b>${this.currentLang === 'zh' ? '商用：' : 'Commercial Use: '}</b> ${warranty.commercialUse}`;
        warrantyInfo.appendChild(commercialP);
      }
      
      // Accessories
      if (warranty.accessories) {
        const accessoriesP = document.createElement('p');
        accessoriesP.className = 'mb-0';
        accessoriesP.innerHTML = `<b>${this.currentLang === 'zh' ? '配件保修：' : 'Warranty (Accessories): '}</b> ${warranty.accessories}`;
        warrantyInfo.appendChild(accessoriesP);
      }
      
      // Exchanges
      if (warranty.exchanges) {
        const exchangesP = document.createElement('p');
        exchangesP.className = 'mb-0';
        exchangesP.innerHTML = `<b>${this.currentLang === 'zh' ? '换货（如适用）：' : 'Exchanges (if applicable): '}</b> ${warranty.exchanges}`;
        warrantyInfo.appendChild(exchangesP);
      }
      
      // Shipping Return
      if (warranty.shippingReturn) {
        const shippingP = document.createElement('p');
        shippingP.className = 'mb-0';
        shippingP.innerHTML = `<b>${this.currentLang === 'zh' ? '退货运输：' : 'Shipping: '}</b> ${warranty.shippingReturn}`;
        warrantyInfo.appendChild(shippingP);
      }
    }
    
    /**
     * Load product menu in navigation
     */
    loadProductMenu() {
      if (!this.products) return;
      
      const productMenu = document.getElementById('product-menu');
      productMenu.innerHTML = '';
      
      for (const [productId, product] of Object.entries(this.products)) {
        const productData = product[this.currentLang];
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `product-detail.html?id=${productId}`;
        a.textContent = productData.shortName;
        
        li.appendChild(a);
        productMenu.appendChild(li);
      }
    }
    
    /**
     * Show error message
     */
    showError(message) {
      const container = document.querySelector('.details_section .container');
      if (container) {
        container.innerHTML = `
          <div class="row">
            <div class="col-12 text-center">
              <h2>${message}</h2>
              <p>Please check the URL or <a href="index.html">return to home page</a>.</p>
            </div>
          </div>
        `;
      }
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.productLoader = new ProductLoader();
    });
  } else {
    window.productLoader = new ProductLoader();
  }
  
})();
