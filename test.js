import { isObject } from "core-js/core/object"
import { resolve } from "core-js/fn/promise"

 Function.mycall = function(context){
     if(typeof this !== 'function'){
         throw new TypeError('not a function')
     }

     context = context || window
     context.fn = this
     let args = Array.from(arguments).slice(1)

     let result = context.fn(...args)
     delete context.fn
     return result
 }

 Function.myapply = function(context){
    if(typeof this !== 'function'){
        throw new TypeError('not a function')
    }
    context = context || window
    context.fn = this
    let result
    if(arguments[1]){
        result = context.fn(...arguments[1])
    }else{
        result = context.fn()
    }
    delete context.fn
    return result
 }

 Function.mybind = function(context){
    if(typeof this !== 'function'){
        throw new TypeError('not a function')
    }
    
    const _this = this
    let args = Array.prototype.slice.call(arguments, 1)

    return function F(){
        if(this instanceof F){
            return new _this(...args, ...arguments)
        }else{
            return _this.apply(context, args.concat(...arguments))
        }
    }
 }

 function myNew(fn, ...args){
     obj = {}
     obj.__proto__ = fn.prototype
     let result = fn.apply(obj, args)
     return result instanceof Object ? result : obj
 }

function deepCopy(o, hash = new Map()){
    if(!isObject(o)) return o
    if(hash.has(o)) return hash.get(o)
    let obj = Array.isArray(o) ? [] : {}

    hash.set(o, obj)
    for(let i in o){
        if(isObject(o[i])){
            obj[i] = deepCopy(o[i], hash)
        }else{
            obj[i] = o[i]
        }
    }
    return obj
}

Promise.all = function(promises){
    let list = []
    let count = 0
    function handel(i, data){
        list[i] = data
        count++
        if(count == promises.length){
            resolve(list)
        }
    }
    return Promise((resolve, reject) => {
        for(let i = 0; i < promises.length; i++){
            promises[i].then(res => {
                handel(i, res)
            }, err => reject(err))
        }
    })
}
Promise.race = function(promises){
    return Promise((resolve, reject) => {
        for(let i = 0; i < promises.length; i++){
            promises[i].then(res => {
                resolve(res)
            }, err => {
                reject(err)
            })
        }
    })
}

var ajax = {
    'get' : function(url, callback){
        let xhr = XMLHttpRequest();
        xhr.open('get', url, false)
        xhr.onreadystatechange = function (){
            if(xhr.readyState == 4){
                if(xhr.status === 200 || xhr.status === 304){
                    callback(xhr.responseText)
                }
            }
        }
        xhr.send()
    },
    'post' : function(url, data, callback){
        let xhr = new XMLHttpRequest()
        xhr.open('post', url, true)
        xhr.setRequestHeader('Content-type','x-www-form-urlencoded')
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200 || xhr.status == 304){
                    callback(xhr.responseText)
                }
            }
        }
        xhr.setRequestHeader('Content-Type', 'application/x-www-urlencoded')
        xhr.send(data)
    }
}

function debounce(fn, delay){
    let timeout
    return function(){
        let args = arguments
        if(timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
            fn(args)
        },delay)
    }
}

function throttle(fn, delay){
    let previous = 0
    return function(){
        let now = Date.now()
        let _this = this
        let args = arguments
        if(now - previous > delay){
            fn.apply(_this, args)
            previous = now
        }
    }
}