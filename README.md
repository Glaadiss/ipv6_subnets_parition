## Projekt na przedmiot II - Narzędzie do organizacji podziałów podsieci IPv6

#
Po wczytaniu pliku program powinien weryfikować błędy, np przydział dla "Oddział 2" ma nieprawidłowy adres sieci. Takie błędy najlepiej jak by były naprawiane. Kolejny przykład błędu, to możliwe powtórzenia przydziałów, co powinno być sygnalizowane.

Wynik powinien zawierać poukładane w kolejności podsieci z wcięciami tak jak na przykładzie powyżej (czyli jeśli jakaś podsieć zawiera się w innej to powinno to być poukładane jak w przykładzie. Wynik powinien zawierać komentarze jakie są dopisane do podsieci. W wyniku dobrze by było też dorobić brakujące podsieci do wypełnienia podsieci nadrzędnej (tylko w przypadku, gdy istnieje jakaś podsieć zawierająca się w nadrzędnej.

#
### Sposób działania

przykład uruchomienia programu (analogicznie dla windows/linux):

```bash
./ipv6_subnets_partition-macos test_files/input.txt out.txt
```



Z node.js (wymagany node.js & yarn):

```bash
yarn
node main.js test_files/input.txt out.txt
```

