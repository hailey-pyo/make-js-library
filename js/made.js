function _filter(list, predicate) {
    var new_list = [];
    // for(var i=0; i<list.length; i++){
    //     if(predicate(list[i])) {
    //         new_list.push(list[i]);
    //     }
    // }
    _each(list, function(val){
        if(predicate(val)) new_list.push(val);
    })
    return new_list;
}

function _map(list, mapper) {
    var new_list = [];
    _each(list, function(val){
        new_list.push(mapper(val))
    });
    return new_list;
}

//아래에 새롭게 만듦
// function _each(list, iter) {
//     for(var i=0; i<list.length; i++) {
//         iter(list[i])
//     }
//     return list;
// }

// 커링
// function _curry(fn) {
//     return function(a, b){
//         if(arguments.length == 2) return fn(a, b);
//         return function(b){
//             return fn(a, b);
//         }
//     }
// }
// 코드정리
function _curry(fn) {
    return function(a,b) {
        return arguments.length == 2 ? fn(a, b) : function(b){ return fn(a, b); };
    }
}

function _curryr(fn){
    return function(a,b) {
        return arguments.length == 2 ? fn(a,b) : function(b) { return fn(b,a); };
    }
}

var _get = _curryr(function(obj, key) {
    return obj == null ? undefined : obj[key];
});

//reduce만들기
var slice = Array.prototype.slice;
function _rest(list, num){
    return slice.call(list, num || 1);
}

function _reduce(list, iter, memo){
    if(arguments.length == 2){
        memo = list[0];
        list = _rest(list);
    }
    _each(list, function(val) {
        memo = iter(memo, val);
    });
    return memo;
}

//_pipe 만들기
function _pipe() {
    var fns = arguments;
    return function(arg) {
        return _reduce(fns, function(arg, fn){
            return fn(arg);
        }, arg);
    }
}

//_go 만들기
function _go(arg){
    var fns = _rest(arguments);
    return _pipe.apply(null, fns)(arg);
}


//_map, _filter에 curryr적용
var _map = _curryr(_map),
    _filter = _curryr(_filter);



// _keys만들기
// 기존 Object.keys(null) 보완
function _is_object(obj){
    return typeof obj == 'object' && !!obj;
}

function _keys(obj){
    return _is_object(obj) ? Object.keys(obj) : [];
}


// _each의 외부 다형성 높이기 - _each에 null 넣어도 에러안나게
// key-value쌍 넣어도 에러안나게   
function _each(list, iter) {
    var keys = _keys(list);
    for(var i=0, len  = keys.length; i< len; i++) {
        iter(list[keys[i]])
    }
    return list;
}