let buttonStates = {
    lever: false,
    auto: false,
    spin: false,
    turbo: 1,  // Стани для Turbo: 1, 2 або 3
    volume: true, // Стан для Volume (on/off)
    info: false, // Стан для Info (за потребою)
    fullScreenMode: false,
};

let autoSettings = {
    numberOfRounds: 0,
    stopAfterBigPayout: false,
    loseLimit: 0,
    numberOfRoundsRemaining: 0,
    sumOfAllBets: 0,
    sumOfAllWinnings: 0,
    autoStopped: false,
}

let time_per_icon = 100;  // Початкове значення для Turbo 1

const icon_height = 25.18,
      num_icons = 9,
      indexes = [0, 0, 0],
      iconMap = ["seven", "lucky clover", "plum", "bar", "watermelon", "lemon", "cherry", "grape", "dice"];

const paytable = {
    "seven": 50,
    "lucky clover": 20,
    "bar": 9,
    "watermelon": 6,
    "plum": 5,
    "cherry": 4,
    "lemon": 3,
    "grape": 2,
    "dice": 1,
};

// Масив можливих ставок
let betValues = [0.25, 0.50, 0.75, 1, 1.5, 2, 2.5, 5, 10, 20, 25, 50];
let currentBetIndex = 3; // Початкова ставка 1 ФАНТІКІВ (індекс 3)

let visiblePaylineIndex = -1; // Індекc поточної видимої лінії (-1 означає, що жодна лінія не видима)

let fullScreenModeActivated = false;

const minusButton = document.querySelector('.change-button.minus');
const plusButton = document.querySelector('.change-button.plus');

// Ініціалізація елементів виграшних ліній
const paylineElements = [];
for (let i = 1; i <= 7; i++) {
    const payline = document.querySelector(`.payline_${i}`);
    payline.style.display = 'none'; // Приховуємо всі лінії одразу після завантаження
    paylineElements.push(payline);
}



// function retryLoad(file, retries = 5) {
//     const src = file.getAttribute('src');

//     return new Promise((resolve, reject) => {
//         function attemptLoad(attempt) {
//             const newImg = new Image();
//             newImg.src = src;
            
//             if (newImg.complete) {
//                 resolve();
//                 fileLoaded();
//             }

//             if (attempt <= retries) {
//                 console.log(`Повторна спроба завантаження... (${attempt})`);
//                 attemptLoad(attempt + 1);
//             } else {
//                 reject(`Не вдалося завантажити файл: ${file.src}`);
//             }
//         }
//         attemptLoad(1);
//     });
// }

// function loadAllMediaWithRetries() {
//     const mediaFiles = document.querySelectorAll('img, video');
//     console.log(mediaFiles.length);
//     const loadPromises = [];

//     mediaFiles.forEach(file => {
//         loadPromises.push(retryLoad(file));
//     });

//     return Promise.all(loadPromises);
// }


const mediaFiles = document.querySelectorAll('img, video');
let numberOfLoadedImages = 0;

let intervalChangingText;


document.addEventListener('DOMContentLoaded', () => {

    const loadingText = document.getElementById('loading-text');
    const percents_text = document.getElementById('percents');
    
    // Зміна тексту на завантажувальному екрані
    const loadingMessages = [
        "7 ВИГРАШНИХ ЛІНІЙ",
        "ВИПАДКОВИЙ МНОЖНИК ДО 50Х",
        "РІВНІ ШАНСИ НА ВИПАДАННЯ ВСІХ СИМВОЛІВ"
    ];
    let messageIndex = 0;

    intervalChangingText = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;

        switch (messageIndex) {
            case 0:
                loadingText.style.left = '10vw';
                break;
            case 1:
                loadingText.style.left = '-3vw';
                break;
            case 2:
                loadingText.style.left = '-16vw';
                break;
        }

        loadingText.innerText = loadingMessages[messageIndex];
    }, 4000); // Зміна повідомлення кожні 2 секунди


    // Важливі зображення для портретного режиму, прелоадеру та інші зображення
    const portraitImages = document.querySelectorAll('.portrait-important');
    const preloaderImages = document.querySelectorAll('.preloader-important');
    const lazyImages = document.querySelectorAll('.lazy-load');


    // Функція для завантаження масиву зображень
    function loadImagesSequentially(images) {
        const loadPromises = [];

        images.forEach((img) => {
            loadPromises.push(new Promise((resolve, reject) => {
                const dataSrc = img.getAttribute('data-src');
                const src = img.getAttribute('src');

                if (dataSrc) {
                    img.src = dataSrc;  // Тепер браузер почне завантажувати зображення
                    img.removeAttribute('data-src'); // Можна видалити `data-src` після встановлення `src`

                } else if (src) {
                    const newImg = new Image();
                    newImg.src = src;

                    if (newImg.complete) {
                        resolve();
                        fileLoaded();
                        console.log(`Зображення ${img.src} вже завантажено!`);
                    }
                }

                img.onload = () => {
                    resolve();
                    fileLoaded();
                    console.log(`${img.src} завантажено!`)
                }
            }));
        });

        return Promise.all(loadPromises);
    }

    // Функція для завантаження зображень у відповідному порядку
    function loadImagesBasedOnOrientation() {
        const landscapeQuery = window.matchMedia("(orientation: landscape)");

        if (landscapeQuery.matches) {
            // Спочатку завантажуємо зображення для прелоадеру, потім для портретного режиму
            loadImagesSequentially(preloaderImages)
                .then(() => {
                    console.log('Зображення для прелоадеру завантажені!');
                    return loadImagesSequentially(portraitImages);
                })
                .then(() => {
                    console.log('Зображення для портретного режиму завантажені!');
                    return loadImagesSequentially(lazyImages);
                })
                .then(() => {
                    numberOfLoadedImages = mediaFiles.length;
                    console.log('Усі зображення завантажені!');
                });
        } else {
            // Спочатку завантажуємо зображення для портретного режиму, потім для прелоадеру
            loadImagesSequentially(portraitImages)
                .then(() => {
                    console.log('Зображення для портретного режиму завантажені!');
                    return loadImagesSequentially(preloaderImages);
                })
                .then(() => {
                    console.log('Зображення для прелоадеру завантажені!');
                    return loadImagesSequentially(lazyImages);
                })
                .then(() => {
                    numberOfLoadedImages = mediaFiles.length;
                    console.log('Усі зображення завантажені!');
                });
        }
    }

    // Викликаємо функцію для завантаження зображень у потрібному порядку
    loadImagesBasedOnOrientation();



    function fileLoaded() {
        numberOfLoadedImages++
        console.log(`Amount of loaded images: ${numberOfLoadedImages}`);

        let percentage_loaded = ((numberOfLoadedImages * 100) / mediaFiles.length).toFixed(1)
        console.log(`Loaded: ${percentage_loaded}%`);

        if (percentage_loaded <= 100) {
            percents_text.textContent = `${percentage_loaded}%`;
        }

        const images = document.querySelectorAll('.progress-bar-container img');
        const totalImages = images.length;
        const numberOfImagesToChange = Math.floor((percentage_loaded / 100) * totalImages);

        images.forEach((img, index) => {
            if (index < numberOfImagesToChange) {
                img.style.opacity = 1;
            } else {
                img.style.opacity = 0.3;
            }
        });

        if(numberOfLoadedImages === mediaFiles.length) {
            percents_text.textContent = `${percentage_loaded}%`;
        }
    }

})



function handleOrientationChange(event) {
    const slotContainer = document.querySelector('.slot-container');
    const portraitMode = document.querySelector('.portrait-mode');
    const preloader = document.querySelector('.preloader');

    if (event.matches) {
        // Ландшафтний режим

        slotContainer.classList.remove('hidden');
        portraitMode.classList.add('hidden');

        preloader.style.opacity = 1;
        slotContainer.style.opacity = 1;
        portraitMode.style.opacity = 0;

        console.log('Ландшафтний режим');

    } else {
        // Портретний режим

        slotContainer.classList.add('hidden');
        portraitMode.classList.remove('hidden');

        slotContainer.style.opacity = 0;
        portraitMode.style.opacity = 1;
        preloader.style.opacity = 0;

        console.log('Портретний режим');
    }
}



function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    preloader.classList.add('preloader--hide')
}

// Використовуємо matchMedia для відстеження змін орієнтації
const landscapeQuery = window.matchMedia("(orientation: landscape)");
landscapeQuery.addEventListener("change", handleOrientationChange);

// Перевірка початкової орієнтації при завантаженні сторінки
handleOrientationChange(landscapeQuery);



// Функція оновлення відображення ставки
function updateBetValue() {
    const betText = document.querySelector('.frame-subtext');
    betText.textContent = `${betValues[currentBetIndex]} ФАНТІКІВ`;

    // Деактивація кнопок на межах ставок
    minusButton.disabled = currentBetIndex === 0;
    plusButton.disabled = currentBetIndex === betValues.length - 1;

    // Візуальна прозорість для кнопок, коли вони неактивні
    minusButton.style.opacity = currentBetIndex === 0 ? 0.5 : 1;
    plusButton.style.opacity = currentBetIndex === betValues.length - 1 ? 0.5 : 1;
}

// Збільшення ставки
function increaseBet() {
    if (currentBetIndex < betValues.length - 1) {
        currentBetIndex++;
        updateBetValue();
    }
}

// Зменшення ставки
function decreaseBet() {
    if (currentBetIndex > 0) {
        currentBetIndex--;
        updateBetValue();
    }
}

// Додавання слухачів подій до кнопок
minusButton.onclick = decreaseBet;
plusButton.onclick = increaseBet;

const roll = (reel, offset = 0) => {
    const delta = (buttonStates.turbo === 1) 
        ? (offset + 2) * num_icons + Math.round(Math.random() * num_icons)
        : (buttonStates.turbo === 2)
            ? 2 * num_icons + Math.round(Math.random() * num_icons)
            : Math.round(Math.random() * num_icons);

    const turboTimePerIcon = buttonStates.turbo === 1 ? 100 : buttonStates.turbo === 2 ? 50 : 25;

    const style = getComputedStyle(reel),
          backgroundPositionY = Math.floor(parseFloat(style["background-position-y"]) * 10) / 10,
          backgroundPositionYinVH = Math.floor((backgroundPositionY / window.innerHeight) * 100 * 100) / 100,
          targetBackgroundPositionY = backgroundPositionYinVH + delta * icon_height,
          normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);
    

    return new Promise((resolve) => {
        reel.style.transition = `background-position-y ${8 + delta * turboTimePerIcon}ms cubic-bezier(.45,.05,.95,1)`;
        reel.style.backgroundPositionY = `${targetBackgroundPositionY}vh`;

        setTimeout(() => {
            reel.style.transition = "none";

            const symbol_index = (indexes[offset] + delta) % num_icons;

            if (iconMap[symbol_index] === 'seven') {
                reel.style.backgroundPositionY = `0px`;

            } else {
                reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}vh`;
            }
            
            resolve(delta % num_icons);

            // Playing reel_stops sound
            const reelStopsSound = document.getElementById('reel-stops-sound');
            reelStopsSound.currentTime = 0; // Скидаємо до початку, щоб звук грав з початку при кожному натисканні
            reelStopsSound.play();

        }, 8 + delta * turboTimePerIcon);
    });
};

function rollAll() {
    return new Promise((resolve) => {
        const winSound = document.getElementById('win-sound');
        const reelsSpinningSound = document.getElementById('reels-spinning-sound');
        reelsSpinningSound.currentTime = 0;
        reelsSpinningSound.play();

        const reelsList = document.querySelectorAll('.slots > .reel');
        const spinButton = document.querySelector('.button-icon.spin');
        const autoButton = document.querySelector('.button-icon.auto');

        spinButton.style.pointerEvents = 'none';
        autoButton.style.pointerEvents = 'none';

        buttonStates.spin = true;
        setButtonImage(spinButton);

        const paylinesTextElement = document.querySelector('.frame-text.small');
        paylinesTextElement.textContent = '7 ВИГРАШНИХ ЛІНІЙ';

        if (visiblePaylineIndex !== -1) {
            paylineElements[visiblePaylineIndex].style.display = 'none';
            visiblePaylineIndex = -1;
        }

        const winTextElement = document.querySelector('.frame-subtext.large');
        let newWinText = 'УДАЧІ!';
        winTextElement.textContent = newWinText;

        const balanceTextElement = document.querySelector('.frame-subtext.balance');
        const currentBalanceText = balanceTextElement.textContent;
        const currentBalance = parseFloat(currentBalanceText, 10);

        if (currentBalance === 0 || (currentBalance - betValues[currentBetIndex]) < 0) {
            newWinText = 'ДЕПНІТЬ!';
            winTextElement.textContent = newWinText;

            buttonStates.spin = false;
            setButtonImage(spinButton);

            spinButton.style.pointerEvents = 'auto';
            autoButton.style.pointerEvents = 'auto';

            reelsSpinningSound.pause();
            resolve(); // Завершуємо Promise
        } else {
            let newBalance = currentBalance - betValues[currentBetIndex];
            balanceTextElement.textContent = `${newBalance} ФАНТІКІВ`;

            autoSettings['sumOfAllBets'] += betValues[currentBetIndex];

            Promise
                .all([...reelsList].map((reel, i) => roll(reel, i)))
                .then((deltas) => {
                    reelsSpinningSound.pause();
                    deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
                    indexes.map((index) => { console.log(iconMap[index]) });

                    checkAllWinningLines(newBalance, winSound);

                    if (buttonStates['auto'] === false) {
                        spinButton.style.pointerEvents = 'auto';
                        
                        changeImage(spinButton, 'spin');
                    }

                    autoButton.style.pointerEvents = 'auto';

                    resolve(); // Завершуємо Promise після завершення обертання
                });
        }
    });
}



async function autoGame(continue_spinning = false, recursion = false) {
    const autoInfoElement = document.querySelector('.auto-info');
    let roundsToSpin = 0;

    if (continue_spinning) {
        roundsToSpin = autoSettings['numberOfRoundsRemaining'];
    } else {
        roundsToSpin = autoSettings['numberOfRounds'];
        autoInfoElement.style.opacity = 1; // Показуємо елемент

        if (recursion === false) {
            autoSettings['sumOfAllBets'] = 0;
            autoSettings['sumOfAllWinnings'] = 0;
        }

        if (autoSettings['numberOfRounds'] !== 0) {
            autoInfoElement.textContent = autoSettings['numberOfRounds'];
        }
    }

    if (buttonStates['auto']) {
        if (autoSettings['numberOfRounds'] === 0) {
            if ((autoSettings['sumOfAllBets'] - autoSettings['sumOfAllWinnings']) >= (autoSettings['loseLimit'] * betValues[currentBetIndex]) && autoSettings['loseLimit'] !== 0) {
                if (buttonStates['auto']) {
                    const autoButton = document.querySelector('.button-icon.auto');
                    changeImage(autoButton, 'auto');
                }

                // Тут ще додати показ банеру з інфо шо досягнуто луз ліміт
                const banner = document.getElementById('loss_limit_reached_banner');
                const overlay = document.getElementById('overlay');

                banner.style.display = 'block';
                overlay.classList.remove('hidden');

                const spinButton = document.querySelector('.button-icon.spin');

                spinButton.style.pointerEvents = 'auto';
                buttonStates['spin'] = false;
                setButtonImage(spinButton);

            } else {
                await rollAll(); // Чекаємо завершення обертання перед запуском наступного раунду
                await new Promise(resolve => setTimeout(resolve, 500)); // Затримка перед наступним раундом (500 мс)
                if (buttonStates['auto']) {
                    autoGame(false, true);
                } 
            }
            
        } else {
            for (let roundNumber = 1; roundNumber <= roundsToSpin; roundNumber++) {
                if ((autoSettings['sumOfAllBets'] - autoSettings['sumOfAllWinnings']) >= (autoSettings['loseLimit'] * betValues[currentBetIndex]) && autoSettings['loseLimit'] !== 0) {
                    if (buttonStates['auto']) {
                        const autoButton = document.querySelector('.button-icon.auto');
                        changeImage(autoButton, 'auto');
                    }

                    // Тут ще додати показ банеру з інфо шо досягнуто луз ліміт
                    const banner = document.getElementById('loss_limit_reached_banner');
                    const overlay = document.getElementById('overlay');

                    banner.style.display = 'block';
                    overlay.classList.remove('hidden');

                    const spinButton = document.querySelector('.button-icon.spin');

                    spinButton.style.pointerEvents = 'auto';
                    buttonStates['spin'] = false;
                    setButtonImage(spinButton);

                } else {
                    if (buttonStates['auto']) {
                        if (continue_spinning) {
                            autoSettings['numberOfRoundsRemaining'] = roundsToSpin - roundNumber;
                        } else {
                            autoSettings['numberOfRoundsRemaining'] = autoSettings['numberOfRounds'] - roundNumber;
                        }
        
                        autoInfoElement.textContent = parseInt(autoInfoElement.textContent, 10) - 1;
                        await rollAll(); // Чекаємо завершення обертання перед запуском наступного раунду
                        await new Promise(resolve => setTimeout(resolve, 500)); // Затримка перед наступним раундом (500 мс)
                    }
                }
            }
            if (buttonStates['auto']) {
                const autoButton = document.querySelector('.button-icon.auto');
                const spinButton = document.querySelector('.button-icon.spin');

                changeImage(autoButton, 'auto');
                spinButton.style.pointerEvents = 'auto';
                buttonStates['spin'] = false;
                setButtonImage(spinButton);
            }
        }
    }
}


function checkAllWinningLines(currentBalance, winSound) {
    const winningLines = [
        [indexes[0], indexes[1], indexes[2]], // Лінія 1 - центральна горизонтальна лінія
        [indexes[0] + 1, indexes[1], indexes[2] - 1], // Лінія 2 - діагональ з верхнього лівого кута до нижнього правого кута
        [indexes[0] - 1, indexes[1], indexes[2] + 1],  // Лінія 3 - діагональ з правого верхнього кута до нижнього лівого кута
        [indexes[0], indexes[1] - 1, indexes[2]],  // Лінія 4 - від середньої комірки першого барабану до нижньої комірки другого барабану і до середньої комірки третього барабану
        [indexes[0], indexes[1] + 1, indexes[2]],  // Лінія 5 - від середньої комірки першого барабану до верхньої комірки другого барабану і до середньої комірки третього барабану
        [indexes[0] - 1, indexes[1] + 1, indexes[2] - 1],  // Лінія 6 - від нижньої комірки першого барабану до верхньої комірки другого барабану і до нижньої комірки третього барабану
        [indexes[0] + 1, indexes[1] - 1, indexes[2] + 1]  // Лінія 7 - від верхньої комірки першого барабану до нижньої комірки другого барабану і до верхньої комірки третього барабану
    ];

    winningLines.forEach((line, index) => {
        if (line[0] === line[1] && line[1] === line[2]) {
            processWinningLine(index, iconMap[line[0]], winSound, currentBalance);
        }
    });
}

// Функція для приховування банера
function hideWinBanner() {
    const payoutSound = document.getElementById('payout-sound');
    payoutSound.pause();

    const winBanner = document.getElementById('win-banner');
    const overlay = document.getElementById('overlay');
    winBanner.classList.add('hidden');
    overlay.classList.add('hidden');

    if (autoSettings['autoStopped']) {
        buttonStates['auto'] = true;
        autoSettings['autoStopped'] = false;
    }

    if (autoSettings['stopAfterBigPayout'] === false && buttonStates['auto'] === true) {
        const leverButton = document.querySelector('.lever');
        leverButton.style.pointerEvents = 'none'; // Забороняємо взаємодію з кнопкою
        leverButton.style.cursor = 'default'; // Міняємо курсор на звичайний (не клікабельний)

        const autoButton = document.querySelector('.button-icon.auto');
        setButtonImage(autoButton);

        autoGame(true);
    }
}

// Обробник для приховування банера
function hideBanner() {
    const winType = document.getElementById('win-type');
    const winAmount = document.getElementById('win-amount');

    winAmount.removeEventListener('click', hideBanner);
    winType.removeEventListener('click', hideBanner);
    hideWinBanner();
}

function showWinBanner(type, amount) {
    if (buttonStates['auto']) {
        if (autoSettings['stopAfterBigPayout']) {
            const autoButton = document.querySelector('.button-icon.auto');
            changeImage(autoButton, 'auto');
        } else {
            buttonStates['auto'] = false;
            autoSettings['autoStopped'] = true;
        }
    }

    const openingSound = document.getElementById('opening-sound');
    openingSound.currentTime = 0; // Скидаємо до початку, щоб звук грав з початку при кожному натисканні
    openingSound.play();

    const winBanner = document.getElementById('win-banner');
    const overlay = document.getElementById('overlay');
    const winType = document.getElementById('win-type');
    const winAmount = document.getElementById('win-amount');

    // Видаляємо існуючі обробники перед додаванням нових
    winAmount.removeEventListener('click', hideBanner);
    winType.removeEventListener('click', hideBanner);

    winType.textContent = 'BIG WIN';
    winAmount.textContent = '0.00';
    winBanner.classList.remove('hidden');
    overlay.classList.remove('hidden');

    // Встановлюємо початковий стан для анімації та позиціювання
    winBanner.style.position = 'fixed';
    winBanner.style.top = '50%';
    winBanner.style.left = '50%';
    winBanner.style.transform = 'translate(-50%, -50%) scale(1)';
    winBanner.style.transformOrigin = 'center center';
    winBanner.style.animation = 'hitEffect 1s ease-in-out';

    let currentAmount = 0;
    const duration = 10000; // Загальна тривалість анімації в мілісекундах
    const intervalTime = 50; // Інтервал оновлення суми в мілісекундах
    const increment = amount / (duration / intervalTime); // Кількість, яку додаємо на кожному кроці

    const accrualOfWinningsSound = document.getElementById('accrual-of-winnings-sound');
    accrualOfWinningsSound.currentTime = 0; // Скидаємо до початку, щоб звук грав з початку при кожному натисканні
    accrualOfWinningsSound.play();

    const payoutSound = document.getElementById('payout-sound');
    payoutSound.currentTime = 0; // Скидаємо до початку, щоб звук грав з початку при кожному натисканні

    const payoutSoundWithoutApplause = document.getElementById('payout-sound-without-applause');
    payoutSoundWithoutApplause.currentTime = 0; // Скидаємо до початку, щоб звук грав з початку при кожному натисканні

    let animationFinished = false;

    const counterInterval = setInterval(() => {
        currentAmount += increment;

        // Зміна на "CRAZY WIN", коли сума виграшу перевищує x20 від ставки
        if (currentAmount === betValues[currentBetIndex] * 20 && type === 'CRAZY WIN') {
            winType.textContent = 'CRAZY WIN';
            payoutSoundWithoutApplause.play();
            winBanner.style.animation = 'textChangedEffect 1s ease-in-out'; // Додаємо анімацію "удару" при зміні тексту
        }
        
        if (currentAmount >= amount) {
            currentAmount = amount;
            clearInterval(counterInterval);

            accrualOfWinningsSound.pause();
            payoutSound.play();

            animationFinished = true;

            // Після завершення нарахування виконуємо додаткову анімацію "удару"
            winBanner.style.animation = 'finalHitEffect 1s ease-in-out';
            setTimeout(addHideEventListener, 1000); // Додаємо обробник приховування після завершення фінальної анімації
        }
        winAmount.textContent = currentAmount.toFixed(2);
    }, intervalTime);
    
    // Додаємо обробник кліку для пропуску анімації
    const skipAnimation = () => {
        if (animationFinished) {
            console.log('tried to skip animation, but it already has ended...');
        } else {
            console.log('animation skipped');

            if (type === 'CRAZY WIN') {
                winType.textContent = 'CRAZY WIN';
            }
    
            accrualOfWinningsSound.pause();
            payoutSoundWithoutApplause.pause();
            payoutSound.play();
    
            clearInterval(counterInterval);
            currentAmount = amount;
            winAmount.textContent = currentAmount.toFixed(2);
            winBanner.style.animation = 'finalHitEffect 1s ease-in-out';
            winAmount.removeEventListener('click', skipAnimation);
            winType.removeEventListener('click', skipAnimation);
    
            setTimeout(addHideEventListener, 1000); // Додаємо обробник приховування після завершення фінальної анімації
        }


        if (autoSettings['autoStopped']) {
            const autoButton = document.querySelector('.button-icon.auto');
            autoButton.src = 'assets-for-gold-bonanza-compressed/auto_button_on.png';
        }
    };

    winAmount.addEventListener('click', skipAnimation);
    winType.addEventListener('click', skipAnimation);

    // Функція для додавання обробника кліку для приховування банера після завершення анімації
    function addHideEventListener() {
        winAmount.addEventListener('click', hideBanner);
        winType.addEventListener('click', hideBanner);
    }
}


// Оновлення функції processWinningLine для підтримки "BIG WIN" і "CRAZY WIN"
function processWinningLine(lineIndex, symbol, winSound, currentBalance) {
    if (visiblePaylineIndex !== -1) {
        paylineElements[visiblePaylineIndex].style.display = 'none';
    }

    paylineElements[lineIndex].style.display = 'block';
    visiblePaylineIndex = lineIndex;

    winSound.currentTime = 0;
    winSound.play();

    const winTextElement = document.querySelector('.frame-subtext.large');
    const balanceTextElement = document.querySelector('.frame-subtext.balance');
    const paylinesTextElement = document.querySelector('.frame-text.small');

    let winAmount = betValues[currentBetIndex] * (paytable[symbol] || 0);
    const newBalance = currentBalance + winAmount;
    balanceTextElement.textContent = `${newBalance} ФАНТІКІВ`;
    winTextElement.textContent = `${winAmount} ФАНТІКІВ!`;
    paylinesTextElement.textContent = `ЛІНІЯ ${lineIndex + 1} ПЛАТИТЬ!`;

    autoSettings['sumOfAllWinnings'] += winAmount;

    // Логіка для показу банера виграшу при досягненні x20 або x50 від ставки
    if (paytable[symbol] === 50) {
        showWinBanner('CRAZY WIN', winAmount);
    } else if (paytable[symbol] === 20) {
        showWinBanner('BIG WIN', winAmount);
    }

    console.log(`Виграшна лінія ${lineIndex + 1}`);
}

function toggleMute() {
    const audioElements = document.querySelectorAll('audio');

    // Якщо перший аудіо-елемент вимкнений, вимикаємо mute, інакше включаємо
    const isMuted = audioElements[0].muted;

    audioElements.forEach(audio => {
        audio.muted = !isMuted; // Перемикаємо властивість muted для всіх звуків
    });
}

function setButtonImage(button) {
    const images = {
        auto: {
            on: 'assets-for-gold-bonanza-compressed/auto_button_on.png',
            hover: 'assets-for-gold-bonanza-compressed/auto_button_on_hover.png',
            default: 'assets-for-gold-bonanza-compressed/auto_spin_button.png',
            hoverDefault: 'assets-for-gold-bonanza-compressed/auto_button_hover.png'
        },
        spin: {
            on: 'assets-for-gold-bonanza-compressed/spin_button_on.png',
            hover: 'assets-for-gold-bonanza-compressed/spin_button_on_hover.png',
            default: 'assets-for-gold-bonanza-compressed/spin_button.png',
            hoverDefault: 'assets-for-gold-bonanza-compressed/spin_button_hover.png'
        },
        turbo: {
            1: { normal: 'assets-for-gold-bonanza-compressed/turbo_1_button.png', hover: 'assets-for-gold-bonanza-compressed/turbo_1_button_hover.png' },
            2: { normal: 'assets-for-gold-bonanza-compressed/turbo_2_button.png', hover: 'assets-for-gold-bonanza-compressed/turbo_2_button_hover.png' },
            3: { normal: 'assets-for-gold-bonanza-compressed/turbo_3_button.png', hover: 'assets-for-gold-bonanza-compressed/turbo_3_button_hover.png' }
        },
        volume: {
            on: 'assets-for-gold-bonanza-compressed/volume_button.png',
            hover: 'assets-for-gold-bonanza-compressed/volume_button_hover.png',
            off: 'assets-for-gold-bonanza-compressed/volume_button_off.png',
            offHover: 'assets-for-gold-bonanza-compressed/volume_button_off_hover.png'
        },
        info: {
            default: 'assets-for-gold-bonanza-compressed/info_button.png',
            hover: 'assets-for-gold-bonanza-compressed/info_button_hover.png'
        },
        landscapeModeFullScreenModeBtn: {
            on: 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png',
            default: 'assets-for-gold-bonanza-compressed/open_full-screen_button.png',
        },
        FullScreenModeBtn: {
            on: 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png',
            default: 'assets-for-gold-bonanza-compressed/open_full-screen_button.png',
        },
        preloaderFullScreenModeBtn: {
            on: 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png',
            default: 'assets-for-gold-bonanza-compressed/open_full-screen_button.png',
        },
    };


    if (button.classList.contains('auto')) {
        button.src = buttonStates.auto ? images.auto.on : images.auto.default;
    } else if (button.classList.contains('spin')) {
        button.src = buttonStates.spin ? images.spin.on : images.spin.default;
    } else if (button.classList.contains('turbo')) {
        button.src = images.turbo[buttonStates.turbo].normal;
    } else if (button.classList.contains('volume')) {
        button.src = buttonStates.volume ? images.volume.on : images.volume.off;
    } else if (button.classList.contains('info')) {
        button.src = images.info.default;
    } else if (button.classList.contains('preloader-full-screen-mode-btn-img') || button.classList.contains('landscape-mode-full-screen-mode-btn-img') || button.classList.contains('full-screen-mode-btn-img')) {
        const landscapeModeFullScreenModeBtn = document.querySelector('.landscape-mode-full-screen-mode-btn img');
        const FullScreenModeBtn = document.querySelector('.full-screen-mode-btn img');
        const preloaderFullScreenModeBtn = document.querySelector('.preloader-full-screen-mode-btn img');

        landscapeModeFullScreenModeBtn.src = buttonStates.fullScreenMode ? images.landscapeModeFullScreenModeBtn.on : images.landscapeModeFullScreenModeBtn.default;
        FullScreenModeBtn.src = buttonStates.fullScreenMode ? images.FullScreenModeBtn.on : images.FullScreenModeBtn.default;
        preloaderFullScreenModeBtn.src = buttonStates.fullScreenMode ? images.preloaderFullScreenModeBtn.on : images.preloaderFullScreenModeBtn.default;
    }
}

function changeImage(button, buttonType) {
    if (buttonType === 'turbo') {
        buttonStates.turbo = (buttonStates.turbo % 3) + 1;  // Перемикаємось між 1, 2 і 3
    } else {
        buttonStates[buttonType] = !buttonStates[buttonType];  // Перемикаємо стан кнопки
    }

    if ((buttonType === 'auto' || buttonType === 'spin') && !buttonStates[buttonType]) {
        if (buttonType === 'auto') {
            const autoInfoElement = document.querySelector('.auto-info');
            autoInfoElement.style.opacity = 0;
        }

        const leverButton = document.querySelector('.lever');
        leverButton.style.pointerEvents = 'auto'; // Дозволяємо взаємодію з кнопкою
        leverButton.style.cursor = 'pointer'; // Повертаємо курсор "вказівник руки"

    } else if ((buttonType === 'auto' || buttonType === 'spin') && buttonStates[buttonType]) {
        // Знаходимо контейнер та панель з налаштуваннями
        const advancedAutoSettingsContainer = document.querySelector('.advanced-auto-settings-container');
        const advancedAutoSettingsPanel = document.getElementById('advanced-auto-settings-panel');

        // Перевіряємо, чи панель відкрита
        const isPanelVisible = advancedAutoSettingsContainer.classList.contains('show');
        // Отримуємо всі зображення всередині <div class="settings-buttons">
        const images = document.querySelectorAll('.settings-buttons img');

        if (isPanelVisible) {
            // Якщо панель відкрита, ховаємо її
            advancedAutoSettingsContainer.classList.remove('show');
            advancedAutoSettingsPanel.classList.remove('show');

            // Додаємо кожному зображенню потрібні стилі
            images.forEach((img) => {
                img.style.pointerEvents = 'none'; // Вимикаємо можливість взаємодії
                img.style.cursor = 'default';     // Змінюємо курсор на стандартний
            });
        }

        const leverButton = document.querySelector('.lever');
        leverButton.style.pointerEvents = 'none'; // Забороняємо взаємодію з кнопкою
        leverButton.style.cursor = 'default'; // Міняємо курсор на звичайний (не клікабельний)
    }

    setButtonImage(button);  // Встановлюємо зображення відповідно до стану
}

function pullLever(leverElement) {
    // Знаходимо контейнер та панель з налаштуваннями
    const advancedAutoSettingsContainer = document.querySelector('.advanced-auto-settings-container');
    const advancedAutoSettingsPanel = document.getElementById('advanced-auto-settings-panel');

    // Додаємо клас для анімації натискання важеля
    leverElement.classList.add('pull-down');

    // Перевіряємо, чи панель відкрита
    const isPanelVisible = advancedAutoSettingsContainer.classList.contains('show');
    // Отримуємо всі зображення всередині <div class="settings-buttons">
    const images = document.querySelectorAll('.settings-buttons img');

    if (isPanelVisible) {
        // Якщо панель відкрита, ховаємо її
        advancedAutoSettingsContainer.classList.remove('show');
        advancedAutoSettingsPanel.classList.remove('show');

        // Додаємо кожному зображенню потрібні стилі
        images.forEach((img) => {
            img.style.pointerEvents = 'none'; // Вимикаємо можливість взаємодії
            img.style.cursor = 'default';     // Змінюємо курсор на стандартний
        });

    } else {
        // Якщо панель прихована, показуємо її
        advancedAutoSettingsContainer.classList.add('show');
        advancedAutoSettingsPanel.classList.remove('hidden');
        advancedAutoSettingsPanel.classList.add('show');

        // Додаємо кожному зображенню потрібні стилі
        images.forEach((img) => {
            img.style.pointerEvents = 'auto'; // Вимикаємо можливість взаємодії
            img.style.cursor = 'pointer';     // Змінюємо курсор на стандартний
        });
    }

    // Повертаємо важіль в початкове положення через 500 мілісекунд
    setTimeout(() => {
        leverElement.classList.remove('pull-down');
    }, 500);
}



window.onload = () => {
    console.log('Сторінка завантажена!');

    const percents_text = document.getElementById('percents');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const playBtn = document.querySelector('.play-btn img');

    console.log(`Потрібно завантажити зображень: ${mediaFiles.length}`);
    console.log(`Кількість завантажених зображень: ${numberOfLoadedImages}`);

    if (mediaFiles.length === numberOfLoadedImages) {
        console.log(`Завантажена потрібна кількість зображень! (${numberOfLoadedImages}/${mediaFiles.length})`);

        document.body.style.backgroundImage = "url('assets-for-gold-bonanza-compressed/gold-bonanza-background.jpg')";

        const reels = document.querySelectorAll('.reel');

        reels.forEach((reel) => {
            reel.style.backgroundImage = "url('assets-for-gold-bonanza-compressed/golden_reel_bigger.png')";
        });
        

        const images = document.querySelectorAll('.progress-bar-container img');

        images.forEach((img) => {
            img.style.opacity = 1;
        });

        percents_text.textContent = `100.00%`;

        setTimeout(() => {
            percents_text.style.opacity = 0;
            progressBarContainer.style.opacity = 0;
            playBtn.style.opacity = 1;
        }, 2000);

    } else {
        clearInterval(intervalChangingText);
        const loadingText = document.getElementById('loading-text');
        loadingText.style.left = '-16vw';
        loadingText.innerText = "ВИНИКЛИ ПРОБЛЕМИ З ІНТЕРНЕТ З'ЄДНАННЯМ";

        console.log(`Потрібна кількість зображень не була завантажена! (${numberOfLoadedImages}/${mediaFiles.length})`);
        console.log("!!!У КОРИСТУВАЧА ВИНИКЛИ ПРОБЛЕМИ З ІНТЕРНЕТ З'ЄДНАННЯМ!!!");
    }
    

    // Оновлення відображення ставки при завантаженні сторінки
    updateBetValue();

    const playButton = document.querySelector('.play-btn');
    const playButtonImg = document.querySelector('.play-btn img');
    const leverButton = document.querySelector('.lever');
    const autoButton = document.querySelector('.button-icon.auto');
    const spinButton = document.querySelector('.button-icon.spin');
    const turboButton = document.querySelector('.button-icon.turbo');
    const volumeButton = document.querySelector('.button-icon.volume');
    const infoButton = document.querySelector('.button-icon.info');
    const closeButton = document.querySelector('.close-btn img');

    paylineElements.forEach(payline => {
        payline.style.display = 'none'; // Приховуємо всі лінії на старті
    });

    playButton.onclick = () => {
        hidePreloader();
    };

    leverButton.onmouseenter = () => {
        leverButton.src = 'assets-for-gold-bonanza-compressed/bent_lever_for_advanced_auto_hover.png';
    };
    leverButton.onmouseleave = () => {
        leverButton.src = 'assets-for-gold-bonanza-compressed/bent_lever_for_advanced_auto.png';
    };

    playButtonImg.onmouseenter = () => {
        playButtonImg.src = 'assets-for-gold-bonanza-compressed/play_button_hover.png';
    };
    playButtonImg.onmouseleave = () => {
        playButtonImg.src = 'assets-for-gold-bonanza-compressed/play_button.png';
    };

    closeButton.onmouseenter = () => {
        closeButton.src = 'assets-for-gold-bonanza-compressed/close_button_hover.png';
    };
    closeButton.onmouseleave = () => {
        closeButton.src = 'assets-for-gold-bonanza-compressed/close_button.png';
    };

    autoButton.onmouseenter = () => {
        autoButton.src = buttonStates.auto ? 'assets-for-gold-bonanza-compressed/auto_button_on_hover.png' : 'assets-for-gold-bonanza-compressed/auto_button_hover.png';
    };
    autoButton.onmouseleave = () => {
        setButtonImage(autoButton);
    };
    autoButton.onclick = () => {
        changeImage(autoButton, 'auto');
        if (buttonStates.auto) {
            autoGame(false);

        } else {
            const spinButton = document.querySelector('.button-icon.spin');
            buttonStates['spin'] = false;
            setButtonImage(spinButton);
            spinButton.style.pointerEvents = 'auto';
        }
    };

    spinButton.onmouseenter = () => {
        spinButton.src = buttonStates.spin ? 'assets-for-gold-bonanza-compressed/spin_button_on_hover.png' : 'assets-for-gold-bonanza-compressed/spin_button_hover.png';
    };
    spinButton.onmouseleave = () => {
        setButtonImage(spinButton);
    };
    spinButton.onclick = () => {
        if (!buttonStates['auto']) {
            changeImage(spinButton, 'spin');
            if (!buttonStates.auto) {
                rollAll();
            }
        }
    };


    turboButton.onmouseenter = () => {
        turboButton.src = `assets-for-gold-bonanza-compressed/turbo_${buttonStates.turbo}_button_hover.png`;
    };
    turboButton.onmouseleave = () => {
        setButtonImage(turboButton);
    };
    turboButton.onclick = () => changeImage(turboButton, 'turbo');

    volumeButton.onmouseenter = () => {
        volumeButton.src = buttonStates.volume ? 'assets-for-gold-bonanza-compressed/volume_button_hover.png' : 'assets-for-gold-bonanza-compressed/volume_button_off_hover.png';
    };
    volumeButton.onmouseleave = () => {
        setButtonImage(volumeButton);
    };
    volumeButton.onclick = () => changeImage(volumeButton, 'volume');

    infoButton.onmouseenter = () => {
        infoButton.src = 'assets-for-gold-bonanza-compressed/info_button_hover.png';
    };
    infoButton.onmouseleave = () => {
        setButtonImage(infoButton);
    };
    infoButton.onclick = () => changeImage(infoButton, 'info');



    // Функція для переходу в повноекранний режим
    function openFullscreen() {
        buttonStates.fullScreenMode = true;

        const elem = document.documentElement; // Вибираємо весь документ для повноекранного режиму
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
    }


    function exitFullscreen() {
        buttonStates.fullScreenMode = false;

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
        }
    }



    const preloaderFullScreenModeBtn = document.querySelector('.preloader-full-screen-mode-btn img');

    preloaderFullScreenModeBtn.onmouseenter = () => {
        preloaderFullScreenModeBtn.src = buttonStates.fullScreenMode ? 'assets-for-gold-bonanza-compressed/exit_full-screen_button_hover.png' : 'assets-for-gold-bonanza-compressed/open_full-screen_button_hover.png';
    };
    preloaderFullScreenModeBtn.onmouseleave = () => {
        preloaderFullScreenModeBtn.src = buttonStates.fullScreenMode ? 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png' : 'assets-for-gold-bonanza-compressed/open_full-screen_button.png';
    };
    preloaderFullScreenModeBtn.onclick = () => {
        if (buttonStates['fullScreenMode']) {
            exitFullscreen();
        } else {
            openFullscreen();
        }

        setButtonImage(preloaderFullScreenModeBtn);
    };



    const landscapeModeFullScreenModeBtn = document.querySelector('.landscape-mode-full-screen-mode-btn img');

    landscapeModeFullScreenModeBtn.onmouseenter = () => {
        landscapeModeFullScreenModeBtn.src = buttonStates.fullScreenMode ? 'assets-for-gold-bonanza-compressed/exit_full-screen_button_hover.png' : 'assets-for-gold-bonanza-compressed/open_full-screen_button_hover.png';
    };
    landscapeModeFullScreenModeBtn.onmouseleave = () => {
        landscapeModeFullScreenModeBtn.src = buttonStates.fullScreenMode ? 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png' : 'assets-for-gold-bonanza-compressed/open_full-screen_button.png';
    };
    landscapeModeFullScreenModeBtn.onclick = () => {
        if (buttonStates['fullScreenMode']) {
            exitFullscreen();
        } else {
            openFullscreen();
        }

        setButtonImage(landscapeModeFullScreenModeBtn);
    };



    const FullScreenModeBtn = document.querySelector('.full-screen-mode-btn img');

    FullScreenModeBtn.onmouseenter = () => {
        FullScreenModeBtn.src = buttonStates.fullScreenMode ? 'assets-for-gold-bonanza-compressed/exit_full-screen_button_hover.png' : 'assets-for-gold-bonanza-compressed/open_full-screen_button_hover.png';
    };
    FullScreenModeBtn.onmouseleave = () => {
        FullScreenModeBtn.src = buttonStates.fullScreenMode ? 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png' : 'assets-for-gold-bonanza-compressed/open_full-screen_button.png';
    };
    FullScreenModeBtn.onclick = () => {
        if (buttonStates['fullScreenMode']) {
            exitFullscreen();
        } else {
            openFullscreen();
        }

        setButtonImage(FullScreenModeBtn);
    };



    window.onresize = function(){
        if(window.innerHeight == screen.height && buttonStates.fullScreenMode === false){
            fullScreenModeActivated = true;
            buttonStates.fullScreenMode = true;
            FullScreenModeBtn.src = 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png';
            landscapeModeFullScreenModeBtn.src = 'assets-for-gold-bonanza-compressed/exit_full-screen_button.png';
            FullScreenModeBtn.style.opacity = 0.5;
            landscapeModeFullScreenModeBtn.style.opacity = 0.5;
            FullScreenModeBtn.style.pointerEvents = 'none';
            landscapeModeFullScreenModeBtn.style.pointerEvents = 'none';
            FullScreenModeBtn.style.cursor = 'default';
            landscapeModeFullScreenModeBtn.style.cursor = 'default';
            FullScreenModeBtn.classList.remove('play-sound');
            landscapeModeFullScreenModeBtn.classList.remove('play-sound');
            
        } else if (fullScreenModeActivated) {
            fullScreenModeActivated = false;
            buttonStates.fullScreenMode = false;
            FullScreenModeBtn.src = 'assets-for-gold-bonanza-compressed/open_full-screen_button.png';
            landscapeModeFullScreenModeBtn.src = 'assets-for-gold-bonanza-compressed/open_full-screen_button.png';
            FullScreenModeBtn.style.opacity = 1;
            landscapeModeFullScreenModeBtn.style.opacity = 1;
            FullScreenModeBtn.style.pointerEvents = 'auto';
            landscapeModeFullScreenModeBtn.style.pointerEvents = 'auto';
            FullScreenModeBtn.style.cursor = 'pointer';
            landscapeModeFullScreenModeBtn.style.cursor = 'pointer';
            FullScreenModeBtn.classList.add('play-sound');
            landscapeModeFullScreenModeBtn.classList.add('play-sound');
        }
    }
    


    const banner = document.getElementById('loss_limit_reached_banner');
    const bannerButton = document.getElementById('close-banner-button');

    bannerButton.addEventListener('click', () => {
        const overlay = document.getElementById('overlay');
        overlay.classList.add('hidden');
        banner.style.display = 'none';
    });



    let selectedNumberOfRoundsButton = null;

    // Функція для кнопок "number-of-rounds"
    const numberOfRoundsButtons = document.querySelectorAll('.number-of-rounds .setting-button');

    numberOfRoundsButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (selectedNumberOfRoundsButton && selectedNumberOfRoundsButton !== button) {
                // Повертаємо попередню кнопку до початкового стану
                console.log(selectedNumberOfRoundsButton.getAttribute('data-original-src'));
                selectedNumberOfRoundsButton.src = selectedNumberOfRoundsButton.getAttribute('data-original-src');
            }

            if (selectedNumberOfRoundsButton !== button) {
                // Зберігаємо поточну кнопку як вибрану
                selectedNumberOfRoundsButton = button;
                // Змінюємо зображення на вибране
                button.src = button.getAttribute('data-selected-src');
            }

            const autoInfoElement = document.querySelector('.auto-info');
            let numberOfRounds = /^[0-9]+$/.test(button.id.split('-')[0]) ? parseInt(button.id.split('-')[0], 10) : button.id.split('-')[0];

            if (numberOfRounds === 'endless') {
                autoInfoElement.style.fontSize = '6.51vw';
                autoInfoElement.textContent = '∞';
                autoSettings['numberOfRounds'] = 0;
            } else {
                autoInfoElement.style.fontSize = '2.86vw';
                autoInfoElement.textContent = numberOfRounds;
                autoSettings['numberOfRounds'] = numberOfRounds;
            }
        });

        // Зберігаємо початкове зображення в атрибуті
        button.setAttribute('data-original-src', button.src);
    });

    // Функція для кнопки "switch-button"
    const switchButton = document.getElementById('switch-button');
    let isSwitchButtonSelected = false;

    switchButton.addEventListener('click', () => {
        if (isSwitchButtonSelected) {
            // Якщо кнопка вже вибрана, повертаємо початкове зображення
            switchButton.src = switchButton.getAttribute('data-original-src');
            autoSettings['stopAfterBigPayout'] = false;
        } else {
            // Якщо кнопка не вибрана, змінюємо на вибране зображення
            switchButton.src = switchButton.getAttribute('data-selected-src');
            autoSettings['stopAfterBigPayout'] = true;
        }
        isSwitchButtonSelected = !isSwitchButtonSelected;
    });

    // Зберігаємо початкове зображення для кнопки "switch-button"
    switchButton.setAttribute('data-original-src', switchButton.src);

    

    const individualContainer = document.querySelector('.individual-settings-container');
    const individualButton = document.getElementById('individual-settings-lose-limit-button');
    const inputField = document.getElementById('individual-input');
    let selectedLoseLimitButton = null; // Змінна для зберігання вибраної кнопки
    let previousInputValue = ''; // Змінна для зберігання значення поля вводу

    // Зберігаємо початкове зображення в атрибуті, щоб легко повертати його
    individualButton.setAttribute('data-original-src', individualButton.src);

    // При натисканні на контейнер показуємо поле введення, міняємо зображення і вибираємо кнопку
    individualContainer.addEventListener('click', function () {
        if (inputField.classList.contains('hidden')) {
            inputField.classList.remove('hidden'); // Робимо поле видимим
            inputField.focus(); // Автоматично фокусуємо на поле
            inputField.value = previousInputValue.replace('X від ставки', ''); // Відновлюємо попереднє значення без додаткового тексту

            // Змінюємо зображення кнопки на вибране
            const selectedSrc = individualButton.getAttribute('data-selected-src');
            individualButton.src = selectedSrc;
        }

        if (selectedLoseLimitButton && selectedLoseLimitButton !== individualButton) {
            // Повертаємо попередню кнопку до початкового стану
            selectedLoseLimitButton.src = selectedLoseLimitButton.getAttribute('data-original-src');
        }

        if (selectedLoseLimitButton !== individualButton) {
            // Зберігаємо поточну кнопку як вибрану
            selectedLoseLimitButton = individualButton;
            // Змінюємо зображення на вибране
            individualButton.src = individualButton.getAttribute('data-selected-src');
        }
        // Оновлюємо значення ліміту програшу на основі введеного користувачем значення
        autoSettings['loseLimit'] = parseFloat(inputField.value) || 5;
    });

    // Запобігаємо виконанню події при натисканні на кнопку
    individualButton.addEventListener('click', function (event) {
        event.stopPropagation(); // Зупиняє подію, щоб не передавалася на контейнер
    });

    // При фокусі на поле введення очищаємо його від додаткового тексту, якщо він є
    inputField.addEventListener('focus', function () {
        if (this.value.includes('X від ставки')) {
            this.value = this.value.replace('X від ставки', ''); // Видаляємо додатковий текст
        }
        inputField.classList.remove('inactive'); // Прибираємо клас неактивного поля
    });

    // При втраті фокуса зберігаємо значення і додаємо текст "X від ставки"
    inputField.addEventListener('blur', function () {
        let inputValue = parseFloat(this.value);
        
        // Якщо значення менше 5, встановлюємо 5 як мінімальне значення
        if (!isNaN(inputValue) && inputValue < 5) {
            inputValue = 5;
        }

        if (this.value.trim() === '') {
            previousInputValue = ''; // Скидаємо значення змінної, якщо нічого не введено
        } else {
            previousInputValue = inputValue.toString(); // Зберігаємо введене значення
            this.value = `${previousInputValue}X від ставки`; // Додаємо текст "X від ставки"
        }
        inputField.classList.add('inactive'); // Додаємо клас неактивного поля, але залишаємо видимим
        // Оновлюємо значення ліміту програшу на основі введеного користувачем значення
        autoSettings['loseLimit'] = inputValue || 5;
    });

    // Забороняємо введення всього, крім чисел і крапки, та обмежуємо правила
    inputField.addEventListener('input', function () {
        // Видаляємо всі символи, крім чисел і крапки
        this.value = this.value.replace(/[^0-9.]/g, '');

        // Забороняємо початковий 0 або крапку
        if (this.value.startsWith('0') || this.value.startsWith('.')) {
            this.value = this.value.substring(1);
        }

        // Обмежуємо кількість символів до 4
        if (this.value.length > 4) {
            this.value = this.value.substring(0, 4);
        }

        // Дозволяємо лише одну крапку у введенні
        const parts = this.value.split('.');
        if (parts.length > 2) {
            this.value = parts[0] + '.' + parts[1];
        }
    });

    // Ініціалізація для всіх кнопок "lose-limit"
    const loseLimitButtons = document.querySelectorAll('.lose-limit .setting-button');

    loseLimitButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (selectedLoseLimitButton && selectedLoseLimitButton !== button) {
                // Повертаємо попередню кнопку до початкового стану
                selectedLoseLimitButton.src = selectedLoseLimitButton.getAttribute('data-original-src');
            }

            if (selectedLoseLimitButton !== button) {
                // Зберігаємо поточну кнопку як вибрану
                selectedLoseLimitButton = button;
                // Змінюємо зображення на вибране
                button.src = button.getAttribute('data-selected-src');
            }

            // Якщо попередня кнопка була кнопкою індивідуальних налаштувань, приховуємо поле вводу
            if (selectedLoseLimitButton !== individualButton) {
                inputField.classList.add('hidden'); // Приховуємо поле вводу
                previousInputValue = inputField.value.replace('X від ставки', ''); // Зберігаємо поточне значення без додаткового тексту
                individualButton.src = individualButton.getAttribute('data-original-src'); // Повертаємо початкове зображення кнопки
            }

            // Оновлюємо значення ліміту програшу на основі вибраної кнопки
            switch (button.id) {
                case '5X-button':
                    autoSettings['loseLimit'] = 5;
                    break;
                case '20X-button':
                    autoSettings['loseLimit'] = 20;
                    break;
                case '50X-button':
                    autoSettings['loseLimit'] = 50;
                    break;
                case 'endless-lose-limit-button':
                    autoSettings['loseLimit'] = 0;
                    break;
            }
        });

        // Зберігаємо початкове зображення в атрибуті
        button.setAttribute('data-original-src', button.src);
    });

};



// Відкриття/закриття таблиці виплат
document.querySelector('.info-button').addEventListener('click', () => {
    const paytable = document.querySelector('.paytable_and_paylines');
    paytable.classList.toggle('hidden'); // Відкриває або закриває таблицю

    setDivSizeToImage();
});

document.querySelector('.close-btn').addEventListener('click', () => {
    const paytable = document.querySelector('.paytable_and_paylines');
    paytable.classList.add('hidden'); // Закриває таблицю
});


// Функція для відтворення звуку
function playSound() {
    const buttonSound = document.getElementById('button-sound');
    buttonSound.currentTime = 0; // Скидаємо до початку, щоб звук грав з початку при кожному натисканні
    buttonSound.play();
}

// Додаємо обробник події для всіх елементів з класом play-sound
const buttons = document.querySelectorAll('.play-sound');

buttons.forEach(button => {
  button.addEventListener('click', playSound); // Відтворюємо звук при натисканні
});



// Отримуємо елементи
const paytableImg = document.querySelector('.paytable-img');
const closeBtnContainer = document.querySelector('.close-btn-container');

// Функція для встановлення розміру div за розмірами зображення
function setDivSizeToImage() {
    // Отримуємо ширину і висоту зображення
    const imgWidth = paytableImg.clientWidth;
    const imgHeight = paytableImg.clientHeight;

    // Встановлюємо отримані розміри для div
    closeBtnContainer.style.width = `${imgWidth}px`;
    closeBtnContainer.style.height = `${imgHeight}px`;
}

// Викликаємо функцію для початкового встановлення розмірів
setDivSizeToImage();

// Якщо потрібно оновлювати розміри при зміні вікна (адаптивність)
window.addEventListener('resize', setDivSizeToImage);