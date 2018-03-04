var ToDoList = (function () {
	var myStorage = window.localStorage;
	var todos = (myStorage.getItem('todos'))? JSON.parse(myStorage.getItem('todos')) : ['todo #1', 'todo #2'];

	function _createToDoList(el) {
		var tpl = '<li class="list-group-item border-none added"><label><input type="checkbox" onclick="ToDoList.addToDone(this)" name="item[]" value="'+el+'">'+el+'</label></li>';
  		document.getElementById('todolist').insertAdjacentHTML('beforeend', tpl)
  		var txt  = (todos.length == 1)? ' item left' : ' items left';
  		document.getElementById('itemsLeft').innerHTML = todos.length + txt;
	}
	
	function _createDoneList(el) {
		var tpl = '<li class="list-group-item removed"><del>'+el+'</del> <span onclick="ToDoList.remove(this)" class="btn btn-default btn-sm glyphicon glyphicon-remove"></span></li>';
  		document.getElementById('donelist').insertAdjacentHTML('beforeend', tpl)
	}
	
	function _removeFromToDo(el) {
		var pos = todos.indexOf(el);
		if(pos > -1){	
			todos.splice(pos, 1);
			if(todos.length == 0)
				myStorage.removeItem('todos');
			else
				myStorage.setItem('todos', JSON.stringify(todos));
		}
		var txt  = (todos.length == 1)? ' item left' : ' items left';
  		document.getElementById('itemsLeft').innerHTML = todos.length + txt;
	}
	
	function init() {
		for (key in todos) {
			_createToDoList(todos[key]);
  		}
  		myStorage.setItem('todos', JSON.stringify(todos));
  		var txt  = (todos.length == 1)? ' item left' : ' items left';
  		document.getElementById('itemsLeft').innerHTML = todos.length + txt;
	}
	
	function addToDo(el) {
	    if(el && el.length > 0){
			todos.push(el);
	    	myStorage.setItem('todos', JSON.stringify(todos));
			_createToDoList(el);
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
		for(key in todos){
			_createDoneList(todos[key]);
		}
		var added = document.getElementsByClassName("added");
		do {
		   added[0].remove();
		} while (added.length > 0);
		
		todos.length = 0;
		myStorage.removeItem('todos');
  		document.getElementById('itemsLeft').innerHTML = '0 items left';
	}
	
	function remove(el) {
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
