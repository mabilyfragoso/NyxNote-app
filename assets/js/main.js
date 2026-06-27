
import { supabase } from '/config/config.js';
import { protectRoute, secureLogout } from '/config/auth-guard.js';

// Elemento para exibir mensagens globais
const messageBox = document.getElementById('messageBox');
let messageTimeout;

// Função para exibir mensagens
function showMessage(msg, tipo = 'success') {
    clearTimeout(messageTimeout);
    if (messageBox) {
        messageBox.textContent = msg;
        messageBox.style.display = 'block';
        messageBox.style.color = tipo === 'error' ? 'red' : 'green';
        messageBox.style.backgroundColor = tipo === 'error' ? '#ffe0e0' : '#e0ffe0';
        messageBox.style.border = `1px solid ${tipo === 'error' ? 'red' : 'green'}`;
    } else {
        alert(`[GLOBAL] ${msg}`);
    }
    messageTimeout = setTimeout(() => {
        if (messageBox) {
            messageBox.style.display = 'none';
            messageBox.textContent = '';
            messageBox.style.backgroundColor = '';
        }
    }, 4000);
}

// Elemento para mensagens no cadastro
const cadastroMessageBox = document.getElementById('cadastroMessageBox');
let cadastroMessageTimeout;

function showCadastroMessage(msg, tipo = 'success') {
    clearTimeout(cadastroMessageTimeout);
    if (cadastroMessageBox) {
        cadastroMessageBox.textContent = msg;
        cadastroMessageBox.style.display = 'block';
        cadastroMessageBox.style.color = tipo === 'error' ? 'red' : 'green';
        cadastroMessageBox.style.backgroundColor = tipo === 'error' ? '#ffe0e0' : '#e0ffe0';
        cadastroMessageBox.style.border = `1px solid ${tipo === 'error' ? 'red' : 'green'}`;
    } else {
        showMessage(msg, tipo);
    }
    cadastroMessageTimeout = setTimeout(() => {
        if (cadastroMessageBox) {
            cadastroMessageBox.style.display = 'none';
            cadastroMessageBox.textContent = '';
            cadastroMessageBox.style.backgroundColor = '';
        }
    }, 5000);
}

// Tratamento do formulário de login
const loginForm = document.getElementById('loginform');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.loginEmail.value.trim();
        const password = loginForm.loginPassword.value.trim();

        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                showMessage('Email ou senha inválidos.', 'error');
                console.error(error);
            } else {
                showMessage('Login realizado com sucesso!');
                loginForm.reset();

                // Impede voltar para a página de login
                history.replaceState(null, '', '/pages/app.html');
                setTimeout(() => {
                    window.location.replace('/pages/app.html');
                }, 1000);
            }
        } catch (err) {
            console.error(err);
            showMessage('Erro inesperado ao tentar logar.', 'error');
        }
    });
}

// Tratamento do formulário de cadastro
const cadastroForm = document.getElementById('cadastroform');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = cadastroForm.cadastroNome.value.trim();
        const email = cadastroForm.cadastroEmail.value.trim();
        const password = cadastroForm.cadastroSenha.value.trim();

        if (!username || !email || !password) {
            showCadastroMessage('Por favor, preencha todos os campos do cadastro.', 'error');
            return;
        }

        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            });

            if (signUpError) {
                showCadastroMessage('Erro ao cadastrar: ' + signUpError.message, 'error');
                return;
            }

            const userId = authData?.user?.id;
            if (!userId) {
                showCadastroMessage('Erro ao obter ID do usuário.', 'error');
                return;
            }

            const { error: insertError } = await supabase.from('usuarios').insert([
                {
                    id: userId,
                    username,
                    email
                }
            ]);

            if (insertError) {
                showCadastroMessage('Erro ao salvar dados do usuário: ' + insertError.message, 'error');
                return;
            }

            showCadastroMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
            cadastroForm.reset();

        } catch (err) {
            console.error(err);
            showCadastroMessage('Erro inesperado ao tentar cadastrar.', 'error');
        }
    });
}

// Tratamento de recuperação de senha
const esqueceuSenhaForm = document.getElementById('esqueceusenhaForm');
const esqueceuSenhaBox = document.getElementById('esqueceusenhabox');

if (esqueceuSenhaForm) {
    esqueceuSenhaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = esqueceuSenhaForm.resetEmail.value.trim();

        if (!email) {
            esqueceuSenhaBox.textContent = 'Informe um e-mail válido.';
            esqueceuSenhaBox.style.color = 'red';
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/pages/reset-password.html`
            });

            if (error) {
                console.error(error);
                esqueceuSenhaBox.textContent = 'Erro ao enviar link: ' + error.message;
                esqueceuSenhaBox.style.color = 'red';
            } else {
                esqueceuSenhaBox.textContent = 'Enviamos um link de redefinição para seu e-mail.';
                esqueceuSenhaBox.style.color = 'green';
                esqueceuSenhaForm.reset();
            }
        } catch (err) {
            console.error(err);
            esqueceuSenhaBox.textContent = 'Erro inesperado ao solicitar redefinição.';
            esqueceuSenhaBox.style.color = 'red';
        }

        esqueceuSenhaBox.style.display = 'block';
        setTimeout(() => {
            esqueceuSenhaBox.style.display = 'none';
        }, 5000);
    });
}

// Carrega cronograma do usuário autenticado
async function carregarCronograma() {
    const tabela = document.getElementById('tabelacronograma');
    if (!tabela) return;

    tabela.innerHTML = '';

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        showMessage('Erro ao verificar sessão do usuário.', 'error');
        return;
    }

    const user = sessionData?.session?.user;
    if (!user) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="2">Faça login para ver seu cronograma.</td>`;
        tabela.appendChild(row);
        return;
    }

    try {
        const { carregarCronogramaCompleto } = await import('/assets/js/database.js');
        const cronogramaSalvo = await carregarCronogramaCompleto();
        
        if (!cronogramaSalvo) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7">Nenhum cronograma encontrado. Crie um usando o botão "Formulário".</td>`;
            tabela.appendChild(row);
            return;
        }

        // Renderiza o cronograma salvo
        renderizarCronogramaSalvo(cronogramaSalvo.cronograma, tabela);
        
    } catch (err) {
        console.error(err);
        showMessage('Erro ao carregar cronograma.', 'error');
    }
}

function renderizarCronogramaSalvo(cronograma, tabela) {
    if (!cronograma || cronograma.length === 0) return;
    
    // Cria o cabeçalho
    const thead = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");
    linhaCabecalho.innerHTML = `<th>Horários</th><th>Domingo</th><th>Segunda</th><th>Terça</th><th>Quarta</th><th>Quinta</th><th>Sexta</th><th>Sábado</th>`;
    thead.appendChild(linhaCabecalho);
    tabela.appendChild(thead);

    // Cria o corpo da tabela
    const tbody = document.createElement("tbody");
    cronograma.forEach(linha => {
        const tr = document.createElement("tr");
        tr.innerHTML = linha;
        tbody.appendChild(tr);
    });
    tabela.appendChild(tbody);
}

// Carrega os eventos do calendário
async function carregarEventosCalendario() {
    const inputData = document.getElementById('data');
    if (!inputData) return;

    inputData.addEventListener('change', async () => {
        const dataSelecionada = inputData.value;
        if (!dataSelecionada) return;

        const { data: session } = await supabase.auth.getSession();
        const user = session?.session?.user;
        if (!user) return;

        try {
            const { data: eventos, error } = await supabase
                .from('eventos')
                .select('*')
                .eq('usuario_id', user.id)
                .eq('data_evento', dataSelecionada);

            if (error) throw error;

            if (eventos.length > 0) {
                const descricoes = eventos.map(e => `• ${e.descricao}`).join('\n');
                alert(`Eventos do dia:\n${descricoes}`);
            } else {
                alert('Nenhum evento neste dia.');
            }
        } catch (err) {
            console.error(err);
            showMessage('Erro ao carregar eventos.', 'error');
        }
    });
}

// Executa assim que a página for carregada
document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação primeiro
    const isAllowed = await protectRoute();
    if (!isAllowed) return;

    let hasLoadedInitialCronograma = false;

    // Observa mudanças de autenticação
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            if (!hasLoadedInitialCronograma || event === 'SIGNED_IN') {
                carregarCronograma();
                hasLoadedInitialCronograma = true;
            }
        } else {
            const tabela = document.getElementById('tabelacronograma');
            if (tabela) tabela.innerHTML = '<td colspan="2">Faça login para ver seu cronograma.</td>';
            hasLoadedInitialCronograma = false;
        }
    });

    // Inicializa carregamento de eventos no calendário
    carregarEventosCalendario();
    
    // Configura logout seguro nos botões de sair
    const logoutButtons = document.querySelectorAll('a[href="index.html"], a[href="/pages/index.html"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            await secureLogout();
        });
    });
});
