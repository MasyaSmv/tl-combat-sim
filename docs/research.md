# Поиск аналогов — 26.10.2026

## Область поиска

GitHub repository search и веб-поиск GitHub: `"throne and liberty" simulator`, `"throne and liberty" calculator`, `throne-liberty damage`, `throne liberty simulation`, `"throne-and-liberty" simulator`, `"throne" "dps" calculator`, `"throne" "liberty" language:Go`, `"throneandliberty"`, `"throne" simulator language:Go`. Дополнительно изучены найденные README, package metadata и указанные ниже файлы.

Поиск ограничен доступной индексацией и этими запросами; нельзя утверждать, что других проектов не существует. Никакие найденные установщики или скрипты не запускались, независимая точность их прогнозов не тестировалась.

| Проект | Что проверено | Пригодность для нашей задачи |
|---|---|---|
| [NoxyTree/tl-helper](https://github.com/NoxyTree/tl-helper) | README; `packages/combat-engine/README.md`; package.json | Самый близкий. DOM-free JS/ESM-ядро, фиксированная точность, RNG, событие/состояние/происхождение. Package version `0.0.0-milestone.2`, private:true. README прямо говорит о синтетических/модельных правилах и неготовности реального итогового combat pipeline. Не drop-in Go-пакет с проверенным Fury |
| [agrmonteiro/throne-liberty-obsidian](https://github.com/agrmonteiro/throne-liberty-obsidian) | README и package.json | Tier2 Command Lab, Electron/React/TS; заявлены калькулятор и Rotation Builder. README license badge private. Не подтверждена отдельная поддерживаемая Go-библиотека и независимая точность. Находка сохранена, не признана бесполезной |
| [stoopkid713/STOOP](https://github.com/stoopkid713/STOOP) | README веб-страницы; roadmap | Python/HTML анализатор combat logs и сравнение уже записанных боёв. Возможный ориентир импорта/валидации, другой класс задачи |
| [mjb6967/CKdpsApp](https://github.com/mjb6967/CKdpsApp) | Публичный README | DPS meter, собственное описание: personal use, not open source. Не использован как исходный код |
| [EricMaines150/ThroneAndLibertyCalculator](https://github.com/EricMaines150/ThroneAndLibertyCalculator) | Метаданные и корневое дерево веб-страницы | Небольшой калькулятор оптимизации статов; корневого README нет. Полный исходный код не аудирован; по проверенным материалам не установлен пакет событийного боя |
| [Lovelessta90/HealCalc](https://github.com/Lovelessta90/HealCalc) | README и корневая страница | Калькулятор лечения; не найден подтверждённый движок нужной ротации. README заявляет MIT, отдельный LICENSE в корне в этом чтении не получен; вывод о полноте лицензии не делался |
| [wowsims/wotlk](https://github.com/wowsims/wotlk) | README | Go-симулятор для WoW и пример общего движка классов. README указывает MIT; игровые правила TL отсутствуют. Архитектурная ссылка, не зависимость и не перенос кода |
| [simulationcraft/simc](https://github.com/simulationcraft/simc) | Проверено существование/метаданные | Симулятор другой игры, не проверенная основа TL. Исходный код не использован |

## Точные проверенные ссылки для ближайшего аналога

- [Combat engine README](https://github.com/NoxyTree/tl-helper/blob/master/packages/combat-engine/README.md), blob SHA `dff6a21152a6bc6d302b39f678e0f62e8136d182`.
- [Package metadata](https://github.com/NoxyTree/tl-helper/blob/master/packages/combat-engine/package.json), blob SHA `3243b65ae59747395b1048a94cf7ca2630fef6b8`.
- [Tier2 README](https://github.com/agrmonteiro/throne-liberty-obsidian/blob/master/README.md), blob SHA `3716999de0b5e181b958ee11032514518804e0eb`.

TL-Helper указывает другой build игры (`24118850` / `1.431.22.7761`) относительно версии в наших записях. Даже доступные таблицы/формулы нельзя незаметно объединять с пользовательскими данными другой версии.

## Решение

Готового подходящего Go-пакета с проверенными нужными механиками в изученных материалах не найдено. Создаётся самостоятельный проект, который документирует аналоги и не заявляет уникальность. До любого будущего переноса стороннего кода или данных нужно проверить конкретную лицензию и совместимость версий. Отсутствие LICENSE после одного чтения — не полный аудит репозитория и не разрешение копировать.
