var vehicles = [];
var food = [];
var poison = [];
var debug;
var tile_size = 32;
var tile_size_x = 46, tile_size_y = 26;
var size_x = tile_size * tile_size_x, size_y = tile_size * tile_size_y;
// var maximum_greenradius = 0;

let tileset;

let spritesheet;
let spritedata;
let animation = [];


function Level_Generator(tile_size_x, tile_size_y)
{
    var arr = new Array(tile_size_x* tile_size_y);
    for (let i = 0; i < tile_size_x * tile_size_y; i++)
        arr[i] = 0;
    for (let i = 0; i < tile_size_x; i++)
    {
        arr[i] = 1;
        arr[tile_size_x * (tile_size_y - 1) + i] = 2;
    }
    for (let i = 0; i < tile_size_y; i++)
    {
        arr[tile_size_x * i] = 3;
        arr[tile_size_x * i + tile_size_x - 1] = 4;
    }
    arr[0] = 5;
    arr[tile_size_x - 1] = 6;
    arr[tile_size_x * (tile_size_y - 1)] = 7;
    arr[tile_size_x * tile_size_y - 1] = 8;
    return arr;
}

let map = Level_Generator(tile_size_x, tile_size_y); // Создание карты из тайлов

function drawTiles(map, d_cols, s_cols, tile_size) {
  for (let i = map.length - 1; i > -1; --i) {
      let value = map[i];
      // source x , y
      let sx = (value % s_cols) * tile_size;
      let sy = Math.floor(value / s_cols) * tile_size;
      // distenation x , y
      let dx = (i % d_cols) * tile_size;
      let dy = Math.floor(i / d_cols) * tile_size;
      // render image
      image(tileset, dx, dy, tile_size, tile_size, sx, sy, tile_size, tile_size);
  }
}

/*
let map = new Array(tile_size_x * tile_size_y);

for (let i = 0; i < tile_size_x * tile_size_y; i++) {
  map[i] = 0;
}
*/


function preload() {
  tileset = loadImage("./tileset_kingsandpigs_bigger.png");
  poison_img = loadImage("./chocolate.png");
  food_img = loadImage("./carrot.png");
  // vehicle_img = loadImage("./walking_dude.png");
  vehicle_gif = loadImage("./walking_dude.gif");

  spritedata = loadJSON("./walking_dude.json");
  spritesheet = loadImage("./walking_dude.png");
}


function setup() {
  createCanvas(size_x, size_y);
  for (var i = 0; i < 50; i++) {
    var x = random(width - tile_size);
    var y = random(height - tile_size);
    vehicles[i] = new Vehicle(x, y);
  }

  for (var i = 0; i < 40; i++) {
    var x = random(width - 2 * tile_size);
    var y = random(height - 2 * tile_size);
    food.push(createVector(x, y));
  }

  for (var i = 0; i < 20; i++) {
    var x = random(width - 2 * tile_size);
    var y = random(height - 2 * tile_size);
    poison.push(createVector(x, y));
  }

  debug = createCheckbox();

  bar_graph = createButton("Скачать данные");
  bar_graph.mousePressed(save_content_to_file("Hello", "C:\\test"));
}


function mouseDragged() {
  vehicles.push(new Vehicle(mouseX, mouseY));
}

function draw() {
  background(51);
  // drawTiles(map, tile_size_x, 1, tile_size);
  drawTiles(map, tile_size_x, tile_size_y, tile_size);

  //let h5 = createElement('h5', str(5));
  //h5.style('color', '#00a1d3');
  //h5.position(100, size_y + 50);

  if (random(1) < 0.1) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }

  if (random(1) < 0.01) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }

  for (var i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    // ellipse(food[i].x, food[i].y, 4, 4);
    image(food_img, food[i].x - 8, food[i].y - 8, 16, 16);
  }

  for (var i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    // ellipse(poison[i].x, poison[i].y, 4, 4);
    image(poison_img, poison[i].x - 8, poison[i].y - 8, 16, 16);
  }

  for (var i = vehicles.length - 1; i >= 0; i--) {
    vehicles[i].boundaries();
    vehicles[i].behaviors(food, poison);
    vehicles[i].update();
    vehicles[i].display();

    var newVehicle = vehicles[i].clone();
    if (newVehicle != null) {
      vehicles.push(newVehicle);
    }

    if (vehicles[i].dead()) {
      var x = vehicles[i].position.x;
      var y = vehicles[i].position.y;
      food.push(createVector(x, y));
      vehicles.splice(i, 1);
    }
  }
}