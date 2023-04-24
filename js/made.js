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

// function _map(list, mapper) {
//     var new_list = [];
//     _each(list, function(val){
//         new_list.push(mapper(val))
//     });
//     return new_list;
// }

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
// function _each(list, iter) {
//     var keys = _keys(list);
//     for(var i=0, len  = keys.length; i< len; i++) {
//         iter(list[keys[i]])
//     }
//     return list;
// }


// 컬렉션중심 프로그래밍! 
//1. 수집하기 - map pluck
//_values, _pluck 만들기

// function _values(data) {
//     return _map(data, function(val){ return val; })
// }
//->_identity사용하여 수정가능
function _values(data) {
    return _map(data, _identity);
}
function _identity(val){
    return val;
}

var _values = _map(_identity);//_map을 커링으로 구현했놨기때문에, 이렇게 표현가능

// function _pluck(data, key) {
//     return _map(data, function(obj){
//         return obj[key];
//     })
// }
//->_get사용하여 수정가능
function _pluck(data, key) {
    return _map(data, _get(key))
}
var _pluck = _curryr(_pluck);


//2. 거르기 - filter
//_reject, _compact 만들기

// function _reject(data, predi) {
//     return _filter(data, function(val){
//         return !predi(val);
//     });
// }
//->_negate사용하여 수정가능
function _reject(data, predi) {
    return _filter(data, _negate(predi));
}

function _negate(func) {
    return function(val){
        return !func(val);
    }
}

var _compact = _filter(_identity);


//3. 찾아내기 - find
//_find_index, _some, _every 만들기
var _find = _curryr(function(list, predi) {
    var keys = _keys(list);
    for(var i=0, len  = keys.length; i< len; i++) {
        var val =list[keys[i]];
        if(predi(val)) return val;
    }
});
var _find_index = _curryr(function(list, predi) {
    var keys = _keys(list);
    for(var i=0, len  = keys.length; i< len; i++) {
        if(predi(list[keys[i]])) return i;
    }
    return -1;
});
function _some(data, predi){
    return _find_index(data, predi || _identity) != -1;
}
function _every(data, predi){
    return _find_index(data, _negate(predi || _identity)) == -1;
}


//4. 접기,축약 - reduce
//min, max, min_by, max_by 만들기
//group_by, push 만들기
//count_by, inc 만들기
function _min(data){
    return _reduce(data, function(a, b){
        return a < b ? a: b;
    });
}
function _max(data){
    return _reduce(data, function(a, b){
        return a > b ? a: b;
    });
}
function _min_by(data, iter){
    return _reduce(data, function(a, b){
        return iter(a) < iter(b) ? a: b;
    });
}
function _max_by(data, iter){
    return _reduce(data, function(a, b){
        return iter(a) > iter(b) ? a: b;
    });
}
var _min_by = _curryr(_min_by),
    _max_by = _curryr(_max_by);

function _group_by(data, iter){
    return _reduce(data, function(grouped, val){
        // var key = iter(val);
        // (grouped[key] = grouped[key] || []).push(val);
        //return grouped;
        return _push(grouped, iter(val), val);
    }, {});
}

function _push(obj, key, val){
    (obj[key] = obj[key] || []).push(val);
    return obj;
}

function _count_by(data, iter){
    return _reduce(data, function(count, val){
        return _inc(count, iter(val));
    }, {});
}
function _inc(count, key){
    count[key] ? count[key]++ : count[key]=1;
    return count;
}

//_each _map 다시수정
//콜백함수 인자에 key 추가해줌
function _each(list, iter) {
    var keys = _keys(list);
    for(var i=0, len  = keys.length; i< len; i++) {
        iter(list[keys[i]], keys[i]);
    }
    return list;
}
function _map(list, mapper) {
    var new_list = [];
    _each(list, function(val, key){
        new_list.push(mapper(val, key));
    });
    return new_list;
}
var _pairs = _map((val, key) => [key, val]);

//응용
//_count_by _reject 커링필요
var _count_by = _curryr(_count_by);
var _reject = _curryr(_reject);