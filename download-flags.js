const fs = require('fs');
const path = require('path');
const https = require('https');

const COUNTRY_CODES = {
  // Américas
  "Argentina": "ar", "Brazil": "br", "Brasil": "br", "Canada": "ca", "Canadá": "ca",
  "Colombia": "co", "Colômbia": "co", "Curacao": "cw", "Curaçao": "cw",
  "Ecuador": "ec", "Equador": "ec", "Haiti": "ht", "Mexico": "mx", "México": "mx",
  "Panama": "pa", "Panamá": "pa", "Paraguay": "py", "Paraguai": "py",
  "United States": "us", "Estados Unidos": "us", "USA": "us", "Uruguay": "uy", "Uruguai": "uy",

  // Europa
  "Austria": "at", "Áustria": "at", "Belgium": "be", "Bélgica": "be",
  "Bosnia and Herzegovina": "ba", "Bosnia-Herzegovina": "ba", "Bósnia e Herzegovina": "ba",
  "Croatia": "hr", "Croácia": "hr", "Czech Republic": "cz", "República Tcheca": "cz",
  "England": "gb-eng", "Inglaterra": "gb-eng", "France": "fr", "França": "fr",
  "Germany": "de", "Alemanha": "de", "Netherlands": "nl", "Holanda": "nl",
  "Norway": "no", "Noruega": "no", "Portugal": "pt", "Scotland": "gb-sct", "Escócia": "gb-sct",
  "Spain": "es", "Espanha": "es", "Sweden": "se", "Suécia": "se", "Switzerland": "ch", "Suíça": "ch",
  "Turkey": "tr", "Turquia": "tr", "Türkiye": "tr", "Italy": "it", "Itália": "it",

  // Ásia/Oceania
  "Australia": "au", "Austrália": "au", "Iran": "ir", "Irã": "ir", "Iraq": "iq", "Iraque": "iq",
  "Japan": "jp", "Japão": "jp", "Jordan": "jo", "Jordânia": "jo", "New Zealand": "nz", "Nova Zelândia": "nz",
  "Qatar": "qa", "Catar": "qa", "Saudi Arabia": "sa", "Arábia Saudita": "sa",
  "South Korea": "kr", "Coreia do Sul": "kr", "Uzbekistan": "uz", "Uzbequistão": "uz",

  // África
  "Algeria": "dz", "Argélia": "dz", "Cape Verde": "cv", "Cabo Verde": "cv",
  "DR Congo": "cd", "RD Congo": "cd", "Egypt": "eg", "Egito": "eg", "Ghana": "gh", "Gana": "gh",
  "Ivory Coast": "ci", "Costa do Marfim": "ci", "Morocco": "ma", "Marrocos": "ma",
  "Senegal": "sn", "South Africa": "za", "África do Sul": "za", "Tunisia": "tn", "Tunísia": "tn"
};

const BADGES_DIR = path.join(__dirname, 'public', 'badges');

if (!fs.existsSync(BADGES_DIR)) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
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

async function main() {
  const teams = Object.keys(COUNTRY_CODES);
  console.log(`Baixando bandeiras para ${teams.length} variações de nomes...`);

  for (const team of teams) {
    try {
      const code = COUNTRY_CODES[team];
      const fileName = `${team.replace(/\s+/g, '_')}.png`;
      const destPath = path.join(BADGES_DIR, fileName);
      
      const url = `https://flagcdn.com/w160/${code}.png`;
      
      await downloadImage(url, destPath);
      console.log(`[OK] ${team} -> ${code}.png salvo!`);
      
    } catch (error) {
      console.error(`Erro processando ${team}:`, error.message);
    }
  }
  
  console.log("Download finalizado!");
}

main();
