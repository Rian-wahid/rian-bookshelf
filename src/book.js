class Book{
  constructor({
    name,year,
    author,summary,publisher,
    pageCount,readPage,reading
  },{id,finished,insertedAt,updatedAt}){
    this.id=id
    this.name=name
    this.year=year
    this.author=author
    this.summary=summary
    this.publisher=publisher
    this.pageCount=pageCount
    this.readPage=readPage
    this.reading=reading
    this.finished=finished
    this.insertedAt=insertedAt
    this.updatedAt=updatedAt
  }
}
module.exports=Book
