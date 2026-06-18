# 🚔 Floripa Segura - Painel Analítico de Segurança Pública

**Floripa Segura** é uma aplicação web de inteligência geográfica (GIS) desenvolvida para visualização dinâmica de índices de segurança e criminalidade em bairros da região metropolitana de Florianópolis. 

A ferramenta utiliza análise de dados simulados (baseados em padrões reais de boletins da SSP-SC) para fornecer um mapa tático interativo de manchas de calor e zonas de vulnerabilidade.

## 🚀 Funcionalidades e Funcionamento do Sistema

O sistema é um *Single Page Application* (SPA) operado através de um mapa vetorial iterativo. As principais funcionalidades incluem:
- **Mapeamento Vetorial:** Leitura e renderização da malha geográfica (GeoJSON) dos bairros.
- **Filtragem Tática Dinâmica:** Botões que recarregam o mapa em tempo real classificando os bairros em graus de risco (Crítico, Alerta, Moderado, Seguro).
- **Cálculo de KPIs:** Sidebar que gera rankings e calcula médias estatísticas baseadas apenas nos dados atualmente visíveis na tela.
- **Interatividade Bidirecional:** Clicar na lista de rankings ou diretamente no polígono do mapa faz a câmera centralizar no local (FlyTo) e carrega um relatório textual dinâmico na caixa de destaques.
- **Zonas de Calor (Hotspots):** Sobreposição de vetores internos (camadas SVG z-index controladas) para apontar ruas ou estabelecimentos precisos onde o crime incide.

## 💻 Tecnologias Utilizadas

Este projeto foi construído primando por leveza e não dependência de frameworks pesados, utilizando:

* **HTML5 e CSS3:** Estruturação semântica e customização em modo escuro (Dark Theme) focado em ambientes operacionais táticos.
* **JavaScript (Vanilla / ES6+):** Lógica funcional da aplicação. O código utiliza métodos modernos como `fetch()`, `.map()`, `.filter()` e `.reduce()`.
* **Leaflet.js:** Biblioteca open-source líder de mercado para criação de mapas web interativos.
* **GeoJSON:** Formato padrão de codificação de dados geográficos.

## 🛠️ Instruções de Instalação e Execução

Como o projeto realiza requisições assíncronas (API Fetch) para ler o arquivo `.geojson` local, o navegador bloqueará o carregamento caso você abra apenas o arquivo `index.html` (erro de CORS protocol).

Para executar corretamente, é necessário rodar o projeto através de um servidor local.

**Opção 1: Usando o VS Code (Recomendado)**
1. Abra a pasta do projeto no *Visual Studio Code*.
2. Instale a extensão **Live Server** (por Ritwick Dey).
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

**Opção 2: Usando Node.js / Python**
* Via Python: Abra o terminal na pasta do projeto e rode `python -m http.server 8000`. Acesse `localhost:8000` no navegador.
* Via Node.js: Instale o *http-server* rodando `npm install -g http-server`. Depois, rode `http-server` na pasta.

## 📚 Documentação do Código (Exemplos)

Conforme as boas práticas de desenvolvimento de software e as especificações deste projeto acadêmico, o código interno (JavaScript) foi rigorosamente documentado utilizando a especificação **JSDoc**. 

Isto permite a rápida compreensão das regras de negócio por outros desenvolvedores. Abaixo, exemplos das documentações inseridas no motor principal do sistema, `app.js`:

### Documentação de Constantes e Variáveis de Estado
```javascript
/**
 * Instância principal do mapa Leaflet.
 * @type {L.Map}
 */
const map = L.map('map', { ... });