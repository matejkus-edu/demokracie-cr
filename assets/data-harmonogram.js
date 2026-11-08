/* Harmonogram bloku 4 a simulace. Úpravy dělejte tady.
   Týden: od/do (YYYY-MM-DD), cz = probírané téma, sim = epizoda simulace,
   denik = číslo zápisu, ukoly = úkoly s termínem.
   L1C = varianta jen pro L1C (přepíše cz/sim/denik pro tuto třídu).
   Odkazy v textech: [[mapa|Dělba moci]], [[volby|Volby]], [[zakon|Cesta zákona]]. */

window.HARMONOGRAM = {
  tydny: [
    {
      od: "2026-10-19", do: "2026-10-23",
      cz: { t: "4.1 Stát a jeho funkce, 4.2 Principy právního státu" }
    },
    { od: "2026-10-26", do: "2026-10-30", volno: "Podzimní prázdniny" },
    {
      od: "2026-11-02", do: "2026-11-06",
      cz: { t: "4.3 Formy vlády", d: "Republika a monarchie, demokracie, autokracie a hybridní režimy.", link: ["https://matejkus-edu.github.io/politicke-systemy/", "Schéma forem vlády"] }
    },
    {
      od: "2026-11-09", do: "2026-11-13",
      cz: { t: "Test č. 1 a 4.4 Politický systém ČR", d: "Ústavní instituce a společné schéma dělby moci na tabuli.", teorie: "[[mapa|Dělba moci]]" }
    },
    { od: "2026-11-16", do: "2026-11-20", volno: "Volný týden" },
    {
      od: "2026-11-23", do: "2026-11-27",
      cz: { t: "Opakování dělby moci a 4.5 Strany a ideologie", d: "Pět minut schéma dělby moci zpaměti, levice a pravice, druhá osa (liberální a konzervativní).", teorie: "[[mapa|Dělba moci]]" },
      sim: { t: "E1 Zakládáme strany", d: "Pozice strany na dvou osách, 3 priority, vlajkový zákon a rozdělení rolí ve straně." },
      denik: 1,
      ukoly: [{ t: "Materiály strany: název, logo, slogan, kandidátní listina, odpovědi do volební kalkulačky, plakát a volitelně 60s spot", termin: "2026-11-29T23:59", strany: true }]
    },
    {
      od: "2026-11-30", do: "2026-12-04",
      cz: { t: "4.6 Volby", d: "Kam všude volíme, principy volebního práva, poměrný a většinový systém, přepočet hlasů na mandáty.", teorie: "[[volby|Volby]]" },
      sim: { t: "E2 Kampaň", d: "Volební kalkulačka se stranami z paralelní třídy a hodnocení jejich plakátů a spotů." },
      denik: 2,
      L1C: {
        cz: { t: "Hodina v tomto týdnu odpadá", d: "V suplované hodině (nebo doma do pátku) vyplníš volební kalkulačku, projdeš kampaně stran z L1B a napíšeš zápis 2 do deníku. Teorii voleb doženeme 7. 12.", teorie: "[[volby|Volby]]" },
        sim: { t: "E2 Kampaň, samostatně", d: "Kalkulačka a kampaně stran z L1B." },
        denikPozn: "Píše se v suplované hodině, nebo doma do pátku."
      },
      ukoly: [
        { t: "Volby: hlasuješ pro strany paralelní třídy", termin: "2026-12-04T14:00", konec: "2026-12-05T14:00", volby: true }
      ]
    },
    {
      od: "2026-12-07", do: "2026-12-11",
      cz: { t: "4.7 Vláda a legislativní proces", d: "Jak vzniká vláda, důvěra a nedůvěra, cesta zákona Sněmovnou.", teorie: "[[zakon|Cesta zákona]]" },
      sim: { t: "Výsledky voleb, E3 Vláda, E4 Zákon ve Sněmovně", d: "Přepočet mandátů, koaliční jednání a hlasování o důvěře, pak vlajkový zákon ve třech čteních." },
      denik: 3,
      L1C: {
        cz: { t: "Teorie voleb a 4.7 Vláda a legislativní proces", d: "Doplníme principy volebního práva a přepočet hlasů, pak jak vzniká vláda.", teorie: "[[volby|Volby]] a [[zakon|Cesta zákona]]" },
        sim: { t: "Výsledky voleb, E3 Vláda, E4 začátek", d: "Přepočet mandátů, koaliční jednání, hlasování o důvěře, 1. čtení a začátek 2. čtení." }
      }
    },
    {
      od: "2026-12-14", do: "2026-12-18",
      cz: { t: "4.8 Dokončení simulace a shrnutí", d: "Senát, prezident, Ústavní soud. Srovnání simulace se skutečností.", teorie: "[[zakon|Cesta zákona]]" },
      sim: { t: "E4 Senát a prezident, Ústavní soud", d: "Senátoři hlasují váženým hlasem, prezident podepíše, nebo vetuje, opozice se může obrátit na Ústavní soud." },
      denik: 4,
      L1C: {
        cz: { t: "4.8 Dokončení simulace", d: "Dokončení 2. a 3. čtení, Senát a prezident, Ústavní soud ve zkrácené podobě.", teorie: "[[zakon|Cesta zákona]]" },
        sim: { t: "E4 dokončení, Ústavní soud", d: "Zákon projde Sněmovnou, Senátem a k prezidentovi." }
      }
    },
    { od: "2026-12-21", do: "2027-01-01", volno: "Vánoční prázdniny" }
  ],

  denik: {
    1: "Zápis 1: založení strany",
    2: "Zápis 2: kampaň a volby",
    3: "Zápis 3: vláda a zákon",
    4: "Zápis 4: závěrečná reflexe"
  }
};
