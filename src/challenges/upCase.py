import sys;

def upCase(a):
  return a.upper();

if __name__ == "__main__":
  a = list(sys.argv[1])
  result = int(sys.argv[2])
  print(upCase(a) == result)

# Working


