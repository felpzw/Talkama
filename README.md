# Talkama AI App

O Talkama AI App é uma aplicação desktop que permite interagir com modelos de linguagem do Ollama. Ele oferece uma interface simples para enviar mensagens de texto e imagens, selecionar modelos de linguagem e configurar o host do servidor Ollama.

## Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes requisitos instalados:

- **Node.js** (v18 ou superior)
- **Rust** (instalado via `rustup`)
- **Tauri CLI** (instalado globalmente via npm)
- **Dependências do sistema** (consulte [Tauri v2 Prerequisites](https://v2.tauri.app/start/prerequisites/) para os requisitos específicos do seu sistema operacional)

## Instalação

1. Clone o repositório:

   ```
   git clone https://github.com/felpzw/Talkama.git
   cd Talkama
   ```

2. Instale as dependências do projeto:

    ```npm install```

3. (Opcional) Instale o Tauri CLI globalmente:

    ```npm install -g @tauri-apps/cli```

## Executando o Aplicativo

Para rodar o aplicativo em modo de desenvolvimento, use o seguinte comando:

```npm run tauri dev```

Isso iniciará o servidor de desenvolvimento e abrirá a aplicação em uma janela desktop.

## Compilando o Aplicativo

Para compilar o aplicativo para produção, use o seguinte comando:

```npm run tauri build```

Isso gerará um executável na pasta src-tauri/target/release (ou src-tauri/target/debug para builds de desenvolvimento).

## Como Usar

Configurar o Host:

    Navegue até a aba "Host" e insira o endereço do servidor Ollama.

    Clique em "Testar Host" para verificar se o host está funcionando corretamente.

Selecionar um Modelo:

    Navegue até a aba "Modelos" e selecione um modelo de linguagem disponível.

Enviar Mensagens:

    Navegue até a aba "Chat" e comece a enviar mensagens de texto ou imagens.

    Você pode arrastar e soltar uma imagem na área designada ou clicar em "Selecionar Imagem" para carregar uma imagem.