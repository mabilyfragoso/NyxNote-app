document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginform');
    const cadastroForm = document.getElementById('cadastroform');
    const loginButton = document.getElementById('loginbutton');
    const criarButton = document.getElementById('criarbutton');
    const formBox = document.querySelector('.formbox');
    const formTitle = formBox.querySelector('h2');

    // Seletores para os links de alternância agora com IDs
    const linkToSignup = document.getElementById('linkToSignup');
    const linkToLogin = document.getElementById('linkToLogin');

    document.querySelectorAll('.password .toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const passwordField = icon.previousElementSibling;
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    window.mostrarform = function (formType) {
        loginForm.classList.remove('active');
        cadastroForm.classList.remove('active');
        loginButton.classList.remove('buttonativo');
        criarButton.classList.remove('buttonativo');

        formBox.classList.remove('cadastro-ativo');

      
        if (linkToSignup) linkToSignup.style.display = 'none';
        if (linkToLogin) linkToLogin.style.display = 'none';

        if (formType === 'login') {
            loginForm.classList.add('active');
            loginButton.classList.add('buttonativo');
            formTitle.textContent = 'Login';
           
            if (linkToSignup) {
                linkToSignup.style.display = 'block';
            }
        } else {
            cadastroForm.classList.add('active');
            criarButton.classList.add('buttonativo');
            formBox.classList.add('cadastro-ativo');
            formTitle.textContent = 'Criar conta';
           
            if (linkToLogin) {
                linkToLogin.style.display = 'block';
            }
        }
    };

    // Listeners para os links de alternância usando os novos IDs
    if (linkToSignup) {
        linkToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarform('criarconta');
        });
    }

    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarform('login');
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = loginForm.querySelector('input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            return;
        }

        console.log('Tentando login com:', { email, password });
    });

    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameInput = cadastroForm.querySelector('input[type="text"]');
        const emailInput = cadastroForm.querySelector('input[type="email"]');
        const passwordInput = cadastroForm.querySelector('.password input[type="password"]');

        const username = usernameInput ? usernameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!username || !email || !password) {
            alert('Por favor, preencha todos os campos do cadastro.');
            return;
        }
        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        console.log('Tentando cadastro com:', { username, email, password });
       
        mostrarform('login');
    });

    mostrarform('login');
});


// ======== ABRIR/FECHAR MODAL ========
const esqueceuSenhaModal = document.getElementById("esqueceusenhamodal");
const fecharEsqueceuSenhaModal = document.getElementById("fecharesqueceusenhamodal");
const esqueceuSenhaForm = document.getElementById("esqueceusenhaForm");
const esqueceuSenhaBox = document.getElementById("esqueceusenhabox");


function abrirEsqueceuSenhaModal() {
    esqueceuSenhaModal.style.display = "flex"; 
}


fecharEsqueceuSenhaModal.addEventListener("click", () => {
    esqueceuSenhaModal.style.display = "none";
    esqueceuSenhaForm.reset();
    esqueceuSenhaBox.style.display = "none";
});


window.addEventListener("click", (event) => {
    if (event.target === esqueceuSenhaModal) {
        esqueceuSenhaModal.style.display = "none";
        esqueceuSenhaForm.reset();
        esqueceuSenhaBox.style.display = "none";
    }
});

const abrirModalBtn = document.getElementById('abrir');
abrirModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    abrirEsqueceuSenhaModal();
});

