import sys; 
def reverse(a):
  txt = a[::-1]
  return txt
if __name__ == "__main__":
 a = str(sys.argv[1])
 result = str(sys.argv[2])
 print(reverse(a) == result)