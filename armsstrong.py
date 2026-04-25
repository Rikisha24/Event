num=int(input("Enter a number"))
length=len(str(num))
sum=0
temp=int(num)
while temp>0:
    digit=temp%10
    sum=sum+digit**length
    temp=int(num)//10
print("The number is",num,"sum is",sum)
if(sum==num):
    print("Armsstrong number")
else:
    print("Not an armsstrong number")