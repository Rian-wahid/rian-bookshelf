class APIFormat{
  #status;
  #message;
  #data;
  constructor(){
    this.#status=""
    this.#message=""
    this.#data=null
  }
  success(message,data){
    this.#status="success"
    this.#message=message
    this.#data=data
    return this
  }
  fail(message){
    this.#status="fail"
    this.#message=message
    this.#data=null
    return this
  }
  error(message){
    this.#status="error"
    this.#message=message
    this.#data=null
    return this
  }
  toJSON(){
    let obj={
      status: this.#status,
    }
    if(this.#message!==null){
      obj.message=this.#message
    }
    if(this.#data!==null){
      obj.data=this.#data
    }
    return JSON.stringify(obj)
  }
}

module.exports = APIFormat
