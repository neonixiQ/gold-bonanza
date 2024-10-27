import random

# Список символів
symbols = ["seven", "lucky clover", "plum", "bar", "watermelon", "lemon", "cherry", "grape", "dice"]

# Таблиця виплат
paytable = {
    "seven": 50,
    "lucky clover": 20,
    "bar": 9,
    "watermelon": 6,
    "plum": 5,
    "cherry": 4,
    "lemon": 3,
    "grape": 2,
    "dice": 1,
}

# Функція для симуляції обертання стрічки
def spin_reel():
    return random.randint(0, len(symbols) - 1)  # Генеруємо випадкову позицію на стрічці

# Функція для розрахунку виграшу
def calculate_winnings(indexes, bet):
    winnings = 0
    # Перевірка 7 ліній виплат
    if indexes[0] == indexes[1] == indexes[2]:  # Лінія 1
        winnings += bet * paytable[symbols[indexes[0]]]
    elif (indexes[0] + 1) % len(symbols) == indexes[1] and indexes[1] == (indexes[2] - 1) % len(symbols):  # Лінія 2
        winnings += bet * paytable[symbols[(indexes[0] + 1) % len(symbols)]]
    elif (indexes[0] - 1) % len(symbols) == indexes[1] and indexes[1] == (indexes[2] + 1) % len(symbols):  # Лінія 3
        winnings += bet * paytable[symbols[(indexes[0] - 1) % len(symbols)]]
    elif indexes[0] == (indexes[1] - 1) % len(symbols) and (indexes[1] - 1) % len(symbols) == indexes[2]:  # Лінія 4
        winnings += bet * paytable[symbols[indexes[0]]]
    elif indexes[0] == (indexes[1] + 1) % len(symbols) and (indexes[1] + 1) % len(symbols) == indexes[2]:  # Лінія 5
        winnings += bet * paytable[symbols[indexes[0]]]
    elif (indexes[0] - 1) % len(symbols) == (indexes[1] + 1) % len(symbols) and (indexes[1] + 1) % len(symbols) == (indexes[2] - 1) % len(symbols):  # Лінія 6
        winnings += bet * paytable[symbols[(indexes[0] - 1) % len(symbols)]]
    elif (indexes[0] + 1) % len(symbols) == (indexes[1] - 1) % len(symbols) and (indexes[1] - 1) % len(symbols) == (indexes[2] + 1) % len(symbols):  # Лінія 7
        winnings += bet * paytable[symbols[(indexes[0] + 1) % len(symbols)]]
    return winnings

# Функція для симуляції однієї гри
def simulate_game():
    bet = 1  # Фіксована ставка
    indexes = [spin_reel(), spin_reel(), spin_reel()]  # Обертання стрічки на кожному барабані
    winnings = calculate_winnings(indexes, bet)
    return winnings

# Функція для розрахунку RTP
def calculate_rtp(num_simulations):
    total_bet = 0
    total_winnings = 0
    for _ in range(num_simulations):
        total_bet += 1
        total_winnings += simulate_game()
    rtp = (total_winnings / total_bet) * 100
    return rtp

# Запуск симуляції
num_simulations = 100000000
rtp = calculate_rtp(num_simulations)

# Виведення результату
print(f"RTP слота після {num_simulations} симуляцій: {rtp:.2f}%")