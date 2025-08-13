// EcoCutlery Multi-Page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Global variables
  let cart = JSON.parse(localStorage.getItem("ecocutlery-cart")) || []
  let currentStep = 1

  // Product data
  const products = {
    "vanilla-spoons": {
      name: "Vanilla Spoons",
      price: 12.99,
      image: "./uploads/vanilla.jpg",
      desc: "Pack of 20",
    },
    "chocolate-spoons": {
      name: "Chocolate Spoons",
      price: 14.99,
      image: "./uploads/chocolate.jpg",
      desc: "Pack of 20",
    },
    "herb-forks": {
      name: "Herb Forks",
      price: 13.99,
      image: "./uploads/herb_forks.jpg",
      desc: "Pack of 18",
    },
    "family-combo": {
      name: "Family Combo Pack",
      price: 34.99,
      image: "./uploads/family_combo.jpg",
      desc: "60 pieces total",
    },
  }

  // Mobile Navigation Toggle
  function initMobileNavigation() {
    const mobileToggle = document.createElement("button")
    mobileToggle.className = "mobile-menu-toggle"
    mobileToggle.innerHTML = "☰"

    const nav = document.querySelector("nav")
    const navLinks = document.querySelector(".nav-links")

    if (nav && navLinks) {
      nav.insertBefore(mobileToggle, navLinks)

      mobileToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active")
        mobileToggle.innerHTML = navLinks.classList.contains("active") ? "✕" : "☰"
      })

      // Close mobile menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!nav.contains(e.target)) {
          navLinks.classList.remove("active")
          mobileToggle.innerHTML = "☰"
        }
      })
    }
  }

  // Product Filtering (Products Page)
  function initProductFiltering() {
    const filterBtns = document.querySelectorAll(".filter-btn")
    const productCards = document.querySelectorAll(".product-card")

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Update active filter button
        filterBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")

        const category = btn.dataset.category

        // Filter products
        productCards.forEach((card) => {
          if (category === "all" || card.dataset.category === category) {
            card.style.display = "block"
            card.style.animation = "fadeInUp 0.5s ease-out"
          } else {
            card.style.display = "none"
          }
        })
      })
    })
  }

  // Shopping Cart Functionality
  function initShoppingCart() {
    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn")
    addToCartBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.product
        const price = Number.parseFloat(btn.dataset.price)
        addToCart(productId, price)

        // Visual feedback
        btn.style.background = "linear-gradient(135deg, #4ecdc4, #45b7d1)"
        btn.textContent = "Added!"
        setTimeout(() => {
          btn.style.background = "linear-gradient(135deg, #ff6b6b, #4ecdc4)"
          btn.textContent = "Add to Cart"
        }, 1500)
      })
    })

    // Quantity controls for order page
    const qtyBtns = document.querySelectorAll(".qty-btn")
    qtyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.product
        const isPlus = btn.classList.contains("plus")
        const quantitySpan = document.querySelector(`.quantity[data-product="${productId}"]`)

        let quantity = Number.parseInt(quantitySpan.textContent)

        if (isPlus) {
          quantity++
        } else if (quantity > 0) {
          quantity--
        }

        quantitySpan.textContent = quantity
        updateCartFromQuantities()
      })
    })
  }

  function addToCart(productId, price) {
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.push({
        id: productId,
        quantity: 1,
        price: price,
      })
    }

    saveCart()
    updateCartDisplay()
  }

  function updateCartFromQuantities() {
    cart = []
    const quantities = document.querySelectorAll(".quantity")

    quantities.forEach((qtySpan) => {
      const productId = qtySpan.dataset.product
      const quantity = Number.parseInt(qtySpan.textContent)

      if (quantity > 0) {
        const product = products[productId]
        cart.push({
          id: productId,
          quantity: quantity,
          price: product.price,
        })
      }
    })

    saveCart()
    updateCartDisplay()
  }

  function saveCart() {
    localStorage.setItem("ecocutlery-cart", JSON.stringify(cart))
  }

  function updateCartDisplay() {
    const cartItems = document.getElementById("cartItems")
    const subtotalEl = document.getElementById("subtotal")
    const totalEl = document.getElementById("total")
    const finalTotalEl = document.getElementById("finalTotal")

    if (!cartItems) return

    if (cart.length === 0) {
      cartItems.innerHTML =
        '<div class="empty-cart"><p>Your cart is empty. Please select some products first.</p></div>'
      if (subtotalEl) subtotalEl.textContent = "$0.00"
      if (totalEl) totalEl.textContent = "$5.99"
      if (finalTotalEl) finalTotalEl.textContent = "$5.99"
      return
    }

    let subtotal = 0
    let cartHTML = ""

    cart.forEach((item) => {
      const product = products[item.id]
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal

      cartHTML += `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            <p>Quantity: ${item.quantity} | ${product.desc}</p>
          </div>
          <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        </div>
      `
    })

    cartItems.innerHTML = cartHTML

    const shipping = subtotal >= 50 ? 0 : 5.99
    const total = subtotal + shipping

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`
    if (document.getElementById("shipping")) {
      document.getElementById("shipping").textContent = subtotal >= 50 ? "FREE" : "$5.99"
    }
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`
    if (finalTotalEl) finalTotalEl.textContent = `$${total.toFixed(2)}`

    // Update final order summary
    const finalOrderItems = document.getElementById("finalOrderItems")
    if (finalOrderItems) {
      finalOrderItems.innerHTML = cartHTML
    }
  }

  // Order Process Navigation
  function initOrderProcess() {
    // Load cart quantities on order page
    if (document.querySelector(".quick-order-grid")) {
      cart.forEach((item) => {
        const quantitySpan = document.querySelector(`.quantity[data-product="${item.id}"]`)
        if (quantitySpan) {
          quantitySpan.textContent = item.quantity
        }
      })
      updateCartDisplay()
    }
  }

  // Step navigation functions
  window.nextStep = () => {
    if (currentStep === 1 && cart.length === 0) {
      alert("Please select at least one product before continuing.")
      return
    }

    if (currentStep < 4) {
      document.querySelector(`#step${currentStep}`).classList.remove("active")
      document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove("active")

      currentStep++

      document.querySelector(`#step${currentStep}`).classList.add("active")
      document.querySelector(`.step[data-step="${currentStep}"]`).classList.add("active")

      // Scroll to top of order content
      document.querySelector(".order-content").scrollIntoView({ behavior: "smooth" })
    }
  }

  window.prevStep = () => {
    if (currentStep > 1) {
      document.querySelector(`#step${currentStep}`).classList.remove("active")
      document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove("active")

      currentStep--

      document.querySelector(`#step${currentStep}`).classList.add("active")
      document.querySelector(`.step[data-step="${currentStep}"]`).classList.add("active")

      // Scroll to top of order content
      document.querySelector(".order-content").scrollIntoView({ behavior: "smooth" })
    }
  }

  // Promo code functionality
  window.applyPromoCode = () => {
    const promoInput = document.getElementById("promoCode")
    const discountRow = document.getElementById("discountRow")
    const discountEl = document.getElementById("discount")

    if (!promoInput || !discountRow || !discountEl) return

    const code = promoInput.value.toUpperCase()
    const validCodes = {
      ECO10: 0.1,
      GREEN15: 0.15,
      SAVE20: 0.2,
    }

    if (validCodes[code]) {
      const subtotal = Number.parseFloat(document.getElementById("subtotal").textContent.replace("$", ""))
      const discount = subtotal * validCodes[code]

      discountEl.textContent = `-$${discount.toFixed(2)}`
      discountRow.style.display = "flex"

      // Update total
      const shipping = subtotal >= 50 ? 0 : 5.99
      const newTotal = subtotal - discount + shipping
      document.getElementById("total").textContent = `$${newTotal.toFixed(2)}`
      document.getElementById("finalTotal").textContent = `$${newTotal.toFixed(2)}`

      promoInput.style.borderColor = "#4ecdc4"
      promoInput.value = ""

      // Show success message
      showNotification("Promo code applied successfully!", "success")
    } else {
      promoInput.style.borderColor = "#ff6b6b"
      showNotification("Invalid promo code. Try ECO10, GREEN15, or SAVE20", "error")
    }
  }

  // Place order functionality
  window.placeOrder = () => {
    // Basic form validation
    const requiredFields = document.querySelectorAll("#step3 input[required], #step3 select[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "#ff6b6b"
        isValid = false
      } else {
        field.style.borderColor = "rgba(255, 255, 255, 0.2)"
      }
    })

    if (!isValid) {
      showNotification("Please fill in all required fields.", "error")
      return
    }

    // Generate order number
    const orderNumber = "ECO-" + Math.random().toString(36).substr(2, 9).toUpperCase()

    // Show order confirmation modal
    const modal = document.getElementById("orderModal")
    const orderNumberEl = document.getElementById("orderNumber")
    const modalOrderItems = document.getElementById("modalOrderItems")
    const modalTotal = document.getElementById("modalTotal")

    if (modal && orderNumberEl && modalOrderItems && modalTotal) {
      orderNumberEl.textContent = orderNumber
      modalOrderItems.innerHTML = document.getElementById("finalOrderItems").innerHTML
      modalTotal.textContent = document.getElementById("finalTotal").textContent

      modal.classList.add("active")

      // Clear cart after successful order
      cart = []
      saveCart()
    }
  }

  // Modal functionality
  function closeModal() {
    const modal = document.getElementById("orderModal")
    if (modal) {
      modal.classList.remove("active")
      // Redirect to home page
      window.location.href = "index.html"
    }
  }

  window.closeModal = closeModal

  // Close modal when clicking outside
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("orderModal")
    if (modal && e.target === modal) {
      closeModal()
    }
  })

  // FAQ Accordion (Contact Page)
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll(".faq-item")

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question")

      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active")

        // Close all other FAQ items
        faqItems.forEach((otherItem) => {
          otherItem.classList.remove("active")
        })

        // Toggle current item
        if (!isActive) {
          item.classList.add("active")
        }
      })
    })
  }

  // Form Handling
  function initFormHandling() {
    // Contact form
    const contactForm = document.getElementById("contactForm")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault()

        // Basic validation
        const requiredFields = contactForm.querySelectorAll("input[required], select[required], textarea[required]")
        let isValid = true

        requiredFields.forEach((field) => {
          if (!field.value.trim()) {
            field.style.borderColor = "#ff6b6b"
            isValid = false
          } else {
            field.style.borderColor = "rgba(255, 255, 255, 0.2)"
          }
        })

        if (isValid) {
          showNotification("Thank you for your message! We'll get back to you soon.", "success")
          contactForm.reset()
        } else {
          showNotification("Please fill in all required fields.", "error")
        }
      })
    }

    // Newsletter forms
    const newsletterForms = document.querySelectorAll(".newsletter-form")
    newsletterForms.forEach((form) => {
      const btn = form.querySelector(".newsletter-btn")
      const input = form.querySelector(".newsletter-input")

      if (btn && input) {
        btn.addEventListener("click", (e) => {
          e.preventDefault()

          const email = input.value.trim()
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

          if (emailRegex.test(email)) {
            showNotification("Successfully subscribed to newsletter!", "success")
            input.value = ""
          } else {
            showNotification("Please enter a valid email address.", "error")
            input.style.borderColor = "#ff6b6b"
          }
        })
      }
    })
  }

  // Notification system
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success"
          ? "linear-gradient(135deg, #4ecdc4, #45b7d1)"
          : type === "error"
            ? "linear-gradient(135deg, #ff6b6b, #ff8a80)"
            : "linear-gradient(135deg, #667eea, #764ba2)"
      };
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      z-index: 1000;
      animation: slideInRight 0.5s ease-out;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 300px;
      word-wrap: break-word;
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.5s ease-out"
      setTimeout(() => notification.remove(), 500)
    }, 4000)
  }

  // Smooth scrolling for navigation links
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]')
  smoothScrollLinks.forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Parallax effect for floating elements
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll(".floating-element")

    parallaxElements.forEach((element, index) => {
      const speed = 0.3 + index * 0.15
      const yPos = -(scrolled * speed)
      element.style.transform = `translate3d(0, ${yPos}px, 0)`
    })

    // Header background opacity on scroll
    const header = document.querySelector("nav")
    if (header) {
      const scrollPercent = Math.min(scrolled / 100, 1)
      header.style.background = `rgba(255, 255, 255, ${0.1 + scrollPercent * 0.1})`
    }
  })

  // Button ripple effect
  function createRipple(event) {
    const button = event.currentTarget
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = size + "px"
    ripple.style.left = x + "px"
    ripple.style.top = y + "px"
    ripple.classList.add("ripple")

    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  // Add ripple effect to all buttons
  const buttons = document.querySelectorAll(
    ".btn-primary, .btn-secondary, .cta-button, .add-to-cart-btn, .qty-btn, .newsletter-btn, .submit-btn, .next-step-btn, .prev-step-btn, .place-order-btn",
  )
  buttons.forEach((button) => {
    button.addEventListener("click", createRipple)
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".feature-card, .product-card, .value-card, .team-member, .testimonial-card, .contact-card, .stat-card",
  )
  animatedElements.forEach((el) => observer.observe(el))

  // Initialize all functionality
  initMobileNavigation()
  initProductFiltering()
  initShoppingCart()
  initOrderProcess()
  initFAQAccordion()
  initFormHandling()

  console.log("🌱 EcoCutlery website loaded successfully!")
})

// CSS animations added via JavaScript
const style = document.createElement("style")
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-in {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  button, .btn-primary, .btn-secondary, .cta-button, .add-to-cart-btn, .qty-btn, .newsletter-btn, .submit-btn, .next-step-btn, .prev-step-btn, .place-order-btn {
    position: relative;
    overflow: hidden;
  }

  .notification {
    font-weight: 500;
    font-size: 0.9rem;
  }
`
document.head.appendChild(style)
