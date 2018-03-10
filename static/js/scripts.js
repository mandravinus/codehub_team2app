var userId = "5aa3b6be96489c3014187f7a";
var token = "8kjvVOSYbGfNhEOrUj3ge63RQNobRCVhpAjf7gOJEQBvjy1bhXpSNmBzlrDtLMe2";

var httpreq = axios.create({
	baseURL : 'http://todo.socialapps.eu/api',
	headers: {
		common: {
			'Authorization': token
		}
	}
})

var ToDoList = (function () {
	var myStorage = window.localStorage;
	var todosList = [];
	var doneList = [];

	function _createToDoList(el) {
		var tpl = '<li class="list-group-item border-none added"><label><input type="checkbox" onclick="ToDoList.addToDone(this)" name="item[]" value="'+el.title+'">'+el.title+'</label></li>';
  		document.getElementById('todolist').insertAdjacentHTML('beforeend', tpl)
  		var txt  = (todosList.length == 1)? ' item left' : ' items left';
  		document.getElementById('itemsLeft').innerHTML = todosList.length + txt;
	}
	
	function _createDoneList(el) {
		var title = (el.title)? el.title : el;
		var tpl = '<li class="list-group-item removed"><del>'+title+'</del> <span onclick="ToDoList.remove(this)" data-title="'+title+'" class="btn btn-default btn-sm glyphicon glyphicon-remove"></span></li>';
  		document.getElementById('donelist').insertAdjacentHTML('beforeend', tpl)
	}
	
	function _removeFromToDo(el) {
		var pos = _findItemPosition(todosList, "title", el);
		httpreq.patch('todos/'+todosList[pos].id,{
			status: false
		})
		doneList.push(todosList[pos]);
		todosList.splice(pos, 1);
		var txt  = (todosList.length == 1)? ' item left' : ' items left';
  		document.getElementById('itemsLeft').innerHTML = todosList.length + txt;
	}

	function _findItemPosition (items, attribute, value) {
	 	for (var i = 0; i < items.length; i++) {
	    	if (items[i][attribute] === value) {
	      		return i;
	    	}
	  	}
	  	return null;
	}
	
	function init() {
		httpreq.get('/users/'+userId+'/todos?filter=%7B%22where%22%3A%7B%22status%22%3Atrue%7D%7D')
		  .then(function (response) {
		    todosList = response.data;
		    
		    for (key in todosList) {
				_createToDoList(todosList[key]);
	  		}
	  		
	  		var txt  = (todosList.length == 1)? ' item left' : ' items left';
	  		document.getElementById('itemsLeft').innerHTML = todosList.length + txt;
		  })
		  .catch(function (error) {
		    console.log(error);
		  });


		httpreq.get('/users/'+userId+'/todos?filter=%7B%22where%22%3A%7B%22status%22%3Afalse%7D%7D')
		  .then(function (response) {
		    doneList = response.data;

		    for (key in doneList) {
				_createDoneList(doneList[key]);
	  		}

		  })
		  .catch(function (error) {
		    console.log(error);
		  });

	}
	
	function addToDo(el) {
	    if(el && el.length > 0){
	    	httpreq.post('/users/'+userId+'/todos', {
			    userId: userId,
			    title: el,
			    status: true
			  })
			  .then(function (response) {
			  	todosList.push(response.data);
			    _createToDoList(response.data);
			  })
			  .catch(function (error) {
			    console.log(error);
			  });
		}
	}
	
	function addToDone(el) {
		if(el.checked){
			_removeFromToDo(el.value);
			_createDoneList(el.value);
			el.parentElement.parentElement.remove();
		}
	}
	
	function allRead(el) {
		var added = document.getElementsByClassName("added");
		do {
			_createDoneList(todosList[0].title);
			_removeFromToDo(todosList[0].title);
		   added[0].remove();
		} while (added.length > 0);
		
		todosList.length = 0;
		myStorage.removeItem('todos');
  		document.getElementById('itemsLeft').innerHTML = '0 items left';
	}
	
	function remove(el) {
		var pos = _findItemPosition(doneList, "title", el.dataset.title);
		httpreq.delete('todos/'+doneList[pos].id,{
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

(function() {
	ToDoList.init();
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
