# Razem Wieczorem

Aplikacja do planowania wspólnych spotkań ze znajomymi: tworzenia wydarzeń z nazwą, opisem, propozycjami terminów i aktywnościami.

Projekt na przedmiot **Projekt Systemu Aplikacji Multimedialnej**.

**Autorzy:** Mateusz Rzymowski, Bartłomiej Świder, Krzysztof Machulec, Kacper Ćwiek.

## Technologie i stan projektu

- Backend: PHP, Laravel 13, Fortify, MariaDB/MySQL.
- Frontend: React 19, TypeScript, Inertia 3, Tailwind CSS 4.
- Narzędzia: Composer, npm, Vite+ i Laravel Wayfinder.

Projekt jest w trakcie rozwoju. Część interfejsu czeka na integrację z backendem. Uruchomienie bazy i migracji nie oznacza automatycznie, że każdy widok wyświetla już dane z bazy. Dotyczy to m.in. listy „Moje wydarzenia” i obsługi zaproszeń. Aktualną implementację określają pliki w pobranej gałęzi repozytorium.

## 1. Wymagane programy

Poniższa instrukcja opisuje instalację lokalną na **Windows w PowerShell**. Na nowym komputerze potrzebny jest dostęp do internetu do pobrania programów i zależności.

| Program | Wymaganie i zastosowanie | Pobieranie |
| --- | --- | --- |
| Git | Pobieranie kodu i aktualizacji | [Git](https://git-scm.com/downloads) |
| Laravel Herd | Lokalne środowisko PHP i obsługa domen `.test` | [Herd dla Windows](https://herd.laravel.com/windows) |
| PHP | **8.4.1 lub nowsze zgodne z lockiem**; proponowana aktualna poprawka PHP 8.4 | Instalacja w Herd |
| Composer | Wersja 2; zależności PHP | Dostępny w Herd; osobno: [Composer](https://getcomposer.org/download/) |
| Node.js i npm | Proponowany **Node 24.x od 24.11.0**, npm razem z Node | [Node.js](https://nodejs.org/en/download) |
| MariaDB | Serwer bazy danych; wybierz wspieraną stabilną wersję | [MariaDB Server](https://mariadb.org/download/) |
| Edytor kodu | Opcjonalnie Visual Studio Code | [VS Code](https://code.visualstudio.com/) |

`composer.json` deklaruje PHP `^8.3`, ale wersje zapisane obecnie w `composer.lock` wymagają co najmniej **8.4.1**. PHP 8.2 z XAMPP nie wystarczy. Dokładną zgodność sprawdza Composer.

Zapisany Vite+ wymaga Node `^22.18.0 || ^24.11.0 || >=26.0.0`. Wybierz jedną zgodną wersję; nie trzeba instalować kilku wersji Node ani globalnego `vp`.

### Instalacja środowiska

1. Zainstaluj Git, pozostawiając możliwość używania go z terminala.
2. Zainstaluj i uruchom Herd. W ustawieniach PHP pobierz i wybierz aktualne PHP 8.4, minimum 8.4.1.
3. Zainstaluj Node.js 24.x, minimum 24.11.0, z npm i dodaniem do `PATH`.
4. Zainstaluj MariaDB jako usługę Windows. Ustaw port **3306**, hasło administratora `root` i zapamiętaj je.
5. Otwórz nowy terminal po instalacji programów.

Jeśli masz już działający serwer MySQL/MariaDB, możesz użyć go zamiast instalować drugi. Tylko jeden serwer może jednocześnie zajmować `127.0.0.1:3306`. Przy korzystaniu z osobnej MariaDB nie uruchamiaj równolegle MySQL z XAMPP na tym samym porcie. Apache z XAMPP nie jest potrzebny do uruchomienia przez Herd.

Sprawdź narzędzia:

```powershell
git --version
php -v
composer --version
node -v
npm --version
```

Jeżeli PowerShell blokuje plik `npm.ps1`, używaj w poleceniach `npm.cmd` zamiast `npm`.

## 2. Pobranie repozytorium

W PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\Herd" | Out-Null
Set-Location "$env:USERPROFILE\Herd"
git clone https://github.com/Pequu/Razem-Wieczorem.git
Set-Location '.\Razem-Wieczorem'
```

Jeżeli repozytorium jest prywatne, potrzebujesz dostępu na swoim koncie GitHub. Git może poprosić o zalogowanie w przeglądarce.

Alternatywnie pobierz archiwum przez **Code → Download ZIP** na [stronie repozytorium](https://github.com/Pequu/Razem-Wieczorem), rozpakuj je i nazwij katalog `Razem-Wieczorem`. ZIP nie zawiera historii Git i nie pozwala aktualizować projektu poleceniem `git pull`.

Wszystkie dalsze polecenia projektu uruchamiaj w folderze zawierającym `artisan`, `composer.json` i `package.json`.

## 3. Ustawienie właściwego PHP

W folderze projektu:

```powershell
herd isolate 8.4
php -v
herd php -v
where.exe php
```

Wersja strony w Herd i wersja `php` w terminalu muszą być zgodne z wymaganiami. Sama zmiana wersji witryny w Herd nie naprawi `PATH`, jeśli terminal jako pierwsze znajduje PHP z XAMPP.

Jeżeli `php -v` nadal pokazuje PHP 8.2, a Herd ma już pobrane PHP 8.4, ustaw je dla bieżącego terminala:

```powershell
$herdPhp = "$env:USERPROFILE\.config\herd\bin\php84"
if (Test-Path "$herdPhp\php.exe") {
    $env:Path = "$herdPhp;$env:Path"
    php -v
} else {
    Write-Host 'Sprawdź lokalizację i instalację PHP 8.4 w ustawieniach Herd.'
}
```

To ustawienie obowiązuje tylko w tym oknie. Jeśli używasz go zamiast poprawienia `PATH` w ustawieniach Windows, powtórz je w każdym terminalu, także tym uruchamiającym `npm run dev`. Wayfinder wywołuje tam polecenie `php artisan`.

## 4. Lokalna konfiguracja i zależności

Utwórz plik `.env` tylko wtedy, gdy jeszcze nie istnieje:

```powershell
if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
}
composer install
composer check-platform-reqs
npm ci
```

Używaj **`composer install`**, aby zainstalować wersje z `composer.lock`, i **`npm ci`**, aby użyć `package-lock.json`. Przy zwykłym pobieraniu projektu nie usuwaj plików lock i nie uruchamiaj `composer update` jako sposobu na instalację. Jeśli lock jest niespójny z manifestem, wymaga to uzgodnionej poprawki w repozytorium.

Pierwsza instalacja może potrwać kilka minut. Pliki `vendor` i `node_modules` są pobierane osobno na każdym komputerze i nie znajdują się w repozytorium.

Otwórz `.env` w edytorze. Ustaw:

```dotenv
APP_NAME="Razem Wieczorem"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://razem-wieczorem.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=razem_wieczorem
DB_USERNAME=razem_app
DB_PASSWORD="TWOJE_LOKALNE_HASLO"

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

MAIL_MAILER=log
VITE_APP_NAME="${APP_NAME}"
```

Zastąp `TWOJE_LOKALNE_HASLO` własnym hasłem użytkownika bazy utworzonego w następnym kroku. Nazwy `APP_URL` i witryny w Herd muszą do siebie pasować.

Plik `.env` zawiera lokalne hasła i klucz aplikacji; nie dodawaj go do Gita. `.env.example` jest szablonem, a nie konfiguracją czytaną zamiast `.env`.

## 5. Utworzenie bazy danych

Upewnij się, że usługa MariaDB działa. Otwórz klienta SQL dostarczonego z MariaDB albo użyj innego klienta bazy. Jeśli program `mariadb` jest w `PATH`, możesz połączyć się tak:

```powershell
mariadb -h 127.0.0.1 -P 3306 -u root -p
```

Wpisz hasło administratora ustawione podczas instalacji. Podczas wpisywania hasła terminal może nie wyświetlać znaków. Jeśli `mariadb` nie jest rozpoznawane, uruchom `mariadb.exe` z katalogu `bin` swojej instalacji, podając pełną ścieżkę, albo otwórz klienta z menu Start.

**Poniższe polecenia wykonaj w kliencie SQL, nie w PowerShell.** Przed wykonaniem zamień hasło na własne; takie samo wpisz potem w `.env`:

```sql
CREATE DATABASE IF NOT EXISTS razem_wieczorem
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'razem_app'@'127.0.0.1'
    IDENTIFIED BY 'TWOJE_LOKALNE_HASLO';
CREATE USER 'razem_app'@'localhost'
    IDENTIFIED BY 'TWOJE_LOKALNE_HASLO';

GRANT ALL PRIVILEGES ON razem_wieczorem.* TO 'razem_app'@'127.0.0.1';
GRANT ALL PRIVILEGES ON razem_wieczorem.* TO 'razem_app'@'localhost';
```

Konto aplikacji ma dostęp tylko do tej bazy. Nie musi mieć hasła takiego jak `root`. Jeśli konta `razem_app` już istnieją, użyj ich aktualnych danych zamiast ponownie wykonywać `CREATE USER`.

Wyjdź z klienta poleceniem `exit;`. Sprawdź połączenie konta aplikacji:

```powershell
mariadb -h 127.0.0.1 -P 3306 -u razem_app -p razem_wieczorem
```

phpMyAdmin jest opcjonalnym narzędziem do przeglądania danych; aplikacja go nie wymaga. Jego połączenie konfiguruje się osobno od `.env` Laravel.

## 6. Klucz aplikacji i migracje

Wróć do terminala w folderze projektu. Na nowej instalacji wygeneruj klucz:

```powershell
php artisan key:generate
php artisan config:clear
php artisan migrate
php artisan migrate:status
```

`key:generate` wykonaj dla nowego `.env` z pustym `APP_KEY`. Przy aktualizowaniu działającej instalacji zachowaj jej dotychczasowy klucz.

`migrate` tworzy m.in. tabele użytkowników, sesji i wydarzeń. Nie używaj do zwykłego uruchomienia `migrate:fresh` — usuwa istniejące tabele i dane.

### Opcjonalne dane demonstracyjne

Jeśli chcesz zasilić nową lokalną bazę danymi demonstracyjnymi:

```powershell
php artisan db:seed
```

Aktualny `UserSeeder` tworzy konta `admin@example.com`, `organizer@example.com` oraz `user@example.com` z hasłem `123`. To wyłącznie dane lokalne do demonstracji. Seeder może także nadpisać dane istniejących kont o tych adresach; nie uruchamiaj go w bazie z rzeczywistymi kontami.

`EventDemoSeeder` dodaje przykładowe wydarzenie. Jego pojawienie się w bazie nie podłącza automatycznie listy wydarzeń w React.

## 7. Uruchomienie strony

### Wariant A: Herd i domena `.test`

1. Uruchom Herd i usługę MariaDB.
2. Sprawdź, czy Herd obsługuje folder projektu. Domyślna ścieżka użyta w tej instrukcji to `%USERPROFILE%\Herd\Razem-Wieczorem`. Jeśli witryna nie jest wykrywana, dodaj istniejący projekt w panelu witryn/aplikacji Herd, wskazując ten folder.
3. Ustaw dla witryny PHP 8.4, minimum 8.4.1.
4. W terminalu projektu uruchom:

```powershell
npm run dev
```

5. Pozostaw terminal uruchomiony i otwórz [http://razem-wieczorem.test](http://razem-wieczorem.test).

W tym wariancie Herd obsługuje PHP; nie trzeba dodatkowo uruchamiać `php artisan serve`. Adres wyświetlany przez Vite jest adresem serwera zasobów, a stronę aplikacji otwieramy pod domeną Herd.

### Wariant B: serwer Artisan zamiast domeny Herd

PHP, Composer, Node i MariaDB nadal muszą być dostępne. Ustaw w `.env`:

```dotenv
APP_URL=http://127.0.0.1:8000
```

W pierwszym terminalu projektu:

```powershell
php artisan config:clear
php artisan serve --host=127.0.0.1 --port=8000
```

W drugim terminalu projektu, z tak samo skonfigurowanym PHP:

```powershell
npm run dev
```

Otwórz [http://127.0.0.1:8000](http://127.0.0.1:8000). Oba terminale muszą pozostać uruchomione. `Ctrl+C` zatrzymuje dany proces.

### Kolejne uruchomienia

Po pierwszej konfiguracji wystarczy uruchomić MariaDB, Herd i `npm run dev` (albo dwa terminale w wariancie B). Nie kopiuj ponownie `.env`, nie generuj nowego klucza i nie instaluj zależności przy każdym starcie.

## 8. Sprawdzenie instalacji

| Adres | Widok |
| --- | --- |
| `/` | Strona główna |
| `/events` | Moje wydarzenia; rzeczywista lista wymaga integracji z backendem |
| `/events/create` | Tworzenie wydarzenia |
| `/login` | Logowanie |
| `/register` | Rejestracja |
| `/forgot-password` | Prośba o reset hasła |

Sprawdź formularz tworzenia oraz trasy i migracje:

```powershell
php artisan route:list --path=events
php artisan migrate:status
```

Przy `MAIL_MAILER=log` aplikacja nie wysyła prawdziwych wiadomości. Lokalne wiadomości, np. resetu hasła, trafiają do logów w `storage/logs`. Nie publikuj zawartych w nich linków resetowania.

## 9. Aktualizowanie projektu z Gita

Najpierw sprawdź własne zmiany i zapisz je w commicie albo odłóż przed aktualizacją:

```powershell
git status
git pull --ff-only
composer install
npm ci
php artisan migrate
php artisan optimize:clear
```

Przed aktualizacją zatrzymaj serwer Vite przez `Ctrl+C`, a po aktualizacji ponownie uruchom `npm run dev`. Jeśli `git pull --ff-only` zgłosi rozbieżne gałęzie, uzgodnij ich połączenie z zespołem; nie usuwaj własnych zmian przez `reset --hard`.

Zachowaj `.env` i dotychczasowy `APP_KEY`. Jeśli w `.env.example` doszły nowe zmienne, dopisz je do swojej konfiguracji. Samo klonowanie repozytorium nie przenosi danych z bazy kolegi — do tego potrzebny byłby osobny eksport/import SQL.

## 10. Przydatne polecenia

| Polecenie | Zastosowanie |
| --- | --- |
| `npm run dev` | Frontend z automatycznym odświeżaniem |
| `npm run build` | Budowa plików frontendowych |
| `npm run types:check` | Sprawdzenie typów TypeScript |
| `npm run check` | Kontrole skonfigurowane w Vite+ |
| `php artisan test` | Testy PHP; aktualny `phpunit.xml` wskazuje SQLite w pamięci |
| `composer check-platform-reqs` | Weryfikacja PHP i rozszerzeń |
| `php artisan optimize:clear` | Czyszczenie pamięci podręcznej Laravel |
| `php artisan queue:work` | Opcjonalny proces obsługujący zadania kolejki |

Przed testami sprawdź konfigurację testową i nie kieruj testów do bazy z ważnymi danymi. Testy bazy mogą wymagać rozszerzenia PHP `pdo_sqlite`. Zadania asynchroniczne wymagają działającego procesu kolejki; sam formularz frontendowy go nie uruchamia.

Po `npm run build` można korzystać z gotowych zasobów bez uruchomionego Vite, ale serwer PHP i baza nadal są potrzebne. Po zatrzymaniu `npm run dev`, jeśli aplikacja nadal próbuje łączyć się z nieczynnym Vite, usuń pozostawiony plik `public/hot` i ponów budowę:

```powershell
if (Test-Path '.\public\hot') {
    Remove-Item -LiteralPath '.\public\hot'
}
npm run build
```

To instrukcja lokalnego środowiska, nie wdrożenia produkcyjnego.

## 11. Najczęstsze problemy

### Wymagane PHP `>= 8.4.1`, a terminal pokazuje `8.2.12`

Wykonaj kroki z sekcji 3. Sprawdź `php -v` oraz `where.exe php` w **tym samym terminalu**, w którym uruchamiasz polecenie. Nie edytuj `vendor/composer/platform_check.php` i nie omijaj wymagań opcją `--ignore-platform-reqs`.

### `Error generating types` / `wayfinder:generate --with-form`

Wayfinder uruchamia PHP podczas startu Vite. Najpierw sprawdź właściwą wersję PHP, zainstalowane zależności i sam generator:

```powershell
php -v
php artisan wayfinder:generate --with-form
```

Napraw błąd wypisany przez Artisan, a następnie ponownie uruchom `npm run dev`.

### `No application encryption key has been specified`

Sprawdź, czy istnieje `.env`. Dla nowej instalacji z pustym `APP_KEY` wykonaj:

```powershell
php artisan key:generate
php artisan config:clear
```

### `SQLSTATE[HY000] [2002]` / połączenie odrzucone

Uruchom usługę MariaDB, sprawdź `DB_HOST=127.0.0.1` oraz `DB_PORT=3306`. Sprawdź port:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 3306
```

Wynik potwierdza wyłącznie dostępność portu, nie poprawność hasła ani tożsamość serwera. Nie zmieniaj portu na 3307, jeśli serwer nie został tam skonfigurowany.

### `Access denied` albo `auth_gssapi_client`

Sprawdź, do którego serwera prowadzi port 3306 oraz czy konto używa uwierzytelniania hasłem obsługiwanego przez PHP. Użyj osobnego konta `razem_app` z sekcji 5. Jeśli nie możesz zalogować się jako administrator, popraw dostęp administracyjny do MariaDB — zmiana samego `.env` go nie naprawi.

Wpis `password` w `my.ini` jest ustawieniem klienta, a nie poleceniem zmiany hasła konta na serwerze. Nie włączaj `skip-grant-tables` jako sposobu na zwykłe uruchomienie projektu.

Po poprawieniu `.env` wykonaj `php artisan config:clear`.

### Brakuje tabeli `sessions`, `cache` lub `events`

Sprawdź wybraną bazę w `.env`, wyczyść konfigurację i uruchom migracje:

```powershell
php artisan config:clear
php artisan migrate
```

### Błąd phpMyAdmin dotyczący `pma` / `controluser`

To konfiguracja phpMyAdmin, niezależna od ustawień Laravel. Sprawdź jego host, port, sposób logowania i `controluser` w `config.inc.php`. Do uruchomienia aplikacji wystarczy poprawne połączenie Laravel z bazą; phpMyAdmin nie jest wymagany.

### `Please set up Boost with [php artisan boost:install] first`

W projekcie skrypt `post-update-cmd` wywołuje `boost:update`. Do odtworzenia zależności używaj `composer install`. Jeśli celowo konfigurujesz narzędzia Laravel Boost, uruchom `php artisan boost:install` i wybierz integracje używane przez zespół. Boost nie jest wymaganiem samego interfejsu użytkownika.

### Błąd `view`, `inertia::app`, `Target class [EventController]` albo HTTP 405

Sprawdź, czy wszystkie zmiany danej funkcji zostały pobrane z tej samej gałęzi, oraz uruchom:

```powershell
composer install
php artisan optimize:clear
php artisan route:list --path=events
```

HTTP 405 dla `GET /events` oznacza brak właściwej trasy GET, a nie problem z bazą. Brak importu kontrolera lub niezgodny szablon Inertia wymaga poprawki w kodzie od osoby odpowiedzialnej za tę część. Nie zastępuj plików `vendor` ręcznie.

### Czarny ekran lub brak stylów

1. Sprawdź błędy w terminalu `npm run dev` i konsoli przeglądarki (F12).
2. Sprawdź, czy otwierasz adres Laravel, a nie sam adres serwera Vite.
3. Sprawdź logi aplikacji w `storage/logs`.
4. Wykonaj `php artisan optimize:clear`, uruchom ponownie Vite i odśwież stronę.
5. Jeśli używasz gotowej budowy zamiast Vite, sprawdź pliki `public/build` i punkt dotyczący `public/hot`.

## 12. Główne katalogi

| Ścieżka | Zawartość |
| --- | --- |
| `resources/js/pages` | Strony React, m.in. `events/create.tsx` i `events/index.tsx` |
| `resources/js/components` | Wspólne komponenty interfejsu |
| `resources/js/layouts` | Układy stron |
| `resources/js/app.tsx` | Uruchomienie Inertia i wspólna oprawa aplikacji |
| `resources/css/app.css` | Style globalne |
| `app/Http/Controllers` | Kontrolery backendu |
| `app/Http/Requests` | Walidacja po stronie serwera |
| `app/Models` | Modele i relacje bazy |
| `routes/web.php` | Trasy aplikacji |
| `database/migrations` | Struktura bazy |
| `database/seeders` | Opcjonalne dane początkowe |
| `tests` | Testy |

Zmiany wyglądu i zachowania interfejsu wykonujemy w plikach frontendowych. Przekazywanie danych do Inertia, zapis do bazy i autoryzację uzgadniamy z osobą odpowiedzialną za backend.

## Dokumentacja narzędzi

- [Zarządzanie wersjami PHP w Herd](https://herd.laravel.com/docs/windows/technology/php-versions)
- [Composer: instalowanie zależności z pliku lock](https://getcomposer.org/doc/01-basic-usage.md)
- [Laravel](https://laravel.com/docs)
- [Inertia](https://inertiajs.com/)
- [Vite+](https://www.viteplus.dev/guide)
