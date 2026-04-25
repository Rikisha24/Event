n=int(input())
arr=[]
for num in range(2,n):
    for i in range(2,num):
        if(num%i==0):
            break
    else:
        arr.append(num)
flag=0
for i in range(len(arr)):
    for j in range(i+1,len(arr)):
        if arr[i] + arr[j] == n:
            print(arr[i], "and", arr[j], "added gives", n)
            flag = 1
if flag==0:
    print("null")
        

