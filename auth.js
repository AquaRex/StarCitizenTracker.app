
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const button = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const messageDiv = document.getElementById('formMessage');
    
    hideMessage(messageDiv);
    
    if (!username || !password) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    // Disable button and show loading
    setButtonLoading(button, true);
    
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token instead of password
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userId', data.userId);
            sessionStorage.setItem('inGameName', data.inGameName || username);
            
            showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
            
            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            // Check if verification is required
            if (data.requiresVerification) {
                showMessage(messageDiv, data.message || 'Please verify your email before logging in.', 'error');
                // Show resend link after a delay
                setTimeout(() => {
                    const resendLink = document.createElement('a');
                    resendLink.href = 'verify.html';
                    resendLink.textContent = 'Resend verification email';
                    resendLink.style.color = '#00ff41';
                    resendLink.style.display = 'block';
                    resendLink.style.marginTop = '10px';
                    messageDiv.appendChild(resendLink);
                }, 1000);
            } else {
                showMessage(messageDiv, data.message || 'Login failed. Please check your credentials.', 'error');
            }
            setButtonLoading(button, false);
        }
        
    } catch (error) {
        showMessage(messageDiv, 'Network error. Please try again.', 'error');
        setButtonLoading(button, false);
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const inGameName = document.getElementById('inGameName').value.trim();
    const email = document.getElementById('email').value.trim();
    const button = document.getElementById('registerButton');
    const buttonText = document.getElementById('buttonText');
    const messageDiv = document.getElementById('formMessage');
    
    // Clear previous messages
    hideMessage(messageDiv);
    
    // Validate input
    if (!username || !password || !confirmPassword || !inGameName || !email) {
        showMessage(messageDiv, 'Please fill in all required fields', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage(messageDiv, 'Please enter a valid email address', 'error');
        return;
    }
    
    if (username.length < 3) {
        showMessage(messageDiv, 'Username must be at least 3 characters', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage(messageDiv, 'Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }
    
    // Disable button and show loading
    setButtonLoading(button, true);
    
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                inGameName: inGameName,
                email: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message with verification notice
            showMessage(messageDiv, 'Registration successful! Please check your email to verify your account before logging in.', 'success');
            
            // Clear form
            document.getElementById('registerForm').reset();
            
            // Don't redirect - let user see the message and check their email
            // They will click the link in their email to verify
            
        } else {
            // Show error message from API
            showMessage(messageDiv, data.message || 'Registration failed. Please try again.', 'error');
            setButtonLoading(button, false);
        }
        
    } catch (error) {
        showMessage(messageDiv, 'Network error. Please try again.', 'error');
        setButtonLoading(button, false);
    }
}

// Show message
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = 'form-message show ' + type;
}

// Hide message
function hideMessage(element) {
    element.className = 'form-message';
    element.textContent = '';
}

// Set button loading state
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// Password strength checker (optional)
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    
    return strength;
}

// Optional: Add real-time password strength indicator
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    
    if (passwordInput && window.location.pathname.includes('register')) {
        passwordInput.addEventListener('input', (e) => {
            const strength = checkPasswordStrength(e.target.value);
            // You can add visual feedback here if desired
        });
    }
});
