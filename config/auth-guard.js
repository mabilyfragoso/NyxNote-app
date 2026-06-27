import { supabase } from './config.js';

// Verifica se o usuário está autenticado
export async function checkAuthentication() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            return false;
        }
        
        return !!session?.user;
    } catch (err) {
        console.error('Erro na verificação de autenticação:', err);
        return false;
    }
}

// Protege páginas que requerem autenticação
export async function protectRoute() {
    const isAuthenticated = await checkAuthentication();
    const currentPage = window.location.pathname;
    
    // Páginas que não precisam de autenticação
    const publicPages = ['/', '/index.html', '/pages/index.html'];
    const isPublicPage = publicPages.some(page => 
        currentPage === page || currentPage.endsWith(page)
    );
    
    if (!isAuthenticated && !isPublicPage) {
        // Impede voltar com o botão do navegador
        history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', function(event) {
            history.pushState(null, '', window.location.href);
        });
        
        // Redireciona para login
        window.location.replace('/pages/index.html');
        return false;
    }
    
    if (isAuthenticated && isPublicPage) {
        // Se já está logado, vai direto para o app
        window.location.replace('/pages/app.html');
        return false;
    }
    
    return true;
}

// Logout seguro
export async function secureLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Erro no logout:', error);
        }
        
        // Limpa dados locais
        localStorage.clear();
        sessionStorage.clear();
        
        // Impede voltar
        history.pushState(null, '', '/pages/index.html');
        window.location.replace('/pages/index.html');
        
    } catch (err) {
        console.error('Erro no logout:', err);
    }
}