def calculate_sum_and_average(numbers):
    total_sum = 0
    for num in numbers:
        total_sum += num

    # 間違い1: リストが空の場合にゼロ除算エラーが発生
    average = total_sum / len(numbers)

    # 間違い2: 戻り値として平均値を返すべきだが、Noneが返されている
    return total_sum, None

# 間違い3: numbersに整数ではない文字列が含まれている
numbers = [1, 2, 3, 4, '5']

# 間違い4: 関数の戻り値を正しく受け取っていない
result = calculate_sum_and_average(numbers)
print(f"Sum: {result}, Average: {result[1]}")