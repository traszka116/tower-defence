"use strict";
const tickSpeed = 1000 / 30;
const canvas = document.querySelector('#can');
const ctx = canvas.getContext("2d");
const player = {
    wave: 1,
    healthPoints: 100,
    money: 0
};
let path = [
    { x: 100, y: 100 },
    { x: 300, y: 140 },
    { x: 500, y: 250 },
    { x: 600, y: 550 },
    { x: 800, y: 350 },
    { x: 900, y: 350 }
];
// let turrets: Turret[] = []
// let enemies: (Enemy | undefined)[] = []
// 
// let enemy: Enemy = create_enemy(10,5,path,"orange",50)
// let targeting_turret : TargetingTurret = create_targeting_turret({x:110,y:50},"blue",90,10)
// draw_turret(targeting_turret,ctx)
// lock_on_target(targeting_turret,[enemy])
// TargetingTurret_attack(targeting_turret,ctx)
let enemies = [];
create_enemies_over_time(create_enemy(10, 5, path, "red", 2), enemies, 10, 400);
let turrets = [];
turrets.push(create_targeting_turret({ x: 620, y: 470 }, "blue", 90, 10));
let loop = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_path(path, ctx);
    turrets.forEach(t => {
        draw_turret(t, ctx);
        if (t.type == "targeting") {
            const tt = t;
            if (tt.target != undefined && tt.target?.healthPoints <= 0)
                tt.target = null;
            if (tt.target == null || is_target_to_far(tt))
                lock_on_target(tt, enemies);
            if (tt.target != null)
                draw_laser(tt, ctx);
            if (t.remaining_cooldown <= 0) {
                if (tt.target != null) {
                    deal_damage(tt.target, tt.damage);
                    t.remaining_cooldown = t.max_cooldown;
                }
            }
            if (t.remaining_cooldown > 0)
                t.remaining_cooldown -= tickSpeed;
        }
    });
    enemies.forEach(e => {
        move_to_target(e);
        draw_enemy(e, ctx);
        if (e.healthPoints <= 0)
            enemies.splice(enemies.indexOf(e), 1);
    });
}, tickSpeed);
// let main_loop: NodeJS.Timer = setInterval(() => {
//     ctx.clearRect(0, 0, canvas.width, canvas.height)
// }, timeScale)
function create_enemies_over_time(enemyTemplate, enemyArray, count, timeout) {
    let i = 0;
    let timer = setInterval(() => {
        if (i == count - 1) {
            clearInterval(timer);
        }
        enemyArray.push(create_enemy(enemyTemplate.healthPoints, enemyTemplate.damage, enemyTemplate.path, enemyTemplate.color, enemyTemplate.speed));
        i++;
    }, timeout);
}
function draw_enemy(e, c) {
    c.beginPath();
    c.arc(e.position.x, e.position.y, 12, 0, 2 * Math.PI);
    c.fillStyle = e.color;
    c.fill();
    c.closePath();
}
function create_enemy(health, damage, p, color, speed) {
    let enemy = {
        healthPoints: health,
        color: color,
        position: p[0],
        speed: speed,
        path: p,
        target: p[1],
        toDestroy: false,
        damage: damage
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
function draw_laser(t, c) {
    if (t.target != undefined && t.target != null) {
        let e = t.target;
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
}
function find_nearest_enemy(t, e) {
    return e.sort((a, b) => (vector_distance(a.position, t.position) - vector_distance(b.position, t.position)))[0];
}
function is_target_to_far(t) {
    if (t.target == null) {
        return false;
    }
    return vector_distance(t.target.position, t.position) > t.range;
}
function lock_on_target(t, e) {
    let nearest_in_range = find_nearest_enemy(t, find_enemies_in_range(t, e));
    if (nearest_in_range != undefined) {
        t.target = nearest_in_range;
        return;
    }
    t.target = null;
}
function create_targeting_turret(position, color, range, damage) {
    return {
        position: position,
        color: color,
        range: range,
        damage: damage,
        target: null,
        type: "targeting",
        max_cooldown: 1000,
        remaining_cooldown: 1000
    };
}
function TargetingTurret_attack(t, c) {
    if (t.target != null) {
        draw_laser(t, c);
        deal_damage(t.target, t.damage);
    }
}
function create_turret(position, color, range, damage, cooldown, type) {
    return {
        position: position,
        color: color,
        range: range,
        damage: damage,
        type: type,
        max_cooldown: cooldown,
        remaining_cooldown: cooldown
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
function deal_damage(e, dmg) {
    e.healthPoints -= dmg;
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
