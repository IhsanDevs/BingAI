
Hello and welcome to this tutorial on how to write a simple "Hello world" program in Python. Python is a popular and powerful programming language that can be used for a variety of applications, such as web development, data analysis, machine learning, and more. In this tutorial, we will learn how to install Python, how to use the print function, and how to run a Python script.

## Installing Python
To write and execute Python code, you need to have Python installed on your computer. There are different ways to install Python depending on your operating system and preferences. One of the easiest ways is to download and install the Anaconda distribution, which comes with Python and many useful packages and tools for data science. You can download Anaconda from https://www.anaconda.com/products/individual.

Alternatively, you can download and install Python directly from https://www.python.org/downloads/. Make sure you choose the latest version of Python 3, which is currently 3.10.0 at the time of writing this tutorial. Follow the instructions on the website to install Python on your computer.

To check if Python is installed correctly, open a terminal (on Windows, you can use the Command Prompt or PowerShell) and type the following command:

python --version

You should see something like this:

Python 3.10.0

If you see an error message or a different version of Python, you may need to adjust your system path or environment variables to point to the correct location of Python.

## Using the print function
One of the most basic functions in Python is the print function, which allows you to display a message on the screen. The print function takes one or more arguments, which are the values or expressions that you want to print. The arguments are enclosed in parentheses and separated by commas. For example:

print("Hello world")

This will print the string "Hello world" on the screen. A string is a sequence of characters enclosed in quotation marks. You can use either single or double quotation marks in Python, as long as they match at the beginning and end of the string.

You can also print multiple values or expressions by separating them with commas. For example:

print("Hello", "world")

This will print the same output as before, but with a space between the two words. The print function automatically adds a space between each argument when printing them.

You can also print other types of values or expressions, such as numbers, variables, or mathematical operations. For example:

print(42)

This will print the number 42 on the screen.

print(2 + 3)

This will print the result of adding 2 and 3, which is 5.

x = 10
print(x)

This will print the value of the variable x, which is 10. A variable is a name that refers to a value stored in memory. You can assign a value to a variable using the equal sign (=).

## Running a Python script
So far, we have been typing Python commands directly in the terminal, which is also known as interactive mode. This is useful for testing and experimenting with Python code, but if you want to write a longer program, it is better to use a text editor or an integrated development environment (IDE) to create a Python script.

A Python script is a file that contains Python code that can be executed by the Python interpreter. A Python script usually has a .py extension, such as hello.py.

To create a Python script, open your preferred text editor or IDE and type the following code:

# This is a comment
print("Hello world")

The first line is a comment, which is a piece of text that is ignored by the Python interpreter. Comments are useful for explaining or documenting your code. You can start a comment with a hash sign (#).

The second line is the same print function that we used before.

Save your file as hello.py in a convenient location on your computer.

To run your Python script, open a terminal and navigate to the directory where you saved your file. Then type the following command:

python hello.py

You should see the output "Hello world" on the screen.

Congratulations! You have written and executed your first Python program.
