# 🛠️ Mantix CMMS — Sistema Modular de Gestão e Controle de Manutenção

> **Solução completa, moderna e modular para Gestão de Ativos, Ordens de Serviço (O.S.), Preventivas, Almoxarifado e Indicadores Industriais — com persistência 100% no navegador (Offline-First).**

---

## 📌 Visão Geral

O **Mantix CMMS** (*Computerized Maintenance Management System*) é um software desenvolvido para simplificar, organizar e elevar o nível de confiabilidade do setor de manutenção em indústrias, fábricas, frotas, instalações comerciais e gestão predial.

Com uma interface moderna, intuitiva e sem complexidades desnecessárias, a aplicação permite que técnicos, operadores e gestores de manutenção (PCM) registrem ocorrências, acompanhem ordens de serviço em tempo real e controlem seus equipamentos e peças sobressalentes.

---

## 🔒 Destaque: Seus Dados Gravados no Navegador (Offline-First)

Um dos maiores diferenciais do **Mantix CMMS** é que ele **não exige instalação de servidores complicados nem banco de dados na nuvem para funcionar**:

- 💻 **Armazenamento 100% Local**: Todos os seus ativos, ordens de serviço, técnicos, peças e planos são salvos no armazenamento interno do seu próprio navegador (`localStorage`).
- 🔄 **Persistência Total**: Você pode fechar o navegador, reiniciar o computador ou atualizar a página (`F5`), e todos os seus dados permanecerão gravados exatamente de onde parou.
- 🛡️ **Privacidade & Segurança**: As informações da sua fábrica não saem da sua máquina.
- 📦 **Backup & Restauração Descomplicados**: Com um clique você exporta um arquivo `.json` com todos os dados do sistema para guardar no seu computador ou transferir para outro colega.

---

## 🚀 Módulos do Sistema

O sistema foi concebido com uma **arquitetura modular**, onde cada módulo tem um propósito claro e se integra perfeitamente aos demais:

### 1. 📊 Painel Geral & Indicadores de Manutenção (Dashboard)
- **Disponibilidade Geral da Planta (%)**: Cálculo em tempo real com base no estado operacional dos equipamentos.
- **MTBF (Tempo Médio Entre Falhas)**: Métrica de confiabilidade baseada em horas operacionais e histórico de corretivas.
- **MTTR (Tempo Médio para Reparo)**: Indicador de eficiência da equipe no restabelecimento de máquinas paradas.
- **Mix de Manutenção**: Gráfico de distribuição percentual entre Manutenções Preventivas, Corretivas, Preditivas e de Melhoria.
- **Custo Total Acumulado**: Somatório automático do custo de homens-hora (H/H) de técnicos e valor das peças aplicadas.
- **Alertas Prioritários**: Notificação imediata de manutenções preventivas com vencimento nos próximos 7 dias e itens abaixo do estoque mínimo.

### 2. 📋 Ordens de Serviço (O.S.)
- **Visualização Flexível**: Alterne entre o **Quadro Kanban** (Abertas, Em Execução, Aguardando Peças e Concluídas) e a **Tabela Detalhada**.
- **Filtros Rápidos**: Pesquise instantaneamente por código da OS, TAG da máquina, prioridade (Baixa, Média, Alta, Urgente) ou tipo de manutenção.
- **Checklist Interativo**: Marque etapas concluídas com registro de horário e foco em segurança (bloqueio LOTO, NR-10 e NR-12).
- **Baixa Automática no Estoque**: Ao vincular uma peça usada à OS, a quantidade consumida é deduzida automaticamente do almoxarifado.
- **Relatório de Causa Raiz**: Espaço dedicado para apontar diagnóstico da falha e ações corretivas realizadas.
- **Impressão Formatada**: Botão **Imprimir O.S.** que gera uma ficha técnica limpa e padronizada para levar a campo, com campos formais para assinatura do técnico e visto de liberação do supervisor.

### 3. ⚙️ Ativos & Máquinas Industriais
- **Cadastro Completo**: TAG única (ex: `COMP-01`, `EST-02`), setor/localização, fabricante, modelo, número de série e data de instalação.
- **Classificação por Criticidade ABC**:
  - *Classe A (Crítico)*: Parada interrompe o fluxo produtivo principal.
  - *Classe B (Importante)*: Parada afeta a capacidade operacional sem cessar tudo.
  - *Classe C (Secundário)*: Equipamentos auxiliares de baixo impacto imediato.
- **Horímetro Acumulado**: Registro de horas de trabalho do equipamento.
- **Prontuário Histórico**: Visualize todas as ordens de serviço já realizadas naquele ativo específico em uma linha do tempo.
- **Abertura Rápida**: Botão `+ Abrir O.S.` direto no cartão da máquina.

### 4. 🗓️ Preventivas & Planos Recorrentes
- **Programação Flexível**: Crie planos com periodicidade baseada em **dias corridos** (ex: a cada 30 dias) ou em **horas de operação/horímetro**.
- **Geração de O.S. em 1 Clique**: Ao chegar a data da preventiva, basta clicar em **Gerar O.S. Imediata** para abrir uma ordem pré-preenchida com todo o roteiro de tarefas já anexado.
- **Roteiro Padrão**: Defina as tarefas obrigatórias que todo técnico deverá checar na intervenção preventiva.

### 5. 📦 Almoxarifado & Peças de Reposição
- **Gestão de Estoque**: Código SKU, descrição, categoria (rolamentos, correias, filtros, lubrificantes, elétrica), localização na prateleira e fornecedor.
- **Estoque Mínimo de Segurança**: Destaque visual em vermelho caso o estoque atinja níveis críticos, evitando máquinas paradas por falta de peças.
- **Ajustes Rápidos**: Botões `+` e `-` para dar entrada ou baixa rápida no inventário físico.
- **Patrimônio Imobilizado**: Resumo do valor total em reais (R$) armazenado no almoxarifado.

### 6. 👷 Equipe Técnica & Especialistas
- **Cadastro de Colaboradores**: Nome, especialidades técnicas (mecânica, elétrica, instrumentação, lubrificação), telefone e e-mail.
- **Status Operacional**: Disponível, Em Campo ou Ausente.
- **Taxa Horária (R$/h)**: Permite o cálculo preciso do custo de mão de obra direta de cada manutenção.

### 7. 🧠 Diagnóstico Inteligente com IA (Gemini)
- **Assistente Técnico Integrado**: Descreva ruídos anormais, vibrações, sobreaquecimento ou códigos de falha e receba uma análise de engenharia.
- **Causas Prováveis (FMEA)**: Avaliação de probabilidade (Alta, Média ou Baixa) e justificativa técnica.
- **Passo a Passo & Segurança**: Recomendações de EPIs, precauções e etapas de investigação.
- **Conversão Direta em O.S.**: Converta a sugestão técnica gerada pela IA diretamente em uma nova Ordem de Serviço com um único clique.
- **Gerador de Roteiro Preventivo**: Crie checklists detalhados para famílias específicas de equipamentos.

### 8. 💾 Armazenamento & Backup
- **Monitor do Navegador**: Acompanhe quantos KB o banco de dados local está ocupando no seu navegador.
- **Exportar Backup (.json)**: Salve um arquivo cópia de segurança em sua máquina.
- **Restaurar Backup (.json)**: Importe backups anteriores a qualquer instante.
- **Restaurar Fábrica**: Recarregue o conjunto de demonstração com compressores, esteiras e dados de exemplo quando quiser explorar o sistema.

---

## 📖 Guia do Usuário: Como Começar

### 1. Criando seu Primeiro Equipamento
1. Acesse o menu lateral **Ativos & Máquinas**.
2. Clique no botão superior direito **+ Novo Ativo**.
3. Preencha a TAG (ex: `BOM-01`), o nome, a criticidade (A, B ou C), o setor onde ele opera e salve.

### 2. Abrindo uma Ordem de Serviço
1. Clique no botão azul **+ Nova O.S.** presente no topo de qualquer tela.
2. Selecione o equipamento e o técnico responsável.
3. Defina o tipo (Corretiva, Preventiva, etc.) e o nível de prioridade.
4. Adicione as tarefas do checklist e as peças que serão utilizadas.
5. Clique em **Criar Ordem de Serviço**.

### 3. Acompanhando e Imprimindo a O.S.
1. No menu **Ordens de Serviço**, veja os cartões no quadro Kanban.
2. Clique no botão **Iniciar** para colocar a ordem em execução.
3. Se precisar levar uma via física impressa para a fábrica, abra a ordem e clique em **Imprimir O.S.** — o documento será formatado automaticamente com campo de assinatura.

### 4. Fazendo Backup dos seus Dados
1. No menu lateral, acesse **Armazenamento & Backup** (ou clique em **Backup Local** na barra superior).
2. Clique em **Baixar Arquivo de Backup (.json)**.
3. Guarde o arquivo em um local seguro (Pen Drive, Google Drive ou sua pasta de documentos).

---

## 🛠️ Tecnologias Utilizadas

- **React 19** & **TypeScript**: Interface reativa, modular e tipada com rigor.
- **Tailwind CSS v4**: Design industrial moderno, limpo, de alto contraste e responsivo.
- **Lucide React**: Ícones técnicos de engenharia e operações.
- **Google GenAI SDK (`@google/genai`)**: Diagnóstico preditivo e gerador de planos técnicos com IA.
- **HTML5 Web Storage (`localStorage`)**: Persistência de dados offline no navegador.
- **Vite**: Build ágil e otimizado para produção.

---

## 💻 Como Rodar o Projeto Localmente

Caso queira clonar e rodar o projeto em sua máquina de desenvolvimento:

```bash
# 1. Clone o repositório
git clone <URL_DO_SEU_REPOSITORIO>

# 2. Acesse a pasta do projeto
cd <NOME_DA_PASTA>

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📤 Como Publicar as Alterações no seu GitHub

Se o seu repositório no GitHub já foi criado, basta executar os seguintes passos no seu terminal:

```bash
# 1. Inicialize o repositório (caso ainda não esteja inicializado)
git init

# 2. Conecte o repositório remoto do seu GitHub (substitua pelo link do seu repositório)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 3. Adicione todos os arquivos criados
git add .

# 4. Crie o commit com uma mensagem descritiva
git commit -m "feat: Sistema de Gestao de Manutencao Mantix CMMS com persistencia local e README completo"

# 5. Envie para o branch principal do seu GitHub
git branch -M main
git push -u origin main
```

---

<p align="center">
  Desenvolvido com foco em excelência operacional, confiabilidade e produtividade para a engenharia de manutenção.
</p>
