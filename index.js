const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==================================================
// 🔴 PREENCHA ESTAS 3 INFORMAÇÕES
// ==================================================
const TOKEN = 'MTU3MDUzMTIwMjE2NTYzNzIyMQ.GITaub.O1U5TdDL4oe4YKHbrUyuojmoQk6Op0QNXt7MUc';
const CLIENTE_ID = '1570531202165637221';
const SERVIDOR_ID = '1570087924656246896';
// ==================================================

// 💾 Sistema de Dados
let jogadores = {};
try {
  jogadores = JSON.parse(fs.readFileSync('dados.json', 'utf8'));
  console.log('✅ Dados carregados!');
} catch (e) {
  console.log('📄 Arquivo de dados criado novo!');
}

function salvarDados() {
  fs.writeFileSync('dados.json', JSON.stringify(jogadores, null, 2));
}

function garantirJogador(usuarioId) {
  if (!jogadores[usuarioId]) {
    jogadores[usuarioId] = {
      moedas: 250,
      gemas: 0,
      spins: 5,
      nivel: 1,
      xp: 0,
      colecao: [],
      inventario: [],
      equipado: null,
      diarioResgatado: null,
      ultimoGema: Date.now()
    };
    salvarDados();
  }
  jogadores[usuarioId].moedas = jogadores[usuarioId].moedas ?? 250;
  jogadores[usuarioId].gemas = jogadores[usuarioId].gemas ?? 0;
  jogadores[usuarioId].spins = jogadores[usuarioId].spins ?? 5;
  jogadores[usuarioId].nivel = jogadores[usuarioId].nivel ?? 1;
  jogadores[usuarioId].xp = jogadores[usuarioId].xp ?? 0;
  jogadores[usuarioId].colecao = jogadores[usuarioId].colecao ?? [];
  jogadores[usuarioId].inventario = jogadores[usuarioId].inventario ?? [];
  return jogadores[usuarioId];
}

// 🛒 Loja
const lojaItens = {
  varas: [
    { id: 'vara_bambu', nome: 'Vara de Bambu', preco: 0, nivel: 1, desc: 'Sem efeito especial', bonus: 0 },
    { id: 'vara_fibra', nome: 'Vara de Fibra', preco: 300, nivel: 3, desc: '+25% de chance de personagens melhores', bonus: 0.25 },
    { id: 'vara_carbono', nome: 'Vara de Carbono', preco: 1800, nivel: 8, desc: '+60% de chance de personagens melhores', bonus: 0.60 },
    { id: 'vara_pro', nome: 'Vara Profissional', preco: 10000, nivel: 15, desc: '+120% de chance de personagens melhores', bonus: 1.20 },
    { id: 'vara_lendaria', nome: 'Vara Lendária', preco: 40000, nivel: 25, desc: '+200% de chance de personagens melhores', bonus: 2.00 }
  ],
  iscas: [
    { id: 'minhoca', nome: 'Minhoca', preco: 0, nivel: 1, desc: 'Isca básica', multiplicador: 1 },
    { id: 'massa', nome: 'Massa', preco: 2, nivel: 2, desc: 'Um pouco melhor', multiplicador: 1.1 },
    { id: 'isca_viva', nome: 'Isca Viva', preco: 6, nivel: 5, desc: 'Boa isca!', multiplicador: 1.3 },
    { id: 'isca_dourada', nome: 'Isca Dourada', preco: 25, nivel: 10, desc: '✨ Triplica a chance de raros!', multiplicador: 3 }
  ]
};

// 📋 300 PERSONAGENS + 5 GM
const personagens = [
  // 🏆 GM — 5 personagens
  { nome: 'Femboy', raridade: 'GM', emoji: '💅', poder: 9999, desc: 'Estilo impecável + carisma máximo' },
  { nome: 'Tomboy', raridade: 'GM', emoji: '⚡', poder: 9950, desc: 'Agilidade e coragem sem igual' },
  { nome: 'Therian', raridade: 'GM', emoji: '🐺', poder: 9900, desc: 'Conexão espiritual com a natureza' },
  { nome: 'Enaldinho', raridade: 'GM', emoji: '🎮', poder: 9850, desc: 'Rei dos jogos e memes' },
  { nome: 'MC Katrina', raridade: 'GM', emoji: '🎤', poder: 9800, desc: 'Rainha das favelas e dos hits' },

  // 🟥 MÍTICOS — 30
  { nome: 'Saitama', raridade: 'Mítico', emoji: '🦸', poder: 9500, desc: 'Um soco, só isso' },
  { nome: 'Goku UI', raridade: 'Mítico', emoji: '🧡', poder: 9450, desc: 'Instinto Superior' },
  { nome: 'Naruto Baryon', raridade: 'Mítico', emoji: '🦊', poder: 9400, desc: 'Modo Bárion' },
  { nome: 'Luffy Gear 5', raridade: 'Mítico', emoji: '🏴‍☠️', poder: 9350, desc: 'O Deus Sol Nika' },
  { nome: 'Eren Fundador', raridade: 'Mítico', emoji: '⚔️', poder: 9300, desc: 'O Titã Fundador' },
  { nome: 'Ichigo Verdadeiro', raridade: 'Mítico', emoji: '⚔️', poder: 9250, desc: 'Zangetsu Verdadeiro' },
  { nome: 'Tanjiro Sol', raridade: 'Mítico', emoji: '🔥', poder: 9200, desc: 'Respiração do Sol Completo' },
  { nome: 'Gojo Infinito', raridade: 'Mítico', emoji: '👁️', poder: 9150, desc: 'O Vazio Infinito' },
  { nome: 'Sukuna', raridade: 'Mítico', emoji: '👹', poder: 9100, desc: 'O Rei das Maldições' },
  { nome: 'All Might', raridade: 'Mítico', emoji: '💪', poder: 9050, desc: 'O Símbolo da Paz' },
  { nome: 'Meliodas', raridade: 'Mítico', emoji: '⚔️', poder: 9000, desc: 'Filho do Demônio Rei' },
  { nome: 'Simon', raridade: 'Mítico', emoji: '🔧', poder: 8950, desc: 'O Perfurador de Céus' },
  { nome: 'Alucard', raridade: 'Mítico', emoji: '🧛', poder: 8900, desc: 'O Vampiro Imortal' },
  { nome: 'Mob', raridade: 'Mítico', emoji: '💫', poder: 8850, desc: 'Poder Psíquico Absoluto' },
  { nome: 'Giorno GER', raridade: 'Mítico', emoji: '🌟', poder: 8800, desc: 'O Rei Dourado Eterno' },
  { nome: 'Asta', raridade: 'Mítico', emoji: '⚔️', poder: 8750, desc: 'Anti-Magia Completo' },
  { nome: 'Yami', raridade: 'Mítico', emoji: '🌑', poder: 8700, desc: 'A Escuridão Mais Profunda' },
  { nome: 'Shinra', raridade: 'Mítico', emoji: '🔥', poder: 8650, desc: 'Pés do Diabo' },
  { nome: 'Killua Godspeed', raridade: 'Mítico', emoji: '⚡', poder: 8600, desc: 'A Velocidade da Luz' },
  { nome: 'Gon Liberado', raridade: 'Mítico', emoji: '💚', poder: 8550, desc: 'Todo o Poder de Uma Vez' },
  { nome: 'Natsu END', raridade: 'Mítico', emoji: '🔥', poder: 8500, desc: 'O Rei Demônio END' },
  { nome: 'Erza', raridade: 'Mítico', emoji: '⚔️', poder: 8450, desc: 'A Rainha das Fadas' },
  { nome: 'Sesshomaru', raridade: 'Mítico', emoji: '🐕', poder: 8400, desc: 'O Grande Demônio' },
  { nome: 'Inuyasha', raridade: 'Mítico', emoji: '🐶', poder: 8350, desc: 'Meio-Demônio Completo' },
  { nome: 'Kenshin', raridade: 'Mítico', emoji: '⚔️', poder: 8300, desc: 'O Espadachim Lendário' },
  { nome: 'Genos', raridade: 'Mítico', emoji: '🤖', poder: 8200, desc: 'Ciborgue de Combate Completo' },
  { nome: 'Frieren', raridade: 'Mítico', emoji: '✨', poder: 8150, desc: 'A Maga Mais Forte' },
  { nome: 'Vash', raridade: 'Mítico', emoji: '🔫', poder: 8050, desc: 'O Estouro da Estrela Amarela' },
  { nome: 'Rimuru', raridade: 'Mítico', emoji: '🟣', poder: 8000, desc: 'O Grande Lorde Demônio' },

  // 🟧 LENDÁRIOS — 45
  { nome: 'Vegeta', raridade: 'Lendário', emoji: '💜', poder: 7900, desc: 'Príncipe dos Saiyajin' },
  { nome: 'Naruto', raridade: 'Lendário', emoji: '🦊', poder: 7850, desc: 'O Sétimo Hokage' },
  { nome: 'Luffy', raridade: 'Lendário', emoji: '🏴‍☠️', poder: 7800, desc: 'Capitão dos Chapéus de Palha' },
  { nome: 'Zoro', raridade: 'Lendário', emoji: '🗡️', poder: 7750, desc: 'Caçador de Piratas' },
  { nome: 'Sasuke', raridade: 'Lendário', emoji: '⚡', poder: 7700, desc: 'O Uchiha Renascido' },
  { nome: 'Ichigo', raridade: 'Lendário', emoji: '⚔️', poder: 7650, desc: 'Shinigami Substituto' },
  { nome: 'Levi', raridade: 'Lendário', emoji: '🧹', poder: 7600, desc: 'O Mais Forte da Humanidade' },
  { nome: 'Mikasa', raridade: 'Lendário', emoji: '⚔️', poder: 7550, desc: 'A Mais Forte das Lanças' },
  { nome: 'Itachi', raridade: 'Lendário', emoji: '🦅', poder: 7500, desc: 'O Corvo Sábio' },
  { nome: 'Minato', raridade: 'Lendário', emoji: '💨', poder: 7450, desc: 'O Relâmpago Amarelo' },
  { nome: 'Sanji', raridade: 'Lendário', emoji: '🍳', poder: 7400, desc: 'Perna Preta' },
  { nome: 'Ace', raridade: 'Lendário', emoji: '🔥', poder: 7350, desc: 'O Punho de Fogo' },
  { nome: 'Gon', raridade: 'Lendário', emoji: '💚', poder: 7300, desc: 'Caçador de Sonhos' },
  { nome: 'Killua', raridade: 'Lendário', emoji: '⚡', poder: 7250, desc: 'O Assassino Mais Rápido' },
  { nome: 'Shoto', raridade: 'Lendário', emoji: '❄️', poder: 7200, desc: 'Fogo e Gelo' },
  { nome: 'Deku', raridade: 'Lendário', emoji: '💪', poder: 7150, desc: 'O Sucessor de All Might' },
  { nome: 'Bakugo', raridade: 'Lendário', emoji: '💥', poder: 7100, desc: 'O Grande Explosivo' },
  { nome: 'Zenitsu', raridade: 'Lendário', emoji: '⚡', poder: 7050, desc: 'Respiração do Trovão' },
  { nome: 'Inosuke', raridade: 'Lendário', emoji: '🐗', poder: 7000, desc: 'Respiração da Fera' },
  { nome: 'Rengoku', raridade: 'Lendário', emoji: '🔥', poder: 6950, desc: 'Chama que Nunca Se Apaga' },
  { nome: 'Obanai', raridade: 'Lendário', emoji: '🐍', poder: 6900, desc: 'Respiração da Serpente' },
  { nome: 'Mitsuri', raridade: 'Lendário', emoji: '💖', poder: 6850, desc: 'Respiração do Amor' },
  { nome: 'Gyomei', raridade: 'Lendário', emoji: '🪨', poder: 6800, desc: 'Respiração da Rocha' },
  { nome: 'Sanemi', raridade: 'Lendário', emoji: '🌬️', poder: 6750, desc: 'Respiração do Vento' },
  { nome: 'Tengen', raridade: 'Lendário', emoji: '💎', poder: 6700, desc: 'Respiração do Som' },
  { nome: 'Shinobu', raridade: 'Lendário', emoji: '🦋', poder: 6650, desc: 'Respiração do Inseto' },
  { nome: 'Giyu', raridade: 'Lendário', emoji: '💧', poder: 6600, desc: 'Respiração da Água' },
  { nome: 'Megumi', raridade: 'Lendário', emoji: '🐺', poder: 6550, desc: 'Dominação das Sombras' },
  { nome: 'Yuji', raridade: 'Lendário', emoji: '👹', poder: 6500, desc: 'Portador de Sukuna' },
  { nome: 'Nobara', raridade: 'Lendário', emoji: '🔨', poder: 6450, desc: 'Pau e Martelo' },
  { nome: 'Toji', raridade: 'Lendário', emoji: '🗡️', poder: 6400, desc: 'O Assassino de Feiticeiros' },
  { nome: 'Geto', raridade: 'Lendário', emoji: '👻', poder: 6350, desc: 'Manipulador de Espíritos' },
  { nome: 'Mai', raridade: 'Lendário', emoji: '🎀', poder: 6300, desc: 'Irmã Gêmea' },
  { nome: 'Maki', raridade: 'Lendário', emoji: '⚔️', poder: 6250, desc: 'Caçadora de Maldições' },
  { nome: 'Toge', raridade: 'Lendário', emoji: '💬', poder: 6200, desc: 'O Orador Amaldiçoado' },
  { nome: 'Panda', raridade: 'Lendário', emoji: '🐼', poder: 6150, desc: 'O Amaldiçoado Vivo' },
  { nome: 'Choso', raridade: 'Lendário', emoji: '🩸', poder: 6100, desc: 'Manipulador de Sangue' },
  { nome: 'Todo', raridade: 'Lendário', emoji: '🤜', poder: 6050, desc: 'Troca de Lugar' },
  { nome: 'Nanami', raridade: 'Lendário', emoji: '👔', poder: 6000, desc: 'O Feiticeiro de Escritório' },
  { nome: 'Tanjiro', raridade: 'Lendário', emoji: '🔥', poder: 5950, desc: 'Respiração da Água e Fogo' },
  { nome: 'Kanao', raridade: 'Lendário', emoji: '🌸', poder: 5900, desc: 'Respiração da Flor' },
  { nome: 'Kokushibo', raridade: 'Lendário', emoji: '🌙', poder: 5850, desc: 'O Primeiro Luar Superior' },
  { nome: 'Douma', raridade: 'Lendário', emoji: '❄️', poder: 5800, desc: 'O Segundo Luar Superior' },
  { nome: 'Akaza', raridade: 'Lendário', emoji: '👊', poder: 5750, desc: 'O Terceiro Luar Superior' },

  // 🟪 ÉPICOS — 60
  { nome: 'Kakashi', raridade: 'Épico', emoji: '📖', poder: 5700, desc: 'O Ninja Copiador' },
  { nome: 'Hinata', raridade: 'Épico', emoji: '🌸', poder: 5650, desc: 'A Garota do Olho Branco' },
  { nome: 'Shikamaru', raridade: 'Épico', emoji: '🌑', poder: 5600, desc: 'Estrategista Gênio' },
  { nome: 'Chopper', raridade: 'Épico', emoji: '🦌', poder: 5550, desc: 'Médico dos Piratas' },
  { nome: 'Nami', raridade: 'Épico', emoji: '🌊', poder: 5500, desc: 'Navegante dos Piratas' },
  { nome: 'Robin', raridade: 'Épico', emoji: '📚', poder: 5450, desc: 'Arqueóloga' },
  { nome: 'Franky', raridade: 'Épico', emoji: '🤖', poder: 5400, desc: 'Ciborgue Super' },
  { nome: 'Brook', raridade: 'Épico', emoji: '💀', poder: 5350, desc: 'O Músico Esqueleto' },
  { nome: 'Jinbe', raridade: 'Épico', emoji: '🐟', poder: 5300, desc: 'Cavaleiro do Mar' },
  { nome: 'Usopp', raridade: 'Épico', emoji: '🎯', poder: 5250, desc: 'O Grande Atirador' },
  { nome: 'Anya', raridade: 'Épico', emoji: '🔮', poder: 5200, desc: 'Leitora de Mentes' },
  { nome: 'Loid', raridade: 'Épico', emoji: '🕵️', poder: 5150, desc: 'O Espião' },
  { nome: 'Yor', raridade: 'Épico', emoji: '🗡️', poder: 5100, desc: 'A Assassina' },
  { nome: 'Bond', raridade: 'Épico', emoji: '🐕', poder: 5050, desc: 'O Cão da Família' },
  { nome: 'Shisui', raridade: 'Épico', emoji: '💨', poder: 5000, desc: 'O Corvo que Voou Longe' },
  { nome: 'Gaara', raridade: 'Épico', emoji: '🏜️', poder: 4950, desc: 'O Kazekage' },
  { nome: 'Killer Bee', raridade: 'Épico', emoji: '🐝', poder: 4900, desc: 'O Rap dos Bijuu' },
  { nome: 'Temari', raridade: 'Épico', emoji: '🌪️', poder: 4850, desc: 'Ventos de Areia' },
  { nome: 'Kankuro', raridade: 'Épico', emoji: '🎭', poder: 4800, desc: 'O Mestre de Marionetes' },
  { nome: 'Choji', raridade: 'Épico', emoji: '🍖', poder: 4750, desc: 'Força do Coração' },
  { nome: 'Ino', raridade: 'Épico', emoji: '🌸', poder: 4700, desc: 'Controle Mental' },
  { nome: 'Sai', raridade: 'Épico', emoji: '🖌️', poder: 4650, desc: 'Arte que Ganha Vida' },
  { nome: 'Rock Lee', raridade: 'Épico', emoji: '🥋', poder: 4600, desc: 'Esforço Supera o Talento' },
  { nome: 'Neji', raridade: 'Épico', emoji: '👁️', poder: 4550, desc: 'Olhos que Veem Tudo' },
  { nome: 'Tenten', raridade: 'Épico', emoji: '⚔️', poder: 4500, desc: 'Armas que Chovem do Céu' },
  { nome: 'Might Guy', raridade: 'Épico', emoji: '🦵', poder: 4450, desc: 'A Juventude é Explosiva' },
  { nome: 'Asuma', raridade: 'Épico', emoji: '💨', poder: 4400, desc: 'O Vento da Justiça' },
  { nome: 'Kurenai', raridade: 'Épico', emoji: '🌸', poder: 4350, desc: 'Ilusões de Flores' },
  { nome: 'Yamato', raridade: 'Épico', emoji: '🌳', poder: 4300, desc: 'Madeira que Acalma' },
  { nome: 'Iruka', raridade: 'Épico', emoji: '📖', poder: 4250, desc: 'O Primeiro Professor' },
  { nome: 'Shigure', raridade: 'Épico', emoji: '🐶', poder: 4200, desc: 'O Cão Guardião' },
  { nome: 'Rin', raridade: 'Épico', emoji: '💧', poder: 4150, desc: 'A Amiga Leal' },
  { nome: 'Obito', raridade: 'Épico', emoji: '🔥', poder: 4100, desc: 'O Sonho de um Mundo Perfeito' },
  { nome: 'Kisame', raridade: 'Épico', emoji: '🦈', poder: 4050, desc: 'A Besta da Água' },
  { nome: 'Deidara', raridade: 'Épico', emoji: '💥', poder: 4000, desc: 'A Arte é uma Explosão' },
  { nome: 'Sasori', raridade: 'Épico', emoji: '🎭', poder: 3950, desc: 'O Mestre de Marionetes' },
  { nome: 'Tobi', raridade: 'Épico', emoji: '🎃', poder: 3900, desc: 'O Engraçado' },
  { nome: 'Zetsu', raridade: 'Épico', emoji: '🌿', poder: 3850, desc: 'A Sombra' },
  { nome: 'Konan', raridade: 'Épico', emoji: '📄', poder: 3800, desc: 'O Anjo da Paz' },
  { nome: 'Nagato', raridade: 'Épico', emoji: '👁️', poder: 3750, desc: 'A Dor' },
  { nome: 'Hidan', raridade: 'Épico', emoji: '💀', poder: 3700, desc: 'O Imortal' },
  { nome: 'Kakuzu', raridade: 'Épico', emoji: '💰', poder: 3650, desc: 'O Ganancioso' },
  { nome: 'Suigetsu', raridade: 'Épico', emoji: '💧', poder: 3600, desc: 'Corpo de Água' },
  { nome: 'Juugo', raridade: 'Épico', emoji: '😤', poder: 3550, desc: 'A Fúria da Natureza' },
  { nome: 'Karin', raridade: 'Épico', emoji: '❤️', poder: 3500, desc: 'A Sensorial' },
  { nome: 'Shizune', raridade: 'Épico', emoji: '💚', poder: 3450, desc: 'A Assistente da Hokage' },
  { nome: 'Tsunade', raridade: 'Épico', emoji: '💎', poder: 3400, desc: 'A Quinta Hokage' },
  { nome: 'Jiraiya', raridade: 'Épico', emoji: '🐸', poder: 3350, desc: 'O Sábio do Livro' },
  { nome: 'Orochimaru', raridade: 'Épico', emoji: '🐍', poder: 3300, desc: 'A Eternidade' },
  { nome: 'Kabuto', raridade: 'Épico', emoji: '🐢', poder: 3250, desc: 'O Curandeiro Sombrio' },
  { nome: 'Shino', raridade: 'Épico', emoji: '🐛', poder: 3200, desc: 'Insetos Companheiros' },
  { nome: 'Kiba', raridade: 'Épico', emoji: '🐺', poder: 3150, desc: 'O Lobinho Corajoso' },
  { nome: 'Hinata Hyuga', raridade: 'Épico', emoji: '☀️', poder: 3100, desc: 'Sol Brilhante' },
  { nome: 'TenTen', raridade: 'Épico', emoji: '⚔️', poder: 3050, desc: 'A Invocadora de Armas' },
  { nome: 'Konohamaru', raridade: 'Épico', emoji: '🔥', poder: 3000, desc: 'O Neto do Terceiro' },
  { nome: 'Moegi', raridade: 'Épico', emoji: '🌳', poder: 2950, desc: 'Amiga de Konohamaru' },
  { nome: 'Udon', raridade: 'Épico', emoji: '📐', poder: 2900, desc: 'O Estudioso' },
  { nome: 'Hanabi', raridade: 'Épico', emoji: '🌸', poder: 2850, desc: 'A Irmã Mais Nova' },

  // 🟦 RAROS — 70
  { nome: 'Criança da Vila', raridade: 'Raro', emoji: '👦', poder: 2800, desc: 'Sonha em ser aventureiro' },
  { nome: 'Comerciante', raridade: 'Raro', emoji: '🛒', poder: 2750, desc: 'Vende coisas úteis' },
  { nome: 'Guarda da Cidade', raridade: 'Raro', emoji: '🛡️', poder: 2700, desc: 'Protege os cidadãos' },
  { nome: 'Ferreiro', raridade: 'Raro', emoji: '🔨', poder: 2650, desc: 'Faz armas e armaduras' },
  { nome: 'Curandeiro', raridade: 'Raro', emoji: '💚', poder: 2600, desc: 'Cura os feridos' },
  { nome: 'Caçador', raridade: 'Raro', emoji: '🏇', poder: 2550, desc: 'Conhece a floresta' },
  { nome: 'Pescador', raridade: 'Raro', emoji: '🎣', poder: 2500, desc: 'Pega peixes raros' },
  { nome: 'Agricultor', raridade: 'Raro', emoji: '🌾', poder: 2450, desc: 'Planta alimentos' },
  { nome: 'Estudante', raridade: 'Raro', emoji: '📚', poder: 2400, desc: 'Aprendendo coisas novas' },
  { nome: 'Padeiro', raridade: 'Raro', emoji: '🥖', poder: 2350, desc: 'Faz pão quentinho' },
  { nome: 'Lixeiro', raridade: 'Raro', emoji: '🗑️', poder: 2300, desc: 'Mantém a cidade limpa' },
  { nome: 'Cozinheiro', raridade: 'Raro', emoji: '👨‍🍳', poder: 2250, desc: 'Faz comida deliciosa' },
  { nome: 'Pintor', raridade: 'Raro', emoji: '🎨', poder: 2200, desc: 'Cria beleza' },
  { nome: 'Músico', raridade: 'Raro', emoji: '🎵', poder: 2150, desc: 'Toca melodias' },
  { nome: 'Dançarino', raridade: 'Raro', emoji: '💃', poder: 2100, desc: 'Se move com graça' },
  { nome: 'Poeta', raridade: 'Raro', emoji: '📝', poder: 2050, desc: 'Escreve versos' },
  { nome: 'Contador de Histórias', raridade: 'Raro', emoji: '📖', poder: 2000, desc: 'Conta lendas antigas' },
  { nome: 'Viajante', raridade: 'Raro', emoji: '🎒', poder: 1950, desc: 'Conhece terras distantes' },
  { nome: 'Explorador', raridade: 'Raro', emoji: '🗺️', poder: 1900, desc: 'Descobre novos lugares' },
  { nome: 'Cartógrafo', raridade: 'Raro', emoji: '🗺️', poder: 1850, desc: 'Desenha mapas' },
  { nome: 'Astrônomo', raridade: 'Raro', emoji: '🔭', poder: 1800, desc: 'Observa as estrelas' },
  { nome: 'Botânico', raridade: 'Raro', emoji: '🌿', poder: 1750, desc: 'Estuda as plantas' },
  { nome: 'Geólogo', raridade: 'Raro', emoji: '⛰️', poder: 1700, desc: 'Conhece as pedras' },
  { nome: 'Médico', raridade: 'Raro', emoji: '⚕️', poder: 1650, desc: 'Cuida dos doentes' },
  { nome: 'Boticário', raridade: 'Raro', emoji: '🧪', poder: 1600, desc: 'Faz remédios' },
  { nome: 'Alquimista', raridade: 'Raro', emoji: '⚗️', poder: 1550, desc: 'Transforma coisas' },
  { nome: 'Ferreira', raridade: 'Raro', emoji: '🔩', poder: 1500, desc: 'Conserta coisas' },
  { nome: 'Carpinteiro', raridade: 'Raro', emoji: '🪓', poder: 1450, desc: 'Constrói casas' },
  { nome: 'Pedreiro', raridade: 'Raro', emoji: '🧱', poder: 1400, desc: 'Constrói paredes' },
  { nome: 'Teceira', raridade: 'Raro', emoji: '🧶', poder: 1350, desc: 'Faz roupas' },
  { nome: 'Costureira', raridade: 'Raro', emoji: '🧵', poder: 1300, desc: 'Conserta roupas' },
  { nome: 'Sapateiro', raridade: 'Raro', emoji: '👞', poder: 1250, desc: 'Faz sapatos' },
  { nome: 'Fazendeiro', raridade: 'Raro', emoji: '🐄', poder: 1200, desc: 'Cuida dos animais' },
  { nome: 'Jardineiro', raridade: 'Raro', emoji: '🌷', poder: 1150, desc: 'Cuida das flores' },
  { nome: 'Caminhoneiro', raridade: 'Raro', emoji: '🚛', poder: 1100, desc: 'Transporta coisas' },
  { nome: 'Barqueiro', raridade: 'Raro', emoji: '⛵', poder: 1050, desc: 'Atravessa rios' },
  { nome: 'Guia', raridade: 'Raro', emoji: '🚩', poder: 1000, desc: 'Mostra o caminho' },
  { nome: 'Mensageiro', raridade: 'Raro', emoji: '📨', poder: 950, desc: 'Entrega notícias' },
  { nome: 'Escrivão', raridade: 'Raro', emoji: '✍️', poder: 900, desc: 'Escreve documentos' },
  { nome: 'Bibliotecário', raridade: 'Raro', emoji: '📚', poder: 850, desc: 'Guarda o conhecimento' },
  { nome: 'Arquivista', raridade: 'Raro', emoji: '🗄️', poder: 800, desc: 'Organiza registros' },
  { nome: 'Artesão', raridade: 'Raro', emoji: '🏺', poder: 750, desc: 'Faz coisas belas' },
  { nome: 'Joalheiro', raridade: 'Raro', emoji: '💎', poder: 700, desc: 'Trabalha com pedras preciosas' },
  { nome: 'Ourives', raridade: 'Raro', emoji: '🥇', poder: 650, desc: 'Trabalha com ouro' },
  { nome: 'Mercador', raridade: 'Raro', emoji: '💰', poder: 600, desc: 'Compra e vende' },
  { nome: 'Bancoário', raridade: 'Raro', emoji: '🏦', poder: 550, desc: 'Cuida do dinheiro' },
  { nome: 'Juiz', raridade: 'Raro', emoji: '⚖️', poder: 500, desc: 'Julga com justiça' },
  { nome: 'Padre', raridade: 'Raro', emoji: '⛪', poder: 450, desc: 'Oração e fé' },
  { nome: 'Monge', raridade: 'Raro', emoji: '🧘', poder: 400, desc: 'Sabedoria interior' },
  { nome: 'Eremita', raridade: 'Raro', emoji: '🏕️', poder: 350, desc: 'Vive na solidão' },
  { nome: 'Koby', raridade: 'Raro', emoji: '🔺', poder: 300, desc: 'O Herói do Mar' },
  { nome: 'Helmeppo', raridade: 'Raro', emoji: '👮', poder: 250, desc: 'O Oficial Honrado' },
  { nome: 'Makino', raridade: 'Raro', emoji: '🌿', poder: 200, desc: 'Dona do Bar' },
  { nome: 'Buggy', raridade: 'Raro', emoji: '🤡', poder: 150, desc: 'O Palhaço' },
  { nome: 'Alvida', raridade: 'Raro', emoji: '⭐', poder: 100, desc: 'A Mais Bela do Mundo' },
  { nome: 'Zeff', raridade: 'Raro', emoji: '🦵', poder: 90, desc: 'Perna Vermelha' },
  { nome: 'Gin', raridade: 'Raro', emoji: '💀', poder: 80, desc: 'O Demônio' },
  { nome: 'Pearl', raridade: 'Raro', emoji: '🔴', poder: 70, desc: 'A Pérola Vermelha' },
  { nome: 'Johnny', raridade: 'Raro', emoji: '⚓', poder: 60, desc: 'O Caçador de Piratas' },
  { nome: 'Yosaku', raridade: 'Raro', emoji: '🔪', poder: 50, desc: 'O Caçador de Piratas' },
  { nome: 'Kuro', raridade: 'Raro', emoji: '🐱', poder: 40, desc: 'O Gato Selvagem' },
  { nome: 'Gaimon', raridade: 'Raro', emoji: '📦', poder: 30, desc: 'O Homem na Caixa' },
  { nome: 'Woop Slap', raridade: 'Raro', emoji: '🤚', poder: 20, desc: 'O Conselheiro Sábio' },
  { nome: 'Morgan', raridade: 'Raro', emoji: '⚓', poder: 10, desc: 'O Chefe Corrupto' },

  // 🟩 INCOMUNS — 50
  { nome: 'Cafézinho', raridade: 'Incomum', emoji: '☕', poder: 100, desc: 'Energia para o dia!' },
  { nome: 'Pãozinho', raridade: 'Incomum', emoji: '🥖', poder: 95, desc: 'Fofinho e quentinho' },
  { nome: 'Água Fresca', raridade: 'Incomum', emoji: '💧', poder: 90, desc: 'Refrescante!' },
  { nome: 'Maçã', raridade: 'Incomum', emoji: '🍎', poder: 85, desc: 'Uma maçã por dia...' },
  { nome: 'Florzinha', raridade: 'Incomum', emoji: '🌸', poder: 80, desc: 'Bonita e delicada' },
  { nome: 'Pedra Lisa', raridade: 'Incomum', emoji: '🪨', poder: 75, desc: 'Firme e forte' },
  { nome: 'Folha Seca', raridade: 'Incomum', emoji: '🍂', poder: 70, desc: 'Caiu da árvore' },
  { nome: 'Gota de Chuva', raridade: 'Incomum', emoji: '🌧️', poder: 65, desc: 'Cai do céu' },
  { nome: 'Grama Verde', raridade: 'Incomum', emoji: '🌿', poder: 60, desc: 'Cresce em todo lugar' },
  { nome: 'Passarinho', raridade: 'Incomum', emoji: '🐦', poder: 55, desc: 'Canta de manhã' },
  { nome: 'Borboleta', raridade: 'Incomum', emoji: '🦋', poder: 52, desc: 'Voa livremente' },
  { nome: 'Formiguinha', raridade: 'Incomum', emoji: '🐜', poder: 48, desc: 'Trabalhadora incansável' },
  { nome: 'Joaninha', raridade: 'Incomum', emoji: '🐞', poder: 45, desc: 'Dá sorte!' },
  { nome: 'Estrela', raridade: 'Incomum', emoji: '⭐', poder: 42, desc: 'Brilha à noite' },
  { nome: 'Lua Crescente', raridade: 'Incomum', emoji: '🌙', poder: 38, desc: 'Ilumina o caminho' },
  { nome: 'Sol Nascente', raridade: 'Incomum', emoji: '🌅', poder: 35, desc: 'Começo de um novo dia' },
  { nome: 'Nuvem Branca', raridade: 'Incomum', emoji: '☁️', poder: 32, desc: 'Suave e leve' },
  { nome: 'Arco-Íris', raridade: 'Incomum', emoji: '🌈', poder: 30, desc: 'Depois da tempestade' },
  { nome: 'Semente', raridade: 'Incomum', emoji: '🌱', poder: 28, desc: 'Tudo começa pequeno' },
  { nome: 'Cogumelo', raridade: 'Incomum', emoji: '🍄', poder: 25, desc: 'Cresce na sombra' },
  { nome: 'Pinha', raridade: 'Incomum', emoji: '🌰', poder: 22, desc: 'Presente da natureza' },
  { nome: 'Concha', raridade: 'Incomum', emoji: '🐚', poder: 20, desc: 'Lembrança do mar' },
  { nome: 'Areia', raridade: 'Incomum', emoji: '🏖️', poder: 18, desc: 'Grão por grão' },
  { nome: 'Espuma do Mar', raridade: 'Incomum', emoji: '🌊', poder: 15, desc: 'Suave como o vento' },
  { nome: 'Vento Leve', raridade: 'Incomum', emoji: '🍃', poder: 12, desc: 'Sussurra ao ouvido' },
  { nome: 'Sombra', raridade: 'Incomum', emoji: '🌑', poder: 10, desc: 'Sempre com você' },
  { nome: 'Sorriso', raridade: 'Incomum', emoji: '😊', poder: 8, desc: 'A arma mais poderosa' },
  { nome: 'Esperança', raridade: 'Incomum', emoji: '✨', poder: 5, desc: 'Nunca morre' },
  { nome: 'Amizade', raridade: 'Incomum', emoji: '🤝', poder: 3, desc: 'O verdadeiro poder' },
  { nome: 'Gratidão', raridade: 'Incomum', emoji: '🙏', poder: 2, desc: 'O coração feliz' },
  { nome: 'Amor', raridade: 'Incomum', emoji: '❤️', poder: 1, desc: 'O mais forte de todos' }
];

// 📝 COMANDOS
const comandos = [
  { name: 'roll', description: 'Gire para conseguir um personagem! 🎲' },
  { name: 'spin', description: 'Veja quantos spins você tem! 🎰' },
  {
    name: 'comprar',
    description: 'Compre mais spins! 💰',
    options: [
      { name: 'quantidade', type: 4, description: 'Quantos spins quer comprar? (máx: 1000)', required: true, min_value: 1, max_value: 1000 }
    ]
  },
  { name: 'perfil', description: 'Veja seu perfil completo! 👤' },
  { name: 'inventario', description: 'Veja seus itens! 🎒' },
  { name: 'colecao', description: 'Veja todos seus personagens! 📖' },
  { name: 'diario', description: 'Resgate sua recompensa diária! 📅' },
  { name: 'loja', description: 'Visite a loja! 🛒' },
  { name: 'ranking', description: 'Veja os melhores colecionadores! 🏆' },
  {
    name: 'equipar',
    description: 'Equipe um item! ⚔️',
    options: [
      { name: 'item', type: 3, description: 'Digite o ID do item', required: true }
    ]
  }
];

// 🎯 LÓGICA DOS COMANDOS
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  const jogador = garantirJogador(interaction.user.id);

  // 🎲 /ROLL
  if (interaction.commandName === 'roll') {
    if (jogador.spins <= 0) {
      return interaction.reply({ content: '❌ Você não tem mais spins! Use `/comprar` para adquirir mais.', ephemeral: true });
    }

    jogador.spins--;
    let pesoAleatorio = Math.random();
    
    const bonusEquip = jogador.equipado?.bonus || 0;
    if (bonusEquip > 0) pesoAleatorio -= pesoAleatorio * bonusEquip;

    let raridadeEscolhida, listaRaridade;

    if (pesoAleatorio < 0.02) {
      raridadeEscolhida = 'GM';
      listaRaridade = personagens.filter(p => p.raridade === 'GM');
    } else if (pesoAleatorio < 0.07) {
      raridadeEscolhida = 'Mítico';
      listaRaridade = personagens.filter(p => p.raridade === 'Mítico');
    } else if (pesoAleatorio < 0.17) {
      raridadeEscolhida = 'Lendário';
      listaRaridade = personagens.filter(p => p.raridade === 'Lendário');
    } else if (pesoAleatorio < 0.32) {
      raridadeEscolhida = 'Épico';
      listaRaridade = personagens.filter(p => p.raridade === 'Épico');
    } else if (pesoAleatorio < 0.52) {
      raridadeEscolhida = 'Raro';
      listaRaridade = personagens.filter(p => p.raridade === 'Raro');
    } else if (pesoAleatorio < 0.80) {
      raridadeEscolhida = 'Incomum';
      listaRaridade = personagens.filter(p => p.raridade === 'Incomum');
    } else {
      raridadeEscolhida = 'Comum';
      listaRaridade = personagens.filter(p => p.raridade === 'Comum');
    }

    const personagemSorteado = listaRaridade[Math.floor(Math.random() * listaRaridade.length)];
    jogador.colecao.push(personagemSorteado);
    
    jogador.xp += 10;
    const xpNecessario = Number(jogador.nivel) * 100 || 100;
    if (jogador.xp >= xpNecessario) {
      jogador.nivel = Number(jogador.nivel) + 1;
      jogador.xp = 0;
    }
    
    salvarDados();

    const corRaridade = {
      'GM': '#FFD700',
      'Mítico': '#FF4500',
      'Lendário': '#FFA500',
      'Épico': '#9932CC',
      'Raro': '#0066FF',
      'Incomum': '#00CC00',
      'Comum': '#808080'
    };

    const nomeExibicao = raridadeEscolhida === 'GM' ? '🏆 Grande Master' : raridadeEscolhida;

    const embedRoll = new EmbedBuilder()
      .setColor(corRaridade[raridadeEscolhida])
      .setTitle('🎉 NOVO PERSONAGEM!')
      .setDescription(`**${personagemSorteado.emoji} ${personagemSorteado.nome}**\n⭐ Raridade: **${nomeExibicao}**\n💪 Poder: ${personagemSorteado.poder}\n📝 ${personagemSorteado.desc}\n\n🎰 Spins restantes: **${Number(jogador.spins)}**\n⭐ XP: **${Number(jogador.xp)}/${xpNecessario}**`)
      .setTimestamp();

    return interaction.reply({ embeds: [embedRoll] });
  }

  // 🎰 /SPIN
  if (interaction.commandName === 'spin') {
    const embedSpin = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('🎰 Seus Spins')
      .setDescription(`Você tem **${Number(jogador.spins)}** spins!\n\n💰 Cada spin custa: **50 moedas**\n📦 Compra máxima: **1000 spins**`)
      .setFooter({ text: 'Use /comprar para adquirir mais spins!' })
      .setTimestamp();
    return interaction.reply({ embeds: [embedSpin] });
  }

  // 💰 /COMPRAR
  if (interaction.commandName === 'comprar') {
    const quantidade = interaction.options.getInteger('quantidade');

    if (quantidade > 1000) {
      return interaction.reply({ content: '❌ Limite máximo de **1000 spins** por compra!', ephemeral: true });
    }

    const custoTotal = quantidade * 50;

    if (jogador.moedas < custoTotal) {
      return interaction.reply({
        content: `❌ Moedas insuficientes!\nVocê tem: **${jogador.moedas}** 💰\nPrecisa: **${custoTotal}** 💰\nFaltam: **${custoTotal - jogador.moedas}** 💰`,
        ephemeral: true
      });
    }

    jogador.moedas -= custoTotal;
    jogador.spins = Number(jogador.spins) + quantidade;
    salvarDados();

    const embedCompra = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Compra Realizada!')
      .addFields(
        { name: '🎰 Spins comprados', value: `+${quantidade}`, inline: true },
        { name: '💰 Custo total', value: `${custoTotal} moedas`, inline: true },
        { name: '💵 Saldo restante', value: `${jogador.moedas}`, inline: true },
        { name: '🎰 Total de spins', value: `${Number(jogador.spins)}`, inline: true }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embedCompra] });
  }

  // 📅 /DIARIO
  if (interaction.commandName === 'diario') {
    const hoje = new Date().toDateString();
    if (jogador.diarioResgatado === hoje) {
      return interaction.reply({ content: '❌ Você já resgatou sua recompensa hoje! Volta amanhã às meia-noite!', ephemeral: true });
    }

    jogador.moedas += 100;
    jogador.spins = Number(jogador.spins) + 1;
    jogador.xp += 50;
    
    const xpNecessario = Number(jogador.nivel) * 100 || 100;
    if (jogador.xp >= xpNecessario) {
      jogador.nivel = Number(jogador.nivel) + 1;
      jogador.xp = 0;
    }
    
    jogador.diarioResgatado = hoje;
    salvarDados();

    const embedDiario = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📅 Recompensa Diária!')
      .setDescription(`Bem-vindo de volta, **${interaction.user.username}**! Aqui está seu prêmio de hoje:`)
      .addFields(
        { name: '💰 Moedas', value: '+100', inline: true },
        { name: '🎰 Spins', value: '+1', inline: true },
        { name: '⭐ XP', value: '+50', inline: true },
        { name: '📅 Próximo resgate', value: 'Amanhã!', inline: true }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embedDiario] });
  }

  // 👤 /PERFIL
  if (interaction.commandName === 'perfil') {
    const qtdPersonagens = jogador.colecao.length;
    const totalPersonagens = personagens.length;
    const progresso = Math.round((qtdPersonagens / totalPersonagens) * 100);
    const xpNecessario = Number(jogador.nivel) * 100 || 100;
    const porcentagemXp = Math.round((Number(jogador.xp) / xpNecessario) * 100);

    let poderTotal = 0;
    jogador.colecao.forEach(p => { poderTotal += p.poder || 0; });

    const embedPerfil = new EmbedBuilder()
      .setColor('#9932CC')
      .setTitle(`👤 Perfil de ${interaction.user.username}`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '⭐ Nível', value: `${jogador.nivel}`, inline: true },
        { name: '📊 XP', value: `${Number(jogador.xp)}/${xpNecessario} (${porcentagemXp}%)`, inline: true },
        { name: '💰 Moedas', value: `${jogador.moedas}`, inline: true },
        { name: '💎 Gemas', value: `${jogador.gemas}`, inline: true },
        { name: '🎰 Spins', value: `${Number(jogador.spins)}`, inline: true },
        { name: '💪 Poder Total', value: `${poderTotal}`, inline: true },
        { name: '📖 Coleção', value: `${qtdPersonagens}/${totalPersonagens} (${progresso}%)`, inline: true },
        { name: '⚔️ Equipado', value: jogador.equipado ? `**${jogador.equipado.nome}**\n+${((jogador.equipado.bonus || 0)*100).toFixed(0)}% de sorte` : 'Nenhum', inline: false }
      )
      .setDescription('Continue rolando para completar sua coleção e subir de nível! 🚀')
      .setTimestamp();

    return interaction.reply({ embeds: [embedPerfil] });
  }

  // 🎒 /INVENTARIO
  if (interaction.commandName === 'inventario') {
    if (jogador.colecao.length === 0 && jogador.inventario.length === 0) {
      return interaction.reply({ content: '❌ Seu inventário está vazio! Use `/roll` para conseguir seu primeiro personagem!', ephemeral: true });
    }

    const ordemRaridade = ['GM', 'Mítico', 'Lendário', 'Épico', 'Raro', 'Incomum', 'Comum'];
    const nomesExibicao = {
      'GM': '🏆 Grande Master',
      'Mítico': '🟥 Mítico',
      'Lendário': '🟧 Lendário',
      'Épico': '🟪 Épico',
      'Raro': '🟦 Raro',
      'Incomum': '🟩 Incomum',
      'Comum': '⬜ Comum'
    };

    let descricao = '';
    let poderTotal = 0;
    
    if (jogador.colecao.length > 0) {
      const grupos = {};
      jogador.colecao.forEach(p => {
        if (!grupos[p.raridade]) grupos[p.raridade] = [];
        grupos[p.raridade].push(p);
        poderTotal += p.poder || 0;
      });

      descricao += '📖 **Seus Personagens:**\n';
      for (const rar of ordemRaridade) {
        if (grupos[rar]) {
          descricao += `\n**${nomesExibicao[rar]} — ${grupos[rar].length}**\n`;
          grupos[rar].forEach(p => {
            descricao += `${p.emoji} ${p.nome} — ${p.poder}⚔️\n`;
          });
        }
      }
    }

    if (jogador.inventario.length > 0) {
      descricao += '\n🛒 **Seus Itens:**\n';
      jogador.inventario.forEach(item => {
        const equipado = jogador.equipado?.id === item.id ? ' ✅ **EQUIPADO**' : '';
        descricao += `└ ${item.nome}${equipado}\n`;
      });
    }

    const embedInv = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle('🎒 Seu Inventário')
      .setDescription(descricao)
      .addFields(
        { name: '📊 Total de Personagens', value: `${jogador.colecao.length}`, inline: true },
        { name: '💪 Poder Total', value: `${poderTotal}`, inline: true },
        { name: '🛒 Itens da Loja', value: `${jogador.inventario.length}`, inline: true }
      )
      .setFooter({ text: `Continue coletando para completar sua coleção!` })
      .setTimestamp();

    return interaction.reply({ embeds: [embedInv] });
  }

  // 📖 /COLEÇÃO
  if (interaction.commandName === 'colecao') {
    if (jogador.colecao.length === 0) {
      return interaction.reply({ content: '📖 Sua coleção está vazia! Use `/roll` para conseguir seu primeiro personagem!', ephemeral: true });
    }

    const ordemRaridade = ['GM', 'Mítico', 'Lendário', 'Épico', 'Raro', 'Incomum', 'Comum'];
    const nomesExibicao = {
      'GM': '🏆 Grande Master',
      'Mítico': '🟥 Mítico',
      'Lendário': '🟧 Lendário',
      'Épico': '🟪 Épico',
      'Raro': '🟦 Raro',
      'Incomum': '🟩 Incomum',
      'Comum': '⬜ Comum'
    };

    let descricao = '';
    const grupos = {};
    
    jogador.colecao.forEach(p => {
      if (!grupos[p.raridade]) grupos[p.raridade] = [];
      grupos[p.raridade].push(p);
    });

    for (const rar of ordemRaridade) {
      if (grupos[rar]) {
        descricao += `\n**${nomesExibicao[rar]} — ${grupos[rar].length}**\n`;
        grupos[rar].forEach(p => {
          descricao += `${p.emoji} ${p.nome} — ${p.poder}⚔️\n`;
        });
      }
    }

    const total = personagens.length;
    const possui = jogador.colecao.length;
    const progresso = Math.round((possui / total) * 100);

    const embedColecao = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle(`📖 Coleção de ${interaction.user.username}`)
      .setDescription(descricao)
      .addFields(
        { name: '📖 Progresso da Coleção', value: `${possui}/${total} — **${progresso}%**`, inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embedColecao] });
  }

  // 🏆 /RANKING
  if (interaction.commandName === 'ranking') {
    const listaJogadores = Object.entries(jogadores)
      .map(([id, dados]) => ({
        id,
        nome: dados.nome || 'Jogador',
        nivel: dados.nivel || 1,
        poder: (dados.colecao || []).reduce((s, p) => s + (p.poder || 0), 0),
        personagens: (dados.colecao || []).length
      }))
      .sort((a, b) => b.poder - a.poder)
      .slice(0, 10);

    let descricao = '';
    listaJogadores.forEach((j, i) => {
      const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      descricao += `${medalha} **${j.nome}** — Nv.${j.nivel} | ${j.poder}⚔️ | ${j.personagens} personagens\n`;
    });

    if (listaJogadores.length === 0) {
      descricao = 'Ainda não há jogadores! Seja o primeiro a usar `/roll`!';
    }

    const embedRanking = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Ranking de Poder')
      .setDescription(descricao)
      .setFooter({ text: 'Atualizado em tempo real' })
      .setTimestamp();

    return interaction.reply({ embeds: [embedRanking] });
  }

  // 🛒 /LOJA
  if (interaction.commandName === 'loja') {
    const embedPrincipal = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle('🏪 Loja do Pescador')
      .setDescription('Escolha uma categoria abaixo usando os botões!')
      .addFields(
        { name: '🎣 Varas', value: 'Melhores chances de personagens raros', inline: true },
        { name: '🪱 Iscas', value: 'Multiplicadores de sorte', inline: true },
        { name: '💰 Seu Saldo', value: `${jogador.moedas} moedas`, inline: true }
      )
      .setTimestamp();

    const botoes = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('loja_varas').setLabel('🎣 Varas').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('loja_iscas').setLabel('🪱 Iscas').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('loja_fechar').setLabel('❌ Fechar').setStyle(ButtonStyle.Danger)
      );

    return interaction.reply({ embeds: [embedPrincipal], components: [botoes] });
  }

  // ⚔️ /EQUIPAR
  if (interaction.commandName === 'equipar') {
    const idItem = interaction.options.getString('item');
    const itemEncontrado = jogador.inventario.find(i => i.id === idItem);

    if (!itemEncontrado) {
      return interaction.reply({ content: '❌ Você não possui esse item! Use `/loja` para ver os disponíveis.', ephemeral: true });
    }

    jogador.equipado = itemEncontrado;
    salvarDados();

    const embedEquipado = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('⚔️ Item Equipado!')
      .setDescription(`**${itemEncontrado.nome}** está agora equipado!\n\n✨ ${itemEncontrado.desc}`)
      .setTimestamp();

    return interaction.reply({ embeds: [embedEquipado] });
  }

  // 🎯 BOTÕES DA LOJA
  if (interaction.isButton()) {
    const userId = interaction.user.id
    const jogadorBtn = garantirJogador(userId);

    if (interaction.customId === 'loja_fechar') {
      return interaction.update({ content: '✅ Loja fechada!', embeds: [], components: [] });
    }

    if (interaction.customId === 'loja_varas') {
      let descricao = '';
      lojaItens.varas.forEach(item => {
        const possui = jogadorBtn.inventario.some(i => i.id === item.id) ? ' ✅ (Você já tem)' : '';
        const podeComprar = jogadorBtn.moedas >= item.preco && jogadorBtn.nivel >= item.nivel;
        const bloqueado = jogadorBtn.nivel < item.nivel ? ` 🔒 Precisa ser Nível ${item.nivel}` : '';
        descricao += `**${item.nome}** — ${item.preco} 💰${possui}${bloqueado}\n└ ${item.desc}\n`;
      });

      const embedVaras = new EmbedBuilder()
        .setColor('#4169E1')
        .setTitle('🎣 Loja — Varas')
        .setDescription(descricao)
        .setFooter({ text: `Seu saldo: ${jogadorBtn.moedas} 💰 | Nível ${jogadorBtn.nivel}` })
        .setTimestamp();

      const botoesVoltar = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('loja_voltar').setLabel('⬅️ Voltar').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('loja_fechar').setLabel('❌ Fechar').setStyle(ButtonStyle.Danger)
        );

      return interaction.update({ embeds: [embedVaras], components: [botoesVoltar] });
    }

    if (interaction.customId === 'loja_iscas') {
      let descricao = '';
      lojaItens.iscas.forEach(item => {
        const possui = jogadorBtn.inventario.some(i => i.id === item.id) ? ' ✅ (Você já tem)' : '';
        const bloqueado = jogadorBtn.nivel < item.nivel ? ` 🔒 Precisa ser Nível ${item.nivel}` : '';
        descricao += `**${item.nome}** — ${item.preco} 💰${possui}${bloqueado}\n└ ${item.desc}\n`;
      });

      const embedIscas = new EmbedBuilder()
        .setColor('#32CD32')
        .setTitle('🪱 Loja — Iscas')
        .setDescription(descricao)
        .setFooter({ text: `Seu saldo: ${jogadorBtn.moedas} 💰 | Nível ${jogadorBtn.nivel}` })
        .setTimestamp();

      const botoesVoltar = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('loja_voltar').setLabel('⬅️ Voltar').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('loja_fechar').setLabel('❌ Fechar').setStyle(ButtonStyle.Danger)
        );

      return interaction.update({ embeds: [embedIscas], components: [botoesVoltar] });
    }

    if (interaction.customId === 'loja_voltar') {
      const embedPrincipal = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('🏪 Loja do Pescador')
        .setDescription('Escolha uma categoria abaixo usando os botões!')
        .addFields(
          { name: '🎣 Varas', value: 'Melhores chances de personagens raros', inline: true },
          { name: '🪱 Iscas', value: 'Multiplicadores de sorte', inline: true },
          { name: '💰 Seu Saldo', value: `${jogadorBtn.moedas} moedas`, inline: true }
        )
        .setTimestamp();

      const botoes = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('loja_varas').setLabel('🎣 Varas').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('loja_iscas').setLabel('🪱 Iscas').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('loja_fechar').setLabel('❌ Fechar').setStyle(ButtonStyle.Danger)
        );

      return interaction.update({ embeds: [embedPrincipal], components: [botoes] });
    }
  }
});

// ==============================================
// 🚀 INICIALIZAÇÃO DO BOT
// ==============================================
client.on('ready', async () => {
  console.log(`✅ Logado como: ${client.user.tag}`);
  console.log(`🎯 Total de personagens: ${personagens.length}`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('🔄 Limpando comandos antigos...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENTE_ID, SERVIDOR_ID),
      { body: [] }
    );
    console.log('✅ Comandos antigos removidos!');

    console.log('🔄 Registrando comandos novos...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENTE_ID, SERVIDOR_ID),
      { body: comandos }
    );
    console.log('✅ Comandos registrados com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 BOT PRONTO PARA USO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Comandos disponíveis:');
    comandos.forEach(c => console.log(`   /${c.name}`));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (erro) {
    console.error('❌ Erro ao registrar comandos:', erro);
  }
});

client.login(TOKEN);
