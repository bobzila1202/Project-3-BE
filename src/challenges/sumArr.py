import sys;

def sumArr(a):
  Sum = sum(a)
  return Sum;

if __name__ == "__main__":
  a = list(sys.argv[1])
  result = int(sys.argv[2])
  print(sumArr(a) == result)


  # Not Working.