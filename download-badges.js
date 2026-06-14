const fs = require('fs');
const path = require('path');
const https = require('https');

const COUNTRY_TRANSLATIONS = {
  // Américas (CONMEBOL e CONCACAF)
  "Argentina": "Argentina",
  "Brazil": "Brasil",
  "Canada": "Canadá",
  "Colombia": "Colômbia",
  "Curacao": "Curaçao",
  "Ecuador": "Equador",
  "Haiti": "Haiti",
  "Mexico": "México",
  "Panama": "Panamá",
  "Paraguay": "Paraguai",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Uruguay": "Uruguai",

  // Europa (UEFA)
  "Austria": "Áustria",
  "Belgium": "Bélgica",
  "Bosnia and Herzegovina": "Bósnia e Herzegovina",
  "Croatia": "Croácia",
  "Czech Republic": "República Tcheca",
  "England": "Inglaterra",
  "France": "França",
  "Germany": "Alemanha",
  "Netherlands": "Holanda",
  "Norway": "Noruega",
  "Portugal": "Portugal",
  "Scotland": "Escócia",
  "Spain": "Espanha",
  "Sweden": "Suécia",
  "Switzerland": "Suíça",
  "Turkey": "Turquia",
  "Türkiye": "Turquia",

  // Ásia e Oceania (AFC e OFC)
  "Australia": "Austrália",
  "Iran": "Irã",
  "Iraq": "Iraque",
  "Japan": "Japão",
  "Jordan": "Jordânia",
  "New Zealand": "Nova Zelândia",
  "Qatar": "Catar",
  "Saudi Arabia": "Arábia Saudita",
  "South Korea": "Coreia do Sul",
  "Uzbekistan": "Uzbequistão",

  // África (CAF)
  "Algeria": "Argélia",
  "Cape Verde": "Cabo Verde",
  "DR Congo": "RD Congo",
  "Egypt": "Egito",
  "Ghana": "Gana",
  "Ivory Coast": "Costa do Marfim",
  "Morocco": "Marrocos",
  "Senegal": "Senegal",
  "South Africa": "África do Sul",
  "Tunisia": "Tunísia",
  "Italy": "Itália"
};

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';
const BADGES_DIR = path.join(__dirname, 'public', 'badges');

if (!fs.existsSync(BADGES_DIR)) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve(); // Já existe
      return;
    }
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Falha ao baixar: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const teams = Object.keys(COUNTRY_TRANSLATIONS);
  console.log(`Baixando escudos para ${teams.length} seleções...`);

  for (const team of teams) {
    try {
      const fileName = `${team.replace(/\s+/g, '_')}.png`;
      const destPath = path.join(BADGES_DIR, fileName);
      
      if (fs.existsSync(destPath)) {
        console.log(`[+] ${team} já existe.`);
        continue;
      }

      console.log(`Buscando ${team}...`);
      const url = `${BASE_URL}/searchteams.php?t=${encodeURIComponent(team)}`;
      const data = await fetchJson(url);
      
      if (data.teams && data.teams.length > 0) {
        const badgeUrl = data.teams[0].strTeamBadge;
        if (badgeUrl) {
          await downloadImage(badgeUrl, destPath);
          console.log(`[OK] ${team} salvo!`);
        } else {
          console.log(`[!] ${team} encontrado, mas sem badge.`);
        }
      } else {
        console.log(`[X] ${team} não encontrado na API.`);
      }
      
      // Delay pequeno para não bater limite de API se houver (gratuita)
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      console.error(`Erro processando ${team}:`, error.message);
    }
  }
  
  console.log("Download finalizado!");
}

main();
