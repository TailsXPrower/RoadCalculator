# RoadCalculator
## Maršruta aprēķina rīks - dokumentācija

## Ievads
RoadCalculator ir interaktīvs maršruta plānošanas rīks, kas ļauj lietotājiem aprēķināt ceļa attālumu, ilgumu un izmaksas, ņemot vērā degvielas patēriņu un cenu. Rīks integrē vairākus ārējos servisus, lai nodrošinātu precīzu maršrutēšanu, laikapstākļu prognozes un vietu meklēšanu.

## Sistēmas pārskats

### Galvenās iespējas
- Interaktīva kartes saskarne ar maršruta zīmēšanu
- Degvielas izmaksu kalkulators
- Laikapstākļu prognozes galamērķim
- Vietu meklēšana un ģeolokācija
- Maršruta parametru vizualizācija

### Tehniskā arhitektūra
Projekts ir veidots kā SPA (Single Page Application) ar šādu tehnoloģiju komplektu:
- **Frontend**: React (v18+)
- **Kartes**: Leaflet + React-Leaflet
- **Stila noformējums**: CSS moduļi
- **Stāvokļa pārvaldība**: React Konteksts
- **API komunikācija**: Axios

### Sistēmas diagramma
[Lietotājs]
│
▼
[UI Komponentes] → [API Konteksts] → [Ārējie API]
│ (Axios wrapper)
▼
[State Management]
│
▼
[Karte] ↔ [Kalkulācijas]

## Detalizēts apraksts

### Komponenšu struktūra
src/
├── App.jsx
├── Calculations.jsx - Degvielas izmaksu kalkulators
├── HomePage.jsx - Galvenā lapa
├── Layout.jsx - Navigācijas struktūra
├── Loading.jsx - Ielādes indikators
├── Map.jsx - Kartes komponente
├── WeatherWindow.jsx - Laikapstākļu logs
├── main.jsx
├── context/
│ └── ApiContext.js - API komunikācijas konteksts
└── styles/
├── App.css
├── Global.css
├── Layout.css
├── Loading.css
└── WeatherWindow.css

### API integrācijas
| Serviss            | Galvenās metodes                  | Lietojums                     |
|--------------------|-----------------------------------|-------------------------------|
| WeatherAPI         | getForecast, searchLocations      | Laikapstākļu prognozes        |
| OpenCage           | searchLocations, getPlaceName     | Adrešu ģeokodēšana            |
| OpenRouteService   | getRoute, getNearestRoad          | Maršrutēšana                  |
| TomTom Traffic     | getTraffic (komentēts)            | Satiksmes dati                |

### Galvenās funkcionalitātes
1. **Maršruta izveide**:
    - Lietotājs izvēlas sākuma un gala punktus kartē
    - Maršruts tiek automātiski aprēķināts un attēlots
    - Tiek aprēķināts attālums un paredzamais ceļa ilgums

2. **Izmaksu aprēķins**:
    - Lietotājs ievada degvielas patēriņu (l/100km) un cenu (€/l)
    - Sistēma aprēķina kopējās degvielas izmaksas
    - Tiek parādīts aptuvenais degvielas daudzums un izmaksas

3. **Laikapstākļu prognoze**:
    - Iespēja apskatīt laikapstākļus galamērķī
    - Rādīta pašreizējā situācija un 3 dienu prognoze
    - Detalizēta informācija par temperatūru, vēja ātrumu, mitrumu utt.

## Iespējamie uzlabojumi

### Funkcionāli uzlabojumi
- [ ] Lietotāju kontu sistēma
- [ ] Saglabāto maršrutu vēsture
- [ ] Alternatīvu maršrutu salīdzināšana
- [ ] CO2 emisiju aprēķins
- [ ] Ceļa apstākļu paziņojumi

### Tehniski uzlabojumi
- [ ] Veiktspējas optimizācija lieliem maršrutiem
- [ ] Daudzvalodu atbalsts
- [ ] Pielāgotas mērvienības (jūdzes, galoni)
- [ ] Offline funkcionalitāte

### Lietojamības uzlabojumi
- [ ] Marķieru pārvietošana pēc izvēles
- [ ] Starppunktu pievienošana
- [ ] Maršruta eksports (PDF/GPX)
- [ ] Adaptīvs dizains planšetdatoriem

## Izstrādes resursi
- [OpenRouteService dokumentācija](https://openrouteservice.org/)
- [Leaflet dokumentācija](https://leafletjs.com/)
- [TomTom Traffic API](https://www.tomtom.com/traffic-index/)
- [WeatherAPI dokumentācija](https://www.weatherapi.com/docs/)

## Autori
2025: Vladislavs Rabkevičs  
2025: Romans Frolovs  
2025: Viktors Gridņevs