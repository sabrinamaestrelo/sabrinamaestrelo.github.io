// Sistema de Modal de Leads
let leadModal = null;

// Configuração do backend de e-mails
const EMAIL_BACKEND_URL = '/api/subscribe';

// URL da página de pagamento da Kiwify com parâmetros UTM
const KWIFY_PAYMENT_URL = 'https://pay.kiwify.com.br/oE66fkG';

// Parâmetros UTM padrão
const UTM_PARAMS = {
    utm_source: 'landing_page',
    utm_medium: 'website',
    utm_campaign: 'imersao_instagram',
    utm_content: 'cta_button'
};

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modal de leads
    initLeadModal();
    
    // FAQ Accordion
    initFAQ();
    
    // Smooth scrolling para links internos
    initSmoothScrolling();
    
    // Animações de entrada
    initScrollAnimations();
    
    // Tracking de cliques nos CTAs
    initCTATracking();
    
    // Máscara para WhatsApp
    initWhatsAppMask();
});

// Inicializar modal de leads
function initLeadModal() {
    leadModal = document.getElementById('leadModal');
    
    if (!leadModal) return;
    
    // Adicionar event listeners para todos os botões CTA
    const ctaButtons = document.querySelectorAll('.cta-button, .cta-button-green, .hero-cta');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openLeadModal();
        });
    });
    
    // Fechar modal ao clicar fora
    leadModal.addEventListener('click', function(e) {
        if (e.target === leadModal) {
            closeLeadModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && leadModal.classList.contains('active')) {
            closeLeadModal();
        }
    });
}

// Inicializar máscara do WhatsApp
function initWhatsAppMask() {
    const whatsappInput = document.getElementById('leadWhatsapp');
    if (!whatsappInput) return;
    
    whatsappInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 7) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = value;
    });
}

// Abrir modal
function openLeadModal() {
    if (leadModal) {
        leadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro campo
        setTimeout(() => {
            const nameInput = document.getElementById('leadName');
            if (nameInput) nameInput.focus();
        }, 300);
    }
}

// Fechar modal
function closeLeadModal() {
    if (leadModal) {
        leadModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset do formulário
        resetForm();
    }
}

// Reset do formulário
function resetForm() {
    const form = document.getElementById('leadForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    if (form) {
        form.reset();
        form.style.display = 'block';
    }
    
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Limpar mensagens de erro
    clearErrors();
}

// Limpar mensagens de erro
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Validação do formulário
function validateForm(formData) {
    let isValid = true;
    clearErrors();
    
    // Validar nome
    if (!formData.name || formData.name.trim().length < 2) {
        showError('nameError', 'Nome deve ter pelo menos 2 caracteres');
        const nameInput = document.getElementById('leadName');
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        showError('emailError', 'Digite um email válido');
        const emailInput = document.getElementById('leadEmail');
        if (emailInput) emailInput.classList.add('error');
        isValid = false;
    }
    
    // Validar WhatsApp
    const whatsappClean = formData.whatsapp.replace(/\D/g, '');
    if (!whatsappClean || whatsappClean.length < 10 || whatsappClean.length > 11) {
        showError('whatsappError', 'Digite um WhatsApp válido');
        const whatsappInput = document.getElementById('leadWhatsapp');
        if (whatsappInput) whatsappInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Mostrar erro
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Submeter formulário
async function submitLead(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton?.querySelector('.button-text');
    const buttonLoading = submitButton?.querySelector('.button-loading');
    
    // Coletar dados do formulário
    const formData = {
        name: document.getElementById('leadName')?.value.trim() || '',
        email: document.getElementById('leadEmail')?.value.trim() || '',
        whatsapp: document.getElementById('leadWhatsapp')?.value.trim() || '',
        timestamp: new Date().toLocaleString('pt-BR'),
        source: 'Landing Page - Imersão Instagram'
    };
    
    // Validar formulário
    if (!validateForm(formData)) {
        return;
    }
    
    // Mostrar loading
    if (submitButton) {
        submitButton.disabled = true;
        if (buttonText) buttonText.style.display = 'none';
        if (buttonLoading) buttonLoading.style.display = 'flex';
    }
    
    try {
        // Enviar para o backend de e-mails
        await sendToEmailBackend(formData);
        
        // Mostrar sucesso
        showSuccess();
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
            redirectToPayment(formData);
        }, 3000);
        
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        showErrorMessage();
    } finally {
        // Restaurar botão
        if (submitButton) {
            submitButton.disabled = false;
            if (buttonText) buttonText.style.display = 'block';
            if (buttonLoading) buttonLoading.style.display = 'none';
        }
    }
}

// Enviar dados para o backend de e-mails
async function sendToEmailBackend(data) {
    try {
        const response = await fetch(EMAIL_BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Erro ao enviar dados');
        }
        
        console.log('Dados enviados com sucesso:', result);
        return result;
        
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        throw error;
    }
}

// Mostrar mensagem de sucesso
function showSuccess() {
    const form = document.getElementById('leadForm');
    const successMessage = document.getElementById('successMessage');
    
    if (form) form.style.display = 'none';
    if (successMessage) successMessage.style.display = 'block';
}

// Mostrar mensagem de erro
function showErrorMessage() {
    const form = document.getElementById('leadForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (form) form.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'block';
    
    // Voltar ao formulário após 5 segundos
    setTimeout(() => {
        if (form) form.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';
    }, 5000);
}

// Redirecionar para pagamento
function redirectToPayment(data) {
    // Construir URL com parâmetros do usuário e UTM
    const params = new URLSearchParams({
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp.replace(/\D/g, ''),
        ...UTM_PARAMS
    });
    
    const paymentUrl = `${KWIFY_PAYMENT_URL}?${params.toString()}`;
    
    // Redirecionar
    window.location.href = paymentUrl;
}

// Inicializa o FAQ accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Fecha outros itens abertos
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle do item atual
                item.classList.toggle('active');
            });
        }
    });
}

// Inicializa smooth scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Não interceptar links vazios ou que abrem modal
            if (!href || href === '#' || this.classList.contains('cta-button')) {
                return;
            }
            
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Offset para header fixo
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Inicializa animações de scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Elementos para animar
    const animatedElements = document.querySelectorAll('.testimonial-card, .day-block, .price-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Tracking de cliques nos CTAs
function initCTATracking() {
    const ctaButtons = document.querySelectorAll('.cta-button, .cta-button-green');
    
    ctaButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // Determinar posição do CTA para UTM específico
            let utmContent = 'cta_button';
            
            if (this.closest('#hero')) {
                utmContent = 'hero_cta';
            } else if (this.closest('#oferta')) {
                utmContent = 'oferta_cta';
            } else if (this.closest('#cta-final')) {
                utmContent = 'final_cta';
            } else {
                utmContent = `cta_${index + 1}`;
            }
            
            // Atualizar parâmetros UTM para este CTA específico
            UTM_PARAMS.utm_content = utmContent;
            
            // Tracking analytics
            console.log('CTA clicado:', this.textContent, 'UTM Content:', utmContent);
            
            // Exemplo de tracking com Google Analytics (se configurado)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'CTA',
                    'event_label': this.textContent,
                    'utm_content': utmContent
                });
            }
        });
    });
}

// Função para detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Função para otimizar performance em mobile
function optimizeForMobile() {
    if (isMobile()) {
        // Reduz animações em dispositivos móveis
        document.body.classList.add('mobile-optimized');
    }
}

// Inicializa otimizações
optimizeForMobile();

// Event listener para redimensionamento da janela
window.addEventListener('resize', () => {
    optimizeForMobile();
});

