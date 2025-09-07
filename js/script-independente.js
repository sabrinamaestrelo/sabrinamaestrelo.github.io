// Landing Page Imersão Instagram - Versão Independente
// Sabrina Maestrello - sabrinamaestrello.com

let leadModal = null;

// Configuração para hospedagem independente
const CONFIG = {
    // URL do seu backend de e-mails (configure conforme sua hospedagem)
    EMAIL_BACKEND_URL: '/api/subscribe', // Altere para sua URL de backend
    
    // URL da página de pagamento da Kiwify
    KIWIFY_PAYMENT_URL: 'https://pay.kiwify.com.br/oE66fkG',
    
    // Parâmetros UTM padrão
    UTM_PARAMS: {
        utm_source: 'landing_page',
        utm_medium: 'website',
        utm_campaign: 'imersao_instagram',
        utm_content: 'cta_button'
    },
    
    // WhatsApp
    WHATSAPP_NUMBER: '5511915948001',
    WHATSAPP_MESSAGE: 'Olá! Tenho dúvidas sobre a Imersão Venda pelo Instagram'
};

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Landing Page Imersão Instagram - Carregada');
    
    // Inicializar componentes
    initLeadModal();
    initFAQ();
    initSmoothScrolling();
    initScrollAnimations();
    initCTATracking();
    initWhatsAppMask();
    initWhatsAppButton();
});

// Inicializar modal de leads
function initLeadModal() {
    leadModal = document.getElementById('leadModal');
    
    if (!leadModal) {
        console.warn('Modal de leads não encontrado');
        return;
    }
    
    // Adicionar event listeners para todos os botões CTA
    const ctaButtons = document.querySelectorAll('.cta-button, .cta-button-green, .hero-cta');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openLeadModal();
            
            // Tracking do clique
            trackCTAClick(this);
        });
    });
    
    // Fechar modal
    const closeButtons = leadModal.querySelectorAll('.close-modal, .modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeLeadModal);
    });
    
    // Fechar modal clicando fora
    leadModal.addEventListener('click', function(e) {
        if (e.target === leadModal) {
            closeLeadModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && leadModal.style.display === 'flex') {
            closeLeadModal();
        }
    });
    
    // Formulário de leads
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', handleLeadSubmission);
    }
}

// Abrir modal de leads
function openLeadModal() {
    if (leadModal) {
        leadModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro campo
        const firstInput = leadModal.querySelector('input[type="text"], input[type="email"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Fechar modal de leads
function closeLeadModal() {
    if (leadModal) {
        leadModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Limpar formulário
        const form = leadModal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Processar envio do formulário de leads
async function handleLeadSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Coletar dados do formulário
    const formData = new FormData(form);
    const leadData = {
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        whatsapp: formData.get('whatsapp')?.trim(),
        consent: formData.get('consent') === 'on'
    };
    
    // Validações
    if (!leadData.name || leadData.name.length < 2) {
        showMessage('Por favor, digite seu nome completo.', 'error');
        return;
    }
    
    if (!leadData.email || !isValidEmail(leadData.email)) {
        showMessage('Por favor, digite um e-mail válido.', 'error');
        return;
    }
    
    if (!leadData.whatsapp || leadData.whatsapp.length < 10) {
        showMessage('Por favor, digite um WhatsApp válido.', 'error');
        return;
    }
    
    if (!leadData.consent) {
        showMessage('Você precisa concordar em receber informações.', 'error');
        return;
    }
    
    // Mostrar loading
    submitButton.textContent = 'Processando...';
    submitButton.disabled = true;
    
    try {
        // Tentar enviar para backend (se configurado)
        const success = await submitLead(leadData);
        
        if (success) {
            showMessage('Cadastro realizado com sucesso!', 'success');
            
            // Aguardar um pouco e redirecionar
            setTimeout(() => {
                redirectToKiwify(leadData);
            }, 2000);
        } else {
            // Se backend não estiver disponível, redirecionar diretamente
            showMessage('Redirecionando para finalizar inscrição...', 'info');
            setTimeout(() => {
                redirectToKiwify(leadData);
            }, 1500);
        }
        
    } catch (error) {
        console.error('Erro no envio:', error);
        
        // Em caso de erro, redirecionar diretamente para Kiwify
        showMessage('Redirecionando para finalizar inscrição...', 'info');
        setTimeout(() => {
            redirectToKiwify(leadData);
        }, 1500);
    }
    
    // Restaurar botão
    submitButton.textContent = originalText;
    submitButton.disabled = false;
}

// Enviar lead para backend (opcional)
async function submitLead(leadData) {
    try {
        const response = await fetch(CONFIG.EMAIL_BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...leadData,
                source: 'Landing Page - Imersão Instagram',
                ...CONFIG.UTM_PARAMS
            })
        });
        
        return response.ok;
    } catch (error) {
        console.warn('Backend não disponível:', error);
        return false;
    }
}

// Redirecionar para Kiwify com dados pré-preenchidos
function redirectToKiwify(leadData) {
    const params = new URLSearchParams({
        name: leadData.name,
        email: leadData.email,
        whatsapp: leadData.whatsapp,
        ...CONFIG.UTM_PARAMS
    });
    
    const kiwifyUrl = `${CONFIG.KIWIFY_PAYMENT_URL}?${params.toString()}`;
    
    // Fechar modal antes de redirecionar
    closeLeadModal();
    
    // Redirecionar
    // window.location.href = kiwifyUrl;
    openLeadModal();

}

// Validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar mensagem para o usuário
function showMessage(message, type = 'info') {
    // Remover mensagem anterior
    const existingMessage = document.querySelector('.lead-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `lead-message lead-message-${type}`;
    messageDiv.textContent = message;
    
    // Estilos da mensagem
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Cores por tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    messageDiv.style.backgroundColor = colors[type] || colors.info;
    
    // Adicionar ao DOM
    document.body.appendChild(messageDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Inicializar FAQ
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                
                // Fechar todos os outros
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Abrir/fechar o atual
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Inicializar scroll suave
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Inicializar animações de scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos com animação
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .scale-in');
    animatedElements.forEach(el => observer.observe(el));
}

// Tracking de CTAs
function initCTATracking() {
    const ctaButtons = document.querySelectorAll('.cta-button, .cta-button-green, .hero-cta');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackCTAClick(this);
        });
    });
}

// Rastrear clique em CTA
function trackCTAClick(button) {
    const ctaText = button.textContent.trim();
    const ctaPosition = button.closest('section')?.className || 'unknown';
    
    console.log('CTA Clicked:', {
        text: ctaText,
        position: ctaPosition,
        timestamp: new Date().toISOString()
    });
    
    // Aqui você pode integrar com Google Analytics, Facebook Pixel, etc.
    // Exemplo Google Analytics:
    // gtag('event', 'cta_click', {
    //     'cta_text': ctaText,
    //     'cta_position': ctaPosition
    // });
}

// Máscara para WhatsApp
function initWhatsAppMask() {
    const whatsappInputs = document.querySelectorAll('input[name="whatsapp"]');
    
    whatsappInputs.forEach(input => {
        input.addEventListener('input', function(e) {
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
    });
}

// Inicializar botão WhatsApp
function initWhatsAppButton() {
    const whatsappButtons = document.querySelectorAll('.whatsapp-button, .whatsapp-float');
    
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const message = encodeURIComponent(CONFIG.WHATSAPP_MESSAGE);
            const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
            
            window.open(whatsappUrl, '_blank');
            
            // Tracking
            console.log('WhatsApp button clicked');
        });
    });
}

// Utilitários
const Utils = {
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Detectar dispositivo móvel
    isMobile: function() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
};

// Exportar para uso global (se necessário)
window.LandingPageImersao = {
    openLeadModal,
    closeLeadModal,
    Utils
};

