module.exports = [{
    question: "Write a code that prints Hello, world!", funcName: "helloWorld()", tests: `if __name__ == "__main__":
    result = helloWorld()
    print(result == "Hello, world!")`,
}, {
    question: "Write a function to calculate the sum of two numbers.", funcName: "add(num1, num2)", tests: `if __name__ == "__main__":
    result = add(5, 7)
    print(result == 12)`,
}, {
    question: "Implement a function that returns the factorial of a number.", funcName: "factorial(num)", tests: `if __name__ == "__main__":
    result = factorial(5)
    print(result == 120)`
}, {
    question: "Write a function to determine if a number is odd or even.", funcName: "isEven(num)", tests: `if __name__ == "__main__":
    result1 = isEven(4)
    result2 = isEven(7)
    print(result1 == True)
    print(result2 == False)`
}, {
    question: "Implement a function that checks if a word is a palindrome.", funcName: "isPalindrome(string)", tests: `if __name__ == "__main__":
    result1 = isPalindrome("racecar")
    result2 = isPalindrome("hello")
    print(result1 == True)
    print(result2 == False)`
}, {
    question: "Write a function to find the sum of elements in a list.", funcName: "listSum(arr)", tests: `if __name__ == "__main__":
    result1 = listSum([1, 2, 3, 4, 5])
    result2 = listSum([10, 20, 30])
    print(result1 == 15)
    print(result2 == 60)`
}, {
    question: "Create a function to find the largest number in a list.", funcName: "findLargest(arr)", tests: `if __name__ == "__main__":
    result1 = findLargest([3, 7, 1, 9, 5])
    result2 = findLargest([25, 10, 60, 42])
    print(result1 == 9)
    print(result2 == 60)`
}, {
    question: "Write a simple calculator program that can add, subtract, multiply, and divide.",
    funcName: "calculator(x, operator, y)",
    tests: `if __name__ == "__main__":
    result1 = calculator(10, "+", 5)
    result2 = calculator(20, "*", 4)
    print(result1 == 15)
    print(result2 == 80)`
}, {
    question: "Implement a function that reverses a given string.", funcName: "reverseString(string)", tests: `if __name__ == "__main__":
    result1 = reverseString("hello")
    result2 = reverseString("world")
    print(result1 == "olleh")
    print(result2 == "dlrow")`
}, {
    question: "Write a function that checks if a year is a leap year.", funcName: "isLeapYear(year)", tests: `if __name__ == "__main__":
    result1 = isLeapYear(2020)
    result2 = isLeapYear(2021)
    print(result1 == True)
    print(result2 == False)`
}, {
    question: "Create a function that determines if a number is prime.", funcName: "isPrime(num)", tests: `if __name__ == "__main__":
    result1 = isPrime(17)
    result2 = isPrime(20)
    print(result1 == True)
    print(result2 == False)`
}, {
    question: "Write a function that generates the first n numbers in the Fibonacci sequence.",
    funcName: "fibonacci(num)",
    tests: `if __name__ == "__main__":
    result1 = fibonacci(5)
    result2 = fibonacci(10)
    print(result1 == [0, 1, 1, 2, 3])
    print(result2 == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34])`
}, {
    question: "Implement a function to sort a list of numbers in ascending order.", funcName: "sortList(arr)", tests: `if __name__ == "__main__":
    result1 = sortList([5, 2, 8, 1, 9])
    result2 = sortList([10, 3, 7, 2])
    print(result1 == [1, 2, 5, 8, 9])
    print(result2 == [2, 3, 7, 10])`
}, {
    question: "Write a function to count the occurrences of a character in a string.",
    funcName: "countChar(string, char)",
    tests: `if __name__ == "__main__":
    result1 = countChar("banana", "a")
    result2 = countChar("hello world", "o")
    print(result1 == 3)
    print(result2 == 2)`
}, {
    question: "Create a function that checks if a number is a perfect square.",
    funcName: "isPerfectSquare(num)",
    tests: `if __name__ == "__main__":
    result1 = isPerfectSquare(9)
    result2 = isPerfectSquare(15)
    print(result1 == True)
    print(result2 == False)`
}];