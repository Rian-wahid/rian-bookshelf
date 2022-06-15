const fs = require('fs')
const filePath = __dirname+"/books.json"
const APIFormat = require("./api-format.js")
const Book = require("./book.js")
const api = new APIFormat()
class Books{
  #books;
  constructor(){
    let json = fs.readFileSync(filePath).toString()
   this.#books = JSON.parse(json)
  }
  
  findByName(name){
    let books = this.#books.filter(book => {
      return book.name.toLowerCase().includes(name.toLowerCase())
    }).map(book => {
    
      return {
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }
    })
    return api.success(null, { books }).toJSON()
  }
  findByFinished(finished){
    let books = this.#books.filter(book => {
      return book.finished== finished
    }).map(book => {
    
      return {
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }
    })
    return api.success(null, { books }).toJSON()
  }
  findByReading(reading){
    let books = this.#books.filter(book=>{
    return book.reading ==reading
    }).map(book => {
      
      return {
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }
    })
    return api.success(null, { books }).toJSON()
  }
  
  
  
  findById(bookId,setStatusCode){
    try{
      let book=this.#books.find(book=>book.id===bookId)
      if(!book){
        setStatusCode(404)
        return api.fail("Buku tidak ditemukan").toJSON()
      }
      setStatusCode(200)
      return api.success(null,{book}).toJSON()
    }catch(e){
      setStatusCode(500)
      return api.error("Buku tidak ditemukan").toJSON()
    }
  }
  
  
  
  insert(book,setStatusCode){
    try{
    let is_not_valid=this.isNotValid(book)
    if(is_not_valid){
      setStatusCode(400)
      return api.fail("Gagal menambahkan buku. "+is_not_valid).toJSON()
    }
    let id = this.createId()
    let insertedAt = new Date().toISOString()
    let updatedAt = insertedAt
    let finished = (book.readPage===book.pageCount)
    this.#books.push(new Book(book,{id,insertedAt,updatedAt,finished}))
    this.save()
    setStatusCode(201)
    return api.success("Buku berhasil ditambahkan",{bookId:id}).toJSON()
    }catch(e){
      
      setStatusCode(500)
      return api.error("Buku gagal ditambahkan").toJSON()
    }
  }
  
  delete(bookId,setStatusCode){
    if(!this.#books.find(book=>book.id===bookId)){
      setStatusCode(404)
      return api.fail("Buku gagal dihapus. Id tidak ditemukan").toJSON()
    }
    this.#books = this.#books.filter(book=>book.id!==bookId)
    setStatusCode(200)
      this.save()
    return api.success("Buku berhasil dihapus",null).toJSON()
  
  }
  
  
  update(bookId,book,setStatusCode){
    try{
      let is_not_valid = this.isNotValid(book)
      if (is_not_valid) {
        setStatusCode(400)
        return api.fail("Gagal memperbarui buku. " + is_not_valid).toJSON()
      }
      if(!this.#books.find(bk=>bk.id===bookId)){
        setStatusCode(404)
        return api.fail("Gagal memperbarui buku. Id tidak ditemukan").toJSON()
      }
      this.#books = this.#books.map(bk=>{
        if(bk.id===bookId){
          return new Book(book,{
            id:bk.id,
            finished:(book.readPage===book.pageCount),
            insertedAt:bk.insertedAt,
            updatedAt:new Date().toISOString()
          })
        }
        
        return bk
      })
      
      this.save()
      
      setStatusCode(200)
      return api.success("Buku berhasil diperbarui",null)
    }catch(e){
      setStatusCode(500)
      return api.error("Gagal memperbarui buku").toJSON()
    }
    
  }
  
  
  
  getAll(){
    let books = this.#books.map(book=>{
      return {
        id:book.id,
        name:book.name,
        publisher:book.publisher,
      }
    })
    return api.success(null,{books}).toJSON()
  }
  
  
  
  isNotValid(book){
    if(typeof book.name == "undefined"){
      return "Mohon isi nama buku"
    }
    if(book.readPage>book.pageCount){
      return "readPage tidak boleh lebih besar dari pageCount"
    }
    if(typeof book.author=="undefined"){
      return "Mohon isi author buku"
    }
    if (typeof book.publisher == "undefined") {
      return "Mohon isi publisher buku"
    }
    if (typeof book.year == "undefined") {
      return "Mohon isi tahun buku"
    }
    if(typeof book.name!="string"
    ||typeof book.author!="string"
    ||typeof book.year!="number"
    ||typeof book.publisher!="string"
    ||typeof book.summary!="string"
    ||typeof book.readPage!="number"
    ||typeof book.pageCount!="number"
    ||typeof book.reading!="boolean"){
      return `\nMohon mengirim data dengan format sebagai berikut\n{
        "name": string,
        "year": number,
        "author": string,
        "summary": string,
        "publisher": string,
        "pageCount": number,
        "readPage": number,
        "reading": boolean
}`
    }
    return false
  }
  
  
  save(){
    fs.writeFileSync(filePath,JSON.stringify(this.#books))
  }
  
  
  createId(it=null){
    
    let lastIterateId=it;
    if(it==null){
    if(!fs.existsSync(__dirname+"/lastIterateId")){
      let buf= Buffer.from("000000")
      buf.writeIntBE(1,0,6)
      fs.writeFileSync(__dirname+"/lastIterateId",buf)
      
    }else{
      let buf = fs.readFileSync(__dirname+"/lastIterateId")
      lastIterateId= buf.readIntBE(0,6)
      lastIterateId++;
    }
    }
    let buf = Buffer.from([0,0,0,0,0,0,0,0,0,0])
    buf.writeIntBE(lastIterateId||1,2,6)
    let leftFill0=0
    let rightFill0=0
    for(let i=2; i<8; i++){
      if(buf[i]!=0){
        break;
      }
      buf[i]=Math.floor(Math.random()*256)
      leftFill0++;
    }
    for(let i=9; i>=2; i--){
      if(buf[i]!=0){
        break;
      }
      buf[i]=Math.floor(Math.random()*256)
      rightFill0++;
    }
    buf[0]=leftFill0;
    buf[1]=rightFill0;
    if(!this.#books.find(book=>book.id===bookId)){
    if(lastIterateId){
      let buf= Buffer.from("000000")
      buf.writeIntBE(1,0,6)
      fs.writeFileSync(__dirname+"/lastIterateId",buf)
      
    }
    return buf.toString("hex")
    }
    return this.createId(lastIterateId||1)
  }
}

module.exports=Books
