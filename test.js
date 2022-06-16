const http = require("http")
const assert = require("assert")

const server={
  hostname:"rian-bookshelf.herokuapp.com",
  port:80
}

const request = (label,option,cb,body=null)=>{
 
  let req= http.request({...server,...option},(res)=>{
      let data =''
      res.on("data",(ch)=>{
        data+=ch
      })
      res.on("end",()=>{
        console.info(label)
        res.body=data
        cb(res)
      })
    })
    if (body != null) {
      req.write(JSON.stringify(body))
    }
    req.end()
 
  
}

async function init(){
 
    request("test get all data ketika kosong",{path:"/books",method:"GET"},(res)=>{
      try{
      assert.equal(res.statusCode,200)
      assert.deepEqual(JSON.parse(res.body),{
        status:"success",
        data:{
          books:[]
        }
      })
      console.log("pass")
      }catch(e){
        console.log(e)
      }
    })
  
}
init()
