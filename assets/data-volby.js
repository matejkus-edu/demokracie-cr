/* Volby v ČR. Stav k 8. 11. 2026. */

window.VOLBY = [
  {
    id: "ps",
    name: "Poslanecká sněmovna",
    inst: "ps",
    power: "leg",
    big: "200",
    bigLabel: "poslanců na 4 roky",
    system: "poměrný",
    lead: "Nejdůležitější volby v Česku: z jejich výsledku vzniká vláda.",
    facts: [
      ["Kolik", "200 poslanců"],
      ["Na jak dlouho", "4 roky (dřív, pokud prezident Sněmovnu rozpustí)"],
      ["Kdo může volit", "občan ČR od 18 let, i v zahraničí (od roku 2025 také korespondenčně)"],
      ["Kdo může kandidovat", "občan ČR od 21 let, na kandidátce strany, hnutí nebo koalice"],
      ["Volební systém", "poměrný"],
      ["Obvody", "14 volebních krajů; počet mandátů v kraji se řídí počtem odevzdaných hlasů"],
      ["Uzavírací klauzule", "5 % pro stranu, 8 % pro koalici dvou stran, 11 % pro koalici tří a více stran"],
      ["Přepočet", "v krajích Imperialiho kvótou, zbylé mandáty celostátně ve druhém skrutiniu"],
      ["Preferenční hlasy", "až 4; kandidát s nejméně 5 % hlasů své strany v kraji se posouvá dopředu"],
      ["Naposledy", "3.–4. 10. 2025"],
      ["Příště", "2029"]
    ],
    how: [
      "Volič vybere jeden hlasovací lístek strany a může na něm zakroužkovat až čtyři kandidáty (preferenční hlasy).",
      "Do přepočtu postoupí jen strany a koalice, které překročí uzavírací klauzuli v celé republice.",
      "Mandáty se rozdělí stranám zhruba podle podílu hlasů. Kdo dostane mandát v rámci strany, určuje pořadí na kandidátce, které mohou preferenční hlasy změnit.",
      "Po volbách prezident jmenuje předsedu vlády, obvykle toho, kdo dokáže sestavit většinu aspoň 101 poslanců."
    ],
    result: "Ze Sněmovny se odvíjí [[vlada|vláda]]: bez důvěry většiny poslanců nemůže vládnout."
  },
  {
    id: "senat",
    name: "Senát",
    inst: "senat",
    power: "leg",
    big: "27",
    bigLabel: "senátorů každé 2 roky",
    system: "většinový",
    lead: "Každé dva roky se volí třetina Senátu, ve 27 z 81 obvodů.",
    facts: [
      ["Kolik", "81 senátorů, každé 2 roky se volí 27 z nich"],
      ["Na jak dlouho", "6 let"],
      ["Kdo může volit", "občan ČR od 18 let s trvalým pobytem v obvodu, kde se zrovna volí"],
      ["Kdo může kandidovat", "občan ČR od 40 let; navrhuje ho strana, nebo kandiduje jako nezávislý s peticí podepsanou 1 000 voliči z obvodu"],
      ["Volební systém", "většinový, dvoukolový"],
      ["Obvody", "81 jednomandátových obvodů, v každém se volí jeden senátor"],
      ["Kdo vyhraje", "v 1. kole kandidát s víc než polovinou platných hlasů; jinak postupují dva nejúspěšnější do 2. kola o týden později"],
      ["Naposledy", "9.–10. 10. 2026 (1. kolo) a 16.–17. 10. 2026 (2. kolo)"],
      ["Příště", "2028"]
    ],
    how: [
      "Volič dostane lístky všech kandidátů ve svém obvodu a do obálky vloží jeden.",
      "Když v 1. kole nikdo nezíská nadpoloviční většinu, koná se za šest dní 2. kolo mezi dvěma nejúspěšnějšími. Tam vyhrává ten, kdo má víc hlasů.",
      "Protože se volí vždy jen třetina, nemůže jedna vlna nálady vyměnit celý Senát najednou. Účast bývá nízká, ve 2. kole často pod 20 %."
    ],
    result: "Ze senátních voleb nevzniká vláda. [[senat|Senát]] má ale vlastní pravomoci: bez něj nejde změnit Ústavu ani volební zákon."
  },
  {
    id: "prezident",
    name: "Prezident",
    inst: "prezident",
    power: "exec",
    big: "1",
    bigLabel: "hlava státu na 5 let",
    system: "většinový",
    lead: "Od roku 2013 volí prezidenta přímo občané, dřív ho volil Parlament.",
    facts: [
      ["Kolik", "1 prezident"],
      ["Na jak dlouho", "5 let, nejvýš dvě období po sobě"],
      ["Kdo může volit", "občan ČR od 18 let"],
      ["Kdo může kandidovat", "občan ČR od 40 let"],
      ["Jak se stát kandidátem", "podpisy 50 000 občanů, nebo návrh 20 poslanců, nebo 10 senátorů"],
      ["Volební systém", "většinový, dvoukolový"],
      ["Kdo vyhraje", "v 1. kole kandidát s víc než polovinou platných hlasů; jinak 2. kolo dvou nejúspěšnějších za 14 dní"],
      ["Naposledy", "leden 2023, zvolen Petr Pavel"],
      ["Příště", "2028"]
    ],
    how: [
      "Celá republika tvoří jeden obvod a každý hlas má stejnou váhu.",
      "Ve 2. kole zbudou jen dva kandidáti, takže vítěz má za sebou vždy většinu hlasujících.",
      "Nový prezident skládá slib před oběma komorami Parlamentu."
    ],
    result: "Přímá volba dává [[prezident|prezidentovi]] silný mandát, jeho pravomoci se ale volbou nezměnily. Většinu politiky dělá vláda."
  },
  {
    id: "kraje",
    name: "Zastupitelstva krajů",
    inst: "kraje",
    power: "local",
    big: "13",
    bigLabel: "krajů na 4 roky",
    system: "poměrný",
    lead: "Volí se ve 13 krajích. Praha volí své zastupitelstvo v obecních volbách.",
    facts: [
      ["Kolik", "45, 55, nebo 65 zastupitelů v každém kraji podle počtu obyvatel"],
      ["Na jak dlouho", "4 roky"],
      ["Kdo může volit", "občan ČR od 18 let s trvalým pobytem v kraji"],
      ["Kdo může kandidovat", "občan ČR od 18 let s trvalým pobytem v kraji"],
      ["Volební systém", "poměrný, celý kraj je jeden obvod"],
      ["Uzavírací klauzule", "5 % pro strany i koalice"],
      ["Přepočet", "upravená d'Hondtova metoda s prvním dělitelem 1,42 (pak 2, 3, 4…)"],
      ["Preferenční hlasy", "až 4, hranice 5 % hlasů strany"],
      ["Naposledy", "20.–21. 9. 2024"],
      ["Příště", "2028"]
    ],
    how: [
      "Hlasuje se podobně jako do Sněmovny: jeden lístek strany a až čtyři preferenční hlasy.",
      "Dělitel 1,42 místo 1 zvýhodňuje větší strany: malé strany dostanou první mandát o něco hůř.",
      "Zastupitelstvo pak zvolí hejtmana a radu kraje. I tady se tvoří koalice."
    ],
    result: "Z krajských voleb vzniká vedení [[kraje|kraje]], které zřizuje třeba gymnázia a nemocnice."
  },
  {
    id: "obce",
    name: "Zastupitelstva obcí",
    inst: "obce",
    power: "local",
    big: "6 200+",
    bigLabel: "obcí na 4 roky",
    system: "poměrný",
    lead: "Obecní (komunální) volby se konají ve všech obcích najednou, letos 9.–10. října.",
    facts: [
      ["Kolik", "5 až 55 zastupitelů podle velikosti obce, v Praze až 70"],
      ["Na jak dlouho", "4 roky"],
      ["Kdo může volit", "od 18 let s trvalým pobytem v obci: občané ČR a také občané jiných zemí EU, kteří jsou zapsaní v seznamu voličů"],
      ["Kdo může kandidovat", "od 18 let, stejné podmínky jako pro volbu"],
      ["Volební systém", "poměrný, obvykle je celá obec jeden obvod"],
      ["Uzavírací klauzule", "5 %"],
      ["Přepočet", "d'Hondtova metoda"],
      ["Jak se hlasuje", "volič má tolik hlasů, kolik je zastupitelů: může označit celou stranu, jednotlivce napříč stranami, nebo obojí"],
      ["Naposledy", "9.–10. 10. 2026"],
      ["Příště", "2030"]
    ],
    how: [
      "Hlasuje se na jednom velkém lístku se všemi kandidáty. Volič může dát křížek celé straně, jednotlivým kandidátům z různých stran, nebo to zkombinovat. Kdo označí víc kandidátů, než kolik je zastupitelů, má neplatný hlas.",
      "Kandidát, který dostane aspoň o 10 % víc hlasů, než je průměr na kandidáta jeho strany, se posouvá dopředu.",
      "V Praze se volí zastupitelstvo hlavního města i zastupitelstva městských částí.",
      "Zastupitelstvo zvolí starostu a radu obce."
    ],
    result: "Z obecních voleb vzniká vedení [[obce|obce]]: starosta, rada a zastupitelstvo."
  },
  {
    id: "ep",
    name: "Evropský parlament",
    inst: null,
    power: "eu",
    big: "21",
    bigLabel: "europoslanců na 5 let",
    system: "poměrný",
    lead: "Česko volí 21 z 720 poslanců Evropského parlamentu. Nejde o českou instituci, ale o parlament Evropské unie.",
    facts: [
      ["Kolik", "21 europoslanců za Česko"],
      ["Na jak dlouho", "5 let"],
      ["Kdo může volit", "občan ČR od 18 let a občan jiné země EU s pobytem v ČR, pokud je zapsaný v seznamu voličů"],
      ["Kdo může kandidovat", "od 21 let"],
      ["Volební systém", "poměrný, celá republika je jeden obvod"],
      ["Uzavírací klauzule", "5 % pro strany i koalice"],
      ["Přepočet", "d'Hondtova metoda"],
      ["Preferenční hlasy", "až 2, hranice 5 % hlasů strany"],
      ["Naposledy", "7.–8. 6. 2024"],
      ["Příště", "2029"]
    ],
    how: [
      "Volby probíhají ve všech zemích EU ve stejných dnech, každá země ale podle vlastních pravidel.",
      "Europoslanci se v Parlamentu sdružují do politických frakcí podle názorů, ne podle zemí."
    ],
    result: "Evropský parlament spolu s Radou EU schvaluje evropské předpisy. Podrobněji v bloku o mezinárodní spolupráci."
  }
];

/* Volební kalendář (sekvence let). */
window.KALENDAR = [
  { y: 2023, items: [["prezident", "Prezident (leden)"]] },
  { y: 2024, items: [["ep", "Evropský parlament (červen)"], ["kraje", "Kraje (září)"], ["senat", "Senát, třetina (září)"]] },
  { y: 2025, items: [["ps", "Sněmovna (říjen)"]] },
  { y: 2026, items: [["obce", "Obce (říjen)"], ["senat", "Senát, třetina (říjen)"]], now: true },
  { y: 2027, items: [] },
  { y: 2028, items: [["prezident", "Prezident"], ["kraje", "Kraje"], ["senat", "Senát, třetina"]] },
  { y: 2029, items: [["ps", "Sněmovna"], ["ep", "Evropský parlament"]] },
  { y: 2030, items: [["obce", "Obce"], ["senat", "Senát, třetina"]] }
];

/* Principy volebního práva (čl. 18 Ústavy a čl. 21 Listiny). */
window.PRINCIPY = [
  { t: "Všeobecné", d: "Volit může každý občan od 18 let. Nerozhoduje majetek, vzdělání, pohlaví ani náboženství.", x: "Kdyby směli volit jen ti, kdo platí daně, bylo by to porušení." },
  { t: "Rovné", d: "Každý hlas má stejnou váhu. Nikdo nemá dva hlasy.", x: "Kdyby měl hlas vysokoškoláka dvojnásobnou váhu, bylo by to porušení." },
  { t: "Přímé", d: "Voliči volí své zástupce sami, ne přes prostředníky.", x: "Než se v roce 2013 poprvé volilo přímo, volil prezidenta Parlament. To byla volba nepřímá. Vládu nevolí občané přímo nikdy." },
  { t: "Tajné", d: "Nikdo nesmí vědět, koho volíš. Proto jsou plenty a obálky.", x: "Kdyby zaměstnavatel chtěl vidět tvůj hlasovací lístek, bylo by to porušení." },
  { t: "Svobodné", d: "Voliči se rozhodují bez nátlaku a mají na výběr ze skutečně soupeřících stran.", x: "Volby s jedinou povolenou kandidátkou, jako v Československu před rokem 1989, nejsou svobodné." }
];
