var mr = 0.01;

function changeBG() {
  let val = random(255);
  background(val);
}

function Vehicle(x, y, dna) {
  this.acceleration = createVector(0, 0); // Ускорение
  this.velocity = createVector(0, -2); // Скорость
  this.position = createVector(x, y); // Позция
  this.r = 4; // Размер
  this.maxspeed = 5; // Максимальная скорость
  this.maxforce = 0.5; // Максимальная сила

  this.health = 1; // Здоровье

  this.dna = [];
  if (dna === undefined) {
    // Цена еды
    this.dna[0] = random(-2, 2);
    // Цена вредной еды
    this.dna[1] = random(-2, 2);
    // Видимость еды
    this.dna[2] = random(0, 100);
    // Видимость вредной еды
    this.dna[3] = random(0, 100);
  } else {
    // Собственно, мутация
    this.dna[0] = dna[0];
    if (random(1) < mr) {
      this.dna[0] += random(-0.1, 0.1);
    }
    this.dna[1] = dna[1];
    if (random(1) < mr) {
      this.dna[1] += random(-0.1, 0.1);
    }
    this.dna[2] = dna[2];
    if (random(1) < mr) {
      this.dna[2] += random(-10, 10);
    }
    this.dna[3] = dna[3];
    if (random(1) < mr) {
      this.dna[3] += random(-10, 10);
    }
  }

  // Функция движения
  this.update = function() {
    this.health -= 0.005; // Сколько еды убирается

    // Скорость 
    this.velocity.add(this.acceleration);
    // Ограничение скорости
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Каждый цикл обнуляем ускорение
    this.acceleration.mult(0);
  };


  this.applyForce = function(force) {
    this.acceleration.add(force);
  };

  this.behaviors = function(good, bad) {
    var steerG = this.eat(good, 0.2, this.dna[2]);
    var steerB = this.eat(bad, -1, this.dna[3]);

    steerG.mult(this.dna[0]);
    steerB.mult(this.dna[1]);

    this.applyForce(steerG);
    this.applyForce(steerB);
  };

  this.clone = function() {
    if (random(1) < 0.002) {
      return new Vehicle(this.position.x, this.position.y, this.dna);
    } else {
      return null;
    }
  };

  this.eat = function(list, nutrition, perception) {
    var record = Infinity;
    var closest = null;
    for (var i = list.length - 1; i >= 0; i--) {
      var d = this.position.dist(list[i]);

      if (d < this.maxspeed) {
        list.splice(i, 1);
        this.health += nutrition;
      } else {
        if (d < record && d < perception) {
          record = d;
          closest = list[i];
        }
      }
    }

    if (closest != null) {
      return this.seek(closest);
    }

    return createVector(0, 0);
  };

  // Steering Behaviors For Autonomous Characters background and update by Craig Reynolds
  // Метод, который вычисляет рулевое усилие по направлению к цели
  // Основная идея: Steering = Desired - Velocity
  this.seek = function(target) {
    var desired = p5.Vector.sub(target, this.position); // Вектор, направленный от позиции объекта к цели

    desired.setMag(this.maxspeed);

    // Steering = Desired - velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Ограничение на максимальную силу

    return steer;
  };

  this.dead = function() {
    return this.health < 0;
  };

  this.display = function() {
    var angle = this.velocity.heading() + PI / 2;

    push();
    translate(this.position.x, this.position.y);
    rotate(angle);

    if (debug.checked()) {
      strokeWeight(3);
      stroke(0, 255, 0);
      noFill();
      line(0, 0, 0, -this.dna[0] * 25);
      strokeWeight(2);
      ellipse(0, 0, this.dna[2] * 2);
      stroke(255, 0, 0);
      line(0, 0, 0, -this.dna[1] * 25);
      ellipse(0, 0, this.dna[3] * 2);
    }

    var gr = color(0, 255, 0);
    var rd = color(255, 0, 0);
    var col = lerpColor(rd, gr, this.health);

    fill(col);
    stroke(col);
    strokeWeight(1);
    
    
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    
    /*
    translate(42 / 2, 32 / 2);
    rotate(- PI / 2);
    imageMode(CENTER);
    image(vehicle_gif, 0, -this.r * 2, 42, 32);
    */

    pop();
  };

  this.boundaries = function() {
    var d = 25 + tile_size * 2;

    var desired = null;

    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  };
}
