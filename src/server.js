const Hapi = require("@hapi/hapi")
const Books = require("./books.js")
const books = new Books()
const init = async ()=>{
  const server =  Hapi.server({
    port:3000,
    host:"0.0.0.0"
  })
  server.route({
    method:"GET",
    path:"/books",
    handler:(request,h)=>{
      let name="";
      let finished;
      let reading;
      if(typeof request.query.name =="string"){
        name = request.query.name
      }
      if (request.query.reading == "0"||request.query.reading=="1") {
        reading = (request.query.reading=="1")
      }
      if (request.query.finished == "0" || request.query.finished=="1") {
        finished = (request.query.finished=="1")
      }
      let search=function(){
        return true
      }
      if(name.length>0||reading!=undefined||finished!=undefined){
        if(name.length>0
        &&reading!=undefined
        &&finished!=undefined){
        search = function(book){
          return( book.finished==finished
          &&book.reading==reading
          &&book.name.toLowerCase().includes(name.toLowerCase()))
        }
        }else if(reading != undefined &&
                 finished != undefined){
          search=function(book){
            return (book.finished==finished
            &&book.reading == reading)
          }
       }else if(reading!=undefined){
         search=function(book){
           return book.reading==reading
         }
       }else if(finished!=undefined){
         search = function(book){
           return book.finished==finished
         }
       }else{
         search = function(book){
           return book.name.toLowerCase().includes(name.toLowerCase())
         }
       }
       
      }
      return h.response(books.getAll(search))
      .code(200).header("Content-Type","application/json").header("Access-Control-Allow-Origin","*")
    }
  })
  
  server.route({
    method: "GET",
    path: "/books/{bookId}",
    handler: (request, h) => {
      let httpCode=200;
      return h.response(books.findById(request.params.bookId,(code)=>{
        httpCode=code
      })).code(httpCode).header("Content-Type","application/json").header("Access-Control-Allow-Origin","*")
    }
  })
  
  server.route({
    method: "POST",
    path: "/books",
    handler: (request, h) => {
      let httpCode = 200;
      return h.response(books.insert(request.payload, (code) => {
        httpCode = code
      })).code(httpCode).header("Content-Type","application/json").header("Access-Control-Allow-Origin","*")
    }
  })
  
  server.route({
    method: "PUT",
    path: "/books/{bookId}",
    handler: (request, h) => {
      let httpCode = 200;
      return h.response(books.update(request.params.bookId,request.payload, (code) => {
        httpCode = code
      })).code(httpCode).header("Content-Type","application/json").header("Access-Control-Allow-Origin","*")
    }
  })
  
  
  server.route({
    method: "DELETE",
    path: "/books/{bookId}",
    handler: (request, h) => {
      let httpCode = 200;
      return h.response(books.delete(request.params.bookId, (code) => {
        httpCode = code
      })).code(httpCode).header("Content-Type","application/json").header("Access-Control-Allow-Origin","*")
    }
  })
  
  
  await server.start()
  console.info(`server running at ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
