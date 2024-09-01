def calculate_area(radius):
    pi = "3.14"  # πが文字列として定義されている
    return pi * radius * radius  # 文字列の掛け算でバグが発生する

def reverse_string(s):
    result = ""
    for i in range(len(s)):  # 文字列を逆順にする非効率な方法
        result = s[i] + result
    return result

print(calculate_area(5))  # エラーが発生する
print(reverse_string("hello"))  # 正しく動くが非効率