document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const roleScreen = document.getElementById('roleScreen');
    const registerScreen = document.getElementById('registerScreen');
    const continueBtn = document.getElementById('continueBtn');
    const backBtn = document.getElementById('backBtn');
    const roleOptions = document.querySelectorAll('.role-option');
    const registrationForm = document.getElementById('registrationForm');
    const roleSelect = document.getElementById('role');
    
    let selectedRole = 'Storyteller'; // Default selected role
    
    // Role selection functionality
    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            roleOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.querySelector('.radio-button').classList.remove('checked');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            this.querySelector('.radio-button').classList.add('checked');
            
            // Update selected role
            selectedRole = this.dataset.role;
            
            // Add a nice animation effect
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Continue button functionality
    continueBtn.addEventListener('click', function() {
        // Add transition animation
        roleScreen.style.transform = 'translateX(-100%)';
        roleScreen.style.opacity = '0';
        
        setTimeout(() => {
            roleScreen.classList.add('hidden');
            registerScreen.classList.remove('hidden');
            
            // Set the selected role in the form
            roleSelect.value = selectedRole;
            
            // Reset positioning
            roleScreen.style.transform = 'translateX(0)';
            roleScreen.style.opacity = '1';
            
            // Add entrance animation to registration screen
            registerScreen.style.transform = 'translateX(100%)';
            registerScreen.style.opacity = '0';
            
            setTimeout(() => {
                registerScreen.style.transform = 'translateX(0)';
                registerScreen.style.opacity = '1';
            }, 50);
        }, 300);
    });
    
    // Back button functionality
    backBtn.addEventListener('click', function() {
        // Add transition animation
        registerScreen.style.transform = 'translateX(100%)';
        registerScreen.style.opacity = '0';
        
        setTimeout(() => {
            registerScreen.classList.add('hidden');
            roleScreen.classList.remove('hidden');
            
            // Reset positioning
            registerScreen.style.transform = 'translateX(0)';
            registerScreen.style.opacity = '1';
            
            // Add entrance animation to role screen
            roleScreen.style.transform = 'translateX(-100%)';
            roleScreen.style.opacity = '0';
            
            setTimeout(() => {
                roleScreen.style.transform = 'translateX(0)';
                roleScreen.style.opacity = '1';
            }, 50);
        }, 300);
    });
    
    // Form submission handling
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const userData = {
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
            role: formData.get('role')
        };
        
        // Add loading state to button
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        // Simulate account creation (replace with actual API call)
        setTimeout(() => {
            console.log('Account created:', userData);
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            this.reset();
            roleSelect.value = selectedRole;
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
    
    // Success message function
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✓</div>
                <h3>Account Created Successfully!</h3>
                <p>Welcome to the Creative Team</p>
            </div>
        `;
        
        // Add styles
        successDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .success-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                color: white;
                max-width: 300px;
                animation: slideInUp 0.3s ease-out;
            }
            
            @keyframes slideInUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .success-icon {
                font-size: 48px;
                color: #4ade80;
                margin-bottom: 20px;
            }
            
            .success-content h3 {
                font-size: 24px;
                margin-bottom: 10px;
                color: #4ade80;
            }
            
            .success-content p {
                color: #9ca3af;
                font-size: 16px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(successDiv);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            successDiv.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(successDiv);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
    
    // Form validation
    function validateForm() {
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return false;
        }
        
        // Username validation
        if (username.length < 3) {
            showError('Username must be at least 3 characters long');
            return false;
        }
        
        // Password validation
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return false;
        }
        
        return true;
    }
    
    // Error message function
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideInDown 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 3000);
    }
    
    // Add form validation to submit event
    registrationForm.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return;
        }
    });
    
    // Add smooth transitions for all interactive elements
    document.querySelectorAll('input, select, button').forEach(element => {
        element.addEventListener('focus', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add touch feedback for mobile
    document.querySelectorAll('.role-option, .create-account-btn').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
});