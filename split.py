import re
text="John is playing outside.Along with his 6 friends"
result=re.split("\s",text)
print(result)
for y in result:
    print(y)
result1=re.split(",",text)
print(result1)
result2=re.split("\d",text)
print(result2)
t="he is playing"
result3=re.sub('he','she',t)
print(result3)