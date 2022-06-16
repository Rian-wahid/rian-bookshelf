const fs = require('fs')
const filePath = __dirname+"/books.json"
const APIFormat = require("./api-format.js")
const crypto = require('crypto')
const Book = require("./book.js")
const api = new APIFormat()
class Books{
  #books;
  constructor(){
    let json = fs.readFileSync(filePath).toString()
   this.#books = JSON.parse(json)
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
      console.log(e)
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
      return api.success("Buku berhasil diperbarui",null).toJSON()
    }catch(e){
      console.log(e)
      setStatusCode(500)
      return api.error("Gagal memperbarui buku").toJSON()
    }
    
  }
  
  
  
  getAll(search){
    let books = this.#books.filter(search).map(book=>{
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
    
    if(typeof book.name!="string"
    ||typeof book.author!="string"
    ||typeof book.year!="number"
    ||typeof book.publisher!="string"
    ||typeof book.summary!="string"
    ||typeof book.readPage!="number"
    ||typeof book.pageCount!="number"
    ||typeof book.reading!="boolean"){
      return " "
    }
    return false
  }
  
  
  save(){
    fs.writeFileSync(filePath,JSON.stringify(this.#books))
  }
  
  
  createId() {
    /*
    fungsi ini berfungsi untuk
    membuat id dengan panjang 24 byte
    kenapa tidak menggunakan nanoid?
    alasannya karena saya ingin mengurangi ketergantungan
    library external.
    
    jika server menangani lebih dari
    1000 permintaan per detik maka keunikan
    id yang di hasilkan adalah 1:256**8 
    (1 banding 256 pangkat 8)
    */
    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth()
    let d = date.getDay()
    let h = date.getHours()
    let mn = date.getMinutes()
    let s = date.getSeconds()
    let ms = date.getMilliseconds()
    let buf = crypto.randomBytes(18)
    buf.writeUInt16BE(y, 0, 2)
    buf[2] = m
    buf[3] = d
    buf[4] = h
    buf[5] = mn
    buf[6] = s
    buf.writeUInt16BE(ms, 7, 2)
    return buf.toString("base64")
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

module.exports=Books
