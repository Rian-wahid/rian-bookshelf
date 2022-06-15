const Hapi = require("@hapi/hapi")
const Books = require("./books.js")
const books = new Books()
const init = async ()=>{
  const server =  Hapi.server({
    port:process.env.PORT||3000,
    host:"0.0.0.0"
  })
  server.route({
    method:"GET",
    path:"/books",
    handler:(request,h)=>{
      if(typeof request.query.name =="string"){
        return h.response(books.findByName(request.query.name)).code(200)
      }
      if (typeof request.query.reading == "number") {
        let reading = Boolean(request.query.reading)
        return h.response(books.findByReading(reading)).code(200)
      }
      if (typeof request.query.finished == "number") {
        let finished = Boolean(request.query.finished)
        return h.response(books.findByFinished(finished)).code(200)
      }
      
      return h.response(books.getAll()).code(200)
    }
  })
  
  server.route({
    method: "GET",
    path: "/books/{bookId}",
    handler: (request, h) => {
      let httpCode=200;
      return h.response(books.findById(request.params.bookId,(code)=>{
        httpCode=code
      })).code(httpCode)
    }
  })
  
  server.route({
    method: "POST",
    path: "/books",
    handler: (request, h) => {
      let httpCode = 200;
      return h.response(books.insert(request.payload, (code) => {
        httpCode = code
      })).code(httpCode)
    }
  })
  
  server.route({
    method: "PUT",
    path: "/books/{bookId}",
    handler: (request, h) => {
      let httpCode = 200;
      return h.response(books.update(request.params.bookId,request.payload, (code) => {
        httpCode = code
      })).code(httpCode)
    }
  })
  
  
  server.route({
    method: "DELETE",
    path: "/books/{bookId}",
    handler: (request, h) => {
      let httpCode = 200;
      return h.response(books.delete(request.params.bookId, (code) => {
        httpCode = code
      })).code(httpCode)
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
