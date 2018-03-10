var myStorage = window.localStorage;

var httpreq = axios.create({
	baseURL : 'http://todo.socialapps.eu/api',
	headers: {
		/*common: {
			'Authorization': token
		}*/
	}
})

var ToDoList = (function () {
	var todosList = [];
	var doneList = [];
	var _userId;

	function _createToDoList(key, el) {
		var tpl = '<li class="list-group-item border-none added"><label><input type="checkbox" onclick="ToDoList.addToDone(this)" name="item[]" value="'+key+'">'+el.title+'</label></li>';
  		document.getElementById('todolist').insertAdjacentHTML('beforeend', tpl)
  		var txt  = (todosList.length == 1)? ' item left' : ' items left';
  		document.getElementById('itemsLeft').innerHTML = todosList.length + txt;
	}
	
	function _createDoneList(key, el) {
		var title = (el.title)? el.title : el;
		var tpl = '<li class="list-group-item removed"><del>'+title+'</del> <span onclick="ToDoList.remove(this)" data-for="'+key+'" class="btn btn-default btn-sm glyphicon glyphicon-remove"></span></li>';
  		document.getElementById('donelist').insertAdjacentHTML('beforeend', tpl)
	}
	
	function _removeFromToDo(pos, el) {
		httpreq.patch('todos/'+el.id,{
			status: false
		})
		doneList.push(el);
		var txt  = (todosList.length == 1)? ' item left' : ' items left';
  		document.getElementById('itemsLeft').innerHTML = todosList.length + txt;
	}
	
	function init(userId) {
		_userId = userId;
		httpreq.get('/users/'+_userId+'/todos?filter=%7B%22where%22%3A%7B%22status%22%3Atrue%7D%7D')
		  .then(function (response) {
		    todosList = response.data;
		    
		    for (key in todosList) {
				_createToDoList(key, todosList[key]);
	  		}
	  		
	  		var txt  = (todosList.length == 1)? ' item left' : ' items left';
	  		document.getElementById('itemsLeft').innerHTML = todosList.length + txt;
		  })
		  .catch(function (error) {
		    console.log(error);
		  });


		httpreq.get('/users/'+_userId+'/todos?filter=%7B%22where%22%3A%7B%22status%22%3Afalse%7D%7D')
		  .then(function (response) {
		    doneList = response.data;

		    for (key in doneList) {
				_createDoneList(key, doneList[key]);
	  		}

		  })
		  .catch(function (error) {
		    console.log(error);
		  });

	}
	
	function addToDo(el) {
	    if(el && el.length > 0){
	    	httpreq.post('/users/'+_userId+'/todos', {
			    userId: _userId,
			    title: el,
			    status: true
			  })
			  .then(function (response) {
			  	todosList.push(response.data);
			    _createToDoList(todosList.length-1, response.data);
			  })
			  .catch(function (error) {
			    console.log(error);
			  });
		}
	}
	
	function addToDone(el) {
		if(el.checked){
			_removeFromToDo(el.value, todosList[el.value]);
			_createDoneList(doneList.length-1, todosList[el.value]);
			el.parentElement.parentElement.remove();
		}
	}
	
	function allRead(el) {
		var added = document.getElementsByClassName("added");

		do {
			_createDoneList(doneList.length, todosList[added[0].firstChild.firstChild.value].title);
			_removeFromToDo(added[0].firstChild.firstChild.value, todosList[added[0].firstChild.firstChild.value]);
		   added[0].remove();
		} while (added.length > 0);
		
		todosList.length = 0;
  		document.getElementById('itemsLeft').innerHTML = '0 items left';
	}
	
	function remove(el) {
		httpreq.delete('todos/'+doneList[el.dataset.for].id,{
			status: false
		})
		var removed = document.getElementsByClassName("removed");
		for(var i = 0; i < removed.length;i++) {
		   if(removed[i].lastChild == el) {
		     removed[i].remove();
		   }
		}
	}
	
	return {
	    addToDo: addToDo,
	    addToDone: addToDone,
	    allRead: allRead,
	    remove: remove,
	    init: init,
	}
})();


var Login = (function () {

	function _toggleViews() {
		document.getElementById('form').classList.add("hidden");
		document.getElementById('lists').classList.remove('hidden')
	}

	function _doLogin(user, pass) {
		httpreq.post('/users/login', {
				email: user,
				password: pass
			})
		  	.then(function (response) {
		  		console.log('~~~~login', response)
		  		if(response.status === 200){
		  			var user = {'userId': response.data.userId, 'token': response.data.id};
		  			myStorage.setItem('user', JSON.stringify(user));
					httpreq.defaults.headers.common['Authorization'] = response.data.id;
			  		ToDoList.init(response.data.userId);
			  		_toggleViews();
		  		}
		  	})
		  	.catch(function (error) {
		    	console.log(error);
		  	});
	}

	function init(){
		if(myStorage.getItem('user')){
			var user = JSON.parse(myStorage.getItem('user'));
			httpreq.defaults.headers.common['Authorization'] = user.token;
			ToDoList.init(user.userId);
			_toggleViews();
		}
	}
	
	function doLogin(el) {
		_doLogin(document.getElementById('email').value, document.getElementById('pass').value);
	}
	
	return {
	    init: init,
	    doLogin: doLogin
	}
})();


(function() {
	Login.init();
})()

document.addEventListener('keypress', function(e) {
    var key = e.which || e.keyCode;
    if (key === 13) { 
      ToDoList.addToDo(document.getElementById("todo").value)
      document.getElementById("todo").value = '';
    }
});

document.getElementById("allRead").addEventListener("click", function() {
    ToDoList.allRead();
});

document.getElementById("login").addEventListener("click", function() {
    Login.doLogin();
});
