/* Cesta zákona. Texty kroků; logiku větvení obsahuje app.js. */

window.ZAKON = {
  typy: {
    bezny:   { name: "Běžný zákon", note: "Většina zákonů, třeba o školách, daních nebo silničním provozu." },
    ustavni: { name: "Ústavní zákon", note: "Mění nebo doplňuje Ústavu. Například kdyby se mělo volit od 16 let, protože volební věk stojí v čl. 18 Ústavy." },
    volebni: { name: "Volební zákon", note: "Zákon o volbách. Nesmí ho prosadit jen sněmovní většina, protože by si mohla upravit pravidla ve svůj prospěch." },
    rozpocet:{ name: "Státní rozpočet", note: "Zákon o státním rozpočtu na příští rok. Navrhuje ho jen vláda." }
  },

  kroky: {
    navrh: {
      t: "Návrh zákona",
      inst: "vlada",
      who: "Navrhovatel",
      body: "Zákon může navrhnout poslanec nebo skupina poslanců, [[senat|Senát]], [[vlada|vláda]], nebo zastupitelstvo [[kraje|kraje]]. Když návrh nepředkládá vláda, má 30 dní na to, aby k němu řekla svůj názor.",
      rozpocet: "Návrh státního rozpočtu smí předložit jen [[vlada|vláda]]. Připravuje ho ministerstvo financí.",
      ref: "čl. 41, 42"
    },
    cteni1: {
      t: "1. čtení ve Sněmovně",
      inst: "ps",
      body: "Poslanci debatují o smyslu zákona jako celku. Sněmovna může návrh zamítnout, vrátit navrhovateli k dopracování, nebo ho pošle do výborů.",
      ref: "jednací řád Sněmovny"
    },
    vybory: {
      t: "Výbory",
      inst: "ps",
      body: "Návrh podrobně projdou sněmovní výbory, třeba výbor pro vědu a vzdělání. Zvou odborníky a navrhují změny."
    },
    cteni2: {
      t: "2. čtení",
      inst: "ps",
      body: "Debata o jednotlivých částech zákona. Poslanci podávají pozměňovací návrhy, tedy konkrétní úpravy textu."
    },
    cteni3: {
      t: "3. čtení a hlasování",
      inst: "ps",
      body: "Už se jen opravují chyby. Poslanci hlasují nejdřív o pozměňovacích návrzích a pak o zákonu jako celku. K přijetí stačí nadpoloviční většina přítomných poslanců, pokud je přítomna aspoň třetina (67).",
      ustavni: "Ústavní zákon musí podpořit aspoň 3/5 všech poslanců, tedy 120, ať je jich v sále kolik chce.",
      ref: "čl. 39"
    },
    senat: {
      t: "Senát (30 dní)",
      inst: "senat",
      body: "[[senat|Senát]] má na zákon 30 dní. Může ho schválit, zamítnout, vrátit Sněmovně s pozměňovacími návrhy, nebo se jím nezabývat. Když se nevyjádří, platí to jako schválení.",
      ustavni: "U ústavního zákona musí Senát výslovně souhlasit, a to 3/5 přítomných senátorů. Sněmovna ho nemůže přehlasovat.",
      volebni: "U volebního zákona musí souhlasit obě komory. Sněmovna nemůže Senát přehlasovat.",
      ref: "čl. 46–48, 39, 40"
    },
    senatSkip: {
      t: "Senát se nevyjadřuje",
      inst: "senat",
      body: "Státní rozpočet projednává jen Poslanecká sněmovna. Senát k němu nemá co říct.",
      ref: "čl. 42"
    },
    psZnovu: {
      t: "Sněmovna znovu",
      inst: "ps",
      zamitne: "Senát zákon zamítl. Sněmovna o něm hlasuje znovu a zákon projde, když pro něj zvedne ruku aspoň 101 poslanců, tedy nadpoloviční většina všech, ne jen přítomných.",
      vrati: "Senát vrátil zákon s pozměňovacími návrhy. Sněmovna nejdřív hlasuje o verzi Senátu (stačí většina přítomných). Když ji nepřijme, může schválit svou původní verzi, ale potřebuje k tomu 101 hlasů.",
      bezPrehlasovani: "U tohoto typu zákona Sněmovna Senát přehlasovat nemůže. Projde jen to, s čím souhlasí obě komory.",
      ref: "čl. 47"
    },
    prezident: {
      t: "Prezident (15 dní)",
      inst: "prezident",
      body: "[[prezident|Prezident]] má 15 dní. Zákon podepíše, nebo ho vrátí Sněmovně s odůvodněním (veto). Když neudělá nic, zákon platí i bez jeho podpisu.",
      ustavni: "Ústavní zákon prezident vrátit nemůže, veto u něj neexistuje.",
      ref: "čl. 50, 51"
    },
    psVeto: {
      t: "Sněmovna o vetu",
      inst: "ps",
      body: "Sněmovna hlasuje znovu. Když pro zákon hlasuje aspoň 101 poslanců, veto je přehlasované a zákon platí. Jinak zákon nevznikne.",
      ref: "čl. 50"
    },
    vyhlaseni: {
      t: "Podpisy a vyhlášení",
      inst: "vlada",
      who: "Předseda Sněmovny, prezident a premiér",
      body: "Zákon podepíší předseda Sněmovny, prezident a předseda vlády. Pak se vyhlásí ve Sbírce zákonů a tím začne platit. Účinnost, tedy okamžik, kdy se jím lidé musí řídit, bývá obvykle později, aby se na změnu mohli připravit.",
      ref: "čl. 51, 52"
    },
    us: {
      t: "A pak? Ústavní soud",
      inst: "us",
      body: "I platný zákon může [[us|Ústavní soud]] zrušit, když odporuje Ústavě. Návrh může podat například prezident, 41 poslanců nebo 17 senátorů. Často to dělá opozice, která v hlasování prohrála.",
      ref: "čl. 87"
    }
  },

  zvlastni: [
    { t: "Ústavní zákon", d: "3/5 všech poslanců (120) a 3/5 přítomných senátorů. Senát nelze přehlasovat, prezident nemá veto. Podstatné náležitosti demokratického právního státu nelze změnit vůbec (čl. 9)." },
    { t: "Volební zákon", d: "Musí ho schválit Sněmovna i Senát (čl. 40). Sněmovní většina si tak nemůže sama upravit pravidla voleb ve svůj prospěch." },
    { t: "Státní rozpočet", d: "Navrhuje ho jen vláda a projednává jen Sněmovna (čl. 42). Bez schváleného rozpočtu hospodaří stát v rozpočtovém provizoriu." },
    { t: "Zákonné opatření Senátu", d: "Když je Sněmovna rozpuštěná, může Senát na návrh vlády přijmout zákonné opatření ve věcech, které nesnesou odklad. Nová Sněmovna ho musí schválit, jinak přestane platit (čl. 33)." },
    { t: "Zkrácené jednání", d: "Sněmovna může vyslovit souhlas se zákonem už v 1. čtení, pokud proti tomu nevznese námitku dostatek poslanců. V legislativní nouzi (například při živelní pohromě) může zákon projednat zrychleně." }
  ]
};
