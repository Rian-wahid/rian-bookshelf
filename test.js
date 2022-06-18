const http = require("http")
const assert = require("assert")

const server={
  hostname:"0.0.0.0",
  port:3000
}
class Que{
  constructor(arg,fn){
    this.arg=arg
    this.fn=fn
    this.running=false
    this.finish=false
  }
  
  execute(){
    this.running=true
    this.fn(...this.arg)
  }
  
}
let queue=[]
function start(){
  for(let que of queue){
    if(!que.finish){
      que.execute()
      break;
    }
  }
}
function finish(){
  queue= queue.map(que=>{
    if(que.running){
      que.running=false
      que.finish=true
    }
    return que
  })
  start()
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
        finish()
        console.info("\n")
      })
    })
    if (body != null) {
      req.write(JSON.stringify(body))
    }
    req.end()
 
  
}
 function test(...arg){
   queue.push(new Que(arg,request))
 }


 
    test("test get semua data ketika kosong",{path:"/books",method:"GET"},(res)=>{
      try{
      let body = JSON.parse(res.body)
      assert.equal(res.statusCode,200)
      assert.deepEqual(body,{
        status:"success",
        data:{
          books:[]
        }
      })
      console.dir(body)
      }catch(e){
        console.log(e)
      }
    })
  
  test("test insert data valid",{
    path:"/books",
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    }
  },(res)=>{
    try{
      let body = JSON.parse(res.body)
      assert.equal(res.statusCode,201)
      assert.equal(typeof body.data.bookId,"string")
      console.dir(body)
    }catch(e){
      console.log(e)
    }
  },{
    name:"test",
    author:"rian",
    year:2022,
    publisher:"unknow",
    summary:"nothing",
    pageCount:10,
    readPage:1,
    reading:false,
  })
  
  test("test get semua data ketika ada data",{
    method:"GET",
    path:"/books"
  },(res)=>{
    try{
      let body = JSON.parse(res.body)
      assert.equal(res.statusCode,200)
      assert.equal(body.status,"success")
      assert.equal(typeof body.data.books[0],"object")
      assert.equal(typeof body.data.books[0].id,"string")
      assert.equal(typeof body.data.books[0].name,"string")
      assert.equal(typeof body.data.books[0].publisher,"string")
      assert.equal(body.data.books[0].name,"test")
      assert.equal(body.data.books[0].publisher,"unknow")
      console.dir(body)
      test("test update data valid dan id ada",{
        method:"PUT",
        path:"/books/"+body.data.books[0].id,
        headers:{
          "Content-Type":"application/json"
        }
      },(rest)=>{
        try{
        let b = JSON.parse(rest.body)
        console.dir(b)
        assert.equal(b.status,"success")
        assert.equal(b.message,"Buku berhasil diperbarui")
        assert.equal(rest.statusCode,200)
      
        }catch(e){
          console.log(e)
        }
      },{
        name:"belajar",
        author:"rianwahid",
        publisher:"unknow",
        summary:"test",
        pageCount:10,
        reading:true,
        readPage:5,
        year:2022,
      })
      
      test("test update data tidak valid dan id ada", {
        method: "PUT",
        path: "/books/" + body.data.books[0].id,
        headers: {
          "Content-Type": "application/json"
        }
      }, (rest) => {
        try {
          let b = JSON.parse(rest.body)
          console.dir(b)
          assert.equal(b.status, "fail")
        
          assert.equal(rest.statusCode, 400)
      
        } catch (e) {
          console.log(e)
        }
      }, {
        
        author: "rianwahid",
        publisher: "unknow",
        summary: "test",
        pageCount: 10,
        reading: true,
        readPage: 5,
        year: 2022,
      })
      
        test("test get dengan query",{path:"/books?reading=1",method:"GET"},(res)=>{
      try{
      let b = JSON.parse(res.body)
      assert.equal(res.statusCode,200)
      assert.deepEqual(b,{
        status:"success",
        data:{
          books:[
            {
              id:body.data.books[0].id,
              name:"belajar",
              publisher:"unknow"
            }
            ]
        }
      })
      console.dir(b)
      }catch(e){
        console.log(e)
      }
    })
  
    test("test get dengan query 2", { path: "/books?reading=0", method: "GET" }, (res) => {
      try {
        let body = JSON.parse(res.body)
        assert.equal(res.statusCode, 200)
        assert.deepEqual(body, {
          status: "success",
          data: {
            books: []
          }
        })
        console.dir(body)
      } catch (e) {
        console.log(e)
      }
    })
      
      test("test delete data ketika id ada",{
        method:"DELETE",
        path:"/books/"+body.data.books[0].id,
      },(rest)=>{
        try{
        let b= JSON.parse(rest.body)
        console.log(b)
        assert.equal(b.status,"success")
        assert.equal(rest.statusCode,200)
        }catch(e){
          console.info(e)
        }
      })
      
    }catch(e){
      console.log(e)
    }
  })

test("test insert data tidak valid name tidak ada", {
  path: "/books",
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
}, (res) => {
  try {
    let body = JSON.parse(res.body)
    assert.equal(res.statusCode, 400)
    assert.equal(body.status, "fail")
    console.dir(body)
  } catch (e) {
    console.log(e)
  }
}, {

  author: "rian",
  year: 2022,
  publisher: "unknow",
  summary: "nothing",
  pageCount: 10,
  readPage: 1,
  reading: false,
})

test("test insert data tidak valid pageCount < readPage", {
  path: "/books",
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
}, (res) => {
  try {
    let body = JSON.parse(res.body)
    assert.equal(res.statusCode, 400)
    assert.equal(body.status, "fail")
    console.dir(body)
  } catch (e) {
    console.log(e)
  }
}, {

  author: "rian",
  year: 2022,
  publisher: "unknow",
  summary: "nothing",
  pageCount: 10,
  readPage: 12,
  reading: false,
})


  test("test delete data ketika id tidak ditemukan",{
        method:"DELETE",
        path:"/books/tidakada",
      },(rest)=>{
        try{
        let b= JSON.parse(rest.body)
        console.log(b)
        assert.equal(b.status,"fail")
        assert.equal(rest.statusCode,404)
        }catch(e){
          console.info(e)
        }
      })
      
    
  
  
start()
