(function(Module, global){
  // Если есть система зависимостей AMD, добавляем модуль туда
  if(typeof define === "function" && define.amd)
	define("pageDraw", [], () => Module());

  // Если же это RequireJS, не будем идти против воли Творца :)
  else if(typeof module !== 'undefined' && module.exports)
    module.exports = Module();

  // Если систем сборки нет, значит экспортируем в глобальный объект
  else
    global['pageDraw'] = Module();
}(function(){
  return pageDraw;
}, this));

class pageDraw {
	constructor(options = {}) {
		this.id = new Date();

		if (options.data) {
			this.data = options.data;
			this.cache = options.cache || 1;
		}
		// позиция, куда все это вставляется
		this.position = options.position || null;
		// Конфигурация родительского элемента, в котором будет контент
		this.__element = (options.element || 'div');
		this.__className = options.class;

		// логирование действий скрипта
		this.__indication = options.indication || null;

		// контент, который можно указать при инициализации.
		this.__cont = options.content || null;


		// функция запускается после отрисовки и в ней должен быть код, как показать контент.
		// анимация появления
		this.show = options.show || null;
		this.hide = options.hide || null;

		// функция после анимации появления
		this.__callback = options.callback || null;

		// элемент, в который загрузится контент.
		this.block = document.createElement(this.__element);

		if (this.__className) {
			this.block.className = this.__className;
		}
		if (options.id) {
			this.block.id = options.id;
		}
		// массив детей, для установки зависимостей
		this.childrenArray = [];
		this.__changedCache = false;
		this.childrenHideModules = [];
	}

	set data(url) {
		let a = this.ajaxCacheControl(url);
		if (this.__cache != a) {
			this.__cache = a;
			this.url = url;
			this.__changedCache = true;
		}

		// a.then((result)=>{
		//
		// 	if ( result && this.__cache != a) {
		// 		this.__cache = a;
		// 		this.url = url;
		// 		this.__changedCache = true;
		// 	}
		// });

	}

	get data() {
		if (this.url) {
			return this.__cache;
		} else {
			let error =  new Error('Запрошены данные, которых нет.');

			console.error(this.id,'В this.url нет данных о ссылке, по которой должны были загрузиться данные.',error.stack);

			throw error;
		}
	}

	set content(code) {
		if (window.development || this.__indication){
			console.log(this.id,'Изменен контент, можно перерисовать.');

			if (typeof code === 'function') {
				console.log(this.id,'Контент - функция');
			} else {
				console.log(this.id,'Контент - строка');
			}

		}

		this.__cont = code;
		this.__drawed = false;
	}

	get content() {
		return this.__cont;
	}
	set structure(object) {
		function __parse(element,children) {
			element.removeChildren;

			element.changedChildrens = true;

			for (var i = 0; i < children.length; i++) {
				let child = children[i];
				if (child.element) {
					__parse(child.element,child.subjects);
					element.child = child.element;
					child.element.father = element;
				} else {
					element.child = child;
					child.father = element;
				}

			}

		}

		if (this.activeStructure) {
			// this.activeStructure.element.delete;

			if (this.activeStructure == object) return;

			let activeElements = [];
			let newElements = [];

			__parseForDelete(this.activeStructure,activeElements);
			__parseForDelete(object,newElements);

			// activeElements.forEach(function(activeItem){
			// 	newElements.forEach(function(newItem,newItemIndex){
			// 		if (activeItem != newItem && newItemIndex == newItemsCount) {
			// 			activeItem.delete;
			// 		}
			// 	});
			// });
			for (var i = activeElements.length - 1; i >= 0; i--) {
				activeElements[i].removeChildren;
				for (var q = newElements.length - 1; q >= 0; q--) {

					if (activeElements[i] == newElements[q]) break;

					if (q == 0) {
						activeElements[i].delete;
					}
				}
			}


		}
		this.activeStructure = object;
		__parse(object.element,object.subjects);

		// asdsd.structure({
		// 	element: nav,
		// 	children: [
		// 		page1,
		// 		{
		// 			element:page2,
		// 			children: [
		// 				navButton,
		// 				closeButton
		// 			]
		// 		}
		// 	]
		// });

		function __parseForDelete(object,array){
			array.push(object.element);
			object.subjects.forEach(function(item,index){
				if (item.subjects) {
					__parseForDelete(item,array);
				} else {
					array.push(item);
				}

			});
		}
	}

	set child(object) {

		if (this.isChildren(object)) return null;

		this.childrenArray.push(object);
		object.father = this;
	}

	get children() {
		return this.childrenArray;
	}


	isChildren(object) {

		for (var i = 0; i < this.childrenArray.length; i++) {
			let child = this.childrenArray[i];
			if (child ==  object)
				return true;
		}

		return false;
	}

	set removeChild(object) {
		for (var i = 0; i < this.childrenArray.length; i++) {
			let child = this.childrenArray[i];
			if (child === object) {

				child = null;

				return true;
			}
		}
		return null;
	}

	get removeChildren() {
		this.childrenArray = [];
		if (window.development || this.__indication) {
			console.log(this.id,'Дети(зависимости) удалены');
		}
		return this.childrenArray;
	}


	set position(code) {
		if (!code) return;
		if (window.development || this.__indication){
			console.log(this.id,'Изменена/добавлена позиция, нужно отрисовать');
		}
		this.__drawed = false;
		// this.changePosition = true; ** 1

		if (code instanceof Array) {
			this.__pos = code;
		} else {
			this.__pos = code.split(' ');
		}
		// 'afterend .header' || ['afterend',document.querySelector('.header')]
		if (typeof code == 'string' ) {
			var arr = code.split(' ');
			this.__pos = [{
				place: arr[0],
				element: arr[1],
				father: arr[2]
			}];
			return;
		}

		if (code instanceof Array) {
			this.__pos = code;
		} else {
			if (window.development || this.__indication){
				if (!(code instanceof Object))
				console.error(this.id,`Позиция - это строка, объект({place:'beforeend',element:'.app'[,father: (this.father.class)]}) или массив из объектов`);
			}
			this.__pos = [code];
		}
	}

	get position() {
		// if (this.changePosition && typeof this.__pos[1] == 'string') {  ** 1
		//
		// 	this.__pos[1] = document.querySelector(this.__pos[1]); ** 1
		// 	this.changePosition = false; ** 1
		// } ** 1
		return this.__pos;
	}

	get draw() {
		if (this.__drawStart) {

			if (window.development || this.__indication){
				console.log(this.id,'Уже идет отрисовка, вторая параллельно отклонена.')
			}

			return null;
		}

		if (this.__drawed && this.changedChildrens) {
			if (this.childrenArray.length) {
				for (var i = 0; i < this.childrenArray.length; i++) {
					let child = this.childrenArray[i];
					child.drawed = false;
					child.draw;
				}
			}
		}

		if (this.__drawed && !this.__changedCache) {

			if (window.development || this.__indication){
				console.log(this.id,'Не отрисовано, изменений не замечено.')
			}
			return null;
		}
		// drawStart -> Пошла отрисовка
		this.__drawStart = true;

		return this.__drawLogic().then(()=>{

			if (this.childrenArray.length) {
				for (var i = 0; i < this.childrenArray.length; i++) {
					let child = this.childrenArray[i];
					child.draw;
				}
			}

			if (this.__callback) this.__callback();

		})
		.catch((e)=>{
			if (window.development || this.__indication){
				console.log(this.id,'По какой-то причине, отрисовка завершена.');
			}
		});




	}

	__drawLogic() {

		if (window.development || this.__indication){
			if (!this.__cont) {
				this.__drawStart = false;
				throw new Error('Нету контента для отрисовки.');
			}
		}

		if (typeof this.__cont == 'function') {

			if (window.development || this.__indication){
				console.log(this.id,'Зашло в отрисовку функции');
			}

			if (this.url) {

				return this.__cache
				.then((result) => {
					if (window.development || this.__indication){
						if (!result) {
							console.warn(this.id,'Промис не отдал результат или ответ сервера пустой.');
							result = '';
						}
					}
					if (window.development || this.__indication){
						if (!this.__cont(result)) {
							console.warn(this.id,'Функция контента ничего не возвращает');
						}
					}

					if (this.hide && this.__inBlock) {
						return this.hide()
							.then(()=>{
								this.block.innerHTML = this.__cont(result);
								this.__changedCache = false;
								this.__drawed = true;

								insertCont.call(this);
							});
					} else {
						this.block.innerHTML = this.__cont(result);
						this.__inBlock = true;
						this.__changedCache = false;
						this.__drawed = true;

						insertCont.call(this);
					}

				})
				.catch((err)=>{
					if (window.development || this.__indication){
						console.warn(this.id,'Ошибка в промисе отрисовки функции, возможно, 404');
					}

					this.__drawed = false;
					this.__drawStart = false;
					throw err;
				});
			}
		} else if (typeof this.__cont == 'string') {

			if (window.development || this.__indication){
				console.log(this.id,'Зашло в отрисовку строки');
			}

			if (this.__changedCache && this.__drawed){

				if (window.development || this.__indication){
					console.log(this.id,"Остановлено, смена кэша не изменит строку.");
				}

				this.__drawStart = false;
				this.__drawed = true;

				return Promise.reject();
			}

			if (window.development || this.__indication){
				if (!this.__cont) {
					console.warn(this.id,'Строка контента пуста');
				}
			}
			if (this.hide && this.__inBlock) {
				return this.hide()
					.then(()=>{
						this.block.innerHTML = this.__cont;
						this.__inBlock = true;
						insertCont.call(this);
					});
			} else {
				this.block.innerHTML = this.__cont;
				insertCont.call(this);
				return Promise.resolve();
			}
		} else {
			this.__drawStart = false;
			let error = new Error('Конетент не функция и не строка, а массив и объект не допустимы.');
			console.error(this.id,error);
			throw error;
		}


		function insertCont() {
      let array = this.position;
      for (var index = 0; index < array.length; index++) {
        var {place, element, father} = array[index];

        if (father && father != this.father.__className) continue;

        var searchElement = document.querySelector(element);
        if (searchElement) {
          searchElement.insertAdjacentElement(place ,this.block);
          break;
        }

      }

			this.__drawed = true;

			if (this.childrenArray.length) {
				for (var i = 0; i < this.childrenArray.length; i++) {
					let child = this.childrenArray[i];
					child.drawed = false;
				}
			}

			if (window.development || this.__indication){
				console.log(this.id,'Отрисовано',this.block);
			}

			if (this.show) {
				setTimeout(()=>{
					this.show()
				});
				if (window.development || this.__indication){
					console.log(this.id,'Анимировано',this.block);
				}
			}
			//drawStart -> конец отрисовки
			this.__drawStart = false;

		};
	}

	get delete() {
		if (this.childrenArray.length) {

			for (var i = this.childrenArray.length - 1; i >= 0; i--) {
				this.children[i].delete;
			}

		}

		if (this.hide) {
			let a = this.hide().then(()=>{

				if (this.childrenHideModules && this.childrenHideModules.length) {
					Promise.all(this.childrenHideModules).then(value => {

						this.__drawed = false;
						this.block.remove();
						if (window.development || this.__indication) {
							console.log(this.id,'Элемент удален');
						}
					},reason => {
						console.warn('Проблемы выполнения просима анимации',this.id);
					});
				} else {

					this.__drawed = false;
					this.block.remove();

					if (window.development || this.__indication) {
						console.log(this.id,'Элемент удален');
					}
				}

				this.childrenHideModules = [];
				// end then
			});


			window.hideModules.push(a);
			if (this.father) {
				this.father.childrenHideModules.push(a);

				if (this.childrenHideModules && this.childrenHideModules.length) {
					this.father.childrenHideModules.push(Promise.all(this.childrenHideModules));
				}

			}
		} else {
			this.__drawed = false;
			this.block.remove();

			if (window.development || this.__indication) {
				console.log(this.id,'Элемент удален');
			}
		}
		this.__inBlock = false;

	}





	loadData(url, options) {
		options = options || {};

		let xhr = new XMLHttpRequest();
		let method = options.method || 'GET';

		xhr.open(method,url, true);

		let promise = new Promise((resolve, reject) => {
			xhr.onload = () => {
				if (xhr.status !== 200) {
					reject();
					this.loading = false;
					return;
				}

				this.loading = false;

				if (window.development || this.__indication){
					console.log(this.id,this[url], url,'скачано');
				}

				try {
					resolve( JSON.parse(xhr.responseText) );
    		} catch (e) {
					resolve( xhr.responseText );
    		}
			};

			xhr.onerror = () => {
				this.loading = false;
				reject();
			};

			//всегда без кэша, его делает приложение,
			xhr.setRequestHeader('Cache-Control', 'no-cache');

			method == 'POST' ? xhr.send(options.body): xhr.send();
	  });

		return promise
				.catch(() => {
					this.loading = false;

					let error = new Error(xhr.status + ': ' + xhr.statusText);

					console.error(this.id,'Ajax error', error, url);
					delete this[url];
					throw new Error('Ajax error' + url);
					//throw error;
				});
	}

	ajaxCacheControl(url,early) {
		//защита от двойного клика
		// early == true дает подгрузить данные независимо от загрузки основных данных.
		if (this.loading && !early) return;
		//
		if (!this[url] || !this.cache) {

			try{
				this.loading = true;
				this[url] = this.loadData(url);
			} catch(e) {
				alert(e.message);
				if (window.development || this.__indication){
				}
			}

		} else {
			if (window.development || this.__indication){
				console.log(this.id,'Взято из кэша',url);
			}
		}
		return this[url];
	}
}
