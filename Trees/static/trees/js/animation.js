var canvas = document.getElementById("canvas"), ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var stars = [], // Array that contains the stars
        FPS = 30, // Frames per second
        x = 40, // Number of stars
        mouse = {
        x: 0,
        y: 0
        };  // mouse location

    // Push stars to array

    for (var i = 0; i < x; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25
    });
    }

    // Draw the scene

    function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    
    for (var i = 0, x = stars.length; i < x; i++) {
        var s = stars[i];
    
        ctx.fillStyle = "rgba(17, 140, 255, 1)";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.stroke();
    }
    
    ctx.beginPath();
    for (var i = 0, x = stars.length; i < x; i++) {
        var starI = stars[i];
        ctx.moveTo(starI.x,starI.y); 
        if(distance(mouse, starI) < 200) ctx.lineTo(mouse.x, mouse.y);
        for (var j = 0, x = stars.length; j < x; j++) {
            var starII = stars[j];
            if(distance(starI, starII) < 200) {
                ctx.lineTo(starII.x,starII.y); 
            }
        }
    }
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = 'rgba(17, 140, 255, 1)';
    ctx.stroke();
    }

    function distance( point1, point2 ){
    var xs = 0;
    var ys = 0;
    
    xs = point2.x - point1.x;
    xs = xs * xs;
    
    ys = point2.y - point1.y;
    ys = ys * ys;
    
    return Math.sqrt( xs + ys );
    }

    // Update star locations

    function update() {
    for (var i = 0, x = stars.length; i < x; i++) {
        var s = stars[i];
    
        s.x += s.vx / FPS;
        s.y += s.vy / FPS;
        
        if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
        if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
    }
    }

    function tick() {
    draw();
    update();
    requestAnimationFrame(tick);
    }

    tick();