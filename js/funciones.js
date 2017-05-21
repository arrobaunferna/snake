+function() {
	const lienzo = document.querySelector("#cnvLienzo");
	
	if(lienzo.getContext) {
		const context = lienzo.getContext("2d");

		class Random {
			static get(inicio, final) {
				return Math.floor(
					Math.random() * final + inicio
				);
			}
		}

		class Food {
			constructor(x, y) {
				this.x = x;
				this.y = y;
				this.width = 10;
				this.height = 10;
			}

			static generate() {
				return new Food( Random.get(0, 500), Random.get(0, 300) );
			}

			draw() {
				context.fillRect(this.x, this.y, this.width, this.height);
			}
		}

		class Square {
			constructor(x, y) {
				this.x = x;
				this.y = y;
				this.width = 10;
				this.height = 10;
				this.back = null; // cuadro de atras
			}

			draw() {
				context.fillRect(this.x, this.y, this.width, this.height);
				if( this.hasBack() ) {
					this.back.draw(); 
				}
			}

			add() {
				if( this.hasBack() ) return this.back.add();
				this.back = new Square(this.x, this.y);
			}

			hasBack() {
				return this.back !== null;
			}


			copy() {
				if( this.hasBack() ) {
					this.back.copy();
					this.back.x = this.x;
					this.back.y = this.y;
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

			strikeBorder() {
				return this.x > 490 || this.x < 0 || this.y > 290 || this.y < 0;
			}

			// 38
			up() {
				this.copy();
				this.y -= 10;
			}

			// 40
			down() {
				this.copy();
				this.y += 10;
			}

			// 37
			left() {
				this.copy();
				this.x -= 10;
			}

			// 39
			right() {
				this.copy();
				this.x += 10;
			}
		}

		class Snake {
			constructor() {
				this.head = new Square(100, 0);
				this.draw();
				this.direction = "right";
				this.head.add();
			}

			draw() {
				this.head.draw();
			}

			eat() {
				this.head.add();
			}

			dead() {
				return this.head.strike(this.head) || this.head.strikeBorder();
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

		const snake = new Snake();
		let foods = [];
		var pause = false;

		window.addEventListener("keydown", function(e) {
			switch(e.keyCode) {
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
					pause = !pause;
				break;
			}
		}, false);

		const animacion = setInterval(function() {
			if(!pause) {
				snake.move();
				context.clearRect(0, 0, lienzo.width, lienzo.height );
				snake.draw();

				drawFood();

				if(snake.dead()) {
					console.log("Perdiste!!!");
					window.clearInterval(animacion);
				}
			}
		}, 1000 / 30  );

		setInterval(function() {
			if(!pause) {
				const food = Food.generate();
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
	}
}();