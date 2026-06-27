import {
    salvarCronogramaCompleto,
    carregarCronogramaCompleto,
    salvarTarefa,
    carregarTarefas,
    atualizarTarefaColuna,
    excluirTarefa
} from './database.js';

document.addEventListener('DOMContentLoaded', () => {

    // 🔲 MODAIS GENÉRICOS
    function setupModal(openButtonId, closeButtonId, modalId) {
        const openButton = document.getElementById(openButtonId);
        const closeButton = document.getElementById(closeButtonId);
        const modal = document.getElementById(modalId);

        // Adicione logs para verificar se os elementos são encontrados
        console.log(`Configurando modal: ${modalId}`);
        console.log(`Botão abrir (${openButtonId}):`, openButton);
        console.log(`Botão fechar (${closeButtonId}):`, closeButton);
        console.log(`Modal (${modalId}):`, modal);

        if (openButton && closeButton && modal) {
            openButton.addEventListener("click", () => {
                modal.style.display = "flex";
                console.log(`Abrindo modal: ${modalId}`);
            });
            closeButton.addEventListener("click", () => {
                modal.style.display = "none";
                console.log(`Fechando modal: ${modalId} (botão fechar)`);
            });

            window.addEventListener("click", (event) => {
                if (event.target === modal) {
                    modal.style.display = "none";
                    console.log(`Fechando modal: ${modalId} (clique fora)`);
                }
            });
        } else {
            console.warn(`Um ou mais elementos para o modal ${modalId} não foram encontrados.`);
        }
    }

    // Configuração de todos os modais
    setupModal("abrirModal", "fecharModal", "modalpomodoro");
    setupModal("abrirModal2", "fecharModal2", "modalconfig");
    setupModal("abrirModal3", "fecharModal3", "modalsobre");
    setupModal("abrirmodalforms", "fecharmodalforms", "modalForms");
    setupModal("abrirmodalnotes", "fecharmodalnotes", "modalnotes");

    // 🌗 TEMA DARK/LIGHT
    const themeSelect = document.getElementById('themeSelect');
    const body = document.body;

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        if (themeSelect) themeSelect.value = theme;
    }

    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme || 'light');

    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            const selectedTheme = themeSelect.value;
            applyTheme(selectedTheme);
            localStorage.setItem('theme', selectedTheme);
        });
    }

    // ⏱️ POMODORO
    const timerDisplay = document.getElementById("timer");
    const startButton = document.getElementById("starttimer");
    const pauseButton = document.getElementById("pausetimer");
    const resetButton = document.getElementById("resettimer");
    const statusDisplay = document.getElementById("status");

    let pomodoroduracao = 25 * 60;
    let pausarduracao = 5 * 60;
    let timer = pomodoroduracao;
    let intervalo = null;
    let running = false;
    let onbreak = false;

    if (timerDisplay && startButton && pauseButton && resetButton) {
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function updateDisplay() {
            timerDisplay.textContent = formatTime(timer);
        }

        function starttimer() {
            if (running) return;
            running = true;
            if (statusDisplay) statusDisplay.textContent = onbreak ? "Pausa Ativa" : "Pomodoro Ativo";
            startButton.disabled = true;
            pauseButton.disabled = false;

            intervalo = setInterval(() => {
                timer--;
                updateDisplay();

                if (timer <= 0) {
                    clearInterval(intervalo);
                    running = false;
                    startButton.disabled = false;
                    pauseButton.disabled = true;

                    if (!onbreak) {
                        timer = pausarduracao;
                        onbreak = true;
                        alert("Tempo do Pomodoro finalizado! Hora da pausa.");
                    } else {
                        timer = pomodoroduracao;
                        onbreak = false;
                        alert("Tempo da pausa finalizado! Hora de Focar!");
                    }

                    updateDisplay();
                    if (statusDisplay) statusDisplay.textContent = onbreak ? "Pausa Ativa" : "Pomodoro Ativo";
                }
            }, 1000);
        }

        function resetTimer() {
            clearInterval(intervalo);
            running = false;
            timer = pomodoroduracao;
            onbreak = false;
            updateDisplay();
            pauseButton.disabled = true;
            startButton.disabled = false;
            if (statusDisplay) statusDisplay.textContent = "Pronto para Iniciar";
        }

        function pausetimer() {
            if (!running) return;
            clearInterval(intervalo);
            running = false;
            startButton.disabled = false;
            pauseButton.disabled = true;
            if (statusDisplay) statusDisplay.textContent = "Pomodoro Pausado";
        }

        startButton.addEventListener("click", starttimer);
        pauseButton.addEventListener("click", pausetimer);
        resetButton.addEventListener("click", resetTimer);
        updateDisplay();
    }

    // 📚 GERENCIAMENTO DE MATÉRIAS
    const containerMaterias = document.querySelector(".materias-container");
    const addMateriaBtn = document.getElementById("addMateria");

    if (containerMaterias && addMateriaBtn) {
        addMateriaBtn.addEventListener("click", () => {
            const novaMateria = document.createElement("div");
            novaMateria.classList.add("materia-item");

            novaMateria.innerHTML = `
                <input type="text" name="nomeMateria" placeholder="Nome da Matéria" required>
                <select name="prioridade">
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                </select>
                <input type="color" name="cor" value="#ac69f5">
                <button type="button" class="remove-materia-btn">X</button>
            `;
            containerMaterias.appendChild(novaMateria);

            novaMateria.querySelector('.remove-materia-btn').addEventListener('click', (e) => {
                e.target.closest('.materia-item').remove();
            });
        });
    }

    // 📅 GERADOR DE CRONOGRAMA COM SALVAMENTO
    const formCronograma = document.getElementById("form-cronograma");
    const horasDiaInput = document.getElementById("horas-dia");
    const tabelaCronograma = document.getElementById("tabelacronograma");

    if (formCronograma && horasDiaInput && tabelaCronograma) {
        formCronograma.addEventListener("submit", async (event) => {
            event.preventDefault();

            const horaspordia = parseInt(horasDiaInput.value);
            tabelaCronograma.innerHTML = "";

            const materias = Array.from(document.querySelectorAll(".materia-item")).map(item => ({
                nome: item.querySelector("input[name=nomeMateria]").value,
                prioridade: item.querySelector("select[name=prioridade]").value,
                cor: item.querySelector("input[name=cor]").value
            }));

            if (materias.length === 0 || isNaN(horaspordia) || horaspordia <= 0) {
                alert("Preencha todas as matérias e informe um número de horas válido.");
                return;
            }

            const prioridadepeso = { alta: 3, media: 2, baixa: 1 };
            materias.sort((a, b) => prioridadepeso[b.prioridade] - prioridadepeso[a.prioridade]);

            const diassemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

            const thead = document.createElement("thead");
            const linhaCabecalho = document.createElement("tr");
            linhaCabecalho.innerHTML = `<th>Horários</th>` + diassemana.map(dia => `<th>${dia}</th>`).join("");
            thead.appendChild(linhaCabecalho);
            tabelaCronograma.appendChild(thead);

            const tbody = document.createElement("tbody");
            const cronogramaSalvo = [];
            let horaatual = 8;

            for (let i = 0; i < horaspordia; i++) {
                const linha = document.createElement("tr");
                const colunahora = document.createElement("td");
                colunahora.textContent = `${horaatual}:00 - ${horaatual + 1}:00`;
                linha.appendChild(colunahora);

                let linhaHTML = `<td>${horaatual}:00 - ${horaatual + 1}:00</td>`;

                for (let d = 0; d < 7; d++) {
                    const cell = document.createElement("td");
                    const materia = materias[(i * 7 + d) % materias.length];
                    cell.textContent = materia.nome;
                    cell.style.backgroundColor = materia.cor;
                    cell.style.color = "#fff";
                    cell.style.fontWeight = "bold";
                    linha.appendChild(cell);

                    linhaHTML += `<td style="background-color: ${materia.cor}; color: #fff; font-weight: bold;">${materia.nome}</td>`;
                }

                cronogramaSalvo.push(linhaHTML);
                horaatual++;
                tbody.appendChild(linha);
            }

            tabelaCronograma.appendChild(tbody);

            // Salva no Supabase
            try {
                await salvarCronogramaCompleto({
                    horasDisponiveis: horaspordia,
                    materias: materias,
                    cronograma: cronogramaSalvo
                });

                alert('Cronograma salvo com sucesso!');

                // Fecha o modal após salvar
                const modal = document.getElementById("modalForms");
                if (modal) {
                    modal.style.display = "none";
                    console.log("Modal Forms fechado após salvar cronograma.");
                }

            } catch (error) {
                console.error('Erro ao salvar cronograma:', error);
                alert('Erro ao salvar cronograma. Tente novamente.');
            }
        });
    }

    // 📝 QUADRO DE NOTAS (KANBAN) COM SUPABASE
    let tarefasCarregadas = new Map(); // Para controlar IDs das tarefas

    async function adicionarTarefa(colunaId, inputElement) {
        const coluna = document.getElementById(colunaId);
        const texto = inputElement.value.trim();

        if (texto === "") return;

        try {
            // Salva no Supabase
            const tarefaSalva = await salvarTarefa(texto, colunaId);

            // Cria o elemento visual
            const card = document.createElement("div");
            card.id = `task-${tarefaSalva.id}`;
            card.className = "card-task";
            card.draggable = true;
            card.dataset.tarefaId = tarefaSalva.id;

            const p = document.createElement("p");
            p.textContent = texto;
            card.appendChild(p);

            const deleteBtn = document.createElement("span");
            deleteBtn.className = "delete-task-btn";
            deleteBtn.innerHTML = "&times;";
            deleteBtn.addEventListener('click', async () => {
                try {
                    await excluirTarefa(tarefaSalva.id);
                    card.remove();
                    tarefasCarregadas.delete(tarefaSalva.id);
                } catch (error) {
                    console.error('Erro ao excluir tarefa:', error);
                    alert('Erro ao excluir tarefa');
                }
            });

            card.appendChild(deleteBtn);
            adicionarEventosDrag(card);
            coluna.appendChild(card);
            inputElement.value = "";

            tarefasCarregadas.set(tarefaSalva.id, tarefaSalva);

        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            alert('Erro ao adicionar tarefa. Tente novamente.');
        }
    }

    async function carregarTodasTarefas() {
        try {
            const tarefas = await carregarTarefas();

            // Limpa as colunas
            ['afazer', 'progresso', 'concluido'].forEach(coluna => {
                const container = document.getElementById(coluna);
                if (container) container.innerHTML = '';
            });

            tarefasCarregadas.clear();

            // Adiciona as tarefas carregadas
            tarefas.forEach(tarefa => {
                const coluna = document.getElementById(tarefa.coluna);
                if (!coluna) return;

                const card = document.createElement("div");
                card.id = `task-${tarefa.id}`;
                card.className = "card-task";
                card.draggable = true;
                card.dataset.tarefaId = tarefa.id;

                const p = document.createElement("p");
                p.textContent = tarefa.texto;
                card.appendChild(p);

                const deleteBtn = document.createElement("span");
                deleteBtn.className = "delete-task-btn";
                deleteBtn.innerHTML = "&times;";
                deleteBtn.addEventListener('click', async () => {
                    try {
                        await excluirTarefa(tarefa.id);
                        card.remove();
                        tarefasCarregadas.delete(tarefa.id);
                    } catch (error) {
                        console.error('Erro ao excluir tarefa:', error);
                        alert('Erro ao excluir tarefa');
                    }
                });

                card.appendChild(deleteBtn);
                adicionarEventosDrag(card);
                coluna.appendChild(card);

                tarefasCarregadas.set(tarefa.id, tarefa);
            });

        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        }
    }

    function adicionarEventosDrag(element) {
        element.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            e.target.classList.add("dragging");
        });
        element.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
        });
    }

    const addTodoBtn = document.getElementById('add-afazer-btn');
    if (addTodoBtn) {
        addTodoBtn.addEventListener('click', () => {
            const colunaAfazer = document.getElementById('afazer');
            const input = colunaAfazer.parentElement.querySelector('.input-tarefa');
            adicionarTarefa('afazer', input);
        });
    }

    // Configura drag and drop para atualizar no Supabase
    document.querySelectorAll(".card-container").forEach(coluna => {
        coluna.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        coluna.addEventListener("drop", async (e) => {
            e.preventDefault();
            const dragging = document.querySelector(".dragging");
            if (!dragging) return;

            const novaColuna = e.currentTarget.id;
            const tarefaId = parseInt(dragging.dataset.tarefaId);

            if (dragging.parentNode !== e.currentTarget) {
                e.currentTarget.appendChild(dragging);

                // Atualiza no Supabase
                try {
                    await atualizarTarefaColuna(tarefaId, novaColuna);

                    // Atualiza o mapa local
                    const tarefa = tarefasCarregadas.get(tarefaId);
                    if (tarefa) {
                        tarefa.coluna = novaColuna;
                        tarefasCarregadas.set(tarefaId, tarefa);
                    }
                } catch (error) {
                    console.error('Erro ao mover tarefa:', error);
                    // Em caso de erro, reverte a mudança visual
                    alert('Erro ao mover tarefa. Recarregando...');
                    carregarTodasTarefas();
                }
            }
        });
    });

    // Carrega tarefas quando o modal de notas for aberto
    const abrirNotesBtn = document.getElementById('abrirmodalnotes');
    if (abrirNotesBtn) {
        abrirNotesBtn.addEventListener('click', () => {
            // Pequeno delay para garantir que o modal abriu (pode ser ajustado ou removido se não for necessário)
            setTimeout(carregarTodasTarefas, 50);
        });
    }

    // 📆 CALENDÁRIO DE EVENTOS
    function criarDataLocal(dataString) {
        const parts = dataString.split('-').map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    const currentMonthYear = document.getElementById("currentMonthYear");
    const diasDoMes = document.getElementById("diasDoMes");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const dataInput = document.getElementById("data");
    const nomeEventoInput = document.getElementById("nomeEventoInput");
    const criarEventoBtn = document.getElementById("criarEvento");
    const eventosDoDiaDiv = document.getElementById("eventosDoDia");

    let dataAtual = new Date();
    let eventos = JSON.parse(localStorage.getItem('eventosCalendario')) || {};

    function renderizarCalendario() {
        if (!diasDoMes || !currentMonthYear) return;

        diasDoMes.innerHTML = "";

        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();

        currentMonthYear.textContent = new Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
        }).format(dataAtual).toUpperCase();

        const primeiroDiaMes = new Date(ano, mes, 1);
        const ultimoDiaMes = new Date(ano, mes + 1, 0);
        const numDiasMes = ultimoDiaMes.getDate();
        const primeiroDiaSemana = primeiroDiaMes.getDay();

        for (let i = 0; i < primeiroDiaSemana; i++) {
            const diaVazio = document.createElement("div");
            diaVazio.classList.add("dia-calendario", "vazio");
            diasDoMes.appendChild(diaVazio);
        }

        for (let dia = 1; dia <= numDiasMes; dia++) {
            const diaElement = document.createElement("div");
            diaElement.classList.add("dia-calendario");
            diaElement.textContent = dia;

            const dataCompletaDia = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            diaElement.dataset.date = dataCompletaDia;

            const hoje = new Date();
            if (
                dia === hoje.getDate() &&
                mes === hoje.getMonth() &&
                ano === hoje.getFullYear()
            ) {
                diaElement.classList.add("hoje");
            }

            if (eventos[dataCompletaDia]?.length > 0) {
                diaElement.style.backgroundColor = eventos[dataCompletaDia][0].cor || "#406b28";
                diaElement.style.color = '#fff';
            }

            diaElement.addEventListener('click', () => {
                document.querySelectorAll('.dia-calendario').forEach(el => el.classList.remove('selecionado'));
                diaElement.classList.add('selecionado');
                if (dataInput) dataInput.value = dataCompletaDia;
                exibirEventosParaDia(dataCompletaDia);
            });

            diasDoMes.appendChild(diaElement);
        }
    }

    prevMonthBtn?.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderizarCalendario();
    });

    nextMonthBtn?.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    });

    criarEventoBtn?.addEventListener('click', () => {
        if (!dataInput || !nomeEventoInput || !eventosDoDiaDiv) return;

        const dataSelecionada = dataInput.value;
        const nomeEvento = nomeEventoInput.value.trim();
        const corEvento = "#ffd000e5";

        if (!dataSelecionada || !nomeEvento) {
            alert("Por favor, selecione uma data e digite o nome do evento.");
            return;
        }

        if (!eventos[dataSelecionada]) {
            eventos[dataSelecionada] = [];
        }
        eventos[dataSelecionada].push({ nome: nomeEvento, cor: corEvento });
        localStorage.setItem('eventosCalendario', JSON.stringify(eventos));

        nomeEventoInput.value = "";
        renderizarCalendario();
        exibirEventosParaDia(dataSelecionada);
    });

    function exibirEventosParaDia(data) {
        if (!eventosDoDiaDiv) return;

        eventosDoDiaDiv.innerHTML = "";

        if (eventos[data]?.length > 0) {
            const titulo = document.createElement("h5");
            titulo.textContent = `Eventos de ${criarDataLocal(data).toLocaleDateString('pt-BR')}:`;
            titulo.style.color = 'white';
            eventosDoDiaDiv.appendChild(titulo);

            eventos[data].forEach((eventoObj, index) => {
                const p = document.createElement("p");
                p.textContent = `• ${eventoObj.nome}`;
                p.style.color = eventoObj.cor || "#fff";
                p.style.fontWeight = 'bold';

                const btnExcluir = document.createElement("span");
                btnExcluir.innerHTML = ' ×';
                btnExcluir.style.cursor = 'pointer';
                btnExcluir.style.marginLeft = '10px';
                btnExcluir.style.color = 'red';
                btnExcluir.style.fontWeight = 'bold';
                btnExcluir.title = "Excluir evento";
                btnExcluir.addEventListener('click', () => {
                    eventos[data].splice(index, 1);
                    if (eventos[data].length === 0) {
                        delete eventos[data];
                    }
                    localStorage.setItem('eventosCalendario', JSON.stringify(eventos));
                    exibirEventosParaDia(data);
                    renderizarCalendario();
                });

                p.appendChild(btnExcluir);
                eventosDoDiaDiv.appendChild(p);
            });
        } else {
            eventosDoDiaDiv.textContent = "Nenhum evento para esta data.";
            eventosDoDiaDiv.style.color = 'white';
        }
    }

    renderizarCalendario();
});