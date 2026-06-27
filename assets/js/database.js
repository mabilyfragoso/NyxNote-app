
import { supabase } from '/config/config.js';

// ============= CRONOGRAMAS =============
export async function salvarCronogramaCompleto(cronogramData) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabase
            .from('cronogramas_completos')
            .upsert([
                {
                    usuario_id: session.user.id,
                    horas_disponivel: cronogramData.horasDisponiveis,
                    materias: JSON.stringify(cronogramData.materias),
                    cronograma_gerado: JSON.stringify(cronogramData.cronograma),
                    updated_at: new Date().toISOString()
                }
            ], {
                onConflict: 'usuario_id'
            });
            
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao salvar cronograma:', err);
        throw err;
    }
}

export async function carregarCronogramaCompleto() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabase
            .from('cronogramas_completos')
            .select('*')
            .eq('usuario_id', session.user.id)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = não encontrado
        
        if (data) {
            return {
                horasDisponiveis: data.horas_disponivel,
                materias: JSON.parse(data.materias || '[]'),
                cronograma: JSON.parse(data.cronograma_gerado || '[]')
            };
        }
        
        return null;
    } catch (err) {
        console.error('Erro ao carregar cronograma:', err);
        return null;
    }
}

// ============= TAREFAS KANBAN =============
export async function salvarTarefa(texto, coluna) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabase
            .from('tarefas_kanban')
            .insert([
                {
                    usuario_id: session.user.id,
                    texto: texto,
                    coluna: coluna,
                    ordem: Date.now()
                }
            ])
            .select();
            
        if (error) throw error;
        return data[0];
    } catch (err) {
        console.error('Erro ao salvar tarefa:', err);
        throw err;
    }
}

export async function carregarTarefas() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabase
            .from('tarefas_kanban')
            .select('*')
            .eq('usuario_id', session.user.id)
            .order('ordem', { ascending: true });
            
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
        return [];
    }
}

export async function atualizarTarefaColuna(tarefaId, novaColuna) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabase
            .from('tarefas_kanban')
            .update({ coluna: novaColuna })
            .eq('id', tarefaId)
            .eq('usuario_id', session.user.id);
            
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao atualizar tarefa:', err);
        throw err;
    }
}

export async function excluirTarefa(tarefaId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Usuário não autenticado');
        
        const { data, error } = await supabase
            .from('tarefas_kanban')
            .delete()
            .eq('id', tarefaId)
            .eq('usuario_id', session.user.id);
            
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        throw err;
    }
}




