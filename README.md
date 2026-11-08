# Politický systém ČR

Studijní web pro Global Citizenship (H-GLC), třídy L1B a L1C, blok 4 Demokracie a právní stát.

- **Dělba moci** (`#mapa`): interaktivní schéma ústavních institucí a jejich vztahů. Režim *Jádro z hodiny* odpovídá schématu z hodiny 4.4 (šipky A–H), *Celé schéma* přidává NKÚ, ČNB, ombudsmana, média veřejné služby a další vztahy. Každá instituce má detail s fakty, pravomocemi, brzdami a vztahy. Pod schématem jsou pojistky demokracie.
- **Volby** (`#volby`): všechny volby v ČR, volební kalendář, principy volebního práva, poměrný a většinový systém a kalkulačka přepočtu hlasů na mandáty (d'Hondt i krajská metoda) s grafem Sněmovny.
- **Cesta zákona** (`#zakon`): legislativní proces s volbami na rozcestích (Senát, Sněmovna, prezident) pro běžný zákon, ústavní zákon, volební zákon a státní rozpočet.

- **Harmonogram** (`#harmonogram`): týdny bloku 4 pro L1B a L1C: probírané téma, simulace, deník, úkoly a odkazy na teorii. Data v `assets/data-harmonogram.js`.
- **Přihlášení** (`#ucet`) kódem z lístečku, učitel e-mailem a heslem. **Učitelský panel** (`#ucitel`): žáci, kódy, strany, tisk kódů.

## Simulace a databáze

Simulační část používá Supabase (projekt `demokracie-cr`, region EU). Připojení je v `assets/supabase-config.js` (publikovatelný klíč je veřejný, oprávnění hlídají pravidla RLS v databázi). Žákovské účty zakládá serverová funkce `spravce`; přihlašovací kód má tvar `B07-LIPA-4821` a slouží zároveň jako heslo k účtu `b07@demokracie-cr.example.com`.

## Úpravy obsahu

Obsah je oddělený od kódu, texty se upravují v datových souborech:

| Soubor | Co obsahuje |
|---|---|
| `assets/data-instituce.js` | instituce, vztahy (šipky), pojistky, stav „ve funkci“ (`STAV` nahoře) |
| `assets/data-volby.js` | jednotlivé volby, volební kalendář, principy volebního práva |
| `assets/data-zakon.js` | kroky cesty zákona a zvláštní případy |

Odkazy uvnitř textů: `[[ps|Sněmovna]]` vede na instituci ve schématu dělby moci, `[[volby/senat|volby do Senátu]]` na konkrétní volby, `[[zakon|cesta zákona]]` na cestu zákona.

Odkazy na konkrétní místo webu: `#mapa-prezident`, `#vztah-veto`, `#volby-kraje`, `#zakon`.

## Spuštění

Statický web bez sestavování. Stačí GitHub Pages (Settings → Pages → Deploy from branch → `main` / root), nebo lokálně `python3 -m http.server` ve složce projektu.

Stav faktů: 8. 11. 2026.
