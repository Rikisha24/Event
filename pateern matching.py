import re 
String="Hi world"
pattern="Hi"
result= re.search(pattern,String)
if(result):
    print("Elemnt found")
    print("start index",result.start())
    print("end index",result.end())
    print("start and end index",result.span())
else:
    print("elemnt not found")