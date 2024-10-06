document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    const BASE_URL = "https://raw.githubusercontent.com/elitemassagemx/Home/main/ICONOS/";
    let services = {};

    function handleImageError(img) {
        console.warn(`Failed to load image: ${img.src}`);
        img.style.display = 'none';
        img.src = `${BASE_URL}fallback-image.png`;
    }

    function buildImageUrl(iconPath) {
        if (!iconPath) return '';
        return iconPath.startsWith('http') ? iconPath : `${BASE_URL}${iconPath}`;
    }

    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with id "${id}" not found`);
        }
        return element;
    }

    function loadJSONData() {
        fetch('data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('JSON data loaded successfully');
                services = data.services;
                renderServices('individual');
                renderPackages();
                setupBenefitsNav('individual');
                setupPackageNav();
            })
            .catch(error => {
                console.error('Error loading the JSON file:', error);
                const servicesList = getElement('services-list');
                const packageList = getElement('package-list');
                if (servicesList) servicesList.innerHTML = '<p>Error al cargar los servicios. Por favor, intente más tarde.</p>';
                if (packageList) packageList.innerHTML = '<p>Error al cargar los paquetes. Por favor, intente más tarde.</p>';
            });
    }

    function renderServices(category) {
        console.log(`Rendering services for category: ${category}`);
        const servicesList = getElement('services-list');
        const template = getElement('service-template');
        if (!servicesList || !template) return;

        servicesList.innerHTML = '';

        if (!Array.isArray(services[category])) {
            console.error(`services[${category}] is not an array:`, services[category]);
            servicesList.innerHTML = '<p>Error al cargar los servicios. Por favor, intente más tarde.</p>';
            return;
        }

        services[category].forEach(service => {
            const serviceElement = template.content.cloneNode(true);
            
            serviceElement.querySelector('.service-title').textContent = service.title;
            
            const serviceIcon = serviceElement.querySelector('.service-icon');
            serviceIcon.src = buildImageUrl(service.icon);
            serviceIcon.onerror = () => handleImageError(serviceIcon);
            
            serviceElement.querySelector('.service-description').textContent = service.description;
            
            const benefitsIcon = serviceElement.querySelector('.benefits-icon');
            benefitsIcon.src = buildImageUrl(Array.isArray(service.benefitsIcons) ? service.benefitsIcons[0] : service.benefitsIcons);
            benefitsIcon.onerror = () => handleImageError(benefitsIcon);
            
            serviceElement.querySelector('.service-benefits').textContent = service.benefits.join(', ');
            
            const durationIcon = serviceElement.querySelector('.duration-icon');
            durationIcon.src = buildImageUrl(service.durationIcon);
            durationIcon.onerror = () => handleImageError(durationIcon);
            
            serviceElement.querySelector('.service-duration').textContent = service.duration;

            const reserveButton = serviceElement.querySelector('.reserve-button');
            reserveButton.addEventListener('click', () => sendWhatsAppMessage('Reservar', service.title));

            const infoButton = serviceElement.querySelector('.info-button');
            infoButton.addEventListener('click', () => showPopup(service));

            const serviceItem = serviceElement.querySelector('.service-item');
            if (Array.isArray(service.benefits)) {
                service.benefits.forEach(benefit => {
                    serviceItem.classList.add(benefit.toLowerCase().replace(/\s+/g, '-'));
                });
            }

            servicesList.appendChild(serviceElement);
        });
        console.log(`Rendered ${services[category].length} services`);
    }

    function renderPackages() {
        console.log('Rendering packages');
        const packageList = getElement('package-list');
        const template = getElement('package-template');
        if (!packageList || !template) {
            console.error('Package list or template not found');
            return;
        }

        packageList.innerHTML = '';
        if (!Array.isArray(services.paquetes)) {
            console.error('services.paquetes is not an array:', services.paquetes);
            packageList.innerHTML = '<p>Error al cargar los paquetes. Por favor, intente más tarde.</p>';
            return;
        }

        services.paquetes.forEach(pkg => {
            const packageElement = template.content.cloneNode(true);
            
            packageElement.querySelector('.package-title').textContent = pkg.title;
            packageElement.querySelector('.package-description').textContent = pkg.description;
            packageElement.querySelector('.package-includes-list').textContent = pkg.includes.join(', ');
            packageElement.querySelector('.package-duration-text').textContent = pkg.duration;
            packageElement.querySelector('.package-benefits-list').textContent = pkg.benefits.join(', ');

            const reserveButton = packageElement.querySelector('.reserve-button');
            reserveButton.addEventListener('click', () => sendWhatsAppMessage('Reservar', pkg.title));

            const infoButton = packageElement.querySelector('.info-button');
            infoButton.addEventListener('click', () => showPopup(pkg));

            const packageBackground = packageElement.querySelector('.package-background');
            if (pkg.backgroundImage) {
                packageBackground.style.backgroundImage = `url(${buildImageUrl(pkg.backgroundImage)})`;
            }

            const packageItem = packageElement.querySelector('.package-item');
            if (pkg.type) {
                packageItem.classList.add(pkg.type.toLowerCase().replace(/\s+/g, '-'));
            }

            packageList.appendChild(packageElement);
        });
        console.log(`Rendered ${services.paquetes.length} packages`);
    }

    function showPopup(data) {
        console.log('Showing popup for:', data.title);
        const popup = getElement('popup');
        const popupTitle = getElement('popup-title');
        const popupImage = getElement('popup-image');
        const popupDescription = getElement('popup-description');
        if (!popup || !popupTitle || !popupImage || !popupDescription) return;

        popupTitle.textContent = data.title || '';
        popupImage.src = buildImageUrl(data.popupImage || data.image);
        popupImage.alt = data.title || '';
        popupImage.onerror = () => handleImageError(popupImage);
        popupDescription.textContent = data.popupDescription || data.description || '';

        popup.style.display = 'block';
    }

    function sendWhatsAppMessage(action, serviceTitle) {
        console.log(`Sending WhatsApp message for: ${action} - ${serviceTitle}`);
        const message = encodeURIComponent(`Hola! Quiero ${action} un ${serviceTitle}`);
        const url = `https://wa.me/5215640020305?text=${message}`;
        window.open(url, '_blank');
    }

    function changeLanguage(lang) {
        console.log(`Changing language to: ${lang}`);
        var selectField = document.querySelector('.goog-te-combo');
        if (selectField) {
            selectField.value = lang;
            selectField.dispatchEvent(new Event('change'));
        } else {
            console.error('Google Translate dropdown not found');
        }
    }

    function setupLanguageSelector() {
        const translateIcon = getElement('translate-icon');
        const languageOptions = document.querySelector('.language-options');
        if (!translateIcon || !languageOptions) return;

        translateIcon.addEventListener('click', () => {
            console.log('Translate icon clicked');
            languageOptions.style.display = languageOptions.style.display === 'block' ? 'none' : 'block';
        });

        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (event) => {
                const lang = event.currentTarget.dataset.lang;
                console.log(`Language option clicked: ${lang}`);
                changeLanguage(lang);
                languageOptions.style.display = 'none';
            });
        });

        document.addEventListener('click', (event) => {
            if (!translateIcon.contains(event.target) && !languageOptions.contains(event.target)) {
                languageOptions.style.display = 'none';
            }
        });
    }

    function setupCategorySelector() {
        document.querySelectorAll('.choice-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                console.log(`Choice chip clicked: ${chip.dataset.category}`);
                document.querySelectorAll('.choice-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                renderServices(chip.dataset.category);
                setupBenefitsNav(chip.dataset.category);
            });
        });
    }

    function setupBenefitsNav(category) {
        const benefitsNav = document.querySelector('.benefits-nav');
        if (!benefitsNav) return;

        benefitsNav.innerHTML = '';
        const allBenefits = new Set();

        services[category].forEach(service => {
            if (Array.isArray(service.benefits)) {
                service.benefits.forEach(benefit => allBenefits.add(benefit));
            }
        });

        const allButton = document.createElement('button');
        allButton.classList.add('benefit-btn', 'active');
        allButton.dataset.filter = 'all';
        allButton.innerHTML = `
            <img src="${BASE_URL}todos.png" alt="Todos">
            <span>Todos</span>
        `;
        benefitsNav.appendChild(allButton);

        allBenefits.forEach(benefit => {
            const button = document.createElement('button');
            button.classList.add('benefit-btn');
            button.dataset.filter = benefit.toLowerCase().replace(/\s+/g, '-');
            button.innerHTML = `
                <img src="${BASE_URL}${benefit.toLowerCase().replace(/\s+/g, '-')}.png" alt="${benefit}">
                <span>${benefit}</span>
            `;
            benefitsNav.appendChild(button);
        });

        setupFilterButtons('.benefits-nav', '#services-list', '.service-item');
    }

    function setupPackageNav() {
        const packageNav = document.querySelector('.package-nav');
        if (!packageNav) return;

        packageNav.innerHTML = '';
        const packageTypes = new Set();

        services.paquetes.forEach(pkg => {
            if (pkg.type) {
                packageTypes.add(pkg.type);
            }
        });

        const allButton = document.createElement('button');
        allButton.classList.add('package-btn', 'active');
        allButton.dataset.filter = 'all';
        allButton.innerHTML = `
            <img src="${BASE_URL}todos-paquetes.png" alt="Todos los Paquetes">
            <span>Todos los Paquetes</span>
        `;
        packageNav.appendChild(allButton);

        packageTypes.forEach(type => {
            const button = document.createElement('button');
            button.classList.add('package-btn');
            button.dataset.filter = type.toLowerCase().replace(/\s+/g, '-');
            button.innerHTML = `
                <img src="${BASE_URL}${type.toLowerCase().replace(/\s+/g, '-')}.png" alt="${type}">
                <span>${type}</span>
            `;
            packageNav.appendChild(button);
        });

        setupFilterButtons('.package-nav', '#package-list', '.package-item');
    }

    function setupFilterButtons(navSelector, listSelector, itemSelector) {
        const navElement = document.querySelector(navSelector);
        const listElement = document.querySelector(listSelector);

        if (!navElement || !listElement) return;

        navElement.addEventListener('click', (event) => {
            if (event.target.matches('button') || event.target.closest('button')) {
                const button = event.target.matches('button') ? event.target : event.target.closest('button');
                const filter = button.dataset.filter;
                
                navElement.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                listElement.querySelectorAll(itemSelector).forEach(item => {
                    if (filter === 'all' || item.classList.contains(filter)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    }

    function setupPopup() {
        const popup = getElement('popup');
        const closeButton = popup.querySelector('.close');
        if (!popup || !closeButton) return;

        closeButton.addEventListener('click', () => {
            console.log('Closing popup');
            popup.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === popup) {
                console.log('Closing popup (clicked outside)');
                popup.style.display = 'none';
            }
        });
    }

    function setupGalleryAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not loaded. Gallery animations will not work.');
            return;
        }

        console.log('GSAP and ScrollTrigger are loaded');
        gsap.registerPlugin(ScrollTrigger);

        const gallery = document.querySelector('.gallery-container');
        if (!gallery) {
            console.error('Gallery container not found');
            return;
        }

        console.log('Gallery container found');
        const images = gsap.utils.toArray('.gallery-container img');
        
        ScrollTrigger.create({
            trigger: gallery,
            start: "top 80%",
            end: "bottom 20%",
            onEnter: () => {
                console.log('Gallery entered viewport');
                gallery.classList.add('is-visible');
                animateImages();
            },
            onLeave: () => {
                console.log('Gallery left viewport');
                gallery.classList.remove('is-visible');
            },
            onEnterBack: () => {
                console.log('Gallery entered viewport (scrolling up)');
                gallery.classList.add('is-visible');
                animateImages();
            },
            onLeaveBack: () => {
                console.log('Gallery left viewport (scrolling up)');
                gallery.classList.remove('is-visible');
            }
        });

        function animateImages() {
            images.forEach((img, index) => {
                gsap.fromTo(img, 
                    { scale: 0.8, opacity: 0 },
                    { 
                        scale: 1, 
                        opacity: 1, 
                        duration: 0.5, 
                        ease: "power2.out",
                        delay: index * 0.1,
                        onStart: () => console.log(`Image ${index + 1} animation started`)
                        }
                );
            });
        }

        console.log(`Found ${images.length} images in the gallery`);
    }

    function setupGalleryModal() {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const modalDescription = document.getElementById('modalDescription');
        const closeBtn = modal.querySelector('.close');

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function() {
                modal.style.display = "block";
                modalImg.src = this.querySelector('img').src;
                modalDescription.innerHTML = this.querySelector('.image-description').innerHTML;
            });
        });
        
        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });

        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    function setupDarkModeToggle() {
        const colorModeCheckbox = document.getElementById('color_mode');
        if (!colorModeCheckbox) return;

        colorModeCheckbox.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-preview');
                document.body.classList.remove('white-preview');
            } else {
                document.body.classList.add('white-preview');
                document.body.classList.remove('dark-preview');
            }
        });
    }

    function setupStickyHeader() {
        const header = document.getElementById('sticky-header');
        const fixedBar = document.querySelector('.fixed-bar');
        if (!header || !fixedBar) return;

        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop) {
                // Scrolling down
                header.style.top = '-100px';
                fixedBar.style.bottom = '0';
            } else {
                // Scrolling up
                header.style.top = '0';
                fixedBar.style.bottom = '-100px';
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, false);
    }

    function init() {
        loadJSONData();
        setupLanguageSelector();
        setupCategorySelector();
        setupPopup();
        setupGalleryAnimations();
        setupGalleryModal();
        setupDarkModeToggle();
        setupStickyHeader();
    }

    init();
});
