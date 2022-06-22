"use strict";
const timeScale = 1000 / 30;
const canvas = document.querySelector('#can');
const ctx = canvas.getContext("2d");
let path = [
    { x: 100, y: 50 },
    { x: 300, y: 90 },
    { x: 500, y: 200 },
    { x: 600, y: 500 },
    { x: 800, y: 300 },
    { x: 900, y: 300 }
];
let turrets = [];
let enemies = [];
turrets.push(create_turret({ x: 100, y: 110 }, 'purple', 70, 10));
turrets.push(create_turret({ x: 500, y: 130 }, 'purple', 70, 10));
turrets.push(create_turret({ x: 610, y: 420 }, 'purple', 70, 10));
enemies.push(create_enemy(20, path, 'red', 3));
let main_loop = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_path(path, ctx);
    turrets.forEach(turret => {
        draw_turret(turret, ctx);
        if (turret.target == undefined || turret.target_away) {
            turret.target = find_nearest_enemy(turret, find_enemies_in_range(turret, enemies));
            turret.target_away = false;
        }
        if (turret.target != undefined) {
            if (vector_distance(turret.target.position, turret.position) > turret.range) {
                turret.target_away = true;
            }
            if (turret.target && !turret.target_away) {
                draw_laser(turret, turret.target, ctx);
                deal_damage(turret.target, turret.damage / timeScale);
                if (turret.target.healthPoints <= 0) {
                    turret.target = undefined;
                }
            }
        }
    });
    enemies.forEach(enemy => {
        if (enemy !== undefined) {
            move_to_target(enemy);
            draw_enemy(enemy, ctx);
            if (enemy.healthPoints < 0) {
                enemies.splice(enemies.indexOf(enemy), 1);
            }
        }
    });
}, timeScale);
function draw_enemy(e, c) {
    c.beginPath();
    c.arc(e.position.x, e.position.y, 12, 0, 2 * Math.PI);
    c.fillStyle = e.color;
    c.fill();
    c.closePath();
}
function create_enemy(health, p, color, speed) {
    let enemy = {
        healthPoints: health,
        color: color,
        position: p[0],
        speed: speed,
        path: p,
        target: p[1],
        toDestroy: false
    };
    return enemy;
}
function navigate(e) {
    return vector_normalize(vector_subtract(e.position, e.target));
}
function is_near_target(e) {
    return vector_length(vector_subtract(e.target, e.position)) <= e.speed / 2;
}
function move_in_direction(e, d) {
    e.position = vector_sum(e.position, vector_scale(d, e.speed));
}
function move_to_target(e) {
    if (is_near_target(e) && e.target == e.path[e.path.length - 1]) {
        e.toDestroy = true;
        return;
    }
    if (is_near_target(e)) {
        e.position = e.target;
        e.target = e.path[e.path.indexOf(e.target) + 1];
        return;
    }
    move_in_direction(e, vector_scale(navigate(e), -1));
}
function deal_damage(e, dmg) {
    e.healthPoints -= dmg;
}
function draw_path(p, c) {
    c.beginPath();
    let b = {
        x: path[0].x,
        y: path[0].y
    };
    let e = {
        x: path[path.length - 1].x,
        y: path[path.length - 1].y
    };
    c.strokeStyle = "black";
    c.lineWidth = 10;
    p.forEach(np => {
        c.lineTo(np.x, np.y);
    });
    c.stroke();
    c.closePath();
    c.fillStyle = "blue";
    c.fillRect(b.x - 10, b.y - 10, 20, 20);
    c.fillStyle = "green";
    c.fillRect(e.x - 10, e.y - 10, 20, 20);
}
function create_turret(position, color, range, damage) {
    return {
        position: position,
        color: color,
        range: range,
        damage: damage,
        target: undefined,
        target_away: true
    };
}
function draw_turret(t, c) {
    c.beginPath();
    c.arc(t.position.x, t.position.y, t.range, 0, 2 * Math.PI);
    c.fillStyle = "rgba(0,0,0,0.3)";
    c.fill();
    c.closePath();
    c.beginPath();
    c.arc(t.position.x, t.position.y, 20, 0, 2 * Math.PI);
    c.fillStyle = t.color;
    c.fill();
    c.closePath();
}
function find_enemies_in_range(t, e) {
    return e.filter(enemy => {
        if (enemy == undefined)
            return false;
        return (vector_distance(t.position, enemy.position) <= t.range);
    });
}
function find_nearest_enemy(t, e) {
    return e.sort((a, b) => (vector_distance(a.position, t.position) - vector_distance(b.position, t.position)))[0];
}
function draw_laser(t, e, c) {
    c.beginPath();
    c.strokeStyle = 'rgb(0, 150, 8)';
    c.lineWidth = 8;
    c.moveTo(t.position.x, t.position.y);
    c.lineTo(e.position.x, e.position.y);
    c.stroke();
    c.closePath();
    c.beginPath();
    c.strokeStyle = 'rgb(0, 200, 8)';
    c.lineWidth = 3;
    c.moveTo(t.position.x, t.position.y);
    c.lineTo(e.position.x, e.position.y);
    c.stroke();
    c.closePath();
}
function vector_sum(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
}
function vector_subtract(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
}
function vector_scale(v, s) {
    return {
        x: v.x * s,
        y: v.y * s
    };
}
function vector_length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}
function vector_normalize(v) {
    let l = vector_length(v);
    return {
        x: v.x / l,
        y: v.y / l
    };
}
function vector_distance(v1, v2) {
    return vector_length(vector_subtract(v1, v2));
}
