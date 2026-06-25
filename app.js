/**
 * @file app.js
 * @description Lógica principal do Painel Analítico "Floripa Segura". 
 * Gerencia a renderização do mapa via Leaflet, carregamento assíncrono de dados GeoJSON, 
 * filtragem espacial e interatividade do DOM.
 * @author [Luiz Fernando Gobbi & Gabriel Calegari]
 * @version 1.0.0
 */

// ==========================================
// 1. CONFIGURAÇÃO BASE DO MAPA
// ==========================================

/**
 * Coordenadas delimitadoras (Bounding Box) da Grande Florianópolis.
 * Impede que o usuário arraste o mapa para muito longe da área de interesse.
 * @constant {Array<Array<number>>}
 */
const limitesGrandeFloripa = [
    [-27.95, -48.95], // Sudoeste
    [-27.30, -48.30]  // Nordeste
];

/**
 * Instância principal do mapa Leaflet.
 * @type {L.Map}
 */
const map = L.map('map', {
    zoomControl: true,
    maxBounds: limitesGrandeFloripa,
    maxBoundsViscosity: 1.0,
    minZoom: 10
}).setView([-27.5953, -48.5480], 11); 

// Adiciona a camada de blocos (tiles) baseados no OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap | Limites Oficiais IPUF / IBGE'
}).addTo(map);

/**
 * Dicionário de configuração visual para as classes de risco.
 * Define a cor hexadecimal e o rótulo legível para cada status.
 * @constant {Object}
 */
const configCores = {
    critico: { cor: '#ef4444', label: 'Crítico' },
    alerta: { cor: '#f97316', label: 'Alerta' },
    moderado: { cor: '#f59e0b', label: 'Moderado' },
    seguro: { cor: '#10b981', label: 'Estável / Seguro' },
    nao_mapeado: { cor: '#4b5563', label: 'Sem Dados Oficiais' }
};

// ==========================================
// 2. BASE DE DADOS ESTATÍSTICOS
// ==========================================

/**
 * Array de objetos contendo os dados analíticos de segurança por bairro.
 * Em um cenário real de produção, esta estrutura seria consumida via API (Fetch/Axios).
 * @constant {Array<Object>}
 */
const baseEstatisticaBairros = [
    {
        bairroMapeado: "Centro",
        classe: "critico",
        taxaMilHab: 95.2,
        ocorrenciasPrevalentes: "Furtos/Roubos a Transeuntes",
        zonaCritica: "Av. Paulo Fontes (TICEN) e Praça XV",
        focosInternos: [
            { lat: -27.598332, lng: -48.554425, raio: 210, local: "Entorno do TICEN" }, 
            { lat: -27.598192, lng: -48.549353, raio: 210, local: "Praça XV e Calçadão" }
        ],
        centroide: [-27.5960, -48.5530],
        destaques: [
            "<strong>Volume Absoluto:</strong> Concentra o maior número de furtos e roubos devido ao intenso fluxo diário flutuante.",
            "<strong>Ponto Focal:</strong> Terminais de ônibus (TICEN) e comércios adjacentes exigem policiamento ostensivo."
        ]
    },
    {
        bairroMapeado: "Trindade",
        classe: "critico",
        taxaMilHab: 60.3,
        ocorrenciasPrevalentes: "Roubo a Pedestres e Furtos Universitários",
        zonaCritica: "Acessos e Campus da UFSC",
        focosInternos: [{ lat: -27.596269, lng: -48.522057, raio: 250, local: "Centro de Convivência / Reitoria UFSC" }, { lat: -27.5885, lng: -48.5220, raio: 150, local: "Comércio da Lauro Linhares" }],
        centroide: [-27.5980, -48.5180],
        destaques: [
            "<strong>Fator Universitário:</strong> Alta incidência de furtos em repúblicas e no eixo comercial principal.",
            "<strong>Sazonalidade:</strong> Picos de ocorrências acompanham o calendário letivo da UFSC."
        ]
    },
    {
        bairroMapeado: "Monte Cristo",
        classe: "critico",
        taxaMilHab: 68.5,
        ocorrenciasPrevalentes: "Roubos de Veículos e Tráfico",
        zonaCritica: "Acessos às Comunidades Locais",
        focosInternos: [{ lat: -27.591385, lng: -48.601826, raio: 180, local: "Zonas de Vulnerabilidade Social" }],
        centroide: [-27.5895, -48.5995],
        destaques: [
            "<strong>Dinâmica:</strong> Zona com histórico de conflitos associados a organizações criminosas e tráfico.",
            "<strong>Atenção Tática:</strong> Apresenta alta taxa de recuperação de veículos furtados em outras regiões."
        ]
    },
    {
        bairroMapeado: "Capoeiras",
        classe: "critico",
        taxaMilHab: 58.4,
        ocorrenciasPrevalentes: "Furtos de Veículos e Roubos Comerciais",
        zonaCritica: "Vias de Conexão com Via Expressa",
        focosInternos: [{ lat: -27.5960, lng: -48.5890, raio: 280, local: "Eixo Comercial Sul da Via Expressa" }],
        centroide: [-27.5970, -48.5910],
        destaques: [
            "<strong>Eixo Comercial:</strong> Registros frequentes de arrombamentos noturnos em galpões e lojas.",
            "<strong>Evasão Rápida:</strong> Proximidade com a Via Expressa facilita a fuga de criminosos."
        ]
    },
    {
        bairroMapeado: "Estreito",
        classe: "alerta",
        taxaMilHab: 52.2,
        ocorrenciasPrevalentes: "Arrombamentos Comerciais e Furtos de Veículos",
        zonaCritica: "Eixo Comercial Fúlvio Aducci",
        focosInternos: [{ lat: -27.590630, lng: -48.576082, raio: 190, local: "Eixo Comercial Fúlvio Aducci" }],
        centroide: [-27.5855, -48.5790],
        destaques: [
            "<strong>Fúlvio Aducci:</strong> Corredor central concentra furtos a veículos estacionados na via pública.",
            "<strong>Perfil Residencial:</strong> As ruas internas mantêm baixo índice de crimes violentos."
        ]
    },
    {
        bairroMapeado: "Canasvieiras",
        classe: "alerta",
        taxaMilHab: 45.1,
        ocorrenciasPrevalentes: "Furtos de Oportunidade (Verão) e Descuidos na Praia",
        zonaCritica: "Ruas de Acesso à Faixa de Areia",
        focosInternos: [{ lat: -27.428653, lng: -48.467194, raio: 200, local: "Avenidas Próximas à Orla Marítima" }],
        focosInternos: [{ lat: -27.427115, lng: -48.452723, raio: 200, local: "Avenidas Próximas à Orla Marítima" }],
        centroide: [-27.4356, -48.4635],
        destaques: [
            "<strong>Fator Verão:</strong> Pico agudo de pequenos furtos na orla durante a alta temporada.",
            "<strong>Alvos:</strong> Turistas são os principais alvos de furtos por descuido de pertences."
        ]
    },
    {
        bairroMapeado: "Lagoa da Conceição",
        classe: "moderado",
        taxaMilHab: 39.5,
        ocorrenciasPrevalentes: "Furtos de Veículos e Lazer Noturno",
        zonaCritica: "Centrinho e Av. das Rendeiras",
        focosInternos: [{ lat: -27.601908, lng: -48.469023, raio: 180, local: "Centrinho da Lagoa" }],
        centroide: [-27.6040, -48.4620],
        destaques: [
            "<strong>Vida Noturna:</strong> Alta incidência de furtos no interior de veículos no entorno de bares.",
            "<strong>Gargalo Viário:</strong> Congestionamentos no verão favorecem furtos a pedestres isolados."
        ]
    },
    {
        bairroMapeado: "Ingleses",
        classe: "alerta",
        taxaMilHab: 50.2,
        ocorrenciasPrevalentes: "Furtos a Residências e Estabelecimentos",
        zonaCritica: "Centrinho dos Ingleses e Orla",
        focosInternos: [{ lat: -27.4420, lng: -48.4020, raio: 250, local: "Centrinho Comercial / SC-403" }],
        centroide: [-27.4450, -48.4020],
        destaques: [
            "<strong>Expansão Rápida:</strong> Crescimento demográfico acelerado gerou aumento de crimes patrimoniais.",
            "<strong>Veraneio:</strong> Furtos frequentes em residências que ficam vazias fora de temporada."
        ]
    },
    {
        bairroMapeado: "Campeche",
        classe: "moderado",
        taxaMilHab: 37.7,
        ocorrenciasPrevalentes: "Arrombamentos Residenciais Noturnos",
        zonaCritica: "Acessos Secundários à Praia",
        focosInternos: [{ lat: -27.6850, lng: -48.4820, raio: 200, local: "Zonas Residenciais Isoladas" }],
        centroide: [-27.6850, -48.4820],
        destaques: [
            "<strong>Vias Isoladas:</strong> Maioria das ocorrências envolve arrombamentos em casas de loteamentos novos.",
            "<strong>Vulnerabilidade:</strong> Falta de iluminação pública em ruas de acesso à praia facilita os delitos."
        ]
    },
    {
        bairroMapeado: "Saco dos Limões",
        classe: "moderado",
        taxaMilHab: 27.5,
        ocorrenciasPrevalentes: "Delitos de Proximidade e Vandalismo",
        zonaCritica: "Acessos ao Túnel Antonieta de Barros",
        focosInternos: [{ lat: -27.6120, lng: -48.5350, raio: 160, local: "Proximidades do Eixo Viário Principal" }],
        centroide: [-27.6120, -48.5350],
        destaques: [
            "<strong>Eixo de Fuga:</strong> Vias rápidas de acesso ao Sul da Ilha são usadas para evasão de assaltantes.",
            "<strong>Vandalismo:</strong> Registros pontuais de depredação do patrimônio público."
        ]
    },
    {
        bairroMapeado: "Coqueiros",
        classe: "seguro",
        taxaMilHab: 17.2,
        ocorrenciasPrevalentes: "Furtos de Objetos dentro de Carros",
        zonaCritica: "Orla Gastronômica (Vias de Estacionamento)",
        focosInternos: [{ lat: -27.61170, lng: -48.583330, raio: 160, local: "Zonas de Estacionamento da Orla" }],
        centroide: [-27.6070, -48.5840],
        destaques: [
            "<strong>Orla Gastronômica:</strong> Principal dor de cabeça são quebras de vidro para furto em veículos à noite.",
            "<strong>Estabilidade:</strong> Crimes violentos ou contra a vida são extremamente raros na região."
        ]
    },
    {
        bairroMapeado: "Itacorubi",
        classe: "seguro",
        taxaMilHab: 14.8,
        ocorrenciasPrevalentes: "Pequenos Furtos em Prédios Comerciais",
        zonaCritica: "Rodovia Amaro Antônio Vieira e Celta",
        focosInternos: [], 
        centroide: [-27.5730, -48.4950],
        destaques: [
            "<strong>Perfil Corporativo:</strong> Zona de centros empresariais sofre apenas com pequenos furtos de oportunidade.",
            "<strong>Baixo Risco:</strong> Monitoramento privado massivo na Rod. SC-401 inibe ações criminosas maiores."
        ]
    },
    {
        bairroMapeado: "Jurerê Internacional",
        classe: "seguro",
        taxaMilHab: 10.4,
        ocorrenciasPrevalentes: "Furtos Noturnos de Oportunidade",
        zonaCritica: "Residências Isoladas",
        focosInternos: [], 
        centroide: [-27.4390, -48.4910],
        destaques: [
            "<strong>Vigilância Privada:</strong> O forte esquema de segurança afasta a maioria dos delitos convencionais.",
            "<strong>Deslocamento do Crime:</strong> Criminosos costumam atuar apenas nas divisas com Jurerê Tradicional."
        ]
    }
];

// Variáveis de Controle de Estado Global
let camadaGeoJsonPrincipal = null;
let camadasManchasInternas = [];
let filtroAtual = 'todos';
let dadosGeoJsonGuardados = null;

// ==========================================
// 3. CARREGAMENTO E PROCESSAMENTO DO GEOJSON
// ==========================================

const urlGeoJson = "bairros-floripa.geojson";

// Inicializa a requisição assíncrona do arquivo de malha geográfica
fetch(urlGeoJson)
    .then(response => {
        if (!response.ok) throw new Error("Não foi possível carregar o GeoJSON.");
        return response.json();
    })
    .then(geojsonDados => {
        dadosGeoJsonGuardados = geojsonDados;
        processarEMapearDados(); // Chama a função de renderização após o sucesso do carregamento
    })
    .catch(erro => console.error("Erro ao montar mapa anatômico:", erro));

/**
 * Filtra e renderiza as camadas no mapa Leaflet.
 * Remove camadas antigas antes de aplicar os novos dados com base no `filtroAtual`.
 * @function
 */
function processarEMapearDados() {
    // Limpeza de camadas anteriores para evitar sobreposição (Memory Leak)
    if (camadaGeoJsonPrincipal) map.removeLayer(camadaGeoJsonPrincipal);
    camadasManchasInternas.forEach(c => map.removeLayer(c));
    camadasManchasInternas = [];

    let bairrosVisiveisNaSidebar = [];

    // Instanciação da malha GeoJSON com configurações customizadas
    camadaGeoJsonPrincipal = L.geoJSON(dadosGeoJsonGuardados, {
        
        /**
         * Regra de filtragem espacial baseada nos botões da interface.
         * @param {Object} feature - Objeto de feição geométrica (bairro).
         * @returns {boolean} True se deve ser exibido, False caso contrário.
         */
        filter: function(feature) {
            const nomeBairro = feature.properties.bairro || feature.properties.name || feature.properties.NOME;
            const dados = baseEstatisticaBairros.find(b => b.bairroMapeado.toLowerCase() === nomeBairro.trim().toLowerCase());
            if (filtroAtual === 'todos') return true;
            return dados && dados.classe === filtroAtual;
        },

        /**
         * Aplica estilos CSS dinâmicos baseados no risco do bairro.
         */
        style: function(feature) {
            const nomeBairro = feature.properties.bairro || feature.properties.name || feature.properties.NOME;
            const dados = baseEstatisticaBairros.find(b => b.bairroMapeado.toLowerCase() === nomeBairro.trim().toLowerCase());
            const config = dados ? configCores[dados.classe] : configCores['nao_mapeado'];

            return {
                fillColor: config.cor,
                color: '#ffffff',
                weight: 1.5,
                opacity: 0.7,
                fillOpacity: dados ? 0.22 : 0.05
            };
        },

        /**
         * Associa eventos e balões de informação (popups) para cada polígono desenhado.
         */
        onEachFeature: function(feature, layer) {
            const nomeBairro = feature.properties.bairro || feature.properties.name || feature.properties.NOME;
            const dados = baseEstatisticaBairros.find(b => b.bairroMapeado.toLowerCase() === nomeBairro.trim().toLowerCase());

            if (dados) {
                bairrosVisiveisNaSidebar.push(dados);
                const config = configCores[dados.classe];

                // Montagem do Popup (HTML embutido)
                const popupContent = `
                    <div style="font-family: 'Segoe UI', sans-serif; color: #1f2937; min-width: 240px;">
                        <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${config.cor}20; color: ${config.cor}; display: inline-block; margin-bottom: 6px;">
                            GRAU: ${config.label.toUpperCase()}
                        </span>
                        <h4 style="margin: 0 0 4px 0; color: #111827; font-size: 14px;">Bairro: ${dados.bairroMapeado}</h4>
                        <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
                            📊 <b>Índice Criminal:</b> ${dados.taxaMilHab} / 1k hab.<br>
                            ⚠️ <b>Predominância:</b> ${dados.ocorrenciasPrevalentes}.
                        </div>
                    </div>
                `;
                layer.bindPopup(popupContent);

                // Evento de clique para atualizar o painel lateral dinâmico
                layer.on('click', () => {
                    atualizarCaixaDestaques(dados);
                });

                // Renderização das Manchas de Calor (Zonas Críticas)
                dados.focosInternos.forEach(foco => {
                    const manchaEscura = L.circle([foco.lat, foco.lng], {
                        radius: foco.raio,
                        fillColor: config.cor,
                        color: config.cor,
                        weight: 0,
                        fillOpacity: 0.5
                    }).addTo(map);

                    manchaEscura.bindPopup(`<b>🚨 Zona de Calor Crítica:</b><br>${foco.local}`);
                    camadasManchasInternas.push(manchaEscura);
                });
            } else {
                layer.bindPopup(`<b>${nomeBairro}</b><br><span style="color:gray; font-size:11px;">Sem dados para este período.</span>`);
            }
        }
    }).addTo(map);

    // Garante que os pontos de foco fiquem clicáveis, movendo-os para cima na ordem de renderização SVG (Z-Index fix)
    camadasManchasInternas.forEach(mancha => mancha.bringToFront());

    atualizarComponentesLaterais(bairrosVisiveisNaSidebar);
}

// ==========================================
// 4. INTEGRAÇÃO DINÂMICA COM O DOM (UI/UX)
// ==========================================

/**
 * Atualiza os indicadores KPIs e a lista de ranking na interface lateral.
 * @param {Array<Object>} dadosVisiveis - Lista de bairros atualmente renderizados no mapa.
 */
function atualizarComponentesLaterais(dadosVisiveis) {
    document.getElementById('kpi-total-bairros').innerText = dadosVisiveis.length;
    
    // Cálculo da média de taxa de ocorrência
    const elMedia = document.getElementById('kpi-media-taxa');
    if (dadosVisiveis.length > 0) {
        const soma = dadosVisiveis.reduce((acc, b) => acc + b.taxaMilHab, 0);
        elMedia.innerText = (soma / dadosVisiveis.length).toFixed(1);
    } else {
        elMedia.innerText = "0.0";
    }

    const rankingContainer = document.getElementById('dynamic-ranking');
    rankingContainer.innerHTML = ''; 

    // Ordenação decrescente pela taxa de criminalidade (Maior para menor risco)
    const dadosOrdenados = [...dadosVisiveis].sort((a, b) => b.taxaMilHab - a.taxaMilHab);

    dadosOrdenados.forEach(bairroData => {
        const corStatus = configCores[bairroData.classe].cor;
        const li = document.createElement('li');
        li.className = 'ranking-item';
        
        li.innerHTML = `
            <span class="ranking-name">${bairroData.bairroMapeado}</span>
            <span class="ranking-value" style="background: ${corStatus}20; color: ${corStatus};">${bairroData.taxaMilHab}</span>
        `;

        // Ao clicar no item da lista, o mapa voa até o centroide e a caixa de destaques é atualizada
        li.addEventListener('click', () => {
            map.flyTo(bairroData.centroide, 13, { animate: true, duration: 1.2 });
            atualizarCaixaDestaques(bairroData);
        });

        rankingContainer.appendChild(li);
    });
}

/**
 * Altera dinamicamente o painel inferior de informações ("Destaques do Relatório").
 * @param {Object} bairroData - Objeto contendo os dados estatísticos do bairro selecionado.
 */
function atualizarCaixaDestaques(bairroData) {
    const painelFeed = document.getElementById('stats-feed');
    
    if (!bairroData) {
        painelFeed.innerHTML = `<p>📊 Selecione um bairro no mapa ou no ranking para visualizar a análise tática detalhada.</p>`;
        return;
    }

    let novoConteudo = '';
    if (bairroData.destaques && bairroData.destaques.length > 0) {
        bairroData.destaques.forEach(frase => {
            novoConteudo += `<p>📊 ${frase}</p>`;
        });
    } else {
        novoConteudo = `<p>📊 Análise específica não disponível no momento para ${bairroData.bairroMapeado}.</p>`;
    }

    // Efeito de transição suave (Fade-in/Fade-out)
    painelFeed.style.opacity = '0';
    setTimeout(() => {
        painelFeed.innerHTML = `<strong style="color:var(--text-main)">Destaques Táticos - ${bairroData.bairroMapeado.toUpperCase()}:</strong><br><br>` + novoConteudo;
        painelFeed.style.transition = 'opacity 0.4s';
        painelFeed.style.opacity = '1';
    }, 200);
}

// ==========================================
// 5. CONTROLE DE EVENTOS DOS FILTROS (GRID)
// ==========================================

// Ouve os cliques nos botões de filtro e re-processa o GeoJSON
document.querySelectorAll('.btn-filtro-tatico').forEach(botao => {
    botao.addEventListener('click', () => {
        // Remove a classe ativa de todos os botões e aplica apenas ao clicado
        document.querySelectorAll('.btn-filtro-tatico').forEach(b => b.classList.remove('active'));
        botao.classList.add('active');
        
        filtroAtual = botao.getAttribute('data-classe');
        // Se a malha já foi carregada, re-renderiza o mapa com o filtro aplicado
        if (dadosGeoJsonGuardados) processarEMapearDados();
    });
});
