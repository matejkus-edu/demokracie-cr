/* Harmonogram bloku 4: Cesta demokratickým státem. Úpravy dělejte tady.

   bloky[]     t = nadpis bloku, hodiny = data hodin po třídách (YYYY-MM-DD),
               teorie = [odkaz, popisek], pozn = krátká poznámka (může být jen pro jednu třídu),
               epizody = epizody simulace v bloku.
   epizody[]   k = zkratka (E1…), t = název, hodiny = data hodin (když se liší od bloku), ukoly[].
   ukoly[]     kde: "hodina" | "doma", t = text úkolu, vaha = váha v hodnocení strany (%),
               hodina = data hodiny (když se liší od epizody), od / termin = začátek a termín
               (ISO), kratce = text do „Nejbližších termínů“, odkaz = [#stránka, popisek],
               volitelne = true, volby = true, denik = číslo zápisu,
               vahaZak = váha v individuálním hodnocení žáka (%).
   Kde se hodnota liší po třídách, zapište ji jako { L1B: …, L1C: … }.
   L1C má hodinu v pondělí, L1B v úterý. */

window.HARMONOGRAM = {
  nazev: "Cesta demokratickým státem",

  bloky: [
    {
      t: "Stát a jeho funkce (4.1), Principy právního státu (4.2)",
      hodiny: { L1C: ["2026-10-19"], L1B: ["2026-10-20"] }
    },
    {
      t: "Formy vlády (4.3)",
      hodiny: { L1C: ["2026-11-02"], L1B: ["2026-11-03"] },
      teorie: ["https://matejkus-edu.github.io/politicke-systemy/", "Schéma forem vlády"]
    },
    {
      t: "Politický systém ČR: ústavní instituce a dělba moci (4.4)",
      hodiny: { L1C: ["2026-11-09"], L1B: ["2026-11-10"] },
      teorie: ["#mapa", "Dělba moci"]
    },
    {
      t: "Politické strany, politici a jejich ideologické ukotvení (4.5)",
      hodiny: { L1C: ["2026-11-23"], L1B: ["2026-11-24"] },
      epizody: [
        {
          k: "E1", t: "Zakládání politických stran",
          ukoly: [
            { kde: "hodina", t: "Vytvoříte týmy (každý tým je jedna strana) a zvolíte předsedu nebo předsedkyni strany." },
            { kde: "hodina", t: "Na základě vylosované pozice upřesníte ideologické ukotvení strany na dvou osách.", vaha: 10 },
            { kde: "hodina", t: "Začnete 3 programové priority a vlajkový zákon. Dokončíte je v příští hodině." },
            { kde: "doma", t: "Rozdělíte si úkoly ze seznamu, u každého úkolu jméno. Rozdělení zapíšete na web a učitel ho zkontroluje.", termin: "2026-11-29T23:59", kratce: "Rozdělení úkolů", odkaz: ["#ukoly", "Rozdělení úkolů"] },
            { kde: "doma", t: "Začnete vyplňovat profil strany: název, slogan, logo, kandidátní listina.", termin: "2026-11-29T23:59", odkaz: ["#strana", "Profil strany"] }
          ]
        }
      ]
    },
    {
      t: "Dokončení programu a kalkulačka za stranu",
      hodiny: { L1C: ["2026-11-30"], L1B: ["2026-12-01"] },
      pozn: { L1C: "Hodina 30. 11. je suplovaná." },
      epizody: [
        {
          k: "E1", t: "Zakládání politických stran (dokončení)",
          ukoly: [
            { kde: "hodina", t: "Dokončíte 3 programové priority se zdůvodněním a konkrétním opatřením.", vaha: 20 },
            { kde: "hodina", t: "Vlajkový zákon: dokončíte ho na papír podle šablony věcného záměru. Papír s prioritami a vlajkovým zákonem vyfotíte do Classroomu.", vaha: 30 },
            { kde: "hodina", t: "Priority a vlajkový zákon přepíšete do profilu strany (podle rozdělení úkolů).", odkaz: ["#strana", "Profil strany"] }
          ]
        },
        {
          k: "E2", t: "Kalkulačka a kampaň",
          ukoly: [
            { kde: "hodina", t: "Odpovědi do kalkulačky: odpovíte za stranu na všech 14 výroků i se zdůvodněním (nejvýš 3 neutrální odpovědi). Co nestihnete v hodině, dokončíte doma. Po uzávěrce se odpovědi uzamknou.", vaha: 20, termin: "2026-12-06T23:59", kratce: "Odpovědi strany do kalkulačky", odkaz: ["#kalkulacka-strana", "Odpovědi do kalkulačky"] },
            { kde: "hodina", t: "Deník, zápis 1: jeden zápis za obě hodiny (zakládání strany i kalkulačka za stranu). Co nestihnete, dopíšete doma.", denik: 1, vahaZak: 15, termin: "2026-12-06T23:59", kratce: "Deník, zápis 1" },
            { kde: "doma", t: "Profil strany na webu: vyplníte všechny povinné součásti (název, logo, slogan, bod na osách, 3 programové priority, vlajkový zákon, kandidátní listina, předseda a rozdělení úkolů). Pozici, priority a vlajkový zákon přepíšete z papíru z hodiny. Úkoly na doma plní ten, komu připadly při rozdělení.", termin: "2026-12-06T23:59", kratce: "Profil strany na webu", odkaz: ["#strana", "Profil strany"] },
            { kde: "doma", t: "Kampaň: povinně plakát, volitelně volební spot (do 2 min), který může hodnocení výrazně zlepšit. Obojí nahrajete do profilu strany.", vaha: 20, termin: "2026-12-06T23:59", kratce: "Plakát (a volitelně spot)", odkaz: ["#strana", "Profil strany"] }
          ]
        }
      ]
    },
    {
      t: "Volby (4.6)",
      hodiny: { L1C: ["2026-12-07"], L1B: ["2026-12-08"] },
      teorie: ["#volby", "Volby"],
      epizody: [
        {
          k: "E2", t: "Volby",
          ukoly: [
            { kde: "hodina", t: "Deník, zápis 2.", denik: 2, vahaZak: 15 },
            { kde: "doma", t: "Každý individuálně projde profily a kampaně stran z paralelní třídy a vyplní hodnoticí arch kampaní.", od: "2026-12-06T23:59", termin: "2026-12-12T14:00", kratce: "Hodnoticí arch kampaní", odkaz: ["#strany", "Strany"] },
            { kde: "doma", t: "Každý individuálně vyplní volební kalkulačku jako volič.", od: "2026-12-06T23:59", termin: "2026-12-12T14:00", kratce: "Kalkulačka jako volič", odkaz: ["#kalkulacka-volic", "Kalkulačka"] },
            { kde: "doma", t: "Každý individuálně odvolí: dá hlas jedné straně z paralelní třídy a na lístku uvede, se kterou stranou mu v kalkulačce vyšla největší shoda.", od: "2026-12-11T14:00", termin: "2026-12-12T14:00", kratce: "Volby", volby: true }
          ]
        }
      ]
    },
    {
      t: "Vláda a legislativní proces (4.7)",
      hodiny: { L1C: ["2026-12-14"], L1B: ["2026-12-15"] },
      teorie: ["#zakon", "Cesta zákona"],
      epizody: [
        {
          k: "E3", t: "Sestavení vlády a opozice",
          ukoly: [
            { kde: "doma", t: "Po zveřejnění výsledků voleb si strany přepočítají mandáty a mohou začít neformálně vyjednávat o koalici.", od: "2026-12-12T14:00", volitelne: true },
            { kde: "hodina", t: "Koaliční strany podepíší koaliční smlouvu (aspoň 101 mandátů, premiér nebo premiérka, ministerstva) a zvolí společné programové priority a vlajkový zákon, který vláda předloží." },
            { kde: "hodina", t: "Opoziční strany sestaví stínovou vládu a připraví pozměňovací návrhy." },
            { kde: "hodina", t: "Sněmovna hlasuje o důvěře vládě." }
          ]
        },
        {
          k: "E4", t: "Legislativní proces ve Sněmovně",
          ukoly: [
            { kde: "hodina", t: "Vláda předloží vlajkový zákon Sněmovně, 1. čtení." },
            { kde: "hodina", t: "2. čtení: opoziční strana podá aspoň jeden pozměňovací návrh, nebo vystoupí v rozpravě. 3. čtení: Sněmovna hlasuje o celém zákonu." },
            { kde: "hodina", t: "Deník, zápis 3.", denik: 3, vahaZak: 15 }
          ]
        }
      ]
    },
    {
      t: "Dokončení simulace a shrnutí systému ČR (4.8)",
      hodiny: { L1C: ["2027-01-04"], L1B: ["2027-01-05"] },
      teorie: ["#zakon", "Cesta zákona"],
      pozn: "Přes Vánoce leží zákon v Senátu. I ve skutečnosti má Senát na projednání zákona 30 dní.",
      epizody: [
        {
          k: "E4", t: "Senát a prezident",
          ukoly: [
            { kde: "hodina", t: "Senát: senátor nebo senátorka každé strany hlasuje váženým hlasem. Prezident zákon podepíše, nebo vetuje; veto může Sněmovna přehlasovat 101 hlasy." },
            { kde: "hodina", t: "Deník, zápis 4 (závěrečná reflexe).", denik: 4, vahaZak: 15 }
          ]
        }
      ]
    }
  ]
};
