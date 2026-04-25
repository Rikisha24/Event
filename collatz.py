n=int(input())
def collatz(n):
    if(n%2==0):
        print(n//2)
        return n//2
        
    elif(n%2==1):
            
        result=3*n+1
        print(result)
        return result
            
    
while n!=1:
     n=collatz(n)
    