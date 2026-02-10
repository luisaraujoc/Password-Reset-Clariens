

# Formulário de Confirmação de Identidade — Clariens

## Visão Geral
Formulário de validação de identidade do discente para fins de reset de senha. Visual corporativo com gradiente azul/roxo da marca Clariens, sem armazenamento de dados.

---

## Página do Formulário

### Header
- Logo/nome "Clariens" no topo
- Título: **"Confirmação de Identidade"**
- Subtítulo: "Preencha os dados abaixo para validar sua identidade e solicitar o reset de senha"
- Fundo com gradiente azul → roxo/violeta

### Campos do Formulário (em card centralizado)
1. **Número Matrícula** — campo texto
2. **CPF*** — com máscara `000.000.000-00` e validação
3. **RG** — campo texto
4. **CEP** — com máscara `00000-000`
5. **Data de Nascimento*** — seletor de data (datepicker)
6. **Número Celular*** — com máscara `(00) 00000-0000` (ao enviar, o DDD será removido automaticamente, enviando apenas os 9 dígitos)
7. **E-mail Pessoal*** — com validação de formato de e-mail

*Campos obrigatórios marcados com asterisco*

### Aviso LGPD
Abaixo dos campos, um bloco informativo com ícone de cadeado:
> "Em conformidade com a LGPD (Lei Geral de Proteção de Dados), informamos que nenhum dos dados coletados neste formulário será armazenado ou retido para outros usos. Estes dados possuem apenas fins de **validação e confirmação de identidade** junto às plataformas geridas pela Clariens."

### Botão de Envio
- Botão "Confirmar Identidade" com estilo gradiente azul/roxo
- Validação de todos os campos obrigatórios antes do envio
- Ao enviar com sucesso, exibe tela de confirmação com mensagem de que a solicitação foi recebida

### Tela de Confirmação (pós-envio)
- Mensagem de sucesso: "Sua solicitação de reset de senha foi enviada com sucesso!"
- Resumo dos dados enviados (parcialmente mascarados por segurança)
- Botão para voltar ao início

---

## Detalhes Técnicos
- Validação completa dos campos com mensagens de erro em português
- Máscaras de formatação automática nos campos CPF, CEP e Celular
- Extração de variáveis prontas para futura integração com API
- Design responsivo (funciona em desktop e mobile)
- Sem backend nesta fase — preparado para integração futura com API

