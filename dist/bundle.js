"use strict";
const tickSpeed = 1000 / 30;
const canvas = document.querySelector('#can');
const ctx = canvas.getContext("2d");
let path = [{ x: 100, y: 100 }, { x: 300, y: 140 }, { x: 500, y: 250 }, { x: 600, y: 550 }, { x: 800, y: 350 }, { x: 300, y: 350 }];
let enemies = [];
let turrets = [];
let turret_preview = {
    x: -150,
    y: -150,
};
// turrets.push(create_circular_turret({ x: 620, y: 430 }, "orange", 90, 15, 1000, 100))
// turrets.push(create_targeting_turret({ x: 590, y: 280 }, "gold", 90, 5, 200, 100))
let loop = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_path(path, ctx);
    turrets.forEach(t => {
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
        if (t.type == "circular") {
            let tc = t;
            ctx.beginPath();
            ctx.fillStyle = `rgba(250,120,120,0.9)`;
            ctx.arc(tc.position.x, tc.position.y, tc.burstRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            if (t.remaining_cooldown <= 0) {
                let t_ene = find_enemies_in_range(t, enemies);
                if (t_ene.length > 0) {
                    draw_burst(t);
                    t_ene.forEach(en => {
                        deal_damage(en, t.damage);
                    });
                    t.remaining_cooldown = t.max_cooldown;
                }
            }
            if (t.remaining_cooldown > 0)
                t.remaining_cooldown -= tickSpeed;
        }
        draw_turret(t, ctx);
    });
    enemies.forEach(e => {
        move_to_target(e);
        draw_enemy(e, ctx);
        if (e.healthPoints <= 0) {
            player.money += e.value * player.wave;
            enemies.splice(enemies.indexOf(e), 1);
        }
        if (vector_distance(e.position, e.path[e.path.length - 1]) < 10) {
            player.healthPoints -= e.damage;
            enemies.splice(enemies.indexOf(e), 1);
        }
    });
    if (selected_turret)
        render_turret_upgrade(selected_turret, ctx);
    else
        render_turret_placement_menu(ctx);
    render_top_bar(player, ctx);
    show_turret_preview(ctx, turret_preview);
    if (player.healthPoints <= 0) {
        clearInterval(loop);
        // show game over screen
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        // add onclick event to canvas to reload the page
        canvas.addEventListener("click", () => {
            location.reload();
        });
    }
}, tickSpeed);
let mode = "game";
let toPlace = "";
canvas.addEventListener('click', (e) => {
    let rect = canvas.getBoundingClientRect();
    let pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    // cursor in game
    if (pos.x >= 0 && pos.x <= 920 && pos.y >= 80 && pos.y <= 600 && mode == "game") {
        selected_turret = select_turret(e, turrets);
    }
    // cursor on upgrade button
    if (selected_turret != null) {
        if (pos.x >= 920 && pos.x <= 920 + 260 && pos.y >= 400 && pos.y <= 400 + 100) {
            UpgradeTurret(selected_turret, selected_turret.cost);
        }
    }
    if (selected_turret == null) {
        console.log(pos);
        if (pos.x >= 920 && pos.x <= 920 + 260) {
            if (pos.y >= 100 && pos.y <= 200 && player.money >= 250) {
                toPlace = "circular";
                mode = "placement";
                console.log("placing turret");
            }
            if (pos.y >= 220 && pos.y <= 360 && player.money >= 100) {
                toPlace = "targeting";
                mode = "placement";
                console.log("placing turret");
            }
            if (pos.y >= 340 && pos.y <= 440) {
                toPlace = "";
                mode = "game";
                console.log("canceled");
            }
        }
    }
    if (mode == "placement") {
        if (pos.x >= 0 && pos.x <= 920 && pos.y >= 80 && pos.y <= 600) {
            if (toPlace == "circular") {
                turrets.push(create_circular_turret(pos, "orange", 90, 15, 1000, 100));
                player.money -= 250;
            }
            if (toPlace == "targeting") {
                turrets.push(create_targeting_turret(pos, "gold", 90, 5, 200, 100));
                player.money -= 100;
            }
            turret_preview = { x: -150, y: -150 };
            mode = "game";
        }
    }
    if (pos.y >= 460 && pos.y <= 560 && pos.x >= 920 && pos.x <= 920 + 260) {
        if (enemies.length == 0) {
            toPlace = "";
            mode = "game";
            console.log("started");
            player.wave += 1;
            create_enemies_over_time(create_enemy(5 * player.wave * Math.log2(player.wave) + 1, 10 * Math.sqrt(player.wave) / 2, path, "red", Math.abs(2 * player.wave - 3), 5), enemies, 10, 400);
        }
    }
});
canvas.addEventListener('mousemove', (e) => {
    let rect = canvas.getBoundingClientRect();
    let pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (mode == "placement") {
        if (pos.x >= 0 && pos.x <= 920 && pos.y >= 80 && pos.y <= 600) {
            turret_preview = pos;
        }
        else
            turret_preview = { x: -150, y: -150 };
    }
});
function create_circular_turret(position, color, range, damage, cooldown, cost) {
    let temp = create_turret(position, color, range, damage, cooldown, 'circular', cost);
    temp.burstRadius = 0;
    return temp;
}
function draw_burst(t) {
    setTimeout(() => {
        t.burstRadius = t.range * 3 / 4;
    }, 50);
    setTimeout(() => {
        t.burstRadius = t.range;
    }, 100);
    setTimeout(() => {
        t.burstRadius = 0;
    }, 200);
}
function create_enemies_over_time(enemyTemplate, enemyArray, count, timeout) {
    let i = 0;
    let timer = setInterval(() => {
        if (i == count - 1) {
            clearInterval(timer);
        }
        enemyArray.push(create_enemy(enemyTemplate.healthPoints, enemyTemplate.damage, enemyTemplate.path, enemyTemplate.color, enemyTemplate.speed, enemyTemplate.value));
        i++;
    }, timeout);
}
function draw_enemy(e, c) {
    c.beginPath();
    c.fillStyle = "blue";
    c.arc(e.position.x, e.position.y, 10, 0, 2 * Math.PI);
    c.fill();
    c.closePath();
    c.beginPath();
    c.lineWidth = 1;
    // let tip: Vector2D = vector_scale(vector_normalize(vector_subtract(e.position, e.target)),15)
    c.arc(e.position.x, e.position.y, 10, 0, 2 * Math.PI * e.healthPoints / e.maxHealthPoints);
    // c.moveTo(e.position.x,e.position.y);
    // c.lineTo(e.position.x + tip.x, e.position.y + tip.y)
    c.lineTo(e.position.x, e.position.y);
    c.fillStyle = "red";
    c.fill();
    c.strokeStyle = "red";
    c.stroke();
    c.closePath();
    c.beginPath();
    c.arc(e.position.x, e.position.y, 10, 0, 2 * Math.PI);
    c.strokeStyle = "red";
    c.stroke();
    c.closePath();
}
function create_enemy(health, damage, p, color, speed, value) {
    let enemy = {
        healthPoints: health,
        maxHealthPoints: health,
        color: color,
        position: p[0],
        speed: speed,
        path: p,
        target: p[1],
        toDestroy: false,
        damage: damage,
        value: value
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
function create_targeting_turret(position, color, range, damage, cooldown, cost) {
    let temp = create_turret(position, color, range, damage, cooldown, "targeting", cost);
    temp.target = null;
    return temp;
}
function TargetingTurret_attack(t, c) {
    if (t.target != null) {
        draw_laser(t, c);
        deal_damage(t.target, t.damage);
    }
}
function create_turret(position, color, range, damage, cooldown, type, cost) {
    return {
        position: position,
        color: color,
        range: range,
        damage: damage,
        type: type,
        max_cooldown: cooldown,
        remaining_cooldown: cooldown,
        selected: false,
        cost: cost,
        level: 1
    };
}
function draw_turret(t, c) {
    if (t.selected) {
        c.beginPath();
        c.arc(t.position.x, t.position.y, t.range, 0, 2 * Math.PI);
        // c.fillStyle = "rgba(0,0,0,0.3)"
        c.lineWidth = 3;
        c.strokeStyle = "rgba(0,0,0,0.3)";
        c.stroke();
        c.closePath();
    }
    c.beginPath();
    c.arc(t.position.x, t.position.y, 20, 0, 2 * Math.PI);
    c.fillStyle = t.color;
    c.fill();
    c.closePath();
    c.fillStyle = "black";
    c.fillText(t.type.charAt(0), t.position.x - 12, t.position.y + 13);
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
const player = {
    wave: 0,
    healthPoints: 100,
    money: 250
};
let selected_turret = null;
function render_top_bar(p, c) {
    c.fillStyle = "#884000";
    c.fillRect(0, 0, canvas.width, 80);
    c.fillStyle = "#ffffff";
    c.font = "50px Arial";
    c.fillText("Wave: " + p.wave, 10, 60);
    c.fillText("Health: " + Math.round(p.healthPoints), 450, 60);
    c.fillText("Money: " + Math.round(p.money) + "$", 860, 60);
}
function render_turret_upgrade(turret, c) {
    c.fillStyle = "#845600";
    c.fillRect(900, 0, canvas.width, canvas.height);
    c.fillStyle = "#ffffff";
    c.font = "30px Arial";
    c.fillText(`${turret.type} Turret :`.toLowerCase(), 920, 130);
    c.fillText(`level: ${turret.level} > ${turret.level + 1}`.toLowerCase(), 920, 170);
    c.fillText(`Damage: ${Math.round(turret.damage * 10) / 10} > ${Math.round(turret.damage * 1.3 * 10) / 10}`.toLowerCase(), 920, 210);
    c.fillText(`Range: ${Math.round(turret.range * 10) / 10} > ${Math.round(turret.range * 1.1 * 10) / 10}`.toLowerCase(), 920, 250);
    c.fillText(`Cooldown: ${Math.round(turret.max_cooldown / 1000 * 10) / 10} > ${Math.round((turret.max_cooldown / 1000) * 0.95 * 100) / 100}`.toLowerCase(), 920, 290);
    c.fillText(`Cost: ${Math.round(turret.cost * 10) / 10} $`.toLowerCase(), 920, 330);
    c.fillStyle = (player.money >= 100) ? "gold" : "darkgray";
    c.fillRect(920, 400, 260, 100);
    c.fillStyle = (player.money >= 100) ? "orange" : "gray";
    c.font = "60px Arial";
    c.fillText(`Upgrade`.toLowerCase(), 935, 470);
}
function render_turret_placement_menu(c) {
    c.fillStyle = "#845600";
    c.fillRect(900, 0, canvas.width, canvas.height);
    c.fillStyle = "#ffffff";
    c.font = "30px Arial";
    c.fillStyle = (player.money >= 250) ? "yellow" : "gray";
    c.fillRect(920, 100, 260, 100);
    c.fillStyle = "rgba(250,120,120,0.9)";
    c.font = "60px Arial";
    c.fillText(`circular`, 940, 170);
    c.fillStyle = (player.money >= 100) ? "yellow" : "gray";
    c.fillRect(920, 220, 260, 100);
    c.fillStyle = "rgba(250,120,120,0.9)";
    c.font = "60px Arial";
    c.fillText(`targeting`, 940, 290);
    c.fillStyle = "red";
    c.fillRect(920, 340, 260, 100);
    c.fillStyle = "white";
    c.font = "60px Arial";
    c.fillText(`cancel`, 940, 410);
    c.fillStyle = "lightgreen";
    c.fillRect(920, 460, 260, 100);
    c.fillStyle = "white";
    c.font = "60px Arial";
    c.fillText(`next`, 940, 530);
}
function select_turret(e, tur) {
    let rect = canvas.getBoundingClientRect();
    let pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    let y = turrets.sort((a, b) => vector_distance(pos, a.position) - vector_distance(pos, b.position))[0];
    if (vector_distance(pos, y.position) > 20) {
        y = null;
    }
    tur.forEach(t => t.selected = false);
    if (y != null)
        y.selected = true;
    return y;
}
function UpgradeTurret(t, cost) {
    if (player.money >= cost) {
        player.money -= cost;
        t.damage *= 1.3;
        t.max_cooldown *= 0.95;
        t.remaining_cooldown = t.max_cooldown;
        t.range *= 1.1;
        t.level++;
        t.cost = Math.round(t.cost * 1.3);
    }
}
function show_turret_preview(c, pos) {
    c.beginPath();
    c.fillStyle = "rgba(180,180,180,0.9)";
    c.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    c.fill();
    c.closePath();
    c.beginPath();
    c.arc(pos.x, pos.y, 90, 0, 2 * Math.PI);
    // c.fillStyle = "rgba(0,0,0,0.3)"
    c.lineWidth = 3;
    c.strokeStyle = "rgba(0,0,0,0.3)";
    c.stroke();
    c.closePath();
}
function evaluateA(v1, v2) {
    return (v2.y - v1.y) / (v1.x - v1.x);
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
