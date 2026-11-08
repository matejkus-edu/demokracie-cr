/* Instituce, vztahy a pojistky. Stav k 8. 11. 2026.
   Odkazy v textech: [[ps|Sněmovna]] vede na instituci ve schématu dělby moci,
   [[volby/ps|volby do Sněmovny]] na stránku webu, [[zakon|cesta zákona]] na cestu zákona. */

window.STAV = "8. 11. 2026";

window.POWERS = {
  leg:    { name: "Zákonodárná moc", note: "Přijímá zákony." },
  exec:   { name: "Výkonná moc", note: "Řídí stát podle zákonů." },
  jud:    { name: "Soudní moc", note: "Rozhoduje spory a chrání práva." },
  indep:  { name: "Nezávislé instituce", note: "Kontrolují moc a nepatří pod žádnou z ní." },
  people: { name: "Občané", note: "Zdroj veškeré státní moci." },
  local:  { name: "Samospráva", note: "Obce a kraje si spravují své záležitosti samy." }
};

window.INST = {

  parlament: {
    name: "Parlament ČR",
    power: "leg",
    core: true,
    group: true,
    lead: "Zákonodárný sbor České republiky. Má dvě komory, Poslaneckou sněmovnu a Senát, a každý zákon musí projít oběma.",
    facts: [
      ["Složení", "[[ps|Poslanecká sněmovna]] (200 poslanců) a [[senat|Senát]] (81 senátorů)"],
      ["Proč dvě komory", "Druhá komora zpomaluje a opravuje rozhodnutí první. Senát se navíc mění jen po třetinách."],
      ["Ústava", "hlava druhá, čl. 15–53"]
    ],
    does: [
      "Přijímá zákony. Cestu zákona přes obě komory ukazuje [[zakon|cesta zákona]].",
      "Souhlasí s nejdůležitějšími mezinárodními smlouvami a rozhoduje o vyhlášení válečného stavu.",
      "Na společné schůzi obou komor skládá slib nový prezident."
    ],
    stop: [
      "[[us|Ústavní soud]] může zrušit zákon, který Parlament přijal, pokud odporuje Ústavě.",
      "[[prezident|Prezident]] může zákon vrátit, Sněmovna ho ale přehlasuje 101 hlasy.",
      "O složení obou komor rozhodují ve volbách [[obcane|občané]]."
    ],
    ustava: "čl. 15–53"
  },

  ps: {
    name: "Poslanecká sněmovna",
    short: "Sněmovna",
    power: "leg",
    core: true,
    lead: "Dolní komora Parlamentu a motor české politiky. Schvaluje zákony a rozpočet a rozhoduje, která vláda smí vládnout.",
    facts: [
      ["Složení", "200 poslanců"],
      ["Jak vzniká", "volí ji občané poměrným systémem ve 14 krajích ([[volby/ps|volby do Sněmovny]])"],
      ["Mandát", "4 roky, prezident ji může v přesně daných případech rozpustit dřív"],
      ["Kdo může být zvolen", "občan ČR od 21 let"],
      ["Vede ji", "předseda Sněmovny, kterého volí poslanci ze svého středu"]
    ],
    does: [
      "Projednává a schvaluje zákony. Každý zákon začíná a končí ve Sněmovně ([[zakon|cesta zákona]]).",
      "Jako jediná schvaluje státní rozpočet. Senát se k němu nevyjadřuje.",
      "Vyslovuje [[vlada|vládě]] důvěru a může jí vyslovit nedůvěru.",
      "Kontroluje vládu interpelacemi: poslanci se ministrů ptají a ti musí odpovědět.",
      "Navrhuje prezidentovi šéfa [[nku|NKÚ]], volí [[ombudsman|ombudsmana]] a většinu členů rad [[media|ČT a ČRo]]."
    ],
    stop: [
      "[[senat|Senát]] může zákon zamítnout nebo vrátit. Sněmovna ho přehlasuje 101 hlasy, u ústavních a volebních zákonů ale ne.",
      "[[prezident|Prezident]] může zákon vrátit (veto). I to Sněmovna přehlasuje 101 hlasy.",
      "[[us|Ústavní soud]] zruší zákon, který odporuje Ústavě.",
      "Prezident může Sněmovnu rozpustit, ale jen v situacích, které vyjmenovává Ústava (čl. 35): například když ani třetí vláda nezíská důvěru, nebo když o to požádá 120 poslanců.",
      "Každé 4 roky o poslancích znovu rozhodují [[obcane|voliči]]."
    ],
    now: [
      "Předseda: Tomio Okamura (SPD), od listopadu 2025.",
      "Po volbách v říjnu 2025: ANO 80, SPOLU 52, STAN 22, Piráti 18, SPD 15, Motoristé sobě 13 mandátů. Vládní většinu (108) tvoří ANO, SPD a Motoristé."
    ],
    ustava: "čl. 15–39, 42"
  },

  senat: {
    name: "Senát",
    power: "leg",
    core: true,
    lead: "Horní komora Parlamentu. Mění se po třetinách a nelze ho rozpustit, proto je pojistkou proti rychlým a unáhleným změnám.",
    facts: [
      ["Složení", "81 senátorů"],
      ["Jak vzniká", "volí ho občané v 81 obvodech dvoukolovým většinovým systémem ([[volby/senat|volby do Senátu]])"],
      ["Mandát", "6 let, každé 2 roky se volí třetina senátorů"],
      ["Kdo může být zvolen", "občan ČR od 40 let"],
      ["Rozpuštění", "nelze, Senát funguje i tehdy, když je Sněmovna rozpuštěná"]
    ],
    does: [
      "Projednává zákony, které schválila Sněmovna. Má na to 30 dní a může zákon schválit, zamítnout, nebo vrátit s pozměňovacími návrhy. Když nic neudělá, platí to jako schválení.",
      "Bez jeho souhlasu nelze změnit Ústavu ani volební zákon.",
      "Souhlasí se jmenováním soudců [[us|Ústavního soudu]].",
      "Se souhlasem Sněmovny může podat ústavní žalobu na [[prezident|prezidenta]].",
      "Když je Sněmovna rozpuštěná, může na návrh vlády přijímat zákonná opatření. Sněmovna je musí po volbách schválit, jinak přestanou platit.",
      "Navrhuje kandidáty na [[ombudsman|ombudsmana]] a volí třetinu členů rad [[media|ČT a ČRo]]."
    ],
    stop: [
      "U běžných zákonů má poslední slovo [[ps|Sněmovna]]: zamítnutí Senátu přehlasuje 101 hlasy.",
      "[[us|Ústavní soud]] zruší i zákon, který Senát podpořil, pokud odporuje Ústavě.",
      "Každé 2 roky rozhodují [[obcane|voliči]] o třetině senátorů."
    ],
    now: [
      "Senátní volby proběhly 9.–10. a 16.–17. 10. 2026. Nový Senát volí předsedu na ustavující schůzi 19. 11. 2026 (dosud Miloš Vystrčil, ODS)."
    ],
    ustava: "čl. 15–40, 46–48"
  },

  prezident: {
    name: "Prezident republiky",
    short: "Prezident",
    power: "exec",
    core: true,
    lead: "Hlava státu. Volí ho přímo občané, ale za většinu politiky odpovídá vláda, ne on.",
    facts: [
      ["Kdo", "1 osoba"],
      ["Jak vzniká", "přímá volba ve dvou kolech, od roku 2013 ([[volby/prezident|volba prezidenta]]); dřív ho volil Parlament"],
      ["Mandát", "5 let, nejvýš dvě období po sobě"],
      ["Kdo může být zvolen", "občan ČR od 40 let"],
      ["Sídlo", "Pražský hrad"]
    ],
    does: [
      "Jmenuje předsedu [[vlada|vlády]] a na jeho návrh ministry.",
      "Jmenuje soudce [[us|Ústavního soudu]] (se souhlasem Senátu) a soudce [[soudy|obecných soudů]].",
      "Podepisuje zákony a může je vrátit Sněmovně (veto). U ústavních zákonů veto nemá.",
      "V případech podle čl. 35 Ústavy může rozpustit [[ps|Sněmovnu]]. Senát rozpustit nemůže nikdy.",
      "Jmenuje bankovní radu [[cnb|ČNB]] a šéfa [[nku|NKÚ]], navrhuje kandidáty na [[ombudsman|ombudsmana]].",
      "Zastupuje stát navenek, je vrchním velitelem ozbrojených sil, uděluje milosti."
    ],
    stop: [
      "Veto [[ps|Sněmovna]] přehlasuje 101 hlasy.",
      "Řadu rozhodnutí (například jmenování soudců obecných soudů nebo velení armádě) může udělat jen s podpisem předsedy vlády. Tomu se říká kontrasignace a odpovědnost za taková rozhodnutí nese vláda.",
      "Vládu sice jmenuje, ale vláda se nezodpovídá jemu, nýbrž Sněmovně.",
      "Soudce Ústavního soudu nejmenuje bez souhlasu [[senat|Senátu]].",
      "Za velezradu nebo hrubé porušení Ústavy na něj může Senát se souhlasem Sněmovny podat ústavní žalobu. Rozhoduje o ní [[us|Ústavní soud]], který ho může zbavit úřadu.",
      "Politicky odpovědný není: nikdo ho nemůže odvolat jen proto, že s ním nesouhlasí. Kontrolu mají až [[obcane|voliči]] po pěti letech."
    ],
    now: ["Petr Pavel, ve funkci od 9. 3. 2023."],
    ustava: "čl. 54–66"
  },

  vlada: {
    name: "Vláda",
    power: "exec",
    core: true,
    lead: "Vrcholný orgán výkonné moci. Řídí stát každý den, ale vládnout může jen s důvěrou Poslanecké sněmovny.",
    facts: [
      ["Složení", "předseda vlády (premiér), místopředsedové a ministři, obvykle 15 až 20 lidí"],
      ["Jak vzniká", "[[prezident|prezident]] jmenuje premiéra a na jeho návrh ministry, vláda pak do 30 dnů žádá [[ps|Sněmovnu]] o důvěru"],
      ["Mandát", "nemá pevné období: vládne, dokud má důvěru Sněmovny, a po každých sněmovních volbách podává demisi"],
      ["Sídlo", "Strakova akademie, Praha"]
    ],
    does: [
      "Navrhuje zákony a jako jediná navrhuje státní rozpočet.",
      "Vydává nařízení, která upřesňují zákony.",
      "Řídí ministerstva a další státní úřady.",
      "Premiér spolupodepisuje některá rozhodnutí prezidenta (kontrasignace).",
      "Jmenuje nejvyššího státního zástupce na 7 let. Odvolat ho může jen z důvodů, které stanoví zákon, a on se může bránit u soudu.",
      "Může navrhnout [[soudy|Nejvyššímu správnímu soudu]] rozpuštění politické strany."
    ],
    stop: [
      "Je odpovědná [[ps|Sněmovně]]: ta jí může kdykoli vyslovit nedůvěru (návrh podá aspoň 50 poslanců, schválit ho musí aspoň 101) a vláda pak musí odstoupit.",
      "Zákony ani rozpočet si sama schválit nemůže, rozhoduje o nich [[parlament|Parlament]].",
      "[[us|Ústavní soud]] zruší nařízení vlády, které odporuje Ústavě nebo zákonu.",
      "Správní [[soudy|soudy]] ruší nezákonná rozhodnutí ministerstev a úřadů.",
      "[[nku|NKÚ]] kontroluje, jak hospodaří se státními penězi, [[ombudsman|ombudsman]] prošetřuje stížnosti na úřady a [[media|média]] o její práci informují veřejnost."
    ],
    now: [
      "Předseda vlády: Andrej Babiš (ANO). Vládu tvoří ANO, SPD a Motoristé sobě, důvěru získala 15. 1. 2026 (108 hlasů)."
    ],
    ustava: "čl. 67–80"
  },

  us: {
    name: "Ústavní soud",
    power: "jud",
    core: true,
    lead: "Strážce Ústavy. Ruší zákony a rozhodnutí, které odporují Ústavě a Listině základních práv a svobod.",
    facts: [
      ["Složení", "15 soudců"],
      ["Jak vzniká", "soudce jmenuje [[prezident|prezident]] se souhlasem [[senat|Senátu]]"],
      ["Mandát", "10 let, soudce může být jmenován znovu"],
      ["Kdo může být soudcem", "bezúhonný občan od 40 let s právnickým vzděláním a aspoň 10 lety praxe; nesmí být členem politické strany"],
      ["Sídlo", "Brno"]
    ],
    does: [
      "Ruší zákony nebo jejich části, které odporují Ústavě. Návrh může podat například prezident, 41 poslanců nebo 17 senátorů.",
      "Rozhoduje o ústavních stížnostech: kdo si myslí, že mu stát nebo soud porušil základní práva, se na něj může obrátit (většinou až když neuspěje u ostatních soudů).",
      "Rozhoduje o ústavní žalobě Senátu na prezidenta.",
      "Řeší spory státních orgánů o to, komu patří jaká pravomoc.",
      "Posuzuje některé mezinárodní smlouvy ještě před tím, než je Česko přijme."
    ],
    stop: [
      "Prakticky nikdo. Jeho rozhodnutí (nálezy) jsou závazná pro všechny, i pro Parlament, vládu a prezidenta, a nikdo je nemůže přehlasovat.",
      "Jediná cesta je změnit samotnou Ústavu, k čemuž je potřeba souhlas 3/5 poslanců i senátorů. Ani tak ale nejde zrušit základy demokratického právního státu (čl. 9 Ústavy).",
      "Kontrola proto přichází hlavně na začátku: o tom, kdo se soudcem stane, rozhodují [[prezident|prezident]] a [[senat|Senát]] společně."
    ],
    now: ["Předseda: Josef Baxa, od srpna 2023."],
    ustava: "čl. 83–89"
  },

  soudy: {
    name: "Soustava soudů",
    sub: "obecné soudy",
    power: "jud",
    core: true,
    lead: "Soudy, které rozhodují běžné spory a trestní věci. Jsou nezávislé: soudce se řídí jen zákonem a nikdo mu nesmí říkat, jak má rozhodnout.",
    facts: [
      ["Soustava", "okresní soudy (v Praze obvodní) → krajské soudy (v Praze Městský soud) → vrchní soudy (Praha, Olomouc) → Nejvyšší soud (Brno)"],
      ["Správní soudy", "krajské soudy → Nejvyšší správní soud (Brno), řeší spory lidí s úřady"],
      ["Jak se soudcem stát", "soudce jmenuje [[prezident|prezident]], s podpisem předsedy vlády"],
      ["Mandát", "bez časového omezení, funkce končí nejpozději v roce, kdy soudci je 70 let"],
      ["Kdo může být soudcem", "bezúhonný občan od 30 let s právnickým vzděláním a odbornou zkouškou; nesmí být členem politické strany"]
    ],
    does: [
      "Rozhodují spory mezi lidmi a firmami (dědictví, rozvody, smlouvy, dluhy).",
      "V trestních věcech rozhodují o vině a trestu. Obžalobu podává státní zástupce.",
      "Správní soudy ruší nezákonná rozhodnutí úřadů a ministerstev.",
      "Nejvyšší správní soud rozhoduje o rozpuštění politické strany, když to navrhne [[vlada|vláda]].",
      "Rozhodují i spory o platnost voleb: o volbách do Sněmovny, Senátu a o volbě prezidenta rozhoduje Nejvyšší správní soud, o obecních a krajských volbách krajské soudy."
    ],
    stop: [
      "Proti rozsudku se lze odvolat k vyššímu soudu.",
      "Když jsou možnosti vyčerpané a člověk má za to, že mu soud porušil základní práva, může podat ústavní stížnost k [[us|Ústavnímu soudu]].",
      "Soudce nelze odvolat jen proto, že se někomu nelíbí jeho rozsudek. Funkce ho zbavit může jen soud v kárném řízení za závažné provinění."
    ],
    ustava: "čl. 81–82, 90–96"
  },

  nku: {
    name: "Nejvyšší kontrolní úřad",
    short: "NKÚ",
    power: "indep",
    core: false,
    lead: "Hlídá, jak stát hospodaří s penězi a majetkem. Je nezávislý: nikdo mu nesmí nařídit, co má nebo nemá kontrolovat.",
    facts: [
      ["Vedení", "prezident a viceprezident NKÚ, které jmenuje [[prezident|prezident republiky]] na návrh [[ps|Sněmovny]] na 9 let"],
      ["Členové", "volí je Sněmovna na návrh prezidenta NKÚ"],
      ["Sídlo", "Praha"]
    ],
    does: [
      "Kontroluje hospodaření ministerstev a státních úřadů a plnění státního rozpočtu, včetně peněz z EU.",
      "Zveřejňuje kontrolní závěry, takže o nehospodárnosti se dozví poslanci, novináři i veřejnost.",
      "Sám nikoho netrestá. Když narazí na možný trestný čin, předá věc policii."
    ],
    stop: [
      "Jeho vedení se nedá odvolat kvůli nepohodlným zjištěním. Mandát na 9 let je delší než volební období.",
      "Sílu mu dává hlavně zveřejnění: závěry NKÚ musí rozebrat politici, média a [[obcane|občané]]."
    ],
    ustava: "čl. 97"
  },

  cnb: {
    name: "Česká národní banka",
    short: "ČNB",
    power: "indep",
    core: false,
    lead: "Ústřední banka státu. Jejím hlavním úkolem je péče o stabilitu cen, tedy o to, aby nerostla příliš rychle inflace.",
    facts: [
      ["Vedení", "bankovní rada se 7 členy (guvernér, 2 viceguvernéři a 4 další)"],
      ["Jak vzniká", "členy jmenuje [[prezident|prezident]] sám, bez podpisu předsedy vlády"],
      ["Mandát", "6 let, nejvýš dvě období"],
      ["Sídlo", "Praha"]
    ],
    does: [
      "Určuje základní úrokové sazby a tím ovlivňuje, za kolik si lidé a firmy půjčují.",
      "Vydává bankovky a mince.",
      "Dohlíží na banky, pojišťovny a finanční trh."
    ],
    stop: [
      "Do její činnosti lze zasahovat jen na základě zákona (čl. 98 Ústavy). Vláda ani Parlament jí nesmí nařídit, jak má nastavit úroky.",
      "Proto se o ČNB mluví jako o pojistce proti tomu, aby si politici před volbami „tiskli peníze“."
    ],
    now: ["Guvernér: Aleš Michl, od července 2022."],
    ustava: "čl. 98"
  },

  ombudsman: {
    name: "Veřejný ochránce práv",
    short: "Ombudsman",
    power: "indep",
    core: false,
    lead: "Ombudsman pomáhá lidem, se kterými úřad jednal nespravedlivě nebo nezákonně.",
    facts: [
      ["Jak vzniká", "volí ho [[ps|Sněmovna]] ze čtyř kandidátů: dva navrhuje [[prezident|prezident]], dva [[senat|Senát]]"],
      ["Mandát", "6 let, nejvýš dvě období po sobě"],
      ["Sídlo", "Brno"],
      ["Zákon", "č. 349/1999 Sb., o veřejném ochránci práv"]
    ],
    does: [
      "Prošetřuje stížnosti na úřady. Dává doporučení, nemůže ale rozhodnutí úřadu zrušit.",
      "Kontroluje místa, kde jsou lidé omezeni na svobodě, třeba věznice, policejní cely nebo domovy pro seniory.",
      "Pomáhá lidem, kteří čelí diskriminaci.",
      "Může navrhnout [[us|Ústavnímu soudu]] zrušení vyhlášek a nařízení."
    ],
    stop: [
      "Nemá moc nic nařídit. Jeho síla je v autoritě a v tom, že může postup úřadu zveřejnit a informovat [[vlada|vládu]] a [[ps|Sněmovnu]]."
    ]
  },

  media: {
    name: "Média veřejné služby",
    sub: "ČT a ČRo",
    power: "indep",
    core: false,
    lead: "Česká televize a Český rozhlas. Mají informovat nestranně a nezávisle na vládě, aby občané věděli, co dělá moc.",
    facts: [
      ["Vedení", "generálního ředitele volí a odvolává Rada ČT, nebo Rada ČRo"],
      ["Rada ČT", "18 členů: 12 volí [[ps|Sněmovna]], 6 [[senat|Senát]]"],
      ["Rada ČRo", "9 členů: 6 volí Sněmovna, 3 Senát"],
      ["Financování", "dosud hlavně z poplatků. Vláda v roce 2026 navrhla poplatky zrušit a od roku 2027 financovat ČT a ČRo ze státního rozpočtu. Jaký je stav návrhu, si ověř v aktuálních zprávách."]
    ],
    does: [
      "Přinášejí zpravodajství a publicistiku, včetně kritických reportáží o politicích.",
      "Rady dohlížejí, jestli ČT a ČRo plní, co jim ukládá zákon. Do obsahu vysílání ale zasahovat nesmějí."
    ],
    stop: [
      "Rady volí politici, proto se vedou spory o to, jak moc jsou rady nezávislé. Od roku 2023 část členů volí Senát, aby rady nezávisely jen na sněmovní většině.",
      "Jestli je pro nezávislost lepší financování z poplatků, nebo ze státního rozpočtu, je předmětem politického sporu."
    ]
  },

  obcane: {
    name: "Občané",
    power: "people",
    core: true,
    bar: true,
    lead: "„Lid je zdrojem veškeré státní moci“ (čl. 2 Ústavy). Občané ji vykonávají hlavně tím, že volí své zástupce.",
    facts: [
      ["Volit", "od 18 let"],
      ["Volí přímo", "[[ps|Sněmovnu]], [[senat|Senát]], [[prezident|prezidenta]], zastupitelstva [[obce|obcí]] a [[kraje|krajů]] a Evropský parlament ([[volby|všechny volby]])"],
      ["Nevolí přímo", "vládu, soudce, Ústavní soud"]
    ],
    does: [
      "Volí a mohou sami kandidovat.",
      "Zakládají politické strany, spolky a občanské iniciativy.",
      "Podávají petice a pořádají shromáždění. Shromáždění se úřadu jen oznamuje, nepovoluje se (Listina, čl. 19).",
      "Kdo má za to, že mu stát porušil základní práva, může podat ústavní stížnost k [[us|Ústavnímu soudu]].",
      "Mohou hlasovat v místním nebo krajském referendu. Celostátní referendum Česko obecně upravené nemá."
    ],
    stop: [
      "Ústava chrání práva menšin: o základních právech nerozhoduje většina hlasů (čl. 6 Ústavy, Listina základních práv a svobod)."
    ],
    ustava: "čl. 2, 6, 18–21; Listina"
  },

  obce: {
    name: "Obce",
    power: "local",
    core: true,
    lead: "Základní územní samosprávné celky. V Česku je přes 6 200 obcí, od malých vesnic po Prahu.",
    facts: [
      ["Kdo rozhoduje", "zastupitelstvo obce, které volí občané ([[volby/obce|obecní volby]])"],
      ["Starosta", "volí ho zastupitelstvo ze svých členů, spolu s radou obce"],
      ["Mandát", "4 roky"]
    ],
    does: [
      "Spravuje vlastní záležitosti: místní silnice a chodníky, základní a mateřské školy, odpad, veřejnou zeleň.",
      "Vydává obecně závazné vyhlášky, například o nočním klidu.",
      "Za stát vykonává některé úřední agendy (třeba evidenci obyvatel). Tomu se říká přenesená působnost."
    ],
    stop: [
      "Ministerstvo vnitra dohlíží, jestli jsou vyhlášky obcí v souladu se zákonem, a může se obrátit na [[us|Ústavní soud]].",
      "Obec se může bránit u Ústavního soudu, když stát nezákonně zasáhne do její samosprávy."
    ],
    ustava: "hlava sedmá, čl. 99–105"
  },

  kraje: {
    name: "Kraje",
    power: "local",
    core: true,
    lead: "Vyšší územní samosprávné celky. Česko má 14 krajů. Praha je obec i kraj zároveň.",
    facts: [
      ["Kdo rozhoduje", "zastupitelstvo kraje, které volí občané ([[volby/kraje|krajské volby]]); v Praze zastupitelstvo hlavního města"],
      ["Hejtman", "volí ho zastupitelstvo kraje, spolu s radou kraje"],
      ["Mandát", "4 roky"]
    ],
    does: [
      "Zřizuje většinu středních škol včetně gymnázií, krajské nemocnice a sociální služby.",
      "Stará se o silnice II. a III. třídy a objednává regionální dopravu.",
      "Zastupitelstvo kraje může navrhnout Sněmovně zákon."
    ],
    stop: [
      "Stát dohlíží na zákonnost rozhodnutí kraje, kraj se může bránit u soudu a u [[us|Ústavního soudu]]."
    ],
    ustava: "hlava sedmá, čl. 99–105"
  }
};

/* Druhy vztahů */
window.KINDS = {
  vznik: { name: "Kdo koho ustavuje", hint: "volí, jmenuje" },
  brzda: { name: "Kdo koho brzdí", hint: "kontroluje, vrací, ruší, rozpouští" },
  spol:  { name: "Kdo s kým musí spolupracovat", hint: "navrhuje, souhlasí, spolupodepisuje" }
};

/* Vztahy. key = písmeno šipky ze schématu dělby moci z hodiny 4.4 (A–H). core = patří do jádra z hodiny. */
window.EDGES = [
  // A volí
  { id: "volba-ps", from: "obcane", to: "ps", kind: "vznik", verb: "volí", key: "A", core: true,
    text: "Občané volí Poslaneckou sněmovnu každé 4 roky poměrným systémem.", link: "volby/ps" },
  { id: "volba-senat", from: "obcane", to: "senat", kind: "vznik", verb: "volí", key: "A", core: true,
    text: "Občané volí senátory na 6 let. Každé 2 roky se volí třetina Senátu, a to většinovým systémem ve dvou kolech.", link: "volby/senat" },
  { id: "volba-prez", from: "obcane", to: "prezident", kind: "vznik", verb: "volí", key: "A", core: true,
    text: "Občané volí prezidenta přímo na 5 let, od roku 2013.", link: "volby/prezident" },
  { id: "volba-obce", from: "obcane", to: "obce", kind: "vznik", verb: "volí", key: "A", core: true,
    text: "Občané volí zastupitelstva obcí každé 4 roky.", link: "volby/obce" },
  { id: "volba-kraje", from: "obcane", to: "kraje", kind: "vznik", verb: "volí", key: "A", core: true,
    text: "Občané volí zastupitelstva krajů každé 4 roky.", link: "volby/kraje" },

  // B jmenuje
  { id: "jm-vlada", from: "prezident", to: "vlada", kind: "vznik", verb: "jmenuje", key: "B", core: true,
    text: "Prezident jmenuje předsedu vlády a na jeho návrh ministry. Obvykle jmenuje premiérem lídra strany nebo koalice, která může ve Sněmovně získat většinu.", ref: "čl. 68" },
  { id: "jm-us", from: "prezident", to: "us", kind: "vznik", verb: "jmenuje", key: "B", core: true,
    text: "Prezident jmenuje soudce Ústavního soudu na 10 let, ale jen se souhlasem Senátu.", ref: "čl. 84" },
  { id: "jm-soudy", from: "prezident", to: "soudy", kind: "vznik", verb: "jmenuje", key: "B", core: true,
    text: "Prezident jmenuje soudce obecných soudů bez časového omezení. Jmenování musí spolupodepsat předseda vlády.", ref: "čl. 63, 93" },

  // C navrhuje
  { id: "navrh-min", from: "vlada", to: "prezident", kind: "spol", verb: "navrhuje ministry", key: "C", core: true,
    text: "Předseda vlády navrhuje prezidentovi, koho jmenovat ministry.", ref: "čl. 68" },

  // D kontroluje
  { id: "duvera", from: "ps", to: "vlada", kind: "brzda", verb: "vyslovuje (ne)důvěru", key: "D", core: true,
    text: "Vláda musí do 30 dnů od jmenování získat důvěru Sněmovny. Sněmovna jí může kdykoli vyslovit nedůvěru (101 hlasů) a vláda pak musí odstoupit. Poslanci mohou ministry interpelovat.", ref: "čl. 68, 72, 53" },

  // E rozpouští
  { id: "rozpust", from: "prezident", to: "ps", kind: "brzda", verb: "rozpouští", key: "E", core: true,
    text: "Prezident může rozpustit Sněmovnu, ale jen v případech, které vyjmenovává Ústava: například když ani třetí vláda nezíská důvěru, nebo když to navrhnou 3/5 poslanců. Senát rozpustit nemůže nikdy.", ref: "čl. 35" },

  // F vrací zákon
  { id: "veto", from: "prezident", to: "ps", kind: "brzda", verb: "vrací zákon", key: "F", core: true,
    text: "Prezident může do 15 dnů vrátit zákon Sněmovně s odůvodněním (veto). U ústavních zákonů veto nemá.", ref: "čl. 50", link: "zakon" },
  { id: "senat-vraci", from: "senat", to: "ps", kind: "brzda", verb: "vrací zákon", key: "F", core: true,
    text: "Senát může do 30 dnů zákon zamítnout, nebo ho vrátit Sněmovně s pozměňovacími návrhy.", ref: "čl. 46–48", link: "zakon" },

  // G souhlasí
  { id: "souhlas-us", from: "senat", to: "us", kind: "spol", verb: "souhlasí se jmenováním", key: "G", core: true,
    text: "Senát musí souhlasit s každým soudcem Ústavního soudu, kterého prezident vybere. Senát už několikrát prezidentova kandidáta odmítl.", ref: "čl. 84",
    via: [[140, 106], [900, 106]] },

  // H ruší zákony
  { id: "rusi-zakony", from: "us", to: "parlament", kind: "brzda", verb: "ruší zákony", key: "H", core: true,
    text: "Ústavní soud ruší zákony nebo jejich části, které odporují Ústavě. Jeho nález nikdo nepřehlasuje.", ref: "čl. 87",
    via: [[960, 88], [260, 88]] },

  // ---- celé schéma ----
  { id: "prehl-veto", from: "ps", to: "prezident", kind: "brzda", verb: "přehlasuje veto",
    text: "Když prezident zákon vrátí, Sněmovna ho přehlasuje, pokud pro něj znovu hlasuje aspoň 101 poslanců.", ref: "čl. 50", link: "zakon" },
  { id: "prehl-senat", from: "ps", to: "senat", kind: "brzda", verb: "přehlasuje",
    text: "Zamítnutí Senátem Sněmovna přehlasuje 101 hlasy. U ústavních zákonů a volebního zákona to nejde, ty bez souhlasu Senátu neprojdou.", ref: "čl. 40, 47", link: "zakon" },
  { id: "posila-zakony", from: "ps", to: "senat", kind: "spol", verb: "posílá zákony",
    text: "Každý zákon, který Sněmovna schválí, posílá Senátu. Výjimkou je státní rozpočet, o kterém rozhoduje jen Sněmovna.", ref: "čl. 42, 45", link: "zakon" },
  { id: "navrhuje-zakony", from: "vlada", to: "ps", kind: "spol", verb: "navrhuje zákony a rozpočet",
    text: "Většinu zákonů navrhuje vláda. Návrh státního rozpočtu předkládá jen ona. Zákon ale mohou navrhnout i poslanci, Senát nebo zastupitelstva krajů.", ref: "čl. 41, 42", link: "zakon" },
  { id: "kontrasignace", from: "vlada", to: "prezident", kind: "spol", verb: "spolupodepisuje",
    text: "Část rozhodnutí prezidenta (například jmenování soudců, velení armádě, vyhlášení voleb) platí jen s podpisem předsedy vlády. Odpovědnost za ně pak nese vláda. Tomu se říká kontrasignace.", ref: "čl. 63" },
  { id: "zaloba", from: "senat", to: "prezident", kind: "brzda", verb: "ústavní žaloba",
    text: "Senát se souhlasem Sněmovny může podat na prezidenta ústavní žalobu za velezradu nebo hrubé porušení Ústavy. Rozhoduje o ní Ústavní soud.", ref: "čl. 65",
    via: [[140, 352]] },
  { id: "us-prezident", from: "us", to: "prezident", kind: "brzda", verb: "může zbavit úřadu",
    text: "Pokud Ústavní soud uzná ústavní žalobu, prezident ztrácí úřad i možnost ho znovu získat.", ref: "čl. 65, 87" },
  { id: "us-narizeni", from: "us", to: "vlada", kind: "brzda", verb: "ruší nařízení",
    text: "Ústavní soud ruší nařízení vlády a jiné předpisy, které odporují Ústavě nebo zákonu.", ref: "čl. 87" },
  { id: "us-soudy", from: "us", to: "soudy", kind: "brzda", verb: "ruší rozsudky",
    text: "Po ústavní stížnosti Ústavní soud zruší rozhodnutí soudu, které porušilo něčí základní práva.", ref: "čl. 87" },
  { id: "navrh-zruseni", from: "parlament", to: "us", kind: "brzda", verb: "navrhuje zrušení zákona",
    text: "Skupina aspoň 41 poslanců nebo 17 senátorů může navrhnout Ústavnímu soudu zrušení zákona. Je to důležitý nástroj opozice proti většině.",
    via: [[320, 124], [930, 124]] },
  { id: "stiznost", from: "obcane", to: "us", kind: "brzda", verb: "ústavní stížnost",
    text: "Kdo má za to, že mu stát nebo soud porušil základní práva, může podat ústavní stížnost. Obvykle až po tom, co vyčerpá ostatní cesty u soudů.", ref: "čl. 87",
    via: [[1100, 560], [1100, 190]] },
  { id: "spravni-soudy", from: "soudy", to: "vlada", kind: "brzda", verb: "ruší rozhodnutí úřadů",
    text: "Správní soudy přezkoumávají rozhodnutí ministerstev a úřadů a ruší ta nezákonná." },
  { id: "rozpusteni-strany", from: "vlada", to: "soudy", kind: "spol", verb: "navrhuje rozpuštění strany",
    text: "O rozpuštění politické strany rozhoduje Nejvyšší správní soud, a to jen na návrh vlády. Vláda sama stranu rozpustit nemůže." },
  { id: "jm-cnb", from: "prezident", to: "cnb", kind: "vznik", verb: "jmenuje bankovní radu",
    text: "Prezident jmenuje guvernéra a další členy bankovní rady ČNB, a to bez spolupodpisu předsedy vlády.", ref: "čl. 62" },
  { id: "jm-nku", from: "prezident", to: "nku", kind: "vznik", verb: "jmenuje",
    text: "Prezident jmenuje prezidenta a viceprezidenta NKÚ, ale jen ty, které mu navrhne Sněmovna.", ref: "čl. 97" },
  { id: "ps-nku", from: "ps", to: "nku", kind: "vznik", verb: "navrhuje šéfa, volí členy",
    text: "Sněmovna navrhuje prezidentovi, koho jmenovat do čela NKÚ, a volí ostatní členy úřadu.", ref: "čl. 97" },
  { id: "nku-kontrola", from: "nku", to: "vlada", kind: "brzda", verb: "kontroluje hospodaření",
    text: "NKÚ kontroluje, jak ministerstva a úřady hospodaří se státními penězi a majetkem, a závěry zveřejňuje.",
    via: [[490, 420], [490, 250]] },
  { id: "ps-ombudsman", from: "ps", to: "ombudsman", kind: "vznik", verb: "volí",
    text: "Sněmovna volí ombudsmana ze čtyř kandidátů navržených prezidentem a Senátem." },
  { id: "prez-ombudsman", from: "prezident", to: "ombudsman", kind: "spol", verb: "navrhuje kandidáty",
    text: "Prezident navrhuje Sněmovně dva kandidáty na ombudsmana." },
  { id: "senat-ombudsman", from: "senat", to: "ombudsman", kind: "spol", verb: "navrhuje kandidáty",
    text: "Senát navrhuje Sněmovně dva kandidáty na ombudsmana." },
  { id: "ombudsman-urady", from: "ombudsman", to: "vlada", kind: "brzda", verb: "prošetřuje úřady",
    text: "Ombudsman prošetřuje stížnosti na postup ministerstev a úřadů. Nemůže jim nic nařídit, ale může upozornit vládu a zveřejnit, co zjistil.",
    via: [[502, 405], [502, 245]] },
  { id: "ps-media", from: "ps", to: "media", kind: "vznik", verb: "volí rady",
    text: "Sněmovna volí 12 z 18 členů Rady ČT a 6 z 9 členů Rady ČRo. Rady pak volí generální ředitele.",
    via: [[420, 375], [700, 402]] },
  { id: "senat-media", from: "senat", to: "media", kind: "vznik", verb: "volí rady",
    text: "Senát volí 6 členů Rady ČT a 3 členy Rady ČRo, od roku 2023.",
    via: [[200, 372], [700, 398]] },
  { id: "media-kontrola", from: "media", to: "vlada", kind: "brzda", verb: "informují o moci",
    text: "Nezávislá média kontrolují moc tím, že o ní informují. Bez informací by voliči nemohli vládu hodnotit.",
    via: [[775, 262]] }
];

/* Pojistky demokracie: co brání tomu, aby někdo získal všechnu moc. */
window.POJISTKY = [
  { t: "Dělba moci", d: "Zákony přijímá [[parlament|Parlament]], vládne [[vlada|vláda]] a spory rozhodují [[soudy|soudy]]. Žádná z mocí nemůže dělat práci ostatních." },
  { t: "Vláda odpovídá Sněmovně", d: "[[vlada|Vláda]] může vládnout jen s důvěrou [[ps|Sněmovny]], ne s přízní prezidenta." },
  { t: "Senát nejde rozpustit", d: "[[senat|Senát]] se mění po třetinách a funguje, i když je Sněmovna rozpuštěná." },
  { t: "Ústava se mění těžko", d: "Ústavní zákon potřebuje 3/5 poslanců i senátorů, bez veta a bez možnosti přehlasovat Senát ([[zakon|cesta zákona]])." },
  { t: "Věčná klauzule", d: "Podstatné náležitosti demokratického právního státu nejde změnit vůbec, ani ústavním zákonem (čl. 9 Ústavy)." },
  { t: "Ústavní soud", d: "[[us|Ústavní soud]] ruší protiústavní zákony a nikdo ho nemůže přehlasovat." },
  { t: "Nezávislí soudci", d: "Soudce [[soudy|obecných soudů]] nelze odvolat kvůli rozsudku, nesmějí být ve stranách a funkci mají až do 70 let." },
  { t: "Kontrasignace", d: "Část rozhodnutí [[prezident|prezidenta]] platí jen s podpisem premiéra, takže prezident nemůže sám velet armádě nebo jmenovat soudce." },
  { t: "Nezávislé instituce", d: "[[nku|NKÚ]], [[cnb|ČNB]], [[ombudsman|ombudsman]] a [[media|média veřejné služby]] kontrolují moc a nejsou podřízené vládě." },
  { t: "Opozice", d: "41 poslanců nebo 17 senátorů může napadnout zákon u [[us|Ústavního soudu]] a poslanci mohou ministry interpelovat." },
  { t: "Pravidelné svobodné volby", d: "Každé volby jsou příležitost moc vyměnit. Proto se volby konají v pevných termínech ([[volby|volby]])." },
  { t: "Občanská společnost", d: "Svobodná média, spolky, petice a shromáždění. [[obcane|Občané]] mohou moc hlídat i mezi volbami." }
];
