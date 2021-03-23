## Inżynieria Internetu [SSM]

# Narzędzie do organizacji podziałów podsieci IPv6
Prowadzący: mgr inż. Marek Barczyk
### Skład sekcji:
- Bartłomiej Gładys
- Marek Żabiałowicz
- Piotr Paczuła
- Weronika Swoboda
### Politechnika Śląska, Gliwice 2021

#
## Opis projektu
Po wczytaniu pliku program powinien weryfikować błędy, np przydział dla "Oddział 2" ma nieprawidłowy adres sieci. Takie błędy najlepiej jak by były naprawiane. Kolejny przykład błędu, to możliwe powtórzenia przydziałów, co powinno być sygnalizowane.

Wynik powinien zawierać poukładane w kolejności podsieci z wcięciami tak jak na przykładzie powyżej (czyli jeśli jakaś podsieć zawiera się w innej to powinno to być poukładane jak w przykładzie. Wynik powinien zawierać komentarze jakie są dopisane do podsieci. W wyniku dobrze by było też dorobić brakujące podsieci do wypełnienia podsieci nadrzędnej (tylko w przypadku, gdy istnieje jakaś podsieć zawierająca się w nadrzędnej.

#
## Specyfikacja zewnętrzna
### Sposób działania

Przykład uruchomienia programu (analogicznie dla windows/linux):

```bash
./ipv6_subnets_partition-macos test_files/input.txt out.txt
```


Z node.js (wymagany node.js & yarn):

```bash
yarn
node main.js test_files/input.txt out.txt
```

#
## Specyfikacja wewnętrzna
### Biblioteka `ip6addr`
Do obsługi adresów IP i nadania im wyższego poziomu abstrakcji użyto biblioteki `ip6addr`.

### Testowanie
Testowe pliki z przykładowym podziałem sieci znajdują się w folderze `/test_files`.
#
## Wnioski:
- Biblioteka `ip6addr` może zostać użyta do organizacja podziałów zarówno dla ipv4 jak i ipv6
- Tworząc maskę na podstawie prefixu można stwierdzić czy IP znajduje się w danej podsieci
- W ipv6 poszczególne bloki są odseparowane poprzez znak `:`, możemy również zdefiniować początkowe bloki oraz końcowe a między nimi wstawić podwójny znak `::`, oznacza to, że bloki po środku mają wartosć 0
- Można mapować adresy ipv4 na ipv6 poprzez używanie jedynie 32 młodszych bitów
- Wypełnianie podsieci można wykonać poprzez tworzenie dwóch wewnętrznych CIDR i sprawdzenie czy jakikolwiek IP znajduje się w tych CIDR, jeżeli nie, to możemy przyjąć, że taka alokacja jest "WOLNA" i możemy to udokumentować w pliku wyjściowym.