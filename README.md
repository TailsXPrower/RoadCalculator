# RoadCalculator
## Maršruta aprēķina rīks — dokumentācijas ievads

# Rīka apraksts

Šis rīks ir izveidots, lai palīdzētu lietotājiem vienkārši un efektīvi plānot savus ceļojumus, novērtējot ne tikai attālumu starp diviem punktiem, bet arī kopējās ceļa izmaksas, ņemot vērā automašīnas degvielas patēriņu un degvielas cenu. Rīks nodrošina interaktīvu karti un vienkāršu aprēķinu saskarni vienā lietotnē.

# Galvenā funkcionalitāte

1. # Jauna maršruta izveide
   - Lietotājs sāk, izveidojot jaunu maršrutu (ievadot nosaukumu un citus parametrus, ja nepieciešams).
   - Pēc izveides lietotājs tiek novirzīts uz galveno maršruta plānošanas interfeisu.

2. # Interfeiss sadalīts divās daļās
   - Labā puse — karte (izmantojot Leaflet un OpenRouteService API).
     - Lietotājs var izvēlēties divus punktus uz kartes (sākuma un gala punktu).
     - Maršruts tiek automātiski aprēķināts un attēlots uz kartes ar līniju, kā arī tiek noteikts attālums un ceļojuma ilgums.
   - Kreisā puse — aprēķinu forma.
     - Lietotājs ievada:
       - Degvielas patēriņu (`l/100km`)
       - Degvielas cenu (`€/l`)
     - Rezultāts:
       - Kopējais attālums (km)
       - Ceļā pavadītais laiks (min)
       - Aprēķinātais degvielas patēriņš (L)
       - Kopējās izmaksas (€)

3. # Rezultātu saglabāšana
   - Lietotājs var saglabāt maršrutu.
   - Saglabātais maršruts parādās galvenajā ekrānā kā kartīte.
   - Kartīti var atvērt pilnekrāna skatā ar detalizētu informāciju un iespējām rediģēt.
