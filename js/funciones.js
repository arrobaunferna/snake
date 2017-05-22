+function() {
	const lienzo = document.querySelector("#cnvLienzo");
	
	if(lienzo.getContext) {
		const context = lienzo.getContext("2d");
		lienzo.style.background = "#61993B";

		class Random {
			static get(inicio, final) {
				return Math.floor(
					Math.random() * final + inicio
				);
			}
		}

		class World {
			constructor(w_ancho, w_alto) {
				this.w_width = w_ancho;
				this.w_height = w_alto;
			}

			getWorldWidth() {
				return this.w_width;
			}

			getWorldHeight() {
				return this.w_height;
			}

			setScreen(screen) {
				context.fillStyle = "#000";
				context.textAlign = "center";
				context.font = "2em pricedown";
				context.fillText(screen, this.w_width / 2, this.w_height / 2);
			}
		}

		class Food {
			constructor(x, y) {
				this.x = x;
				this.y = y;
				this.width = 10;
				this.height = 10;
				this.world;
				this.color;

			}

			setColor(color) {
				this.color = color;
			}

			static generate(world) {
				this.world = world;
				return new Food( Random.get( 0, this.world.getWorldWidth() ), Random.get( 0, this.world.getWorldHeight() ) );
			}

			draw() {
				context.fillStyle = this.color;
				context.fillRect(this.x, this.y, this.width, this.height);
			}
		}

		class Square {
			constructor(x, y, s_dimension, world) {
				this.x = x;
				this.y = y;
				this.width = s_dimension;
				this.height = s_dimension;
				this.back = null; // cuadro de atras
				this.world = world;
				this.direction;
				this.color;
			}

			setColor(color) {
				this.color = color;
			}

			draw() {
				context.fillStyle = this.color;
				context.fillRect(this.x, this.y, this.width, this.height);
				if( this.hasBack() ) {
					this.back.draw(); 
				}
			}

			add() {
				if( this.hasBack() ) return this.back.add();
				this.back = new Square(this.x, this.y, 10, this.world);
				this.back.setColor( this.color );
			}

			hasBack() {
				return this.back !== null;
			}


			copy() {
				if( this.hasBack() ) {
					this.back.copy();
					this.back.x = this.x;
					this.back.y = this.y;

					this.crossBorder();
				}
			}

			strike(head, segundo = false) {
				if(this === head && !this.hasBack()) {
					return false;
				
				} else if(this === head) {
					return this.back.strike(head, true);
				}

				if(segundo && !this.hasBack()) {
					return false;
				
				} else if(segundo) {
					return this.back.strike(head);
				}

				// no es la cabeza ni el segundo
				if( this.hasBack() ) {
					return squareStrike(this, head) || this.back.strike(head);
				}

				// No es la cabeza, ni el segundo y soy el ultimo
				return squareStrike(this, head);
			}

			crossBorder() {
				// traspasar
				if( this.direction == "right" && this.x > (this.world.getWorldWidth() - this.width) ) {
					this.x = this.width - (this.width * 2);
				
				} else if( this.direction == "left" &&  this.x < 0 ) {
					this.x = this.world.getWorldWidth() + this.width;
				
				} else if( this.direction == "down" && this.y > (this.world.getWorldHeight() - this.height) ) {
					this.y = this.height - (this.height * 2);
				
				} else if( this.direction == "up" &&  this.y < 0 ) {
					this.y = this.world.getWorldHeight() + this.height;
				
				}
			}

			// 38
			up() {
				this.copy();
				this.y -= 10;
				this.direction = "up";
			}

			// 40
			down() {
				this.copy();
				this.y += 10;
				this.direction = "down";
			}

			// 37
			left() {
				this.copy();
				this.x -= 10;
				this.direction = "left";
			}

			// 39
			right() {
				this.copy();
				this.x += 10;
				this.direction = "right";
			}
		}

		class Snake {
			constructor(world) {
				this.world = world
				this.head = new Square(100, 0, 10, world);
				this.draw();
				this.direction = "right";
				this.head.add();
			}

			setColor(color) {
				this.head.setColor( color );
			}

			draw() {
				this.head.draw();
			}

			eat() {
				this.head.add();
			}

			dead() {
				return this.head.strike(this.head); // || this.head.strikeBorder();
			}

			// 38
			up() {
				if( this.direction == "down" ) return;
				this.direction = "up";
			}

			// 40
			down() {
				if( this.direction == "up" ) return;
				this.direction = "down";
			}

			// 37
			left() {
				if( this.direction == "right" ) return;
				this.direction = "left";
			}

			// 39
			right() {
				if( this.direction == "left" ) return;
				this.direction = "right";
			}

			move() {
				switch(this.direction) {
					case "left":
						return this.head.left();
					break;

					case "up":
						return this.head.up();
					break;

					case "right":
						return this.head.right();
					break;

					case "down":
						return this.head.down();
					break;
				}
			}
		}

		const world = new World(500, 300);
		const snake = new Snake(world);
		let foods = [];
		var pause = false;

		var colores = {
			pj: "#000",
			food: "#F00"
		};

		var cboLevelGame = document.querySelector("#cboLevelGame");
		var level_game = cboLevelGame.value;

		// Colores personaje
		var spinColorRojo = document.querySelector("#spinColorRojo");
		var spinColorVerde = document.querySelector("#spinColorVerde");
		var spinColorAzul = document.querySelector("#spinColorAzul");

		// Colores comida
		var spnColorFoodRed = document.querySelector("#spnColorFoodRed");
		var spnColorFoodGreen = document.querySelector("#spnColorFoodGreen");
		var spnColorFoodBlue = document.querySelector("#spnColorFoodBlue");

		window.addEventListener("keydown", function(e) {
			var tecla = e.keyCode || e.which;
			if(tecla > 36 && tecla < 41 || tecla == 80) {
				e.preventDefault();
			}

			switch(tecla) {
				case 37:
					return snake.left();
				break;

				case 38:
					return snake.up();
				break;

				case 39:
					return snake.right();
				break;

				case 40:
					return snake.down();
				break;

				case 80:
					world.setScreen("Pause");
					pause = !pause;
				break;
			}
		}, false);

		function gameRun() {
			if(!pause) {
				snake.move();
				context.clearRect(0, 0, lienzo.width, lienzo.height );
				snake.setColor(colores.pj);
				snake.draw();

				drawFood();

				if(snake.dead()) {
					world.setScreen("Perdiste!!!");
					window.clearInterval(animacion);
				}
			}
		}

		var animacion = setInterval(gameRun, 1000 / level_game  );

		setInterval(function() {
			if(!pause) {
				const food = Food.generate(world);
				food.setColor(colores.food);
				foods.push(food);

				setTimeout(function() {
					removeFromFoods(food);
				}, 10000);
			}
		}, 2000);

		function drawFood() {
			for(const idx in foods) {
				const food = foods[idx];

				if(food) {
					food.draw();
					if( strike(food, snake.head) ) {
						snake.eat();
						removeFromFoods(food);
					}
				}
			}
		}

		function removeFromFoods(food) {
			foods = foods.filter(function(f) {
				return food !== f;
			});
		}

		function squareStrike(cuadro1, cuadro2) {
			return cuadro1.x == cuadro2.x && cuadro1.y == cuadro2.y;
		}

		function strike(a, b) {
			var strike = false;

			// Colision horizontal
			if( b.x + b.width >= a.x && b.x < a.x + a.width ) {

				// Colision vertical
				if( b.y + b.height >= a.y && b.y < a.y + a.height ) {
					strike = true;
				}
			}

			// Colision de a con b
			if( b.x <= a.x && b.x + b.width >= a.x + a.width ) {
				if( b.y <= a.y && b.y + b.height >= a.y + a.height ) {
					strike = true;
				}
			}

			if( a.x <= b.x && a.x + a.width >= b.x + b.width ) {
				if( a.y <= b.y && a.y + a.height >= b.y + b.height ) {
					strike = true;
				}
			}

			return strike;
		}

		function changeColor() {
			// Personaje
			var Rojo_pj = spinColorRojo.value;
			var Verde_pj = spinColorVerde.value;
			var Azul_pj = spinColorAzul.value;

			colores.pj = "rgb("+ Rojo_pj +", "+ Verde_pj +", "+ Azul_pj +")";
			
			// Comida
			var Rojo_food =  spnColorFoodRed.value;
			var Verde_food =  spnColorFoodGreen.value;
			var Azul_food =  spnColorFoodBlue.value;

			colores.food = "rgb("+ Rojo_food +", "+ Verde_food +", "+ Azul_food +")";
		}

		spinColorRojo.addEventListener("change", changeColor, false);
		spinColorVerde.addEventListener("change", changeColor, false);
		spinColorAzul.addEventListener("change", changeColor, false);

		spnColorFoodRed.addEventListener("change", changeColor, false);
		spnColorFoodGreen.addEventListener("change", changeColor, false);
		spnColorFoodBlue.addEventListener("change", changeColor, false);

		cboLevelGame.addEventListener("change", function(e) {
			window.clearInterval(animacion);
			level_game = parseInt(this.value);

			this.blur();
			animacion = setInterval(gameRun, 1000  / level_game);
		}, false);
	}
}();